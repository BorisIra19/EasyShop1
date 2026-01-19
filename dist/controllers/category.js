"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategory = exports.getCategories = void 0;
const Category_1 = __importDefault(require("../models/Category"));
const getCategories = async (req, res) => {
    try {
        const categories = await Category_1.default.find();
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getCategories = getCategories;
const getCategory = async (req, res) => {
    try {
        const category = await Category_1.default.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(category);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getCategory = getCategory;
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const category = new Category_1.default({ name, description });
        await category.save();
        res.status(201).json(category);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const category = await Category_1.default.findByIdAndUpdate(req.params.id, { name, description }, { new: true, runValidators: true });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(category);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    try {
        const category = await Category_1.default.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ message: 'Category deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteCategory = deleteCategory;
//# sourceMappingURL=category.js.map