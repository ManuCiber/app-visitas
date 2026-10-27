# Script para ejecutar el frontend React + TypeScript + Tailwind
$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Iniciando Frontend MediCare (React + Vite)" -ForegroundColor Cyan
Write-Host "URL: http://localhost:5173" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

Set-Location "$PSScriptRoot\frontend"

npm run dev
