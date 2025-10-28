# Book Market - Express REST API

A full-featured online bookstore REST API built with Node.js, Express, and MariaDB. This application provides comprehensive book marketplace functionality including user authentication, book management, shopping cart, orders, and reviews.

## Features

### User Management
- User registration and authentication with JWT
- Role-based access control (Admin/Member)
- Token refresh mechanism
- Secure password hashing with bcrypt
- User profile management

### Book Management
- Browse and search books
- Filter by category
- Pagination support
- New arrivals section
- Book details with descriptions, ISBN, table of contents
- Book like/unlike functionality

### Shopping Cart
- Add books to cart
- Update quantities
- Remove items
- View cart with book details

### Order Management
- Create orders from cart
- View order history
- Order details with status tracking
- Admin order status management

### Review System
- Create, read, update, delete reviews
- Rating system (1-5 stars)
- Review likes
- User-specific review restrictions (one review per book)

### Categories
- Hierarchical category structure
- Parent-child category relationships
- Category-based book filtering

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js 4.16.1
- **Database**: MariaDB/MySQL
- **Authentication**: JSON Web Tokens (JWT)
- **Password Security**: bcrypt
- **Validation**: express-validator
- **Testing**: Jest, Supertest
- **Environment**: dotenv

## Prerequisites

- Node.js (v14 or higher)
- MariaDB or MySQL (v10.x or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/JHParrrk/book_market.git
cd book_market
```

2. Install dependencies:
```bash
npm install
```

3. Configure the database:
   - Create a MariaDB/MySQL database named `bookstore`
   - Run the SQL schema from `database.ddl.txt`

4. Create a `.env` file in the root directory:
```env
PORT=3000
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

5. Configure database connection in `database/connection/mariaDB.js` if needed:
```javascript
host: "localhost",
port: 3306,
user: "root",
password: "root",
database: "bookstore"
```

## Running the Application

### Development
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in .env)

### Testing
```bash
npm test
```

## API Documentation

### Authentication

#### Register a new user
```http
POST /users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login
```http
POST /users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response includes `accessToken` and `refreshToken`.

#### Refresh Access Token
```http
POST /users/refresh-token
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}
```

#### Logout
```http
POST /users/logout
Authorization: Bearer <access_token>
```

### Books

#### Get all books (with search and filtering)
```http
GET /books?search=query&categoryId=1&page=1&limit=8
```

#### Get new books
```http
GET /books/new?categoryId=1&limit=4
```

#### Get book details
```http
GET /books/:bookId
Authorization: Bearer <access_token> (optional)
```

#### Toggle book like
```http
POST /books/:bookId/like
Authorization: Bearer <access_token>
```

### Categories

#### Get all categories
```http
GET /categories
```

### Shopping Cart

#### Add item to cart
```http
POST /carts
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "bookId": 1,
  "quantity": 2
}
```

#### Get cart items
```http
GET /carts
Authorization: Bearer <access_token>
```

#### Update cart item quantity
```http
PUT /carts/:cartItemId
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "quantity": 3
}
```

#### Remove cart item
```http
DELETE /carts/:cartItemId
Authorization: Bearer <access_token>
```

### Orders

#### Create order
```http
POST /orders
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "deliveryInfo": {
    "address": "123 Main St",
    "phone": "010-1234-5678"
  },
  "cartItemIds": [1, 2, 3]
}
```

#### Get my orders
```http
GET /orders
Authorization: Bearer <access_token>
```

#### Get order details
```http
GET /orders/:orderId
Authorization: Bearer <access_token>
```

#### Update order status (Admin only)
```http
PUT /orders/:orderId/status
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "status": "shipped"
}
```

### Reviews

#### Get reviews for a book
```http
GET /books/:bookId/reviews
```

#### Add review
```http
POST /books/:bookId/reviews
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "rating": 5,
  "content": "Great book!"
}
```

#### Update review
```http
PUT /books/:bookId/reviews/:reviewId
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "rating": 4,
  "content": "Updated review"
}
```

#### Delete review
```http
DELETE /books/:bookId/reviews/:reviewId
Authorization: Bearer <access_token>
```

#### Toggle review like
```http
POST /books/:bookId/reviews/:reviewId/like
Authorization: Bearer <access_token>
```

### Admin Routes

#### Get all users (Admin only)
```http
GET /users
Authorization: Bearer <admin_access_token>
```

#### Update user role (Admin only)
```http
PUT /users/:userId/role
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "role": "admin"
}
```

## Database Schema

The application uses the following main tables:

- **users**: User accounts with authentication
- **books**: Book catalog with details
- **categories**: Hierarchical book categories
- **carts**: Shopping cart items
- **orders**: Order records
- **order_details**: Order line items
- **reviews**: Book reviews and ratings
- **book_likes**: User book favorites
- **review_likes**: Review likes
- **refresh_tokens**: JWT refresh tokens

See `database.ddl.txt` for complete schema definition.

## Project Structure

```
book_market/
├── app.js                 # Express application setup
├── bin/
│   └── www               # Server startup script
├── config.js             # Configuration constants
├── constants/            # Application constants
├── database/
│   └── connection/
│       └── mariaDB.js   # Database connection pool
├── middleware/          # Express middlewares
│   ├── authorize.middleware.js
│   ├── authorizeAdmin.middleware.js
│   ├── errorHandler.middleware.js
│   └── validator.middleware.js
├── modules/            # Business logic modules
│   ├── books/
│   ├── carts/
│   ├── categories/
│   ├── orders/
│   ├── reviews/
│   └── users/
├── routes/            # Express route handlers
├── tests/             # Jest test suites
├── utils/             # Utility functions
└── package.json
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Input validation with express-validator
- SQL injection prevention via parameterized queries
- CORS support

## Error Handling

The application includes centralized error handling middleware that:
- Catches and formats validation errors
- Handles authentication errors
- Provides meaningful error messages
- Logs errors for debugging

## Development

### Code Organization

The application follows a modular architecture:
- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic
- **Repositories**: Handle database operations
- **Middleware**: Process requests before reaching controllers

### Testing

Tests are organized by feature:
- `tests/users.test.js` - User authentication and authorization
- `tests/books.test.js` - Book management and likes
- `tests/carts.test.js` - Shopping cart operations

Run tests with:
```bash
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Author

JHParrrk

## Support

For issues and questions, please open an issue in the GitHub repository.
