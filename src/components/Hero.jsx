import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { Search, MapPin, Calendar, Users, ChevronDown } from "lucide-react";
import Button from "./ui/Button";

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

export default function Hero() {
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
    const [openDropdown, setOpenDropdown] = useState(null);
    const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });

    const locRef = useRef(null);
    const guestRef = useRef(null);
    const typeRef = useRef(null);
    const refs = { location: locRef, guests: guestRef, roomtype: typeRef };

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await fetch(`${__API_BASE__}/api/public/locations`);
                if (res.ok) {
                    const data = await res.json();
                    const cities = data.filter(l => l.status === 'Active').map(l => l.city).filter(Boolean);
                    setLocations(cities);
                    if (cities.length > 0) setSelectedLocation(cities[0]);
                }
            } catch {
                const fallback = ['Mumbai', 'Delhi', 'Goa', 'Dubai', 'Maldives'];
                setLocations(fallback);
                setSelectedLocation(fallback[0]);
            }
        };
        fetchLocations();
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if (!Object.values(refs).some(r => r.current?.contains(e.target))) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const openDrop = (id) => {
        const el = refs[id]?.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        setDropPos({ top: r.bottom + 10, left: r.left, width: Math.max(r.width, 180) });
        setOpenDropdown(prev => prev === id ? null : id);
    };

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (selectedLocation) params.set('location', selectedLocation);
        if (checkIn) params.set('checkIn', checkIn);
        if (checkOut) params.set('checkOut', checkOut);
        params.set('adults', selectedGuests.adults);
        if (selectedGuests.children) params.set('children', selectedGuests.children);
        if (selectedRoomType !== 'Any Type') params.set('roomType', selectedRoomType);
        navigate(`/rooms?${params.toString()}`);
    };

    const DropdownPortal = ({ id, items, onSelect, renderItem }) =>
        openDropdown !== id ? null : createPortal(
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ position: 'fixed', top: dropPos.top, left: dropPos.left, minWidth: dropPos.width, zIndex: 99999 }}
                className="bg-navy-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl overflow-hidden py-2"
            >
                {items.map((item, i) => (
                    <button key={i} onMouseDown={() => { onSelect(item); setOpenDropdown(null); }}
                        className="w-full px-4 py-2.5 text-left text-sm text-white/70 hover:bg-gold-400 hover:text-navy-950 transition-colors uppercase tracking-widest font-medium">
                        {renderItem ? renderItem(item) : item}
                    </button>
                ))}
            </motion.div>,
            document.body
        );

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=3270&auto=format&fit=crop"
                    alt="Luxury Hotel"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-navy-950/60 via-navy-950/20 to-navy-950" />
            </div>

            <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-center pt-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium leading-tight mb-6 text-white tracking-tight">
                        Experience Luxury <br />
                        <span className="italic text-gold-400">Redefined</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-light tracking-wide">
                        Curated sanctuaries where timeless elegance meets modern luxury in the world's most iconic destinations.
                    </p>
                </motion.div>

                {/* Floating Booking Card */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="max-w-6xl mx-auto w-full glass-panel rounded-xl p-6 md:p-8"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">

                        {/* Destination */}
                        <div ref={locRef} className="space-y-2 border-b border-white/10 pb-4 md:border-b-0 md:pb-0 md:border-r md:pr-4">
                            <label className="text-xs uppercase tracking-widest text-white/50 font-medium flex items-center gap-2">
                                <MapPin className="w-3 h-3 text-gold-400" /> Destination
                            </label>
                            <div
                                onClick={() => openDrop('location')}
                                className="flex items-center justify-between cursor-pointer group"
                            >
                                <span className="text-white font-serif text-lg group-hover:text-gold-400 transition-colors uppercase tracking-widest">
                                    {selectedLocation || 'Select City'}
                                </span>
                                <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${openDropdown === 'location' ? 'rotate-180' : ''}`} />
                            </div>
                            <DropdownPortal id="location" items={locations} onSelect={setSelectedLocation} />
                        </div>

                        {/* Check In */}
                        <div className="space-y-2 border-b border-white/10 pb-4 md:border-b-0 md:pb-0 md:border-r md:pr-4">
                            <label className="text-xs uppercase tracking-widest text-white/50 font-medium flex items-center gap-2">
                                <Calendar className="w-3 h-3 text-gold-400" /> Check In
                            </label>
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
                                className="bg-transparent text-white font-serif text-lg focus:outline-none cursor-pointer border-none [color-scheme:dark] block w-full"
                            />
                        </div>

                        {/* Check Out */}
                        <div className="space-y-2 border-b border-white/10 pb-4 md:border-b-0 md:pb-0 md:border-r md:pr-4">
                            <label className="text-xs uppercase tracking-widest text-white/50 font-medium flex items-center gap-2">
                                <Calendar className="w-3 h-3 text-gold-400" /> Check Out
                            </label>
                            <input
                                type="date"
                                value={checkOut}
                                min={checkIn}
                                onChange={e => setCheckOut(e.target.value)}
                                className="bg-transparent text-white font-serif text-lg focus:outline-none cursor-pointer border-none [color-scheme:dark] block w-full"
                            />
                        </div>

                        {/* Guests */}
                        <div ref={guestRef} className="space-y-2 border-b border-white/10 pb-4 md:border-b-0 md:pb-0 md:border-r md:pr-4">
                            <label className="text-xs uppercase tracking-widest text-white/50 font-medium flex items-center gap-2">
                                <Users className="w-3 h-3 text-gold-400" /> Guests
                            </label>
                            <div
                                onClick={() => openDrop('guests')}
                                className="flex items-center justify-between cursor-pointer group"
                            >
                                <span className="text-white font-serif text-lg group-hover:text-gold-400 transition-colors uppercase tracking-widest truncate">
                                    {selectedGuests.label}
                                </span>
                                <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${openDropdown === 'guests' ? 'rotate-180' : ''}`} />
                            </div>
                            <DropdownPortal id="guests" items={GUEST_OPTIONS} renderItem={g => g.label} onSelect={setSelectedGuests} />
                        </div>

                        {/* Room Type */}
                        <div ref={typeRef} className="space-y-2 border-b border-white/10 pb-4 md:border-b-0 md:pb-0 md:border-r md:pr-4">
                            <label className="text-xs uppercase tracking-widest text-white/50 font-medium flex items-center gap-2">
                                <Search className="w-3 h-3 text-gold-400" /> Room
                            </label>
                            <div
                                onClick={() => openDrop('roomtype')}
                                className="flex items-center justify-between cursor-pointer group"
                            >
                                <span className="text-white font-serif text-lg group-hover:text-gold-400 transition-colors uppercase tracking-widest">
                                    {selectedRoomType}
                                </span>
                                <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${openDropdown === 'roomtype' ? 'rotate-180' : ''}`} />
                            </div>
                            <DropdownPortal id="roomtype" items={ROOM_TYPES} onSelect={setSelectedRoomType} />
                        </div>

                        {/* Search Button */}
                        <div className="flex items-end">
                            <Button onClick={handleSearch} variant="primary" className="w-full h-12 !text-[10px] !px-2">
                                Search Rooms
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
