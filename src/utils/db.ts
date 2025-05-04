import mongoose, { Mongoose } from 'mongoose';
import config from '../config/mongodb.config';

declare global {
  var mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
    testUri?: string;
  };
}

// Don't validate URI in test environment
if (!config.uri && process.env.NODE_ENV !== 'test') {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

if (!config.dbName && process.env.NODE_ENV !== 'test') {
  throw new Error('Please define the MONGODB_DB_NAME environment variable inside .env.local');
}

const cached = global.mongoose || { conn: null, promise: null };
global.mongoose = cached;

async function dbConnect(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      dbName: process.env.NODE_ENV === 'test' ? 'test' : config.dbName,
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 30000,
    };

    try {
      // For test environment, use the testUri from the global object
      const uri = process.env.NODE_ENV === 'test' ? 
        (global.mongoose?.testUri || cached.testUri) : 
        config.uri;

      if (!uri) {
        throw new Error('MongoDB URI not configured');
      }

      cached.promise = mongoose.connect(uri, opts);
    } catch (error) {
      cached.promise = null;
      throw error;
    }
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default dbConnect;