#!/bin/bash

echo "Starting Church Media QC with Ollama..."

# Check if ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "Ollama is not installed. Please install from https://ollama.ai"
    exit 1
fi

# Check if llava model exists
if ! ollama list | grep -q "llava"; then
    echo "Pulling llava model..."
    ollama pull llava
fi

# Start Ollama in background
echo "Starting Ollama server..."
ollama serve &
OLLAMA_PID=$!

# Wait for Ollama to start
sleep 3

# Start the Next.js app
echo "Starting Church Media QC..."
npm run dev

# Kill Ollama when app stops
trap "kill $OLLAMA_PID" EXIT