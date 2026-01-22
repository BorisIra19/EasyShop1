import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../src/models/Product';
import Category from '../src/models/Category';
import User from '../src/models/User';
import { generateUUID } from '../src/utils/uuid';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/easyshop';

const categories = [
  { _id: generateUUID(), name: 'Electronics', description: 'Electronic devices and gadgets' },
  { _id: generateUUID(), name: 'Clothing', description: 'Fashion and apparel' },
  { _id: generateUUID(), name: 'Books', description: 'Books and publications' },
  { _id: generateUUID(), name: 'Home & Garden', description: 'Home improvement and gardening' },
  { _id: generateUUID(), name: 'Sports', description: 'Sports equipment and accessories' },
];

const products = [
  {
    _id: generateUUID(),
    name: 'Wireless Headphones',
    price: 99.99,
    description: 'High-quality wireless headphones with noise cancellation',
    categoryId: '', // Will be set after categories are created
    inStock: true,
    quantity: 50,
    vendorId: '', // Will be set after users are found
  },
  {
    _id: generateUUID(),
    name: 'Smartphone Case',
    price: 19.99,
    description: 'Protective case for smartphones',
    categoryId: '',
    inStock: true,
    quantity: 100,
    vendorId: '',
  },
  {
    _id: generateUUID(),
    name: 'Programming Book',
    price: 49.99,
    description: 'Comprehensive guide to modern programming',
    categoryId: '',
    inStock: true,
    quantity: 30,
    vendorId: '',
  },
  {
    _id: generateUUID(),
    name: 'Garden Tools Set',
    price: 79.99,
    description: 'Complete set of gardening tools',
    categoryId: '',
    inStock: true,
    quantity: 20,
    vendorId: '',
  },
  {
    _id: generateUUID(),
    name: 'Yoga Mat',
    price: 29.99,
    description: 'Non-slip yoga mat for exercise',
    categoryId: '',
    inStock: true,
    quantity: 75,
    vendorId: '',
  },
  {
    _id: generateUUID(),
    name: 'Bluetooth Speaker',
    price: 59.99,
    description: 'Portable Bluetooth speaker with great sound quality',
    categoryId: '',
    inStock: true,
    quantity: 40,
    vendorId: '',
  },
  {
    _id: generateUUID(),
    name: 'Running Shoes',
    price: 89.99,
    description: 'Comfortable running shoes for athletes',
    categoryId: '',
    inStock: true,
    quantity: 25,
    vendorId: '',
  },
  {
    _id: generateUUID(),
    name: 'Coffee Maker',
    price: 129.99,
    description: 'Automatic coffee maker for home use',
    categoryId: '',
    inStock: true,
    quantity: 15,
    vendorId: '',
  },
];

async function seedProducts() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('Cleared existing products and categories');

    // Create categories
    const createdCategories = await Category.insertMany(categories);
    console.log('Categories seeded successfully');

    // Get vendor users
    const vendors = await User.find({ role: 'vendor' });
    if (vendors.length === 0) {
      console.log('No vendors found. Please run seed:users first.');
      return;
    }

    // Assign categories and vendors to products
    products.forEach((product, index) => {
      product.categoryId = createdCategories[index % createdCategories.length]._id;
      product.vendorId = vendors[index % vendors.length]._id;
    });

    // Create products
    await Product.insertMany(products);
    console.log('Products seeded successfully');

  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedProducts();
