import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, UtensilsCrossed, ShoppingCart, LogOut, LayoutDashboard } from 'lucide-react';

const Navbar = ({ cartCount = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'restaurant': return '/restaurant/dashboard';

      default: return '/dashboard';
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Restaurants', path: '/restaurants' }
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-md border-b border-stone-100 ${scrolled ? 'py-3 shadow-md' : 'py-5 shadow-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-600/30 group-hover:scale-105 transition-transform bg-orange-600">
              <UtensilsCrossed size={22} />
            </div>
            <span className="text-2xl font-black tracking-tight transition-colors text-stone-900">
              Bite<span className="text-orange-600">Bay</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => {
              const isActive = location.pathname === link.path;
              return (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  className={`text-sm font-bold transition-all ${isActive ? 'text-orange-600' : 'text-stone-600 hover:text-orange-600'}`}
                >
                  {link.label}
                </Link>
              );
            })}
            
            {user ? (
              <>
                <Link to={getDashboardLink()} className="text-sm font-bold transition-colors flex items-center gap-1.5 text-stone-600 hover:text-orange-600">
                  <LayoutDashboard size={18} /> Dashboard
                </Link>
                {user.role === 'user' && (
                  <Link to="/cart" className="relative transition-colors text-stone-600 hover:text-orange-600">
                    <ShoppingCart size={22} />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white shadow-sm border-2 bg-orange-600 border-white">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                )}
                <div className="flex items-center gap-4 ml-3 pl-6 border-l border-stone-200">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border bg-orange-100 text-orange-700 border-orange-200">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-stone-800">{user.name}</span>
                  </div>
                  <button onClick={handleLogout} className="transition-colors p-2 rounded-full text-stone-400 hover:text-red-500 hover:bg-red-50" title="Logout">
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 ml-2">
                <Link to="/login" className="text-sm font-bold px-4 py-2 transition-colors text-stone-700 hover:text-orange-600">Log In</Link>
                <Link to="/register" className="px-6 py-2.5 rounded-xl text-sm font-black transition-all hover:-translate-y-0.5 shadow-lg bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/30">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden text-stone-800 p-2 bg-white rounded-full shadow-sm hover:bg-stone-50" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-stone-100 shadow-xl overflow-hidden animate-fade-in-up">
            <div className="flex flex-col p-4 space-y-2">
              {navLinks.map(link => (
                <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)} className={`px-4 py-3 rounded-xl font-semibold transition-colors ${location.pathname === link.path ? 'bg-orange-50 text-orange-600' : 'text-stone-700 hover:bg-stone-50'}`}>{link.label}</Link>
              ))}
              {user ? (
                <>
                  <Link to={getDashboardLink()} onClick={() => setIsOpen(false)} className={`px-4 py-3 rounded-xl font-semibold transition-colors ${location.pathname.includes('dashboard') ? 'bg-orange-50 text-orange-600' : 'text-stone-700 hover:bg-stone-50'}`}>Dashboard</Link>
                  {user.role === 'user' && (
                    <Link to="/cart" onClick={() => setIsOpen(false)} className={`px-4 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 ${location.pathname === '/cart' ? 'bg-orange-50 text-orange-600' : 'text-stone-700 hover:bg-stone-50'}`}>
                      Cart <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs">{cartCount}</span>
                    </Link>
                  )}
                  <div className="h-px bg-stone-100 my-2" />
                  <button onClick={handleLogout} className="px-4 py-3 w-full text-left rounded-xl font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"><LogOut size={18}/> Logout</button>
                </>
              ) : (
                <>
                  <div className="h-px bg-stone-100 my-2" />
                  <Link to="/login" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-xl font-semibold text-stone-700 hover:bg-stone-50 text-center border border-stone-200 mt-2">Log In</Link>
                  <Link to="/register" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-xl font-bold text-white bg-orange-600 text-center shadow-lg shadow-orange-600/30">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
