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
- ✅ Checkout flow with Stripe payment integration
- ✅ Real payment processing with Stripe
- ✅ Admin dashboard for viewing orders
- ✅ User authentication & authorization (JWT)
- ✅ RESTful API for products, orders, and payments
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
- `GET /orders` - Get all orders (admin only)
- `GET /orders/:id` - Get single order
- `PATCH /orders/:id` - Update order status

### Payments (Stripe)
- `POST /payments/create-intent` - Create payment intent
- `POST /payments/confirm` - Confirm payment
- `POST /payments/webhook` - Stripe webhook handler

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user (protected)

## 📝 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/blejta?schema=public
PORT=7058
JWT_SECRET=your_secret_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:7058
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

## 💳 Stripe Payment Setup

1. **Create a Stripe account** at https://stripe.com

2. **Get your API keys:**
   - Go to https://dashboard.stripe.com/test/apikeys
   - Copy your **Publishable key** (starts with `pk_test_`)
   - Copy your **Secret key** (starts with `sk_test_`)

3. **Set up webhook:**
   
   **For Production:**
   - Go to https://dashboard.stripe.com/test/webhooks (test mode) or https://dashboard.stripe.com/webhooks (live mode)
   - Click **"Add endpoint"**
   - Enter your endpoint URL: `https://your-backend-url.com/payments/webhook`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Click **"Add endpoint"**
   - Click on the webhook you just created
   - In the **"Signing secret"** section, click **"Reveal"** and copy the secret (starts with `whsec_`)
   
   **For Local Development (using Stripe CLI):**
   - Install Stripe CLI: https://stripe.com/docs/stripe-cli
   - Run: `stripe listen --forward-to localhost:7058/payments/webhook`
   - The CLI will display a webhook signing secret (starts with `whsec_`) - use this in your local `.env`
   - This allows you to test webhooks locally without deploying

4. **Update environment variables:**
   - Add `STRIPE_SECRET_KEY` to backend `.env`
   - Add `STRIPE_WEBHOOK_SECRET` to backend `.env` (for webhooks)
   - Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to frontend `.env.local`

5. **For Docker setup:**
   - Update `docker-compose.yml` with your Stripe keys, or
   - Create a `.env` file in the project root with:
     ```
     STRIPE_SECRET_KEY=sk_test_...
     STRIPE_WEBHOOK_SECRET=whsec_...
     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
     ```

6. **Test payments:**
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - See more test cards: https://stripe.com/docs/testing

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

- [x] Add authentication (JWT + login page)
- [x] Add Stripe payment integration
- [ ] Add order status update actions in admin
- [ ] Add product image upload (Cloudinary integration)
- [ ] Add SMS/email notifications
- [ ] Add order tracking for customers
- [ ] Add Temu order automation scripts

## 📄 License

MIT

---

Built with ❤️ for Blejta
