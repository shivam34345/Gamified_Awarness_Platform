
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import LoginPage from './pages/LoginPage';
import NotFound from './not-found';

import Dashboard from './pages/Dashboard';
import PlayPage from './pages/PlayPage';
import TopicsPage from './pages/TopicsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ShopPage from './pages/ShopPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import MazePage from './pages/MazePage';

import { useAuth } from './context/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';


function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<NotFound />} />

        {/* Protected App Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login?dest=/dashboard" />} />
          <Route path="/play" element={isAuthenticated ? <PlayPage /> : <Navigate to="/login?dest=/play" />} />
          <Route path="/play/maze" element={isAuthenticated ? <MazePage /> : <Navigate to="/login?dest=/play/maze" />} />
          <Route path="/topics" element={isAuthenticated ? <TopicsPage /> : <Navigate to="/login?dest=/topics" />} />
          <Route path="/leaderboard" element={isAuthenticated ? <LeaderboardPage /> : <Navigate to="/login?dest=/leaderboard" />} />
          <Route path="/shop" element={isAuthenticated ? <ShopPage /> : <Navigate to="/login?dest=/shop" />} />
          <Route path="/settings" element={isAuthenticated ? <SettingsPage /> : <Navigate to="/login?dest=/settings" />} />
          <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login?dest=/profile" />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
