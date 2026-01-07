# Docker Prisma Fix

## Issue
Prisma migration fails with OpenSSL/libssl errors in Alpine Linux container.

## Solution Applied
1. ✅ Updated Dockerfile to install OpenSSL compatibility library
2. ✅ Updated Prisma to version 5.19.0 (newer, more stable)
3. ✅ Removed obsolete `version` from docker-compose.yml

## Steps to Fix

1. **Stop and remove existing containers:**
   ```bash
   docker-compose down
   ```

2. **Rebuild containers with the fixes:**
   ```bash
   docker-compose build --no-cache backend
   ```

3. **Start services:**
   ```bash
   docker-compose up -d
   ```

4. **Wait a few seconds, then run migrations:**
   ```bash
   docker-compose exec backend npx prisma migrate dev --name init --schema=./prisma/schema.prisma
   ```

5. **Seed the database:**
   ```bash
   docker-compose exec backend npm run seed
   ```

## ✅ Solution: Switched to Debian-based Image

The backend Dockerfile has been updated to use `node:20` (Debian-based) instead of Alpine, which has better OpenSSL support for Prisma.

**The fix is already applied!** Just rebuild:
```bash
docker-compose build --no-cache backend
docker-compose up -d
```
