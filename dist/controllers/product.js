"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProduct = exports.getProducts = void 0;
const Product_1 = __importDefault(require("../models/Product"));
const getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const categoryId = req.query.categoryId;
        const query = {};
        if (categoryId) {
            query.categoryId = categoryId;
        }
        const products = await Product_1.default.find(query)
            .sort('-createdAt')
            .limit(limit)
            .skip((page - 1) * limit);
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getProducts = getProducts;
const getProduct = async (req, res) => {
    try {
        const product = await Product_1.default.findById(req.params.id).populate('categoryId', 'name');
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
const createProduct = async (req, res) => {
    try {
        const { name, price, description, categoryId, inStock, quantity } = req.body;
        const vendorId = req.user?._id;
        const product = new Product_1.default({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const product = await Product_1.default.findById(req.params.id);
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
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const product = await Product_1.default.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        // Check if user is admin or the vendor who owns the product
        if (req.user?.role !== 'admin' && product.vendorId !== req.user?._id) {
            return res.status(403).json({ message: 'Not authorized to delete this product' });
        }
        await Product_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteProduct = deleteProduct;
//# sourceMappingURL=product.js.map