import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  // Set the test URI in the global mongoose object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).mongoose = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(global as any).mongoose,
    testUri: mongoUri,
    conn: null,
    promise: null
  };
  Object.defineProperty(process.env, 'NODE_ENV', { value: 'test' });
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  if (!mongoose.connection.db) {
    throw new Error('Database not connected');
  }
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});