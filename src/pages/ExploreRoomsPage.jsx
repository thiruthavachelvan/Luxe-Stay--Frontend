import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
    Search, Star, Hotel, Globe, ArrowUpDown, Users, Maximize,
    Eye, Wifi, Coffee, Tv, Wind, Loader2, Calendar,
    MapPin, X, Filter, ChevronDown, BedDouble, Layers,
    Hash, Waves, UtensilsCrossed, Dumbbell, Car, Flower2,
    ChevronRight, Building2, Home, Sparkles
} from 'lucide-react';
import { calculateMemberPrice, getTierDiscount, TIER_BENEFITS } from '../utils/membership';

// ── Helpers
const AMENITY_ICONS = {
    'Wifi': Wifi, 'AC': Wind, 'Smart TV': Tv,
    'Mini Bar': Coffee, 'Coffee Maker': Coffee,
    'Balcony': Eye, 'Workspace': Hotel,
    'Pool': Waves, 'Spa': Flower2, 'Gym': Dumbbell,
    'Breakfast': UtensilsCrossed, 'Room Service': Hotel, 'Parking': Car,
};
const ALL_AMENITIES = Object.keys(AMENITY_ICONS);
const FLOORS = ['All Floors', 'Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', 'Luxury Wing', 'Location Special'];
const VIEW_TYPES = ['Any View', 'Sea View', 'City View', 'Garden View', 'Mountain View', 'Pool View'];
const SORT_OPTIONS = [
    { value: '', label: 'Default' },
    { value: 'rating_desc', label: '⭐ Rating: High → Low' },
    { value: 'price_asc', label: '₹ Price: Low → High' },
    { value: 'price_desc', label: '₹ Price: High → Low' },
    { value: 'name_asc', label: 'A → Z' },
];

const getRoomCategory = (room) => {
    const type = (room.type || '').toLowerCase();
    const adults = room.capacity?.adults ?? 1;
    if (adults === 1 || type.includes('single')) return 'Single Room';
    if (adults >= 3 || ['family', 'presidential', 'suite', 'villa', 'exclusive'].some(k => type.includes(k))) return 'Family Room';
    return 'Double Room';
};

