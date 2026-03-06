import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { getLocationImage } from "../utils/locationImages";

export default function GlobalPresence() {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await fetch(`${__API_BASE__}/api/public/locations`);
                if (res.ok) {
                    const data = await res.json();
                    // Filter only active locations and take only first 3
                    setLocations(data.filter(l => l.status === 'Active').slice(0, 3));
                }
            } catch (error) {
                console.error("Failed to fetch locations:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLocations();
    }, []);

    if (loading && locations.length === 0) return null;

    return (
        <section className="py-24" id="locations">
            <div className="container mx-auto px-6 mb-12">
                <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 text-center md:text-left">
                    <div>
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-gold-400 uppercase tracking-[0.4em] text-[10px] font-black mb-4 block italic"
                        >
                            Explore
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-6xl font-serif text-white leading-tight"
                        >
                            Iconic <span className="italic text-gold-400">Destinations</span>
                        </motion.h2>
                    </div>
                    <Link to="/locations">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-3 border border-gold-400 text-gold-400 uppercase tracking-widest text-xs font-bold hover:bg-gold-400 hover:text-navy-950 transition-colors"
                        >
                            Explore All Locations
                        </motion.button>
                    </Link>
                </div>
            </div>

            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {locations.map((dest, index) => (
                        <motion.div
                            key={dest._id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="h-[350px] md:h-[500px] relative rounded-sm overflow-hidden group cursor-pointer"
                        >
                            <Link to={`/rooms?location=${encodeURIComponent(dest.city)}`}>
                                <img
                                    src={getLocationImage(dest.city)}
                                    alt={dest.city}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/20 to-transparent opacity-90" />

                                <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col items-center md:items-start text-center md:text-left">
                                    <span className="text-gold-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2 block italic">
                                        {dest.rooms > 0 ? `${dest.rooms} Properties` : 'Experience Luxury'}
                                    </span>
                                    <h3 className="text-4xl md:text-5xl font-serif text-white mb-4 leading-tight">{dest.city}</h3>
                                    <div className="w-12 h-[1px] bg-gold-400/30 group-hover:w-24 transition-all duration-500" />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
