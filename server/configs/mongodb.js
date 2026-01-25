// import mongoose from "mongoose";

// //connect to the mongodb database
// const connectDB = async ()=>{
//     mongoose.connection.on('connected', ()=> console.log('Database Connected'))

//     await mongoose.connect(`${process.env.MONGODB_URI}/lms`)
// }
// export default connectDB

import mongoose from "mongoose";

// Get the URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

// 1. Use a global variable to cache the connection
// This prevents creating multiple connections in a serverless environment
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    // 2. If a connection already exists, return it immediately
    if (cached.conn) {
        return cached.conn;
    }

    // 3. If no connection exists, create a new one
    if (!cached.promise) {
        const opts = {
            bufferCommands: false, // 4. Fail fast if no connection (don't wait 10s)
        };

        // Note: We append "/lms" to ensuring we connect to the correct DB, 
        // or ensure your ENV variable includes the database name.
        cached.promise = mongoose.connect(`${MONGODB_URI}/lms`, opts).then((mongoose) => {
            console.log('✅ New MongoDB Connection Established');
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default connectDB;