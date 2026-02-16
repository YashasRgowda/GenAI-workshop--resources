# ============================================
# Stage 1: Base Python image
# ============================================
FROM python:3.11-slim

# ============================================
# Set working directory inside container
# ============================================
WORKDIR /app

# ============================================
# Install system dependencies
# (needed for psycopg2, faiss, etc.)
# ============================================
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# ============================================
# Copy requirements first (Docker caches this layer)
# So if code changes but requirements don't,
# it won't reinstall everything
# ============================================
COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ============================================
# Copy entire backend code
# ============================================
COPY . .

# ============================================
# Create data directories
# ============================================
RUN mkdir -p data/faiss_index data/documents

# ============================================
# Expose port 8000 (FastAPI default)
# ============================================
EXPOSE 8000

# ============================================
# Start the server
# ============================================
CMD ["sh", "-c", "python init_db.py && uvicorn app.main:app --host 0.0.0.0 --port 8000"]