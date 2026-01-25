import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hi! 👋 I\'m your LMS assistant. How can I help you today?' }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).slice(2)}`)
    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)

    const CHATBOT_API = import.meta.env.VITE_CHATBOT_API || 'http://localhost:8000'

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen])

    const sendMessage = async (e) => {
        e?.preventDefault()
        const text = input.trim()
        if (!text || loading) return

        setMessages(prev => [...prev, { role: 'user', content: text }])
        setInput('')
        setLoading(true)

        try {
            const { data } = await axios.post(`${CHATBOT_API}/chat`, {
                message: text,
                session_id: sessionId
            })
            setMessages(prev => [...prev, { role: 'assistant', content: data.answer }])
        } catch (error) {
            console.error('Chat error:', error)
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I\'m having trouble connecting. Please make sure the chatbot server is running.'
            }])
        } finally {
            setLoading(false)
        }
    }

    const quickActions = [
        { label: '📚 Enroll in course', text: 'How do I enroll in a course?' },
        { label: '💳 Payment help', text: 'How are payments handled?' },
        { label: '🎬 Watch lessons', text: 'Where can I watch lessons?' },
    ]

    return (
        <>
            {/* Chat Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-lg hover:shadow-xl hover:shadow-purple-500/30 transition-all z-50 flex items-center justify-center text-white text-2xl"
                title="Chat with AI Assistant"
            >
                {isOpen ? '✕' : '💬'}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-gray-200">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
                            🤖
                        </div>
                        <div>
                            <h3 className="text-white font-semibold">LMS Assistant</h3>
                            <p className="text-white/70 text-xs">Powered by AI</p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${msg.role === 'user'
                                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-br-none'
                                            : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white text-gray-500 px-4 py-2 rounded-2xl rounded-bl-none shadow-sm border border-gray-100">
                                    <span className="flex gap-1">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions */}
                    {messages.length <= 2 && (
                        <div className="px-4 py-2 border-t border-gray-100 bg-white">
                            <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
                            <div className="flex flex-wrap gap-2">
                                {quickActions.map((action, index) => (
                                    <button
                                        key={index}
                                        onClick={() => { setInput(action.text); inputRef.current?.focus() }}
                                        className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-purple-100 text-gray-700 hover:text-purple-700 rounded-full transition-colors"
                                    >
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <form onSubmit={sendMessage} className="p-3 border-t border-gray-100 bg-white">
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your question..."
                                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 text-sm"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
                            >
                                ➤
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    )
}

export default ChatWidget
