#!/bin/bash

# Exit on any error
set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting backend deployment to Cloud Run...${NC}"

# Check if required environment variables are set
if [[ -z "$GOOGLE_CLOUD_PROJECT" ]]; then
    echo -e "${RED}Error: GOOGLE_CLOUD_PROJECT environment variable is not set${NC}"
    exit 1
fi

if [[ -z "$SERVICE_ACCOUNT" ]]; then
    echo -e "${RED}Error: SERVICE_ACCOUNT environment variable is not set${NC}"
    exit 1
fi

# Set variables
SERVICE_NAME="ai-analysis-backend"
REGION="us-central1"

echo -e "${YELLOW}Building Docker image...${NC}"
# Build the Docker image
docker build -t gcr.io/$GOOGLE_CLOUD_PROJECT/$SERVICE_NAME .

echo -e "${YELLOW}Pushing Docker image to Google Container Registry...${NC}"
# Push the Docker image to Google Container Registry
docker push gcr.io/$GOOGLE_CLOUD_PROJECT/$SERVICE_NAME

echo -e "${YELLOW}Deploying to Cloud Run...${NC}"
# Deploy to Cloud Run
gcloud run deploy $SERVICE_NAME \
    --image gcr.io/$GOOGLE_CLOUD_PROJECT/$SERVICE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --service-account $SERVICE_ACCOUNT \
    --port 8000 \
    --set-env-vars FIRESTORE_DATABASE_ID=${FIRESTORE_DATABASE_ID:-"default"}

echo -e "${GREEN}Deployment completed successfully!${NC}"