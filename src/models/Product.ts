import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IProduct {
  _id: string;
  name: string;
  price: number;
  description?: string;
  categoryId: string;
  inStock: boolean;
  quantity: number;
  vendorId: string;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>({
  _id: {
    type: String,
    default: uuidv4,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    trim: true,
  },
  categoryId: {
    type: String,
    required: true,
    ref: 'Category',
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  vendorId: {
    type: String,
    required: true,
    ref: 'User',
  },
}, {
  timestamps: true,
});

productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ categoryId: 1 });
productSchema.index({ vendorId: 1 });

export default mongoose.model<IProduct>('Product', productSchema);
