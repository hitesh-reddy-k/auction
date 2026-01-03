# Auction Platform

A web application where users can register, login, list items for auction, browse active auctions, and place bids.

## Features

- **User Authentication**: Register and login with secure password hashing
- **User Balance**: Each user starts with 1000 credits
- **Create Auctions**: List items with title, description, starting price, and closing date
- **Browse Auctions**: View all active auctions (public access)
- **Place Bids**: Bid on auctions with real-time validation
- **Transaction History**: View bid history for owned auctions
- **Security**: Implements HTTPS, rate limiting, input validation, and CSRF protection

## Prerequisites

### Install PostgreSQL

#### Windows:
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the 'postgres' user
4. Default port is 5432 (keep it as is)
5. Complete the installation

#### Verify Installation:
Open Command Prompt and run:
```bash
psql --version
```

### Install Node.js
Download and install Node.js from: https://nodejs.org/ (LTS version recommended)

## Database Setup

1. **Open pgAdmin 4** (installed with PostgreSQL) or use command line:

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE auction_db;

# Exit
\q
```

2. **Run the database schema** (after starting the server for the first time, it will create tables automatically)

## Installation

1. **Clone or download this repository**

2. **Install backend dependencies:**
```bash
npm install
```

3. **Install frontend dependencies:**
```bash
cd client
npm install
cd ..
```

4. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update the database credentials and JWT secret

```bash
copy .env.example .env
```

Edit `.env` file with your PostgreSQL password and a secure JWT secret.

## Running the Application

### Development Mode (Full Stack):
```bash
npm run dev:full
```

This will start:
- Backend API on http://localhost:5000
- Frontend on http://localhost:3000

### Backend Only:
```bash
npm run dev
```

### Frontend Only:
```bash
npm run client
```

### Production Mode:
```bash
# Build frontend
cd client
npm run build
cd ..

# Start server
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Auctions
- `GET /api/auctions` - Get all active auctions
- `GET /api/auctions/:id` - Get single auction details
- `POST /api/auctions` - Create new auction (authenticated)
- `GET /api/auctions/:id/bids` - Get bid history (owner only)

### Bids
- `POST /api/bids` - Place a bid (authenticated)

## Pages

- `/` - Home (list of auctions)
- `/login` - Login page
- `/register` - Registration page
- `/create` - Create new auction (authenticated)
- `/:id` - Single auction details

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting to prevent abuse
- Input validation and sanitization
- SQL injection prevention with parameterized queries
- XSS protection with Helmet
- CORS configuration
- Secure headers

## Database Schema

### Users Table
- id (Primary Key)
- username (Unique)
- email (Unique)
- password (Hashed)
- balance (Default: 1000)
- created_at

### Auctions Table
- id (Primary Key)
- user_id (Foreign Key)
- title
- description
- starting_price
- current_price
- closing_date
- status
- created_at

### Bids Table
- id (Primary Key)
- auction_id (Foreign Key)
- user_id (Foreign Key)
- amount
- created_at

## Default User Balance

Each new user receives 1000 credits upon registration.

## License

ISC
