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

// 2️⃣ CORS Configuration - Allow all origins for now (Vercel handles CORS via headers)
app.use(cors({
  origin: true, // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Handle OPTIONS requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// 3️⃣ Routes
app.get('/', (req, res) => res.send("API WORKING"));

// Stripe webhooks (RAW body must be BEFORE json for these routes)
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// JSON routes
app.use('/api/auth', express.json(), authRouter);
app.use('/api/educator', express.json(), educatorRouter);
app.use('/api/course', express.json(), courseRouter);
app.use('/api/user', express.json(), userRouter);
app.use('/api/admin', express.json(), adminRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
});

// 4️⃣ Connect to DB and start server
let isConnected = false;

const connectServices = async () => {
  if (!isConnected) {
    try {
      await connectDB();
      await connectCloudinary();
      isConnected = true;
      console.log('Connected to MongoDB and Cloudinary');
    } catch (error) {
      console.error('Failed to connect:', error);
      throw error;
    }
  }
};

// For Vercel serverless
connectServices().catch(console.error);

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel
export default app;
