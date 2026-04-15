import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyRestaurant, addMenuItem, updateMenuItem, deleteMenuItem, getRestaurantOrders, updateOrderStatus, getAvailableDeliveryBoys, assignDeliveryBoy } from '../services/api';
import { Plus, Trash2, Edit3, Package, DollarSign, Clock, ChefHat, X, Check, Eye, Truck } from 'lucide-react';

const statusFlow = ['placed', 'confirmed', 'preparing', 'ready'];
const statusLabels = { 
  placed: 'Placed', 
  confirmed: 'Confirmed', 
  preparing: 'Preparing', 
  ready: 'Ready for Delivery', 
  assigned: 'Delivery Assigned', 
  picked_up: 'Picked Up', 
  on_the_way: 'On the Way', 
  delivered: 'Delivered', 
  cancelled: 'Cancelled' 
};
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

const RestaurantDashboard = () => {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(true);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showAssignDelivery, setShowAssignDelivery] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [menuForm, setMenuForm] = useState({ name: '', description: '', price: '', category: '', isVeg: false });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [restRes, ordRes] = await Promise.all([getMyRestaurant(), getRestaurantOrders()]);
      if (restRes.data.success) { setRestaurant(restRes.data.restaurant); setMenuItems(restRes.data.menuItems || []); }
      if (ordRes.data.success) setOrders(ordRes.data.orders);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAddMenu = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateMenuItem(editingId, { ...menuForm, price: Number(menuForm.price) });
      } else {
        await addMenuItem({ ...menuForm, price: Number(menuForm.price) });
      }
      setMenuForm({ name: '', description: '', price: '', category: '', isVeg: false });
      setShowAddMenu(false); setEditingId(null);
      fetchData();
    } catch (err) { alert('Failed to save menu item'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    try { await deleteMenuItem(id); fetchData(); } catch (err) { alert('Failed'); }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try { await updateOrderStatus(orderId, newStatus); fetchData(); } catch (err) { alert('Failed'); }
  };

  const handleAssignDelivery = async (orderId, deliveryBoyId) => {
    try {
      await assignDeliveryBoy(orderId, deliveryBoyId);
      setShowAssignDelivery(false);
      setSelectedOrder(null);
      fetchData();
    } catch (err) {
      alert('Failed to assign delivery boy');
    }
  };

  const openAssignDelivery = async (order) => {
    setSelectedOrder(order);
    try {
      const res = await getAvailableDeliveryBoys();
      if (res.data.success) {
        setDeliveryBoys(res.data.deliveryBoys);
        setShowAssignDelivery(true);
      }
    } catch (err) {
      alert('Failed to load delivery boys');
    }
  };

  const getNextStatus = (current) => {
    const idx = statusFlow.indexOf(current);
    return idx >= 0 && idx < statusFlow.length - 1 ? statusFlow[idx + 1] : null;
  };

  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString());
  const todayRevenue = todayOrders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.grandTotal, 0);
  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));

  if (loading) return <div className="min-h-screen bg-stone-50 flex items-center justify-center"><div className="animate-spin w-12 h-12 border-4 border-orange-100 border-t-orange-600 rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-stone-50 pt-28 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Dashboard */}
        <div className="bg-white rounded-3xl p-10 mb-8 shadow-sm border border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-orange-100 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-4xl font-black text-stone-900 mb-2 tracking-tight">{restaurant?.name || 'Your Restaurant'}</h1>
            <p className="text-stone-500 text-lg font-medium">Manage your restaurant, menu, and incoming orders.</p>
          </div>
          <div className="flex gap-4 relative z-10">
            <div className="bg-stone-50 px-6 py-3 rounded-2xl border border-stone-100 text-center shadow-sm">
              <p className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-1">Status</p>
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${restaurant?.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {restaurant?.isOpen ? '● Open Now' : '● Closed'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { icon: Package, label: "Today's Orders", value: todayOrders.length, colorClass: 'text-orange-600', bgClass: 'bg-orange-50' },
            { icon: DollarSign, label: "Today's Revenue", value: `₹${todayRevenue.toFixed(0)}`, colorClass: 'text-green-600', bgClass: 'bg-green-50' },
            { icon: Clock, label: 'Active Orders', value: activeOrders.length, colorClass: 'text-blue-600', bgClass: 'bg-blue-50' },
            { icon: ChefHat, label: 'Menu Items', value: menuItems.length, colorClass: 'text-purple-600', bgClass: 'bg-purple-50' },
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
        <div className="flex gap-4 mb-8">
          {[
            { id: 'orders', label: 'Order Management', icon: Package },
            { id: 'menu', label: 'Menu Items', icon: ChefHat }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all outline-none ${
                  activeTab === tab.id 
                  ? 'bg-stone-900 border-stone-900 text-white shadow-xl shadow-stone-900/20' 
                  : 'bg-white border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-300 shadow-sm border'
                }`}>
                <Icon size={20} /> {tab.label}
              </button>
            )
          })}
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="grid gap-6">
            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-stone-100 shadow-sm">
                <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package size={40} className="text-stone-400" />
                </div>
                <h3 className="text-2xl font-bold text-stone-900 mb-2">No orders yet</h3>
                <p className="text-stone-500 font-medium">New incoming orders will appear here automatically.</p>
              </div>
            ) : orders.map(order => (
              <div key={order._id} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-stone-100 flex flex-col md:flex-row gap-8 hover:shadow-md transition-shadow">
                
                {/* Order Details Left */}
                <div className="flex-1">
                  <div className="flex flex-wrap justify-between items-start mb-6 gap-4">
                    <div>
                      <p className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-1">Order #{order._id.slice(-6)}</p>
                      <h3 className="text-xl font-bold text-stone-900">{order.user?.name || 'Customer'}</h3>
                      <p className="text-sm font-medium text-stone-500">{new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} • {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                  </div>
                  
                  <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100 space-y-2">
                    {order.items?.map((it, i) => (
                      <div key={i} className="flex justify-between items-center text-stone-700 font-medium pb-2 border-b border-stone-100 last:border-0 last:pb-0">
                        <span><span className="text-stone-400 mr-2">{it.quantity}x</span> {it.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Action Right */}
                <div className="md:w-64 shrink-0 flex flex-col justify-between">
                  <div className="mb-6">
                    <p className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-1">Order Value</p>
                    <p className="text-4xl font-black text-stone-900 tracking-tight">₹{order.grandTotal}</p>
                    {order.notes && <p className="text-sm text-orange-600 bg-orange-50 p-2 rounded-lg mt-3 border border-orange-100"><span className="font-bold">Note:</span> {order.notes}</p>}
                  </div>
                  
                  <div>
                    {order.status === 'ready' ? (
                      <button onClick={() => openAssignDelivery(order)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
                        <Truck size={20} /> Assign Delivery Boy
                      </button>
                    ) : getNextStatus(order.status) ? (
                      <button onClick={() => handleStatusUpdate(order._id, getNextStatus(order.status))}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-600/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
                        Mark as {statusLabels[getNextStatus(order.status)]} <Check size={20} />
                      </button>
                    ) : (
                      <div className="w-full bg-stone-100 text-stone-500 font-bold py-4 rounded-xl text-center border border-stone-200">
                        No further actions
                      </div>
                    )}
                    {order.deliveryBoy && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                        <p className="text-sm font-bold text-blue-700">Delivery Boy</p>
                        <p className="text-sm text-blue-600">{order.deliveryBoy.name}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div>
            <div className="flex justify-end mb-8">
              <button onClick={() => { setShowAddMenu(true); setEditingId(null); setMenuForm({ name: '', description: '', price: '', category: '', isVeg: false }); }}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-orange-600/20 flex items-center gap-2 hover:-translate-y-0.5">
                <Plus size={20} /> Add New Item
              </button>
            </div>

            {/* Add/Edit Modal */}
            {showAddMenu && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm px-4">
                <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative animate-fade-in-up border border-stone-100">
                  <button type="button" onClick={() => setShowAddMenu(false)} className="absolute top-6 right-6 w-10 h-10 bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-900 rounded-full flex items-center justify-center transition-colors">
                    <X size={20} />
                  </button>
                  <h3 className="text-2xl font-black text-stone-900 mb-6">{editingId ? 'Edit Menu Item' : 'Add New Item'}</h3>
                  
                  <form onSubmit={handleAddMenu} className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-2">Item Name</label>
                      <input type="text" value={menuForm.name} onChange={e => setMenuForm({...menuForm, name: e.target.value})} className="w-full bg-stone-50 border border-stone-200 px-4 py-3.5 rounded-xl text-stone-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 font-medium" required />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-2">Description</label>
                      <textarea value={menuForm.description} onChange={e => setMenuForm({...menuForm, description: e.target.value})} className="w-full h-24 bg-stone-50 border border-stone-200 p-4 rounded-xl text-stone-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 font-medium resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-stone-700 mb-2">Price (₹)</label>
                        <input type="number" value={menuForm.price} onChange={e => setMenuForm({...menuForm, price: e.target.value})} className="w-full bg-stone-50 border border-stone-200 px-4 py-3.5 rounded-xl text-stone-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 font-medium" required />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-stone-700 mb-2">Category</label>
                        <input type="text" placeholder="e.g. Starters" value={menuForm.category} onChange={e => setMenuForm({...menuForm, category: e.target.value})} className="w-full bg-stone-50 border border-stone-200 px-4 py-3.5 rounded-xl text-stone-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 font-medium" required />
                      </div>
                    </div>
                    
                    <label className="flex items-center gap-3 p-4 bg-stone-50 border border-stone-200 rounded-xl cursor-pointer mt-2 hover:bg-stone-100 transition-colors">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-colors ${menuForm.isVeg ? 'bg-green-500 border-green-500 text-white' : 'border-stone-300 bg-white'}`}>
                        {menuForm.isVeg && <Check size={16} />}
                      </div>
                      <input type="checkbox" checked={menuForm.isVeg} onChange={e => setMenuForm({...menuForm, isVeg: e.target.checked})} className="hidden" />
                      <span className="font-bold text-stone-700">Vegetarian Item</span>
                    </label>

                    <button type="submit" className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-4 rounded-xl shadow-xl shadow-stone-900/20 transition-all mt-6 text-lg hover:-translate-y-0.5">
                      {editingId ? 'Update Item' : 'Add to Menu'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Assign Delivery Modal */}
            {showAssignDelivery && selectedOrder && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm px-4">
                <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative animate-fade-in-up border border-stone-100">
                  <button type="button" onClick={() => { setShowAssignDelivery(false); setSelectedOrder(null); }} className="absolute top-6 right-6 w-10 h-10 bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-900 rounded-full flex items-center justify-center transition-colors">
                    <X size={20} />
                  </button>
                  <h3 className="text-2xl font-black text-stone-900 mb-6">Assign Delivery Boy</h3>
                  <p className="text-stone-600 mb-6">Order #{selectedOrder._id.slice(-6)} - {selectedOrder.user?.name}</p>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {deliveryBoys.length === 0 ? (
                      <p className="text-stone-500 text-center py-8">No available delivery boys</p>
                    ) : deliveryBoys.map(boy => (
                      <div key={boy._id} className="flex items-center justify-between p-4 bg-stone-50 border border-stone-200 rounded-xl hover:bg-stone-100 transition-colors">
                        <div>
                          <p className="font-bold text-stone-900">{boy.name}</p>
                          <p className="text-sm text-stone-500">{boy.phone} • {boy.vehicleType}</p>
                          <p className="text-sm text-stone-500">{boy.address?.city}, {boy.address?.state}</p>
                        </div>
                        <button onClick={() => handleAssignDelivery(selectedOrder._id, boy._id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors">
                          Assign
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Menu Items Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map(item => (
                <div key={item._id} className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 hover:shadow-md transition-shadow group">
                  <div className="flex items-start justify-between mb-3 gap-4">
                    <div className="flex items-center gap-3">
                      {item.isVeg ? <div className="mt-1 shrink-0 w-5 h-5 rounded border-2 border-green-600 flex items-center justify-center"><div className="w-2.5 h-2.5 rounded-full bg-green-600" /></div>
                        : <div className="mt-1 shrink-0 w-5 h-5 rounded border-2 border-red-600 flex items-center justify-center"><div className="w-2.5 h-2.5 rounded-full bg-red-600" /></div>}
                      <h4 className="font-bold text-stone-900 text-lg leading-tight">{item.name}</h4>
                    </div>
                    <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-lg font-black shrink-0">₹{item.price}</span>
                  </div>
                  <p className="text-sm font-medium text-stone-500 mb-4 line-clamp-2 min-h-10">{item.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-stone-100 mt-auto">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-400 bg-stone-50 px-2.5 py-1 rounded-md">{item.category}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setEditingId(item._id); setMenuForm({ name: item.name, description: item.description || '', price: item.price, category: item.category, isVeg: item.isVeg }); setShowAddMenu(true); }}
                        className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors" title="Edit">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => handleDelete(item._id)} 
                        className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDashboard;
