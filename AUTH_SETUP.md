# Authentication & Authorization Setup

## ✅ Implementation Complete

A complete authentication and authorization system has been implemented with the following features:

### Backend Features

1. **User Model** (Prisma)
   - Email (unique)
   - Password (hashed with bcrypt)
   - Name
   - Role (user/admin)

2. **Authentication Endpoints**
   - `POST /auth/register` - User registration
   - `POST /auth/login` - User login
   - `GET /auth/me` - Get current user (protected)

3. **Security Features**
   - Password hashing with bcrypt (10 rounds)
   - JWT tokens with 7-day expiration
   - Role-based access control (RBAC)
   - Protected routes with guards

4. **Guards & Decorators**
   - `JwtAuthGuard` - Validates JWT tokens
   - `RolesGuard` - Checks user roles
   - `@Roles('admin')` - Decorator for role-based routes

### Frontend Features

1. **Auth Pages**
   - `/login` - Login page
   - `/signup` - Registration page

2. **State Management**
   - Zustand store with persistence
   - Automatic token injection in API requests
   - Auto-logout on 401 errors

3. **Protected Routes**
   - `AuthGuard` component for route protection
   - Admin-only routes with `requireAdmin` prop

4. **User Menu**
   - Dropdown menu with user info
   - Logout functionality
   - Admin panel link (for admins)

## 🚀 Setup Instructions

### 1. Run Database Migration

```bash
cd backend
npx prisma migrate dev --name add_user_auth
```

### 2. Seed Database (Creates Admin User)

```bash
npm run seed
```

This creates:
- **Admin User**: `admin@blejta.local` / `admin123`
- **Test User**: `user@example.com` / `user123`

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 4. Set Environment Variables

**Backend** (`backend/.env`):
```
JWT_SECRET=your-super-secret-jwt-key-change-in-production
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/blejta?schema=public
PORT=7058
```

**Frontend** (`frontend/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:7058
```

## 📝 Usage

### Login as Admin
1. Go to `/login`
2. Email: `admin@blejta.local`
3. Password: `admin123`
4. Access `/admin` panel

### Register New User
1. Go to `/signup`
2. Fill in name, email, and password
3. Automatically logged in after registration

### Protected Routes
- `/admin` - Requires admin role
- Other routes can be protected by wrapping with `<AuthGuard>`

## 🔒 Security Best Practices Implemented

1. ✅ Password hashing (bcrypt)
2. ✅ JWT token authentication
3. ✅ Role-based access control
4. ✅ Protected API endpoints
5. ✅ Input validation
6. ✅ Error handling
7. ✅ Token expiration
8. ✅ Secure token storage (localStorage with Zustand persist)

## 🎯 Next Steps

- [ ] Add email verification
- [ ] Add password reset functionality
- [ ] Add refresh tokens
- [ ] Add rate limiting
- [ ] Add 2FA (optional)
