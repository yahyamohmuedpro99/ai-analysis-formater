# Dockerfile (recommended - no service account key copied into image)
FROM python:3.11-slim

# Create non-root user
RUN useradd --create-home appuser
WORKDIR /app

# Install system deps and Python deps
COPY requirements.txt .
RUN apt-get update \
  && apt-get install -y --no-install-recommends gcc libpq-dev \
  && pip install --no-cache-dir -r requirements.txt \
  && apt-get remove -y gcc \
  && apt-get autoremove -y \
  && rm -rf /var/lib/apt/lists/*

# Copy app code
COPY . .

USER appuser

ENV PORT=8000
EXPOSE 8000

CMD ["gunicorn", "--bind", ":8000", "--workers", "1", \
     "--worker-class", "uvicorn.workers.UvicornWorker", \
     "--threads", "8", "--timeout", "0", "main:app"]
