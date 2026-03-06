import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
    MapPin, Star, Bed, Users, Eye, Maximize2, ChevronRight,
    Wifi, Coffee, Tv, Wind, CheckCircle2, X, ChevronLeft,
    ChevronRight as ChevRight, Shield, Calendar, Minus, Plus,
    Loader2, Building, ShieldAlert, Sparkles, Navigation, Tag
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { calculateMemberPrice, getTierDiscount, TIER_BENEFITS } from '../utils/membership';

/* ─── Amenity icon mapping ─── */
const amenityIcons = {
    'Free WiFi': Wifi, 'WiFi': Wifi,
    'Mini Bar': Coffee, 'Coffee Maker': Coffee, 'Nespresso Machine': Coffee,
    'Smart TV': Tv, 'Bose Sound System': Tv,
    'Air Conditioning': Wind,
    'Balcony': Eye, 'Private Sunbed': Eye,
};

/* ─── Placeholder room images ─── */
const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1400',
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&q=80&w=800',
];

/* ─── Star row helper ─── */
const StarRow = ({ value, size = 'w-4 h-4' }) => (
    <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(s => (
            <Star key={s} className={`${size} ${s <= Math.round(value) ? 'text-gold-400 fill-gold-400 shadow-sm' : 'text-white/10'} transition-all`} />
        ))}
    </div>
);

/* ─── Today & tomorrow for default dates ─── */
const dateStr = (d) => d.toISOString().split('T')[0];
const today = new Date();
const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);

/* ─── Full add-on catalog ─── */
const ADDON_CATALOG = [
    { id: 'breakfast', label: 'Complimentary Breakfast', price: 499, per: 'night', icon: '☕' },
    { id: 'lunch', label: 'Lunch (Set Menu)', price: 399, per: 'night', icon: '🍱' },
    { id: 'dinner', label: 'Dinner (3-Course)', price: 699, per: 'night', icon: '🍽️' },
    { id: 'spa', label: 'Spa Session (60 min)', price: 1999, per: 'stay', icon: '💆' },
    { id: 'airport', label: 'Airport Transfer', price: 1499, per: 'stay', icon: '🚘' },
    { id: 'laundry', label: 'Laundry Service', price: 299, per: 'night', icon: '👕' },
    { id: 'minibar', label: 'Minibar Refill (Daily)', price: 349, per: 'night', icon: '🍹' },
    { id: 'butler', label: 'Butler Service (24/7)', price: 999, per: 'night', icon: '🛎️' },
    { id: 'late', label: 'Late Checkout (2 PM)', price: 599, per: 'stay', icon: '⏰' },
    { id: 'lounge', label: 'Executive Lounge Access', price: 449, per: 'night', icon: '🛋️' },
    { id: 'gym', label: 'Personal Trainer Session', price: 799, per: 'stay', icon: '🏋️' },
    { id: 'cocktails', label: 'Evening Cocktails', price: 599, per: 'night', icon: '🍸' },
];

// Map benefit text to add-on IDs so we can hide already-included ones
const BENEFIT_TO_ADDON = {
    'Complimentary Breakfast': 'breakfast',
    'VIP Airport Transfer': 'airport',
    'Laundry Service': 'laundry',
    'Butler Service 24/7': 'butler',
    'Lounge Access': 'lounge',
    'Exclusive Lounge Access': 'lounge',
    'Evening Cocktails': 'cocktails',
};

