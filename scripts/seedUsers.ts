import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';
import { generateUUID } from '../src/utils/uuid';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/easyshop';

const users = [
  {
    _id: generateUUID(),
    name: 'Admin User',
    email: 'admin@easyshop.com',
    password: 'admin123',
    role: 'admin' as const,
  },
  {
    _id: generateUUID(),
    name: 'Vendor One',
    email: 'vendor1@easyshop.com',
    password: 'vendor123',
    role: 'vendor' as const,
  },
  {
    _id: generateUUID(),
    name: 'Vendor Two',
    email: 'vendor2@easyshop.com',
    password: 'vendor123',
    role: 'vendor' as const,
  },
  {
    _id: generateUUID(),
    name: 'Customer One',
    email: 'customer1@easyshop.com',
    password: 'customer123',
    role: 'customer' as const,
  },
  {
    _id: generateUUID(),
    name: 'Customer Two',
    email: 'customer2@easyshop.com',
    password: 'customer123',
    role: 'customer' as const,
  },
];

async function seedUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create new users
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${userData.email}`);
    }

    console.log('Users seeded successfully');
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedUsers();
