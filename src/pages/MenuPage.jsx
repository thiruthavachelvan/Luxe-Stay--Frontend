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
    ShieldCheck
} from 'lucide-react';

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

    const fetchMenu = async () => {
        setFetchingMenu(true);
        try {
            const token = sessionStorage.getItem('userToken');
            let url = `${__API_BASE__}/api/auth/menu?category=${selectedCategory}`;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
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

            // Load Razorpay Script
            const resScript = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
            if (!resScript) {
                alert('Razorpay SDK failed to load. Are you online?');
                setIsProcessing(false);
                return;
            }

            // Create Order
            const orderRes = await fetch(`${__API_BASE__}/api/payment/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount: cartTotal })
            });

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

                    // Verify Payment
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

                    const verifyData = await verifyRes.json();
                    if (verifyData.success) {
                        // Place Food Order
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
                            alert('Payment successful & Order placed! It will be delivered to your room shortly.');
                            setCart([]);
                            setIsCartOpen(false);
                        } else {
                            alert('Payment successful, but failed to place order. Please contact reception.');
                        }
                    } else {
                        alert('Payment verification failed');
                    }
                    setIsProcessing(false);
                },
                prefill: {
                    name: "LuxeStay Guest",
                    email: "guest@example.com",
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
        <div className="min-h-screen bg-luxury-dark text-white font-sans">
            {/* Header */}
            <header className="fixed top-0 inset-x-0 h-24 bg-luxury-dark/80 backdrop-blur-xl border-b border-luxury-border/30 z-50 px-8 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-11 h-11 rounded-xl border border-luxury-border/30 flex items-center justify-center hover:bg-white/5 transition-all text-luxury-muted hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold font-serif italic tracking-wide">Culinary Palette</h1>
                        <p className="text-[10px] font-bold text-luxury-blue uppercase tracking-[0.3em] mt-0.5">LuxeStays In-Room Dining</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="relative group hidden md:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-muted group-focus-within:text-luxury-blue transition-colors" />
                        <input
                            type="text"
                            placeholder="Discover delicacies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-luxury-card border border-luxury-border/30 rounded-xl py-2.5 pl-11 pr-5 text-sm focus:outline-none focus:border-luxury-blue/50 focus:ring-4 focus:ring-luxury-blue/5 transition-all w-64"
                        />
                    </div>
                    <button onClick={() => setIsCartOpen(true)} className="relative px-6 py-2.5 bg-luxury-blue text-white rounded-xl font-bold hover:bg-luxury-blue-hover transition-all shadow-xl shadow-luxury-blue/30 active:scale-95 flex items-center gap-2">
                        <Utensils className="w-4 h-4" />
                        View Cart
                        {cart.length > 0 && (
                            <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold border-2 border-luxury-dark shadow-lg">
                                {cart.length}
                            </span>
                        )}
                    </button>
                    <button className="relative w-11 h-11 bg-luxury-card border border-luxury-border/30 rounded-xl flex items-center justify-center text-luxury-muted hover:text-white transition-all">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-luxury-blue border-2 border-luxury-card rounded-full"></span>
                    </button>
                </div>
            </header>

            <main className="pt-32 pb-20 px-8 max-w-7xl mx-auto">
                {/* Categories */}
                <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar scroll-smooth">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-8 py-3.5 rounded-2xl font-bold text-[10px] uppercase tracking-widest whitespace-nowrap transition-all border ${selectedCategory === cat
                                ? 'bg-luxury-blue border-luxury-blue text-white shadow-xl shadow-luxury-blue/20'
                                : 'bg-luxury-card border-luxury-border/30 text-luxury-muted hover:text-white hover:border-luxury-blue/30'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Menu Grid */}
                {fetchingMenu ? (
                    <div className="py-40 text-center">
                        <div className="w-12 h-12 border-4 border-luxury-blue/20 border-t-luxury-blue rounded-full animate-spin mx-auto mb-6"></div>
                        <p className="text-luxury-muted uppercase tracking-[0.2em] font-bold text-xs animate-pulse">Synchronizing with Sanctuary Kitchen...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="py-40 text-center bg-luxury-card rounded-[3rem] border border-luxury-border/20 border-dashed">
                        <Utensils className="w-16 h-16 text-luxury-muted/20 mx-auto mb-6" />
                        <h3 className="text-xl font-bold text-white mb-2">No Delicacies Found</h3>
                        <p className="text-muted-foreground text-sm">Our chefs are currently curating new inspirations for this category.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredItems.map(item => (
                            <div key={item._id} className="bg-luxury-card rounded-[2.5rem] border border-luxury-border/30 overflow-hidden group hover:border-luxury-blue/50 transition-all shadow-2xl flex flex-col h-full relative">
                                {item.isSpecial && (
                                    <div className="absolute top-6 left-6 z-10 px-4 py-1.5 bg-luxury-blue/90 backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-[0.2em] rounded-full shadow-lg border border-white/20">
                                        Signature Dish
                                    </div>
                                )}

                                <div className="h-64 overflow-hidden relative">
                                    <img
                                        src={item.image || `https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800`}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                        alt={item.name}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-luxury-dark via-transparent to-transparent opacity-60"></div>
                                </div>

                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-xl font-bold text-white font-serif italic group-hover:text-luxury-blue transition-colors line-clamp-1">{item.name}</h3>
                                        <div className="flex items-center gap-1">
                                            {item.dietaryType === 'Veg' ? (
                                                <div className="w-4 h-4 border border-green-500 flex items-center justify-center rounded-[2px] p-[2px]">
                                                    <div className="w-full h-full bg-green-500 rounded-full"></div>
                                                </div>
                                            ) : (
                                                <div className="w-4 h-4 border border-red-500 flex items-center justify-center rounded-[2px] p-[2px]">
                                                    <div className="w-full h-full bg-red-500 rounded-full"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-xs text-luxury-muted leading-relaxed font-medium line-clamp-2 mb-6">{item.description}</p>

                                    <div className="flex flex-wrap gap-4 mb-8">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-white/70 uppercase tracking-widest">
                                            <Clock className="w-3.5 h-3.5 text-luxury-blue" />
                                            {item.preparationTime || 20} Min
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-white/70 uppercase tracking-widest">
                                            <Flame className="w-3.5 h-3.5 text-orange-500" />
                                            {item.calories || 450} Kcal
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-luxury-border/20 flex items-center justify-between">
                                        <div>
                                            {item.isComplimentary ? (
                                                <div className="bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-lg">
                                                    <span className="text-xl font-bold text-green-400 font-serif italic">Complimentary</span>
                                                </div>
                                            ) : (
                                                <p className="text-2xl font-bold text-white font-serif">₹{item.price}</p>
                                            )}
                                        </div>
                                        {(() => {
                                            const cartItem = cart.find(c => c.menuItem._id === item._id);
                                            return cartItem ? (
                                                <div className="flex items-center bg-[#1A1D27] rounded-xl border border-luxury-border/30 p-1">
                                                    <button onClick={() => decreaseQuantity(item._id)} className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 rounded-lg transition-colors active:scale-95 text-xl font-medium leading-none mb-0.5">-</button>
                                                    <span className="w-8 text-center text-sm font-bold text-white">{cartItem.quantity}</span>
                                                    <button onClick={() => addToCart(item)} className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 rounded-lg transition-colors active:scale-95 text-xl font-medium leading-none mb-0.5">+</button>
                                                </div>
                                            ) : (
                                                <button onClick={() => addToCart(item)} className="flex items-center gap-2 px-6 py-2.5 bg-luxury-blue text-white rounded-xl font-bold text-xs hover:bg-luxury-blue-hover transition-all shadow-lg active:scale-95 group/btn">
                                                    Add to Cart
                                                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                                </button>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Cart Sidebar */}
            {isCartOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
                    <div className="relative w-full max-w-md bg-luxury-dark border-l border-luxury-border/30 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="p-8 border-b border-luxury-border/30 flex items-center justify-between bg-luxury-card/50">
                            <div>
                                <h2 className="text-2xl font-bold text-white font-serif italic">Your Plate</h2>
                                <p className="text-[10px] text-luxury-muted uppercase tracking-widest font-bold mt-1">{cart.length} Items Selected</p>
                            </div>
                            <button onClick={() => setIsCartOpen(false)} className="w-10 h-10 rounded-full border border-luxury-border/30 flex items-center justify-center text-luxury-muted hover:text-white hover:bg-white/5 transition-all">
                                ✕
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            {cart.length === 0 ? (
                                <div className="text-center text-luxury-muted italic mt-20">Your plate is currently empty.</div>
                            ) : (
                                cart.map((cartItem, index) => (
                                    <div key={index} className="flex gap-4 items-center bg-luxury-card p-4 rounded-2xl border border-luxury-border/30">
                                        <img src={cartItem.menuItem.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200"} className="w-20 h-20 object-cover rounded-xl" alt={cartItem.menuItem.name} />
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-white line-clamp-1">{cartItem.menuItem.name}</h4>

                                            <div className="flex items-center justify-between mt-3">
                                                <div className="flex items-center bg-[#1A1D27] rounded-lg border border-luxury-border/30 p-1">
                                                    <button onClick={() => decreaseQuantity(cartItem.menuItem._id)} className="w-7 h-7 flex items-center justify-center text-white hover:bg-white/10 rounded-md transition-colors active:scale-95 text-lg font-medium leading-none">-</button>
                                                    <span className="w-8 text-center text-xs font-bold text-white">{cartItem.quantity}</span>
                                                    <button onClick={() => addToCart(cartItem.menuItem)} className="w-7 h-7 flex items-center justify-center text-white hover:bg-white/10 rounded-md transition-colors active:scale-95 text-lg font-medium leading-none">+</button>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-luxury-muted font-bold tracking-wider uppercase">₹{cartItem.priceAtOrder} each</p>
                                                    <p className="text-sm font-bold text-luxury-blue mt-0.5">₹{cartItem.priceAtOrder * cartItem.quantity}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => removeFromCart(cartItem.menuItem._id)} className="text-luxury-muted hover:text-red-500 transition-colors p-2">
                                            ✕
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-8 border-t border-luxury-border/30 bg-luxury-card/50 mt-auto">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-sm font-bold text-luxury-muted uppercase tracking-widest">Total Bill</span>
                                <span className="text-3xl font-bold text-white font-serif italic">₹{cartTotal.toLocaleString()}</span>
                            </div>
                            <button
                                onClick={handlePlaceOrder}
                                disabled={cart.length === 0 || isProcessing}
                                className="w-full py-4 bg-luxury-blue text-white rounded-xl font-bold text-sm shadow-xl shadow-luxury-blue/20 hover:bg-luxury-blue-hover transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    'Proceed to Payment'
                                )}
                            </button>
                            <div className="flex items-center justify-center gap-1.5 mt-4 text-green-500">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <p className="text-[10px] font-bold uppercase tracking-widest">Secured by Razorpay</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MenuPage;





