import app from './app';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { verifyEmailConfig } from './services/email';

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/easyshop';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✓ Connected to MongoDB');
    
    // Verify email configuration
    await verifyEmailConfig();
    
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Swagger docs available at http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((error) => {
    console.error('✗ MongoDB connection error:', error);
    process.exit(1);
  });
