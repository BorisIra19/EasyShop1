import { Request, Response } from 'express';
import Review, { IReview } from '../models/Review';
import { IUser } from '../models/User';
import { generateUUID } from '../utils/uuid';

interface AuthRequest extends Request {
  user?: IUser;
}

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user?._id;

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ userId, productId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = new Review({
      _id: generateUUID(),
      userId,
      productId,
      rating,
      comment,
    });

    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserReviews = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const reviews = await Review.find({ userId })
      .populate('productId', 'name price images')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user?._id;

    const review = await Review.findOne({ _id: id, userId });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const review = await Review.findOneAndDelete({ _id: id, userId });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
