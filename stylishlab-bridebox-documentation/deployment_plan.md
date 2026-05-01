# 🚀 Production Deployment Plan: Stylish Lab Bridebox

This plan outlines the steps to deploy the Stylish Lab Bridebox application to a clean Ubuntu 24.04 VPS with security and stability best practices.

## 📋 Prerequisites
- **Server:** Ubuntu 24.04 (Clean Install)
- **IP:** `107.173.42.189`
- **Domain:** `stylishlab-bridebox.duckdns.org`

---

## 🛠 PHASE 1: Server Hardening & Optimization

### 1. Update & Basic Security
```bash
# Update system
apt update && apt upgrade -y

# Install common utilities
apt install -y curl git wget build-essential ufw unattended-upgrades
```

### 2. Configure Swap Space (CRITICAL)
Next.js builds require significant RAM. A 4GB swap file prevents OOM (Out Of Memory) crashes during `npm run build`.
```bash
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
```

### 3. Setup Firewall (UFW)
```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
```

### 4. Create a Dedicated Deployment User
Running apps as `root` is a security risk.
```bash
adduser deploy
usermod -aG sudo deploy
# Allow deploy user to run sudo without password
echo "deploy ALL=(ALL) NOPASSWD:ALL" | tee /etc/sudoers.d/deploy
```

---

## 📦 PHASE 2: Environment Setup

### 1. Install Node.js (v20 LTS)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

### 2. Install Java 17 (OpenJDK)
```bash
apt install -y openjdk-17-jdk
```

### 3. Install MySQL Server
```bash
apt install -y mysql-server
# Run secure installation manually
mysql_secure_installation
```

### 4. Install Global Tools
```bash
npm install -g pm2
apt install -y nginx certbot python3-certbot-nginx
```

---

## 🗄 PHASE 3: Database Configuration

Log in to MySQL as root:
```sql
CREATE DATABASE bridebox_salon CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'bridebox_user'@'localhost' IDENTIFIED BY 'StrongPassword@123';
GRANT ALL PRIVILEGES ON bridebox_salon.* TO 'bridebox_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 🚀 PHASE 4: Application Deployment

Switch to the `deploy` user for the rest of the steps:
```bash
su - deploy
```

### 1. Clone & Prepare Directories
```bash
cd ~
git clone https://github.com/chamikathereal/stylishlab-bridebox.git
cd stylishlab-bridebox
```

### 2. Backend Build (Spring Boot)
```bash
cd stylishlab-bridebox-backend
# Update credentials in properties file
sed -i 's/spring.datasource.username=.*/spring.datasource.username=bridebox_user/' src/main/resources/application.properties
sed -i 's/spring.datasource.password=.*/spring.datasource.password=StrongPassword@123/' src/main/resources/application.properties

chmod +x mvnw
./mvnw clean package -DskipTests
```

### 3. Frontend Build (Next.js)
```bash
cd ../stylishlab-bridebox-frontend
npm install
npm run build
```

---

## ⚙️ PHASE 5: Process Management (PM2)

Create a `ecosystem.config.js` in the project root (`~/stylishlab-bridebox/`) to manage both apps easily.

```javascript
module.exports = {
  apps: [
    {
      name: 'bridebox-backend',
      cwd: '/home/deploy/stylishlab-bridebox/stylishlab-bridebox-backend',
      script: 'java',
      args: '-jar target/stylishlab-bridebox-backend-0.0.1-SNAPSHOT.jar',
      env: {
        NODE_ENV: 'production',
        SERVER_PORT: 8080
      }
    },
    {
      name: 'bridebox-frontend',
      cwd: '/home/deploy/stylishlab-bridebox/stylishlab-bridebox-frontend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
```

**Start the apps:**
```bash
cd ~/stylishlab-bridebox
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 🌐 PHASE 6: Nginx & SSL

### 1. Nginx Configuration
Create `/etc/nginx/sites-available/bridebox`:
```nginx
server {
    listen 80;
    server_name stylishlab-bridebox.duckdns.org;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Enable site:**
```bash
sudo ln -s /etc/nginx/sites-available/bridebox /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### 2. SSL Setup
```bash
sudo certbot --nginx -d stylishlab-bridebox.duckdns.org
```

---

## 🔄 PHASE 7: Maintenance Script
Create a script `~/update.sh` to pull latest changes and rebuild:
```bash
#!/bin/bash
cd ~/stylishlab-bridebox
git pull origin main
cd stylishlab-bridebox-backend && ./mvnw clean package -DskipTests
cd ../stylishlab-bridebox-frontend && npm install && npm run build
pm2 restart all
```
`chmod +x ~/update.sh`
