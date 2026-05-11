🌍 TravelLoop — Plan. Explore. Loop.
The ultimate full-stack travel planning platform built with React 18, NestJS 10, PostgreSQL, and Prisma 5.

✨ Features
🗺️ Trip Management — Create trips with cover photos, companions, visibility controls, status workflow (Draft → Active → Completed), and public sharing via unique slugs.

📍 Itinerary Builder — Multi-stop drag-and-drop itinerary with transport modes, accommodation tracking, activity scheduling, booking status, and weather alerts.

💰 Budget & Expenses — Real-time expense tracking with Recharts pie/bar visualizations, 10 expense categories, budget alerts at 90% threshold, and per-stop cost estimates.

🎒 Packing Checklist — Multiple lists per trip, category grouping (Documents, Clothing, Electronics, Health, Toiletries), quick-add essentials, progress tracking.

📔 Trip Journal — Rich notes with mood tracking (6 moods), hashtags, privacy controls (Private/Shared/Public), and 6 note categories.

🌆 City Discovery — 20+ world cities with cost breakdowns (budget/mid-range/luxury), safety scores, best travel months, visa info, and wishlist saving.

🎯 Activities Marketplace — Browse by city/category, hidden gems, price ranges, reviews, and save with price alerts.

👥 Community & Buddies — Social feed with posts/likes/comments, travel buddy matching with compatibility scores, follow system.

🧘 Mindful Explorer — Phone-free travel challenges, mindfulness streaks, exploration points, achievement badges.

🛡️ TripSafe Shield — Safety alerts by severity, scam reports, emergency contacts, travel advisories.

🌱 Carbon Tracker — CO₂ calculation per transport leg, trip footprint summary, carbon offset programs.

🗺️ Local Guide Marketplace — Verified guides across 20+ cities, filter by language/specialty/budget, booking flow, guide application system.

📊 Admin Panel — Super Admin dashboard, user management, audit logs, guide approval workflow, system health monitoring.

🛠️ Tech Stack
Layer	Technologies
Frontend	React 18, TypeScript, Vite, Tailwind CSS, Zustand, React Router v6, Recharts, Framer Motion, @dnd-kit
Backend	NestJS 10, TypeScript, Passport JWT, Swagger/OpenAPI, Socket.io, Bull queues
Database	PostgreSQL 15, Prisma 5 ORM (35+ models), Redis
DevOps	Docker Compose, Vercel (frontend), Railway (API)
🚀 Quick Start
git clone https://github.com/adityakalagatoori/launderloop.git
cd launderloop
npm install
npm run dev   # → http://localhost:5173

bash


Demo: demo@travelloop.app / Demo@123456

📁 Structure
├── src/                    # React frontend (25+ pages)
├── apps/api/src/           # NestJS API (12 modules)
│   ├── auth/               # JWT auth
│   ├── trips/              # Trip CRUD
│   ├── itinerary/          # Stops & activities
│   ├── expenses/           # Budget tracking
│   ├── cities/             # City discovery
│   ├── activities/         # Activity marketplace
│   ├── guides/             # Guide marketplace
│   ├── bookings/           # Guide bookings
│   ├── notifications/      # Push notifications
│   ├── messages/           # Direct messaging
│   └── admin/              # Admin panel
└── packages/database/      # Prisma schema (35+ models)

txt


📡 API
Swagger docs available at http://localhost:4000/api/docs in development.

Key endpoints: /api/v1/auth, /api/v1/trips, /api/v1/trips/:id/itinerary, /api/v1/expenses, /api/v1/cities, /api/v1/activities, /api/v1/guides, /api/v1/admin

Built by @adityakalagatoori
