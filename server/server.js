import express from 'express'
import cors from 'cors'
import 'dotenv/config';
import connectDB from './configs/mongodb.js'
import { stripeWebhooks } from './controllers/webhooks.js'
import educatorRouter from './routes/educatorRoutes.js'
import connectCloudinary from './configs/cloudinary.js';
import courseRouter from './routes/courseRoutes.js';
import userRouter from './routes/userRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import authRouter from './routes/authRoutes.js';


//initialise Express
const app = express();

//connect to databse
await connectDB();
await connectCloudinary()

//middleware 
app.use(
  cors({
    origin: "https://lms-rfontend.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
// app.use(cors())
app.options("*", cors());

//routes 

app.get('/', (req, res) => res.send("API WORKING"))
app.use('/api/auth', express.json(), authRouter)
app.use('/api/educator', express.json(), educatorRouter)
app.use('/api/course', express.json(), courseRouter)
app.use('/api/user', express.json(), userRouter)
app.use('/api/admin', express.json(), adminRouter)

// Stripe webhook routes (alias for compatibility)
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks)
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhooks)


//PORT
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})