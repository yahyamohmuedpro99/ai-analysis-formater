#!/bin/bash
# Deploy All Script - Automates backend and frontend deployment
# This script deploys the backend to Cloud Run, captures the URL,
# updates the frontend environment, and deploys the frontend to Firebase

set -e  # Exit on any error

echo "=== Starting Full Deployment Process ==="

# Configuration
PROJECT_ID="kai-developer-test"
SERVICE_NAME="kai-backend"
REGION="us-central1"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"
FRONTEND_DIR="frontend"

# Step 1: Deploy Backend
echo ""
echo "=== Step 1: Deploying Backend ==="

cd backend

# Load OPENAI_API_KEY from .env file
echo "Loading environment variables from .env file..."

if [ -f ".env" ]; then
    # Load .env file and export OPENAI_API_KEY
    export $(grep -v '^#' .env | grep OPENAI_API_KEY | xargs)
    
    if [ -n "$OPENAI_API_KEY" ]; then
        echo "✓ Loaded OPENAI_API_KEY from .env"
    fi
else
    echo "WARNING: .env file not found in backend directory"
fi

# Check if OPENAI_API_KEY is set (from .env or environment)
if [ -z "$OPENAI_API_KEY" ]; then
    echo "ERROR: OPENAI_API_KEY not found!"
    echo "Please create backend/.env file with:"
    echo "  OPENAI_API_KEY=your-api-key-here"
    echo "OR set it manually:"
    echo "  export OPENAI_API_KEY='your-api-key-here'"
    exit 1
fi

echo "Building Docker image..."
gcloud builds submit --tag $IMAGE_NAME

echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars FIRESTORE_DATABASE_ID=yahya-database \
  --set-env-vars PROJECT_ID=$PROJECT_ID \
  --set-env-vars OPENAI_API_KEY=$OPENAI_API_KEY \
  --service-account=firebase-adminsdk-fbsvc@kai-developer-test.iam.gserviceaccount.com \
  --max-instances=10 \
  --memory=512Mi \
  --timeout=300

# Capture the backend URL
echo "Getting backend service URL..."
BACKEND_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.url)")
echo "Backend deployed at: $BACKEND_URL"

cd ..

# Step 2: Update Frontend Environment
echo ""
echo "=== Step 2: Updating Frontend Environment ==="
ENV_FILE="$FRONTEND_DIR/.env.local"

if [ -f "$ENV_FILE" ]; then
    echo "Updating $ENV_FILE with backend URL..."
    
    # Update or add NEXT_PUBLIC_API_URL
    if grep -q "NEXT_PUBLIC_API_URL=" "$ENV_FILE"; then
        # Replace existing line (macOS/Linux compatible)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=$BACKEND_URL|" "$ENV_FILE"
        else
            sed -i "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=$BACKEND_URL|" "$ENV_FILE"
        fi
    else
        # Add new line
        echo "NEXT_PUBLIC_API_URL=$BACKEND_URL" >> "$ENV_FILE"
    fi
    
    echo "Frontend environment updated successfully"
else
    echo "Warning: $ENV_FILE not found, creating it..."
    echo "NEXT_PUBLIC_API_URL=$BACKEND_URL" > "$ENV_FILE"
fi

# Step 3: Deploy Frontend
echo ""
echo "=== Step 3: Deploying Frontend ==="

cd $FRONTEND_DIR

# Install dependencies
echo "Installing frontend dependencies..."
npm install

# Build the application
echo "Building Next.js application..."
npm run build

# Deploy to Firebase
echo "Deploying to Firebase Hosting..."
firebase use $PROJECT_ID
firebase deploy --only hosting

cd ..

echo ""
echo "=== Deployment Complete! ==="
echo "Backend URL: $BACKEND_URL"
echo "Frontend deployed to Firebase Hosting"
echo ""
echo "All deployments completed successfully!"
