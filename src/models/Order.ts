import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IOrderItem {
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface IOrder {
  _id: string;
  userId: string;
  items: IOrderItem[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

const orderSchema = new mongoose.Schema({
  _id: { type: String, default: () => uuidv4() },
  userId: { type: String, required: true, ref: 'User' },
  items: {
    type: [
      {
        productId: { type: String, required: true, ref: 'Product' },
        productName: { type: String, required: true },
        productPrice: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
        totalPrice: { type: Number, required: true, min: 0 },
        _id: false,
      },
    ],
    default: [],
  },
  totalPrice: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

export default mongoose.model('Order', orderSchema);
