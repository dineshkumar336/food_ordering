import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAvailableOrders, confirmOrderPickup, getMyDeliveries, updateDeliveryStatus, toggleAvailability } from '../services/api';
import { Package, MapPin, Phone, CheckCircle, Truck, DollarSign, LocateFixed, Eye } from 'lucide-react';

const statusColors = { 
  placed: 'bg-orange-100 text-orange-700', 
  confirmed: 'bg-blue-100 text-blue-700', 
  preparing: 'bg-purple-100 text-purple-700', 
  ready: 'bg-emerald-100 text-emerald-700', 
  assigned: 'bg-cyan-100 text-cyan-700',
  picked_up: 'bg-cyan-100 text-cyan-700', 
  on_the_way: 'bg-yellow-100 text-yellow-700', 
  delivered: 'bg-green-100 text-green-700', 
  cancelled: 'bg-red-100 text-red-700' 
};
const statusLabels = { 
  placed: 'Placed', 
  confirmed: 'Confirmed', 
  preparing: 'Preparing', 
  ready: 'Ready', 
  assigned: 'Assigned', 
  picked_up: 'Picked Up', 
  on_the_way: 'On Way', 
  delivered: 'Delivered', 
  cancelled: 'Cancelled' 
};

const DeliveryDashboard = () => {
  const { user, setUser } = useAuth();
  const [available, setAvailable] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [activeTab, setActiveTab] = useState('available');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [avRes, delRes] = await Promise.all([getAvailableOrders(), getMyDeliveries()]);
      if (avRes.data.success) setAvailable(avRes.data.orders);
      if (delRes.data.success) setMyDeliveries(delRes.data.orders);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAccept = async (orderId) => {
    try { await confirmOrderPickup(orderId); fetchData(); setActiveTab('active'); } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const handleStatusUpdate = async (orderId, status) => {
    try { await updateDeliveryStatus(orderId, status); fetchData(); } catch (err) { alert('Failed'); }
  };

  const handleToggle = async () => {
    try {
      const { data } = await toggleAvailability();
      if (data.success) setUser({ ...user, isAvailable: data.isAvailable });
    } catch (err) { alert('Failed'); }
  };

  const activeDeliveries = myDeliveries.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const completedDeliveries = myDeliveries.filter(o => o.status === 'delivered');
  const totalEarnings = completedDeliveries.length * 40; // ₹40 per delivery

  if (loading) return <div className="min-h-screen bg-stone-50 flex items-center justify-center"><div className="animate-spin w-12 h-12 border-4 border-orange-100 border-t-orange-600 rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-stone-50 pt-28 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="bg-stone-900 rounded-3xl p-10 mb-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-orange-500 rounded-full blur-3xl -mr-20 -mt-20 opacity-20 pointer-events-none" />
          <div className="relative z-10 text-white">
            <h1 className="text-4xl font-black mb-2 tracking-tight">Hey, <span className="text-orange-500">{user?.name}!</span> 🛵</h1>
            <p className="text-stone-400 text-lg font-medium">Ready to hit the road and deliver happiness?</p>
          </div>
          <div className="relative z-10">
            <button onClick={handleToggle} className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all border-2 w-full md:w-auto shadow-sm ${user?.isAvailable ? 'bg-green-500 border-green-500 text-white shadow-green-500/20' : 'bg-transparent border-stone-600 text-stone-300 hover:border-stone-400'}`}>
              <div className={`w-3 h-3 rounded-full ${user?.isAvailable ? 'bg-white animate-pulse' : 'bg-stone-500'}`} />
              {user?.isAvailable ? 'YOU ARE ONLINE' : 'GO ONLINE'}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {[
            { icon: Truck, label: 'Active Deliveries', value: activeDeliveries.length, colorClass: 'text-blue-600', bgClass: 'bg-blue-50' },
            { icon: CheckCircle, label: 'Completed Today', value: completedDeliveries.length, colorClass: 'text-green-600', bgClass: 'bg-green-50' },
            { icon: DollarSign, label: 'Total Earnings', value: `₹${totalEarnings}`, colorClass: 'text-orange-600', bgClass: 'bg-orange-50' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 flex items-center gap-5 hover:shadow-md transition-shadow">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${s.bgClass} ${s.colorClass}`}>
                <s.icon size={28} />
              </div>
              <div>
                <p className="text-3xl font-black text-stone-900 tracking-tight">{s.value}</p>
                <p className="text-sm font-semibold text-stone-500 uppercase tracking-widest">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-4 mb-8">
          {[
            { id: 'available', label: 'Incoming Orders', count: available.length, icon: Package },
            { id: 'active', label: 'My Deliveries', count: activeDeliveries.length, icon: Truck },
            { id: 'history', label: 'History & Earnings', count: completedDeliveries.length, icon: CheckCircle },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3.5 rounded-2xl font-bold flex items-center gap-3 transition-all outline-none ${
                  activeTab === tab.id 
                  ? 'bg-stone-900 border-stone-900 text-white shadow-xl shadow-stone-900/20' 
                  : 'bg-white border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-300 shadow-sm border'
                }`}>
                <Icon size={18} /> {tab.label} 
                <span className={`px-2 py-0.5 rounded-lg text-xs ${activeTab === tab.id ? 'bg-white/20' : 'bg-stone-100'}`}>{tab.count}</span>
              </button>
            )
          })}
        </div>

        {/* Available Orders */}
        {activeTab === 'available' && (
          <div className="grid gap-6">
            {!user?.isAvailable && (
              <div className="bg-amber-50 border-2 border-amber-200 text-amber-800 p-6 rounded-3xl font-bold text-center flex flex-col items-center justify-center gap-2">
                <span className="text-2xl">😴</span>
                You are currently offline. Go online to receive assigned deliveries!
              </div>
            )}
            
            {available.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-stone-100 shadow-sm">
                <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package size={40} className="text-stone-400" />
                </div>
                <h3 className="text-2xl font-bold text-stone-900 mb-2">No incoming orders</h3>
                <p className="text-stone-500 font-medium">Wait for a new order to arrive.</p>
              </div>
            ) : available.map(order => (
              <div key={order._id} className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 hover:border-orange-200 transition-colors flex flex-col sm:flex-row gap-6 items-center">
                <div className="flex-1 w-full space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1 block">Pickup From</span>
                      <p className="font-black text-stone-900 text-xl">{order.restaurant?.name}</p>
                    </div>
                    <div className="bg-green-50 text-green-700 font-black text-xl px-4 py-2 rounded-xl">₹40 <span className="text-xs font-bold text-green-600 uppercase tracking-widest block">Earnings</span></div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-100">
                    <MapPin className="text-orange-500 shrink-0" size={20} />
                    <p className="font-medium text-stone-700">{order.deliveryAddress?.street}, {order.deliveryAddress?.city}</p>
                  </div>
                </div>

                <div className="w-full sm:w-auto shrink-0">
                  <button onClick={() => handleAccept(order._id)} disabled={!user?.isAvailable}
                    className="w-full sm:w-48 bg-orange-600 hover:bg-orange-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold py-5 rounded-2xl shadow-lg shadow-orange-600/20 transition-all flex flex-col items-center justify-center gap-1">
                    <LocateFixed size={24} />
                    CONFIRM PICKUP
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Active Deliveries */}
        {activeTab === 'active' && (
          <div className="grid gap-6">
            {activeDeliveries.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-stone-100 shadow-sm">
                <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Truck size={40} className="text-stone-400" />
                </div>
                <h3 className="text-2xl font-bold text-stone-900 mb-2">No active deliveries</h3>
                <p className="text-stone-500 font-medium">Assigned orders will appear here for pickup confirmation.</p>
              </div>
            ) : activeDeliveries.map(order => (
              <div key={order._id} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-orange-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-orange-500" />
                
                <div className="flex flex-col lg:flex-row gap-8 pl-4">
                  <div className="flex-1 space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Order #{order._id.slice(-6)}</p>
                        <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${statusColors[order.status]} inline-block`}>
                          {statusLabels[order.status]}
                        </span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Pickup */}
                      <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100">
                        <div className="flex items-center gap-2 text-stone-500 font-bold text-xs uppercase tracking-widest mb-2"><StoreIcon /> PICKUP</div>
                        <p className="font-bold text-stone-900 text-lg mb-1">{order.restaurant?.name}</p>
                        <p className="text-sm font-medium text-stone-600">Restaurant Address goes here</p>
                      </div>
                      
                      {/* Dropoff */}
                      <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100">
                        <div className="flex items-center gap-2 text-orange-600 font-bold text-xs uppercase tracking-widest mb-2"><MapPin size={16}/> DROPOFF</div>
                        <p className="font-bold text-stone-900 text-lg mb-1">{order.user?.name || 'Customer'}</p>
                        <p className="text-sm font-medium text-stone-700">{order.deliveryAddress?.street}, {order.deliveryAddress?.city}</p>
                        <div className="mt-3 flex items-center gap-2 text-sm font-bold text-orange-700 bg-white p-2 rounded-xl border border-orange-200">
                          <Phone size={14} className="opacity-70" /> {order.user?.phone || '+91 9xxxx xxxxx'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-64 shrink-0 flex flex-col justify-end gap-3">
                    {order.status === 'picked_up' && (
                      <button onClick={() => handleStatusUpdate(order._id, 'on_the_way')} className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-stone-900/20">
                        START RIDE
                      </button>
                    )}
                    {order.status === 'on_the_way' && (
                      <button onClick={() => handleStatusUpdate(order._id, 'delivered')} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-5 rounded-2xl transition-all shadow-xl shadow-green-500/30 flex items-center justify-center gap-2 text-lg hover:-translate-y-1">
                        <CheckCircle size={24} /> Mark Delivered
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* History */}
        {activeTab === 'history' && (
          <div className="grid gap-4">
            {completedDeliveries.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-stone-100 shadow-sm">
                <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={40} className="text-stone-400" />
                </div>
                <h3 className="text-2xl font-bold text-stone-900 mb-2">No history</h3>
                <p className="text-stone-500 font-medium">Completed deliveries will appear here.</p>
              </div>
            ) : completedDeliveries.map(order => (
              <div key={order._id} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity">
                <div>
                  <p className="font-bold text-stone-900 text-lg mb-1">{order.restaurant?.name}</p>
                  <p className="text-sm font-medium text-stone-500">{new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="text-right bg-green-50 px-4 py-2 rounded-xl">
                  <span className="text-green-600 font-black text-xl">+₹40</span>
                  <p className="text-xs font-bold text-green-700 uppercase tracking-widest mt-0.5">Earned</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

export default DeliveryDashboard;
