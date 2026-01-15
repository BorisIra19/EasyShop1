import { Request, Response } from 'express';
import Product from '../models/Product';
import { IUser } from '../models/User';
import { paginate } from '../utils/pagination';

interface AuthRequest extends Request {
  user?: IUser;
}

export const getProducts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const categoryId = req.query.categoryId as string;

    const query: any = {};
    if (categoryId) {
      query.categoryId = categoryId;
    }

    const products = await Product.find(query)
      .sort('-createdAt')
      .limit(limit)
      .skip((page - 1) * limit);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).populate('categoryId', 'name');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, price, description, categoryId, inStock, quantity } = req.body;
    const vendorId = req.user?._id;

    const product = new Product({
      name,
      price,
      description,
      categoryId,
      inStock,
      quantity,
      vendorId,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user is admin or the vendor who owns the product
    if (req.user?.role !== 'admin' && product.vendorId !== req.user?._id) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    const { name, price, description, categoryId, inStock, quantity } = req.body;
    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.categoryId = categoryId || product.categoryId;
    product.inStock = inStock !== undefined ? inStock : product.inStock;
    product.quantity = quantity || product.quantity;

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user is admin or the vendor who owns the product
    if (req.user?.role !== 'admin' && product.vendorId !== req.user?._id) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
