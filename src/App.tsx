import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TripsPage from './pages/TripsPage';
import TripDetailPage from './pages/TripDetailPage';
import CreateTripPage from './pages/CreateTripPage';
import ItineraryPage from './pages/ItineraryPage';
import RoadMapPage from './pages/RoadMapPage';
import BudgetPage from './pages/BudgetPage';
import PackingPage from './pages/PackingPage';
import JournalPage from './pages/JournalPage';
import CitiesPage from './pages/CitiesPage';
import CityDetailPage from './pages/CityDetailPage';
import ActivitiesPage from './pages/ActivitiesPage';
import CommunityPage from './pages/CommunityPage';
import BuddiesPage from './pages/BuddiesPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';
import MindfulPage from './pages/MindfulPage';
import TripSafePage from './pages/TripSafePage';
import CarbonPage from './pages/CarbonPage';
import TemplatesPage from './pages/TemplatesPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />

          {/* Trips */}
          <Route path="trips" element={<TripsPage />} />
          <Route path="trips/new" element={<CreateTripPage />} />
          <Route path="trips/:tripId" element={<TripDetailPage />} />
          <Route path="trips/:tripId/itinerary" element={<ItineraryPage />} />
          <Route path="trips/:tripId/roadmap" element={<RoadMapPage />} />
          <Route path="trips/:tripId/budget" element={<BudgetPage />} />
          <Route path="trips/:tripId/packing" element={<PackingPage />} />
          <Route path="trips/:tripId/journal" element={<JournalPage />} />

          {/* Discovery */}
          <Route path="cities" element={<CitiesPage />} />
          <Route path="cities/:cityId" element={<CityDetailPage />} />
          <Route path="activities" element={<ActivitiesPage />} />
          <Route path="templates" element={<TemplatesPage />} />

          {/* Community */}
          <Route path="community" element={<CommunityPage />} />
          <Route path="buddies" element={<BuddiesPage />} />

          {/* Advanced */}
          <Route path="mindful" element={<MindfulPage />} />
          <Route path="tripsafe" element={<TripSafePage />} />
          <Route path="carbon" element={<CarbonPage />} />

          {/* User */}
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="admin" element={<AdminPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}