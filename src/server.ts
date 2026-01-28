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
    console.error('✗ MongoDB connection error:', error.message);
    console.log('\n📝 To fix MongoDB connection:');
    console.log('   1. Go to https://cloud.mongodb.com/');
    console.log('   2. Find your cluster (Cluster0)');
    console.log('   3. Go to Network Access');
    console.log('   4. Add your IP address: 102.22.137.214 or use 0.0.0.0/0');
    console.log('   5. Wait 5-15 minutes for the change to propagate');
    console.log('   6. Restart the server\n');
    process.exit(1);
  });
