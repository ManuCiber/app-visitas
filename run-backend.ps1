# Script para compilar y ejecutar el backend Spring Boot
param (
    [string]$Profile = "dev",
    [int]$Port = 8080
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Iniciando Backend MediCare (Spring Boot)" -ForegroundColor Cyan
Write-Host "Puerto: $Port | Perfil: $Profile" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Set-Location "$PSScriptRoot\backend"

$env:PORT = $Port

# Si Maven está instalado en el sistema
if (Get-Command mvn -ErrorAction SilentlyContinue) {
    mvn spring-boot:run
} elseif (Test-Path ".\mvnw.cmd") {
    .\mvnw.cmd spring-boot:run
} else {
    Write-Host "Asegúrese de tener Maven instalado o utilice mvnw para ejecutar el backend." -ForegroundColor Yellow
}
