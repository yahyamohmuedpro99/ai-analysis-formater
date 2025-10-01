# AI Text Analysis Formatter

An asynchronous web application that allows users to submit text for AI-powered analysis. The application uses OpenAI to generate structured analysis results including summaries, sentiment analysis, and keyword extraction.

## Project Structure

```
.
├── backend/
│   ├── main.py              # FastAPI application
│   ├── models.py            # Pydantic models
│   ├── firebase_admin_config.py  # Firebase initialization
│   ├── openai_service.py    # OpenAI integration
│   ├── auth.py              # Firebase auth verification
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile           # Container configuration
│   └── deploy.sh            # Deployment script for Cloud Run
├── frontend/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components
│   ├── lib/                 # Utility functions and Firebase config
│   ├── package.json         # Frontend dependencies
│   ├── tsconfig.json        # TypeScript configuration
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   ├── postcss.config.js    # PostCSS configuration
│   ├── firebase.json        # Firebase Hosting config
│   └── deploy.sh            # Deployment script for Firebase Hosting
└── README.md
```

## Technology Stack

- **Frontend**: Next.js 14+ with TypeScript and Tailwind CSS
- **Backend**: FastAPI with Python 3.11+
- **Database**: Firestore (custom database)
- **Authentication**: Firebase Authentication
- **AI**: OpenAI API with structured output
- **Deployment**: Cloud Run (backend) + Firebase Hosting (frontend)

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+
- Python 3.11+
- Docker
- Firebase CLI
- Google Cloud SDK

## Environment Variables

### Backend (.env file)
```bash
OPENAI_API_KEY=your_openai_api_key
FIRESTORE_DATABASE_ID=your_database_name
```

### Frontend (.env.local file)
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_API_BASE_URL=your_backend_url
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file with your environment variables

5. Place your `serviceAccountKey.json` file in the backend directory

6. Run the development server:
   ```bash
   python main.py
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your environment variables

4. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment

### Backend Deployment (Cloud Run)

1. Make sure you have the Google Cloud SDK installed and authenticated
2. Set the required environment variables:
   ```bash
   export GOOGLE_CLOUD_PROJECT=your_project_id
   export SERVICE_ACCOUNT=your_service_account
   export FIRESTORE_DATABASE_ID=your_database_name
   ```
3. Run the deployment script:
   ```bash
   ./deploy.sh
   ```

### Frontend Deployment (Firebase Hosting)

1. Make sure you have the Firebase CLI installed and authenticated
2. Set the required environment variable:
   ```bash
   export FIREBASE_PROJECT=your_firebase_project_id
   ```
3. Run the deployment script:
   ```bash
   ./deploy.sh
   ```

## API Endpoints

### Backend API

- `POST /api/analyze` - Submit text for analysis (protected)
- `GET /api/jobs/{user_id}` - Get all user's jobs (protected)
- `GET /health` - Health check endpoint

## Data Structure

### Firestore Collection: "jobs"

```javascript
{
  "userId": string,
  "text": string,
  "status": "pending" | "completed" | "failed",
  "createdAt": timestamp,
  "completedAt": timestamp (optional),
  "result": {
    "summary": string,
    "sentiment": string,
    "keywords": array
  } (optional)
}
```

## Development Notes

- The backend uses FastAPI BackgroundTasks to process OpenAI calls asynchronously
- Firebase Authentication is used to protect endpoints
- The frontend uses real-time listeners to update job statuses
- Tailwind CSS is used for styling with a clean, responsive design

## Security Considerations

- All secrets are stored in environment variables
- Firebase Authentication tokens are verified on protected endpoints
- Input validation is performed on all user-submitted data
- CORS is configured for secure cross-origin requests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License.