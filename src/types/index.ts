// =============================================================================
// TRAVELLOOP – COMPLETE TYPE DEFINITIONS
// =============================================================================

export type UserRole = 'USER' | 'PREMIUM' | 'CREATOR' | 'MODERATOR' | 'ADMIN';
export type TripStatus = 'DRAFT' | 'PLANNING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type TripVisibility = 'PRIVATE' | 'FRIENDS' | 'PUBLIC' | 'UNLISTED';
export type TripType = 'SOLO' | 'COUPLE' | 'FAMILY' | 'GROUP' | 'BUSINESS' | 'ADVENTURE' | 'LUXURY' | 'BUDGET' | 'BACKPACKER';
export type ActivityCategory = 'SIGHTSEEING' | 'ADVENTURE' | 'FOOD_DINING' | 'CULTURE_ARTS' | 'NATURE' | 'SHOPPING' | 'NIGHTLIFE' | 'WELLNESS_SPA' | 'SPORTS' | 'WATER_SPORTS' | 'PHOTOGRAPHY' | 'LOCAL_EXPERIENCE' | 'OTHER';
export type ExpenseCategory = 'ACCOMMODATION' | 'FOOD_DINING' | 'TRANSPORTATION' | 'ACTIVITIES' | 'SHOPPING' | 'HEALTH_MEDICAL' | 'ENTERTAINMENT' | 'VISA_FEES' | 'INSURANCE' | 'MISCELLANEOUS';
export type TransportMode = 'FLIGHT' | 'TRAIN' | 'BUS' | 'CAR' | 'FERRY' | 'TAXI' | 'METRO' | 'WALK' | 'BIKE';
export type NoteCategory = 'THOUGHT' | 'MEMORY' | 'TIP' | 'TODO' | 'BUDGET' | 'GENERAL';
export type MoodType = 'AMAZING' | 'GREAT' | 'GOOD' | 'OKAY' | 'TIRED' | 'STRESSED';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  bio?: string;
  nationality?: string;
  homeCity?: string;
  travelStyleBadge?: string;
  totalTrips: number;
  totalCountries: number;
  totalCities: number;
  loginStreak: number;
  referralCode: string;
  createdAt: string;
  preferences: UserPreferences;
  settings: UserSettings;
  achievements: string[];
  mindfulPoints: number;
  carbonOffset: number;
}

export interface UserPreferences {
  budgetRange: 'budget' | 'mid-range' | 'luxury';
  travelPace: 'slow' | 'moderate' | 'fast';
  interests: string[];
  dietaryRestrictions: string[];
  travelStyle: string[];
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  profileVisibility: 'public' | 'private' | 'friends';
  twoFactorEnabled: boolean;
}

