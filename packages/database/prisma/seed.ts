import { PrismaClient, UserRole, UserStatus, TripType, TripStatus, TripVisibility, ActivityCategory, AlertSeverity } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding TravelLoop database...');

  // ─── Admin User ──────────────────────────────────────────────────────────
  const adminPassword = await hash('Admin@123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@travelloop.app' },
    update: {},
    create: {
      email: 'admin@travelloop.app',
      emailVerified: true,
      passwordHash: adminPassword,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      profile: {
        create: {
          firstName: 'TravelLoop',
          lastName: 'Admin',
          displayName: 'TravelLoop Admin',
          bio: 'Platform administrator',
          totalTrips: 0,
          totalCountries: 0,
          totalCities: 0,
        },
      },
      settings: {
        create: {
          theme: 'dark',
          language: 'en',
          currency: 'USD',
          timezone: 'UTC',
        },
      },
      preferences: { create: {} },
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // ─── Demo User ───────────────────────────────────────────────────────────
  const demoPassword = await hash('Demo@123456', 12);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@travelloop.app' },
    update: {},
    create: {
      email: 'demo@travelloop.app',
      emailVerified: true,
      passwordHash: demoPassword,
      role: UserRole.PREMIUM,
      status: UserStatus.ACTIVE,
      loginStreak: 7,
      profile: {
        create: {
          firstName: 'Alex',
          lastName: 'Explorer',
          displayName: 'Alex Explorer',
          bio: 'Passionate traveler | 42 countries | Digital nomad 🌍',
          travelStyleBadge: 'Adventure Seeker',
          totalTrips: 12,
          totalCountries: 42,
          totalCities: 87,
          totalDistance: 125000,
        },
      },
      settings: { create: {} },
      preferences: {
        create: {
          budgetRange: 'mid-range',
          travelPace: 'moderate',
          interests: ['adventure', 'culture', 'food', 'photography'],
          travelStyle: ['backpacker', 'solo'],
        },
      },
    },
  });
  console.log('✅ Demo user created:', demoUser.email);

  // ─── Achievements ─────────────────────────────────────────────────────────
  const achievements = [
    { name: 'First Trip', description: 'Created your first trip', category: 'trips', points: 50, criteria: { trips: 1 } },
    { name: 'Globe Trotter', description: 'Visited 10 countries', category: 'exploration', points: 200, criteria: { countries: 10 } },
    { name: 'Budget Master', description: 'Stayed under budget on 5 trips', category: 'budget', points: 150, criteria: { underBudgetTrips: 5 } },
    { name: 'Social Butterfly', description: 'Connected with 10 travel buddies', category: 'social', points: 100, criteria: { buddies: 10 } },
    { name: 'Nature Lover', description: 'Completed 30 mins phone-free outdoors', category: 'mindful', points: 75, criteria: { phoneFreeMinutes: 30 } },
    { name: 'Culture Vulture', description: 'Visited 20 cultural sites', category: 'culture', points: 125, criteria: { culturalSites: 20 } },
    { name: 'Foodie', description: 'Logged 50 food expenses', category: 'food', points: 100, criteria: { foodExpenses: 50 } },
    { name: 'Eco Warrior', description: 'Offset 100kg of CO2', category: 'eco', points: 200, criteria: { co2Offset: 100 } },
    { name: 'Streak Master', description: 'Logged in 30 days in a row', category: 'engagement', points: 300, criteria: { loginStreak: 30 } },
    { name: 'Community Star', description: 'Received 100 helpful votes on reviews', category: 'community', points: 250, criteria: { helpfulVotes: 100 } },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: {},
      create: achievement,
    });
  }
  console.log('✅ Achievements seeded');

  // ─── Cities ───────────────────────────────────────────────────────────────
  const cities = [
    {
      name: 'Paris', country: 'France', countryCode: 'FR', latitude: 48.8566, longitude: 2.3522,
      timezone: 'Europe/Paris', population: 2161000, currency: 'EUR', language: ['French'],
      description: 'The City of Light, known for the Eiffel Tower, world-class cuisine, and art.',
      rating: 4.8, reviewCount: 15420, isPopular: true, isFeatured: true,
      tags: ['romantic', 'culture', 'food', 'art', 'fashion'],
    },
    {
      name: 'Tokyo', country: 'Japan', countryCode: 'JP', latitude: 35.6762, longitude: 139.6503,
      timezone: 'Asia/Tokyo', population: 13960000, currency: 'JPY', language: ['Japanese'],
      description: 'A dazzling blend of ultramodern and traditional, from neon-lit skyscrapers to historic temples.',
      rating: 4.9, reviewCount: 18750, isPopular: true, isFeatured: true,
      tags: ['technology', 'culture', 'food', 'anime', 'temples'],
    },
    {
      name: 'Bali', country: 'Indonesia', countryCode: 'ID', latitude: -8.3405, longitude: 115.0920,
      timezone: 'Asia/Makassar', population: 4225000, currency: 'IDR', language: ['Balinese', 'Indonesian'],
      description: 'Island of the Gods with stunning rice terraces, temples, and world-class surf.',
      rating: 4.7, reviewCount: 12300, isPopular: true, isFeatured: true,
      tags: ['beach', 'spiritual', 'nature', 'surf', 'yoga'],
    },
    {
      name: 'New York', country: 'United States', countryCode: 'US', latitude: 40.7128, longitude: -74.0060,
      timezone: 'America/New_York', population: 8336817, currency: 'USD', language: ['English'],
      description: 'The city that never sleeps – iconic skyline, Broadway, and endless neighborhoods.',
      rating: 4.7, reviewCount: 22100, isPopular: true, isFeatured: true,
      tags: ['urban', 'culture', 'food', 'shopping', 'nightlife'],
    },
    {
      name: 'Barcelona', country: 'Spain', countryCode: 'ES', latitude: 41.3851, longitude: 2.1734,
      timezone: 'Europe/Madrid', population: 1620343, currency: 'EUR', language: ['Spanish', 'Catalan'],
      description: 'Gaudí architecture, vibrant nightlife, and beautiful Mediterranean beaches.',
      rating: 4.8, reviewCount: 14200, isPopular: true, isFeatured: false,
      tags: ['architecture', 'beach', 'nightlife', 'food', 'art'],
    },
    {
      name: 'Goa', country: 'India', countryCode: 'IN', latitude: 15.2993, longitude: 74.1240,
      timezone: 'Asia/Kolkata', population: 1458545, currency: 'INR', language: ['Konkani', 'English'],
      description: 'India\'s beach paradise with Portuguese heritage, vibrant nightlife, and spicy cuisine.',
      rating: 4.5, reviewCount: 9800, isPopular: true, isFeatured: true,
      tags: ['beach', 'nightlife', 'food', 'heritage', 'water-sports'],
    },
    {
      name: 'Dubai', country: 'UAE', countryCode: 'AE', latitude: 25.2048, longitude: 55.2708,
      timezone: 'Asia/Dubai', population: 3331420, currency: 'AED', language: ['Arabic', 'English'],
      description: 'Futuristic skyline, luxury shopping, and desert adventures in the Arabian Gulf.',
      rating: 4.6, reviewCount: 11500, isPopular: true, isFeatured: true,
      tags: ['luxury', 'shopping', 'desert', 'modern', 'food'],
    },
    {
      name: 'Kyoto', country: 'Japan', countryCode: 'JP', latitude: 35.0116, longitude: 135.7681,
      timezone: 'Asia/Tokyo', population: 1474570, currency: 'JPY', language: ['Japanese'],
      description: 'Japan\'s ancient capital with thousands of temples, geisha districts, and bamboo groves.',
      rating: 4.9, reviewCount: 13400, isPopular: true, isFeatured: false,
      tags: ['temples', 'culture', 'traditional', 'nature', 'history'],
    },
  ];

  for (const city of cities) {
    await prisma.city.upsert({
      where: { name_countryCode: { name: city.name, countryCode: city.countryCode } },
      update: {},
      create: city,
    });
  }
  console.log('✅ Cities seeded');

  // ─── Activities for Paris ─────────────────────────────────────────────────
  const paris = await prisma.city.findFirst({ where: { name: 'Paris', countryCode: 'FR' } });
  if (paris) {
    const parisActivities = [
      {
        name: 'Eiffel Tower Visit', category: ActivityCategory.SIGHTSEEING,
        description: 'Visit the iconic iron lattice tower on the Champ de Mars.',
        latitude: 48.8584, longitude: 2.2945, priceMin: 18, priceMax: 28, currency: 'EUR',
        duration: 120, rating: 4.8, reviewCount: 45000, isFeatured: true,
        tags: ['iconic', 'views', 'romantic'],
        addOns: [
          { name: 'Summit Access', price: 10, description: 'Access to the very top' },
          { name: 'Champagne Toast', price: 25, description: 'Champagne at the top' },
        ],
      },
      {
        name: 'Louvre Museum', category: ActivityCategory.CULTURE_ARTS,
        description: 'World\'s largest art museum and historic monument.',
        latitude: 48.8606, longitude: 2.3376, priceMin: 17, priceMax: 17, currency: 'EUR',
        duration: 240, rating: 4.7, reviewCount: 38000, isFeatured: true,
        tags: ['art', 'history', 'culture'],
      },
      {
        name: 'Seine River Cruise', category: ActivityCategory.SIGHTSEEING,
        description: 'Scenic boat tour along the Seine River past Paris landmarks.',
        latitude: 48.8566, longitude: 2.3522, priceMin: 15, priceMax: 35, currency: 'EUR',
        duration: 60, rating: 4.6, reviewCount: 22000, isFeatured: false,
        tags: ['romantic', 'scenic', 'relaxing'],
      },
      {
        name: 'Montmartre Food Tour', category: ActivityCategory.FOOD_DINING,
        description: 'Explore the bohemian Montmartre neighborhood with local food tastings.',
        latitude: 48.8867, longitude: 2.3431, priceMin: 65, priceMax: 95, currency: 'EUR',
        duration: 180, rating: 4.9, reviewCount: 8500, isHiddenGem: true,
        tags: ['food', 'local', 'culture'],
      },
    ];

    for (const activity of parisActivities) {
      await prisma.activity.create({
        data: { ...activity, cityId: paris.id },
      }).catch(() => {}); // ignore duplicates
    }
  }
  console.log('✅ Activities seeded');

  // ─── Safety Info for Cities ───────────────────────────────────────────────
  const cityList = await prisma.city.findMany({ take: 5 });
  for (const city of cityList) {
    await prisma.citySafetyInfo.upsert({
      where: { cityId: city.id },
      update: {},
      create: {
        cityId: city.id,
        overallSafetyScore: Math.floor(Math.random() * 3) + 7,
        crimeLevel: 'low',
        theftRisk: 'medium',
        scamRisk: 'medium',
        soloFemaleRating: 4,
        lgbtqFriendly: true,
        emergencyNumber: '112',
        policeNumber: '17',
        ambulanceNumber: '15',
        advisoryLevel: AlertSeverity.LOW,
      },
    });
  }
  console.log('✅ Safety info seeded');

  // ─── Trip Templates ───────────────────────────────────────────────────────
  const templates = [
    { name: 'Classic Europe 10 Days', theme: 'europe', duration: 10, budgetLevel: 'mid-range', season: 'summer', isOfficial: true, tags: ['europe', 'culture', 'history'] },
    { name: 'Southeast Asia Budget 14 Days', theme: 'asia', duration: 14, budgetLevel: 'budget', season: 'any', isOfficial: true, tags: ['asia', 'budget', 'backpacker'] },
    { name: 'Bali Wellness Retreat 7 Days', theme: 'beach', duration: 7, budgetLevel: 'mid-range', season: 'any', isOfficial: true, tags: ['bali', 'wellness', 'beach'] },
    { name: 'Japan Cherry Blossom 12 Days', theme: 'asia', duration: 12, budgetLevel: 'mid-range', season: 'spring', isOfficial: true, tags: ['japan', 'culture', 'nature'] },
    { name: 'USA Road Trip 14 Days', theme: 'adventure', duration: 14, budgetLevel: 'mid-range', season: 'summer', isOfficial: true, tags: ['usa', 'road-trip', 'adventure'] },
  ];

  for (const template of templates) {
    await prisma.tripTemplate.create({
      data: { ...template, creatorId: admin.id, rating: 4.5 + Math.random() * 0.5, useCount: Math.floor(Math.random() * 1000) },
    }).catch(() => {});
  }
  console.log('✅ Trip templates seeded');

  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });