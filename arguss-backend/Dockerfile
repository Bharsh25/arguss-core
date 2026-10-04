FROM python:3.12-slim

# dlib needs a real C++ compiler + cmake to build from source on Linux
# (same reason you needed Visual Studio Build Tools locally on Windows)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Render/Railway inject $PORT at runtime — bind to it, not a hardcoded port
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
