import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, User, Utensils, Award, Clock, Flame, Star } from 'lucide-react';
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
                const res = await fetch('__API_BASE__/api/public/menu');
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
        <div className="min-h-screen bg-[#0F1626] font-sans text-white">
            {/* Nav Header */}
            <header className="fixed top-0 w-full z-50 bg-[#0F1626]/90 backdrop-blur-md border-b border-white/5">
                <div className="container mx-auto px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-12">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                            <div className="w-8 h-8 bg-[#2D5BFF] rounded-lg flex items-center justify-center">
                                <Utensils className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-xl tracking-wide">
                                LuxeStay<span className="font-serif italic text-[#2D5BFF] ml-1 font-normal">Dining</span>
                            </span>
                        </div>
                        <nav className="hidden lg:flex gap-8">
                            <button className="text-white font-bold text-sm">Dining</button>
                            <button onClick={() => navigate('/rooms')} className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Rooms</button>
                            <button onClick={() => navigate('/spa')} className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Spa</button>
                            <button onClick={() => navigate('/gallery')} className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Gallery</button>
                        </nav>
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => {
                                if (user) {
                                    navigate('/dashboard?section=dining');
                                } else {
                                    navigate('/login');
                                }
                            }}
                            className="px-6 py-2 bg-[#2D5BFF] text-white text-sm font-bold rounded-full hover:bg-luxury-gold transition-colors"
                        >
                            Reserve a Table
                        </button>
                        {user ? (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#D4AF37] to-yellow-200 border-2 border-[#0F1626] flex items-center justify-center font-bold text-[#0F1626] cursor-pointer" onClick={() => navigate('/dashboard')}>
                                {(user.name || 'G')[0].toUpperCase()}
                            </div>
                        ) : (
                            <button onClick={() => navigate('/login')} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/20 transition-all">
                                <User className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="pt-28 pb-24 px-8 max-w-7xl mx-auto">
                <div className="h-[260px] w-full rounded-3xl overflow-hidden relative mb-12 shadow-2xl">
                    <img
                        src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80"
                        alt="The Grand Brasserie"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F1626] via-[#0F1626]/40 to-transparent"></div>
                    <div className="absolute bottom-16 left-16 max-w-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-[#2D5BFF] text-white text-[10px] font-bold uppercase tracking-widest rounded-full">Award-Winning</span>
                            <div className="flex gap-1 text-[#D4AF37]">
                                <Award className="w-4 h-4 fill-current" />
                            </div>
                        </div>
                        <h1 className="text-6xl font-bold font-serif italic text-white mb-6">The Grand Brasserie</h1>
                        <p className="text-lg text-gray-300 font-medium">
                            Experience culinary excellence crafted by Michelin-starred chefs in an atmosphere of timeless sophistication.
                        </p>
                    </div>
                </div>

                <div className="border-b border-white/10 mb-16">
                    <div className="flex gap-12 overflow-x-auto no-scrollbar">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 text-sm font-bold transition-all whitespace-nowrap border-b-2 ${activeTab === tab
                                    ? 'border-[#2D5BFF] text-white'
                                    : 'border-transparent text-gray-400 hover:text-white'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-400">
                        <div className="w-10 h-10 border-4 border-[#2D5BFF]/30 border-t-[#2D5BFF] rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-xs font-bold uppercase tracking-widest">Curating the menu...</p>
                    </div>
                ) : (
                    <div className="space-y-12 animate-in fade-in duration-500">

                        {/* Resident Exclusive / Complimentary Section */}
                        {activeTab === 'Resident Exclusive' && (
                            <div className="bg-[#1A2235] border border-white/5 rounded-3xl p-8 lg:p-12 shadow-2xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <Star className="w-4 h-4 text-[#2D5BFF] fill-current" />
                                    <span className="text-[10px] font-bold text-[#2D5BFF] uppercase tracking-widest">Resident Benefits</span>
                                </div>
                                <div className="flex items-end justify-between mb-10">
                                    <div>
                                        <h2 className="text-3xl font-bold font-serif italic text-white mb-3">Complimentary Breakfast Items</h2>
                                        <p className="text-sm text-gray-400 max-w-lg">Exclusive for our residents. Enjoy a curated selection of our morning favorites as part of your stay.</p>
                                    </div>
                                    <button className="hidden md:flex items-center gap-2 text-sm font-bold text-[#2D5BFF] hover:text-white transition-colors group">
                                        View Full Stay Details
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>

                                {menuItems.filter(item => item.isComplimentary).length === 0 ? (
                                    <div className="py-12 text-center border border-white/10 border-dashed rounded-2xl">
                                        <p className="text-gray-400 text-sm">No complimentary items available at the moment.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {menuItems.filter(item => item.isComplimentary).slice(0, 3).map(item => (
                                            <div key={item._id} className="bg-[#0F1626] border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:border-white/10 transition-colors cursor-pointer">
                                                <img src={item.image || "https://images.unsplash.com/photo-1509627259045-84dc24ebba1b?auto=format&fit=crop&q=80&w=200"} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                        <span className="text-[8px] font-bold text-green-500 uppercase tracking-widest">Free</span>
                                                    </div>
                                                    <h4 className="text-sm font-bold text-white mb-1">{item.name}</h4>
                                                    <p className="text-[10px] text-gray-500 line-clamp-1">{item.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Standard Category Layouts */}
                        {activeTab !== 'Resident Exclusive' && (
                            <div>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-1.5 h-8 bg-[#2D5BFF] rounded-r-full"></div>
                                    <h2 className="text-3xl font-bold font-serif italic text-white">{activeTab}</h2>
                                </div>

                                {/* Dynamic Grid based on Category */}
                                <div className={`grid gap-8 ${(activeTab === 'Signature Breakfast' || activeTab === 'Weekend Buffet')
                                    ? 'grid-cols-1 lg:grid-cols-2'
                                    : activeTab === 'Beverages & Bar'
                                        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 bg-[#1A2235] p-8 rounded-3xl border border-white/5'
                                        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                                    }`}>

                                    {menuItems.filter(item => {
                                        if (activeTab === 'Signature Breakfast') return item.category === 'Breakfast' && !item.isComplimentary;
                                        if (activeTab === "Chef's Specials") return item.category === "Chef's Specials";
                                        if (activeTab === 'Beverages & Bar') return ['Beverages', 'Bar Menu'].includes(item.category);
                                        if (activeTab === 'Weekend Buffet') return item.category === 'Weekend Buffet';
                                        return false;
                                    }).map(item => (

                                        // Layout 1: Horizontal Cards (Signature Breakfast / Weekend Buffet)
                                        (activeTab === 'Signature Breakfast' || activeTab === 'Weekend Buffet') ? (
                                            <div key={item._id} className="bg-[#1A2235] rounded-3xl border border-white/5 overflow-hidden flex flex-col sm:flex-row hover:border-[#2D5BFF]/50 transition-colors group h-full">
                                                <div className="w-full sm:w-2/5 h-48 sm:h-full relative overflow-hidden">
                                                    <img src={item.image || "https://images.unsplash.com/photo-1593006526979-4f8fb84aaad1?auto=format&fit=crop&q=80"} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                </div>
                                                <div className="p-6 flex-1 flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex items-start justify-between mb-2">
                                                            <h3 className="text-lg font-bold text-white font-serif line-clamp-1 group-hover:text-[#2D5BFF] transition-colors pr-4">{item.name}</h3>
                                                            {item.dietaryType === 'Non-Veg' ? (
                                                                <span className="px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded text-[8px] font-bold uppercase whitespace-nowrap">Non-Veg</span>
                                                            ) : (
                                                                <span className="px-2 py-0.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded text-[8px] font-bold uppercase whitespace-nowrap">Veg</span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-400 line-clamp-3 mb-4 leading-relaxed">{item.description}</p>
                                                    </div>
                                                    <div className="flex items-center justify-end border-t border-white/5 pt-4">
                                                        <span className="text-xl font-bold text-[#2D5BFF]">₹{item.price}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) :

                                            // Layout 2: Vertical Large Cards (Chef's Specials)
                                            activeTab === "Chef's Specials" ? (
                                                <div key={item._id} className="bg-[#1A2235] rounded-3xl border border-white/5 overflow-hidden hover:border-[#2D5BFF]/50 transition-colors group flex flex-col h-full">
                                                    <div className="w-full h-64 relative overflow-hidden bg-white">
                                                        {/* Many of these have white backgrounds in the mockup so we pad them and mix-blend if possible, or just cover */}
                                                        <img src={item.image || "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80"} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                                    </div>
                                                    <div className="p-8 flex-1 flex flex-col">
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <span className="text-[8px] font-bold text-[#2D5BFF] uppercase tracking-widest">{item.category}</span>
                                                        </div>
                                                        <div className="flex items-start justify-between mb-4">
                                                            <h3 className="text-xl font-bold text-white font-serif line-clamp-1 group-hover:text-[#2D5BFF] transition-colors">{item.name}</h3>
                                                            <span className="text-2xl font-bold text-[#2D5BFF]">₹{item.price}</span>
                                                        </div>
                                                        <p className="text-sm text-gray-400 line-clamp-3 mb-6 flex-1 leading-relaxed">{item.description}</p>

                                                        <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-auto">
                                                            <div className="flex gap-4">
                                                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                                    <Clock className="w-3.5 h-3.5" />
                                                                    {item.preparationTime || '25m'}
                                                                </div>
                                                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                                    <Flame className="w-3.5 h-3.5" />
                                                                    {item.calories || '650 kcal'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) :

                                                // Layout 3: List view (Beverages & Bar)
                                                (
                                                    <div key={item._id} className="border-b border-white/5 pb-4 last:border-0 hover:bg-white/5 p-4 rounded-xl transition-colors cursor-pointer group">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h4 className="text-sm font-bold text-white group-hover:text-[#2D5BFF] transition-colors">{item.name}</h4>
                                                            <span className="text-sm font-bold text-[#2D5BFF]">₹{item.price}</span>
                                                        </div>
                                                        <p className="text-[10px] text-gray-500 line-clamp-1">{item.description}</p>
                                                    </div>
                                                )

                                    ))}

                                    {/* Empty state fallback for any category */}
                                    {menuItems.filter(item => {
                                        if (activeTab === 'Signature Breakfast') return item.category === 'Breakfast' && !item.isComplimentary;
                                        if (activeTab === "Chef's Specials") return item.category === "Chef's Specials";
                                        if (activeTab === 'Beverages & Bar') return ['Beverages', 'Bar Menu'].includes(item.category);
                                        if (activeTab === 'Weekend Buffet') return item.category === 'Weekend Buffet';
                                        return false;
                                    }).length === 0 && (
                                            <div className="col-span-full py-12 text-center text-gray-500 border border-dashed border-white/10 rounded-2xl">
                                                No {activeTab.toLowerCase()} items currently available.
                                            </div>
                                        )}

                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <Footer />
        </div >
    );
};

export default RestaurantPage;




