import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ICartItem {
  _id: string;
  productId: string;
  quantity: number;
}

export interface ICart {
  _id: string;
  userId: string;
  items: ICartItem[];
}

const cartItemSchema = new Schema<ICartItem>({
  _id: {
    type: String,
    default: uuidv4,
  },
  productId: {
    type: String,
    required: true,
    ref: 'Product',
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const cartSchema = new Schema<ICart>({
  _id: {
    type: String,
    default: uuidv4,
  },
  userId: {
    type: String,
    required: true,
    ref: 'User',
    unique: true,
  },
  items: [cartItemSchema],
});

export default mongoose.model<ICart>('Cart', cartSchema);
