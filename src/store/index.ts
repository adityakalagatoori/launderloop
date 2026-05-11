// =============================================================================
// TRAVELLOOP – ZUSTAND STORE WITH LOCALSTORAGE PERSISTENCE
// =============================================================================
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  User, Trip, City, Activity, Expense, PackingList, PackingItem,
  Note, TravelBuddy, CommunityPost, CarbonEntry, MindfulSession,
  ItineraryStop, ItineraryActivity
} from '../types';
import {
  SEED_USER, SEED_TRIPS, SEED_CITIES, SEED_ACTIVITIES,
  SEED_BUDDIES, SEED_COMMUNITY_POSTS, SEED_ACHIEVEMENTS
} from '../data/seed';

// ─── Auth Store ───────────────────────────────────────────────────────────────
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  updateSettings: (settings: Partial<User['settings']>) => void;
  updatePreferences: (prefs: Partial<User['preferences']>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        await new Promise(r => setTimeout(r, 800));
        // Demo login: any email/password works, or use demo credentials
        const user = email === 'demo@travelloop.app'
          ? SEED_USER
          : { ...SEED_USER, id: `user-${Date.now()}`, email, name: email.split('@')[0] };
        set({ user, isAuthenticated: true, isLoading: false });
        return true;
      },

      register: async (name: string, email: string, _password: string) => {
        set({ isLoading: true });
        await new Promise(r => setTimeout(r, 1000));
        const newUser: User = {
          ...SEED_USER,
          id: `user-${Date.now()}`,
          email,
          name,
          totalTrips: 0,
          totalCountries: 0,
          totalCities: 0,
          loginStreak: 1,
          referralCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
          createdAt: new Date().toISOString(),
          achievements: [],
          mindfulPoints: 0,
          carbonOffset: 0,
        };
        set({ user: newUser, isAuthenticated: true, isLoading: false });
        return true;
      },

      logout: () => set({ user: null, isAuthenticated: false }),

      updateUser: (updates) => set(state => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),

      updateSettings: (settings) => set(state => ({
        user: state.user ? { ...state.user, settings: { ...state.user.settings, ...settings } } : null
      })),

      updatePreferences: (prefs) => set(state => ({
        user: state.user ? { ...state.user, preferences: { ...state.user.preferences, ...prefs } } : null
      })),
    }),
    { name: 'travelloop-auth', storage: createJSONStorage(() => localStorage) }
  )
);

// ─── Trip Store ───────────────────────────────────────────────────────────────
interface TripState {
  trips: Trip[];
  activeTrip: Trip | null;
  addTrip: (trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'copyCount'>) => Trip;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  setActiveTrip: (trip: Trip | null) => void;
  duplicateTrip: (id: string) => Trip | null;
}

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      trips: SEED_TRIPS,
      activeTrip: null,

      addTrip: (tripData) => {
        const trip: Trip = {
          ...tripData,
          id: `trip-${Date.now()}`,
          viewCount: 0,
          copyCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set(state => ({ trips: [trip, ...state.trips] }));
        return trip;
      },

      updateTrip: (id, updates) => set(state => ({
        trips: state.trips.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t),
        activeTrip: state.activeTrip?.id === id ? { ...state.activeTrip, ...updates } : state.activeTrip,
      })),

      deleteTrip: (id) => set(state => ({
        trips: state.trips.filter(t => t.id !== id),
        activeTrip: state.activeTrip?.id === id ? null : state.activeTrip,
      })),

      setActiveTrip: (trip) => set({ activeTrip: trip }),

      duplicateTrip: (id) => {
        const trip = get().trips.find(t => t.id === id);
        if (!trip) return null;
        const newTrip: Trip = {
          ...trip,
          id: `trip-${Date.now()}`,
          name: `${trip.name} (Copy)`,
          status: 'DRAFT',
          viewCount: 0,
          copyCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set(state => ({ trips: [newTrip, ...state.trips] }));
        return newTrip;
      },
    }),
    { name: 'travelloop-trips', storage: createJSONStorage(() => localStorage) }
  )
);

