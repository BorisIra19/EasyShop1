import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    // Verify token with proper error handling
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_here') as { userId: string };
    } catch (jwtError: any) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expired' });
      }
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user as any;
    next();
  } catch (error: any) {
    console.error('Authentication error:', error);
    res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};
