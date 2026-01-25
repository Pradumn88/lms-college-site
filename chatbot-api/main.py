# chatbot-api/main.py
from __future__ import annotations

import json
import os
from collections import defaultdict, deque
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# --- env ---
load_dotenv()  # reads .env if present

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
MAX_TURNS = int(os.getenv("MAX_TURNS", "16"))

# --- app ---
app = FastAPI(title="Sanity Check", version="2.0.0")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://your-lms-frontend.vercel.app",  # replace on deploy
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- data ---
ROOT = Path(__file__).parent
FAQ_PATH = ROOT / "faq.json"

def load_faqs() -> List[Dict[str, Any]]:
    if not FAQ_PATH.exists():
        return []
    try:
        return json.loads(FAQ_PATH.read_text(encoding="utf-8"))
    except Exception:
        return []

FAQS = load_faqs()

# --- in-memory session history ---
# stores a deque of turns: {"role": "user"|"assistant", "content": str}
SESSIONS: Dict[str, deque] = defaultdict(lambda: deque(maxlen=MAX_TURNS))

# --- schemas ---
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    in_domain: bool
    bucket: Optional[str] = None
    answer: str
    meta: Dict[str, Any] = Field(default_factory=dict)

# --- utils: simple retrieval over FAQ (no extra deps) ---
STOP = {
    "a", "an", "the", "in", "on", "at", "to", "from", "for", "and", "or",
    "of", "is", "are", "was", "were", "be", "with", "as", "by", "it", "this",
    "that", "these", "those", "i", "you", "we", "they", "me", "my", "your",
    "our", "their", "do", "does", "did", "can", "how", "what", "where", "when", "why"
}

def tokenize(s: str) -> List[str]:
    return [w for w in "".join(c.lower() if c.isalnum() else " " for c in s).split() if w and w not in STOP]

def score_faq(query: str, faq: Dict[str, Any]) -> float:
    """Overlap score using unique keywords from question + q + tags."""
    q_tokens = set(tokenize(query))
    if not q_tokens:
        return 0.0
    cand_text = " ".join([faq.get("q", ""), " ".join(faq.get("tags", []))])
    f_tokens = set(tokenize(cand_text))
    if not f_tokens:
        return 0.0
    inter = len(q_tokens & f_tokens)
    union = len(q_tokens | f_tokens)
    return inter / union

def top_faqs(query: str, k: int = 3) -> List[Tuple[Dict[str, Any], float]]:
    pairs = [(faq, score_faq(query, faq)) for faq in FAQS]
    pairs.sort(key=lambda x: x[1], reverse=True)
    return pairs[:k]

# --- LLM (optional) ---
def call_llm(question: str, faqs_ctx: List[Dict[str, Any]], history: List[Dict[str, str]]) -> Optional[str]:
    """Return an LLM-generated answer or None if unavailable/fails."""
    if not OPENAI_API_KEY:
        return None
    try:
        # OpenAI SDK v1
        from openai import OpenAI
        client = OpenAI(api_key=OPENAI_API_KEY)

        # Construct a brief context out of top FAQs
        kb_lines = []
        for item in faqs_ctx:
            kb_lines.append(f"Q: {item.get('q')}\nA: {item.get('a')}")
        kb_text = "\n\n".join(kb_lines) if kb_lines else "No FAQ context."

        sys = (
            "You are an LMS assistant. Answer only LMS-related questions (courses, enrollments, "
            "assignments, deadlines, payments/Stripe, player/lessons, instructor contact). "
            "Prefer concrete, concise steps based on the provided FAQ context. If the question is "
            "out of scope, politely refuse and steer back to LMS topics."
        )

        # Build messages: system + trimmed history + user
        msgs: List[Dict[str, str]] = [{"role": "system", "content": sys}]
        # include up to last 6 turns to control cost
        for turn in history[-6:]:
            msgs.append({"role": turn["role"], "content": turn["content"]})
        # add the current question with context
        user_prompt = (
            f"FAQ context:\n{kb_text}\n\n"
            f"User question: {question}\n\n"
            "Answer clearly. If multiple possibilities, list 2–3 concise options."
        )
        msgs.append({"role": "user", "content": user_prompt})

        # responses API (chat.completions or responses; using chat for compatibility)
        resp = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=msgs,
            temperature=0.2,
        )
        return resp.choices[0].message.content.strip()
    except Exception as e:
        print("LLM error:", e)
        return None

# --- routes ---
@app.get("/healthz")
def health():
    return {"ok": True, "faq_items": len(FAQS)}

@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")

@app.post("/reload_faq")
def reload_faq():
    """Hot reload the faq.json without restarting the server."""
    global FAQS
    FAQS = load_faqs()
    return {"ok": True, "faq_items": len(FAQS)}

@app.post("/reset_session")
def reset_session(session_id: str):
    SESSIONS.pop(session_id, None)
    return {"ok": True, "session_id": session_id}

@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    sid = req.session_id or "anon"
    text = (req.message or "").strip()
    if not text:
        return ChatResponse(in_domain=False, bucket="empty", answer="Please type a question.", meta={"session_id": sid})

    # append user turn to history
    SESSIONS[sid].append({"role": "user", "content": text})

    # 1) retrieve from FAQ
    top = top_faqs(text, k=3)
    best_score = top[0][1] if top else 0.0
    best = top[0][0] if top else None

    # simple domain decision: if we found any overlap OR the model can try
    in_domain = best_score >= 0.15

    # if a strong FAQ match, use it immediately
    if best and best_score >= 0.38:
        answer = best.get("a", "Here’s what I found.")
        bucket = "faq"
    else:
        # 2) otherwise, try LLM with top-3 FAQs as context (if API key set)
        llm_answer = call_llm(text, [p[0] for p in top], list(SESSIONS[sid]))
        if llm_answer:
            answer = llm_answer
            bucket = "llm"
            in_domain = True  # we guided it to LMS
        else:
            # 3) fallbacks
            if best and best_score >= 0.2:
                answer = best.get("a", "Here’s what I found.")
                bucket = "faq"
                in_domain = True
            else:
                answer = "I can help with LMS questions (courses, enrollments, assignments, deadlines, payments, player)."
                bucket = "out_of_scope"
                in_domain = False

    # append assistant turn
    SESSIONS[sid].append({"role": "assistant", "content": answer})

    return ChatResponse(
        in_domain=in_domain,
        bucket=bucket,
        answer=answer,
        meta={
            "session_id": sid,
            "faq_top": [{"q": f[0].get("q"), "score": round(f[1], 3)} for f in top],
        },
    )
