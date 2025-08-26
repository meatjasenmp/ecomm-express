import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

process.env.NODE_ENV = 'test';
process.env.ATLAS_URI = process.env.ATLAS_TEST_URI;

if (process.env.ATLAS_URI?.includes('ecomm?')) {
  throw new Error('Tests must not use production database!');
}

process.env.PORT = '0';
process.env.LOG_LEVEL = 'error';
