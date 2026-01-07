# Quick Setup Guide

## 🚀 Fastest Way to Get Started (Docker)

1. **Clone and navigate:**
   ```bash
   cd Blejta
   ```

2. **Start everything:**
   ```bash
   docker-compose up --build -d
   ```

3. **Initialize database:**
   ```bash
   # Wait a few seconds for services to start, then:
   docker-compose exec backend npx prisma migrate dev --name init --schema=./prisma/schema.prisma
   docker-compose exec backend npm run seed
   ```

4. **Access:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:7058

## 📝 Manual Setup (Without Docker)

### Backend

```bash
cd backend
npm install
cp env.example .env
# Edit .env with your DATABASE_URL
npx prisma generate
npx prisma migrate dev
npm run seed
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
cp env.example .env.local
# Edit .env.local with NEXT_PUBLIC_API_URL=http://localhost:7058
npm run dev
```

## 🔧 Troubleshooting

### Database Connection Issues
- Make sure PostgreSQL is running
- Check DATABASE_URL in backend/.env
- For Docker: ensure postgres service is up (`docker-compose ps`)

### Prisma Issues
- Run `npx prisma generate` in backend folder
- Make sure schema.prisma is in `backend/prisma/`

### Frontend Can't Connect to Backend
- Check NEXT_PUBLIC_API_URL in frontend/.env.local
- Ensure backend is running on port 7058
- Check CORS settings (already enabled in main.ts)

## 📦 Next Steps After Setup

1. Add real product images (replace placeholder.jpg or use Cloudinary)
2. Customize styling in `frontend/app/globals.css`
3. Add authentication for admin routes
4. Deploy to production (see README.md)
