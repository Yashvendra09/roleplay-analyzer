// services/db.js
// MongoDB connection helper for Next.js (App Router) using Mongoose.

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// Basic safety check so misconfig fails fast in dev/prod
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not set. Add it to .env.local');
}
let cached = global._mongoose;

if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

/**
 * connectDB
 * - Reuses existing connection if available.
 * - Creates a new connection once per server runtime.
 */
async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        maxPoolSize: 10,
      })
      .then((mongooseInstance) => mongooseInstance)
      .catch((err) => {
        console.error('MongoDB connection error:', err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
