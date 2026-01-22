"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }
        // Verify token with proper error handling
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_here');
        }
        catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({ success: false, message: 'Token expired' });
            }
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }
        const user = await User_1.default.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ success: false, message: 'Authentication failed' });
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.js.map