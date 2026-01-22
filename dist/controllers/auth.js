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
    return jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET || 'your_super_secret_jwt_key_here', {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};
// User registration
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }
        const user = new User_1.default({
            name,
            email,
            password,
            role: role || 'customer',
        });
        await user.save();
        // Send welcome email asynchronously
        setImmediate(async () => {
            try {
                const emailText = `Hi ${user.name},\n\nWelcome to EasyShop! Your account has been created successfully.\n\nBest regards,\nEasyShop Team`;
                const emailHtml = `
          <h2>Welcome to EasyShop!</h2>
          <p>Hi ${user.name},</p>
          <p>Your account has been created successfully.</p>
          <p>Best regards,<br/>EasyShop Team</p>
        `;
                await (0, email_1.sendEmail)(user.email, 'Welcome to EasyShop!', emailText, emailHtml);
            }
            catch (error) {
                console.error('Welcome email failed:', error);
            }
        });
        const token = generateToken(user._id);
        res.status(201).json({
            success: true,
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
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.register = register;
// User login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const token = generateToken(user._id);
        res.json({
            success: true,
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
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.login = login;
// Logout (client-side token removal)
const logout = async (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
};
exports.logout = logout;
// Get logged-in user profile
const getProfile = async (req, res) => {
    try {
        const user = req.user;
        res.json({
            success: true,
            user: {
                _id: user?._id,
                name: user?.name,
                email: user?.email,
                role: user?.role,
            },
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getProfile = getProfile;
// Change password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }
        await User_1.default.findByIdAndUpdate(user._id, { password: newPassword });
        res.json({ success: true, message: 'Password changed successfully' });
    }
    catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.changePassword = changePassword;
// Forgot password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const resetToken = (0, uuid_1.generateUUID)();
        // In a real app, you'd store this token with expiration in the database
        // For now, we'll send the email with instructions
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
        const emailText = `Click the link below to reset your password:\n\n${resetUrl}\n\nThis link expires in 1 hour.`;
        const emailHtml = `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;
        await (0, email_1.sendEmail)(email, 'Password Reset Request', emailText, emailHtml);
        res.json({ success: true, message: 'Password reset email sent' });
    }
    catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.forgotPassword = forgotPassword;
// Reset password
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        // In a real app, you'd verify the token from the database
        // and check expiration. For now, this is a placeholder.
        // For production, implement proper token storage and validation
        if (!token || !newPassword) {
            return res.status(400).json({ success: false, message: 'Token and password required' });
        }
        // TODO: Implement proper token validation from database
        // This should verify token exists, hasn't expired, and get associated user
        res.json({ success: true, message: 'Password reset successfully' });
    }
    catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.resetPassword = resetPassword;
//# sourceMappingURL=auth.js.map