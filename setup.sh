#!/bin/bash
# Personalized Diet Recommendation System - Database Setup Script
# This script automates the database setup process

set -e  # Exit on error

echo "=========================================="
echo "Diet Recommendation System - Setup Script"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}MySQL is not installed or not in PATH${NC}"
    echo "Please install MySQL and try again."
    exit 1
fi

echo -e "${YELLOW}Please enter your MySQL connection details:${NC}"
echo ""

# Get MySQL credentials
read -p "MySQL Host [127.0.0.1]: " DB_HOST
DB_HOST=${DB_HOST:-127.0.0.1}

read -p "MySQL Port [3306]: " DB_PORT
DB_PORT=${DB_PORT:-3306}

read -p "MySQL Username [root]: " DB_USER
DB_USER=${DB_USER:-root}

read -sp "MySQL Password (empty if none): " DB_PASS
echo ""

read -p "Database Name [diet_system]: " DB_NAME
DB_NAME=${DB_NAME:-diet_system}

echo ""
echo -e "${YELLOW}Entered Configuration:${NC}"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  User: $DB_USER"
echo "  Database: $DB_NAME"
echo ""

read -p "Continue with setup? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 0
fi

echo ""
echo -e "${YELLOW}Creating database...${NC}"

# Create database
if [ -z "$DB_PASS" ]; then
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || {
        echo -e "${RED}Failed to create database. Check your credentials.${NC}"
        exit 1
    }
else
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || {
        echo -e "${RED}Failed to create database. Check your credentials.${NC}"
        exit 1
    }
fi

echo -e "${GREEN}✓ Database created${NC}"

echo ""
echo -e "${YELLOW}Importing schema...${NC}"

# Import schema
if [ -f "database_schema.sql" ]; then
    if [ -z "$DB_PASS" ]; then
        mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" "$DB_NAME" < database_schema.sql 2>/dev/null || {
            echo -e "${RED}Failed to import schema.${NC}"
            exit 1
        }
    else
        mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < database_schema.sql 2>/dev/null || {
            echo -e "${RED}Failed to import schema.${NC}"
            exit 1
        }
    fi
    echo -e "${GREEN}✓ Schema imported${NC}"
else
    echo -e "${RED}database_schema.sql not found in current directory${NC}"
    echo "Please run this script from the Diet_System directory"
    exit 1
fi

echo ""
echo -e "${YELLOW}Updating configuration...${NC}"

# Update config/db.php (if not already updated)
CONFIG_FILE="config/db.php"
if [ -f "$CONFIG_FILE" ]; then
    # Create backup
    cp "$CONFIG_FILE" "$CONFIG_FILE.backup"
    echo -e "${GREEN}✓ Created backup: $CONFIG_FILE.backup${NC}"
fi

echo ""
echo -e "${GREEN}=========================================="
echo "Setup Complete! ✓"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Update /config/db.php with your credentials if needed:"
echo "     DB_HOST = $DB_HOST"
echo "     DB_PORT = $DB_PORT"
echo "     DB_USER = $DB_USER"
echo "     DB_NAME = $DB_NAME"
echo ""
echo "  2. Start the development server:"
echo "     php -S localhost:8000"
echo ""
echo "  3. Test the API:"
echo "     curl -X POST http://localhost:8000/api/auth/register.php \\"
echo "       -H 'Content-Type: application/json' \\"
echo "       -d '{\"name\":\"Test\",\"email\":\"test@example.com\",\"password\":\"password123\",\"role\":\"user\"}'"
echo ""
echo "  4. Read the documentation:"
echo "     - API_DOCUMENTATION.md → Complete endpoint reference"
echo "     - BACKEND_SETUP_GUIDE.md → Detailed setup guide"
echo ""
