#!/bin/bash

# Deployment Script for PsycheStore
# This script helps you deploy to different platforms

set -e

echo "🚀 PsycheStore Deployment Helper"
echo "================================="
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Display menu
echo "Select deployment platform:"
echo "1) Vercel (Recommended for Next.js)"
echo "2) Railway"
echo "3) Netlify"
echo "4) Render"
echo "5) Check Prerequisites"
echo "6) Validate Environment Variables"
echo "7) Exit"
echo ""
read -p "Enter your choice (1-7): " choice

case $choice in
    1)
        echo -e "${BLUE}Deploying to Vercel...${NC}"

        if ! command_exists vercel; then
            echo -e "${YELLOW}Vercel CLI not found. Installing...${NC}"
            npm install -g vercel
        fi

        echo -e "${GREEN}Running Vercel deployment...${NC}"
        vercel

        echo -e "${GREEN}✅ Deployment initiated!${NC}"
        echo -e "${YELLOW}Don't forget to set environment variables in Vercel dashboard${NC}"
        ;;

    2)
        echo -e "${BLUE}Deploying to Railway...${NC}"

        if ! command_exists railway; then
            echo -e "${YELLOW}Railway CLI not found. Installing...${NC}"
            npm install -g @railway/cli
        fi

        echo -e "${GREEN}Logging into Railway...${NC}"
        railway login

        echo -e "${GREEN}Initializing project...${NC}"
        railway init

        echo -e "${GREEN}Deploying...${NC}"
        railway up

        echo -e "${GREEN}✅ Deployment complete!${NC}"
        echo -e "${YELLOW}Set environment variables with: railway variables set KEY=VALUE${NC}"
        ;;

    3)
        echo -e "${BLUE}Deploying to Netlify...${NC}"

        if ! command_exists netlify; then
            echo -e "${YELLOW}Netlify CLI not found. Installing...${NC}"
            npm install -g netlify-cli
        fi

        echo -e "${GREEN}Building application...${NC}"
        npm run build

        echo -e "${GREEN}Deploying to Netlify...${NC}"
        netlify deploy --prod

        echo -e "${GREEN}✅ Deployment complete!${NC}"
        echo -e "${YELLOW}Configure environment variables in Netlify dashboard${NC}"
        ;;

    4)
        echo -e "${BLUE}Deploying to Render...${NC}"
        echo -e "${YELLOW}Render doesn't have a CLI for web services.${NC}"
        echo -e "${GREEN}Please follow these steps:${NC}"
        echo "1. Go to https://render.com"
        echo "2. Create a new Web Service"
        echo "3. Connect your GitHub repository"
        echo "4. Render will detect render.yaml automatically"
        echo "5. Set environment variables in the dashboard"
        echo ""
        echo -e "${BLUE}Opening Render dashboard...${NC}"

        if command_exists xdg-open; then
            xdg-open "https://render.com" 2>/dev/null
        elif command_exists open; then
            open "https://render.com"
        else
            echo "Please visit: https://render.com"
        fi
        ;;

    5)
        echo -e "${BLUE}Checking Prerequisites...${NC}"
        echo ""

        # Check Node version
        if command_exists node; then
            NODE_VERSION=$(node -v)
            echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"
        else
            echo -e "${RED}❌ Node.js not found${NC}"
        fi

        # Check npm
        if command_exists npm; then
            NPM_VERSION=$(npm -v)
            echo -e "${GREEN}✅ npm: $NPM_VERSION${NC}"
        else
            echo -e "${RED}❌ npm not found${NC}"
        fi

        # Check git
        if command_exists git; then
            GIT_VERSION=$(git --version)
            echo -e "${GREEN}✅ Git: $GIT_VERSION${NC}"
        else
            echo -e "${RED}❌ Git not found${NC}"
        fi

        # Check if .env exists
        if [ -f .env ]; then
            echo -e "${GREEN}✅ .env file exists${NC}"
        else
            echo -e "${YELLOW}⚠️  .env file not found. Copy from .env.example${NC}"
        fi

        # Check if dependencies are installed
        if [ -d "node_modules" ]; then
            echo -e "${GREEN}✅ Dependencies installed${NC}"
        else
            echo -e "${YELLOW}⚠️  Dependencies not installed. Run: npm install${NC}"
        fi

        # Check if build works
        echo ""
        echo -e "${BLUE}Testing build...${NC}"
        if npm run build; then
            echo -e "${GREEN}✅ Build successful${NC}"
        else
            echo -e "${RED}❌ Build failed. Fix errors before deploying${NC}"
        fi
        ;;

    6)
        echo -e "${BLUE}Validating Environment Variables...${NC}"
        echo ""

        # Check required env vars
        REQUIRED_VARS=(
            "NEXT_PUBLIC_SUPABASE_URL"
            "NEXT_PUBLIC_SUPABASE_ANON_KEY"
            "SUPABASE_SERVICE_ROLE_KEY"
            "GOOGLE_SHEETS_WEBHOOK_URL"
            "ADMIN_SESSION_SECRET"
            "NEXT_PUBLIC_APP_URL"
        )

        if [ ! -f .env ]; then
            echo -e "${RED}❌ .env file not found${NC}"
            echo -e "${YELLOW}Copy .env.example to .env and fill in the values${NC}"
            exit 1
        fi

        source .env 2>/dev/null || true

        ALL_SET=true
        for var in "${REQUIRED_VARS[@]}"; do
            if [ -z "${!var}" ]; then
                echo -e "${RED}❌ $var not set${NC}"
                ALL_SET=false
            else
                echo -e "${GREEN}✅ $var is set${NC}"
            fi
        done

        if [ "$ALL_SET" = true ]; then
            echo ""
            echo -e "${GREEN}✅ All environment variables are configured!${NC}"
        else
            echo ""
            echo -e "${YELLOW}⚠️  Some environment variables are missing${NC}"
            echo "Please update your .env file before deploying"
        fi
        ;;

    7)
        echo -e "${GREEN}Goodbye!${NC}"
        exit 0
        ;;

    *)
        echo -e "${RED}Invalid choice. Please run the script again.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}For detailed instructions, see DEPLOYMENT.md${NC}"
echo -e "${GREEN}===========================================${NC}"
