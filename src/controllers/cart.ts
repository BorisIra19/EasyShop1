import { Request, Response } from 'express';
import Cart, { ICart } from '../models/Cart';
import { IUser } from '../models/User';
import { generateUUID } from '../utils/uuid';

interface AuthRequest extends Request {
  user?: IUser;
}

export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    let cart = await Cart.findOne({ userId }).populate('items.productId', 'name price');

    if (!cart) {
      cart = new Cart({ userId, items: [] });
      await cart.save();
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user?._id;

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItem = cart.items.find(item => item.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ _id: generateUUID(), productId, quantity });
    }

    await cart.save();
    await cart.populate('items.productId', 'name price');
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const { quantity } = req.body;
    const itemId = req.params.id;
    const userId = req.user?._id;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item._id === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    await cart.populate('items.productId', 'name price');
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response) => {
  try {
    const itemId = req.params.id;
    const userId = req.user?._id;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item._id !== itemId);
    await cart.save();
    await cart.populate('items.productId', 'name price');
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { items: [] },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
