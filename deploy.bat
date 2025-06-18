@echo off
echo 🚀 Iniciando deploy de eva-rfa-system...

REM 1. Construir la aplicación para producción
echo 📦 Construyendo aplicación para producción...
npm run build:prod

REM 2. Crear directorio de logs si no existe
if not exist "logs" mkdir logs

echo ✅ Build completado. Aplicación lista para deploy.
echo.
echo 📋 Comandos para el VPS:
echo 1. Para iniciar el servidor: npm run start
echo 2. Para usar PM2: pm2 start ecosystem.config.js --env production
echo 3. Puerto del servidor: 3309
echo 4. La aplicacion completa estará disponible en: http://161.132.53.137:3309
echo.
pause 