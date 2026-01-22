import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Order, { IOrder } from '../models/Order';
import Cart, { ICart } from '../models/Cart';
import Product from '../models/Product';
import User, { IUser } from '../models/User';
import { sendEmail } from '../services/email';
import { generateUUID } from '../utils/uuid';

interface AuthRequest extends Request {
  user?: IUser;
}



// Customer: Place order from cart
export const placeOrder = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user?._id;

    // Get user's cart
    const cart = await Cart.findOne({ userId }).populate('items.productId', 'name price quantity inStock').session(session);
    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate products availability and calculate total
    let totalPrice = 0;
    const orderItems = cart.items.map(item => {
      const product = (item.productId as any); // Populated product
      if (!product.inStock || product.quantity < item.quantity) {
        session.abortTransaction();
        throw new Error(`Insufficient stock for product: ${product.name}`);
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

    await order.save({ session });

    // Reduce product quantities
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { quantity: -(item as any).quantity }
      }, { session });
    }

    // Clear cart
    cart.items = [];
    await cart.save({ session });

    await session.commitTransaction();

    // Send order confirmation email asynchronously
    setImmediate(async () => {
      try {
        const userData = await User.findById(userId);
        if (userData) {
          const emailText = `Hi ${userData.name},\n\nYour order has been placed successfully.\n\nOrder ID: ${order._id}\nTotal: $${totalPrice}\n\nThank you for shopping with us!\n\nBest regards,\nEasyShop Team`;
          const emailHtml = `
            <h2>Order Confirmation</h2>
            <p>Hi ${userData.name},</p>
            <p>Your order has been placed successfully!</p>
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Total:</strong> $${totalPrice}</p>
            <p>Thank you for shopping with us!</p>
            <p>Best regards,<br/>EasyShop Team</p>
          `;
          await sendEmail(userData.email, 'Order Placed Successfully', emailText, emailHtml);
        }
      } catch (error) {
        console.error('Order confirmation email failed:', error);
      }
    });

    res.status(201).json(order);
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Server error' });
  } finally {
    session.endSession();
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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orderId = req.params.id;
    const userId = req.user?._id;

    const order = await Order.findOne({ _id: orderId, userId }).session(session);
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'pending') {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }

    order.status = 'cancelled';
    await order.save({ session });

    // Restore product quantities
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { quantity: item.quantity }
      }, { session });
    }

    await session.commitTransaction();
    res.json(order);
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Server error' });
  } finally {
    session.endSession();
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
