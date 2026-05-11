# 🌍 launderLoop — Plan. Explore. Loop.

> **The ultimate full-stack travel planning platform** — built with React, NestJS, PostgreSQL, and Prisma. From itinerary building to carbon tracking, TravelLoop covers every aspect of modern travel.

[![Live Demo](https://img.shields.io/badge/Live-Demo-indigo?style=for-the-badge)](https://travelloop.vercel.app)
[![API Docs](https://img.shields.io/badge/API-Swagger-green?style=for-the-badge)](http://localhost:4000/api/docs)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

---

## 📸 Screenshots

| Dashboard | Trip Itinerary | Budget Tracker |
|-----------|---------------|----------------|
| Dark glassmorphism UI with live stats | Drag-and-drop stop builder | Recharts pie/bar breakdown |

---

## ✨ Features

### 🗺️ Trip Management
- **Create & manage trips** with cover photos, tags, companions, and visibility controls (Private / Friends / Public)
- **Trip status workflow**: Draft → Planning → Confirmed → Active → Completed
- **Duplicate trips** as templates for future travel
- **Share trips** publicly with a unique slug URL

### 📍 Itinerary Builder
- **Multi-stop itinerary** with drag-and-drop reordering
- **Per-stop details**: transport mode, accommodation, costs, hidden gem flag
- **Activity scheduling** with time slots, booking status, and completion tracking
- **Weather alerts** per activity
- **Road Map view** — visual journey timeline

### 💰 Budget & Expenses
- **Real-time budget tracking** with category breakdown
- **Recharts visualizations** — pie chart + daily bar chart
- **Expense categories**: Accommodation, Food, Transport, Activities, Shopping, Health, Entertainment, Visa, Insurance
- **Budget alerts** when spending exceeds 90% of limit
- **Itinerary cost estimates** per stop

### 🎒 Packing Checklist
- **Multiple packing lists** per trip
- **Category grouping**: Documents, Clothing, Electronics, Health, Toiletries
- **Quick-add essentials** with one click
- **Progress tracking** with packed/total counter
- **Essential item badges** with warnings

### 📔 Trip Journal
- **Rich note entries** with title, content, mood, category, privacy
- **Mood tracking**: Amazing, Great, Good, Okay, Tired, Stressed
- **Hashtag system** for searchable memories
- **Privacy controls**: Private / Shared / Public
- **Categories**: Memory, Travel Tip, Thought, To-Do, Budget Note

### 🌆 City Discovery
- **Explore 20+ world cities** with ratings, costs, safety scores
- **Cost breakdown** by budget level (budget / mid-range / luxury)
- **Best travel months** per city
- **Safety information** and visa requirements
- **Save cities** to wishlist

### 🎯 Activities Marketplace
- **Browse activities** by city and category
- **Categories**: Sightseeing, Adventure, Food & Dining, Culture & Arts, Nature, Shopping, Nightlife, Wellness, Sports, Photography
- **Hidden gems** discovery
- **Price range** and duration info
- **Save activities** with price alerts

### 👥 Community & Buddies
- **Community feed** with posts, likes, comments
- **Travel buddy matching** with compatibility scores
- **Follow system** between travelers
- **Verified profiles** for trusted connections

### 🧘 Mindful Explorer
- **Phone-free travel challenges** with point rewards
- **Mindfulness streaks** and achievements
- **Exploration points** system
- **Login streak** tracking (7-day fire streak)

### 🛡️ TripSafe Shield
- **Safety alerts** by city and severity (Low / Medium / High / Critical)
- **Scam reports** with community verification
- **Emergency contacts** per destination
- **Travel advisories** integration

### 🌱 Carbon Tracker
- **CO₂ calculation** per transport leg (flight, train, bus, car, ferry)
- **Trip carbon footprint** summary
- **Carbon offset** programs
- **Eco-friendly travel** recommendations

### 🗺️ Local Guide Marketplace
- **Verified local guides** across 20+ Indian cities
- **Filter by**: city, language, specialty, budget
- **Guide profiles** with ratings, reviews, gallery
- **Book guides** directly through the platform
- **Become a guide** application flow

### 📊 Admin Panel
- **Super Admin dashboard** with platform stats
- **User management**: roles, status, suspension
- **Audit logs** for all admin actions
- **Guide application** approval/rejection workflow
- **System health** monitoring

### 🔔 Notifications & Messaging
- **Real-time notifications** (trip invites, buddy requests, expense alerts, weather alerts)
- **Direct messaging** between travelers
- **Push notification** support

---

## 🏗️ Architecture

```
travelloop/
├── src/                          # React Frontend (Vite + TypeScript)
│   ├── pages/                    # 25+ page components
│   ├── components/               # Shared UI components
│   ├── store/                    # Zustand state management
│   ├── types/                    # TypeScript type definitions
│   └── data/                     # Seed data for demo mode
│
├── apps/
│   └── api/                      # NestJS Backend API
│       └── src/
│           ├── auth/             # JWT authentication
│           ├── users/            # User management
│           ├── trips/            # Trip CRUD
│           ├── itinerary/        # Itinerary & stops
│           ├── expenses/         # Budget tracking
│           ├── cities/           # City discovery
│           ├── activities/       # Activity marketplace
│           ├── guides/           # Guide marketplace
│           ├── bookings/         # Guide bookings
│           ├── notifications/    # Push notifications
│           ├── messages/         # Direct messaging
│           ├── admin/            # Admin panel
│           └── prisma/           # Database service
│
└── packages/
    └── database/
        ├── schema.prisma         # Complete DB schema (35+ models)
        └── prisma/seed.ts        # Database seeder
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool & dev server |
| **Tailwind CSS** | Utility-first styling |
| **Zustand** | State management with localStorage persistence |
| **React Router v6** | Client-side routing |
| **Recharts** | Data visualization (pie, bar charts) |
| **Framer Motion** | Animations |
| **Lucide React** | Icon library |
| **date-fns** | Date formatting |
| **@dnd-kit** | Drag-and-drop for itinerary |

### Backend
| Technology | Purpose |
|-----------|---------|
| **NestJS 10** | Node.js framework |
| **TypeScript** | Type safety |
| **Prisma 5** | ORM & database client |
| **PostgreSQL** | Primary database |
| **Redis** | Caching & sessions |
| **JWT** | Authentication tokens |
| **Passport.js** | Auth strategies |
| **bcryptjs** | Password hashing |
| **Socket.io** | Real-time WebSockets |
| **Bull** | Job queues |
| **Swagger** | API documentation |
| **Helmet** | Security headers |
| **class-validator** | DTO validation |

### Database (35+ Models)
- Users, Profiles, Settings, Preferences
- Trips, Companions, Templates, Shares
- Itineraries, Stops, Activities, Versions
- Cities, Costs, Weather, Safety, Visa Info
- Activities, Reviews, Price Alerts
- Expenses, Budget Categories
- Packing Lists & Items
- Notes / Journal
- Community Posts, Comments, Likes
- Messages, Notifications
- Travel Buddies, Follows
- Achievements, Mindful Points
- Carbon Tracking & Offsets
- Audit Logs, Analytics Events

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- pnpm / npm

### 1. Clone the Repository
```bash
git clone https://github.com/adityakalagatoori/launderloop.git
cd launderloop
```

### 2. Install Dependencies
```bash
# Frontend
npm install

# Backend API
cd apps/api
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env.local
# Edit .env.local with your database credentials and API keys
```

Key environment variables:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/travelloop_db"
JWT_SECRET="your-super-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
REDIS_URL="redis://localhost:6379"
```

### 4. Set Up Database
```bash
cd packages/database

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed with demo data
npx ts-node prisma/seed.ts
```

### 5. Start Development Servers

**Frontend** (http://localhost:5173):
```bash
npm run dev
```

**Backend API** (http://localhost:4000):
```bash
cd apps/api
npm run start:dev
```

**API Documentation**: http://localhost:4000/api/docs

### 6. Demo Login
```
Email: demo@travelloop.app
Password: Demo@123456
```

---

## 🐳 Docker Setup

```bash
# Start all services (PostgreSQL + Redis + API + Frontend)
docker-compose up -d

# Run migrations
docker-compose exec api npx prisma migrate deploy

# Seed database
docker-compose exec api npx ts-node prisma/seed.ts
```

---

## 📡 API Endpoints

### Authentication
```
POST   /api/v1/auth/register       Register new user
POST   /api/v1/auth/login          Login with email/password
POST   /api/v1/auth/refresh        Refresh access token
POST   /api/v1/auth/logout         Logout
GET    /api/v1/auth/me             Get current user profile
```

### Trips
```
GET    /api/v1/trips               List user's trips
POST   /api/v1/trips               Create new trip
GET    /api/v1/trips/:id           Get trip details
PATCH  /api/v1/trips/:id           Update trip
DELETE /api/v1/trips/:id           Delete trip
POST   /api/v1/trips/:id/companions Add companion
GET    /api/v1/trips/public        Browse public trips
```

### Itinerary
```
GET    /api/v1/trips/:id/itinerary          Get itinerary
POST   /api/v1/trips/:id/itinerary/stops    Add stop
PATCH  /api/v1/trips/:id/itinerary/stops/:stopId  Update stop
DELETE /api/v1/trips/:id/itinerary/stops/:stopId  Delete stop
PUT    /api/v1/trips/:id/itinerary/stops/reorder  Reorder stops
POST   /api/v1/trips/:id/itinerary/stops/:stopId/activities  Add activity
PATCH  /api/v1/trips/:id/itinerary/stops/:stopId/activities/:actId  Update
DELETE /api/v1/trips/:id/itinerary/stops/:stopId/activities/:actId  Delete
```

### Expenses
```
GET    /api/v1/expenses/trip/:tripId        Get trip expenses
POST   /api/v1/expenses                    Add expense
PATCH  /api/v1/expenses/:id               Update expense
DELETE /api/v1/expenses/:id               Delete expense
GET    /api/v1/expenses/trip/:tripId/summary  Budget summary
```

### Cities & Activities
```
GET    /api/v1/cities              Browse cities
GET    /api/v1/cities/:id          City details
GET    /api/v1/cities/:id/activities  City activities
POST   /api/v1/cities/:id/save     Save city
GET    /api/v1/activities          Browse activities
GET    /api/v1/activities/:id      Activity details
POST   /api/v1/activities/:id/save Save activity
POST   /api/v1/activities/:id/review  Add review
```

### Guides
```
GET    /api/v1/guides              Browse guides
GET    /api/v1/guides/:id          Guide profile
POST   /api/v1/guides/apply        Apply as guide
POST   /api/v1/bookings            Book a guide
```

### Users & Profile
```
GET    /api/v1/users/me            My profile
PATCH  /api/v1/users/me/profile    Update profile
PATCH  /api/v1/users/me/settings   Update settings
DELETE /api/v1/users/me            Delete account
GET    /api/v1/users/me/stats      Travel statistics
```

### Admin (SUPER_ADMIN only)
```
GET    /api/v1/admin/dashboard     Platform stats
GET    /api/v1/admin/users         All users
PATCH  /api/v1/admin/users/:id/role    Change role
PATCH  /api/v1/admin/users/:id/status  Change status
DELETE /api/v1/admin/users/:id     Delete user
GET    /api/v1/admin/audit-logs    Audit trail
GET    /api/v1/admin/health        System health
```

---

## 🗄️ Database Schema Highlights

```prisma
// 35+ models including:
model User          { ... }   // Auth, profile, settings, preferences
model Trip          { ... }   // Full trip with companions, budget, tags
model Itinerary     { ... }   // Versioned itinerary with stops
model ItineraryStop { ... }   // City stop with transport + accommodation
model Activity      { ... }   // Marketplace activity with reviews
model City          { ... }   // City with costs, weather, safety
model Expense       { ... }   // Categorized expense with OCR support
model PackingList   { ... }   // Packing list with items
model Note          { ... }   // Journal entry with mood + hashtags
model CommunityPost { ... }   // Social post with likes + comments
model TravelBuddy   { ... }   // Buddy connection requests
model Guide         { ... }   // Local guide marketplace
model CarbonTracking{ ... }   // CO₂ per transport leg
model Notification  { ... }   // Push notifications
model AuditLog      { ... }   // Admin audit trail
```

---

## 🎨 UI Design System

The frontend uses a custom dark glassmorphism design system:

```css
/* Core classes */
.glass-card      /* Frosted glass card with border */
.btn-primary     /* Indigo gradient button */
.btn-secondary   /* Ghost button */
.btn-danger      /* Red destructive button */
.input-field     /* Dark input with focus ring */
.badge           /* Status badge */
.badge-green     /* Green status */
.badge-indigo    /* Indigo status */
.badge-amber     /* Amber/warning status */
.page-container  /* Responsive page wrapper */
.section-title   /* Section heading */
.text-gradient   /* Indigo-to-teal gradient text */
.modal-overlay   /* Full-screen modal backdrop */
.modal-content   /* Centered modal card */
.card-hover      /* Hover lift effect */
.glow-indigo     /* Indigo glow shadow */
```

**Color Palette:**
- Background: `#0f0f13` (deep dark)
- Surface: `#13131a` (sidebar/header)
- Card: `rgba(255,255,255,0.04)` (glass)
- Primary: `#6366f1` (indigo-500)
- Accent: `#14b8a6` (teal-500)
- Text: `rgba(255,255,255,0.9)` / `rgba(255,255,255,0.5)`

---

## 📁 Pages Overview

| Route | Page | Description |
|-------|------|-------------|
| `/dashboard` | Dashboard | Stats, active trips, trending cities, achievements |
| `/trips` | Trips | Grid/list view with filters and sorting |
| `/trips/new` | Create Trip | Multi-step trip creation form |
| `/trips/:id` | Trip Detail | Overview with quick links to all sections |
| `/trips/:id/itinerary` | Itinerary | Stop builder with activity management |
| `/trips/:id/roadmap` | Road Map | Visual journey timeline |
| `/trips/:id/budget` | Budget | Expense tracking with charts |
| `/trips/:id/packing` | Packing | Checklist with categories |
| `/trips/:id/journal` | Journal | Travel notes with mood tracking |
| `/cities` | Cities | Discover world cities |
| `/cities/:id` | City Detail | Full city info with activities |
| `/activities` | Activities | Browse all activities |
| `/templates` | Templates | Pre-built trip templates |
| `/community` | Community | Social feed |
| `/buddies` | Buddies | Travel buddy matching |
| `/guides` | Guides | Local guide marketplace |
| `/mindful` | Mindful | Phone-free travel challenges |
| `/tripsafe` | TripSafe | Safety alerts and scam reports |
| `/carbon` | Carbon | CO₂ footprint tracker |
| `/profile` | Profile | User profile and stats |
| `/settings` | Settings | App preferences |
| `/admin` | Admin | Platform management |

---

## 🔐 Authentication Flow

1. **Register** → Creates user + profile + settings + preferences
2. **Login** → Returns JWT access token (7d) + refresh token (30d)
3. **Protected routes** → `JwtAuthGuard` validates Bearer token
4. **Role-based access** → `RolesGuard` checks USER / PREMIUM / CREATOR / MODERATOR / ADMIN / SUPER_ADMIN
5. **Token refresh** → `/auth/refresh` with refresh token
6. **Logout** → Deletes session from database

---

## 🌐 Deployment

### Frontend (Vercel)
```bash
# vercel.json is pre-configured
vercel deploy
```

### Backend (Railway / Render / AWS)
```bash
# Build
cd apps/api
npm run build

# Start production
npm run start:prod
```

### Environment Variables for Production
```env
NODE_ENV=production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<strong-random-secret>
FRONTEND_URL=https://your-domain.com
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feat/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feat/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Aditya Kalagatoori**
- GitHub: [@adityakalagatoori](https://github.com/adityakalagatoori)
- Project: [TravelLoop](https://github.com/adityakalagatoori/launderloop)

---

<div align="center">
  <strong>Built with ❤️ for travelers everywhere</strong><br/>
  <em>Plan. Explore. Loop.</em>
</div>
