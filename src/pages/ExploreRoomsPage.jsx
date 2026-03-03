import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Search, Star, Hotel, Globe, ArrowUpDown, Users, Maximize,
    Eye, Wifi, Coffee, Tv, Wind, Loader2, Calendar,
    MapPin, X, Filter, ChevronDown, BedDouble, Layers,
    Hash, Waves, UtensilsCrossed, Dumbbell, Car, Flower2,
    ChevronRight, Building2
} from 'lucide-react';

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
                className="bg-[#1A2235] border border-white/10 rounded-2xl shadow-2xl p-3 overflow-hidden">
                {children}
            </div>,
            document.body
        );

    return { openId, open, close, refs: refs.current, Portal };
};

// ── Sidebar section
const SideSection = ({ title, icon: Icon, children, badge }) => {
    const [open, setOpen] = useState(true);
    return (
        <div className="border-b border-luxury-border/10 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
            <button onClick={() => setOpen(v => !v)}
                className="flex items-center justify-between w-full mb-2 group">
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-3.5 h-3.5 text-luxury-gold" />}
                    <span className="text-[11px] font-bold uppercase tracking-widest text-luxury-gold">{title}</span>
                    {badge > 0 && (
                        <span className="w-4 h-4 bg-luxury-blue text-white text-[9px] font-bold rounded-full flex items-center justify-center">{badge}</span>
                    )}
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-luxury-muted transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && children}
        </div>
    );
};

