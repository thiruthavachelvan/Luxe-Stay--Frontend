import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, MapPin, BedDouble, Search, ChevronDown, IndianRupee } from 'lucide-react';

const ROOM_TYPES = ['Any Type', 'Single Room', 'Double Room', 'Family Room'];

const PRICE_RANGES = [
    { label: 'Any Price', min: 0, max: 999999 },
    { label: '₹0 – ₹5,000', min: 0, max: 5000 },
    { label: '₹5,000 – ₹15,000', min: 5000, max: 15000 },
    { label: '₹15,000 – ₹30,000', min: 15000, max: 30000 },
    { label: '₹30,000 – ₹60,000', min: 30000, max: 60000 },
    { label: '₹60,000+', min: 60000, max: 999999 },
];

const GUEST_OPTIONS = [
    { label: '1 Adult', adults: 1 },
    { label: '2 Adults', adults: 2 },
    { label: '3 Adults', adults: 3 },
    { label: '4 Adults', adults: 4 },
    { label: '2 Adults, 1 Child', adults: 2, children: 1 },
    { label: '2 Adults, 2 Children', adults: 2, children: 2 },
];

const Hero = () => {
    const navigate = useNavigate();

    const today = new Date().toISOString().split('T')[0];
    const tomorrow = (() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    })();

    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('');
    const [checkIn, setCheckIn] = useState(today);
    const [checkOut, setCheckOut] = useState(tomorrow);
    const [selectedGuests, setSelectedGuests] = useState(GUEST_OPTIONS[1]);
    const [selectedRoomType, setSelectedRoomType] = useState(ROOM_TYPES[0]);
    const [selectedPriceRange, setSelectedPriceRange] = useState(PRICE_RANGES[0]);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });

    // refs for each trigger button
    const locRef = useRef(null);
    const guestRef = useRef(null);
    const typeRef = useRef(null);
    const priceRef = useRef(null);
    const refs = { location: locRef, guests: guestRef, roomtype: typeRef, price: priceRef };

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await fetch(`${__API_BASE__}/api/public/locations`);
                if (res.ok) {
                    const data = await res.json();
                    const activeLocations = data.filter(l => l.status === 'Active');
                    const cities = activeLocations.map(l => l.city).filter(Boolean);
                    setLocations(cities);
                    if (cities.length > 0) setSelectedLocation(cities[0]);
                }
            } catch {
                const fallback = ['Mumbai', 'Delhi', 'Goa', 'Bangalore', 'Chennai', 'Dubai'];
                setLocations(fallback);
                setSelectedLocation(fallback[0]);
            }
        };
        fetchLocations();
    }, []);

    // close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            const isBtn = Object.values(refs).some(r => r.current?.contains(e.target));
            if (!isBtn) setOpenDropdown(null);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const openDrop = (id) => {
        const el = refs[id]?.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        setDropPos({ top: r.bottom + 6, left: r.left, width: Math.max(r.width, 180) });
        setOpenDropdown(prev => prev === id ? null : id);
    };

    // Portal-based dropdown — rendered at document.body, escapes all overflow:hidden parents
    const DropdownPortal = ({ id, items, onSelect, renderItem }) =>
        openDropdown !== id ? null : createPortal(
            <div style={{ position: 'fixed', top: dropPos.top, left: dropPos.left, minWidth: dropPos.width, zIndex: 99999 }}
                className="bg-[#1A2235] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                {items.map((item, i) => (
                    <button key={i} onMouseDown={() => { onSelect(item); setOpenDropdown(null); }}
                        className="w-full px-4 py-2.5 text-left text-sm text-white/80 hover:bg-[#2D5BFF]/30 hover:text-white transition-colors border-b border-white/5 last:border-0">
                        {renderItem ? renderItem(item) : item}
                    </button>
                ))}
            </div>,
            document.body
        );

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (selectedLocation) params.set('location', selectedLocation);
        if (checkIn) params.set('checkIn', checkIn);
        if (checkOut) params.set('checkOut', checkOut);
        params.set('adults', selectedGuests.adults);
        if (selectedGuests.children) params.set('children', selectedGuests.children);
        if (selectedRoomType !== 'Any Type') params.set('roomType', selectedRoomType);
        if (selectedPriceRange.max < 999999) params.set('maxPrice', selectedPriceRange.max);
        if (selectedPriceRange.min > 0) params.set('minPrice', selectedPriceRange.min);
        navigate(`/rooms?${params.toString()}`);
    };

    return (
        <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1542314831-c6a4d14d8c85?auto=format&fit=crop&q=80&w=1920"
                    alt="Luxury Hotel"
                    className="w-full h-full object-cover scale-105"
                    style={{ objectPosition: 'center 40%' }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0F1626]/70 via-[#0F1626]/30 to-[#0F1626]/90" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0F1626]/60 via-transparent to-[#0F1626]/60" />
            </div>

            {/* Ambient blobs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-luxury-gold/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#D4AF37]/8 rounded-full blur-3xl pointer-events-none" />

            {/* Content */}
            <div className="container mx-auto px-6 relative z-10 text-center flex flex-col items-center max-w-6xl">

                {/* Gold label with flanking lines */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#D4AF37]/60" />
                    <span className="text-[#D4AF37] uppercase tracking-[0.35em] text-xs font-bold">
                        Exclusive Experience
                    </span>
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#D4AF37]/60" />
                </div>

                {/* Headline */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4 leading-tight">
                    Redefining the Art of
                </h1>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-yellow-200 to-[#D4AF37] mb-6 leading-tight">
                    Hospitality
                </h1>

                <p className="text-white/60 max-w-2xl mx-auto mb-10 text-sm md:text-base leading-relaxed font-light">
                    Discover curated sanctuaries where timeless elegance meets modern luxury
                    in the world's most iconic destinations.
                </p>

                {/* Search Bar */}
                <div className="w-full max-w-6xl">
                    <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-1 shadow-[0_25px_60px_rgba(0,0,0,0.5)] overflow-visible">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-[#D4AF37]/5 pointer-events-none" />

                        <div className="flex flex-col lg:flex-row items-stretch">

                            {/* Destination */}
                            <SearchField label="Destination" icon={<MapPin className="w-4 h-4 text-[#D4AF37]" />} hasBorder>
                                <div className="relative">
                                    <button ref={locRef} onClick={() => openDrop('location')}
                                        className="flex items-center justify-between w-full text-white text-sm font-medium">
                                        <span>{selectedLocation || 'Select City'}</span>
                                        <ChevronDown className={`w-3.5 h-3.5 text-white/40 ml-2 transition-transform ${openDropdown === 'location' ? 'rotate-180' : ''}`} />
                                    </button>
                                    <DropdownPortal id="location" items={locations}
                                        onSelect={loc => setSelectedLocation(loc)}
                                    />
                                </div>
                            </SearchField>

                            {/* Check In — visible native input */}
                            <SearchField label="Check In" icon={<Calendar className="w-4 h-4 text-[#D4AF37]" />} hasBorder>
                                <input
                                    type="date"
                                    value={checkIn}
                                    min={today}
                                    onChange={e => {
                                        setCheckIn(e.target.value);
                                        if (e.target.value >= checkOut) {
                                            const d = new Date(e.target.value);
                                            d.setDate(d.getDate() + 1);
                                            setCheckOut(d.toISOString().split('T')[0]);
                                        }
                                    }}
                                    className="w-full bg-transparent text-white text-sm font-medium focus:outline-none cursor-pointer [color-scheme:dark] border-none"
                                />
                            </SearchField>

                            {/* Check Out — visible native input */}
                            <SearchField label="Check Out" icon={<Calendar className="w-4 h-4 text-[#D4AF37]" />} hasBorder>
                                <input
                                    type="date"
                                    value={checkOut}
                                    min={checkIn}
                                    onChange={e => setCheckOut(e.target.value)}
                                    className="w-full bg-transparent text-white text-sm font-medium focus:outline-none cursor-pointer [color-scheme:dark] border-none"
                                />
                            </SearchField>

                            {/* Guests */}
                            <SearchField label="Guests" icon={<Users className="w-4 h-4 text-[#D4AF37]" />} hasBorder>
                                <div className="relative">
                                    <button ref={guestRef} onClick={() => openDrop('guests')}
                                        className="flex items-center justify-between w-full text-white text-sm font-medium">
                                        <span>{selectedGuests.label}</span>
                                        <ChevronDown className={`w-3.5 h-3.5 text-white/40 ml-2 transition-transform ${openDropdown === 'guests' ? 'rotate-180' : ''}`} />
                                    </button>
                                    <DropdownPortal id="guests" items={GUEST_OPTIONS}
                                        onSelect={g => setSelectedGuests(g)}
                                        renderItem={g => g.label}
                                    />
                                </div>
                            </SearchField>

                            {/* Room Type */}
                            <SearchField label="Room Type" icon={<BedDouble className="w-4 h-4 text-[#D4AF37]" />} hasBorder>
                                <div className="relative">
                                    <button ref={typeRef} onClick={() => openDrop('roomtype')}
                                        className="flex items-center justify-between w-full text-white text-sm font-medium">
                                        <span>{selectedRoomType}</span>
                                        <ChevronDown className={`w-3.5 h-3.5 text-white/40 ml-2 transition-transform ${openDropdown === 'roomtype' ? 'rotate-180' : ''}`} />
                                    </button>
                                    <DropdownPortal id="roomtype" items={ROOM_TYPES}
                                        onSelect={t => setSelectedRoomType(t)}
                                    />
                                </div>
                            </SearchField>

                            {/* Price Range */}
                            <SearchField label="Price Range" icon={<IndianRupee className="w-4 h-4 text-[#D4AF37]" />} hasBorder>
                                <div className="relative">
                                    <button ref={priceRef} onClick={() => openDrop('price')}
                                        className="flex items-center justify-between w-full text-white text-sm font-medium">
                                        <span>{selectedPriceRange.label}</span>
                                        <ChevronDown className={`w-3.5 h-3.5 text-white/40 ml-2 transition-transform ${openDropdown === 'price' ? 'rotate-180' : ''}`} />
                                    </button>
                                    <DropdownPortal id="price" items={PRICE_RANGES}
                                        onSelect={p => setSelectedPriceRange(p)}
                                        renderItem={p => p.label}
                                    />
                                </div>
                            </SearchField>

                            {/* Search Button */}
                            <div className="p-1.5">
                                <button
                                    onClick={handleSearch}
                                    className="h-full w-full lg:w-auto px-8 py-4 bg-gradient-to-br from-[#2D5BFF] to-blue-700 hover:from-blue-500 hover:to-[#2D5BFF] text-white rounded-xl flex items-center justify-center gap-2.5 font-bold transition-all duration-300 shadow-[0_8px_30px_rgba(45,91,255,0.4)] hover:shadow-[0_8px_40px_rgba(45,91,255,0.6)] hover:scale-[1.02] active:scale-95 whitespace-nowrap text-sm group"
                                >
                                    <Search className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                    Search Rooms
                                </button>
                            </div>

                        </div>
                    </div>

                    {/* Trust indicators */}
                    <div className="relative z-20 flex items-center justify-center gap-8 mt-6 text-white text-xs font-semibold drop-shadow-lg">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
                            Live Availability
                        </div>
                        <span className="w-px h-3 bg-white/40" />
                        <span>No Hidden Fees</span>
                        <span className="w-px h-3 bg-white/40" />
                        <span>Instant Confirmation</span>
                        <span className="w-px h-3 bg-white/40" />
                        <span>Free Cancellation</span>
                    </div>
                </div>
            </div>

            {/* Bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0F1626] to-transparent z-10 pointer-events-none" />
        </section>
    );
};

const SearchField = ({ label, icon, children, hasBorder }) => (
    <div className={`flex-1 relative px-5 py-4 flex flex-col gap-1.5 hover:bg-white/5 transition-colors rounded-xl cursor-pointer ${hasBorder ? 'lg:border-r border-b lg:border-b-0 border-white/10' : ''}`}>
        <div className="flex items-center gap-2">
            {icon}
            <span className="text-[10px] uppercase tracking-[0.15em] text-white/40 font-bold">{label}</span>
        </div>
        <div className="relative">
            {children}
        </div>
    </div>
);

export default Hero;





