"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProfilePicture = exports.deleteUser = exports.updateUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const updateUser = async (req, res) => {
    try {
        const { name, email } = req.body;
        const userId = req.user?._id;
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (email && email !== user.email) {
            const existingUser = await User_1.default.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }
        user.name = name || user.name;
        user.email = email || user.email;
        await user.save();
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const userId = req.user?._id;
        await User_1.default.findByIdAndDelete(userId);
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteUser = deleteUser;
// Upload profile picture
const uploadProfilePicture = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const profilePictureUrl = req.file.path;
        await User_1.default.findByIdAndUpdate(userId, { profilePicture: profilePictureUrl });
        res.json({
            message: 'Profile picture uploaded successfully',
            profilePicture: profilePictureUrl,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.uploadProfilePicture = uploadProfilePicture;
//# sourceMappingURL=user.js.map