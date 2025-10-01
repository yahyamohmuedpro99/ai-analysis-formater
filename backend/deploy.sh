#!/bin/bash

# Configuration
PROJECT_ID="kai-developer-test"
SERVICE_NAME="kai-backend"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Build and push Docker image
echo "Building Docker image..."
gcloud builds submit --tag ${IMAGE_NAME}

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --set-env-vars FIRESTORE_DATABASE_ID=yahya-database \
  --set-env-vars PROJECT_ID=${PROJECT_ID} \
  --set-secrets=OPENAI_API_KEY=openai-api-key:latest \
  --service-account=firebase-adminsdk-fbsvc@kai-developer-test.iam.gserviceaccount.com \
  --max-instances=10 \
  --memory=512Mi \
  --timeout=300

echo "Deployment complete!"
gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format='value(status.url)'