/* ═══════════════════════════════════════ */
const RoomDetailPage = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const offerCode = searchParams.get('offerCode');

    /* Room data */
    const [room, setRoom] = useState(null);
    const [user, setUser] = useState(() => {
        const stored = sessionStorage.getItem('userData');
        return (stored && stored !== 'undefined') ? JSON.parse(stored) : null;
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    /* Gallery */
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIdx, setLightboxIdx] = useState(0);

    /* Reviews */
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);

    /* Booking widget */
    const [checkIn, setCheckIn] = useState(dateStr(today));
    const [checkOut, setCheckOut] = useState(dateStr(tomorrow));
    const [isAvailable, setIsAvailable] = useState(true);
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [selectedAddOns, setSelectedAddOns] = useState([]);

    const toggleAddOn = (id) => setSelectedAddOns(prev =>
        prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );

    /* Tab navigation */
    const [activeTab, setActiveTab] = useState('description');
    const descRef = useRef(null);
    const amenRef = useRef(null);
    const reviewRef = useRef(null);

    /* ── Load User ── */
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
        syncUser();
        window.addEventListener('focus', syncUser);
        window.addEventListener('storage', handleGlobalLogout);
        return () => {
            window.removeEventListener('focus', syncUser);
            window.removeEventListener('storage', handleGlobalLogout);
        };
    }, []);

    /* ── Fetch room ── */
    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const res = await fetch(`${__API_BASE__}/api/public/rooms/${roomId}`);
                if (!res.ok) throw new Error('Room not found');
                const data = await res.json();
                setRoom(data);
                // Fetch reviews for this room directly via room ID (most accurate)
                const rRes = await fetch(`${__API_BASE__}/api/reviews/room/${roomId}`);
                if (rRes.ok) {
                    const rReviews = await rRes.json();
                    setReviews(rReviews || []);
                    if (rReviews.length > 0) {
                        const avg = rReviews.reduce((s, r) => s + r.overallRating, 0) / rReviews.length;
                        setAvgRating(Math.round(avg * 10) / 10);
                        setReviewCount(rReviews.length);
                    } else {
                        // Fall back to location-level reviews by city name
                        const cityName = data.location?.city;
                        if (cityName) {
                            const locRes = await fetch(`${__API_BASE__}/api/reviews/location/${encodeURIComponent(cityName)}`);
                            if (locRes.ok) {
                                const locData = await locRes.json();
                                setReviews(locData.reviews || []);
                                setAvgRating(parseFloat(locData.avgRating) || 0);
                                setReviewCount(locData.totalCount || 0);
                            }
                        }
                    }
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchRoom();
    }, [roomId]);

    /* ── Fetch availability on date change ── */
    useEffect(() => {
        if (!room) return;
        const checkAvailability = async () => {
            setCheckingAvailability(true);
            try {
                const queryParams = new URLSearchParams({ checkIn, checkOut });
                const res = await fetch(`${__API_BASE__}/api/public/rooms/${room._id}/availability?${queryParams.toString()}`);
                if (res.ok) {
                    const data = await res.json();
                    setIsAvailable(data.isAvailable);
                }
            } catch (error) {
                console.error('Error checking availability:', error);
            } finally {
                setCheckingAvailability(false);
            }
        };
        checkAvailability();
    }, [checkIn, checkOut, room]);

    /* ── Pricing calc ── */
    const nights = Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000));

    // Membership Discount Logic
    const hasMembership = user?.membershipTier && user.membershipTier !== 'None';
    const basePrice = room?.price || 0;
    const memberPrice = hasMembership ? calculateMemberPrice(basePrice, user.membershipTier) : basePrice;
    const pricePerNight = memberPrice;

    const subtotal = pricePerNight * nights;
    const serviceFee = Math.round(subtotal * 0.015);
    const occupancyTax = Math.round(subtotal * 0.005);
    // Compute add-on total (per-night × nights, per-stay × 1)
    const addOnTotal = selectedAddOns.reduce((sum, id) => {
        const a = ADDON_CATALOG.find(x => x.id === id);
        return a ? sum + (a.per === 'night' ? a.price * nights : a.price) : sum;
    }, 0);
    const total = subtotal + serviceFee + occupancyTax + addOnTotal;

    /* ── Images ── */
    const images = room?.images?.length >= 4
        ? room.images
        : [...(room?.images || []), ...FALLBACK_IMAGES].slice(0, 4);

    /* ── Handle Book Now ── */
    const handleBookNow = () => {
        const userData = sessionStorage.getItem('userData');
        if (!userData) {
            // Save current page as redirect destination after login
            const currentUrl = window.location.pathname + window.location.search;
            navigate(`/login?redirect=${encodeURIComponent(currentUrl)}`);
            return;
        }

        // Compute current add-ons breakdown to pass along
        const addOnsDetails = selectedAddOns.map(id => {
            const a = ADDON_CATALOG.find(x => x.id === id);
            return {
                id: a.id,
                name: a.label,
                price: a.per === 'night' ? a.price * nights : a.price
            };
        });

        navigate('/guest-details', {
            state: {
                roomId: room._id,
                room,
                checkIn,
                checkOut,
                nights,
                adults,
                children,
                originalSubtotal: basePrice * nights,
                membershipDiscount: (basePrice - memberPrice) * nights,
                subtotal,
                serviceFee,
                occupancyTax,
                addOns: addOnsDetails,
                total,
                offerCode,
                membershipTier: user?.membershipTier
            }
        });
    };

    /* ── Tab scroll ── */
    const scrollTo = (ref, tab) => {
        setActiveTab(tab);
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    /* ── Lightbox handlers ── */
    const openLightbox = (i) => { setLightboxIdx(i); setLightboxOpen(true); };
    const prevImg = () => setLightboxIdx(i => (i - 1 + images.length) % images.length);
    const nextImg = () => setLightboxIdx(i => (i + 1) % images.length);

    /* ── Luxury stars ── */
    const luxuryStars = room?.luxuryLevel || 3;

    if (loading) return (
        <div className="min-h-screen bg-luxury-dark flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-luxury-blue animate-spin" />
            </div>
        </div>
    );

    if (error || !room) return (
        <div className="min-h-screen bg-luxury-dark flex flex-col">
            <Navbar />
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
                <Building className="w-14 h-14 text-luxury-muted/30" />
                <h2 className="text-2xl font-bold text-white">Room Not Found</h2>
                <p className="text-luxury-muted">The room you're looking for doesn't exist or has been removed.</p>
                <Link to="/rooms" className="mt-4 px-6 py-2.5 bg-luxury-blue text-white rounded-xl font-bold text-sm">Browse All Rooms</Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-navy-950 text-white selection:bg-gold-400 selection:text-navy-950 font-sans">
            <Navbar />

            {/* ─── Lightbox ─── */}
            {lightboxOpen && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
                    <button onClick={e => { e.stopPropagation(); prevImg(); }} className="absolute left-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                        <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <img src={images[lightboxIdx]} alt="Room" className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl" onClick={e => e.stopPropagation()} />
                    <button onClick={e => { e.stopPropagation(); nextImg(); }} className="absolute right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                        <ChevRight className="w-6 h-6 text-white" />
                    </button>
                    <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
                        <X className="w-5 h-5 text-white" />
                    </button>
                    <span className="absolute bottom-6 text-white/50 text-sm">{lightboxIdx + 1} / {images.length}</span>
                </div>
            )}

            {/* ─── Breadcrumb ─── */}
            <div className="pt-24 pb-2 container mx-auto px-6">
                <div className="flex items-center gap-2 text-xs text-luxury-muted">
                    <Link to="/" className="hover:text-luxury-blue transition-colors">Home</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link to="/rooms" className="hover:text-luxury-blue transition-colors">Rooms</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-luxury-blue font-medium">{room.type}</span>
                </div>
            </div>

            {/* ─── Hero / Gallery ─── */}
            <section className="relative h-[85vh] w-full overflow-hidden bg-navy-900">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={lightboxIdx}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="absolute inset-0"
                    >
                        <img
                            src={images[lightboxIdx]}
                            alt={room.type}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/20 to-transparent" />
                    </motion.div>
                </AnimatePresence>

                {/* Hero Info Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end pb-20">
                    <div className="max-w-7xl mx-auto px-8 w-full">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 1 }}
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <span className="px-4 py-1.5 bg-gold-400 text-navy-950 text-[10px] font-black uppercase tracking-[0.3em] rounded-sm shadow-2xl">
                                    {luxuryStars} Star Sanctuary
                                </span>
                                <span className="h-px w-12 bg-gold-400/30" />
                                <div className="flex items-center gap-2 text-gold-400">
                                    <MapPin className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{room.location?.city}</span>
                                </div>
                            </div>
                            <h1 className="text-7xl md:text-8xl font-serif text-white mb-8 leading-none italic">
                                {room.type.split(' ').map((word, i) => (
                                    <span key={i} className={i === 0 ? "text-gold-400 block md:inline" : "block md:inline ml-0 md:ml-4"}>
                                        {word}
                                    </span>
                                ))}
                            </h1>
                            <div className="flex flex-col md:flex-row md:items-center gap-8 text-white/60">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-gold-400/60 mb-1">
                                        {hasMembership ? `${user.membershipTier} Member Rate` : 'Starting From'}
                                    </span>
                                    <span className="text-3xl font-serif text-white">
                                        ₹{pricePerNight.toLocaleString()}
                                        {hasMembership && <span className="text-xs text-gold-400 ml-2 italic">(-{getTierDiscount(user.membershipTier)}%)</span>}
                                        <span className="text-sm font-sans opacity-40"> / night</span>
                                    </span>
                                </div>
                                <div className="hidden md:block h-12 w-px bg-white/10" />
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => openLightbox(0)}
                                        className="group flex items-center gap-4 px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-sm hover:bg-white/10 transition-all whitespace-nowrap"
                                    >
                                        <Maximize2 className="w-5 h-5 text-gold-400" />
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">View Gallery</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Thumbnail Navigation - Adjusted for mobile */}
                <div className="absolute right-4 md:right-8 bottom-4 md:bottom-20 flex flex-row md:flex-col gap-3 md:gap-4 overflow-x-auto md:overflow-visible pb-4 md:pb-0 scrollbar-hide max-w-[calc(100vw-32px)]">
                    {images.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => setLightboxIdx(i)}
                            className={`w-16 h-16 rounded-sm overflow-hidden border-2 transition-all duration-500 ${lightboxIdx === i ? 'border-gold-400 scale-110 shadow-2xl' : 'border-white/10 opacity-50 hover:opacity-100'}`}
                        >
                            <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
                        </button>
                    ))}
                </div>
            </section>

            {/* ─── Main Content ─── */}
            <section className="max-w-7xl mx-auto px-8 py-20">
                <div className="grid lg:grid-cols-3 gap-16 items-start">

                    {/* ── Left Column ── */}
                    <div className="lg:col-span-2 space-y-20">

                        {/* Room Header Info */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="flex items-center gap-6 mb-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                                <span className="flex items-center gap-2 text-gold-400">
                                    <Sparkles className="w-3 h-3" />
                                    Elite Residence
                                </span>
                                <span className="flex items-center gap-2">
                                    <Navigation className="w-3 h-3" />
                                    Floor {room.floor}
                                </span>
                                <span className={`px-2 py-0.5 border rounded-sm ${isAvailable ? 'border-emerald-500/20 text-emerald-400' : 'border-red-500/20 text-red-400'}`}>
                                    {isAvailable ? 'Available' : 'Reserved'}
                                </span>
                            </div>
                            <h2 className="text-5xl font-serif text-white mb-6">Mastering <span className="text-gold-400 italic">Comfort</span></h2>
                            <p className="text-white/40 leading-relaxed text-sm font-light max-w-2xl">
                                {room.description || `A masterclass in contemporary elegance, the ${room.type} at LuxeStay ${room.location?.city} defines the higher standard of living. Curated with hand-selected materials and state-of-the-art technology.`}
                            </p>
                        </motion.div>

                        {/* Feature Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { icon: Maximize2, label: 'Spacial Area', value: room.area || '65 m²' },
                                { icon: Bed, label: 'Sleeping', value: room.bedType || 'Grand King' },
                                { icon: Users, label: 'Occupancy', value: `${room.capacity?.adults || 2} Adults` },
                                { icon: Eye, label: 'Perspective', value: room.viewType || 'Unending View' },
                            ].map(({ icon: Icon, label, value }) => (
                                <div key={label} className="glass-panel p-6 border-white/5 group hover:bg-gold-400 transition-all duration-500">
                                    <Icon className="w-5 h-5 text-gold-400 group-hover:text-navy-950 mb-4 transition-colors" />
                                    <p className="text-[9px] text-white/20 uppercase tracking-widest mb-1 group-hover:text-navy-950/60 font-bold transition-colors">{label}</p>
                                    <p className="text-xs font-bold text-white group-hover:text-navy-950 transition-colors">{value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Tabs - Reimagined */}
                        <div className="flex gap-12 border-b border-white/5">
                            {[['description', 'Overview'], ['amenities', 'Amenities'], ['reviews', 'Guest Reviews']].map(([id, label]) => (
                                <button
                                    key={id}
                                    onClick={() => scrollTo(id === 'description' ? descRef : id === 'amenities' ? amenRef : reviewRef, id)}
                                    className={`pb-6 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === id ? 'text-gold-400' : 'text-white/20 hover:text-white'}`}
                                >
                                    {label}
                                    {activeTab === id && (
                                        <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-400" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Description */}
                        <div ref={descRef} className="scroll-mt-40">
                            <h3 className="text-3xl font-serif text-white mb-8 italic">The Essence</h3>
                            <div className="prose prose-invert max-w-none">
                                <p className="text-white/60 leading-[2] text-lg font-light">
                                    {room.description ||
                                        `The ${room.type} represents the absolute pinnacle of our architectural philosophy. Every corner has been considered to provide not just a room, but a rhythmic sequence of experiences. The materials speak of heritage, while the amenities hum with modern precision.`
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Amenities */}
                        <div ref={amenRef} className="scroll-mt-40">
                            <h3 className="text-3xl font-serif text-white mb-10 italic">Curation of Comfort</h3>
                            {room.amenities?.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {room.amenities.map((amenity, i) => {
                                        const Icon = amenityIcons[amenity] || CheckCircle2;
                                        return (
                                            <div key={i} className="flex items-center gap-6 group">
                                                <div className="w-12 h-12 rounded-sm bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-gold-400 transition-all duration-500">
                                                    <Icon className="w-5 h-5 text-gold-400 group-hover:text-navy-950 transition-colors" />
                                                </div>
                                                <span className="text-sm text-white/60 font-medium uppercase tracking-widest">{amenity}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-white/20 italic">Amenity details under curation...</p>
                            )}
                        </div>

                        {/* Reviews */}
                        <div ref={reviewRef} className="scroll-mt-40">
                            <div className="flex items-center justify-between mb-12">
                                <h3 className="text-3xl font-serif text-white italic">Guest Chronicles</h3>
                                {avgRating > 0 && (
                                    <div className="flex items-center gap-4">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-navy-950 bg-navy-900" />
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Trusted by {reviewCount}+ Seekers</span>
                                    </div>
                                )}
                            </div>
                            {reviews.length === 0 ? (
                                <div className="glass-panel border-white/5 p-20 text-center">
                                    <Star className="w-12 h-12 text-white/5 mx-auto mb-6" />
                                    <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest">No chronicles yet shared</p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {reviews.map(review => (
                                        <div key={review._id} className="glass-panel border-white/5 p-10 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-sm bg-gold-400 flex items-center justify-center text-navy-950 text-xs font-black">
                                                        {review.user?.fullName?.[0] || 'G'}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-bold text-[10px] uppercase tracking-widest">{review.user?.fullName || 'Anonymous'}</p>
                                                        <p className="text-white/20 text-[9px] uppercase tracking-widest mt-1">{new Date(review.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                                                    </div>
                                                </div>
                                                <StarRow value={review.overallRating} size="w-3 h-3" />
                                            </div>
                                            <p className="text-white/60 text-lg font-light leading-relaxed italic font-serif">"{review.comment}"</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Sticky Booking Widget ── */}
                    <div className="lg:sticky lg:top-28">
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-panel border-white/5 p-10 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-3">
                                <div className="px-3 py-1 bg-gold-400 text-navy-950 text-[8px] font-black uppercase tracking-widest rounded-sm">
                                    Preferred Member Rate
                                </div>
                            </div>

                            {/* Price */}
                            <div className="mb-10">
                                <span className="text-4xl font-serif text-white italic">₹{pricePerNight.toLocaleString()}</span>
                                <span className="text-white/20 text-xs uppercase tracking-widest ml-3 font-bold">/ night inclusive</span>
                            </div>

                            <div className="space-y-8">
                                {/* Dates - Reimagined */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="group">
                                        <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] block mb-3 group-hover:text-gold-400 transition-colors">Arriving</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400/40" />
                                            <input
                                                type="date"
                                                value={checkIn}
                                                min={dateStr(today)}
                                                onChange={e => { setCheckIn(e.target.value); if (e.target.value >= checkOut) { const next = new Date(e.target.value); next.setDate(next.getDate() + 1); setCheckOut(dateStr(next)); } }}
                                                className="w-full bg-transparent border-b border-white/5 py-3 pl-8 text-xs text-white focus:outline-none focus:border-gold-400 transition-all [color-scheme:dark]"
                                            />
                                        </div>
                                    </div>
                                    <div className="group">
                                        <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] block mb-3 group-hover:text-gold-400 transition-colors">Departing</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400/40" />
                                            <input
                                                type="date"
                                                value={checkOut}
                                                min={checkIn}
                                                onChange={e => setCheckOut(e.target.value)}
                                                className="w-full bg-transparent border-b border-white/5 py-3 pl-8 text-xs text-white focus:outline-none focus:border-gold-400 transition-all [color-scheme:dark]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between py-2 border-b border-white/5">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Adults</span>
                                    <div className="flex items-center gap-6">
                                        <button onClick={() => setAdults(v => Math.max(1, v - 1))} className="text-white/20 hover:text-gold-400 transition-colors disabled:opacity-0" disabled={adults <= 1}><Minus className="w-4 h-4" /></button>
                                        <span className="text-sm font-serif italic text-white w-4 text-center">{adults}</span>
                                        <button onClick={() => setAdults(v => Math.min(room.capacity?.adults || 4, v + 1))} className="text-white/20 hover:text-gold-400 transition-colors"><Plus className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>

                            {/* Bespoke Add-ons */}
                            <div className="space-y-4">
                                <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] block">Bespoke Enhancements</label>
                                <div className="grid grid-cols-1 gap-3">
                                    {ADDON_CATALOG.slice(0, 5).map((addon) => (
                                        <button
                                            key={addon.id}
                                            onClick={() => {
                                                setSelectedAddOns(prev =>
                                                    prev.includes(addon.id) ? prev.filter(id => id !== addon.id) : [...prev, addon.id]
                                                );
                                            }}
                                            className={`flex items-center justify-between p-3 rounded-sm border transition-all ${selectedAddOns.includes(addon.id)
                                                ? 'bg-gold-400/10 border-gold-400 text-gold-400'
                                                : 'bg-white/5 border-white/5 text-white/40 hover:border-white/10'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg">{addon.icon}</span>
                                                <div className="text-left">
                                                    <p className="text-[9px] font-black uppercase tracking-widest">{addon.label}</p>
                                                    <p className="text-[8px] opacity-60">₹{addon.price.toLocaleString()} / {addon.per}</p>
                                                </div>
                                            </div>
                                            <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${selectedAddOns.includes(addon.id) ? 'bg-gold-400 border-gold-400' : 'border-white/20'
                                                }`}>
                                                {selectedAddOns.includes(addon.id) && <CheckCircle2 className="w-2 h-2 text-navy-950" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="space-y-4 pt-10 border-t border-white/5">
                                {hasMembership && TIER_BENEFITS[user.membershipTier] && (
                                    <div className="mb-6 space-y-3">
                                        <p className="text-[9px] font-black text-gold-400 uppercase tracking-widest">Your Exclusive {user.membershipTier} Perks</p>
                                        <div className="flex flex-wrap gap-2">
                                            {TIER_BENEFITS[user.membershipTier].map((perk, i) => (
                                                <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-gold-400/5 border border-gold-400/10 rounded-sm">
                                                    <Sparkles className="w-2 h-2 text-gold-400" />
                                                    <span className="text-[8px] font-bold text-white/60 uppercase tracking-tight">{perk}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                                    <span className="text-white/40">{nights} Nights Residency {hasMembership && `(${user.membershipTier} Rate)`}</span>
                                    <div className="text-right">
                                        <span className="text-white">₹{subtotal.toLocaleString()}</span>
                                        {hasMembership && (
                                            <p className="text-[8px] text-white/20 line-through">₹{(basePrice * nights).toLocaleString()}</p>
                                        )}
                                    </div>
                                </div>
                                {addOnTotal > 0 && (
                                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-gold-400">
                                        <span>Curated Add-ons</span>
                                        <span>+₹{addOnTotal.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-end pt-4">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">Final Valuation</span>
                                    <span className="text-4xl font-serif text-gold-400 italic">₹{total.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="mt-12">
                                <button
                                    onClick={handleBookNow}
                                    disabled={!isAvailable || checkingAvailability}
                                    className={`w-full py-5 rounded-sm font-bold text-[10px] uppercase tracking-[0.4em] transition-all shadow-2xl relative overflow-hidden group ${isAvailable && !checkingAvailability
                                        ? 'bg-gold-400 text-navy-950 hover:bg-white hover:shadow-gold-400/20'
                                        : 'bg-white/5 text-white/10 cursor-not-allowed'}`}
                                >
                                    <span className="relative z-10">{checkingAvailability ? 'Verifying Sanctuary...' : isAvailable ? 'Confirm Reservation' : 'Selection Occupied'}</span>
                                </button>
                            </div>

                            <p className="text-[9px] text-white/20 uppercase tracking-widest text-center leading-relaxed">
                                {hasMembership ? (
                                    <span className="text-gold-400 font-bold block mb-2 animate-pulse">
                                        Exclusive {user.membershipTier} Benefit Applied
                                    </span>
                                ) : null}
                                Secure your stay with a 50% luxury deposit. <br />
                                Terms & conditions of residency apply.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default RoomDetailPage;
