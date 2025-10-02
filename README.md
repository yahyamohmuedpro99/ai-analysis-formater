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

### Quick Deploy (All-in-One)

Deploy both backend and frontend with a single command:

#### Windows (PowerShell):
```powershell
# Set your OpenAI API key
$env:OPENAI_API_KEY = "your-openai-api-key-here"

# Run deployment
.\deploy_all.ps1
```

#### Linux/Mac (Bash):
```bash
# Set your OpenAI API key
export OPENAI_API_KEY="your-openai-api-key-here"

# Make script executable
chmod +x deploy_all.sh

# Run deployment
./deploy_all.sh
```

The script will:
1. ✅ Build and deploy backend to Cloud Run
2. ✅ Capture the backend URL automatically
3. ✅ Update frontend `.env.local` with the backend URL
4. ✅ Build and deploy frontend to Firebase Hosting

---

### Manual Deployment

#### Backend Deployment (Cloud Run)

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Set environment variable:
   ```powershell
   # Windows PowerShell
   $env:OPENAI_API_KEY = "your-api-key"

   # Linux/Mac
   export OPENAI_API_KEY="your-api-key"
   ```

3. Run deployment:
   ```powershell
   # Windows
   .\deploy.ps1

   # Linux/Mac
   chmod +x deploy.sh && ./deploy.sh
   ```

#### Frontend Deployment (Firebase Hosting)

1. Update `.env.local` with your backend URL:
   ```bash
   NEXT_PUBLIC_API_URL=https://your-backend-url.run.app
   ```

2. Build and deploy:
   ```bash
   cd frontend
   npm install
   npm run build
   firebase deploy --only hosting
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

## Design Decisions & Trade-offs

### Architecture Decisions
1. **Async Processing with BackgroundTasks**: Chose FastAPI's `BackgroundTasks` over Cloud Tasks/Pub-Sub for simplicity. The job immediately returns a jobId while processing happens asynchronously.

2. **Firestore Over SQL**: Used Firestore for seamless Firebase integration and real-time capabilities, avoiding additional database setup.

3. **Enhanced Response Format**: Extended the required OpenAI response to include sentiment scores (positiveScore, neutralScore, negativeScore) for better UX visualization with progress bars.

4. **Client-Side Polling**: Used manual refresh buttons instead of WebSockets/real-time listeners to keep the architecture simple and avoid additional infrastructure.

5. **Docker + Cloud Run**: Containerized the FastAPI app for consistent deployments and easy scaling on Cloud Run.

### Trade-offs
- **No Real-Time Updates**: Users must manually refresh to see completed jobs (simplicity over real-time)
- **In-Memory Job Queue**: Using BackgroundTasks means jobs are lost if the container restarts (acceptable for demo, would use Cloud Tasks in production)
- **Service Account in Container**: Bundled service account key in Docker image for simplicity (would use Workload Identity in production)

## Project Timeline & Development Approach

### Total Time: ~8-10 hours

#### Time Breakdown:
1. **Initial Setup (1.5 hours)**
   - Created Next.js frontend with TypeScript
   - Setup FastAPI backend structure
   - Configured Firebase Auth & Firestore
   - Docker configuration

2. **Backend Development (2.5 hours)**
   - Implemented protected API endpoints
   - OpenAI structured output integration
   - Background job processing with error handling
   - Firebase Admin SDK setup

3. **Frontend Development (3 hours)**
   - Authentication flow (login/signup)
   - Dashboard with text submission
   - Job list with status indicators
   - Results display with sentiment visualization
   - Responsive UI with Tailwind & shadcn/ui

4. **Deployment & DevOps (1.5 hours)**
   - Cloud Run deployment with environment variables
   - Firebase Hosting setup
   - CORS configuration
   - Deployment scripts

5. **Bug Fixes & Polish (1.5 hours)**
   - Fixed httpx/OpenAI compatibility issues
   - Environment variable debugging
   - UI/UX improvements
   - Documentation

## AI Assistant Usage

**Extensive use of Claude AI (Claude Code) throughout development:**

### How AI Was Used:
1. **Code Generation (~40%)**
   - Boilerplate for FastAPI routes and Pydantic models
   - React components and TypeScript interfaces
   - Docker and deployment scripts

2. **Debugging & Problem Solving (~30%)**
   - Resolved OpenAI/httpx version compatibility issues
   - Fixed CORS and authentication problems
   - Cloud Run deployment errors

3. **Best Practices & Architecture (~20%)**
   - Suggested BackgroundTasks for async processing
   - Recommended error handling patterns
   - Security considerations (token verification, input validation)

4. **Documentation (~10%)**
   - README structure and content
   - Code comments and inline documentation

### AI Workflow:
- **Iterative Development**: Used AI to generate initial code, then refined based on testing
- **Error Resolution**: Copied error logs to AI for quick diagnosis and solutions
- **Code Review**: Asked AI to review code for security issues and improvements
- **Learning**: Used AI to understand Next.js 14 App Router patterns (new to me)

**Key Insight**: AI accelerated development by ~3-4x, especially for boilerplate, debugging, and learning new patterns. However, critical thinking and manual testing were essential for production-ready code.

## Live Deployment

- **Frontend**: https://kai-developer-test.web.app
- **Backend API**: https://kai-backend-eh4pzlsddq-uc.a.run.app

## License

This project is licensed under the MIT License.