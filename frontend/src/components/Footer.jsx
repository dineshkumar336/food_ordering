import { Link } from 'react-router-dom';
import { UtensilsCrossed, Mail, Phone, MapPin, Instagram, Twitter, Facebook } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-stone-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-600 shadow-md shadow-orange-600/20">
                <UtensilsCrossed size={22} className="text-white" />
              </div>
              <span className="text-2xl font-black text-stone-900 tracking-tight">Bite<span className="text-orange-600">Bay</span></span>
            </div>
            <p className="text-stone-500 text-sm leading-relaxed max-w-sm">
              Discover the best food locally. Delivering happiness to your doorstep fast and fresh.
            </p>
            <div className="flex items-center gap-4">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 hover:text-white hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-600/30 transition-all">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-stone-900 uppercase tracking-widest mb-6">Explore</h4>
            <ul className="space-y-4">
              {[
                { label: 'Browse Restaurants', to: '/restaurants' },
                { label: 'Top Cuisines', to: '#' },
                { label: 'Special Offers', to: '#' },
                { label: 'Create Account', to: '/register' },
              ].map((link, i) => (
                <li key={i}>
                  <Link to={link.to} className="text-stone-500 hover:text-orange-600 font-medium text-sm transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Partners */}
          <div>
            <h4 className="text-sm font-bold text-stone-900 uppercase tracking-widest mb-6">Partnership</h4>
            <ul className="space-y-4">
              {[
                { label: 'Partner With Us', to: '/register' },
                { label: 'Become a Rider', to: '/register' },
                { label: 'Merchant Dashboard', to: '/login' },
                { label: 'Corporate Accounts', to: '#' },
              ].map((link, i) => (
                <li key={i}>
                  <Link to={link.to} className="text-stone-500 hover:text-orange-600 font-medium text-sm transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold text-stone-900 uppercase tracking-widest mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-stone-500 font-medium">
                <MapPin size={18} className="text-orange-500 shrink-0 mt-0.5" /> 
                <span>123 Food Street, Culinary District, Mumbai, India</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-stone-500 font-medium">
                <Mail size={18} className="text-orange-500 shrink-0" /> support@bitebay.com
              </li>
              <li className="flex items-center gap-3 text-sm text-stone-500 font-medium">
                <Phone size={18} className="text-orange-500 shrink-0" /> +91 98765 43210
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-stone-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-stone-400 text-sm font-medium">&copy; {new Date().getFullYear()} BiteBay Inc. All rights reserved.</p>
          <div className="flex gap-6 text-sm font-medium text-stone-400">
            <a href="#" className="hover:text-stone-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-stone-900 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
