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
    console.warn('⚠ MongoDB connection warning (will retry):', error.message);
    console.log('\n📝 To fix MongoDB connection:');
    console.log('   1. Go to https://cloud.mongodb.com/');
    console.log('   2. Find your cluster (Cluster0)');
    console.log('   3. Go to Network Access');
    console.log('   4. Add your IP address or use 0.0.0.0/0');
    console.log('   5. Wait 5-10 minutes and restart the server\n');
    // Still start the server for development/testing
    app_1.default.listen(PORT, () => {
        console.log(`✓ Server running on port ${PORT} (without MongoDB)`);
        console.log(`✓ Swagger docs available at http://localhost:${PORT}/api-docs`);
        console.log('⚠ Database features will not work until MongoDB is connected\n');
    });
});
//# sourceMappingURL=server.js.map