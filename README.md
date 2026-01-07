# Blejta — Full Project Scaffold

> A complete starter project for **Blejta** — Kosovo reseller storefront. Contains frontend (Next.js App Router + Tailwind), backend (NestJS + Prisma + PostgreSQL), and Docker Compose setup.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose (optional, for containerized setup)
- PostgreSQL (if not using Docker)

### Option 1: Docker Setup (Recommended)

1. **Start all services:**
   ```bash
   docker-compose up --build -d
   ```

2. **Run database migrations:**
   ```bash
   docker-compose exec backend npx prisma migrate dev
   ```

3. **Seed the database:**
   ```bash
   docker-compose exec backend npm run seed
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:7058
   - PostgreSQL: localhost:5432

### Option 2: Local Development

#### Backend Setup

1. **Navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL
   ```

4. **Set up database:**
   ```bash
   # Make sure PostgreSQL is running
   npx prisma generate
   npx prisma migrate dev
   npm run seed
   ```

5. **Start backend:**
   ```bash
   npm run start:dev
   ```

Backend will run at: http://localhost:7058

#### Frontend Setup

1. **Navigate to frontend:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API URL
   ```

4. **Start frontend:**
   ```bash
   npm run dev
   ```

Frontend will run at: http://localhost:3000

## 📁 Project Structure

```
blejta-root/
├─ docker-compose.yml
├─ .gitignore
├─ README.md
├─ backend/              # NestJS backend
│  ├─ src/
│  │  ├─ main.ts
│  │  ├─ app.module.ts
│  │  ├─ prisma.service.ts
│  │  ├─ products/
│  │  └─ orders/
│  ├─ Dockerfile
│  └─ package.json
├─ frontend/             # Next.js frontend
│  ├─ app/
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  ├─ products/
│  │  ├─ cart/
│  │  ├─ checkout/
│  │  └─ admin/
│  ├─ components/
│  ├─ lib/
│  ├─ Dockerfile
│  └─ package.json
└─ backend/prisma/       # Prisma schema and migrations
   ├─ schema.prisma
   └─ seed.ts
```

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 (App Router) + React + TailwindCSS + Zustand
- **Backend:** NestJS + Prisma ORM + PostgreSQL
- **Dev Tools:** Docker Compose, TypeScript

## 📋 Features

- ✅ Product browsing and detail pages
- ✅ Shopping cart with Zustand state management
- ✅ Checkout flow with order creation
- ✅ Admin dashboard for viewing orders
- ✅ RESTful API for products and orders
- ✅ Docker Compose setup for easy development

## 🔧 Available Scripts

### Backend
- `npm run start:dev` - Start development server
- `npm run build` - Build for production
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run seed` - Seed database with sample data

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server

## 🌐 API Endpoints

### Products
- `GET /products` - Get all products
- `GET /products/:id` - Get single product

### Orders
- `POST /orders` - Create new order
- `GET /orders` - Get all orders
- `GET /orders/:id` - Get single order
- `PATCH /orders/:id` - Update order status

## 📝 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/blejta?schema=public
PORT=7058
JWT_SECRET=your_secret_key
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:7058
```

## 🚢 Deployment Notes

### Backend
- Deploy on Render / Railway / Fly / DigitalOcean App Platform
- Set environment variables in your hosting platform
- Run migrations: `npx prisma migrate deploy`

### Frontend
- Deploy on Vercel (recommended) or any Node.js hosting
- Set `NEXT_PUBLIC_API_URL` to your backend URL
- Build command: `npm run build`
- Start command: `npm run start`

### Database
- Use managed PostgreSQL (Neon / Supabase / Render DB / DigitalOcean Managed DB)
- Update `DATABASE_URL` in backend environment

## 🔐 Next Steps

- [ ] Add authentication (JWT + login page)
- [ ] Add order status update actions in admin
- [ ] Add product image upload (Cloudinary integration)
- [ ] Add SMS/email notifications
- [ ] Add order tracking for customers
- [ ] Add Temu order automation scripts

## 📄 License

MIT

---

Built with ❤️ for Blejta
