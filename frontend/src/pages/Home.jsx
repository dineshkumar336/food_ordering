import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Star, MapPin, Truck, ChevronRight, Play, UtensilsCrossed } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen selection:bg-orange-500 selection:text-white bg-white overflow-x-hidden pt-28">
      
      {/* VIBRANT LIGHT-THEME HERO */}
      <section className="relative pb-24 lg:pb-32 isolate">
        {/* Maximum Vibrancy Light Background Elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-orange-400 to-orange-600 rounded-full blur-[90px] opacity-[0.15] -mr-40 -mt-20 animate-pulse-glow pointer-events-none" />
        <div className="absolute top-40 left-0 w-[600px] h-[600px] bg-yellow-400 rounded-full blur-[100px] opacity-[0.15] -ml-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content - Pure White & Orange */}
            <div className="lg:col-span-7 relative z-20">
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-orange-50 text-orange-600 font-extrabold text-sm mb-8 shadow-sm border border-orange-200 uppercase tracking-wider">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                </span>
                #1 Food App in the City
              </div>
              
              <h1 className="text-6xl md:text-8xl lg:text-[6.5rem] font-black tracking-tighter text-stone-900 leading-[0.9] mb-8">
                CRAVING FAST <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">DELIVERY?</span>
              </h1>
              
              <p className="text-xl md:text-3xl text-stone-600 mb-12 leading-relaxed font-bold max-w-xl">
                Hot, fresh, and unbelievably fast. Your favorite local meals are just a tap away.
              </p>

              {/* Explore CTA */}
              <div className="mb-12">
                <Link to="/login" className="inline-flex bg-orange-500 hover:bg-orange-600 text-white px-12 py-5 rounded-2xl font-black transition-all shadow-lg shadow-orange-500/30 items-center justify-center gap-2 group/btn transform hover:scale-[1.02] active:scale-95 text-lg">
                  EXPLORE <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-6">
                <div className="flex -space-x-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-14 h-14 rounded-full border-4 border-white bg-stone-200 flex items-center justify-center overflow-hidden shadow-md">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+20}`} alt="user" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex text-orange-500 mb-1 filter drop-shadow-sm">
                    {[1,2,3,4,5].map(i => <Star key={i} size={20} fill="currentColor" />)}
                  </div>
                  <p className="font-extrabold text-stone-800 text-lg">Loved by 50,000+ Foodies</p>
                </div>
              </div>
            </div>

            {/* Right Content - Vibrant Pop-Out Graphic */}
            <div className="lg:col-span-5 relative hidden lg:flex h-full items-center justify-center">
              <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center">
                
                {/* Massive Solid Backdrop Shapes for extreme vibrance */}
                <div className="absolute inset-2 bg-yellow-300 rounded-full transform rotate-12 scale-105 shadow-xl" />
                <div className="absolute inset-0 bg-orange-500 rounded-[3rem] transform -rotate-6 shadow-2xl" />
                
                {/* Image Clipping Container */}
                <div className="absolute inset-4 rounded-[2.5rem] overflow-hidden bg-white z-10 shadow-inner block group cursor-pointer hover:scale-105 transition-transform duration-500">
                  <img 
                    src="/images/burger.png" 
                    alt="Massive Delicious Burger" 
                    className="w-full h-full object-cover object-center mix-blend-multiply scale-125 group-hover:scale-[1.35] transition-transform duration-700 group-hover:-rotate-3" 
                  />
                </div>

                {/* Floating Badges */}
                <div className="absolute -left-12 top-24 bg-white p-5 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex items-center gap-4 z-30 animate-float transform rotate-3 border border-stone-100">
                  <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
                    <Clock size={28} />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-stone-400 uppercase tracking-widest leading-none mb-1">Delivered</p>
                    <p className="text-xl font-black text-stone-900 tracking-tight leading-none">Under <span className="text-green-500">20 Min</span></p>
                  </div>
                </div>

                <div className="absolute -right-8 bottom-24 bg-white p-5 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex items-center gap-4 z-30 animate-float transform -rotate-3 border border-stone-100" style={{ animationDelay: '1.5s' }}>
                  <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
                    <Star size={28} fill="currentColor" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-stone-400 uppercase tracking-widest leading-none mb-1">Top Quality</p>
                    <p className="text-xl font-black text-stone-900 tracking-tight leading-none">4.9/5.0</p>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Solid Vibrant Block Categories Section */}
      <section className="py-24 bg-stone-50 relative border-t-2 border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 text-orange-600 font-bold tracking-widest uppercase mb-4 text-sm">
                <UtensilsCrossed size={16} /> Trending Menus
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-stone-900 tracking-tight leading-[0.9] mb-4">
                Satisfy Any <span className="text-orange-600 underline decoration-8 underline-offset-8">Craving.</span>
              </h2>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Category 1 - Hot Orange */}
            <Link to="/restaurants" className="group relative rounded-[2.5rem] p-10 cursor-pointer overflow-hidden isolate shadow-xl shadow-orange-500/20 transform hover:-translate-y-2 transition-all duration-300 bg-orange-500 block">
              <div className="w-56 h-56 mx-auto mb-8 bg-white rounded-full p-2 shadow-2xl transform group-hover:-translate-y-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 ease-out z-10 relative">
                <img src="/images/pizza.png" alt="Pizza" className="w-full h-full object-cover rounded-full mix-blend-multiply" />
              </div>
              <div className="relative z-10">
                <h3 className="text-4xl font-black text-white mb-3 tracking-tight drop-shadow-md">Pizza</h3>
                <p className="text-orange-100 font-bold text-lg line-clamp-2 mb-8">Authentic wood-fired crusts topped with premium imported mozzarella and fresh basil.</p>
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-orange-600 group-hover:bg-stone-900 group-hover:text-white transition-all shadow-lg transform group-hover:scale-110">
                  <ArrowRight size={28} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Category 2 - Bright Green */}
            <Link to="/restaurants" className="group relative rounded-[2.5rem] p-10 cursor-pointer overflow-hidden isolate shadow-xl shadow-green-500/20 transform hover:-translate-y-2 transition-all duration-300 bg-green-500 mt-0 md:mt-10 block">
              <div className="w-56 h-56 mx-auto mb-8 bg-white rounded-full p-2 shadow-2xl transform group-hover:-translate-y-8 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-700 ease-out z-10 relative">
                <img src="/images/burger.png" alt="Burger" className="w-full h-full object-cover rounded-full mix-blend-multiply" />
              </div>
              <div className="relative z-10">
                <h3 className="text-4xl font-black text-white mb-3 tracking-tight drop-shadow-md">Burgers</h3>
                <p className="text-green-50 font-bold text-lg line-clamp-2 mb-8">Double smashed beef patties, melted american cheese, and our secret house sauce.</p>
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-green-600 group-hover:bg-stone-900 group-hover:text-white transition-all shadow-lg transform group-hover:scale-110">
                  <ArrowRight size={28} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Category 3 - Cherry Red */}
            <Link to="/restaurants" className="group relative rounded-[2.5rem] p-10 cursor-pointer overflow-hidden isolate shadow-xl shadow-red-500/20 transform hover:-translate-y-2 transition-all duration-300 bg-red-500 mt-0 md:mt-20 block">
              <div className="w-56 h-56 mx-auto mb-8 bg-white rounded-full p-2 shadow-2xl transform group-hover:-translate-y-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 ease-out z-10 relative">
                <img src="/images/ramen.png" alt="Ramen" className="w-full h-full object-cover rounded-full mix-blend-multiply" />
              </div>
              <div className="relative z-10">
                <h3 className="text-4xl font-black text-white mb-3 tracking-tight drop-shadow-md">Ramen</h3>
                <p className="text-red-100 font-bold text-lg line-clamp-2 mb-8">24-hour slow-cooked pork broth paired with fresh noodles and soft-boiled eggs.</p>
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-red-600 group-hover:bg-stone-900 group-hover:text-white transition-all shadow-lg transform group-hover:scale-110">
                  <ArrowRight size={28} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
          

        </div>
      </section>

      {/* Dark/Neon Banner Section */}
      <section className="py-24 bg-stone-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-stone-900 rounded-[3rem] p-12 lg:p-24 overflow-hidden shadow-2xl relative">
            
            {/* Absolute Abstract Blobs for neon glow inside the dark container */}
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-orange-600 rounded-full blur-[120px] opacity-40 mix-blend-screen pointer-events-none animate-pulse-glow" />
            <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500 rounded-full blur-[120px] opacity-30 mix-blend-screen pointer-events-none" />

            <div className="grid lg:grid-cols-2 lg:items-center gap-16 relative z-10">
              <div className="text-white">
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-orange-500/20 text-orange-400 font-bold text-sm mb-6 border border-orange-500/30 uppercase tracking-widest">
                  <Star fill="currentColor" size={14} /> Partner With Us
                </div>
                <h2 className="text-5xl md:text-7xl font-black mb-8 leading-[1.05] tracking-tight">
                  Grow Your <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">Restaurant.</span>
                </h2>
                <p className="text-stone-300 text-xl md:text-2xl mb-12 max-w-lg leading-relaxed font-medium">
                  Boost your revenue by listing your restaurant on BiteBay. Reach thousands of hungry customers with zero upfront setup fees.
                </p>
                <div className="flex flex-col sm:flex-row gap-5">
                  <Link to="/register" className="bg-orange-500 hover:bg-orange-400 text-white px-8 py-5 rounded-2xl font-black transition-all shadow-xl shadow-orange-500/30 flex items-center justify-center gap-3 text-lg hover:-translate-y-1">
                    Become a Partner <ArrowRight size={20} />
                  </Link>

                </div>
              </div>
              
              <div className="hidden lg:flex justify-end perspective-1000 relative">
                {/* 3D Mockup of Partner Dashboard */}
                <div className="w-[120%] h-[500px] bg-stone-800 rounded-3xl border-4 border-stone-700 shadow-2xl overflow-hidden transform rotate-y-[-15deg] rotate-x-[5deg] rotate-z-[2deg] translate-x-10 relative">
                  
                  {/* Dashboard Header Mock */}
                  <div className="h-16 border-b border-stone-700 flex items-center px-6 justify-between bg-stone-900/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white"><UtensilsCrossed size={16} /></div>
                      <div className="h-4 w-32 bg-stone-700 rounded-full" />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-stone-700" />
                  </div>

                  {/* Dashboard Content Mock */}
                  <div className="p-8 grid grid-cols-2 gap-6">
                    <div className="col-span-2 flex gap-6">
                       <div className="flex-1 bg-stone-700/50 h-32 rounded-2xl border border-stone-600 p-5 flex flex-col justify-center">
                         <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mb-3"><ArrowRight size={16} /></div>
                         <div className="h-4 w-24 bg-stone-600 rounded-full mb-2" />
                         <div className="h-6 w-32 bg-white/80 rounded-full" />
                       </div>
                       <div className="flex-1 bg-orange-500/20 h-32 rounded-2xl border border-orange-500/30 p-5 flex flex-col justify-center">
                         <div className="w-10 h-10 rounded-full bg-orange-500/30 text-orange-400 flex items-center justify-center mb-3"><Star fill="currentColor" size={16} /></div>
                         <div className="h-4 w-24 bg-orange-500/50 rounded-full mb-2" />
                         <div className="h-6 w-32 bg-orange-400 rounded-full" />
                       </div>
                    </div>
                    <div className="h-20 bg-stone-700/30 rounded-2xl border border-stone-700/50" />
                    <div className="h-20 bg-stone-700/30 rounded-2xl border border-stone-700/50" />
                    <div className="h-20 bg-stone-700/30 rounded-2xl border border-stone-700/50" />
                    <div className="h-20 bg-stone-700/30 rounded-2xl border border-stone-700/50" />
                  </div>
                  
                  {/* Glowing absolute badges on the mockup */}
                  <div className="absolute top-24 -right-10 bg-green-500 text-white font-black px-6 py-3 rounded-xl shadow-lg shadow-green-500/50 border-2 border-green-400 transform -rotate-12 animate-pulse">
                    +₹4,500 Today
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
