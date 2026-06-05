#!/bin/bash

# Diet System Admin Dashboard - Setup Script
# This script automates the setup process

echo "🚀 Diet System Admin Dashboard Setup"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Navigate to admin-dashboard directory
cd "$(dirname "$0")" || exit 1

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start dev server: npm run dev"
echo "2. Open browser: http://localhost:5173"
echo "3. Configure API endpoint in vite.config.js"
echo ""
echo "📚 Documentation:"
echo "- Quick Start: cat QUICKSTART.md"
echo "- Full Docs: cat README.md"
echo "- Project Structure: cat PROJECT_STRUCTURE.md"
echo ""
echo "Happy coding! 🚀"
