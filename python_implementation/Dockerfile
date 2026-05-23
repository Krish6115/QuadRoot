# Use official Python lightweight image
FROM python:3.11-slim

# Install system dependencies needed for compiling cryptography, psutil
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install python libraries
RUN pip install --no-cache-dir \
    cryptography \
    watchdog \
    psutil

# Copy scripts into the container
COPY defense.py /app/defense.py
COPY attacker.py /app/attacker.py

# Create sandbox folder
RUN mkdir -p /app/sandbox

# Default command to run
CMD ["python", "defense.py"]