// ─── Itinerary Store ──────────────────────────────────────────────────────────
interface ItineraryState {
  stops: Record<string, ItineraryStop[]>; // tripId -> stops
  addStop: (tripId: string, stop: Omit<ItineraryStop, 'id' | 'activities'>) => ItineraryStop;
  updateStop: (tripId: string, stopId: string, updates: Partial<ItineraryStop>) => void;
  deleteStop: (tripId: string, stopId: string) => void;
  reorderStops: (tripId: string, stops: ItineraryStop[]) => void;
  addActivity: (tripId: string, stopId: string, activity: Omit<ItineraryActivity, 'id'>) => void;
  updateActivity: (tripId: string, stopId: string, actId: string, updates: Partial<ItineraryActivity>) => void;
  deleteActivity: (tripId: string, stopId: string, actId: string) => void;
  getStops: (tripId: string) => ItineraryStop[];
}

const DEFAULT_STOPS: Record<string, ItineraryStop[]> = {
  'trip-1': [
    {
      id: 'stop-1', itineraryId: 'itin-1', cityId: 'city-paris', cityName: 'Paris',
      name: 'Paris', description: 'City of Light', latitude: 48.8566, longitude: 2.3522,
      arrivalDate: '2026-07-01', departureDate: '2026-07-05', dayNumber: 1, orderIndex: 0,
      transportMode: 'FLIGHT', transportCost: 450, accommodation: 'Hotel Le Marais', accommodationCost: 150,
      isHiddenGem: false,
      activities: [
        { id: 'ia-1', stopId: 'stop-1', activityId: 'act-1', name: 'Eiffel Tower Visit', startTime: '2026-07-02T10:00:00Z', endTime: '2026-07-02T12:00:00Z', cost: 25, currency: 'EUR', orderIndex: 0, isBooked: true, isCompleted: false, weatherAlert: false },
        { id: 'ia-2', stopId: 'stop-1', activityId: 'act-2', name: 'Louvre Museum', startTime: '2026-07-03T09:00:00Z', endTime: '2026-07-03T13:00:00Z', cost: 17, currency: 'EUR', orderIndex: 1, isBooked: false, isCompleted: false, weatherAlert: false },
      ],
    },
    {
      id: 'stop-2', itineraryId: 'itin-1', cityId: 'city-barcelona', cityName: 'Barcelona',
      name: 'Barcelona', description: 'Gaudí and beaches', latitude: 41.3851, longitude: 2.1734,
      arrivalDate: '2026-07-05', departureDate: '2026-07-10', dayNumber: 5, orderIndex: 1,
      transportMode: 'TRAIN', transportCost: 80, accommodation: 'Barceloneta Hostel', accommodationCost: 60,
      isHiddenGem: false,
      activities: [
        { id: 'ia-3', stopId: 'stop-2', activityId: 'act-9', name: 'Sagrada Família Tour', startTime: '2026-07-06T10:00:00Z', endTime: '2026-07-06T11:30:00Z', cost: 36, currency: 'EUR', orderIndex: 0, isBooked: true, isCompleted: false, weatherAlert: false },
      ],
    },
  ],
  'trip-3': [
    {
      id: 'stop-3', itineraryId: 'itin-3', cityId: 'city-tokyo', cityName: 'Tokyo',
      name: 'Tokyo', description: 'Neon lights and ramen', latitude: 35.6762, longitude: 139.6503,
      arrivalDate: '2026-03-25', departureDate: '2026-03-30', dayNumber: 1, orderIndex: 0,
      transportMode: 'FLIGHT', transportCost: 800, accommodation: 'Shinjuku Hotel', accommodationCost: 120,
      isHiddenGem: false,
      activities: [
        { id: 'ia-4', stopId: 'stop-3', activityId: 'act-4', name: 'Shibuya Crossing', startTime: '2026-03-26T18:00:00Z', endTime: '2026-03-26T19:00:00Z', cost: 0, currency: 'USD', orderIndex: 0, isBooked: false, isCompleted: true, weatherAlert: false },
        { id: 'ia-5', stopId: 'stop-3', activityId: 'act-5', name: 'Tsukiji Market Tour', startTime: '2026-03-27T07:00:00Z', endTime: '2026-03-27T09:00:00Z', cost: 45, currency: 'USD', orderIndex: 1, isBooked: true, isCompleted: true, weatherAlert: false },
      ],
    },
    {
      id: 'stop-4', itineraryId: 'itin-3', cityId: 'city-kyoto', cityName: 'Kyoto',
      name: 'Kyoto', description: 'Ancient temples and cherry blossoms', latitude: 35.0116, longitude: 135.7681,
      arrivalDate: '2026-03-30', departureDate: '2026-04-05', dayNumber: 6, orderIndex: 1,
      transportMode: 'TRAIN', transportCost: 50, accommodation: 'Ryokan Sakura', accommodationCost: 180,
      isHiddenGem: false,
      activities: [],
    },
  ],
};

