import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import categoryRoutes from './routes/categories';
import productRoutes from './routes/products';
import cartRoutes from './routes/cart';
import { customerRouter, adminRouter } from './routes/orders';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

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
        OrderItem: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Order item ID',
            },
            productId: {
              type: 'string',
              description: 'Product ID',
            },
            productName: {
              type: 'string',
              description: 'Product name at time of order',
            },
            productPrice: {
              type: 'number',
              description: 'Product price at time of order',
            },
            quantity: {
              type: 'number',
              description: 'Ordered quantity',
            },
            totalPrice: {
              type: 'number',
              description: 'Total price for this item',
            },
          },
        },
        Order: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Order ID',
            },
            userId: {
              type: 'string',
              description: 'User ID who placed the order',
            },
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/OrderItem',
              },
              description: 'List of ordered items',
            },
            totalPrice: {
              type: 'number',
              description: 'Total order price',
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
              description: 'Order status',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Order creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Order last update timestamp',
            },
          },
        },
        OrdersResponse: {
          type: 'object',
          properties: {
            orders: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Order',
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'number',
                  description: 'Current page',
                },
                limit: {
                  type: 'number',
                  description: 'Items per page',
                },
                total: {
                  type: 'number',
                  description: 'Total orders',
                },
                pages: {
                  type: 'number',
                  description: 'Total pages',
                },
              },
            },
          },
        },
        UpdateOrderStatusRequest: {
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
              description: 'New order status',
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

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Security middleware
app.use(helmet());
app.use(cors());

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', customerRouter);
app.use('/api/admin/orders', adminRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;

