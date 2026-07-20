#!/bin/bash

echo "🎬 Starting CineRecap..."

# Start backend server
echo "Starting API server..."
node server/index.js &
SERVER_PID=$!

# Start frontend dev server  
echo "Starting frontend..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ CineRecap is running!"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for any process to exit
wait
