import mongoose, { Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IReview {
  _id: string;
  userId: string;
  productId: string;
  rating: number;
  comment?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const reviewSchema = new Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    userId: {
      type: String,
      required: true,
      ref: 'User',
    },
    productId: {
      type: String,
      required: true,
      ref: 'Product',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });
reviewSchema.index({ productId: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ createdAt: -1 });

export default mongoose.model<IReview>('Review', reviewSchema);
