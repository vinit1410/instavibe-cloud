# Startup Script for InstaVibe Microservices
Write-Host "Starting IdentityService..." -ForegroundColor Cyan
Start-Process dotnet "run --project `"d:\Vinit project\BE\IdentityService\IdentityService.csproj`"" -NoNewWindow

Write-Host "Starting PostService..." -ForegroundColor Cyan
Start-Process dotnet "run --project `"d:\Vinit project\BE\PostService\PostService.csproj`"" -NoNewWindow

Write-Host "Waiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -s 10

Write-Host "Starting ApiGateway..." -ForegroundColor Cyan
Start-Process dotnet "run --project `"d:\Vinit project\BE\ApiGateway\ApiGateway.csproj`"" -NoNewWindow

Write-Host "All backend services are starting. ApiGateway is on http://localhost:5000" -ForegroundColor Green
Write-Host "Vite Frontend is on http://localhost:3004" -ForegroundColor Green