// ── Portal Dropdown (escapes all overflow constraints)
const useDropdown = () => {
    const [openId, setOpenId] = useState(null);
    const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
    const refs = useRef({});

    useEffect(() => {
        const handler = (e) => {
            const inTrigger = Object.values(refs.current).some(el => el?.contains(e.target));
            if (!inTrigger) setOpenId(null);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const open = (id, el) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        setPos({ top: r.bottom + 6, left: r.left, width: Math.max(r.width, 200) });
        setOpenId(prev => prev === id ? null : id);
    };

    const close = () => setOpenId(null);

    const Portal = ({ id, children }) =>
        openId !== id ? null : createPortal(
            <div style={{ position: 'fixed', top: pos.top, left: pos.left, minWidth: pos.width, zIndex: 99999 }}
                className="bg-navy-950/95 backdrop-blur-2xl border border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] p-4 overflow-hidden rounded-sm">
                {children}
            </div>,
            document.body
        );

    return { openId, open, close, refs: refs.current, Portal };
};

// ── Side section
const SideSection = ({ title, icon: Icon, children, badge }) => {
    const [open, setOpen] = useState(true);
    return (
        <div className="border-b border-white/5 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
            <button onClick={() => setOpen(v => !v)}
                className="flex items-center justify-between w-full mb-3 group">
                <div className="flex items-center gap-2.5">
                    {Icon && <Icon className="w-3.5 h-3.5 text-gold-400/60" />}
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 group-hover:text-gold-400 transition-colors">{title}</span>
                    {badge > 0 && (
                        <span className="w-4 h-4 bg-gold-400 text-navy-950 text-[9px] font-bold rounded-full flex items-center justify-center">{badge}</span>
                    )}
                </div>
                <ChevronDown className={`w-3 h-3 text-white/20 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && children}
        </div>
    );
};

// ── Top filter chip button
const FilterBtn = ({ label, icon: Icon, active, count, triggerRef, onClick }) => (
    <button ref={triggerRef} onClick={onClick}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-sm text-[10px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap
            ${active || count > 0
                ? 'bg-gold-400 border-gold-400 text-navy-950 shadow-lg shadow-gold-400/10'
                : 'border-white/5 bg-navy-900/40 text-white/60 hover:text-white hover:border-gold-400/50'}`}>
        {Icon && <Icon className="w-3 h-3" />}
        {label}
        {count > 0 && !active && (
            <span className="w-4 h-4 bg-gold-400 text-navy-950 text-[9px] font-bold rounded-full flex items-center justify-center">{count}</span>
        )}
        <ChevronDown className={`w-3 h-3 opacity-40 transition-transform ${active ? 'rotate-180' : ''}`} />
    </button>
);

const ExploreRoomsPage = () => {
    const [rooms, setRooms] = useState([]);
    const [allLocations, setAllLocations] = useState([]);
    const [roomRatings, setRoomRatings] = useState({});
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { openId, open, close, refs: dropRefs, Portal } = useDropdown();

    // Refs for filter buttons
    const btnRefs = {
        roomType: useRef(null),
        rating: useRef(null),
        amenities: useRef(null),
        view: useRef(null),
        price: useRef(null),
        guests: useRef(null),
        sort: useRef(null),
    };

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedFloor, setSelectedFloor] = useState('All Floors');
    const [selectedRoomType, setSelectedRoomType] = useState('All Rooms');
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [minRating, setMinRating] = useState(0);
    const [maxPrice, setMaxPrice] = useState(200000);
    const [priceSliderMax, setPriceSliderMax] = useState(200000);
    const [guestFilter, setGuestFilter] = useState(1);
    const [selectedViewType, setSelectedViewType] = useState('Any View');
    const [sortOrder, setSortOrder] = useState('');
    const [activeOffer, setActiveOffer] = useState(null);
    const [checkIn] = useState(() => searchParams.get('checkIn') || new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const loadUser = () => setUser(JSON.parse(sessionStorage.getItem('userData') || 'null'));
        loadUser();
        window.addEventListener('focus', loadUser);

        fetch(`${__API_BASE__}/api/public/locations`)
            .then(r => r.json())
            .then(data => {
                const active = (data || []).filter(l => l.status === 'Active');
                setAllLocations(active);
                const urlLoc = searchParams.get('location');
                const first = (urlLoc && active.find(l => l.city === urlLoc)) ? urlLoc : (active[0]?.city || '');
                setSelectedLocation(first);
            }).catch(() => { });

        const urlOffer = searchParams.get('offerCode');
        const urlRoomType = searchParams.get('roomType');
        if (urlOffer) setActiveOffer({ code: urlOffer, roomType: urlRoomType });
        else if (urlRoomType) setSelectedRoomType(urlRoomType);

        return () => window.removeEventListener('focus', loadUser);
    }, [searchParams]);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${__API_BASE__}/api/public/rooms`);
                if (res.ok) {
                    const data = await res.json();
                    setRooms(data);
                    const maxP = Math.max(...data.map(r => r.price || 0), 5000);
                    const rounded = Math.ceil(maxP / 5000) * 5000;
                    setPriceSliderMax(rounded);
                    if (!searchParams.get('maxPrice')) setMaxPrice(rounded);
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchRooms();
    }, []);

    useEffect(() => {
        if (rooms.length === 0) return;
        (async () => {
            const ratings = {};
            await Promise.all([...new Set(rooms.map(r => r._id))].map(async id => {
                try {
                    const r = await fetch(`${__API_BASE__}/api/reviews/room/${id}`);
                    if (r.ok) {
                        const reviews = await r.json();
                        if (reviews.length > 0) {
                            const avg = reviews.reduce((s, rv) => s + rv.overallRating, 0) / reviews.length;
                            ratings[id] = { avg: Math.round(avg * 10) / 10, count: reviews.length };
                        }
                    }
                } catch (_) { }
            }));
            setRoomRatings(ratings);
        })();
    }, [rooms]);

    const locationRooms = rooms.filter(r => r.location?.city === selectedLocation);

    const filteredRooms = locationRooms.filter(room => {
        const matchSearch = !searchQuery ||
            (room.type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (room.roomNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchType = selectedRoomType === 'All Rooms' || getRoomCategory(room) === selectedRoomType;
        const matchFloor = selectedFloor === 'All Floors' || room.floor === selectedFloor;
        const matchPrice = room.price <= maxPrice;
        const matchGuests = guestFilter <= 1 || (room.capacity?.adults ?? 1) >= guestFilter;
        const matchAmenities = selectedAmenities.length === 0 || selectedAmenities.every(a => room.amenities?.includes(a));
        const rating = roomRatings[room._id]?.avg || 0;
        const matchRating = minRating === 0 || rating >= minRating;
        const matchView = selectedViewType === 'Any View' || room.viewType === selectedViewType;
        return matchSearch && matchType && matchFloor && matchPrice && matchGuests && matchAmenities && matchRating && matchView;
    }).sort((a, b) => {
        if (sortOrder === 'price_asc') return a.price - b.price;
        if (sortOrder === 'price_desc') return b.price - a.price;
        if (sortOrder === 'rating_desc') return (roomRatings[b._id]?.avg || 0) - (roomRatings[a._id]?.avg || 0);
        if (sortOrder === 'name_asc') return (a.type || '').localeCompare(b.type || '');
        return 0;
    });

    const availableCount = filteredRooms.filter(r => r.status === 'Available').length;
    const toggleAmenity = a => setSelectedAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

    const resetAll = () => {
        setSelectedFloor('All Floors'); setSelectedRoomType('All Rooms');
        setMaxPrice(priceSliderMax); setGuestFilter(1); setSortOrder('');
        setSelectedAmenities([]); setMinRating(0); setSearchQuery('');
        setSelectedViewType('Any View');
    };

    const activeCount = [
        selectedFloor !== 'All Floors' ? 1 : 0,
        selectedRoomType !== 'All Rooms' ? 1 : 0,
        selectedAmenities.length,
        minRating > 0 ? 1 : 0,
        selectedViewType !== 'Any View' ? 1 : 0,
        guestFilter > 1 ? 1 : 0,
        maxPrice < priceSliderMax ? 1 : 0,
    ].reduce((a, b) => a + b, 0);

    const ROOM_CATEGORIES = ['All Rooms', 'Single Room', 'Double Room', 'Family Room'];

    return (
        <div className="min-h-screen bg-navy-950 text-slate-200 font-sans flex flex-col selection:bg-gold-400 selection:text-navy-950">

            {/* ── Topbar ─────────────────────────────────────── */}
            <div className="sticky top-0 z-40 bg-navy-950/80 backdrop-blur-xl border-b border-white/5">
                {/* brand + search + dates + user */}
                <div className="flex items-center gap-6 px-6 h-20">
                    {/* Brand + Home */}
                    <button onClick={() => navigate('/')} className="flex items-center gap-3 shrink-0 group">
                        <div className="w-10 h-10 bg-gold-400 rounded-sm flex items-center justify-center group-hover:bg-white transition-colors duration-500">
                            <Hotel className="w-5 h-5 text-navy-950" />
                        </div>
                        <span className="font-serif text-white text-xl tracking-tight hidden sm:block">LuxeStay <span className="italic text-gold-400">Reimagined</span></span>
                    </button>

                    <button onClick={() => navigate('/')}
                        className="hidden lg:flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-gold-400 transition-colors">
                        <Home className="w-3.5 h-3.5" />
                        <span>Home</span>
                    </button>

                    <div className="relative flex-1 max-w-sm ml-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Find your sanctuary…"
                            className="w-full bg-white/5 border border-white/5 rounded-sm py-3 pl-12 pr-4 text-xs text-white placeholder-white/20 focus:outline-none focus:border-gold-400/50 transition-all" />
                    </div>

                    <div className="ml-auto flex items-center gap-6">
                        {user ? (
                            <button onClick={() => navigate('/dashboard')}
                                className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-all group rounded-sm">
                                <div className="w-9 h-9 rounded-full bg-gold-400 flex items-center justify-center font-bold text-navy-950 text-xs shrink-0 border border-white/10">
                                    {(user.fullName || 'G')[0]}
                                </div>
                                <div className="hidden sm:block text-left">
                                    <p className="text-[10px] font-bold text-white uppercase tracking-widest leading-none mb-1">{user.fullName?.split(' ')[0] || 'Guest'}</p>
                                    <p className="text-[9px] text-gold-400/60 uppercase tracking-widest font-bold">Account</p>
                                </div>
                            </button>
                        ) : (
                            <button onClick={() => navigate('/login')}
                                className="px-8 py-3 bg-gold-400 text-navy-950 text-[11px] font-bold uppercase tracking-widest rounded-sm hover:bg-white transition-all shadow-xl shadow-gold-400/10">
                                Sign In
                            </button>
                        )}
                    </div>
                </div>


                {/* ── Filter strip ─────────────────────────────── */}
                <div className="flex items-center justify-center gap-2 px-4 pb-3 overflow-x-auto hide-scrollbar">

                    {/* Room Type dropdown */}
                    <FilterBtn
                        triggerRef={el => { if (el) btnRefs.roomType.current = el; }}
                        label={selectedRoomType}
                        icon={BedDouble}
                        active={openId === 'roomType'}
                        count={selectedRoomType !== 'All Rooms' ? 1 : 0}
                        onClick={() => open('roomType', btnRefs.roomType.current)}
                    />
                    <Portal id="roomType">
                        <p className="text-[9px] font-bold text-gold-400 uppercase tracking-widest mb-3 opacity-60">Category</p>
                        {ROOM_CATEGORIES.map(t => (
                            <button key={t} onMouseDown={() => { setSelectedRoomType(t); close(); }}
                                className={`w-full text-left px-4 py-2.5 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all ${selectedRoomType === t ? 'bg-gold-400 text-navy-950 font-black' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                                {t}
                            </button>
                        ))}
                    </Portal>

                    <div className="w-px h-5 bg-luxury-border/30 shrink-0" />

                    {/* Rating dropdown */}
                    <FilterBtn
                        triggerRef={el => { if (el) btnRefs.rating.current = el; }}
                        label={minRating === 0 ? 'Any Rating' : `${minRating}★+`}
                        icon={Star}
                        active={openId === 'rating'}
                        count={minRating > 0 ? 1 : 0}
                        onClick={() => open('rating', btnRefs.rating.current)}
                    />
                    <Portal id="rating">
                        <p className="text-[9px] font-bold text-gold-400 uppercase tracking-widest mb-3 opacity-60">Minimum Standards</p>
                        {[{ v: 0, label: 'Any Rating' }, { v: 3, label: '3★ & above' }, { v: 4, label: '4★ & above' }, { v: 5, label: '5★ Only' }].map(({ v, label }) => (
                            <button key={v} onMouseDown={() => { setMinRating(v); close(); }}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-sm text[10px] uppercase font-bold tracking-widest transition-all ${minRating === v ? 'bg-gold-400 text-navy-950' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                                <Star className={`w-3 h-3 ${minRating === v ? 'fill-navy-950' : 'fill-gold-400'}`} />{label}
                            </button>
                        ))}
                    </Portal>

                    {/* Amenities dropdown */}
                    <FilterBtn
                        triggerRef={el => { if (el) btnRefs.amenities.current = el; }}
                        label="Amenities"
                        icon={Filter}
                        active={openId === 'amenities'}
                        count={selectedAmenities.length}
                        onClick={() => open('amenities', btnRefs.amenities.current)}
                    />
                    <Portal id="amenities">
                        <p className="text-[9px] font-bold text-luxury-gold uppercase tracking-widest mb-2">Amenities</p>
                        <div className="grid grid-cols-2 gap-1">
                            {ALL_AMENITIES.map(a => {
                                const Icon = AMENITY_ICONS[a];
                                const checked = selectedAmenities.includes(a);
                                return (
                                    <button key={a} onMouseDown={() => toggleAmenity(a)}
                                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-medium border transition-all
                                            ${checked ? 'bg-luxury-blue/20 border-luxury-blue text-luxury-blue' : 'border-luxury-border/20 text-luxury-muted hover:text-white'}`}>
                                        <Icon className="w-3 h-3" />{a}
                                    </button>
                                );
                            })}
                        </div>
                        {selectedAmenities.length > 0 && (
                            <button onMouseDown={() => setSelectedAmenities([])}
                                className="w-full mt-2 text-[10px] text-red-400 hover:text-red-300">Clear amenities</button>
                        )}
                    </Portal>

                    {/* View dropdown */}
                    <FilterBtn
                        triggerRef={el => { if (el) btnRefs.view.current = el; }}
                        label={selectedViewType === 'Any View' ? 'View' : selectedViewType}
                        icon={Eye}
                        active={openId === 'view'}
                        count={selectedViewType !== 'Any View' ? 1 : 0}
                        onClick={() => open('view', btnRefs.view.current)}
                    />
                    <Portal id="view">
                        <p className="text-[9px] font-bold text-luxury-gold uppercase tracking-widest mb-2">Room View</p>
                        {VIEW_TYPES.map(v => (
                            <button key={v} onMouseDown={() => { setSelectedViewType(v); close(); }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${selectedViewType === v ? 'bg-luxury-blue/20 text-luxury-blue' : 'text-luxury-muted hover:text-white hover:bg-white/5'}`}>
                                {v}
                            </button>
                        ))}
                    </Portal>

                    {/* Price dropdown */}
                    <FilterBtn
                        triggerRef={el => { if (el) btnRefs.price.current = el; }}
                        label={maxPrice < priceSliderMax ? `≤ ₹${(maxPrice / 1000).toFixed(0)}K` : 'Price'}
                        icon={null}
                        active={openId === 'price'}
                        count={maxPrice < priceSliderMax ? 1 : 0}
                        onClick={() => open('price', btnRefs.price.current)}
                    />
                    <Portal id="price">
                        <p className="text-[9px] font-bold text-luxury-gold uppercase tracking-widest mb-3">Max Price / Night</p>
                        <div className="flex justify-between text-xs font-bold text-white mb-2">
                            <span>₹0</span><span>₹{maxPrice.toLocaleString('en-IN')}</span>
                        </div>
                        <input type="range" min="0" max={priceSliderMax}
                            step={Math.ceil(priceSliderMax / 100) * 10}
                            value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))}
                            className="w-full accent-luxury-blue h-1.5 rounded-lg" />
                        <div className="flex justify-between text-[9px] text-luxury-muted mt-1">
                            <span>₹0</span><span>₹{priceSliderMax.toLocaleString('en-IN')}+</span>
                        </div>
                    </Portal>

                    {/* Guests dropdown */}
                    <FilterBtn
                        triggerRef={el => { if (el) btnRefs.guests.current = el; }}
                        label={guestFilter > 1 ? `${guestFilter} Guests` : 'Guests'}
                        icon={Users}
                        active={openId === 'guests'}
                        count={guestFilter > 1 ? 1 : 0}
                        onClick={() => open('guests', btnRefs.guests.current)}
                    />
                    <Portal id="guests">
                        <p className="text-[9px] font-bold text-luxury-gold uppercase tracking-widest mb-3">Adults</p>
                        <div className="flex items-center gap-4 justify-center py-1">
                            <button onMouseDown={() => setGuestFilter(g => Math.max(1, g - 1))}
                                className="w-9 h-9 rounded-full border border-luxury-border/40 text-white text-lg font-bold hover:border-luxury-blue hover:text-luxury-blue transition-all">−</button>
                            <span className="text-2xl font-bold text-white w-8 text-center">{guestFilter}</span>
                            <button onMouseDown={() => setGuestFilter(g => Math.min(6, g + 1))}
                                className="w-9 h-9 rounded-full border border-luxury-border/40 text-white text-lg font-bold hover:border-luxury-blue hover:text-luxury-blue transition-all">+</button>
                        </div>
                    </Portal>

                    <div className="w-px h-5 bg-luxury-border/30 shrink-0" />

                    {/* Sort dropdown */}
                    <FilterBtn
                        triggerRef={el => { if (el) btnRefs.sort.current = el; }}
                        label={sortOrder ? SORT_OPTIONS.find(s => s.value === sortOrder)?.label : 'Sort'}
                        icon={ArrowUpDown}
                        active={openId === 'sort'}
                        count={sortOrder ? 1 : 0}
                        onClick={() => open('sort', btnRefs.sort.current)}
                    />
                    <Portal id="sort">
                        <p className="text-[9px] font-bold text-luxury-gold uppercase tracking-widest mb-2">Sort By</p>
                        {SORT_OPTIONS.map(s => (
                            <button key={s.value} onMouseDown={() => { setSortOrder(s.value); close(); }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${sortOrder === s.value ? 'bg-luxury-blue/20 text-luxury-blue' : 'text-luxury-muted hover:text-white hover:bg-white/5'}`}>
                                {s.label}
                            </button>
                        ))}
                    </Portal>

                    {activeCount > 0 && (
                        <button onMouseDown={resetAll}
                            className="flex items-center gap-2 px-6 py-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all whitespace-nowrap shrink-0">
                            Reset Filters ({activeCount})
                        </button>
                    )}
                </div>
            </div>

            {/* ── Body: sidebar + content ─────────────────────── */}
            <div className="flex flex-1 min-h-0">

                {/* LEFT SIDEBAR */}
                <aside className="w-72 shrink-0 bg-navy-950 border-r border-white/5 overflow-y-auto sticky top-20 hidden lg:block" style={{ maxHeight: 'calc(100vh - 80px)' }}>
                    <div className="p-8">

                        {/* LOCATIONS */}
                        <SideSection title="The World of LuxeStays" icon={MapPin}>
                            <div className="space-y-1 mt-4">
                                {allLocations.map(loc => {
                                    const cnt = rooms.filter(r => r.location?.city === loc.city).length;
                                    const isActive = selectedLocation === loc.city;
                                    return (
                                        <button key={loc._id} onClick={() => { setSelectedLocation(loc.city); setSelectedFloor('All Floors'); }}
                                            className={`flex items-center justify-between w-full px-4 py-3 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all
                                                ${isActive ? 'bg-gold-400 text-navy-950 shadow-lg shadow-gold-400/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                                            <span className="flex items-center gap-3">
                                                <Globe className={`w-3 h-3 ${isActive ? 'text-navy-950' : 'text-gold-400/40'}`} />{loc.city}
                                            </span>
                                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${isActive ? 'bg-navy-950/20 text-navy-950' : 'bg-white/5 text-white/20'}`}>{cnt}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </SideSection>

                        {/* FLOORS */}
                        <SideSection title="Architectural Sections" icon={Layers}>
                            <div className="space-y-1 mt-4">
                                {FLOORS.map(fl => {
                                    const cnt = fl === 'All Floors'
                                        ? locationRooms.length
                                        : locationRooms.filter(r => r.floor === fl).length;
                                    if (fl !== 'All Floors' && cnt === 0) return null;
                                    const isLS = fl === 'Location Special';
                                    const isLW = fl === 'Luxury Wing';
                                    const isActive = selectedFloor === fl;
                                    return (
                                        <button key={fl} onClick={() => setSelectedFloor(fl)}
                                            className={`flex items-center justify-between w-full px-4 py-3 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all
                                                ${isActive
                                                    ? 'bg-white/5 text-white border-l-2 border-gold-400 pl-3.5'
                                                    : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                                            <span>{fl}</span>
                                            <span className={`text-[9px] font-black ${isActive ? 'text-gold-400' : 'text-white/10'}`}>{cnt}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </SideSection>

                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="flex-1 min-w-0 px-10 py-12">

                    {/* Heading */}
                    <div className="flex items-center justify-between mb-16 flex-wrap gap-8">
                        <div>
                            <div className="flex items-center gap-2 text-[10px] text-white/20 font-bold uppercase tracking-[0.3em] mb-4">
                                <Globe className="w-3 h-3 text-gold-400" />
                                <span>{selectedLocation}</span>
                                {selectedFloor !== 'All Floors' && <><ChevronRight className="w-3 h-3" /><span>{selectedFloor}</span></>}
                                {selectedRoomType !== 'All Rooms' && <><ChevronRight className="w-3 h-3" /><span>{selectedRoomType}</span></>}
                            </div>
                            <h1 className="text-4xl font-serif text-white flex items-center gap-4 flex-wrap mb-4">
                                <span className="italic text-gold-400">{selectedLocation}</span> Collection
                                {selectedFloor === 'Location Special' && (
                                    <span className="text-[9px] bg-gold-400/10 text-gold-400 px-3 py-1 rounded-full border border-gold-400/20 uppercase tracking-widest font-black">Heritage</span>
                                )}
                                {selectedFloor === 'Luxury Wing' && (
                                    <span className="text-[9px] bg-white/5 text-white px-3 py-1 rounded-full border border-white/10 uppercase tracking-widest font-black">VIP Exclusive</span>
                                )}
                            </h1>
                            <p className="text-white/40 text-sm font-light">
                                Showing {filteredRooms.length} sanctuaries · <span className="text-emerald-400/60">{availableCount} available for immediate residency</span>
                            </p>
                        </div>

                        {activeOffer && (
                            <div className="flex items-center gap-3 px-5 py-2.5 bg-gold-400/5 border border-gold-400/20 rounded-sm">
                                <Star className="w-4 h-4 text-gold-400 fill-gold-400" />
                                <span className="text-[10px] text-white font-black uppercase tracking-widest">Privilege Code: {activeOffer.code}</span>
                                <button onClick={() => setActiveOffer(null)} className="ml-2"><X className="w-3.5 h-3.5 text-white/20 hover:text-white transition-colors" /></button>
                            </div>
                        )}
                    </div>

                    {/* Room Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="glass-panel aspect-[4/5] rounded-sm animate-pulse" />
                            ))}
                        </div>
                    ) : filteredRooms.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-96 text-center glass-panel rounded-sm">
                            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/5 flex items-center justify-center mb-6">
                                <Hotel className="w-6 h-6 text-white/10" />
                            </div>
                            <h3 className="text-2xl font-serif text-white mb-3 italic">No Sanctuaries Match Your Criteria</h3>
                            <p className="text-white/40 text-sm font-light max-w-sm mb-8">Refine your selections to discover your ideal stay.</p>
                            <button onClick={resetAll}
                                className="px-10 py-3 border border-gold-400/30 text-gold-400 text-[10px] font-bold uppercase tracking-widest hover:bg-gold-400 hover:text-navy-950 transition-all">
                                Clear Preference Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-12">
                            {filteredRooms.map(room => {
                                const isAvailable = room.status === 'Available';
                                const ratingInfo = roomRatings[room._id];
                                const isLS = room.floor === 'Location Special';
                                const isLW = room.floor === 'Luxury Wing';

                                return (
                                    <motion.div
                                        key={room._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        onClick={() => isAvailable && navigate(activeOffer ? `/rooms/${room._id}?offerCode=${activeOffer.code}` : `/rooms/${room._id}`)}
                                        className="glass-panel rounded-sm overflow-hidden flex flex-col group cursor-pointer border-white/5 hover:bg-navy-900/60 transition-all duration-500"
                                    >

                                        {/* Image */}
                                        <div className="relative aspect-[4/5] overflow-hidden">
                                            <img
                                                src={room.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80'}
                                                alt={room.type}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
                                            />
                                            {/* badges top-left */}
                                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                                <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] rounded-sm shadow-2xl ${isAvailable ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                                    {isAvailable ? 'Available' : 'Reserved'}
                                                </span>
                                                {isLS && <span className="px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] rounded-sm shadow-2xl bg-gold-400 text-navy-950 border border-white/10">Heritage</span>}
                                                {isLW && <span className="px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] rounded-sm shadow-2xl bg-white/10 text-white backdrop-blur-md border border-white/10">Elite</span>}
                                            </div>

                                            {/* price overlay */}
                                            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-navy-950/80 to-transparent">
                                                <div className="flex items-end justify-between">
                                                    <div>
                                                        <span className="text-[9px] text-white/40 uppercase tracking-widest block mb-1">
                                                            {user?.membershipTier && user.membershipTier !== 'None' ? `${user.membershipTier} Member Rate` : 'Nightly Rate'}
                                                        </span>
                                                        <span className="text-2xl font-serif text-white">
                                                            ₹{user?.membershipTier && user.membershipTier !== 'None'
                                                                ? calculateMemberPrice(room.price, user.membershipTier).toLocaleString('en-IN')
                                                                : room.price?.toLocaleString('en-IN')}
                                                        </span>
                                                        {user?.membershipTier && user.membershipTier !== 'None' && (
                                                            <span className="text-[9px] text-gold-400 block mt-1 font-bold uppercase tracking-widest">
                                                                You save {getTierDiscount(user.membershipTier)}%
                                                                <span className="line-through text-white/20 ml-2">₹{room.price?.toLocaleString('en-IN')}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-sm">
                                                        <Star className="w-2.5 h-2.5 text-gold-400 fill-gold-400" />
                                                        <span className="text-[10px] font-bold text-white">{ratingInfo ? ratingInfo.avg.toFixed(1) : 'NEW'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Body */}
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="mb-4">
                                                <h3 className="text-xl font-serif text-white group-hover:text-gold-400 transition-colors mb-2 leading-tight">
                                                    {room.type}
                                                </h3>
                                                <div className="flex items-center gap-4 text-[10px] text-white/40 uppercase tracking-widest font-bold">
                                                    <span className="flex items-center gap-1.5"><Users className="w-3 h-3 text-gold-400/40" />{getRoomCategory(room)}</span>
                                                    <span className="flex items-center gap-1.5"><Eye className="w-3 h-3 text-gold-400/40" />{room.viewType || 'Scenic'}</span>
                                                </div>

                                                {user?.membershipTier && user.membershipTier !== 'None' && TIER_BENEFITS[user.membershipTier] && (
                                                    <div className="mt-4 flex flex-wrap gap-1.5">
                                                        {TIER_BENEFITS[user.membershipTier].slice(1, 4).map((benefit, bi) => (
                                                            <div key={bi} className="flex items-center gap-1 px-2 py-0.5 bg-gold-400/10 border border-gold-400/20 rounded-sm">
                                                                <Sparkles className="w-2 h-2 text-gold-400" />
                                                                <span className="text-[7px] font-black uppercase text-gold-400/80">{benefit}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-2 mb-8">
                                                {room.amenities?.slice(0, 3).map((a, i) => {
                                                    const Icon = AMENITY_ICONS[a] || Star;
                                                    return (
                                                        <span key={i} className="px-3 py-1 bg-white/5 border border-white/5 text-white/60 text-[8px] font-bold uppercase tracking-widest rounded-sm flex items-center gap-2">
                                                            <Icon className="w-2.5 h-2.5" />{a}
                                                        </span>
                                                    );
                                                })}
                                                {room.amenities?.length > 3 && <span className="text-white/20 text-[8px] font-bold flex items-center">+{room.amenities.length - 3}</span>}
                                            </div>

                                            <div className="mt-auto">
                                                <button
                                                    onClick={e => { e.stopPropagation(); if (!isAvailable) return; navigate(activeOffer ? `/rooms/${room._id}?offerCode=${activeOffer.code}` : `/rooms/${room._id}`); }}
                                                    className={`w-full py-3.5 rounded-sm font-bold text-[10px] uppercase tracking-[0.2em] transition-all ${isAvailable
                                                        ? 'bg-gold-400 text-navy-950 hover:bg-white hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]'
                                                        : 'bg-white/5 border border-white/5 text-white/20 cursor-not-allowed'}`}>
                                                    {isAvailable ? 'Begin Reservation' : 'Reserved Selection'}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>

            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default ExploreRoomsPage;





