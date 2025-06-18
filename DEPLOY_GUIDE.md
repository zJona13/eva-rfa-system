# Guía de Deploy - EVA RFA System

## Información del VPS
- **IP**: 161.132.53.137
- **Hostname**: sv-LIXy2m46tHdRbWQPhapv.cloud.elastika.pe
- **Usuario**: root
- **Puerto SSH**: 22

## Pasos para el Deploy

### 1. Preparar el VPS (Ejecutar en PuTTY)

```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js (versión 18 LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 globalmente
npm install -g pm2

# Instalar Nginx (opcional, para proxy reverso)
sudo apt install nginx -y

# Crear directorio para la aplicación
mkdir -p /var/www/eva-rfa-system
cd /var/www/eva-rfa-system
```

### 2. Subir el código al VPS

```bash
# Clonar el repositorio (si usas Git)
git clone [tu-repositorio-url] .

# O subir archivos manualmente via SCP/FTP
```

### 3. Configurar la aplicación

```bash
# Instalar dependencias
npm install

# Crear build de producción
npm run build:prod

# Crear directorio de logs
mkdir -p logs
```

### 4. Iniciar la aplicación

#### Opción A: Con PM2 (Recomendado)
```bash
# Iniciar con PM2
pm2 start ecosystem.config.js --env production

# Guardar configuración de PM2
pm2 save

# Configurar PM2 para iniciar automáticamente
pm2 startup
```

#### Opción B: Comando directo
```bash
# Iniciar servidor en producción
npm run start
```

### 5. Verificar el funcionamiento

```bash
# Verificar que el servidor esté corriendo
pm2 list

# Ver logs
pm2 logs eva-rfa-system

# Verificar que el puerto esté abierto
curl http://localhost:3309/api/health
```

### 6. Configurar Firewall (Opcional)

```bash
# Abrir puerto 3309 para la aplicación
sudo ufw allow 3309

# Verificar status
sudo ufw status
```

## URLs de Acceso

- **Aplicación completa**: http://161.132.53.137:3309
- **API**: http://161.132.53.137:3309/api
- **Frontend**: http://161.132.53.137:3309

## Comandos Útiles

```bash
# Reiniciar aplicación
pm2 restart eva-rfa-system

# Parar aplicación
pm2 stop eva-rfa-system

# Ver logs en tiempo real
pm2 logs eva-rfa-system --lines 50

# Monitorear recursos
pm2 monit

# Actualizar código
git pull origin main
npm run build:prod
pm2 restart eva-rfa-system
```

## Solución de Problemas

### Puerto ocupado
```bash
# Ver qué está usando el puerto 3309
sudo netstat -tulpn | grep :3309

# Matar proceso si es necesario
sudo kill -9 [PID]
```

### Problemas de permisos
```bash
# Cambiar propietario de archivos
sudo chown -R $USER:$USER /var/www/eva-rfa-system

# Dar permisos de ejecución
chmod +x deploy.sh
```

### Verificar conexión a base de datos
```bash
# Entrar al directorio del proyecto
cd /var/www/eva-rfa-system

# Probar conexión
node -e "const { testConnection } = require('./src/utils/dbConnection.cjs'); testConnection();"
```

## Configuración Automática

El proyecto ya está configurado para:
- ✅ Detectar automáticamente el entorno (desarrollo/producción)
- ✅ Usar URLs correctas según el entorno
- ✅ Servir archivos estáticos en producción
- ✅ Configurar CORS para la IP del VPS
- ✅ Logs automáticos con PM2

## Notas Importantes

1. **Base de datos**: Ya configurada en `src/config/dbConfig.cjs`
2. **Variables de entorno**: Se configuran automáticamente
3. **Funcionamiento local**: No se ve afectado, seguirá usando localhost
4. **Seguridad**: Considera cambiar puertos por defecto en producción 