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

// 2️⃣ Trust proxy for Vercel
app.set('trust proxy', 1);

// 3️⃣ CORS - Allow all origins
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true
}));

// Handle OPTIONS preflight
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// 4️⃣ Health check - works without DB
app.get('/', (req, res) => {
  res.json({
    status: 'API WORKING',
    timestamp: new Date().toISOString(),
    mongodb: process.env.MONGODB_URI ? 'configured' : 'NOT CONFIGURED'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    env: {
      mongodb: !!process.env.MONGODB_URI,
      jwt: !!process.env.JWT_SECRET,
      cloudinary: !!process.env.CLOUDINARY_NAME,
      razorpay: !!process.env.RAZORPAY_KEY_ID,
      stripe: !!process.env.STRIPE_SECRET_KEY
    }
  });
});

// 5️⃣ Stripe webhooks (RAW body - must be BEFORE json parser)
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// 6️⃣ JSON parser for API routes
app.use(express.json());

// 7️⃣ API Routes
app.use('/api/auth', authRouter);
app.use('/api/educator', educatorRouter);
app.use('/api/course', courseRouter);
app.use('/api/user', userRouter);
app.use('/api/admin', adminRouter);

// 8️⃣ 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// 9️⃣ Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// 🔟 Connect to services
const initServices = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await connectDB();
      console.log('MongoDB connected');
    } else {
      console.warn('WARNING: MONGODB_URI not set');
    }

    if (process.env.CLOUDINARY_NAME) {
      await connectCloudinary();
      console.log('Cloudinary connected');
    } else {
      console.warn('WARNING: CLOUDINARY_NAME not set');
    }
  } catch (error) {
    console.error('Service connection error:', error.message);
  }
};

// Initialize services
initServices();

// Local development server
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export for Vercel serverless
export default app;