export const useItineraryStore = create<ItineraryState>()(
  persist(
    (set, get) => ({
      stops: DEFAULT_STOPS,

      addStop: (tripId, stopData) => {
        const stop: ItineraryStop = { ...stopData, id: `stop-${Date.now()}`, activities: [] };
        set(state => ({
          stops: { ...state.stops, [tripId]: [...(state.stops[tripId] || []), stop] }
        }));
        return stop;
      },

      updateStop: (tripId, stopId, updates) => set(state => ({
        stops: {
          ...state.stops,
          [tripId]: (state.stops[tripId] || []).map(s => s.id === stopId ? { ...s, ...updates } : s)
        }
      })),

      deleteStop: (tripId, stopId) => set(state => ({
        stops: { ...state.stops, [tripId]: (state.stops[tripId] || []).filter(s => s.id !== stopId) }
      })),

      reorderStops: (tripId, stops) => set(state => ({
        stops: { ...state.stops, [tripId]: stops }
      })),

      addActivity: (tripId, stopId, actData) => {
        const activity: ItineraryActivity = { ...actData, id: `ia-${Date.now()}` };
        set(state => ({
          stops: {
            ...state.stops,
            [tripId]: (state.stops[tripId] || []).map(s =>
              s.id === stopId ? { ...s, activities: [...s.activities, activity] } : s
            )
          }
        }));
      },

      updateActivity: (tripId, stopId, actId, updates) => set(state => ({
        stops: {
          ...state.stops,
          [tripId]: (state.stops[tripId] || []).map(s =>
            s.id === stopId
              ? { ...s, activities: s.activities.map(a => a.id === actId ? { ...a, ...updates } : a) }
              : s
          )
        }
      })),

      deleteActivity: (tripId, stopId, actId) => set(state => ({
        stops: {
          ...state.stops,
          [tripId]: (state.stops[tripId] || []).map(s =>
            s.id === stopId ? { ...s, activities: s.activities.filter(a => a.id !== actId) } : s
          )
        }
      })),

      getStops: (tripId) => get().stops[tripId] || [],
    }),
    { name: 'travelloop-itinerary', storage: createJSONStorage(() => localStorage) }
  )
);

// ─── Expense Store ────────────────────────────────────────────────────────────
interface ExpenseState {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Expense;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  getByTrip: (tripId: string) => Expense[];
  getTotalByTrip: (tripId: string) => number;
  getByCategory: (tripId: string) => Record<string, number>;
}

