FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Copy service account key
COPY serviceAccountKey.json .

# Set environment variables
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/serviceAccountKey.json
ENV PORT=8000

# Expose port for Cloud Run
EXPOSE 8000

# Run with Gunicorn
CMD exec gunicorn --bind :$PORT --workers 1 --worker-class uvicorn.workers.UvicornWorker --threads 8 --timeout 0 main:app