# Deploy.ps1

# Ensure we're in the backend directory
Push-Location $PSScriptRoot

# Check if serviceAccountKey.json exists
if (-not (Test-Path "serviceAccountKey.json")) {
    Write-Host "ERROR: serviceAccountKey.json not found in backend directory!" -ForegroundColor Red
    Write-Host "Please download your Firebase service account key from the Firebase Console" -ForegroundColor Yellow
    Write-Host "and save it as 'serviceAccountKey.json' in the backend directory." -ForegroundColor Yellow
    Pop-Location
    exit 1
}

# Load OPENAI_API_KEY from .env file
Write-Host "Loading environment variables from .env file..." -ForegroundColor Cyan

if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            $value = $value -replace '^["' + "'" + ']|["' + "'" + ']$', ''
            if ($key -eq "OPENAI_API_KEY") {
                $env:OPENAI_API_KEY = $value
                Write-Host "Loaded OPENAI_API_KEY from .env" -ForegroundColor Green
            }
        }
    }
}

if (-not $env:OPENAI_API_KEY) {
    Write-Host "ERROR: OPENAI_API_KEY not found!" -ForegroundColor Red
    Write-Host "Please create backend/.env file with:" -ForegroundColor Yellow
    Write-Host "  OPENAI_API_KEY=your-api-key-here" -ForegroundColor Yellow
    Pop-Location
    exit 1
}

# Configuration
$PROJECT_ID = "kai-developer-test"
$SERVICE_NAME = "kai-backend"
$REGION = "us-central1"
$IMAGE_NAME = "gcr.io/$PROJECT_ID/$SERVICE_NAME"

# Build and push Docker image
Write-Host "Building Docker image..."
gcloud builds submit --tag $IMAGE_NAME

# Deploy to Cloud Run - REMOVE SECRET, USE ENV VAR
Write-Host "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME `
  --image $IMAGE_NAME `
  --platform managed `
  --region $REGION `
  --allow-unauthenticated `
  --clear-secrets `
  --set-env-vars "FIRESTORE_DATABASE_ID=yahya-database,PROJECT_ID=$PROJECT_ID,OPENAI_API_KEY=$env:OPENAI_API_KEY" `
  --service-account=firebase-adminsdk-fbsvc@kai-developer-test.iam.gserviceaccount.com `
  --max-instances=10 `
  --memory=512Mi `
  --timeout=300

Write-Host "Deployment complete!"

# Get service URL
gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.url)"

# Return to original directory
Pop-Location
