import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Utensils,
    ArrowLeft,
    Search,
    Clock,
    Flame,
    Leaf,
    ChevronRight,
    Star,
    Bell,
    ShieldCheck,
    Loader2
} from 'lucide-react';
import { motion } from 'motion/react';

const loadScript = (src) => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const MenuPage = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [fetchingMenu, setFetchingMenu] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const navigate = useNavigate();

    const categories = ['All Categories', "Chef's Specials", 'Breakfast', 'Lunch', 'Dinner', 'Desserts', 'Snacks', 'Beverages', 'Bar Menu', 'Weekend Buffet'];

    useEffect(() => {
        fetchMenu();
    }, [selectedCategory]);

    const [user, setUser] = useState(() => {
        const stored = sessionStorage.getItem('userData');
        return (stored && stored !== 'undefined') ? JSON.parse(stored) : null;
    });

    useEffect(() => {
        const syncUser = () => {
            const stored = sessionStorage.getItem('userData');
            setUser((stored && stored !== 'undefined') ? JSON.parse(stored) : null);
        };
        const handleGlobalLogout = (e) => {
            if (e.key === 'luxe-stay-logout') {
                sessionStorage.removeItem('userToken');
                sessionStorage.removeItem('userData');
                setUser(null);
            }
        };
        window.addEventListener('focus', syncUser);
        window.addEventListener('storage', handleGlobalLogout);
        return () => {
            window.removeEventListener('focus', syncUser);
            window.removeEventListener('storage', handleGlobalLogout);
        };
    }, []);

    const fetchMenu = async () => {
        setFetchingMenu(true);
        try {
            const token = sessionStorage.getItem('userToken');
            let url = `${__API_BASE__}/api/auth/menu?category=${selectedCategory}`;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401) {
                sessionStorage.clear();
                navigate('/login');
                return;
            }

            const data = await response.json();
            if (response.ok) setMenuItems(data);
        } catch (err) {
            console.error('Error fetching menu:', err);
        } finally {
            setFetchingMenu(false);
        }
    };

    const filteredItems = menuItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(cartItem => cartItem.menuItem._id === item._id);
            if (existing) {
                return prev.map(cartItem =>
                    cartItem.menuItem._id === item._id
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                );
            }
            return [...prev, { menuItem: item, quantity: 1, priceAtOrder: item.price }];
        });
    };

    const decreaseQuantity = (itemId) => {
        setCart(prev => {
            const existing = prev.find(cartItem => cartItem.menuItem._id === itemId);
            if (existing && existing.quantity > 1) {
                return prev.map(cartItem =>
                    cartItem.menuItem._id === itemId
                        ? { ...cartItem, quantity: cartItem.quantity - 1 }
                        : cartItem
                );
            }
            return prev.filter(cartItem => cartItem.menuItem._id !== itemId);
        });
    };

    const removeFromCart = (itemId) => {
        setCart(prev => prev.filter(cartItem => cartItem.menuItem._id !== itemId));
    };

    const cartTotal = cart.reduce((total, item) => total + (item.priceAtOrder * item.quantity), 0);

    const handlePlaceOrder = async () => {
        if (cart.length === 0) return;
        setIsProcessing(true);
        try {
            const token = sessionStorage.getItem('userToken');

            const resScript = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
            if (!resScript) {
                alert('Razorpay SDK failed to load. Are you online?');
                setIsProcessing(false);
                return;
            }

            const orderRes = await fetch(`${__API_BASE__}/api/payment/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount: cartTotal })
            });

            if (orderRes.status === 401) {
                sessionStorage.clear();
                navigate('/login');
                return;
            }

            if (!orderRes.ok) {
                alert('Server error creating order.');
                setIsProcessing(false);
                return;
            }

            const orderData = await orderRes.json();

            const itemsToSubmit = cart.map(item => ({
                menuItem: item.menuItem._id,
                quantity: item.quantity,
                priceAtOrder: item.priceAtOrder
            }));

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "LuxeStay Hotel",
                description: "In-Room Dining Order",
                order_id: orderData.id,
                handler: async function (response) {
                    setIsProcessing(true);

                    const verifyRes = await fetch(`${__API_BASE__}/api/payment/verify`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        })
                    });

                    if (verifyRes.status === 401) {
                        sessionStorage.clear();
                        navigate('/login');
                        return;
                    }

                    const verifyData = await verifyRes.json();
                    if (verifyData.success) {
                        const responseOrder = await fetch(`${__API_BASE__}/api/auth/food-order`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                items: itemsToSubmit,
                                totalAmount: cartTotal,
                                transactionId: response.razorpay_payment_id
                            })
                        });

                        if (responseOrder.ok) {
                            alert('Order successful! Your gourmet meal will be delivered shortly.');
                            setCart([]);
                            setIsCartOpen(false);
                        } else {
                            if (responseOrder.status === 401) {
                                sessionStorage.clear();
                                navigate('/login');
                                return;
                            }
                            alert('Payment successful, but failed to place order. Please contact reception.');
                        }
                    } else {
                        alert('Payment verification failed');
                    }
                    setIsProcessing(false);
                },
                prefill: {
                    name: user?.fullName || "LuxeStay Guest",
                    email: user?.email || "",
                },
                theme: {
                    color: "#D4AF37"
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response) {
                alert(response.error.description);
                setIsProcessing(false);
            });
            rzp1.open();

        } catch (error) {
            console.error('Error in payment/order:', error);
            alert('An error occurred. Please try again.');
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-navy-950 text-white font-sans selection:bg-gold-400 selection:text-navy-950">
            {/* Header */}
            <header className="fixed top-0 inset-x-0 h-24 bg-navy-950/40 backdrop-blur-2xl border-b border-white/5 z-50 px-8 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-11 h-11 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all text-white/40 hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-serif italic text-white tracking-wide">Culinary Palette</h1>
                        <p className="text-[10px] font-black text-gold-400 uppercase tracking-[0.4em] mt-1">Private Luxe Dining</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="relative group hidden md:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-gold-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Discover delicacies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-5 text-sm focus:outline-none focus:border-gold-400/40 focus:ring-4 focus:ring-gold-400/5 transition-all w-72 placeholder:text-white/10"
                        />
                    </div>
                    <button onClick={() => setIsCartOpen(true)} className="relative group px-8 py-3 bg-gold-400 text-navy-950 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-2xl shadow-gold-400/10 active:scale-95 flex items-center gap-3">
                        <Utensils className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        Access Cart
                        {cart.length > 0 && (
                            <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-black border-2 border-navy-950 shadow-lg">
                                {cart.length}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            <main className="pt-36 pb-24 px-8 max-w-7xl mx-auto">
                {/* Categories */}
                <div className="flex flex-wrap gap-4 pb-12 scroll-smooth">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-500 border ${selectedCategory === cat
                                ? 'bg-gold-400 border-gold-400 text-navy-950 shadow-2xl shadow-gold-400/20 scale-105'
                                : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-gold-400/40'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Menu Sections by Category */}
                {fetchingMenu ? (
                    <div className="py-48 text-center bg-white/[0.01] rounded-[3rem] border border-white/5">
                        <div className="w-12 h-12 border-2 border-gold-400/10 border-t-gold-400 rounded-full animate-spin mx-auto mb-8"></div>
                        <p className="text-white/20 uppercase tracking-[0.6em] font-black text-[10px] animate-pulse">Syncing Private Registry...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="py-48 text-center glass-panel rounded-[3rem] border-dashed">
                        <Utensils className="w-20 h-20 text-white/5 mx-auto mb-8" />
                        <h3 className="text-2xl font-serif italic text-white/40 mb-3">No Delicacies Found</h3>
                        <p className="text-white/20 text-xs font-bold uppercase tracking-widest">Our stewards are curating new inspirations.</p>
                    </div>
                ) : (
                    <div className="space-y-24">
                        {(selectedCategory === 'All Categories'
                            ? Array.from(new Set(filteredItems.map(i => i.category)))
                            : [selectedCategory]
                        ).map(category => {
                            const itemsInCategory = filteredItems.filter(i => i.category === category);
                            if (itemsInCategory.length === 0) return null;

                            return (
                                <section key={category} className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                                    <div className="flex items-center gap-6 mb-12">
                                        <h2 className="text-[10px] font-black text-gold-400 uppercase tracking-[0.6em] italic whitespace-nowrap">{category}</h2>
                                        <div className="h-px w-full bg-gradient-to-r from-gold-400/20 to-transparent"></div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                        {itemsInCategory.map((item, i) => (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: i * 0.05 }}
                                                key={item._id}
                                                className="glass-panel rounded-[2.5rem] overflow-hidden group hover:border-gold-400/40 transition-all duration-700 shadow-2xl flex flex-col h-full relative bg-white/[0.01]"
                                            >
                                                {item.isSpecial && (
                                                    <div className="absolute top-6 left-6 z-10 px-5 py-2 bg-gold-400/90 backdrop-blur-xl text-navy-950 text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-2xl border border-white/20 italic">
                                                        Signature Asset
                                                    </div>
                                                )}

                                                <div className="h-72 overflow-hidden relative">
                                                    <img
                                                        src={item.image || `https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800`}
                                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 contrast-125"
                                                        alt={item.name}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity"></div>
                                                </div>

                                                <div className="p-10 flex-1 flex flex-col">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <h3 className="text-2xl font-serif italic text-white group-hover:text-gold-400 transition-colors leading-tight">{item.name}</h3>
                                                        <div className="pt-1">
                                                            {item.dietaryType === 'Veg' ? (
                                                                <div className="w-4 h-4 border border-emerald-500 flex items-center justify-center rounded-[3px] p-[2px]">
                                                                    <div className="w-full h-full bg-emerald-500 rounded-full"></div>
                                                                </div>
                                                            ) : (
                                                                <div className="w-4 h-4 border border-rose-500 flex items-center justify-center rounded-[3px] p-[2px]">
                                                                    <div className="w-full h-full bg-rose-500 rounded-full"></div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <p className="text-[11px] text-white/30 leading-relaxed font-medium uppercase tracking-wider mb-8 flex-1 line-clamp-2">{item.description}</p>

                                                    <div className="flex items-center gap-6 mb-10 pt-6 border-t border-white/5">
                                                        <div className="flex items-center gap-2.5 text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">
                                                            <Clock className="w-4 h-4 text-gold-400/60" />
                                                            {item.preparationTime || 20} Min Wait
                                                        </div>
                                                        <div className="flex items-center gap-2.5 text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">
                                                            <Flame className="w-4 h-4 text-rose-500/60" />
                                                            {item.calories || 450} Cal
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center justify-between gap-4 mt-auto">
                                                        <div className="min-w-fit">
                                                            {item.isComplimentary ? (
                                                                <div className="flex flex-col gap-1">
                                                                    <p className="text-lg font-serif italic text-white/20 line-through decoration-gold-400/20 flex items-baseline gap-1">
                                                                        <span className="text-[10px] font-black uppercase tracking-tighter">INR</span>
                                                                        {item.price}
                                                                    </p>
                                                                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-lg border border-emerald-400/20 italic">Executive Benefit</span>
                                                                </div>
                                                            ) : (
                                                                <p className="text-2xl font-serif italic text-white flex items-baseline gap-1">
                                                                    <span className="text-xs font-black uppercase tracking-tighter text-gold-400/50">INR</span>
                                                                    {item.price}
                                                                </p>
                                                            )}
                                                        </div>
                                                        {(() => {
                                                            const cartItem = cart.find(c => c.menuItem._id === item._id);
                                                            return cartItem ? (
                                                                <div className="flex items-center bg-white/5 rounded-xl border border-white/10 p-1 backdrop-blur-md">
                                                                    <button onClick={() => decreaseQuantity(item._id)} className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 rounded-lg transition-all active:scale-90 text-xl font-light">-</button>
                                                                    <span className="w-8 text-center text-xs font-black text-white tracking-widest">{cartItem.quantity}</span>
                                                                    <button onClick={() => addToCart(item)} className="w-8 h-8 flex items-center justify-center text-gold-400 hover:bg-gold-400/10 rounded-lg transition-all active:scale-90 text-xl font-light">+</button>
                                                                </div>
                                                            ) : (
                                                                <button onClick={() => addToCart(item)} className="px-6 py-3 bg-gold-400 text-navy-950 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-gold-400/10 active:scale-95 whitespace-nowrap">
                                                                    Add to Order
                                                                </button>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Cart Sidebar */}
            {isCartOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-navy-950/80 backdrop-blur-xl" onClick={() => setIsCartOpen(false)}></motion.div>
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        className="relative w-full max-w-lg bg-navy-900 border-l border-white/5 h-full shadow-2xl flex flex-col"
                    >
                        <div className="p-12 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h2 className="text-4xl font-serif italic text-white">Your Selection</h2>
                                <p className="text-[10px] text-gold-400 uppercase tracking-[0.4em] font-black mt-2">{cart.length} Assets Identified</p>
                            </div>
                            <button onClick={() => setIsCartOpen(false)} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all">
                                <ArrowLeft className="w-5 h-5 opacity-40 rotate-180" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-12 space-y-8 custom-scrollbar">
                            {cart.length === 0 ? (
                                <div className="text-center py-20">
                                    <Utensils className="w-20 h-20 text-white/5 mx-auto mb-6" />
                                    <p className="text-white/20 font-serif italic">Your plate is currently vacant.</p>
                                </div>
                            ) : (
                                cart.map((cartItem, index) => (
                                    <div key={index} className="flex gap-8 items-center glass-panel p-6 rounded-3xl border-white/5 group">
                                        <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-2xl shrink-0">
                                            <img src={cartItem.menuItem.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200"} className="w-full h-full object-cover contrast-110" alt={cartItem.menuItem.name} />
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <h4 className="text-lg font-serif italic text-white group-hover:text-gold-400 transition-colors uppercase tracking-tighter">{cartItem.menuItem.name}</h4>
                                                <button onClick={() => removeFromCart(cartItem.menuItem._id)} className="text-white/10 hover:text-rose-500 transition-colors p-1">
                                                    ✕
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center bg-white/5 rounded-xl border border-white/5 p-1">
                                                    <button onClick={() => decreaseQuantity(cartItem.menuItem._id)} className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white transition-colors">-</button>
                                                    <span className="w-8 text-center text-[10px] font-black text-white">{cartItem.quantity}</span>
                                                    <button onClick={() => addToCart(cartItem.menuItem)} className="w-8 h-8 flex items-center justify-center text-gold-400">+</button>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[9px] text-white/20 font-black tracking-widest uppercase">Portfolio Value</p>
                                                    <p className="text-lg font-serif italic text-gold-400 leading-none mt-1">₹{(cartItem.priceAtOrder * cartItem.quantity).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-12 border-t border-white/5 bg-navy-950/40 mt-auto">
                            <div className="flex items-center justify-between mb-10">
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Consolidated Total</span>
                                <span className="text-5xl font-serif italic text-white">₹{cartTotal.toLocaleString()}</span>
                            </div>
                            <button
                                onClick={handlePlaceOrder}
                                disabled={cart.length === 0 || isProcessing}
                                className="w-full py-6 bg-gold-400 text-navy-950 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] overflow-hidden shadow-[0_20px_50px_rgba(212,175,55,0.2)] hover:bg-white hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-4">
                                    {isProcessing ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Initiate Provisioning Flow
                                            <ArrowLeft className="w-5 h-5 rotate-180 group-hover:translate-x-3 transition-transform duration-500" />
                                        </>
                                    )}
                                </span>
                            </button>
                            <div className="flex items-center justify-center gap-2 mt-8 text-white/10 group">
                                <ShieldCheck className="w-4 h-4 group-hover:text-gold-400 transition-colors" />
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] group-hover:text-white/40 transition-colors">Secured Executive Protocol</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default MenuPage;





