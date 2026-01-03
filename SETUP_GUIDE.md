# Setup and Installation Guide

## Complete Setup Instructions

Follow these steps to get your auction platform up and running:

## Step 1: Install Prerequisites

### Install Node.js
1. Download Node.js LTS from: https://nodejs.org/
2. Run the installer
3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### Install PostgreSQL
Follow the detailed guide in [POSTGRESQL_INSTALL.md](POSTGRESQL_INSTALL.md)

**Quick Summary:**
1. Download from https://www.postgresql.org/download/windows/
2. Run installer and set a password for 'postgres' user
3. Use default port 5432
4. Verify: `psql --version`

## Step 2: Create Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE auction_db;

# Verify
\l

# Exit
\q
```

## Step 3: Clone/Setup Project

```bash
# Navigate to project folder
cd c:\Users\hites\Desktop\freelancing

# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

## Step 4: Configure Environment

1. Copy the example environment file:
   ```bash
   copy .env.example .env
   ```

2. Edit the `.env` file with your settings:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=auction_db
   DB_USER=postgres
   DB_PASSWORD=your_actual_password_here

   # JWT Configuration
   JWT_SECRET=your_random_secret_key_here_make_it_long_and_complex
   JWT_EXPIRE=7d

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Frontend URL
   CLIENT_URL=http://localhost:3000
   ```

   **Important**: 
   - Replace `your_actual_password_here` with your PostgreSQL password
   - Replace `JWT_SECRET` with a long random string (you can use an online generator)

## Step 5: Initialize Database

The database tables will be created automatically when you first start the server.

## Step 6: Start the Application

### Option 1: Run Full Stack (Recommended)
```bash
npm run dev:full
```
This starts both backend and frontend simultaneously.

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

## Step 7: Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/health

## Testing the Application

### 1. Register a New User
- Go to http://localhost:3000/register
- Create an account with:
  - Username (min 3 characters)
  - Email
  - Password (min 6 characters)
- You'll receive 1000 credits automatically

### 2. Create an Auction
- Login with your account
- Click "Create Auction"
- Fill in the form:
  - Title
  - Description
  - Starting price
  - Closing date (must be in the future)

### 3. Browse and Bid
- View all auctions on the homepage
- Click on an auction to see details
- Place a bid (must be higher than current price)
- Watch your balance decrease when you bid

### 4. View Bid History
- If you're the auction owner, you can see all bids
- Click on your auction to view the bid history

## Project Structure

```
freelancing/
├── server/                 # Backend code
│   ├── config/            # Database configuration
│   ├── middleware/        # Authentication middleware
│   ├── routes/            # API routes
│   └── server.js          # Main server file
├── client/                # Frontend React app
│   ├── public/           # Static files
│   └── src/              # React source code
│       ├── components/   # React components
│       ├── context/      # Context providers
│       ├── pages/        # Page components
│       ├── services/     # API services
│       └── App.js        # Main app component
├── .env                  # Environment variables
├── package.json          # Backend dependencies
└── README.md            # Documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Auctions
- `GET /api/auctions` - Get all auctions
- `GET /api/auctions/:id` - Get single auction
- `POST /api/auctions` - Create auction (requires auth)
- `GET /api/auctions/:id/bids` - Get bid history (owner only)

### Bids
- `POST /api/bids` - Place a bid (requires auth)

## Troubleshooting

### Backend won't start
**Error**: "Error connecting to database"
- Check if PostgreSQL is running
- Verify database credentials in `.env`
- Make sure `auction_db` database exists

### Frontend won't connect to backend
**Error**: "Network Error"
- Make sure backend is running on port 5000
- Check if `proxy` in client/package.json is correct
- Verify firewall settings

### Can't place bids
**Error**: "Insufficient balance"
- Check your user balance in the navbar
- Make sure bid amount is less than your balance

### Password issues
**Error**: "Invalid credentials"
- Check if password is at least 6 characters
- Make sure you're using the correct email

## Production Deployment

For production deployment:

1. Set environment to production:
   ```env
   NODE_ENV=production
   ```

2. Build frontend:
   ```bash
   cd client
   npm run build
   ```

3. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server/server.js --name auction-api
   ```

4. Use a reverse proxy like Nginx

5. Set up SSL/TLS certificates

## Security Notes

The application implements:
- ✅ Password hashing (bcrypt)
- ✅ JWT authentication
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection (Helmet)
- ✅ Rate limiting
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ Secure headers

## Support

For issues or questions:
1. Check the [README.md](README.md)
2. Review [POSTGRESQL_INSTALL.md](POSTGRESQL_INSTALL.md)
3. Check console logs for errors
4. Verify all prerequisites are installed

## License

ISC
