import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ICategory {
  _id: string;
  name: string;
  description?: string;
}

const categorySchema = new Schema<ICategory>({
  _id: {
    type: String,
    default: uuidv4,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
});

categorySchema.index({ name: 1 });

export default mongoose.model<ICategory>('Category', categorySchema);
