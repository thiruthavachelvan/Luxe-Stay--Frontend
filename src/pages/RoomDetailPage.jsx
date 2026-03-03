import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
    MapPin, Star, Bed, Users, Eye, Maximize2, ChevronRight,
    Wifi, Coffee, Tv, Wind, CheckCircle2, X, ChevronLeft,
    ChevronRight as ChevRight, Shield, Calendar, Minus, Plus,
    Loader2, Building, ShieldAlert
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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
    <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(s => (
            <Star key={s} className={`${size} ${s <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-luxury-border'} `} />
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

    /* ── Fetch room ── */
    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/public/rooms/${roomId}`);
                if (!res.ok) throw new Error('Room not found');
                const data = await res.json();
                setRoom(data);
                // Fetch reviews for this room directly via room ID (most accurate)
                const rRes = await fetch(`http://localhost:5000/api/reviews/room/${roomId}`);
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
                            const locRes = await fetch(`http://localhost:5000/api/reviews/location/${encodeURIComponent(cityName)}`);
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
                const res = await fetch(`http://localhost:5000/api/public/rooms/${room._id}/availability?${queryParams.toString()}`);
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
    const pricePerNight = room?.price || 0;
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

        navigate('/payment', {
            state: {
                roomId: room._id,
                room,
                checkIn,
                checkOut,
                nights,
                adults,
                children,
                subtotal,
                serviceFee,
                occupancyTax,
                addOns: addOnsDetails,
                total,
                offerCode
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
        <div className="min-h-screen bg-luxury-dark text-luxury-text">
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

            {/* ─── Gallery ─── */}
            <section className="container mx-auto px-6 py-4">
                <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[480px] rounded-3xl overflow-hidden">
                    {/* Main image */}
                    <div className="col-span-2 row-span-2 relative cursor-pointer group" onClick={() => openLightbox(0)}>
                        <img src={images[0]} alt="Main" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
                    </div>
                    {/* Thumbnails */}
                    {images.slice(1, 4).map((img, i) => (
                        <div key={i} className="relative cursor-pointer group overflow-hidden" onClick={() => openLightbox(i + 1)}>
                            <img src={img} alt={`View ${i + 2}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                            {i === 2 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center" onClick={() => openLightbox(0)}>
                                    <span className="text-white font-bold text-sm">View All Photos</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── Main Content ─── */}
            <section className="container mx-auto px-6 py-8">
                <div className="grid lg:grid-cols-3 gap-10 items-start">

                    {/* ── Left Column ── */}
                    <div className="lg:col-span-2 space-y-10">

                        {/* Room Header */}
                        <div>
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                <StarRow value={luxuryStars} />
                                <span className="text-xs text-luxury-muted font-bold uppercase tracking-widest">{luxuryStars}-Star Luxury</span>
                                <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${isAvailable ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
                                    {isAvailable ? 'Available' : 'Occupied'}
                                </span>
                            </div>
                            <h1 className="text-4xl font-bold text-white mb-3">{room.type}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-luxury-muted">
                                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-luxury-blue" />{room.location?.city || 'LuxeStay Hotel'}</span>
                                <span className="flex items-center gap-1.5"><Building className="w-4 h-4" />Room {room.roomNumber} · {room.floor}</span>
                            </div>
                            {avgRating > 0 && (
                                <div className="flex items-center gap-2 mt-3">
                                    <StarRow value={avgRating} size="w-3.5 h-3.5" />
                                    <span className="text-amber-400 font-bold text-sm">{avgRating}</span>
                                    <span className="text-luxury-muted text-xs">({reviewCount} reviews)</span>
                                </div>
                            )}
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { icon: Maximize2, label: 'Room Size', value: room.area || '45 m²' },
                                { icon: Bed, label: 'Bed Type', value: room.bedType || 'King Size' },
                                { icon: Users, label: 'Capacity', value: `${room.capacity?.adults || 2} Adults${room.capacity?.children ? ` · ${room.capacity.children} Children` : ''}` },
                                { icon: Eye, label: 'View', value: room.viewType || 'City View' },
                            ].map(({ icon: Icon, label, value }) => (
                                <div key={label} className="bg-luxury-card border border-luxury-border/30 rounded-2xl p-4 text-center">
                                    <Icon className="w-5 h-5 text-luxury-blue mx-auto mb-2" />
                                    <p className="text-[9px] text-luxury-muted uppercase tracking-widest mb-1 font-bold">{label}</p>
                                    <p className="text-sm font-bold text-white">{value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1 border-b border-luxury-border/30">
                            {[['description', 'Description'], ['amenities', 'Amenities'], ['reviews', 'Guest Reviews']].map(([id, label]) => (
                                <button
                                    key={id}
                                    onClick={() => scrollTo(id === 'description' ? descRef : id === 'amenities' ? amenRef : reviewRef, id)}
                                    className={`px-5 py-3 text-sm font-bold border-b-2 transition-all -mb-px ${activeTab === id ? 'border-luxury-blue text-luxury-blue' : 'border-transparent text-luxury-muted hover:text-white'}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Description */}
                        <div ref={descRef} className="scroll-mt-24">
                            <h2 className="text-xl font-bold text-white mb-4">Room Description</h2>
                            <p className="text-luxury-muted leading-relaxed">
                                {room.description ||
                                    `Experience the pinnacle of luxury in our ${room.type}. Designed for discerning guests, this beautifully appointed room offers a perfect sanctuary of comfort and elegance. Every detail has been meticulously curated — from the premium bedding and mood lighting to the stunning ${room.viewType || 'city'} views that greet you each morning. Ideal for ${room.capacity?.adults || 2} adults seeking an unforgettable stay at LuxeStay ${room.location?.city || ''}.`
                                }
                            </p>
                        </div>

                        {/* Amenities */}
                        <div ref={amenRef} className="scroll-mt-24">
                            <h2 className="text-xl font-bold text-white mb-5">World-Class Amenities</h2>
                            {room.amenities?.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {room.amenities.map((amenity, i) => {
                                        const Icon = amenityIcons[amenity] || CheckCircle2;
                                        return (
                                            <div key={i} className="flex items-center gap-3 bg-luxury-card border border-luxury-border/20 rounded-xl px-4 py-3">
                                                <Icon className="w-4 h-4 text-luxury-blue flex-shrink-0" />
                                                <span className="text-sm text-luxury-text font-medium">{amenity}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-luxury-muted italic">Amenity details not available.</p>
                            )}
                        </div>

                        {/* Benefits */}
                        {room.benefits?.length > 0 && (
                            <div>
                                <h2 className="text-xl font-bold text-white mb-5">Exclusive Benefits</h2>
                                <div className="bg-luxury-card border border-luxury-border/30 rounded-2xl p-6 space-y-3">
                                    {room.benefits.map((benefit, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                            <span className="text-sm text-luxury-text">{benefit}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Cancellation Policy */}
                        <div>
                            <h2 className="text-xl font-bold text-white mb-4">Cancellation Policy</h2>
                            <div className="bg-luxury-card border border-luxury-border/30 rounded-2xl p-5 flex gap-4">
                                <Shield className="w-5 h-5 text-luxury-blue flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-white font-semibold text-sm mb-1">Free Cancellation</p>
                                    <p className="text-luxury-muted text-sm leading-relaxed">Cancel for free up to 48 hours before your check-in date. After that, a charge equivalent to the first night's stay applies. No-shows are non-refundable.</p>
                                </div>
                            </div>
                        </div>

                        {/* Hotel Info */}
                        {room.location && (
                            <div>
                                <h2 className="text-xl font-bold text-white mb-4">Hotel Information</h2>
                                <div className="bg-luxury-card border border-luxury-border/30 rounded-2xl p-5 flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-luxury-blue/10 flex items-center justify-center flex-shrink-0">
                                        <Building className="w-7 h-7 text-luxury-blue" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">LuxeStay {room.location.city}</p>
                                        <p className="text-luxury-muted text-sm flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{room.location.city} · {room.location.category || 'India'}</p>
                                        {room.location.description && <p className="text-luxury-muted text-xs mt-1 line-clamp-2">{room.location.description}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Guest Reviews */}
                        <div ref={reviewRef} className="scroll-mt-24">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">Guest Reviews</h2>
                                {avgRating > 0 && (
                                    <div className="flex items-center gap-2 bg-luxury-card border border-luxury-border/30 rounded-xl px-4 py-2">
                                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                        <span className="font-bold text-white">{avgRating}</span>
                                        <span className="text-luxury-muted text-xs">/ 5.0</span>
                                    </div>
                                )}
                            </div>
                            {reviews.length === 0 ? (
                                <div className="bg-luxury-card border border-luxury-border/30 rounded-2xl p-12 text-center">
                                    <Star className="w-10 h-10 text-luxury-muted/20 mx-auto mb-3" />
                                    <p className="text-luxury-muted text-sm">No reviews yet for this property. Be the first to share your experience!</p>
                                </div>
                            ) : (
                                <div className="grid sm:grid-cols-2 gap-5">
                                    {reviews.map(review => (
                                        <div key={review._id} className="bg-luxury-card border border-luxury-border/30 rounded-2xl p-6 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-luxury-blue flex items-center justify-center text-white text-xs font-bold">
                                                        {review.user?.fullName?.[0] || 'G'}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-semibold text-sm">{review.user?.fullName || 'Guest'}</p>
                                                        <p className="text-luxury-muted text-[10px]">{new Date(review.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}</p>
                                                    </div>
                                                </div>
                                                <StarRow value={review.overallRating} size="w-3 h-3" />
                                            </div>
                                            <p className="text-luxury-muted text-sm leading-relaxed italic">"{review.comment}"</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Sticky Booking Widget ── */}
                    <div className="lg:sticky lg:top-28">
                        <div className="bg-luxury-card border border-luxury-border/30 rounded-[2.5rem] p-7 shadow-2xl space-y-5">
                            {/* Price */}
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-white">₹{pricePerNight.toLocaleString()}</span>
                                <span className="text-luxury-muted text-sm">/night</span>
                                <span className="ml-auto text-[9px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2 py-1">Best Price</span>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[9px] font-bold text-luxury-muted uppercase tracking-widest block mb-1.5">Check-In</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-luxury-muted pointer-events-none" />
                                        <input
                                            type="date"
                                            value={checkIn}
                                            min={dateStr(today)}
                                            onChange={e => { setCheckIn(e.target.value); if (e.target.value >= checkOut) { const next = new Date(e.target.value); next.setDate(next.getDate() + 1); setCheckOut(dateStr(next)); } }}
                                            className="w-full bg-luxury-dark border border-luxury-border/30 rounded-xl pl-8 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-luxury-blue/50 [color-scheme:dark]"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold text-luxury-muted uppercase tracking-widest block mb-1.5">Check-Out</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-luxury-muted pointer-events-none" />
                                        <input
                                            type="date"
                                            value={checkOut}
                                            min={checkIn}
                                            onChange={e => setCheckOut(e.target.value)}
                                            className="w-full bg-luxury-dark border border-luxury-border/30 rounded-xl pl-8 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-luxury-blue/50 [color-scheme:dark]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Guests */}
                            {(() => {
                                const maxAdults = room.capacity?.adults || 4;
                                const baseChildren = room.capacity?.children ?? 3;
                                const maxTotalGuests = maxAdults + baseChildren;

                                return (
                                    <div>
                                        <label className="text-[9px] font-bold text-luxury-muted uppercase tracking-widest block mb-1.5">Guests</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {/* Adults */}
                                            <div className="bg-luxury-dark border border-luxury-border/30 rounded-xl px-3 py-2.5 flex items-center justify-between gap-2">
                                                <span className="text-[10px] text-luxury-muted font-bold">Adults</span>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => setAdults(v => Math.max(1, v - 1))} className="w-6 h-6 rounded-full bg-luxury-border/30 flex items-center justify-center hover:bg-luxury-blue/20 transition-all text-white">
                                                        <Minus className="w-3 h-3 text-luxury-muted" />
                                                    </button>
                                                    <span className="text-white font-bold text-sm w-4 text-center">{adults}</span>
                                                    <button onClick={() => {
                                                        const newAdults = Math.min(maxAdults, adults + 1);
                                                        setAdults(newAdults);
                                                        if (newAdults + children > maxTotalGuests) {
                                                            setChildren(maxTotalGuests - newAdults);
                                                        }
                                                    }} className="w-6 h-6 rounded-full bg-luxury-border/30 flex items-center justify-center hover:bg-luxury-blue/20 transition-all text-white">
                                                        <Plus className="w-3 h-3 text-luxury-muted" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Children */}
                                            <div className="bg-luxury-dark border border-luxury-border/30 rounded-xl px-3 py-2.5 flex items-center justify-between gap-2">
                                                <span className="text-[10px] text-luxury-muted font-bold">Children</span>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => setChildren(v => Math.max(0, v - 1))} className="w-6 h-6 rounded-full bg-luxury-border/30 flex items-center justify-center hover:bg-luxury-blue/20 transition-all text-white">
                                                        <Minus className="w-3 h-3 text-luxury-muted" />
                                                    </button>
                                                    <span className="text-white font-bold text-sm w-4 text-center">{children}</span>
                                                    <button onClick={() => setChildren(v => Math.min(maxTotalGuests - adults, v + 1))} className="w-6 h-6 rounded-full bg-luxury-border/30 flex items-center justify-center hover:bg-luxury-blue/20 transition-all text-white">
                                                        <Plus className="w-3 h-3 text-luxury-muted" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Optional Add-Ons */}
                            {(() => {
                                const included = new Set((room.benefits || []).map(b => BENEFIT_TO_ADDON[b]).filter(Boolean));
                                const available = ADDON_CATALOG.filter(a => !included.has(a.id));
                                if (available.length === 0) return null;
                                return (
                                    <div>
                                        <label className="text-[9px] font-bold text-luxury-muted uppercase tracking-widest block mb-2">Optional Add-Ons</label>
                                        <div className="space-y-2">
                                            {available.map(addon => {
                                                const isSelected = selectedAddOns.includes(addon.id);
                                                return (
                                                    <button
                                                        key={addon.id}
                                                        type="button"
                                                        onClick={() => toggleAddOn(addon.id)}
                                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs transition-all ${isSelected
                                                            ? 'bg-luxury-blue/10 border-luxury-blue/50 text-white'
                                                            : 'bg-luxury-dark/60 border-luxury-border/20 text-luxury-muted hover:border-luxury-blue/30'
                                                            }`}
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <span>{addon.icon}</span>
                                                            <span className={isSelected ? 'text-white font-medium' : ''}>{addon.label}</span>
                                                        </span>
                                                        <span className="flex items-center gap-1.5 flex-shrink-0">
                                                            <span className={isSelected ? 'text-luxury-blue font-bold' : 'text-luxury-muted'}>
                                                                +₹{addon.price.toLocaleString()}{addon.per === 'night' ? '/night' : ''}
                                                            </span>
                                                            <span className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-luxury-blue border-luxury-blue' : 'border-luxury-border'
                                                                }`}>
                                                                {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                            </span>
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Price breakdown */}
                            <div className="bg-luxury-dark/50 rounded-2xl p-4 space-y-2.5 border border-luxury-border/20">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-luxury-muted">₹{pricePerNight.toLocaleString()} × {nights} night{nights > 1 ? 's' : ''}</span>
                                    <span className="text-white font-semibold">₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-luxury-muted">Service fee</span>
                                    <span className="text-white">₹{serviceFee.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-luxury-muted">Occupancy tax</span>
                                    <span className="text-white">₹{occupancyTax.toLocaleString()}</span>
                                </div>
                                {addOnTotal > 0 && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-luxury-muted">Add-ons ({selectedAddOns.length})</span>
                                        <span className="text-luxury-blue">+₹{addOnTotal.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="border-t border-luxury-border/30 pt-2.5 flex items-center justify-between">
                                    <span className="font-bold text-white">Total</span>
                                    <span className="font-bold text-xl text-luxury-blue">₹{total.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Cancellation & Refund Policy */}
                            <div className="bg-luxury-dark/40 border border-luxury-border/20 rounded-2xl p-4">
                                <h4 className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <ShieldAlert className="w-3.5 h-3.5 text-luxury-blue" />
                                    Cancellation & Refund Policy
                                </h4>
                                <div className="text-[10px] text-luxury-muted leading-relaxed space-y-2">
                                    <p>Users who have completed full payment for their booking are eligible for tiered refunds:</p>
                                    <ul className="list-disc pl-4 space-y-1">
                                        <li><span className="text-white font-medium">Immediate cancellation:</span> 75% refund</li>
                                        <li><span className="text-white font-medium">&gt;2 days before check-in:</span> 50% refund</li>
                                        <li><span className="text-white font-medium">1 day before check-in:</span> 25% refund</li>
                                        <li><span className="text-white font-medium">On/after check-in:</span> No refund</li>
                                    </ul>
                                    <p className="pt-1 border-t border-white/5"><span className="text-yellow-500 font-medium">Note:</span> For users selecting the advance payment option (25%), the advance payment is strictly non-refundable to secure the room exclusively.</p>
                                </div>
                            </div>

                            {/* CTA */}
                            <button
                                onClick={handleBookNow}
                                disabled={!isAvailable || checkingAvailability}
                                className={`w-full py-4 rounded-2xl font-bold text-sm transition-all shadow-xl tracking-wide ${isAvailable && !checkingAvailability
                                    ? 'bg-luxury-blue text-white hover:bg-luxury-blue-hover shadow-luxury-blue/20'
                                    : 'bg-luxury-border/20 text-luxury-muted cursor-not-allowed'}`}
                            >
                                {checkingAvailability ? 'Checking Dates...' : isAvailable ? 'Book Now' : 'Not Available for Dates'}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default RoomDetailPage;
