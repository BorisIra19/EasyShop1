"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const email_1 = require("./services/email");
dotenv_1.default.config();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/easyshop';
mongoose_1.default.connect(MONGO_URI)
    .then(async () => {
    console.log('✓ Connected to MongoDB');
    // Verify email configuration
    await (0, email_1.verifyEmailConfig)();
    app_1.default.listen(PORT, () => {
        console.log(`✓ Server running on port ${PORT}`);
        console.log(`✓ Swagger docs available at http://localhost:${PORT}/api-docs`);
    });
})
    .catch((error) => {
    console.error('✗ MongoDB connection error:', error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map