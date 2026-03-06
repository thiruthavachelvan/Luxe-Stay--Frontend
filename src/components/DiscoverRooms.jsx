import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Star, MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "./ui/Button";

export default function DiscoverRooms() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res = await fetch(`${__API_BASE__}/api/public/rooms`);
                if (res.ok) {
                    const data = await res.json();
                    // Sort by luxuryLevel descending and take top 6 for "Featured"
                    const featured = data
                        .sort((a, b) => (b.luxuryLevel || 0) - (a.luxuryLevel || 0))
                        .slice(0, 6);
                    setRooms(featured);
                }
            } catch (error) {
                console.error("Failed to fetch rooms:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRooms();
    }, []);

    if (loading && rooms.length === 0) return null;

    return (
        <section className="py-32 relative bg-navy-950" id="rooms">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center md:items-end justify-between mb-16 gap-6 text-center md:text-left">
                    <div>
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-gold-400 uppercase tracking-[0.4em] text-[10px] font-black mb-4 block italic"
                        >
                            Accommodations
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-6xl font-serif text-white leading-tight"
                        >
                            Featured <span className="italic text-gold-400">Suites</span>
                        </motion.h2>
                    </div>
                    <Link to="/rooms">
                        <Button variant="outline" className="flex">
                            View All Rooms
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {rooms.map((room, index) => (
                        <motion.div
                            key={room._id}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="group relative h-[450px] md:h-[600px] w-full overflow-hidden rounded-sm cursor-pointer"
                        >
                            <Link to={`/rooms/${room._id}`}>
                                <div className="absolute inset-0 bg-navy-950">
                                    <img
                                        src={room.images?.[0] || "https://images.unsplash.com/photo-1590490360182-f33efe80a713?q=80&w=2670&auto=format&fit=crop"}
                                        alt={room.roomNumber}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                                    />
                                </div>

                                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/20 to-transparent opacity-90" />

                                <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 md:translate-y-0 group-hover:translate-y-0 transition-transform duration-500">
                                    <div className="flex items-center gap-2 mb-3">
                                        <MapPin className="w-3 h-3 text-gold-400" />
                                        <span className="text-white/70 text-xs uppercase tracking-widest">
                                            {room.location?.city || 'Luxury Stay'}
                                        </span>
                                    </div>

                                    <h3 className="text-2xl md:text-3xl font-serif text-white mb-2">{room.type} - {room.roomNumber}</h3>
                                    <p className="text-white/50 text-xs md:text-sm mb-6">{room.viewType || room.bedType || 'Premium Suite'}</p>

                                    <div className="flex items-center justify-between border-t border-white/10 pt-6">
                                        <div>
                                            <p className="text-gold-400 text-xl font-serif">₹{room.price?.toLocaleString()} <span className="text-xs text-white/50 font-sans uppercase tracking-wider">/ Night</span></p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <Star className="w-3 h-3 text-gold-400 fill-gold-400" />
                                                <span className="text-white/70 text-xs">{(4.5 + Math.random() * 0.5).toFixed(1)} (Featured)</span>
                                            </div>
                                        </div>

                                        <button className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white group-hover:bg-gold-400 group-hover:border-gold-400 group-hover:text-navy-950 transition-all duration-300">
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
