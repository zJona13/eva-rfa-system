#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
VPS_IP="161.132.53.137"
VPS_USER="root"
APP_NAME="eva-rfa-system"
DEPLOY_DIR="/var/www/$APP_NAME"
NODE_ENV="production"

echo -e "${YELLOW}🚀 Starting deployment process...${NC}"

# Build the application
echo -e "${YELLOW}📦 Building the application...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# Create deployment directory if it doesn't exist
echo -e "${YELLOW}📁 Creating deployment directory...${NC}"
ssh $VPS_USER@$VPS_IP "mkdir -p $DEPLOY_DIR"

# Copy the built files to the server
echo -e "${YELLOW}📤 Copying files to server...${NC}"
scp -r dist/* $VPS_USER@$VPS_IP:$DEPLOY_DIR/

# Install dependencies on the server
echo -e "${YELLOW}📥 Installing dependencies...${NC}"
ssh $VPS_USER@$VPS_IP "cd $DEPLOY_DIR && npm install --production"

# Install PM2 if not installed
echo -e "${YELLOW}📦 Checking PM2 installation...${NC}"
ssh $VPS_USER@$VPS_IP "if ! command -v pm2 &> /dev/null; then npm install -g pm2; fi"

# Create ecosystem.config.js for PM2
echo -e "${YELLOW}⚙️ Creating PM2 configuration...${NC}"
cat > ecosystem.config.js << EOL
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: '$NODE_ENV',
      PORT: 3309
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}
EOL

# Copy ecosystem.config.js to server
scp ecosystem.config.js $VPS_USER@$VPS_IP:$DEPLOY_DIR/

# Start or restart the application using PM2
echo -e "${YELLOW}🔄 Starting/restarting the application...${NC}"
ssh $VPS_USER@$VPS_IP "cd $DEPLOY_DIR && pm2 start ecosystem.config.js || pm2 restart $APP_NAME"

# Save PM2 process list
echo -e "${YELLOW}💾 Saving PM2 process list...${NC}"
ssh $VPS_USER@$VPS_IP "pm2 save"

# Setup PM2 to start on system boot
echo -e "${YELLOW}🔧 Setting up PM2 startup script...${NC}"
ssh $VPS_USER@$VPS_IP "pm2 startup"

# Configure Nginx
echo -e "${YELLOW}🌐 Configuring Nginx...${NC}"
scp nginx.conf $VPS_USER@$VPS_IP:/etc/nginx/sites-available/$APP_NAME

# Create symbolic link if it doesn't exist
ssh $VPS_USER@$VPS_IP "if [ ! -L /etc/nginx/sites-enabled/$APP_NAME ]; then ln -s /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/; fi"

# Test Nginx configuration
echo -e "${YELLOW}🔍 Testing Nginx configuration...${NC}"
ssh $VPS_USER@$VPS_IP "nginx -t"

# Reload Nginx if configuration is valid
if [ $? -eq 0 ]; then
    echo -e "${YELLOW}🔄 Reloading Nginx...${NC}"
    ssh $VPS_USER@$VPS_IP "systemctl reload nginx"
else
    echo -e "${RED}❌ Nginx configuration test failed${NC}"
    exit 1
fi

# Clean up local ecosystem.config.js
rm ecosystem.config.js

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${YELLOW}📊 Checking application status...${NC}"
ssh $VPS_USER@$VPS_IP "pm2 status $APP_NAME" 