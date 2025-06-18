#!/bin/bash

echo "🚀 Iniciando deploy de eva-rfa-system..."

# 1. Construir la aplicación para producción
echo "📦 Construyendo aplicación para producción..."
npm run build:prod

# 2. Instalar dependencias de producción
echo "📋 Instalando dependencias..."
npm install --only=production

# 3. Crear directorio de logs si no existe
mkdir -p logs

echo "✅ Build completado. Aplicación lista para deploy."
echo ""
echo "📋 Comandos para el VPS:"
echo "1. Para iniciar el servidor: npm run start"
echo "2. Para usar PM2: pm2 start src/server.cjs --name eva-rfa-system"
echo "3. Puerto del servidor: 3309"
echo "4. Puerto del frontend (después de build): Servir archivos estáticos de ./dist" 