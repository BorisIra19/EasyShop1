import express from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cart';
import { authenticate } from '../middlewares/auth';
import { requireCustomer } from '../middlewares/rbac';
import { validate } from '../middlewares/validation';
import Joi from 'joi';

const router = express.Router();

// All cart routes require authentication
router.use(authenticate);
router.use(requireCustomer);

// Get user's cart
router.get('/', getCart);

// Add item to cart
router.post('/items', validate(Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().min(1).required(),
})), addToCart);

// Update cart item
router.put('/items/:id', validate(Joi.object({
  quantity: Joi.number().min(1).required(),
})), updateCartItem);

// Remove item from cart
router.delete('/items/:id', removeFromCart);

// Clear entire cart
router.delete('/', clearCart);

export default router;
