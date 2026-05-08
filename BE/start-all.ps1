$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Starting all microservices..." -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\IdentityService'; dotnet run"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\PostService'; dotnet run"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\MediaService'; dotnet run"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\NotificationService'; dotnet run"

Write-Host "Waiting for services..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\ApiGateway'; dotnet run"

Write-Host ""
Write-Host "All services starting:" -ForegroundColor Green
Write-Host "  IdentityService      -> http://localhost:5001"
Write-Host "  PostService          -> http://localhost:5002"
Write-Host "  MediaService         -> http://localhost:5003"
Write-Host "  NotificationService  -> http://localhost:5004"
Write-Host "  ApiGateway           -> http://localhost:5000"
Write-Host ""
Write-Host "Frontend: http://localhost:3001" -ForegroundColor Green