const SEED_EXPENSES: Expense[] = [
  { id: 'exp-1', tripId: 'trip-1', userId: 'user-1', category: 'ACCOMMODATION', amount: 150, currency: 'USD', description: 'Hotel Le Marais - Night 1', date: '2026-07-01', isShared: false, createdAt: '2026-07-01T20:00:00Z' },
  { id: 'exp-2', tripId: 'trip-1', userId: 'user-1', category: 'FOOD_DINING', amount: 45, currency: 'USD', description: 'Dinner at Café de Flore', date: '2026-07-01', isShared: false, createdAt: '2026-07-01T21:00:00Z' },
  { id: 'exp-3', tripId: 'trip-1', userId: 'user-1', category: 'ACTIVITIES', amount: 28, currency: 'USD', description: 'Eiffel Tower ticket', date: '2026-07-02', isShared: false, createdAt: '2026-07-02T10:00:00Z' },
  { id: 'exp-4', tripId: 'trip-1', userId: 'user-1', category: 'TRANSPORTATION', amount: 12, currency: 'USD', description: 'Metro day pass', date: '2026-07-02', isShared: false, createdAt: '2026-07-02T09:00:00Z' },
  { id: 'exp-5', tripId: 'trip-1', userId: 'user-1', category: 'SHOPPING', amount: 85, currency: 'USD', description: 'Souvenirs at Marché aux Puces', date: '2026-07-03', isShared: false, createdAt: '2026-07-03T15:00:00Z' },
  { id: 'exp-6', tripId: 'trip-3', userId: 'user-1', category: 'ACCOMMODATION', amount: 120, currency: 'USD', description: 'Shinjuku Hotel', date: '2026-03-25', isShared: false, createdAt: '2026-03-25T20:00:00Z' },
  { id: 'exp-7', tripId: 'trip-3', userId: 'user-1', category: 'FOOD_DINING', amount: 35, currency: 'USD', description: 'Ramen at Ichiran', date: '2026-03-26', isShared: false, createdAt: '2026-03-26T19:00:00Z' },
];

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set, get) => ({
      expenses: SEED_EXPENSES,

      addExpense: (expData) => {
        const expense: Expense = { ...expData, id: `exp-${Date.now()}`, createdAt: new Date().toISOString() };
        set(state => ({ expenses: [expense, ...state.expenses] }));
        return expense;
      },

      updateExpense: (id, updates) => set(state => ({
        expenses: state.expenses.map(e => e.id === id ? { ...e, ...updates } : e)
      })),

      deleteExpense: (id) => set(state => ({
        expenses: state.expenses.filter(e => e.id !== id)
      })),

      getByTrip: (tripId) => get().expenses.filter(e => e.tripId === tripId),

      getTotalByTrip: (tripId) => get().expenses
        .filter(e => e.tripId === tripId)
        .reduce((sum, e) => sum + e.amount, 0),

      getByCategory: (tripId) => {
        const expenses = get().expenses.filter(e => e.tripId === tripId);
        return expenses.reduce((acc, e) => {
          acc[e.category] = (acc[e.category] || 0) + e.amount;
          return acc;
        }, {} as Record<string, number>);
      },
    }),
    { name: 'travelloop-expenses', storage: createJSONStorage(() => localStorage) }
  )
);

// ─── Packing Store ────────────────────────────────────────────────────────────
interface PackingState {
  lists: PackingList[];
  addList: (tripId: string, name?: string) => PackingList;
  addItem: (listId: string, item: Omit<PackingItem, 'id' | 'listId'>) => void;
  updateItem: (listId: string, itemId: string, updates: Partial<PackingItem>) => void;
  deleteItem: (listId: string, itemId: string) => void;
  togglePacked: (listId: string, itemId: string) => void;
  getByTrip: (tripId: string) => PackingList[];
}

const SEED_PACKING: PackingList[] = [
  {
    id: 'pack-1', tripId: 'trip-1', name: 'Europe Summer Packing',
    createdAt: '2026-05-01T10:00:00Z',
    items: [
      { id: 'pi-1', listId: 'pack-1', name: 'Passport', category: 'Documents', quantity: 1, isPacked: true, isEssential: true },
      { id: 'pi-2', listId: 'pack-1', name: 'Travel Insurance', category: 'Documents', quantity: 1, isPacked: true, isEssential: true },
      { id: 'pi-3', listId: 'pack-1', name: 'T-Shirts', category: 'Clothing', quantity: 5, isPacked: false, isEssential: true },
      { id: 'pi-4', listId: 'pack-1', name: 'Sunscreen SPF 50', category: 'Health', quantity: 1, isPacked: false, isEssential: true },
      { id: 'pi-5', listId: 'pack-1', name: 'Universal Adapter', category: 'Electronics', quantity: 1, isPacked: true, isEssential: true },
      { id: 'pi-6', listId: 'pack-1', name: 'Camera', category: 'Electronics', quantity: 1, isPacked: false, isEssential: false },
      { id: 'pi-7', listId: 'pack-1', name: 'Walking Shoes', category: 'Clothing', quantity: 1, isPacked: false, isEssential: true },
      { id: 'pi-8', listId: 'pack-1', name: 'Portable Charger', category: 'Electronics', quantity: 1, isPacked: true, isEssential: false },
    ],
  },
];

