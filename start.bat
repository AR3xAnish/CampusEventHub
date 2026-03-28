@echo off
echo Starting Campus EventHub...

echo Starting Backend Server on port 5000...
start cmd /k "cd backend && npm run dev"

echo Starting Frontend Server on port 5173...
start cmd /k "npm run dev"

echo Campus EventHub started! Both terminal windows should now be open.
