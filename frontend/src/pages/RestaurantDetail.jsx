import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRestaurantById } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Star, Clock, Plus, Minus, ShoppingCart, ArrowLeft, Info } from 'lucide-react';

const RestaurantDetail = ({ cart, setCart }) => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurant();
  }, [id]);

  const fetchRestaurant = async () => {
    try {
      const { data } = await getRestaurantById(id);
      if (data.success) {
        setRestaurant(data.restaurant);
        setMenuItems(data.menuItems || []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const addToCart = (item) => {
    setCart(prev => {
      if (prev.restaurantId && prev.restaurantId !== restaurant._id) {
        if (!confirm('Your cart has items from another restaurant. Clear cart and add this item?')) return prev;
        return { restaurantId: restaurant._id, restaurantName: restaurant.name, deliveryFee: restaurant.deliveryFee || 0, items: [{ ...item, quantity: 1 }] };
      }

      const existing = prev.items?.find(i => i._id === item._id);
      if (existing) {
        return {
          ...prev, restaurantId: restaurant._id, restaurantName: restaurant.name, deliveryFee: restaurant.deliveryFee || 0,
          items: prev.items.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i)
        };
      }
      return {
        ...prev, restaurantId: restaurant._id, restaurantName: restaurant.name, deliveryFee: restaurant.deliveryFee || 0,
        items: [...(prev.items || []), { ...item, quantity: 1 }]
      };
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const existing = prev.items?.find(i => i._id === itemId);
      if (!existing) return prev;
      if (existing.quantity === 1) {
        const newItems = prev.items.filter(i => i._id !== itemId);
        return { ...prev, items: newItems, restaurantId: newItems.length ? prev.restaurantId : null };
      }
      return { ...prev, items: prev.items.map(i => i._id === itemId ? { ...i, quantity: i.quantity - 1 } : i) };
    });
  };

  const getItemQuantity = (itemId) => {
    return cart.items?.find(i => i._id === itemId)?.quantity || 0;
  };

  const categories = [...new Set(menuItems.map(i => i.category))];

  if (loading) return <div className="min-h-screen bg-stone-50 flex items-center justify-center"><div className="animate-spin w-12 h-12 border-4 border-orange-100 border-t-orange-600 rounded-full" /></div>;
  if (!restaurant) return <div className="min-h-screen bg-stone-50 flex items-center justify-center text-stone-500 text-xl font-bold">Restaurant not found</div>;

  const cartTotal = cart.items?.reduce((s, i) => s + i.price * i.quantity, 0) || 0;
  const cartCount = cart.items?.reduce((s, i) => s + i.quantity, 0) || 0;

  return (
    <div className="min-h-screen bg-stone-50 pt-24 pb-40 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <button onClick={() => navigate('/restaurants')} className="inline-flex items-center gap-2 text-stone-500 hover:text-orange-600 mb-8 font-semibold transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-stone-100">
          <ArrowLeft size={18} /> Back to restaurants
        </button>

        {/* Restaurant Header */}
        <div className="bg-white rounded-3xl mb-10 shadow-sm border border-stone-100 relative overflow-hidden group">
          {/* Banner Image */}
          <div className="h-64 overflow-hidden relative">
            {restaurant.bannerImage ? (
              <img 
                src={restaurant.bannerImage} 
                alt={restaurant.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-orange-400 to-orange-600 opacity-20" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            <div className="absolute bottom-6 left-8 flex items-center gap-6 z-10 w-full pr-16">
              {/* Profile/Logo Image */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-white p-2 shadow-2xl shrink-0 overflow-hidden border-4 border-white">
                {restaurant.image ? (
                  <img 
                    src={restaurant.image} 
                    alt={restaurant.name} 
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="w-full h-full bg-orange-100 flex items-center justify-center text-5xl rounded-2xl">
                    🍽️
                  </div>
                )}
              </div>
              <div className="text-white">
                <div className="flex flex-wrap items-center gap-4 mb-2">
                  <h1 className="text-3xl sm:text-5xl font-black tracking-tight drop-shadow-md">{restaurant.name}</h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-md ${restaurant.isOpen ? 'bg-green-500/80 text-white' : 'bg-red-500/80 text-white'}`}>
                    {restaurant.isOpen ? 'OPEN' : 'CLOSED'}
                  </span>
                </div>
                <p className="text-orange-100/90 text-sm sm:text-lg font-medium drop-shadow-md line-clamp-1">{restaurant.description || restaurant.cuisine?.join(', ') || 'Premium Culinary Experience'}</p>
              </div>
            </div>
          </div>
          
          <div className="p-8 pt-10">
            <div className="flex flex-wrap items-center gap-8 text-sm font-bold">
              <div className="flex items-center gap-2 bg-stone-50 px-4 py-2.5 rounded-2xl border border-stone-100">
                <Star size={18} className="text-yellow-500" fill="currentColor" />
                <span className="text-stone-900 text-base">{restaurant.rating || '4.0'}</span>
                <span className="text-stone-400 font-medium">({restaurant.totalRatings || '100+'})</span>
              </div>

            </div>

            {/* Infrastructure Section */}
            {restaurant.infrastructureImages?.length > 0 && (
              <div className="mt-8 pt-8 border-t border-stone-100">
                <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">Restaurant Infrastructure</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                  {restaurant.infrastructureImages.map((img, i) => (
                    <div key={i} className="w-48 h-32 shrink-0 rounded-2xl overflow-hidden border border-stone-100 shadow-sm">
                      <img src={img} alt={`Infrastructure ${i}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500 cursor-zoom-in" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Menu Section */}
        {menuItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-stone-100">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">🍽️</div>
            <h3 className="text-2xl font-bold text-stone-900 mb-2">Menu building in progress</h3>
            <p className="text-stone-500 text-lg">Check back later for delicious items!</p>
          </div>
        ) : (
          categories.map(cat => (
            <div key={cat} className="mb-12">
              <h2 className="text-2xl font-black text-stone-900 mb-6 flex items-center gap-3">
                <span className="w-2 h-8 rounded-full bg-orange-600 shadow-sm shadow-orange-600/50" />
                {cat}
              </h2>
              
              <div className="grid gap-4">
                {menuItems.filter(i => i.category === cat).map(item => (
                  <div key={item._id} className="bg-white p-5 rounded-3xl shadow-sm hover:shadow-md border border-stone-100 flex items-center gap-6 transition-all group">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {item.isVeg
                          ? <span className="w-4 h-4 rounded border border-green-600 flex items-center justify-center shrink-0"><span className="w-2 h-2 rounded-full bg-green-600" /></span>
                          : <span className="w-4 h-4 rounded border border-red-600 flex items-center justify-center shrink-0"><span className="w-2 h-2 rounded-full bg-red-600" /></span>
                        }
                        <h4 className="font-bold text-stone-900 text-lg group-hover:text-orange-600 transition-colors uppercase tracking-tight">{item.name}</h4>
                      </div>
                      <p className="text-stone-500 text-sm mb-4 line-clamp-2 leading-relaxed max-w-lg">{item.description}</p>
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-black text-stone-900">₹{item.price}</span>
                        {item.tags?.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full font-bold uppercase">{tag}</span>
                        ))}
                      </div>
                    </div>

                    {/* Item Image */}
                    <div className="w-32 h-32 rounded-2xl overflow-hidden shrink-0 relative shadow-sm">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-stone-100 flex items-center justify-center text-4xl">
                          🍲
                        </div>
                      )}
                      
                      {/* Add button overlayed on image for premium look */}
                      <div className="absolute -bottom-2 inset-x-0 flex justify-center">
                        {getItemQuantity(item._id) === 0 ? (
                          <button onClick={() => addToCart(item)}
                            className="px-6 py-2 rounded-xl font-black bg-white text-green-600 hover:bg-green-600 hover:text-white transition-all shadow-lg border border-stone-100 text-sm">
                            ADD
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 bg-orange-600 text-white p-1 rounded-xl shadow-lg border border-orange-500">
                            <button onClick={() => removeFromCart(item._id)}
                              className="w-7 h-7 rounded-lg hover:bg-black/10 transition-colors flex items-center justify-center">
                              <Minus size={14} fill="currentColor" strokeWidth={3} />
                            </button>
                            <span className="text-sm font-black w-4 text-center">{getItemQuantity(item._id)}</span>
                            <button onClick={() => addToCart(item)}
                              className="w-7 h-7 rounded-lg hover:bg-black/10 transition-colors flex items-center justify-center">
                              <Plus size={14} fill="currentColor" strokeWidth={3} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Bar / Cart Summary */}
      {cartCount > 0 && cart.restaurantId === restaurant._id && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-40 pb-8 animate-fade-in-up">
          <div className="max-w-4xl mx-auto">
            <button onClick={() => navigate('/cart')}
              className="w-full p-5 rounded-2xl flex items-center justify-between text-white font-bold bg-stone-900 hover:bg-stone-800 transition-all shadow-2xl shadow-stone-900/30 cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                  <ShoppingCart size={24} />
                </div>
                <div className="text-left">
                  <div className="text-orange-400 text-sm uppercase tracking-wider mb-1 mt-0.5">{cartCount} ITEM{cartCount > 1 ? 'S' : ''}</div>
                  <div className="text-xl">₹{cartTotal}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white text-stone-900 px-6 py-3 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-colors">
                View Cart <ArrowLeft size={18} className="rotate-180" />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetail;