// ── Top filter chip button
const FilterBtn = ({ label, icon: Icon, active, count, triggerRef, onClick }) => (
    <button ref={triggerRef} onClick={onClick}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all whitespace-nowrap
            ${active || count > 0
                ? 'bg-luxury-blue/15 border-luxury-blue text-luxury-blue shadow'
                : 'border-luxury-border/20 bg-luxury-card text-luxury-muted hover:text-white hover:border-luxury-blue/40'}`}>
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
        {count > 0 && (
            <span className="w-4 h-4 bg-luxury-blue text-white text-[9px] font-bold rounded-full flex items-center justify-center">{count}</span>
        )}
        <ChevronDown className={`w-3 h-3 transition-transform ${active ? 'rotate-180' : ''}`} />
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

        fetch('http://localhost:5000/api/public/locations')
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
                const res = await fetch(`http://localhost:5000/api/public/rooms`);
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
                    const r = await fetch(`http://localhost:5000/api/reviews/room/${id}`);
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
        <div className="min-h-screen bg-[#0F1626] text-white font-sans flex flex-col">

            {/* ── Topbar ─────────────────────────────────────── */}
            <div className="sticky top-0 z-40 bg-[#0F1626]/96 backdrop-blur border-b border-luxury-border/20">
                {/* brand + search + dates + user */}
                <div className="flex items-center gap-3 px-4 h-14">
                    {/* Brand + Home */}
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 shrink-0 group">
                        <div className="w-7 h-7 bg-luxury-blue rounded-lg flex items-center justify-center group-hover:bg-luxury-gold transition-colors">
                            <Hotel className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-luxury-gold font-serif italic text-sm hidden sm:block">LuxeStays</span>
                    </button>

                    {/* Back to Home pill */}
                    <button onClick={() => navigate('/')}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-luxury-border/30 bg-luxury-card text-luxury-muted text-xs font-semibold hover:text-white hover:border-luxury-blue/50 transition-all shrink-0">
                        ← Home
                    </button>

                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-luxury-muted pointer-events-none" />
                        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search room or number…"
                            className="w-full bg-luxury-card border border-luxury-border/25 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-luxury-muted focus:outline-none focus:border-luxury-blue" />
                    </div>

                    <div className="ml-auto flex items-center gap-3">
                        {user ? (
                            <button onClick={() => navigate('/dashboard')}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-luxury-card border border-luxury-border/30 hover:border-luxury-gold/50 transition-all group">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-luxury-gold to-yellow-300 flex items-center justify-center font-bold text-luxury-dark text-sm shrink-0">
                                    {(user.fullName || 'G')[0]}
                                </div>
                                <div className="hidden sm:block text-left">
                                    <p className="text-[11px] font-bold text-white leading-tight">{user.fullName?.split(' ')[0] || 'Guest'}</p>
                                    <p className="text-[9px] text-luxury-muted">Dashboard →</p>
                                </div>
                            </button>
                        ) : (
                            <button onClick={() => navigate('/login')}
                                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-luxury-gold to-yellow-400 text-luxury-dark text-sm font-bold rounded-xl shadow-lg hover:from-yellow-400 hover:to-luxury-gold transition-all hover:shadow-luxury-gold/30">
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
                        <p className="text-[9px] font-bold text-luxury-gold uppercase tracking-widest mb-2">Room Type</p>
                        {ROOM_CATEGORIES.map(t => (
                            <button key={t} onMouseDown={() => { setSelectedRoomType(t); close(); }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${selectedRoomType === t ? 'bg-luxury-blue/20 text-luxury-blue' : 'text-luxury-muted hover:text-white hover:bg-white/5'}`}>
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
                        <p className="text-[9px] font-bold text-luxury-gold uppercase tracking-widest mb-2">Min Rating</p>
                        {[{ v: 0, label: 'Any Rating' }, { v: 3, label: '3★ & above' }, { v: 4, label: '4★ & above' }, { v: 5, label: '5★ Only' }].map(({ v, label }) => (
                            <button key={v} onMouseDown={() => { setMinRating(v); close(); }}
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${minRating === v ? 'bg-luxury-gold/20 text-luxury-gold' : 'text-luxury-muted hover:text-white hover:bg-white/5'}`}>
                                <Star className="w-3 h-3 fill-current" />{label}
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
                            className="flex items-center gap-1 px-3 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full text-xs font-bold hover:bg-red-500/20 transition-all whitespace-nowrap shrink-0">
                            <X className="w-3 h-3" /> Clear ({activeCount})
                        </button>
                    )}
                </div>
            </div>

            {/* ── Body: sidebar + content ─────────────────────── */}
            <div className="flex flex-1 min-h-0">

                {/* LEFT SIDEBAR */}
                <aside className="w-56 shrink-0 bg-[#111827] border-r border-luxury-border/15 overflow-y-auto sticky top-[108px] hidden md:block" style={{ maxHeight: 'calc(100vh - 108px)' }}>
                    <div className="p-4">

                        {/* LOCATIONS */}
                        <SideSection title="Location" icon={MapPin}>
                            <div className="space-y-0.5">
                                {allLocations.map(loc => {
                                    const cnt = rooms.filter(r => r.location?.city === loc.city).length;
                                    const isActive = selectedLocation === loc.city;
                                    return (
                                        <button key={loc._id} onClick={() => { setSelectedLocation(loc.city); setSelectedFloor('All Floors'); }}
                                            className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-medium transition-all
                                                ${isActive ? 'bg-luxury-gold/15 text-luxury-gold border border-luxury-gold/30' : 'text-luxury-muted hover:text-white hover:bg-white/5 border border-transparent'}`}>
                                            <span className="flex items-center gap-2">
                                                <Globe className="w-3 h-3" />{loc.city}
                                            </span>
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-luxury-gold/20 text-luxury-gold' : 'bg-white/10'}`}>{cnt}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </SideSection>

                        {/* FLOORS */}
                        <SideSection title="Floor / Section" icon={Layers}>
                            <div className="space-y-0.5">
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
                                            className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-medium transition-all border
                                                ${isActive
                                                    ? isLS ? 'bg-amber-600/20 text-amber-400 border-amber-600/40'
                                                        : isLW ? 'bg-luxury-gold/20 text-luxury-gold border-luxury-gold/40'
                                                            : 'bg-luxury-blue/15 text-luxury-blue border-luxury-blue/30'
                                                    : 'text-luxury-muted hover:text-white hover:bg-white/5 border-transparent'}`}>
                                            <span>{fl}</span>
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold
                                                ${isLS && isActive ? 'bg-amber-600/30 text-amber-400'
                                                    : isLW && isActive ? 'bg-luxury-gold/30 text-luxury-gold'
                                                        : isActive ? 'bg-luxury-blue/30 text-luxury-blue'
                                                            : 'bg-white/10'}`}>{cnt}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </SideSection>

                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="flex-1 min-w-0 px-5 py-5">

                    {/* Heading */}
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <div>
                            <div className="flex items-center gap-1.5 text-xs text-luxury-muted mb-1 flex-wrap">
                                <Globe className="w-3 h-3" /><span>{selectedLocation}</span>
                                {selectedFloor !== 'All Floors' && <><ChevronRight className="w-3 h-3" /><span>{selectedFloor}</span></>}
                                {selectedRoomType !== 'All Rooms' && <><ChevronRight className="w-3 h-3" /><span>{selectedRoomType}</span></>}
                            </div>
                            <h1 className="text-lg font-bold flex items-center gap-2 flex-wrap">
                                <span className="text-luxury-gold font-serif italic">{selectedLocation}</span>
                                <span className="text-white">Hub</span>
                                {selectedFloor === 'Location Special' && (
                                    <span className="text-[10px] bg-amber-600/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-600/30">Heritage Collection</span>
                                )}
                                {selectedFloor === 'Luxury Wing' && (
                                    <span className="text-[10px] bg-luxury-gold/20 text-luxury-gold px-2 py-0.5 rounded-full border border-luxury-gold/30">VIP Wing</span>
                                )}
                            </h1>
                            <p className="text-luxury-muted text-xs mt-0.5">
                                {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''}
                                {' · '}<span className="text-emerald-400">{availableCount} available</span>
                                {activeCount > 0 && <span className="ml-2 text-luxury-blue">{activeCount} filter{activeCount !== 1 ? 's' : ''} active</span>}
                            </p>
                        </div>

                        {activeOffer && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-luxury-gold/10 border border-luxury-gold/30 rounded-xl">
                                <Star className="w-3.5 h-3.5 text-luxury-gold" />
                                <span className="text-xs text-white font-bold">Offer: {activeOffer.code}</span>
                                <button onClick={() => setActiveOffer(null)}><X className="w-3 h-3 text-luxury-muted" /></button>
                            </div>
                        )}
                    </div>

                    {/* Room Grid */}
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="w-12 h-12 text-luxury-blue animate-spin" />
                        </div>
                    ) : filteredRooms.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <div className="w-16 h-16 rounded-full bg-luxury-card border border-luxury-border/20 flex items-center justify-center mb-4">
                                <Hotel className="w-8 h-8 text-luxury-muted/30" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">No Rooms Match</h3>
                            <p className="text-luxury-muted text-sm max-w-xs mb-4">Try adjusting your filters.</p>
                            <button onClick={resetAll}
                                className="px-6 py-2.5 bg-luxury-blue text-white rounded-xl text-sm font-bold hover:bg-luxury-gold transition-colors">
                                Clear All Filters
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
                                    <div key={room._id}
                                        onClick={() => isAvailable && navigate(activeOffer ? `/rooms/${room._id}?offerCode=${activeOffer.code}` : `/rooms/${room._id}`)}
                                        className={`bg-luxury-card rounded-2xl border overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group cursor-pointer
                                            ${isLS ? 'border-amber-600/25 hover:border-amber-500/50'
                                                : isLW ? 'border-luxury-gold/25 hover:border-luxury-gold/50'
                                                    : 'border-luxury-border/15 hover:border-luxury-blue/30'}`}>

                                        {/* Image */}
                                        <div className="relative aspect-[4/3] overflow-hidden">
                                            <img
                                                src={room.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80'}
                                                alt={room.type}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                            {/* badges top-left */}
                                            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                                                <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded shadow ${isAvailable ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
                                                    {isAvailable ? 'Available' : 'Occupied'}
                                                </span>
                                                {isLS && <span className="px-2 py-0.5 text-[8px] font-bold uppercase rounded shadow bg-amber-600 text-white">Heritage</span>}
                                                {isLW && <span className="px-2 py-0.5 text-[8px] font-bold uppercase rounded shadow bg-luxury-gold text-luxury-dark">Luxury</span>}
                                            </div>
                                            {/* price */}
                                            <div className="absolute bottom-2.5 right-2.5 bg-luxury-dark/90 backdrop-blur text-white px-2.5 py-1.5 rounded-xl font-bold text-sm border border-luxury-gold/20">
                                                ₹{room.price?.toLocaleString('en-IN')}
                                                <span className="text-[9px] font-normal text-luxury-muted ml-1">/night</span>
                                            </div>
                                            {/* floor badge */}
                                            <div className="absolute bottom-2.5 left-2.5 bg-luxury-dark/70 backdrop-blur px-2 py-0.5 rounded-lg text-[9px] flex items-center gap-1 text-luxury-muted">
                                                <Layers className="w-2.5 h-2.5" />{room.floor}
                                            </div>
                                        </div>

                                        {/* Body */}
                                        <div className="p-3.5 flex-1 flex flex-col">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <div className="min-w-0">
                                                    <h3 className={`text-sm font-bold leading-snug line-clamp-1 ${isLS ? 'text-amber-300' : isLW ? 'text-luxury-gold' : 'text-white group-hover:text-luxury-gold transition-colors'}`}>
                                                        {room.type}
                                                    </h3>
                                                    <div className="flex items-center gap-1">
                                                        <Hash className="w-2.5 h-2.5 text-luxury-muted" />
                                                        <span className="text-[10px] font-mono text-luxury-muted">{room.roomNumber}</span>
                                                    </div>
                                                </div>
                                                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg shrink-0 ${ratingInfo ? 'bg-luxury-gold/10 text-luxury-gold' : 'bg-luxury-card border border-luxury-border/20 text-luxury-muted/50'}`}>
                                                    <Star className="w-3 h-3 fill-current" />
                                                    <span className="font-bold text-xs">{ratingInfo ? ratingInfo.avg.toFixed(1) : '–'}</span>
                                                    {ratingInfo && <span className="text-[9px] opacity-60">({ratingInfo.count})</span>}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 text-[10px] text-luxury-muted mb-2">
                                                <span className="flex items-center gap-1"><Users className="w-2.5 h-2.5" />{getRoomCategory(room)}</span>
                                                {room.viewType && <span className="flex items-center gap-1"><Eye className="w-2.5 h-2.5" />{room.viewType}</span>}
                                            </div>

                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {room.amenities?.slice(0, 3).map((a, i) => {
                                                    const Icon = AMENITY_ICONS[a] || Star;
                                                    return (
                                                        <span key={i} className="px-1.5 py-0.5 bg-luxury-blue/5 border border-luxury-blue/15 text-luxury-blue text-[9px] rounded-full flex items-center gap-1">
                                                            <Icon className="w-2 h-2" />{a}
                                                        </span>
                                                    );
                                                })}
                                                {room.amenities?.length > 3 && <span className="text-luxury-muted text-[9px]">+{room.amenities.length - 3}</span>}
                                            </div>

                                            <div className="mt-auto pt-2 border-t border-luxury-border/10">
                                                <button
                                                    onClick={e => { e.stopPropagation(); if (!isAvailable) return; navigate(activeOffer ? `/rooms/${room._id}?offerCode=${activeOffer.code}` : `/rooms/${room._id}`); }}
                                                    className={`w-full py-2 rounded-xl font-bold text-xs transition-all ${isAvailable
                                                        ? isLS ? 'bg-amber-600 hover:bg-amber-500 text-white shadow hover:shadow-amber-500/30'
                                                            : isLW ? 'bg-luxury-gold hover:bg-yellow-300 text-luxury-dark shadow hover:shadow-luxury-gold/30'
                                                                : 'bg-luxury-blue hover:bg-luxury-gold text-white shadow hover:shadow-luxury-blue/30'
                                                        : 'bg-luxury-card border border-luxury-border/20 text-luxury-muted cursor-not-allowed'}`}>
                                                    {isAvailable ? 'Book this Room →' : 'Currently Occupied'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
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
