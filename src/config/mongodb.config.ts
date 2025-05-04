import { ConnectOptions } from 'mongoose';

interface MongoConfig {
  uri: string;
  dbName: string;
  options: ConnectOptions;
}

const config: MongoConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
  dbName: process.env.MONGODB_DB_NAME || 'dailyharvest',
  options: {
    bufferCommands: true,
    autoIndex: true,
    maxPoolSize: process.env.MONGODB_MAX_POOL_SIZE ? parseInt(process.env.MONGODB_MAX_POOL_SIZE) : 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
    retryWrites: true,
  }
};

export default config;