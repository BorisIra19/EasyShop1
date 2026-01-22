import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { IUser } from '../models/User';
import { deleteImage } from '../middlewares/upload';

interface AuthRequest extends Request {
  user?: IUser;
}

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email } = req.body;
    const userId = req.user?._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    await User.findByIdAndDelete(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload profile picture
export const uploadProfilePicture = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const profilePictureUrl = (req.file as any).path;

    await User.findByIdAndUpdate(userId, { profilePicture: profilePictureUrl });

    res.json({
      message: 'Profile picture uploaded successfully',
      profilePicture: profilePictureUrl,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
