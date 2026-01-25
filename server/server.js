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

// 2️⃣ CORS Configuration - Allow both local and deployed frontends
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://lms-rfontend.vercel.app',
  'https://lms-frontend.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // In development, allow all. Change to callback(new Error('...')) in strict production
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

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
