import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const ensureUploadDir = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Create upload directories
ensureUploadDir('uploads/profiles');
ensureUploadDir('uploads/products');

// Local storage for profile pictures
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/profiles/';
    ensureUploadDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Local storage for product images
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/products/';
    ensureUploadDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter for images only
const imageFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Multer upload for profile pictures (single file, max 1MB)
export const uploadProfilePicture = multer({
  storage: profileStorage,
  limits: { fileSize: 1024 * 1024 }, // 1MB
  fileFilter: imageFilter,
}).single('profilePicture');

// Multer upload for product images (multiple files, max 1MB each)
export const uploadProductImages = multer({
  storage: productStorage,
  limits: { fileSize: 1024 * 1024 }, // 1MB per file
  fileFilter: imageFilter,
}).array('images', 5); // Max 5 images

// Delete image from local storage
export const deleteImage = async (filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};
