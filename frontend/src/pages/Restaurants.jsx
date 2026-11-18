import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllRestaurants, getAllMenuItems } from '../services/api';
import { Search, Star, Clock, MapPin, Filter } from 'lucide-react';

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [restRes, menuRes] = await Promise.allSettled([
        getAllRestaurants(),
        getAllMenuItems()
      ]);
      
      if (restRes.status === 'fulfilled' && restRes.value.data.success) {
        setRestaurants(restRes.value.data.restaurants);
      }
      if (menuRes.status === 'fulfilled' && menuRes.value.data.success) {
        setMenuItems(menuRes.value.data.menuItems);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.cuisine?.some(c => c.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredMenuItems = search ? menuItems.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.category?.toLowerCase().includes(search.toLowerCase())
  ) : [];

  const cuisineEmojis = {
    'Indian': '🍛', 'Chinese': '🥡', 'Italian': '🍕', 'Japanese': '🍣',
    'Mexican': '🌮', 'Thai': '🍜', 'American': '🍔', 'Mediterranean': '🥗',
    default: '🍽️'
  };

  return (
    <div className="min-h-screen bg-stone-50 pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-black text-stone-900 mb-6 tracking-tight">
            Discover <span className="text-orange-600">Restaurants</span>
          </h1>
          <p className="text-stone-500 text-lg max-w-2xl mx-auto mb-10">
            Explore the best food spots in your area. From local favorites to world-class dining, it's all here.
          </p>

          {/* Search */}
          <div className="relative max-w-2xl mx-auto shadow-2xl shadow-stone-200/50 rounded-2xl bg-white p-2 flex items-center">
            <div className="pl-4 text-orange-500 shrink-0">
              <Search size={24} />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for restaurants, cuisines, or dishes..."
              className="w-full pl-4 pr-4 py-3 bg-transparent text-stone-900 placeholder-stone-400 focus:outline-none text-lg font-medium"
            />
            <button className="bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-xl transition-colors shadow-lg shadow-orange-600/30">
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-32">
            <div className="animate-spin w-12 h-12 border-4 border-orange-100 border-t-orange-600 rounded-full mx-auto" />
          </div>
        ) : filteredRestaurants.length === 0 && filteredMenuItems.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-3xl shadow-sm border border-stone-100 animate-fade-in-up">
            <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl text-orange-500">🔍</span>
            </div>
            <h3 className="text-2xl font-bold text-stone-900 mb-2">No results found</h3>
            <p className="text-stone-500 text-lg max-w-md mx-auto">
              We couldn't find any restaurants or dishes matching your search.
            </p>
          </div>
        ) : (
          <div className="animate-fade-in-up">
            {/* Dishes Section (Only when searching) */}
            {search && filteredMenuItems.length > 0 && (
              <div className="mb-16">
                <h2 className="text-2xl font-black text-stone-900 mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-sm">🍽️</span> 
                  Dishes matching "{search}"
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredMenuItems.map((item, i) => (
                    <Link to={item.restaurant?._id ? `/restaurants/${item.restaurant._id}` : '#'} key={item._id} className="group bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl border border-stone-100 transition-all duration-300 flex items-center gap-4 hover:-translate-y-1">
                      <div className="w-20 h-20 rounded-xl bg-stone-100 overflow-hidden shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <h4 className="font-bold text-stone-900 truncate group-hover:text-orange-600 transition-colors">{item.name}</h4>
                          {item.isVeg !== undefined && (
                            <span className={`w-3 h-3 rounded-sm shrink-0 border ${item.isVeg ? 'border-green-500 bg-green-500/20' : 'border-red-500 bg-red-500/20'}`} />
                          )}
                        </div>
                        <p className="text-stone-500 text-xs truncate mb-1">from <span className="font-semibold">{item.restaurant?.name || 'Unknown Restaurant'}</span></p>
                        <p className="font-black text-orange-600">₹{item.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Restaurants Section */}
            {filteredRestaurants.length > 0 && (
              <div>
                {search && (
                  <h2 className="text-2xl font-black text-stone-900 mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center text-sm">🏪</span> 
                    Restaurants
                  </h2>
                )}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredRestaurants.map((restaurant, i) => (
                    <Link to={`/restaurants/${restaurant._id}`} key={restaurant._id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-orange-900/5 border border-stone-100 transition-all duration-300 hover:-translate-y-1">
                      {/* Image Header */}
                      <div className="h-52 bg-orange-50 relative overflow-hidden">
                        {restaurant.image ? (
                          <img 
                            src={restaurant.image} 
                            alt={restaurant.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-7xl group-hover:scale-110 transition-transform duration-500 drop-shadow-xl">
                              {cuisineEmojis[restaurant.cuisine?.[0]] || cuisineEmojis.default}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        {/* Status Badge */}
                        <div className="absolute top-4 right-4 z-20">
                          {restaurant.isOpen ? (
                            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-white text-green-600 shadow-sm flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Open Now
                            </span>
                          ) : (
                            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-white text-red-500 shadow-sm flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Closed
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold text-stone-900 group-hover:text-orange-600 transition-colors line-clamp-1 pr-2">{restaurant.name}</h3>
                          <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-lg text-sm font-bold shrink-0">
                            <Star size={12} fill="currentColor" />
                            <span>{restaurant.rating || '4.0'}</span>
                          </div>
                        </div>
                        
                        <p className="text-stone-500 text-sm mb-4 line-clamp-1 font-medium">{restaurant.cuisine?.join(' • ') || 'Multi-cuisine'}</p>

                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Restaurants;
