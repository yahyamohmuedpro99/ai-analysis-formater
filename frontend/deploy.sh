#!/bin/bash

# Exit on any error
set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting frontend deployment to Firebase Hosting...${NC}"

# Check if Firebase project is set
if [[ -z "$FIREBASE_PROJECT" ]]; then
    echo -e "${RED}Error: FIREBASE_PROJECT environment variable is not set${NC}"
    exit 1
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

# Build the Next.js application
echo -e "${YELLOW}Building Next.js application...${NC}"
npm run build

# Deploy to Firebase Hosting
echo -e "${YELLOW}Deploying to Firebase Hosting...${NC}"
firebase use $FIREBASE_PROJECT
firebase deploy --only hosting

echo -e "${GREEN}Frontend deployment completed successfully!${NC}"