"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPriceDistribution = exports.getLowStockProducts = exports.getTopProducts = exports.getProductStats = exports.deleteProductImage = exports.uploadProductImages = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProduct = exports.getProducts = void 0;
const Product_1 = __importDefault(require("../models/Product"));
const upload_1 = require("../middlewares/upload");
const uuid_1 = require("../utils/uuid");
// Get all products with filtering, sorting, and pagination
const getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        // Filtering
        const query = {};
        const { categoryId, inStock, priceMin, priceMax, search } = req.query;
        if (categoryId) {
            query.categoryId = categoryId;
        }
        if (inStock !== undefined) {
            query.inStock = inStock === 'true';
        }
        if (priceMin || priceMax) {
            query.price = {};
            if (priceMin)
                query.price.$gte = parseFloat(priceMin);
            if (priceMax)
                query.price.$lte = parseFloat(priceMax);
        }
        // Search
        if (search) {
            query.$text = { $search: search };
        }
        // Sorting
        let sortOption = { createdAt: -1 }; // Default sort
        const { sortBy, sortOrder } = req.query;
        if (sortBy) {
            const order = sortOrder === 'asc' ? 1 : -1;
            sortOption = { [sortBy]: order };
        }
        // Execute query with pagination
        const products = await Product_1.default.find(query)
            .populate('categoryId', 'name')
            .populate('vendorId', 'name')
            .sort(sortOption)
            .limit(limit)
            .skip((page - 1) * limit);
        const total = await Product_1.default.countDocuments(query);
        res.json({
            products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getProducts = getProducts;
// Get single product by ID
const getProduct = async (req, res) => {
    try {
        const product = await Product_1.default.findById(req.params.id)
            .populate('categoryId')
            .populate('vendorId', 'name email');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getProduct = getProduct;
// Create new product
const createProduct = async (req, res) => {
    try {
        const { name, price, description, categoryId, inStock, quantity } = req.body;
        const vendorId = req.user?._id;
        const product = new Product_1.default({
            _id: (0, uuid_1.generateUUID)(),
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
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createProduct = createProduct;
// Update product
const updateProduct = async (req, res) => {
    try {
        const { name, price, description, categoryId, inStock, quantity } = req.body;
        const productId = req.params.id;
        const product = await Product_1.default.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        // Check if user is vendor/admin who owns this product
        if (product.vendorId !== req.user?._id && req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'You do not have permission to update this product' });
        }
        if (name)
            product.name = name;
        if (price !== undefined)
            product.price = price;
        if (description)
            product.description = description;
        if (categoryId)
            product.categoryId = categoryId;
        if (inStock !== undefined)
            product.inStock = inStock;
        if (quantity !== undefined)
            product.quantity = quantity;
        await product.save();
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateProduct = updateProduct;
// Delete product
const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product_1.default.findById(productId);
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
                await (0, upload_1.deleteImage)(imagePath);
            }
        }
        await Product_1.default.findByIdAndDelete(productId);
        res.json({ message: 'Product deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteProduct = deleteProduct;
// Upload product images
const uploadProductImages = async (req, res) => {
    try {
        const productId = req.params.id;
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }
        const product = await Product_1.default.findById(productId);
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
                await (0, upload_1.deleteImage)(file.path);
            }
            return res.status(400).json({ message: 'Maximum 5 images allowed per product' });
        }
        // Add new image paths
        const uploadedImages = req.files.map((file) => file.path);
        product.images.push(...uploadedImages);
        await product.save();
        res.json({
            message: 'Product images uploaded successfully',
            images: product.images,
        });
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.uploadProductImages = uploadProductImages;
// Delete product image
const deleteProductImage = async (req, res) => {
    try {
        const productId = req.params.id;
        const { imageUrl } = req.body;
        if (!imageUrl) {
            return res.status(400).json({ message: 'Image URL required' });
        }
        const product = await Product_1.default.findById(productId);
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
        await (0, upload_1.deleteImage)(imageUrl);
        // Remove from product
        product.images = product.images.filter(img => img !== imageUrl);
        await product.save();
        res.json({
            message: 'Product image deleted successfully',
            images: product.images,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteProductImage = deleteProductImage;
// Get product statistics
const getProductStats = async (req, res) => {
    try {
        const stats = await Product_1.default.aggregate([
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
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getProductStats = getProductStats;
// Get top expensive products
const getTopProducts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const products = await Product_1.default.find()
            .sort({ price: -1 })
            .limit(limit)
            .populate('categoryId', 'name')
            .populate('vendorId', 'name');
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getTopProducts = getTopProducts;
// Get low stock products
const getLowStockProducts = async (req, res) => {
    try {
        const threshold = parseInt(req.query.threshold) || 10;
        const products = await Product_1.default.find({ quantity: { $lte: threshold } })
            .sort({ quantity: 1 })
            .populate('categoryId', 'name')
            .populate('vendorId', 'name');
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getLowStockProducts = getLowStockProducts;
// Get price distribution
const getPriceDistribution = async (req, res) => {
    try {
        const distribution = await Product_1.default.aggregate([
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
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getPriceDistribution = getPriceDistribution;
//# sourceMappingURL=product.js.map