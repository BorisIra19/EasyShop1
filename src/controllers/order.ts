import { Request, Response } from 'express';
import Order, { IOrder } from '../models/Order';
import Cart, { ICart } from '../models/Cart';
import Product from '../models/Product';
import { IUser } from '../models/User';
import { generateUUID } from '../utils/uuid';

interface AuthRequest extends Request {
  user?: IUser;
}



// Customer: Place order from cart
export const placeOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    // Get user's cart
    const cart = await Cart.findOne({ userId }).populate('items.productId', 'name price quantity inStock');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate products availability and calculate total
    let totalPrice = 0;
    const orderItems = cart.items.map(item => {
      const product = item.productId as any; // Populated product
      if (!product.inStock || product.quantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product: ${product.name}`
        });
      }

      const itemTotal = product.price * item.quantity;
      totalPrice += itemTotal;

      return {
        _id: generateUUID(),
        productId: product._id,
        productName: product.name,
        productPrice: product.price,
        quantity: item.quantity,
        totalPrice: itemTotal,
      };
    });

    // Create order
    const order = new Order({
      _id: generateUUID(),
      userId,
      items: orderItems,
      totalPrice,
      status: 'pending',
    });

    await order.save();

    // Clear cart
    cart.items = [];
    await cart.save();

    // Reduce product quantities
    for (const item of cart.items) {
      const product = item.productId as any;
      await Product.findByIdAndUpdate(product._id, {
        $inc: { quantity: -item.quantity }
      });
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Customer: Get all orders for logged-in user
export const getUserOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Customer: Get single order (own order only)
export const getUserOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const orderId = req.params.id;
    const userId = req.user?._id;

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Customer: Cancel order (only if status is pending)
export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const orderId = req.params.id;
    const userId = req.user?._id;

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }

    order.status = 'cancelled';
    await order.save();

    // Restore product quantities
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { quantity: item.quantity }
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Get all orders (all users)
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Update order status
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Prevent certain status changes
    if (order.status === 'delivered' && status !== 'delivered') {
      return res.status(400).json({ message: 'Cannot change status of delivered orders' });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot change status of cancelled orders' });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
