# Deployment Plan: Stylish Lab Bridebox

This plan outlines the steps to deploy the latest updates from your local machine to your RackNerd VPS (`107.173.42.189`).

## Prerequisites

- You have the SSH password: `nZ2UrPh95Tk22QyvB6CeTrG`
- The server is running Ubuntu (confirmed via SSH keyscan).
- The system is accessible via `https://stylishlab-bridebox.duckdns.org/`.

---

## Phase 1: Local Preparation

### 1. Push Latest Changes to GitHub

Ensure all your local changes are pushed to the main branch.

```powershell
git push origin main
```

---

## Phase 2: Server Update (Backend)

### 1. SSH into your VPS

Open a terminal (PowerShell, CMD, or Terminal) and run:

```bash
ssh root@107.173.42.189
```

_Enter the password when prompted: `nZ2UrPh95Tk22QyvB6`_

### 2. Navigate to the Project Directory

Assuming the project is in `/root/stylishlab-bridebox`:

```bash
cd /root/stylishlab-bridebox
```

### 3. Pull Latest Code

```bash
git pull origin main
```

### 4. Build and Restart Backend

Navigate to the backend directory and rebuild the JAR.

```bash
cd stylishlab-bridebox-backend
./mvnw clean package -DskipTests
```

After the build is successful, you need to restart the backend service.

If you are using a **systemd service** (recommended):

```bash
sudo systemctl restart bridebox-backend
```

If you are running it manually with `nohup` or `screen`, you'll need to kill the old process and start the new one:

```bash
# Find the PID
ps aux | grep stylishlab-bridebox-backend
# Kill it (replace PID)
kill -9 <PID>
# Run new one
nohup java -jar target/stylishlab-bridebox-backend-0.0.1-SNAPSHOT.jar > backend.log 2>&1 &
```

---

## Phase 3: Server Update (Frontend)

### 1. Build and Restart Frontend

Navigate to the frontend directory.

```bash
cd ../stylishlab-bridebox-frontend
npm install
npm run build
```

### 2. Restart Frontend Service

If you are using **PM2** (standard for Next.js):

```bash
pm2 restart stylishlab-bridebox-frontend
# OR if you haven't named it:
pm2 restart all
```

If you are using **systemd**:

```bash
sudo systemctl restart bridebox-frontend
```

---

## Phase 4: Verification

1. **Check Backend Status:**
   ```bash
   tail -f /root/stylishlab-bridebox/stylishlab-bridebox-backend/backend.log
   # Or if using systemd:
   journalctl -u bridebox-backend -f
   ```
2. **Check Frontend Status:**
   ```bash
   pm2 status
   # Or:
   journalctl -u bridebox-frontend -f
   ```
3. **Visit the Domain:**
   Go to [https://stylishlab-bridebox.duckdns.org/](https://stylishlab-bridebox.duckdns.org/) and verify the updates are live.

---

## Troubleshooting

- **Port Conflict:** If the backend fails to start, check if port 8080 is already in use: `lsof -i :8080`.
- **Nginx Error:** If you see a "502 Bad Gateway", it usually means the backend or frontend is down or port mappings in Nginx are wrong. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`.
- **Database Migrations:** Flyway should handle these automatically on backend startup. If it fails, check the backend logs for SQL errors.
