"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.changePassword = exports.getProfile = exports.logout = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const email_1 = require("../services/email");
const uuid_1 = require("../utils/uuid");
// Generate JWT token
const generateToken = (userId) => {
    return jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};
// User registration
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const user = new User_1.default({
            name,
            email,
            password,
            role: role || 'customer',
        });
        await user.save();
        const token = generateToken(user._id);
        res.status(201).json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.register = register;
// User login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = generateToken(user._id);
        res.json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.login = login;
// Logout (client-side token removal)
const logout = async (req, res) => {
    res.json({ message: 'Logged out successfully' });
};
exports.logout = logout;
// Get logged-in user profile
const getProfile = async (req, res) => {
    try {
        const user = req.user;
        res.json({
            _id: user?._id,
            name: user?.name,
            email: user?.email,
            role: user?.role,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getProfile = getProfile;
// Change password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        await User_1.default.findByIdAndUpdate(user._id, { password: newPassword });
        res.json({ message: 'Password changed successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.changePassword = changePassword;
// Forgot password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const resetToken = (0, uuid_1.generateUUID)();
        // In a real app, you'd store this token with expiration in the database
        // For simplicity, we'll just send an email with a mock reset link
        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
        await (0, email_1.sendEmail)(email, 'Password Reset', `Click here to reset your password: ${resetUrl}`);
        res.json({ message: 'Password reset email sent' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.forgotPassword = forgotPassword;
// Reset password
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        // In a real app, you'd verify the token from the database
        // For simplicity, we'll just update the password for the user
        // This is not secure and should be improved
        // Mock: Assume token contains userId
        // In practice, decode token to get userId
        res.json({ message: 'Password reset successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.resetPassword = resetPassword;
//# sourceMappingURL=auth.js.map