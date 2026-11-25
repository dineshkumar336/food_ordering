import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Restaurants from './pages/Restaurants';
import RestaurantDetail from './pages/RestaurantDetail';
import Cart from './pages/Cart';
import UserDashboard from './pages/UserDashboard';
import RestaurantDashboard from './pages/RestaurantDashboard';
import MfaSetup from './pages/MfaSetup';
import Recover from './pages/Recover';
import Security from './pages/Security';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, scope, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full" /></div>;
  if (!user) return <Navigate to="/login" />;
  // Restaurant owners must finish two-step sign-in setup before anything else
  if (scope === 'mfa_setup') return <Navigate to="/mfa-setup" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

const AppContent = () => {
  const [cart, setCart] = useState({ restaurantId: null, restaurantName: '', deliveryFee: 0, items: [] });
  const cartCount = cart.items?.reduce((s, i) => s + i.quantity, 0) || 0;

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar cartCount={cartCount} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/recover" element={<Recover />} />
            <Route path="/mfa-setup" element={<MfaSetup />} />
            <Route path="/security" element={
              <ProtectedRoute allowedRoles={['user', 'restaurant']}>
                <Security />
              </ProtectedRoute>
            } />
            <Route path="/restaurants" element={<Restaurants />} />
            <Route path="/restaurants/:id" element={<RestaurantDetail cart={cart} setCart={setCart} />} />
            <Route path="/cart" element={
              <ProtectedRoute allowedRoles={['user']}>
                <Cart cart={cart} setCart={setCart} />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['user']}>
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="/restaurant/dashboard" element={
              <ProtectedRoute allowedRoles={['restaurant']}>
                <RestaurantDashboard />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
