"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
// Routes
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const categories_1 = __importDefault(require("./routes/categories"));
const products_1 = __importDefault(require("./routes/products"));
const cart_1 = __importDefault(require("./routes/cart"));
const errorHandler_1 = require("./middlewares/errorHandler");
const app = (0, express_1.default)();
// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'EasyShop API',
            version: '1.0.0',
            description: 'Backend REST API for EasyShop with authentication and CRUD operations',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'User ID',
                        },
                        name: {
                            type: 'string',
                            description: 'User name',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email',
                        },
                        role: {
                            type: 'string',
                            enum: ['admin', 'vendor', 'customer'],
                            description: 'User role',
                        },
                    },
                },
                Category: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Category ID',
                        },
                        name: {
                            type: 'string',
                            description: 'Category name',
                        },
                        description: {
                            type: 'string',
                            description: 'Category description',
                        },
                    },
                },
                Product: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Product ID',
                        },
                        name: {
                            type: 'string',
                            description: 'Product name',
                        },
                        price: {
                            type: 'number',
                            description: 'Product price',
                        },
                        description: {
                            type: 'string',
                            description: 'Product description',
                        },
                        categoryId: {
                            type: 'string',
                            description: 'Category ID',
                        },
                        inStock: {
                            type: 'boolean',
                            description: 'Product availability',
                        },
                        quantity: {
                            type: 'number',
                            description: 'Product quantity',
                        },
                    },
                },
                CartItem: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Cart item ID',
                        },
                        productId: {
                            type: 'string',
                            description: 'Product ID',
                        },
                        quantity: {
                            type: 'number',
                            description: 'Item quantity',
                        },
                    },
                },
                Cart: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Cart ID',
                        },
                        userId: {
                            type: 'string',
                            description: 'User ID',
                        },
                        items: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/CartItem',
                            },
                            description: 'List of cart items',
                        },
                    },
                },
                AddCartItemRequest: {
                    type: 'object',
                    required: ['productId', 'quantity'],
                    properties: {
                        productId: {
                            type: 'string',
                            description: 'Product ID to add to cart',
                        },
                        quantity: {
                            type: 'number',
                            minimum: 1,
                            description: 'Quantity of the product',
                        },
                    },
                },
                UpdateCartItemRequest: {
                    type: 'object',
                    required: ['quantity'],
                    properties: {
                        quantity: {
                            type: 'number',
                            minimum: 1,
                            description: 'New quantity for the cart item',
                        },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            description: 'Error message',
                        },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.ts'], // Path to the API routes
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
// Logging middleware
app.use((0, morgan_1.default)('combined'));
// Body parsing middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/categories', categories_1.default);
app.use('/api/products', products_1.default);
app.use('/api/cart', cart_1.default);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Swagger documentation
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
// Error handling middleware (must be last)
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map