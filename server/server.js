import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import connectDB from './configs/mongodb.js';
import connectCloudinary from './configs/cloudinary.js';

import { stripeWebhooks } from './controllers/webhooks.js';
import educatorRouter from './routes/educatorRoutes.js';
import courseRouter from './routes/courseRoutes.js';
import userRouter from './routes/userRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import authRouter from './routes/authRoutes.js';

// 1️⃣ Initialize app
const app = express();

// 2️⃣ Middleware FIRST
app.use(
  cors({
    origin: "https://lms-rfontend.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
app.options("*", cors());

// 3️⃣ Routes
app.get('/', (req, res) => res.send("API WORKING"));

// Stripe webhooks (RAW body must be BEFORE json for these routes)
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);
app.use('/api/auth', express.json(), authRouter);
app.use('/api/educator', express.json(), educatorRouter);
app.use('/api/course', express.json(), courseRouter);
app.use('/api/user', express.json(), userRouter);
app.use('/api/admin', express.json(), adminRouter);


// 4️⃣ Start server ONLY ONCE
const startServer = async () => {
  try {
    await connectDB();
    await connectCloudinary();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Server failed to start:", error);
  }
};

startServer();
