@echo off
echo Setting up environment variables...
copy env.local .env.local
echo Environment file created successfully!
echo.
echo Make sure your backend server is running on localhost:8000
echo Then run: npm run dev
pause 