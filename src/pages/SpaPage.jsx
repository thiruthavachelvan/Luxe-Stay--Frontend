import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { User, Droplets, Sparkles, Wind, ArrowRight, Flower, Clock, X, CheckCircle2 } from 'lucide-react';

const loadScript = (src) => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};
import Footer from '../components/Footer';

const SpaPage = () => {
    const navigate = useNavigate();

    const services = [
        {
            title: "Royal Thai Massage",
            duration: "90 mins",
            description: "An ancient healing system combining acupressure, Indian Ayurvedic principles, and assisted yoga postures.",
            icon: <Wind className="w-6 h-6 text-[#D4AF37]" />,
            image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80"
        },
        {
            title: "Aromatherapy Journey",
            duration: "60 mins",
            description: "Custom-blended essential oils are used in this deeply relaxing Swedish-style massage to relieve tension.",
            icon: <Flower className="w-6 h-6 text-[#D4AF37]" />,
            image: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&q=80"
        },
        {
            title: "Thermal Stone Therapy",
            duration: "75 mins",
            description: "Smooth, heated volcanic stones are integrated into the massage to deeply penetrate muscles and melt away stress.",
            icon: <Droplets className="w-6 h-6 text-[#D4AF37]" />,
            image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80"
        },
        {
            title: "Luminous Gold Facial",
            duration: "60 mins",
            description: "A decadent anti-aging treatment utilizing 24k gold leaf and highly concentrated vitamin C to restore youthful radiance.",
            icon: <Sparkles className="w-6 h-6 text-[#D4AF37]" />,
            image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80"
        }
    ];

    const [bookings, setBookings] = useState([]);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
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
                navigate('/');
            }
        };
        window.addEventListener('focus', syncUser);
        window.addEventListener('storage', handleGlobalLogout);
        return () => {
            window.removeEventListener('focus', syncUser);
            window.removeEventListener('storage', handleGlobalLogout);
        };
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (user) {
            fetchBookings();
        }
    }, [user]); // Added user to dependency array to refetch bookings if user state changes

    const fetchBookings = async () => {
        try {
            const token = sessionStorage.getItem('userToken');
            const res = await fetch(`${__API_BASE__}/api/auth/my-bookings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const active = data.filter(b => b.status === 'Confirmed' || b.status === 'CheckedIn');
                setBookings(active);
            }
        } catch (error) {
            console.error('Error fetching bookings', error);
        }
    };

    const handleBookSpaClick = (service) => {
        if (!user) {
            toast.error('Please sign in to book a spa treatment.');
            navigate('/login');
            return;
        }
        if (bookings.length === 0) {
            toast.error('You need an active hotel booking to add a spa treatment. Please book a room first!');
            return;
        }
        setSelectedService(service);
        setIsBookingModalOpen(true);
    };

    const proceedWithPayment = async (booking) => {
        setIsProcessing(true);
        try {
            const token = sessionStorage.getItem('userToken');
            const spaPrice = 1999;

            const orderRes = await fetch(`${__API_BASE__}/api/payment/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ amount: spaPrice })
            });

            if (!orderRes.ok) throw new Error('Order creation failed');
            const orderData = await orderRes.json();

            // Check for Dummy keys Mock Order
            const isMockOrder = orderData.id?.startsWith('order_mock_');
            if (isMockOrder) {
                const mockPaymentId = 'pay_mock_' + Math.random().toString(36).substr(2, 9);
                const verifyRes = await fetch(`${__API_BASE__}/api/payment/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({
                        razorpay_order_id: orderData.id,
                        razorpay_payment_id: mockPaymentId,
                        razorpay_signature: 'mock_signature'
                    })
                });
                const verifyData = await verifyRes.json();
                if (verifyData.success) {
                    const addSpaRes = await fetch(`${__API_BASE__}/api/auth/bookings/${booking._id}/add-spa`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ amount: spaPrice, transactionId: mockPaymentId })
                    });
                    if (addSpaRes.ok) {
                        toast.success(`${selectedService?.title} added successfully! You can view it in your dashboard.`);
                        setIsBookingModalOpen(false);
                        fetchBookings(); // refresh
                    } else {
                        toast.error('Failed to add spa to booking.');
                    }
                } else {
                    toast.error('Mock payment verification failed.');
                }
                setIsProcessing(false);
                return;
            }

            if (!(await loadScript('https://checkout.razorpay.com/v1/checkout.js'))) {
                toast.error('Razorpay failed to load');
                setIsProcessing(false);
                return;
            }

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "LuxeStay Spa",
                description: selectedService?.title || 'Add-on Spa Treatment',
                order_id: orderData.id,
                handler: async function (response) {
                    setIsProcessing(true);
                    try {
                        const verifyRes = await fetch(`${__API_BASE__}/api/payment/verify`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            })
                        });
                        const verifyData = await verifyRes.json();
                        if (verifyData.success) {
                            const addSpaRes = await fetch(`${__API_BASE__}/api/auth/bookings/${booking._id}/add-spa`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                body: JSON.stringify({ amount: spaPrice, transactionId: response.razorpay_payment_id })
                            });
                            if (addSpaRes.ok) {
                                toast.success(`${selectedService?.title} added successfully!`);
                                setIsBookingModalOpen(false);
                                fetchBookings();
                            } else {
                                toast.error('Failed to add spa to booking.');
                            }
                        }
                    } catch (e) {
                        toast.error('Payment verification failed.');
                    } finally {
                        setIsProcessing(false);
                    }
                },
                prefill: { name: user.fullName || 'Guest', email: user.email || '' },
                theme: { color: '#D4AF37' }
            };
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                toast.error(response.error.description);
                setIsProcessing(false);
            });
            rzp.open();
        } catch (error) {
            console.error('Spa payment error:', error);
            toast.error('Something went wrong during payment initialization.');
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F1626] font-sans text-white selection:bg-[#D4AF37] selection:text-[#0F1626]">
            {/* Nav Header */}
            <header className="fixed top-0 w-full z-50 bg-[#0F1626]/90 backdrop-blur-md border-b border-white/5 transition-all duration-300">
                <div className="container mx-auto px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-12">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
                                <Flower className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-xl tracking-wider">
                                LuxeStay<span className="font-serif italic text-white/70 ml-1 font-normal">Spa</span>
                            </span>
                        </div>
                        <nav className="hidden lg:flex gap-8">
                            <button onClick={() => navigate('/restaurant')} className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Dining</button>
                            <button onClick={() => navigate('/rooms')} className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Rooms</button>
                            <button className="text-white font-bold text-sm">Spa</button>
                            <button onClick={() => navigate('/gallery')} className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Gallery</button>
                        </nav>
                    </div>

                    <div className="flex items-center gap-6">
                        {user ? (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#D4AF37] to-yellow-200 border-2 border-[#0F1626] flex items-center justify-center font-bold text-[#0F1626] cursor-pointer" onClick={() => navigate('/dashboard')}>
                                {(user.fullName || 'G')[0].toUpperCase()}
                            </div>
                        ) : (
                            <button onClick={() => navigate('/login')} className="flex items-center gap-2 px-6 py-2.5 bg-white text-[#0F1626] rounded-full font-bold text-sm hover:bg-gray-200 transition-colors">
                                <User className="w-4 h-4" />
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="pt-20">
                {/* Hero Section */}
                <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img
                            src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80"
                            alt="Spa Sanctuary"
                            className="w-full h-full object-cover animate-in zoom-in duration-1000 scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1626]/80 via-[#0F1626]/40 to-[#0F1626]"></div>
                    </div>

                    <div className="relative z-10 text-center max-w-4xl px-8 flex flex-col items-center">
                        <Flower className="w-12 h-12 text-[#D4AF37] mb-8 animate-pulse" />
                        <h1 className="text-5xl md:text-7xl font-bold font-serif italic text-white mb-6 tracking-wide drop-shadow-2xl">
                            Sanctuary of Serenity
                        </h1>
                        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed mb-12">
                            A retreat for the senses. Restore your balance with holisitic therapies, ancient healing rituals, and modern wellness science in our award-winning spa.
                        </p>
                    </div>
                </section>

                {/* About & Philosophy */}
                <section className="py-24 px-8 bg-[#0F1626]">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <span className="text-[#D4AF37] text-sm font-bold uppercase tracking-[0.3em]">Our Philosophy</span>
                            <h2 className="text-4xl font-bold font-serif italic text-white leading-tight">
                                Harmonizing Mind, <br />Body, and Spirit.
                            </h2>
                            <p className="text-gray-400 leading-relaxed text-lg font-light">
                                At LuxeStay Spa, we believe that true luxury lies in the restoration of well-being. Our expertly trained therapists utilize organic, sustainably sourced botanique ingredients to craft personalized journeys that transport you to a state of profound tranquility.
                            </p>

                            {/* Booking CTA for Dashboard */}
                            <div className="mt-12 p-8 bg-[#1A2235] rounded-3xl border border-white/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                                <h3 className="text-xl font-bold text-white mb-2">Ready to unwind?</h3>
                                <p className="text-sm text-gray-400 mb-6">In-house guests can effortlessly schedule their wellness therapies directly from the LuxeStay Dashboard.</p>

                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-[#0F1626] rounded-xl font-bold text-sm hover:bg-[#F3E5AB] transition-colors shadow-lg shadow-[#D4AF37]/20 active:scale-95"
                                >
                                    Book via Dashboard
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="relative h-[600px] rounded-t-[10rem] rounded-b-[2rem] overflow-hidden border border-white/10 p-2">
                            <div className="w-full h-full rounded-t-[9.5rem] rounded-b-[1.5rem] overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80"
                                    alt="Spa Treatment"
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Signature Treatments */}
                <section className="py-24 px-8 bg-[#1A2235]">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <span className="text-[#D4AF37] text-sm font-bold uppercase tracking-[0.3em]">Curated Therapies</span>
                            <h2 className="text-4xl font-bold font-serif italic text-white mt-4">Signature Treatments</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {services.map((service, index) => (
                                <div key={index} className="bg-[#0F1626] border border-white/5 rounded-3xl overflow-hidden hover:border-[#D4AF37]/30 transition-colors group flex flex-col h-full">
                                    <div className="h-48 overflow-hidden relative">
                                        <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute top-4 right-4 w-10 h-10 bg-[#0F1626]/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10">
                                            {service.icon}
                                        </div>
                                    </div>
                                    <div className="p-8 flex-1 flex flex-col">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                                            {service.duration}
                                        </span>
                                        <h3 className="text-xl font-bold text-white font-serif mb-3 line-clamp-1">{service.title}</h3>
                                        <p className="text-sm text-gray-400 font-light leading-relaxed mb-6 flex-1">
                                            {service.description}
                                        </p>
                                        <button
                                            onClick={() => handleBookSpaClick(service)}
                                            className="mt-auto w-full py-3 bg-[#D4AF37] text-[#0F1626] rounded-xl font-bold text-sm shadow-lg shadow-[#D4AF37]/20 hover:bg-[#F3E5AB] transition-colors flex items-center justify-center gap-2 active:scale-95"
                                        >
                                            Book This Treatment
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Facilities Banner */}
                <section className="py-24 px-8 bg-[#0F1626] border-t border-white/5">
                    <div className="max-w-5xl mx-auto text-center">
                        <h2 className="text-3xl font-bold font-serif italic text-white mb-8">Thermal & Hydrotherapy Facilities</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            <div className="p-6 bg-[#1A2235] rounded-2xl border border-white/5">
                                <div className="text-3xl mb-3">💧</div>
                                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Vitality Pool</h4>
                            </div>
                            <div className="p-6 bg-[#1A2235] rounded-2xl border border-white/5">
                                <div className="text-3xl mb-3">🧖‍♀️</div>
                                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Steam Room</h4>
                            </div>
                            <div className="p-6 bg-[#1A2235] rounded-2xl border border-white/5">
                                <div className="text-3xl mb-3">🔥</div>
                                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Finnish Sauna</h4>
                            </div>
                            <div className="p-6 bg-[#1A2235] rounded-2xl border border-white/5">
                                <div className="text-3xl mb-3">🧊</div>
                                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Ice Fountain</h4>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Booking selection Modal */}
            {isBookingModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1A2235] w-full max-w-md rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-white/10 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold font-serif italic text-white">Select Booking</h3>
                                <p className="text-sm text-[#D4AF37] mt-1 font-medium">{selectedService?.title}</p>
                            </div>
                            <button onClick={() => !isProcessing && setIsBookingModalOpen(false)} className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-red-500/20 transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">You have {bookings.length} active stay(s)</p>

                            {bookings.map((booking) => {
                                const hasSpa = booking.addOns?.some(a => a.name === 'Spa Service');
                                return (
                                    <div key={booking._id} className="p-4 bg-[#0F1626] border border-white/10 rounded-2xl">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-bold text-white">{booking.room?.type || 'Suite'}</h4>
                                            <span className="text-[10px] font-bold px-2 py-1 bg-[#D4AF37]/20 text-[#D4AF37] rounded-md uppercase tracking-widest">{booking.status}</span>
                                        </div>
                                        <div className="text-xs text-gray-400 space-y-1 mb-4">
                                            <p>Check-in: {new Date(booking.checkInDate).toLocaleDateString()}</p>
                                            <p>Check-out: {new Date(booking.checkOutDate).toLocaleDateString()}</p>
                                        </div>
                                        {hasSpa ? (
                                            <div className="flex items-center gap-2 text-green-400 bg-green-400/10 p-3 rounded-xl border border-green-400/20">
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span className="text-xs font-bold">Spa package already active</span>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => proceedWithPayment(booking)}
                                                disabled={isProcessing}
                                                className="w-full py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold text-sm transition-colors flex justify-between items-center px-4 disabled:opacity-50"
                                            >
                                                <span>Apply to this stay</span>
                                                {isProcessing ? <span className="text-[#D4AF37]">Processing...</span> : <span className="text-[#D4AF37]">₹1,999</span>}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            <Footer />
            <Toaster position="top-right" />
        </div>
    );
};

export default SpaPage;





