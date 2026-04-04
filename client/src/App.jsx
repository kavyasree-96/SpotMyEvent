import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import TrendingEvents from './pages/TrendingEvents';
import CalendarSync from './pages/CalendarSync';
import SearchHistory from './pages/SearchHistory';   // make sure this file exists
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="trending" element={<TrendingEvents />} />
            <Route path="calendar" element={<CalendarSync />} />
            <Route path="history" element={<SearchHistory />} />   // ✅ ADD THIS LINE
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}