export interface Trip {
  id: string;
  userId: string;
  name: string;
  description?: string;
  coverPhotoUrl?: string;
  type: TripType;
  status: TripStatus;
  visibility: TripVisibility;
  startDate: string;
  endDate: string;
  totalBudget?: number;
  currency: string;
  tags: string[];
  companions: TripCompanion[];
  viewCount: number;
  copyCount: number;
  carbonFootprint?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TripCompanion {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer';
}

export interface City {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  region?: string;
  latitude: number;
  longitude: number;
  timezone: string;
  population?: number;
  currency?: string;
  description?: string;
  imageUrl?: string;
  rating: number;
  reviewCount: number;
  isPopular: boolean;
  isFeatured: boolean;
  tags: string[];
  costs: CityCost;
  safetyScore: number;
  bestMonths: number[];
  visaRequired?: boolean;
}

export interface CityCost {
  accommodation: { budget: number; midRange: number; luxury: number };
  food: { budget: number; midRange: number; luxury: number };
  transport: { budget: number; midRange: number; luxury: number };
  activities: { budget: number; midRange: number; luxury: number };
  currency: string;
}

export interface Activity {
  id: string;
  cityId: string;
  cityName: string;
  name: string;
  description?: string;
  category: ActivityCategory;
  latitude?: number;
  longitude?: number;
  address?: string;
  imageUrl?: string;
  images?: string[];
  priceMin?: number;
  priceMax?: number;
  currency: string;
  duration?: number;
  rating: number;
  reviewCount: number;
  bookingUrl?: string;
  isHiddenGem: boolean;
  isFeatured: boolean;
  weatherDependent: boolean;
  tags: string[];
  addOns?: ActivityAddOn[];
}

export interface ActivityAddOn {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface ItineraryStop {
  id: string;
  itineraryId: string;
  cityId?: string;
  cityName: string;
  name: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  arrivalDate: string;
  departureDate: string;
  dayNumber: number;
  orderIndex: number;
  transportMode?: TransportMode;
  transportCost?: number;
  accommodation?: string;
  accommodationCost?: number;
  notes?: string;
  isHiddenGem: boolean;
  weatherData?: WeatherData;
  activities: ItineraryActivity[];
}

export interface ItineraryActivity {
  id: string;
  stopId: string;
  activityId?: string;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  cost?: number;
  currency: string;
  bookingRef?: string;
  notes?: string;
  orderIndex: number;
  isBooked: boolean;
  isCompleted: boolean;
  weatherAlert: boolean;
}

export interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

export interface Expense {
  id: string;
  tripId: string;
  userId: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  description: string;
  date: string;
  location?: string;
  receiptUrl?: string;
  isShared: boolean;
  splitWith?: string[];
  notes?: string;
  createdAt: string;
}

export interface PackingItem {
  id: string;
  listId: string;
  name: string;
  category: string;
  quantity: number;
  isPacked: boolean;
  isEssential: boolean;
  estimatedCost?: number;
  notes?: string;
}

export interface PackingList {
  id: string;
  tripId: string;
  name: string;
  items: PackingItem[];
  createdAt: string;
}

export interface Note {
  id: string;
  tripId: string;
  userId: string;
  title?: string;
  content: string;
  category: NoteCategory;
  privacy: 'PRIVATE' | 'SHARED' | 'PUBLIC';
  mood?: MoodType;
  hashtags: string[];
  photos: string[];
  voiceUrl?: string;
  locationName?: string;
  date: string;
  createdAt: string;
}

export interface TravelBuddy {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  bio?: string;
  totalTrips: number;
  totalCountries: number;
  travelStyle: string[];
  interests: string[];
  matchScore: number;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  isVerified: boolean;
}

export interface SafetyAlert {
  id: string;
  cityId?: string;
  cityName?: string;
  countryCode?: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  category: 'scam' | 'theft' | 'health' | 'political' | 'natural_disaster' | 'transport';
  isActive: boolean;
  createdAt: string;
}

export interface ScamReport {
  id: string;
  cityName: string;
  title: string;
  description: string;
  scamType: string;
  reportCount: number;
  isVerified: boolean;
}

export interface CarbonEntry {
  id: string;
  tripId: string;
  transportMode: TransportMode;
  distance: number;
  co2Kg: number;
  fromCity?: string;
  toCity?: string;
  date: string;
}

export interface MindfulSession {
  id: string;
  userId: string;
  tripId?: string;
  points: number;
  reason: string;
  phoneLocked: boolean;
  duration?: number;
  createdAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  earned: boolean;
  earnedAt?: string;
}

export interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  title?: string;
  content: string;
  images: string[];
  tags: string[];
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  createdAt: string;
}

export interface TripTemplate {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  theme: string;
  duration: number;
  budgetLevel: 'budget' | 'mid-range' | 'luxury';
  season?: string;
  rating: number;
  useCount: number;
  isOfficial: boolean;
  tags: string[];
}

export interface DetourSuggestion {
  id: string;
  activityId: string;
  name: string;
  description: string;
  category: ActivityCategory;
  cost: number;
  duration: number;
  rating: number;
  imageUrl?: string;
  distance: number;
}

export interface RoadmapStop {
  id: string;
  name: string;
  country: string;
  dayNumber: number;
  activities: number;
  hiddenGems: number;
  cost: number;
  weather: string;
  rating: number;
  imageUrl?: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface Guide {
  id: string;
  userId?: string;
  name: string;
  avatar: string;
  coverPhoto: string;
  city: string;
  country: string;
  bio: string;
  languages: string[];
  specialties: string[];
  pricePerHour: number;
  currency: string;
  rating: number;
  reviewCount: number;
  totalTours: number;
  experience: number; // years
  isVerified: boolean;
  isAvailable: boolean;
  whatsapp?: string;
  instagram?: string;
  gallery: string[];
  availability: string[]; // days of week
  responseTime: string;
  cancellationPolicy: string;
  badges: string[];
  createdAt: string;
}

export interface GuideReview {
  id: string;
  guideId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  tourDate: string;
  createdAt: string;
}

export interface GuideBooking {
  id: string;
  guideId: string;
  userId: string;
  date: string;
  hours: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
}