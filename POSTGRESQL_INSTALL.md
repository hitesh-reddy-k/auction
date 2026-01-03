# PostgreSQL Installation Guide

## Windows Installation

### Step 1: Download PostgreSQL

1. Visit the official PostgreSQL download page: https://www.postgresql.org/download/windows/
2. Click on "Download the installer" link
3. Download the latest version (PostgreSQL 16.x recommended)

### Step 2: Run the Installer

1. Double-click the downloaded `.exe` file
2. Click "Next" on the welcome screen
3. Choose installation directory (default: `C:\Program Files\PostgreSQL\16`)
4. Select components to install:
   - ✅ PostgreSQL Server
   - ✅ pgAdmin 4 (GUI tool)
   - ✅ Stack Builder
   - ✅ Command Line Tools
5. Choose data directory (default: `C:\Program Files\PostgreSQL\16\data`)
6. **IMPORTANT**: Set a password for the database superuser (postgres)
   - Remember this password - you'll need it later!
   - Write it down or save it in a password manager
7. Set port number (default: 5432)
8. Set locale (default: your system locale)
9. Review the summary and click "Next"
10. Wait for installation to complete

### Step 3: Verify Installation

1. Open Command Prompt (Windows Key + R, type `cmd`, press Enter)
2. Type the following command:
   ```bash
   psql --version
   ```
3. You should see output like: `psql (PostgreSQL) 16.x`

### Step 4: Access PostgreSQL

#### Using Command Line:
```bash
# Login to PostgreSQL
psql -U postgres

# You'll be prompted for the password you set during installation
```

#### Using pgAdmin 4:
1. Open pgAdmin 4 from Start Menu
2. You may be asked to set a master password (for pgAdmin only)
3. In the left sidebar, expand "Servers"
4. Double-click "PostgreSQL 16"
5. Enter the password you set during installation

## Alternative: Using Docker (Optional)

If you prefer using Docker instead of installing PostgreSQL directly:

```bash
# Pull PostgreSQL image
docker pull postgres:16

# Run PostgreSQL container
docker run --name auction-postgres -e POSTGRES_PASSWORD=your_password -p 5432:5432 -d postgres:16

# Access PostgreSQL
docker exec -it auction-postgres psql -U postgres
```

## Creating the Database

### Option 1: Using Command Line

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE auction_db;

# List databases to verify
\l

# Exit
\q
```

### Option 2: Using pgAdmin 4

1. Open pgAdmin 4
2. Connect to PostgreSQL server
3. Right-click "Databases" in the left sidebar
4. Select "Create" > "Database"
5. Enter database name: `auction_db`
6. Click "Save"

## Common Issues and Solutions

### Issue 1: Command not found
**Solution**: Add PostgreSQL to your PATH environment variable:
1. Search for "Environment Variables" in Windows
2. Click "Edit the system environment variables"
3. Click "Environment Variables" button
4. Under "System variables", find "Path"
5. Click "Edit" and add: `C:\Program Files\PostgreSQL\16\bin`
6. Restart Command Prompt

### Issue 2: Connection refused
**Solution**: 
- Make sure PostgreSQL service is running:
  1. Press Windows Key + R
  2. Type `services.msc` and press Enter
  3. Find "postgresql-x64-16"
  4. If it's not running, right-click and select "Start"

### Issue 3: Password authentication failed
**Solution**: 
- Make sure you're using the correct password
- Try resetting the password:
  1. Open pgAdmin 4
  2. Right-click on PostgreSQL server
  3. Select "Properties" > "Connection"
  4. You can change the password there

## Testing the Connection

After installation, test your connection:

```bash
# Login
psql -U postgres -h localhost -p 5432

# If successful, you should see:
# postgres=#

# Test creating a database
CREATE DATABASE test_db;

# Drop the test database
DROP DATABASE test_db;

# Exit
\q
```

## Next Steps

After PostgreSQL is installed and running:
1. Go back to the main README.md
2. Follow the "Installation" section to set up the application
3. Configure your `.env` file with the database credentials
