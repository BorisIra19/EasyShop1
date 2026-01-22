import { Request, Response } from 'express';
import Product from '../models/Product';
import { IUser } from '../models/User';
import { deleteImage } from '../middlewares/upload';
import { generateUUID } from '../utils/uuid';

interface AuthRequest extends Request {
  user?: IUser;
  files?: Express.Multer.File[];
}

// Get all products with filtering, sorting, and pagination
export const getProducts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Filtering
    const query: any = {};
    const { categoryId, inStock, priceMin, priceMax, search } = req.query;

    if (categoryId) {
      query.categoryId = categoryId;
    }

    if (inStock !== undefined) {
      query.inStock = inStock === 'true';
    }

    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = parseFloat(priceMin as string);
      if (priceMax) query.price.$lte = parseFloat(priceMax as string);
    }

    // Search
    if (search) {
      query.$text = { $search: search as string };
    }

    // Sorting
    let sortOption: any = { createdAt: -1 }; // Default sort
    const { sortBy, sortOrder } = req.query;
    if (sortBy) {
      const order = sortOrder === 'asc' ? 1 : -1;
      sortOption = { [sortBy as string]: order };
    }

    // Execute query with pagination
    const products = await Product.find(query)
      .populate('categoryId', 'name')
      .populate('vendorId', 'name')
      .sort(sortOption)
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
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

// Get single product by ID
export const getProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('categoryId')
      .populate('vendorId', 'name email');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new product
export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, price, description, categoryId, inStock, quantity } = req.body;
    const vendorId = req.user?._id;

    const product = new Product({
      _id: generateUUID(),
      name,
      price,
      description,
      categoryId,
      inStock: inStock !== false,
      quantity,
      vendorId,
      images: [],
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update product
export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, price, description, categoryId, inStock, quantity } = req.body;
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user is vendor/admin who owns this product
    if (product.vendorId !== req.user?._id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to update this product' });
    }

    if (name) product.name = name;
    if (price !== undefined) product.price = price;
    if (description) product.description = description;
    if (categoryId) product.categoryId = categoryId;
    if (inStock !== undefined) product.inStock = inStock;
    if (quantity !== undefined) product.quantity = quantity;

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete product
export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user is vendor/admin who owns this product
    if (product.vendorId !== req.user?._id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to delete this product' });
    }

    // Delete images from storage
    if (product.images && product.images.length > 0) {
      for (const imagePath of product.images) {
        await deleteImage(imagePath);
      }
    }

    await Product.findByIdAndDelete(productId);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload product images
export const uploadProductImages = async (req: AuthRequest, res: Response) => {
  try {
    const productId = req.params.id;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user is vendor/admin who owns this product
    if (product.vendorId !== req.user?._id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to upload images for this product' });
    }

    // Initialize images array if not present
    if (!product.images) {
      product.images = [];
    }

    // Check if total images would exceed limit (max 5)
    if (product.images.length + req.files.length > 5) {
      // Delete uploaded files
      for (const file of req.files) {
        await deleteImage((file as any).path);
      }
      return res.status(400).json({ message: 'Maximum 5 images allowed per product' });
    }

    // Add new image paths
    const uploadedImages = (req.files as Express.Multer.File[]).map((file: any) => file.path);
    product.images.push(...uploadedImages);

    await product.save();

    res.json({
      message: 'Product images uploaded successfully',
      images: product.images,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete product image
export const deleteProductImage = async (req: AuthRequest, res: Response) => {
  try {
    const productId = req.params.id;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user is vendor/admin who owns this product
    if (product.vendorId !== req.user?._id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to delete images from this product' });
    }

    // Find and remove the image
    if (!product.images || !product.images.includes(imageUrl)) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete from filesystem
    await deleteImage(imageUrl);

    // Remove from product
    product.images = product.images.filter(img => img !== imageUrl);
    await product.save();

    res.json({
      message: 'Product image deleted successfully',
      images: product.images,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get product statistics
export const getProductStats = async (req: Request, res: Response) => {
  try {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: '$categoryId',
          totalProducts: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: '$category',
      },
      {
        $project: {
          _id: 0,
          category: '$category.name',
          totalProducts: 1,
          avgPrice: { $round: ['$avgPrice', 2] },
          minPrice: 1,
          maxPrice: 1,
        },
      },
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get top expensive products
export const getTopProducts = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const products = await Product.find()
      .sort({ price: -1 })
      .limit(limit)
      .populate('categoryId', 'name')
      .populate('vendorId', 'name');

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get low stock products
export const getLowStockProducts = async (req: Request, res: Response) => {
  try {
    const threshold = parseInt(req.query.threshold as string) || 10;

    const products = await Product.find({ quantity: { $lte: threshold } })
      .sort({ quantity: 1 })
      .populate('categoryId', 'name')
      .populate('vendorId', 'name');

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get price distribution
export const getPriceDistribution = async (req: Request, res: Response) => {
  try {
    const distribution = await Product.aggregate([
      {
        $bucket: {
          groupBy: '$price',
          boundaries: [0, 50, 100, 200, 500, 1000, 10000],
          default: '10000+',
          output: {
            count: { $sum: 1 },
            products: {
              $push: {
                name: '$name',
                price: '$price',
              },
            },
          },
        },
      },
    ]);

    res.json(distribution);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
