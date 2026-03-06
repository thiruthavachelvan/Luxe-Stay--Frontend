import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, User, Utensils, Award, Clock, Flame, Star } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const RestaurantPage = () => {
    const navigate = useNavigate();
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Signature Breakfast');
    const [searchQuery, setSearchQuery] = useState('');

    const tabs = ['Signature Breakfast', "Chef's Specials", 'Beverages & Bar', 'Resident Exclusive', 'Weekend Buffet'];

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const res = await fetch(`${__API_BASE__}/api/public/menu`);
                if (res.ok) {
                    const data = await res.json();
                    setMenuItems(data);
                }
            } catch (error) {
                console.error("Failed to load menu", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, []);

    const user = JSON.parse(sessionStorage.getItem('userData'));

    return (
        <div className="min-h-screen bg-navy-950 text-white font-sans selection:bg-gold-400 selection:text-navy-950">
            <Navbar />

            <main className="pt-40 pb-24 px-6 container mx-auto">
                {/* Hero Section - Cinematic Culinary */}
                <div className="relative h-[400px] w-full rounded-[40px] overflow-hidden mb-20 shadow-2xl glass-panel border-white/5 animate-in fade-in zoom-in-95 duration-1000">
                    <img
                        src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80"
                        alt="The Grand Brasserie"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/20 to-transparent"></div>
                    <div className="absolute bottom-16 left-16 max-w-2xl space-y-6">
                        <div className="flex items-center gap-4">
                            <span className="px-4 py-1.5 bg-gold-400 text-navy-950 text-[9px] font-black uppercase tracking-[0.3em] rounded-full shadow-2xl shadow-gold-400/20">The Michelin Registry</span>
                            <div className="flex gap-1 text-gold-400">
                                <Award className="w-4 h-4 fill-current" />
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-serif italic text-white tracking-tight">The Grand Brasserie</h1>
                        <p className="text-lg text-white/40 font-light leading-relaxed max-w-xl">
                            Experience culinary excellence engineered by Michelin-starred stewards in an atmosphere of profound sophistication.
                        </p>
                    </div>
                </div>

                {/* Navigation / Filters - Elevated Tabs */}
                <div className="flex justify-center mb-24">
                    <div className="glass-panel p-2 flex gap-2 overflow-x-auto scrollbar-hide border-white/5 bg-navy-950/40 backdrop-blur-2xl">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-shrink-0 px-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${activeTab === tab
                                    ? 'bg-gold-400 text-navy-950 shadow-2xl shadow-gold-400/20'
                                    : 'text-white/40 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-6">
                        <div className="w-12 h-12 border-2 border-gold-400/20 border-t-gold-400 rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Defining the palette...</p>
                    </div>
                ) : (
                    <div className="space-y-24 animate-in fade-in duration-1000">

                        {/* Resident Exclusive Section - Cinematic Card */}
                        {activeTab === 'Resident Exclusive' && (
                            <div className="glass-panel p-12 lg:p-20 relative overflow-hidden group border-white/5 bg-white/[0.01]">
                                <div className="absolute top-0 right-0 p-20 text-gold-400/5 group-hover:text-gold-400/10 transition-colors duration-1000">
                                    <Star className="w-48 h-48 fill-current" />
                                </div>
                                <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <span className="text-[10px] font-black text-gold-400 uppercase tracking-[0.5em]">The Resident Registry</span>
                                            <h2 className="text-4xl md:text-5xl font-serif italic text-white leading-tight">Morning rituals, <br />complimentary.</h2>
                                        </div>
                                        <p className="text-white/40 text-lg font-light leading-relaxed max-w-md">
                                            Exclusive for our residents. A curated selection of morning favorites engineered as the definitive start to your day.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {menuItems.filter(item => item.isComplimentary).slice(0, 4).map((item, i) => (
                                            <div key={item._id} className="glass-panel p-6 flex items-center gap-6 hover:bg-white/[0.03] transition-all duration-500 group animate-in fade-in slide-in-from-right-8" style={{ animationDelay: `${i * 100}ms` }}>
                                                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-2xl">
                                                    <img src={item.image || "https://images.unsplash.com/photo-1509627259045-84dc24ebba1b?auto=format&fit=crop&q=80&w=200"} alt={item.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-[0.2em]">Sanctuary Benefit</span>
                                                    <h4 className="text-sm font-bold text-white uppercase tracking-tighter">{item.name}</h4>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Standard Menu Grids */}
                        {activeTab !== 'Resident Exclusive' && (
                            <div className="space-y-16">
                                <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                                    <div className="space-y-4">
                                        <span className="text-[10px] font-black text-gold-400 uppercase tracking-[0.5em]">The Collection</span>
                                        <h2 className="text-5xl font-serif italic text-white">{activeTab}</h2>
                                    </div>
                                    <div className="h-0.5 w-32 bg-gold-400/20" />
                                </div>

                                <div className={`grid gap-8 ${(activeTab === 'Signature Breakfast' || activeTab === 'Weekend Buffet')
                                    ? 'grid-cols-1 lg:grid-cols-2'
                                    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                                    }`}>

                                    {menuItems.filter(item => {
                                        if (activeTab === 'Signature Breakfast') return item.category === 'Breakfast' && !item.isComplimentary;
                                        if (activeTab === "Chef's Specials") return item.category === "Chef's Specials";
                                        if (activeTab === 'Beverages & Bar') return ['Beverages', 'Bar Menu'].includes(item.category);
                                        if (activeTab === 'Weekend Buffet') return item.category === 'Weekend Buffet';
                                        return false;
                                    }).map((item, i) => (
                                        <div key={item._id} className="glass-panel group flex flex-col h-full bg-navy-950/40 border-white/5 hover:border-gold-400/30 transition-all duration-700 overflow-hidden animate-in fade-in slide-in-from-bottom-8" style={{ animationDelay: `${i * 100}ms` }}>
                                            <div className="h-64 overflow-hidden relative">
                                                <img src={item.image || "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80"} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                                                <div className="absolute top-6 right-6 flex flex-col gap-2">
                                                    {item.dietaryType === 'Non-Veg' ? (
                                                        <span className="px-3 py-1 bg-red-400/20 text-red-400 border border-red-400/20 rounded-full text-[8px] font-black uppercase tracking-widest backdrop-blur-md">Non-Veg</span>
                                                    ) : (
                                                        <span className="px-3 py-1 bg-emerald-400/20 text-emerald-400 border border-emerald-400/20 rounded-full text-[8px] font-black uppercase tracking-widest backdrop-blur-md">Vegetarian</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-10 flex-1 flex flex-col">
                                                <div className="flex justify-between items-start mb-6">
                                                    <h3 className="text-xl font-bold text-white uppercase tracking-tighter group-hover:text-gold-400 transition-colors">{item.name}</h3>
                                                    <span className="text-xl font-bold text-gold-400">₹{item.price}</span>
                                                </div>

                                                <p className="text-xs text-white/30 font-medium leading-[1.8] uppercase tracking-wider mb-8 flex-1">
                                                    {item.description}
                                                </p>

                                                <div className="flex items-center gap-6 pt-8 border-t border-white/5 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {item.preparationTime || '25m'}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Flame className="w-3.5 h-3.5" />
                                                        {item.calories || '650 kcal'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {menuItems.filter(item => {
                                        if (activeTab === 'Signature Breakfast') return item.category === 'Breakfast' && !item.isComplimentary;
                                        if (activeTab === "Chef's Specials") return item.category === "Chef's Specials";
                                        if (activeTab === 'Beverages & Bar') return ['Beverages', 'Bar Menu'].includes(item.category);
                                        if (activeTab === 'Weekend Buffet') return item.category === 'Weekend Buffet';
                                        return false;
                                    }).length === 0 && (
                                            <div className="col-span-full py-24 glass-panel flex flex-col items-center justify-center gap-6 border-dashed border-white/10">
                                                <Utensils className="w-12 h-12 text-white/10" />
                                                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">The culinary registry is expanding</p>
                                            </div>
                                        )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default RestaurantPage;