export const usePackingStore = create<PackingState>()(
  persist(
    (set, get) => ({
      lists: SEED_PACKING,

      addList: (tripId, name = 'Packing List') => {
        const list: PackingList = { id: `pack-${Date.now()}`, tripId, name, items: [], createdAt: new Date().toISOString() };
        set(state => ({ lists: [...state.lists, list] }));
        return list;
      },

      addItem: (listId, itemData) => {
        const item: PackingItem = { ...itemData, id: `pi-${Date.now()}`, listId };
        set(state => ({
          lists: state.lists.map(l => l.id === listId ? { ...l, items: [...l.items, item] } : l)
        }));
      },

      updateItem: (listId, itemId, updates) => set(state => ({
        lists: state.lists.map(l =>
          l.id === listId ? { ...l, items: l.items.map(i => i.id === itemId ? { ...i, ...updates } : i) } : l
        )
      })),

      deleteItem: (listId, itemId) => set(state => ({
        lists: state.lists.map(l =>
          l.id === listId ? { ...l, items: l.items.filter(i => i.id !== itemId) } : l
        )
      })),

      togglePacked: (listId, itemId) => set(state => ({
        lists: state.lists.map(l =>
          l.id === listId ? { ...l, items: l.items.map(i => i.id === itemId ? { ...i, isPacked: !i.isPacked } : i) } : l
        )
      })),

      getByTrip: (tripId) => get().lists.filter(l => l.tripId === tripId),
    }),
    { name: 'travelloop-packing', storage: createJSONStorage(() => localStorage) }
  )
);

// ─── Notes Store ──────────────────────────────────────────────────────────────
interface NoteState {
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt'>) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  getByTrip: (tripId: string) => Note[];
}

const SEED_NOTES: Note[] = [
  { id: 'note-1', tripId: 'trip-1', userId: 'user-1', title: 'Day 1 in Paris', content: 'Arrived at CDG airport. The city is absolutely stunning! Checked into Hotel Le Marais – perfect location in the heart of the city. Had the most amazing croissant at a tiny boulangerie around the corner. The Eiffel Tower at night is breathtaking. #paris #travel #food', category: 'MEMORY', privacy: 'PUBLIC', mood: 'AMAZING', hashtags: ['paris', 'travel', 'food'], photos: [], date: '2026-07-01', createdAt: '2026-07-01T22:00:00Z' },
  { id: 'note-2', tripId: 'trip-1', userId: 'user-1', title: 'Louvre Tips', content: 'Pro tip: Book tickets online at least 3 days in advance. Go straight to the Denon Wing for the Mona Lisa – it\'s smaller than you expect! The Winged Victory of Samothrace is actually more impressive. Spend at least 4 hours here. #louvre #art #tips', category: 'TIP', privacy: 'PUBLIC', mood: 'GREAT', hashtags: ['louvre', 'art', 'tips'], photos: [], date: '2026-07-03', createdAt: '2026-07-03T18:00:00Z' },
];

export const useNoteStore = create<NoteState>()(
  persist(
    (set, get) => ({
      notes: SEED_NOTES,

      addNote: (noteData) => {
        const note: Note = { ...noteData, id: `note-${Date.now()}`, createdAt: new Date().toISOString() };
        set(state => ({ notes: [note, ...state.notes] }));
        return note;
      },

      updateNote: (id, updates) => set(state => ({
        notes: state.notes.map(n => n.id === id ? { ...n, ...updates } : n)
      })),

      deleteNote: (id) => set(state => ({ notes: state.notes.filter(n => n.id !== id) })),

      getByTrip: (tripId) => get().notes.filter(n => n.tripId === tripId),
    }),
    { name: 'travelloop-notes', storage: createJSONStorage(() => localStorage) }
  )
);

