import mongoose from 'mongoose';
import { config } from 'dotenv';

beforeAll(async () => {
  config({ path: '.env.local' });
  const uri = process.env.ATLAS_TEST_URI;
  if (!uri) {
    throw new Error('ATLAS_TEST_URI found in environment variables');
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB Atlas test database');
  } catch (error) {
    console.error('❌ MongoDB connection error:', (error as Error).message);
    throw error;
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  console.log('✅ Disconnected from MongoDB');
});
