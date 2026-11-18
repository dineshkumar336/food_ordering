import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/api';
import { ShoppingCart, Plus, Minus, Trash2, MapPin, CreditCard, ArrowLeft, CheckCircle, Package } from 'lucide-react';

const Cart = ({ cart, setCart }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState({ street: '', city: '', state: '', zipCode: '' });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const updateQuantity = (itemId, delta) => {
    setCart(prev => {
      const item = prev.items.find(i => i._id === itemId);
      if (!item) return prev;
      if (item.quantity + delta <= 0) {
        const newItems = prev.items.filter(i => i._id !== itemId);
        return { ...prev, items: newItems, restaurantId: newItems.length ? prev.restaurantId : null };
      }
      return { ...prev, items: prev.items.map(i => i._id === itemId ? { ...i, quantity: i.quantity + delta } : i) };
    });
  };

  const removeItem = (itemId) => {
    setCart(prev => {
      const newItems = prev.items.filter(i => i._id !== itemId);
      return { ...prev, items: newItems, restaurantId: newItems.length ? prev.restaurantId : null };
    });
  };

  const clearCart = () => {
    setCart({ restaurantId: null, restaurantName: '', deliveryFee: 0, items: [] });
  };

  const subtotal = cart.items?.reduce((s, i) => s + i.price * i.quantity, 0) || 0;
  const deliveryFee = subtotal > 0 ? 30 : 0;
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const total = subtotal + deliveryFee + tax;

  const handlePlaceOrder = async () => {
    if (!user) { navigate('/login'); return; }
    if (!address.street || !address.city) { alert('Please fill in delivery address'); return; }

    setLoading(true);
    try {
      const orderData = {
        restaurantId: cart.restaurantId,
        items: cart.items.map(i => ({ menuItemId: i._id, quantity: i.quantity })),
        deliveryAddress: address,
        paymentMethod,
        notes
      };
      const { data } = await createOrder(orderData);
      if (data.success) {
        setOrderPlaced(true);
        clearCart();
        setTimeout(() => navigate('/dashboard'), 2500);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="text-center animate-fade-in-up bg-white p-12 rounded-3xl shadow-sm border border-stone-100 max-w-sm w-full">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 bg-green-50 animate-bounce">
            <CheckCircle size={48} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-black text-stone-900 mb-2 tracking-tight">Order Placed! 🎉</h1>
          <p className="text-stone-500 font-medium">Your delicious food is on its way. Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!cart.items?.length) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="text-center bg-white p-16 rounded-3xl shadow-sm border border-stone-100 max-w-md w-full">
          <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart size={40} className="text-orange-500" />
          </div>
          <h2 className="text-2xl font-black text-stone-900 mb-3 tracking-tight">Your cart is empty</h2>
          <p className="text-stone-500 mb-8 font-medium">Looks like you haven't added anything delicious yet.</p>
          <button onClick={() => navigate('/restaurants')} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-orange-600/30 transition-all hover:scale-105">
            Browse Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-28 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-stone-500 hover:text-orange-600 mb-8 font-semibold transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-stone-100">
          <ArrowLeft size={18} /> Back
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Cart Items & Details */}
          <div className="flex-1 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100">
              <h1 className="text-3xl font-black text-stone-900 mb-1 tracking-tight">Review Order</h1>
              <p className="text-stone-500 font-medium mb-8">From <strong className="text-stone-900">{cart.restaurantName}</strong></p>

              {/* Cart Items */}
              <div className="space-y-4">
                {cart.items.map(item => (
                  <div key={item._id} className="p-4 rounded-2xl border border-stone-100 hover:border-orange-200 transition-colors bg-stone-50/50 flex flex-col sm:flex-row sm:items-center gap-4 group">
                    <div className="flex-1 flex items-start gap-4">
                      {item.isVeg
                        ? <div className="mt-1 shrink-0 w-5 h-5 rounded border-2 border-green-600 flex items-center justify-center"><div className="w-2.5 h-2.5 rounded-full bg-green-600" /></div>
                        : <div className="mt-1 shrink-0 w-5 h-5 rounded border-2 border-red-600 flex items-center justify-center"><div className="w-2.5 h-2.5 rounded-full bg-red-600" /></div>
                      }
                      <div>
                        <h4 className="font-bold text-stone-900 text-lg">{item.name}</h4>
                        <div className="text-orange-600 font-bold mt-1">₹{(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 mt-2 sm:mt-0">
                      <div className="flex items-center gap-3 bg-white border border-stone-200 p-1 rounded-xl shadow-sm">
                        <button onClick={() => updateQuantity(item._id, -1)} className="w-8 h-8 rounded-lg bg-stone-50 text-stone-600 hover:bg-stone-200 flex items-center justify-center font-bold transition-colors"><Minus size={16} /></button>
                        <span className="font-bold text-stone-900 w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, 1)} className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 flex items-center justify-center font-bold transition-colors"><Plus size={16} /></button>
                      </div>
                      <button onClick={() => removeItem(item._id)} className="w-10 h-10 flex items-center justify-center text-stone-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors shrink-0">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100">
              <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-3"><MapPin size={22} className="text-orange-500" /> Delivery Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-stone-700 mb-2">Street Address *</label>
                  <input type="text" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-stone-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">City *</label>
                  <input type="text" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-stone-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">State</label>
                  <input type="text" value={address.state} onChange={e => setAddress({...address, state: e.target.value})} className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-stone-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">ZIP Code</label>
                  <input type="text" value={address.zipCode} onChange={e => setAddress({...address, zipCode: e.target.value})} className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-stone-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all" />
                </div>
              </div>
            </div>

            {/* Payment & Notes combined */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100">
                <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-3"><CreditCard size={22} className="text-orange-500" /> Payment</h3>
                <div className="space-y-3">
                  {[{ id: 'cod', label: 'Cash on Delivery', icon: '💵' }].map(pm => (
                    <button key={pm.id} onClick={() => setPaymentMethod(pm.id)}
                      className={`w-full p-4 rounded-xl font-bold flex items-center gap-3 border-2 transition-all ${
                        paymentMethod === pm.id ? 'border-orange-500 bg-orange-50/50 text-orange-700' : 'border-stone-100 bg-white text-stone-600 hover:border-stone-200 hover:bg-stone-50'
                      }`}>
                      <span className="text-xl">{pm.icon}</span> {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100">
                <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-3"><Package size={22} className="text-orange-500" /> Instructions</h3>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="E.g., Don't ring the doorbell, extra spicy..." className="w-full h-32 bg-stone-50 border border-stone-200 p-4 rounded-xl text-stone-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none" />
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary Fixed Sidebar */}
          <div className="lg:w-96 shrink-0">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 sticky top-28">
              <h3 className="text-2xl font-black text-stone-900 mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-6 text-stone-600 font-medium">
                <div className="flex justify-between items-center bg-stone-50 p-3 rounded-xl">
                  <span>Subtotal</span>
                  <span className="text-stone-900 font-bold">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center bg-stone-50 p-3 rounded-xl">
                  <span>Delivery Fee</span>
                  <span className="text-stone-900 font-bold">₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center bg-stone-50 p-3 rounded-xl">
                  <span>Tax & Charges</span>
                  <span className="text-stone-900 font-bold">₹{tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t-2 border-dashed border-stone-200 pt-6 mb-8">
                <div className="flex justify-between items-end">
                  <span className="text-lg font-bold text-stone-900">Total Amount</span>
                  <span className="text-4xl font-black text-orange-600 tracking-tight">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button onClick={handlePlaceOrder} disabled={loading}
                className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold text-lg py-5 rounded-2xl shadow-xl shadow-stone-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:-translate-y-1">
                {loading ? (
                  <span className="animate-spin w-6 h-6 border-4 border-white/30 border-t-white rounded-full" />
                ) : (
                  <>Place Order <CheckCircle size={20} /></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
