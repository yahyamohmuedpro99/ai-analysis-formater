# Deploy All Script - Automates backend and frontend deployment
# This script deploys the backend to Cloud Run, captures the URL,
# updates the frontend environment, and deploys the frontend to Firebase

Write-Host "=== Starting Full Deployment Process ===" -ForegroundColor Green

# Configuration
$PROJECT_ID = "kai-developer-test"
$SERVICE_NAME = "kai-backend"
$REGION = "us-central1"
$IMAGE_NAME = "gcr.io/$PROJECT_ID/$SERVICE_NAME"
$FRONTEND_DIR = "frontend"

# Step 1: Deploy Backend
Write-Host "`n=== Step 1: Deploying Backend ===" -ForegroundColor Yellow

# Change to backend directory for deployment
Push-Location "backend"

try {
    # Load OPENAI_API_KEY from .env file
    Write-Host "Loading environment variables from .env file..." -ForegroundColor Cyan

    if (Test-Path ".env") {
        Get-Content ".env" | ForEach-Object {
            if ($_ -match '^([^=]+)=(.*)$') {
                $key = $matches[1].Trim()
                $value = $matches[2].Trim()

                # Remove quotes if present
                $value = $value -replace '^["' + "'" + ']|["' + "'" + ']$', ''

                if ($key -eq "OPENAI_API_KEY") {
                    $env:OPENAI_API_KEY = $value
                    Write-Host "Loaded OPENAI_API_KEY from .env" -ForegroundColor Green
                }
            }
        }
    } else {
        Write-Host "WARNING: .env file not found in backend directory" -ForegroundColor Yellow
    }

    # Check if OPENAI_API_KEY is set (from .env or environment)
    if (-not $env:OPENAI_API_KEY) {
        Write-Host "ERROR: OPENAI_API_KEY not found!" -ForegroundColor Red
        Write-Host "Please create backend/.env file with:" -ForegroundColor Yellow
        Write-Host "  OPENAI_API_KEY=your-api-key-here" -ForegroundColor Yellow
        Write-Host "OR set it manually:" -ForegroundColor Yellow
        Write-Host '  $env:OPENAI_API_KEY = "your-api-key-here"' -ForegroundColor Yellow
        exit 1
    }

    Write-Host "Building Docker image..." -ForegroundColor Cyan
    gcloud builds submit --tag $IMAGE_NAME

    Write-Host "Deploying to Cloud Run..." -ForegroundColor Cyan

    gcloud run deploy $SERVICE_NAME `
      --image $IMAGE_NAME `
      --platform managed `
      --region $REGION `
      --allow-unauthenticated `
      --set-env-vars FIRESTORE_DATABASE_ID=yahya-database `
      --set-env-vars PROJECT_ID=$PROJECT_ID `
      --set-env-vars OPENAI_API_KEY=$env:OPENAI_API_KEY `
      --service-account=firebase-adminsdk-fbsvc@kai-developer-test.iam.gserviceaccount.com `
      --max-instances=10 `
      --memory=512Mi `
      --timeout=300

    # Capture the backend URL
    Write-Host "Getting backend service URL..." -ForegroundColor Cyan
    $BACKEND_URL = gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.url)"
    Write-Host "Backend deployed at: $BACKEND_URL" -ForegroundColor Green

} finally {
    # Return to root directory
    Pop-Location
}

# Step 2: Update Frontend Environment
Write-Host "`n=== Step 2: Updating Frontend Environment ===" -ForegroundColor Yellow
$ENV_FILE = "$FRONTEND_DIR\.env.local"

if (Test-Path $ENV_FILE) {
    Write-Host "Updating $ENV_FILE with backend URL..." -ForegroundColor Cyan

    # Read the current content
    $content = Get-Content $ENV_FILE -Raw

    # Replace the commented line with uncommented version
    $updatedContent = $content -replace '# NEXT_PUBLIC_API_URL=https://kai-backend-eh4pzlsddq-uc.a.run.app', "NEXT_PUBLIC_API_URL=$BACKEND_URL"

    # If the replacement didn't work (maybe the URL is different), add it
    if ($updatedContent -eq $content) {
        # Check if NEXT_PUBLIC_API_URL already exists uncommented
        if ($content -match 'NEXT_PUBLIC_API_URL=') {
            $updatedContent = $content -replace 'NEXT_PUBLIC_API_URL=.*', "NEXT_PUBLIC_API_URL=$BACKEND_URL"
        } else {
            # Add it at the end
            $updatedContent = $content + "`nNEXT_PUBLIC_API_URL=$BACKEND_URL"
        }
    }

    # Write back to file
    $updatedContent | Set-Content $ENV_FILE -NoNewline
    Write-Host "Frontend environment updated successfully" -ForegroundColor Green
} else {
    Write-Host "Warning: $ENV_FILE not found, creating it..." -ForegroundColor Yellow
    "NEXT_PUBLIC_API_URL=$BACKEND_URL" | Set-Content $ENV_FILE
}

# Step 3: Deploy Frontend
Write-Host "`n=== Step 3: Deploying Frontend ===" -ForegroundColor Yellow

# Change to frontend directory
Push-Location $FRONTEND_DIR

try {
    # Install dependencies
    Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
    npm install

    # Build the application
    Write-Host "Building Next.js application..." -ForegroundColor Cyan
    npm run build

    # Deploy to Firebase
    Write-Host "Deploying to Firebase Hosting..." -ForegroundColor Cyan
    firebase use $PROJECT_ID
    firebase deploy --only hosting

    Write-Host "`n=== Deployment Complete! ===" -ForegroundColor Green
    Write-Host "Backend URL: $BACKEND_URL" -ForegroundColor White
    Write-Host "Frontend deployed to Firebase Hosting" -ForegroundColor White

} finally {
    # Always return to original directory
    Pop-Location
}

Write-Host ""
Write-Host "All deployments completed successfully!" -ForegroundColor Green
