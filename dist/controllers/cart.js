"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeFromCart = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const Cart_1 = __importDefault(require("../models/Cart"));
const uuid_1 = require("../utils/uuid");
const getCart = async (req, res) => {
    try {
        const userId = req.user?._id;
        let cart = await Cart_1.default.findOne({ userId }).populate('items.productId', 'name price');
        if (!cart) {
            cart = new Cart_1.default({ userId, items: [] });
            await cart.save();
        }
        res.json(cart);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getCart = getCart;
const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user?._id;
        // Check if product exists
        const Product = require('../models/Product').default;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        let cart = await Cart_1.default.findOne({ userId });
        if (!cart) {
            cart = new Cart_1.default({ userId, items: [] });
        }
        const existingItem = cart.items.find(item => item.productId === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        }
        else {
            cart.items.push({ _id: (0, uuid_1.generateUUID)(), productId, quantity });
        }
        await cart.save();
        await cart.populate('items.productId', 'name price');
        res.status(201).json(cart);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.addToCart = addToCart;
const updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        const itemId = req.params.id;
        const userId = req.user?._id;
        const cart = await Cart_1.default.findOne({ userId });
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
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateCartItem = updateCartItem;
const removeFromCart = async (req, res) => {
    try {
        const itemId = req.params.id;
        const userId = req.user?._id;
        const cart = await Cart_1.default.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        cart.items = cart.items.filter(item => item._id !== itemId);
        await cart.save();
        await cart.populate('items.productId', 'name price');
        res.json(cart);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.removeFromCart = removeFromCart;
const clearCart = async (req, res) => {
    try {
        const userId = req.user?._id;
        const cart = await Cart_1.default.findOneAndUpdate({ userId }, { items: [] }, { new: true });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        res.json(cart);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.clearCart = clearCart;
//# sourceMappingURL=cart.js.map