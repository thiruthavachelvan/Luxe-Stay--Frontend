import { useEffect, useState } from 'react';
import { ArrowRight, Star, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getLocationImage } from '../utils/locationImages';

// Reusable gold label with flanking lines — matches Hero section
const GoldLabel = ({ children }) => (
    <div className="flex items-center gap-3 mb-4">
        <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#D4AF37]/60" />
        <span className="text-[#D4AF37] uppercase tracking-[0.3em] text-xs font-bold">{children}</span>
        <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#D4AF37]/60" />
    </div>
);

const GlobalPresence = () => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await fetch(`${__API_BASE__}/api/public/locations`);
                if (res.ok) {
                    const data = await res.json();
                    setLocations(data.filter(loc => loc.status === 'Active').slice(0, 3));
                }
            } catch (err) {
                console.error('Error fetching locations:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLocations();
    }, []);

    if (loading) {
        return (
            <div className="py-24 bg-[#0F1626] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin" />
            </div>
        );
    }

    return (
        <section className="py-24 bg-[#0F1626] relative overflow-hidden">
            {/* Ambient blobs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-luxury-gold/5 rounded-full blur-3xl pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
                    <div>
                        <GoldLabel>Curated Destinations</GoldLabel>
                        <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                            Our Global{' '}
                            <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-yellow-200 to-[#D4AF37]">
                                Presence
                            </span>
                        </h2>
                        <p className="text-white/40 text-sm mt-3 font-light max-w-lg">
                            From the golden shores of Goa to the skylines of Dubai — experience
                            LuxeStays in the world's most coveted destinations.
                        </p>
                    </div>
                    <Link
                        to="/locations"
                        className="flex-shrink-0 flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-[#D4AF37] to-yellow-500 text-[#0F1626] rounded-full font-bold text-[11px] uppercase tracking-[0.2em] hover:shadow-[0_8px_25px_rgba(212,175,55,0.4)] hover:scale-[1.02] transition-all shadow-lg"
                    >
                        Explore Locations
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {/* Location Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {locations.map((location) => (
                        <Link
                            key={location._id}
                            to={`/rooms?location=${location.city}`}
                            className="group relative overflow-hidden rounded-2xl cursor-pointer aspect-[4/5] shadow-2xl border border-white/5 bg-[#172036] hover:border-[#D4AF37]/30 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(212,175,55,0.1)]"
                        >
                            {/* Background Image */}
                            <img
                                src={getLocationImage(location.city)}
                                alt={location.city}
                                className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out opacity-60 group-hover:opacity-80"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0F1626] via-[#0F1626]/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />

                            {/* Gold shimmer on hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Content */}
                            <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end">
                                <span className="text-[#D4AF37] text-[8px] font-bold uppercase tracking-[0.3em] mb-1.5 flex items-center gap-2">
                                    <span className="w-4 h-px bg-[#D4AF37]/60" />
                                    {location.category}
                                </span>
                                <h3 className="text-2xl font-bold text-white mb-4 tracking-wide group-hover:text-[#D4AF37] transition-colors duration-300">
                                    {location.city}
                                </h3>

                                <div className="flex flex-col gap-2 pt-4 border-t border-white/10 text-[9px]">
                                    <div className="flex items-center gap-2 text-white/50 group-hover:text-white/80 transition-colors uppercase font-bold tracking-widest">
                                        <Star className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
                                        <span>{location.rooms}+ Suites Available</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white/50 group-hover:text-white/80 transition-colors uppercase font-bold tracking-widest">
                                        <span className="text-[#D4AF37] font-bold">₹</span>
                                        <span>From {location.price}</span>
                                    </div>
                                </div>

                                {/* Hover CTA */}
                                <div className="flex items-center gap-1.5 mt-4 text-[#D4AF37] text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                    Explore Suites <ArrowRight className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default GlobalPresence;





