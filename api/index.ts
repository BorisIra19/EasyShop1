import serverless from 'serverless-http';
import app from '../src/app';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/easyshop';

const handler = serverless(app);

export default async function (req: any, res: any) {
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(MONGO_URI);
      console.log('✓ Connected to MongoDB (serverless)');
    } catch (err) {
      console.error('✗ MongoDB connection error (serverless):', err);
      res.status(500).json({ message: 'Database connection error' });
      return;
    }
  }

  return handler(req, res);
}
