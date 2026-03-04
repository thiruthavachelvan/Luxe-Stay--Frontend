import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, ArrowRight } from 'lucide-react';

// Reusable gold label with flanking lines — matches Hero section
const GoldLabel = ({ children }) => (
    <div className="flex items-center justify-center gap-3 mb-4">
        <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#D4AF37]/60" />
        <span className="text-[#D4AF37] uppercase tracking-[0.3em] text-xs font-bold">{children}</span>
        <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#D4AF37]/60" />
    </div>
);

const DiscoverRooms = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res = await fetch(`${__API_BASE__}/api/public/rooms`);
                if (res.ok) {
                    const data = await res.json();
                    setRooms(data.slice(0, 4));
                }
            } catch (err) {
                console.error('Error fetching rooms:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchRooms();
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
            {/* Ambient blobs matching hero */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-luxury-gold/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">

                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
                    <div>
                        <GoldLabel>Discover The Rooms</GoldLabel>
                        <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                            Exceptional Stays for{' '}
                            <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-yellow-200 to-[#D4AF37]">
                                Every Journey
                            </span>
                        </h2>
                        <p className="text-white/40 text-sm mt-3 font-light max-w-lg">
                            Handpicked suites and villas, each designed to deliver an
                            unmatched experience of luxury and comfort.
                        </p>
                    </div>

                    <Link
                        to="/rooms"
                        className="flex-shrink-0 flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-[#D4AF37] to-yellow-500 text-[#0F1626] rounded-full font-bold text-[11px] uppercase tracking-[0.2em] hover:shadow-[0_8px_25px_rgba(212,175,55,0.4)] hover:scale-[1.02] transition-all shadow-lg"
                    >
                        Explore All Rooms
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {/* Room Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {rooms.map((room) => (
                        <Link key={room._id} to={`/rooms/${room._id}`} className="group relative overflow-hidden rounded-2xl cursor-pointer shadow-2xl border border-white/5 hover:border-[#D4AF37]/20 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(212,175,55,0.1)]">
                            {/* Image */}
                            <div className="aspect-[3/4] overflow-hidden bg-[#172036]">
                                <img
                                    src={room.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80'}
                                    alt={room.type}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out"
                                />
                            </div>

                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0F1626] via-[#0F1626]/50 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />

                            {/* Content */}
                            <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col justify-end">
                                <div className="mb-3">
                                    <p className="text-[9px] text-[#D4AF37] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                        <span className="w-4 h-px bg-[#D4AF37]/50 inline-block" />
                                        {room.location?.city || 'Luxury Resort'}
                                    </p>
                                    <h3 className="text-lg font-bold text-white group-hover:text-[#D4AF37] transition-colors leading-tight">
                                        {room.type}
                                    </h3>
                                </div>

                                <div className="flex items-center justify-between mb-4 border-t border-white/10 pt-3">
                                    <span className="text-[#D4AF37] font-bold text-sm">
                                        ₹{room.price?.toLocaleString('en-IN')}
                                        <span className="text-[10px] text-white/40 font-normal ml-1">/night</span>
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-[10px] text-white font-bold hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-[#0F1626] transition-all uppercase tracking-widest justify-center">
                                    View Suite
                                    <ArrowRight className="w-3 h-3" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default DiscoverRooms;