// ─── Community Store ──────────────────────────────────────────────────────────
interface CommunityState {
  posts: CommunityPost[];
  buddies: TravelBuddy[];
  addPost: (post: Omit<CommunityPost, 'id' | 'createdAt' | 'likeCount' | 'commentCount'>) => void;
  toggleLike: (postId: string) => void;
  updateBuddyStatus: (buddyId: string, status: TravelBuddy['status']) => void;
}

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set) => ({
      posts: SEED_COMMUNITY_POSTS,
      buddies: SEED_BUDDIES,

      addPost: (postData) => {
        const post: CommunityPost = { ...postData, id: `post-${Date.now()}`, likeCount: 0, commentCount: 0, createdAt: new Date().toISOString() };
        set(state => ({ posts: [post, ...state.posts] }));
      },

      toggleLike: (postId) => set(state => ({
        posts: state.posts.map(p =>
          p.id === postId ? { ...p, isLiked: !p.isLiked, likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1 } : p
        )
      })),

      updateBuddyStatus: (buddyId, status) => set(state => ({
        buddies: state.buddies.map(b => b.id === buddyId ? { ...b, status } : b)
      })),
    }),
    { name: 'travelloop-community', storage: createJSONStorage(() => localStorage) }
  )
);

// ─── Carbon Store ─────────────────────────────────────────────────────────────
interface CarbonState {
  entries: CarbonEntry[];
  addEntry: (entry: Omit<CarbonEntry, 'id'>) => void;
  deleteEntry: (id: string) => void;
  getByTrip: (tripId: string) => CarbonEntry[];
  getTotalCO2: (tripId: string) => number;
}

export const useCarbonStore = create<CarbonState>()(
  persist(
    (set, get) => ({
      entries: [
        { id: 'co2-1', tripId: 'trip-1', transportMode: 'FLIGHT', distance: 1200, co2Kg: 306, fromCity: 'San Francisco', toCity: 'Paris', date: '2026-07-01' },
        { id: 'co2-2', tripId: 'trip-1', transportMode: 'TRAIN', distance: 800, co2Kg: 32.8, fromCity: 'Paris', toCity: 'Barcelona', date: '2026-07-05' },
        { id: 'co2-3', tripId: 'trip-3', transportMode: 'FLIGHT', distance: 9000, co2Kg: 2295, fromCity: 'San Francisco', toCity: 'Tokyo', date: '2026-03-25' },
      ],

      addEntry: (entryData) => {
        const entry: CarbonEntry = { ...entryData, id: `co2-${Date.now()}` };
        set(state => ({ entries: [...state.entries, entry] }));
      },

      deleteEntry: (id) => set(state => ({ entries: state.entries.filter(e => e.id !== id) })),

      getByTrip: (tripId) => get().entries.filter(e => e.tripId === tripId),

      getTotalCO2: (tripId) => get().entries
        .filter(e => e.tripId === tripId)
        .reduce((sum, e) => sum + e.co2Kg, 0),
    }),
    { name: 'travelloop-carbon', storage: createJSONStorage(() => localStorage) }
  )
);

// ─── UI Store (non-persistent) ────────────────────────────────────────────────
interface UIState {
  sidebarOpen: boolean;
commandPaletteOpen: boolean;
  activeModal: string | null;
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  toggleCommandPalette: () => void;
  openModal: (modal: string) => void;
  closeModal: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  commandPaletteOpen: false,
  activeModal: null,
  theme: 'dark',
  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  toggleCommandPalette: () => set(state => ({ commandPaletteOpen: !state.commandPaletteOpen })),
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
  setTheme: (theme) => set({ theme }),
}));

// ─── City/Activity Store (read-only seed data) ────────────────────────────────
interface CityState {
  cities: typeof import('../data/seed').SEED_CITIES;
  activities: typeof import('../data/seed').SEED_ACTIVITIES;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  getCity: (id: string) => (typeof import('../data/seed').SEED_CITIES)[0] | undefined;
  getActivitiesByCity: (cityId: string) => typeof import('../data/seed').SEED_ACTIVITIES;
}

export const useCityStore = create<CityState>()((set, get) => ({
  cities: SEED_CITIES,
  activities: SEED_ACTIVITIES,
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
  getCity: (id) => get().cities.find(c => c.id === id),
  getActivitiesByCity: (cityId) => get().activities.filter(a => a.cityId === cityId),
}));