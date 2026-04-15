import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserOrders, cancelOrder } from '../services/api';
import { Package, Clock, ShoppingBag, TrendingUp, MapPin, ChevronRight, UtensilsCrossed } from 'lucide-react';

const statusColors = {
  placed: { bg: 'bg-orange-100', text: 'text-orange-700', badge: 'bg-orange-500' },
  confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', badge: 'bg-blue-500' },
  preparing: { bg: 'bg-purple-100', text: 'text-purple-700', badge: 'bg-purple-500' },
  ready: { bg: 'bg-emerald-100', text: 'text-emerald-700', badge: 'bg-emerald-500' },
  assigned: { bg: 'bg-cyan-100', text: 'text-cyan-700', badge: 'bg-cyan-500' },
  picked_up: { bg: 'bg-cyan-100', text: 'text-cyan-700', badge: 'bg-cyan-500' },
  on_the_way: { bg: 'bg-yellow-100', text: 'text-yellow-700', badge: 'bg-yellow-500' },
  delivered: { bg: 'bg-green-100', text: 'text-green-700', badge: 'bg-green-500' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', badge: 'bg-red-500' }
};

const statusLabels = {
  placed: 'Order Placed', 
  confirmed: 'Order Confirmed', 
  preparing: 'Preparing Food',
  ready: 'Ready for Delivery', 
  assigned: 'Delivery Assigned',
  picked_up: 'Order Picked Up', 
  on_the_way: 'On the Way',
  delivered: 'Delivered Successfully', 
  cancelled: 'Order Cancelled'
};

const UserDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await getUserOrders();
      if (data.success) setOrders(data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      await cancelOrder(orderId);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const totalSpent = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.grandTotal, 0);

  return (
    <div className="min-h-screen bg-stone-50 pt-28 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl p-10 mb-8 shadow-sm border border-stone-100 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-yellow-100 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-4xl font-black text-stone-900 mb-3 tracking-tight">Hey, <span className="text-orange-600">{user?.name}!</span> 👋</h1>
            <p className="text-stone-500 text-lg font-medium">Welcome to your personalized dashboard.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { icon: Package, label: 'Total Orders', value: orders.length, colorClass: 'text-orange-600', bgClass: 'bg-orange-50' },
            { icon: Clock, label: 'Active Orders', value: activeOrders.length, colorClass: 'text-blue-600', bgClass: 'bg-blue-50' },
            { icon: TrendingUp, label: 'Lifetime Spent', value: `₹${totalSpent.toFixed(0)}`, colorClass: 'text-green-600', bgClass: 'bg-green-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 flex items-center gap-5 hover:shadow-md transition-shadow">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bgClass} ${stat.colorClass}`}>
                <stat.icon size={28} />
              </div>
              <div>
                <p className="text-3xl font-black text-stone-900 tracking-tight">{stat.value}</p>
                <p className="text-sm font-semibold text-stone-500 uppercase tracking-widest">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Action */}
        <Link to="/restaurants" className="block bg-orange-600 rounded-3xl p-6 mb-10 shadow-lg shadow-orange-600/20 hover:scale-[1.01] transition-transform text-white group relative overflow-hidden">
          <div className="absolute right-0 top-0 w-48 h-48 bg-white/20 rounded-full blur-3xl -mr-10 -mt-10" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shrink-0">🍽️</div>
              <div>
                <p className="text-2xl font-black mb-1">Hungry again?</p>
                <p className="text-orange-100 font-medium">Browse our top rated restaurants and place a new order.</p>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-white text-orange-600 flex items-center justify-center shrink-0 group-hover:translate-x-2 transition-transform shadow-sm">
              <ChevronRight size={24} />
            </div>
          </div>
        </Link>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-4 hide-scrollbar">
          {['all', 'placed', 'confirmed', 'preparing', 'ready', 'on_the_way', 'delivered', 'cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                filter === f 
                  ? 'bg-stone-900 text-white border-stone-900 shadow-md' 
                  : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400 hover:bg-stone-50'
              }`}>
              {f === 'all' ? 'All Orders' : statusLabels[f]}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-24">
            <div className="animate-spin w-12 h-12 border-4 border-orange-100 border-t-orange-600 rounded-full mx-auto" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-stone-100 shadow-sm">
            <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={40} className="text-stone-400" />
            </div>
            <h3 className="text-2xl font-bold text-stone-900 mb-2">No orders found</h3>
            <p className="text-stone-500 mb-6 font-medium">Any recent orders will appear here.</p>
            <Link to="/restaurants" className="text-orange-600 font-bold hover:underline">Start Exploring</Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredOrders.map(order => {
              const colors = statusColors[order.status];
              return (
                <div key={order._id} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-stone-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow group">
                  
                  {/* Left: General Info */}
                  <div className="flex-1 md:pr-6 md:border-r border-stone-100">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center text-stone-600 shrink-0">
                          <UtensilsCrossed size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-stone-900 text-xl tracking-tight">{order.restaurant?.name || 'Restaurant'}</h3>
                          <p className="text-sm font-medium text-stone-500">{new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                      
                      <div className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm ${colors.bg} ${colors.text}`}>
                        <span className={`w-2 h-2 rounded-full ${colors.badge} shadow-sm`} /> {statusLabels[order.status]}
                      </div>
                    </div>

                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-sm font-medium text-stone-700 py-1.5 border-b border-stone-100 last:border-0">
                          <span><span className="text-stone-400 mr-2">{item.quantity}x</span> {item.name}</span>
                          <span className="text-stone-900 font-bold">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Payment & Status details */}
                  <div className="md:w-64 flex flex-col justify-between shrink-0">
                    <div className="mb-4">
                      <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Total Amount</p>
                      <p className="text-3xl font-black text-stone-900 tracking-tight">₹{order.grandTotal}</p>
                      <p className="text-sm font-medium text-stone-500 mt-1 capitalize"><MapPin size={14} className="inline mr-1 text-orange-500" /> {order.deliveryAddress?.city}</p>
                    </div>

                    <div className="flex flex-col gap-3">
                      <button className="w-full bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold py-3 rounded-xl transition-colors border border-orange-200">
                        View Details
                      </button>
                      
                      {['placed', 'confirmed'].includes(order.status) && (
                        <button onClick={() => handleCancel(order._id)} className="w-full text-red-500 hover:bg-red-50 font-bold py-3 rounded-xl transition-colors">
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
