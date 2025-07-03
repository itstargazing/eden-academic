# PowerShell deployment script

Write-Host "Starting deployment process..." -ForegroundColor Yellow

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "Error: package.json not found. Make sure you're in the project root." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

# Run tests if they exist
if (Select-String -Path "package.json" -Pattern '"test"') {
    Write-Host "Running tests..." -ForegroundColor Yellow
    npm test
}

# Build the application
Write-Host "Building the application..." -ForegroundColor Yellow
npm run build

# Deploy to Vercel
Write-Host "Deploying to Vercel..." -ForegroundColor Yellow
vercel --prod

Write-Host "Deployment complete!" -ForegroundColor Green 