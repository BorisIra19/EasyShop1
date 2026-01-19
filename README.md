# EasyShop API

Backend REST API for EasyShop with authentication, user management, product catalog, and shopping cart functionality.

## Features

- User authentication and authorization (JWT)
- Role-based access control (Admin, Vendor, Customer)
- Product and category management
- Shopping cart functionality
- Email notifications
- Swagger API documentation
- Input validation with Joi
- Error handling middleware

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **Documentation**: Swagger/OpenAPI
- **Email**: Nodemailer

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd easyshop-api-new
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration values.

5. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`
Swagger documentation at `http://localhost:3000/api-docs`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGO_URI` | MongoDB connection string | mongodb://localhost:27017/easyshop |
| `JWT_SECRET` | JWT signing secret | (required) |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `BCRYPT_ROUNDS` | Password hashing rounds | 12 |
| `EMAIL_HOST` | SMTP host | (required for email features) |
| `EMAIL_PORT` | SMTP port | 587 |
| `EMAIL_USER` | SMTP username | (required for email features) |
| `EMAIL_PASS` | SMTP password | (required for email features) |
| `EMAIL_FROM` | From email address | (required for email features) |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Admin/Vendor)
- `GET /api/categories/:id` - Get category by ID
- `PUT /api/categories/:id` - Update category (Admin/Vendor)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (Admin/Vendor)
- `GET /api/products/:id` - Get product by ID
- `PUT /api/products/:id` - Update product (Admin/Vendor)
- `DELETE /api/products/:id` - Delete product (Admin/Vendor)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:id` - Update cart item quantity
- `DELETE /api/cart/items/:id` - Remove item from cart
- `DELETE /api/cart` - Clear entire cart

## Deployment to Render

### Step 1: Prepare Your Project

1. Make sure all your code is committed to GitHub
2. Ensure you have the `render.yaml` file in your project root

### Step 2: Set Up MongoDB

1. Create a MongoDB Atlas account at https://www.mongodb.com/atlas
2. Create a new cluster and database
3. Get your connection string (it should look like: `mongodb+srv://username:password@cluster.mongodb.net/database`)

### Step 3: Deploy to Render

1. Go to [Render](https://render.com) and sign up/login
2. Click "New +" and select "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file
5. Configure the following secrets in Render:
   - `mongo_uri`: Your MongoDB connection string
   - `jwt_secret`: A strong random string for JWT signing
   - `email_host`: Your SMTP host (e.g., smtp.gmail.com)
   - `email_user`: Your SMTP username
   - `email_pass`: Your SMTP password/app password
   - `email_from`: The from email address

6. Click "Create Blueprint"
7. Wait for deployment to complete

### Step 4: Access Your API

Once deployed, you'll get a URL like: `https://your-app-name.onrender.com`

- API Base URL: `https://your-app-name.onrender.com`
- Swagger Docs: `https://your-app-name.onrender.com/api-docs`

## Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload

## Project Structure

```
src/
├── controllers/     # Request handlers
├── middlewares/     # Custom middleware
├── models/         # Mongoose models
├── routes/         # API routes
├── services/       # Business logic services
├── utils/          # Utility functions
├── app.ts          # Express app configuration
└── server.ts       # Server entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.
"# Eazyshop" 
