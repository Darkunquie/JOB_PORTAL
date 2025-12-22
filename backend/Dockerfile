FROM python:3.11-slim

# --------------------------------------------------
# Environment variables
# --------------------------------------------------
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# --------------------------------------------------
# System dependencies
# --------------------------------------------------
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# --------------------------------------------------
# Create non-root user
# --------------------------------------------------
RUN groupadd -r appuser && useradd -r -g appuser appuser

# --------------------------------------------------
# Set working directory
# --------------------------------------------------
WORKDIR /app

# --------------------------------------------------
# Install Python dependencies
# --------------------------------------------------
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# --------------------------------------------------
# Copy application code
# --------------------------------------------------
COPY app ./app
COPY alembic ./alembic
COPY alembic.ini .

COPY init_db.py .
COPY create_user.py .
COPY seed_data.py .
COPY production_setup.py .

# --------------------------------------------------
# Uploads directory
# --------------------------------------------------
RUN mkdir -p /app/uploads && chown -R appuser:appuser /app

# --------------------------------------------------
# Switch to non-root user
# --------------------------------------------------
USER appuser

# --------------------------------------------------
# Expose port
# --------------------------------------------------
EXPOSE 8000

# --------------------------------------------------
# Run application (Gunicorn + Uvicorn workers)
# --------------------------------------------------
CMD gunicorn app.main:app \
  -k uvicorn.workers.UvicornWorker \
  --workers 2 \
  --bind 0.0.0.0:8000 \
  --timeout 90 \
  --graceful-timeout 30 \
  --keep-alive 5 \
  --max-requests 1000 \
  --max-requests-jitter 100 \
  --log-level info

