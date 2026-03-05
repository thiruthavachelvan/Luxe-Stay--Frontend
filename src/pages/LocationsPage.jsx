import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { MapPin, ArrowRight, Star, Loader2, Search, Globe, Instagram, Twitter, Facebook } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getLocationImage } from '../utils/locationImages';

const LocationsPage = () => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await fetch(`${__API_BASE__}/api/public/locations`);
                if (res.ok) {
                    const data = await res.json();
                    setLocations(data);
                }
            } catch (err) {
                console.error('Error fetching locations:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLocations();
        window.scrollTo(0, 0);
    }, []);

    const indiaLocations = locations.filter(loc => loc.category === 'India' && loc.status === 'Active');
    const internationalLocations = locations.filter(loc => loc.category === 'International' && loc.status === 'Active');
    const comingSoonLocations = locations.filter(loc => loc.status === 'Coming Soon');

    if (loading) {
        return (
            <div className="min-h-screen bg-navy-950 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-gold-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-navy-950 text-slate-200 selection:bg-gold-400 selection:text-navy-950">
            <Navbar />

            <main className="pt-40 pb-24">
                <div className="container mx-auto px-6">
                    {/* Hero Section */}
                    <div className="text-center mb-24">
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-gold-400 uppercase tracking-[0.3em] text-xs font-semibold mb-6 block"
                        >
                            Global Presence
                        </motion.span>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-serif text-white mb-8"
                        >
                            Explore Our <span className="italic text-gold-400">Destinations</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed font-light"
                        >
                            From pristine coastal retreats to vibrant metropolitan icons, discover
                            unparalleled hospitality in the world's most coveted locations.
                        </motion.p>
                    </div>

                    {/* India Locations */}
                    <section className="mb-32">
                        <div className="flex items-end justify-between mb-12 border-b border-white/5 pb-6">
                            <div>
                                <h2 className="text-3xl font-serif text-white">Dominion of <span className="italic text-gold-400">India</span></h2>
                                <p className="text-white/40 text-sm mt-2 font-light">The pinnacle of cultural luxury and heritage.</p>
                            </div>
                            <Link to="/rooms" className="text-gold-400 hover:text-white transition-colors flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] group">
                                View Collection <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                            {indiaLocations.map((location, index) => (
                                <motion.div
                                    key={location._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group cursor-pointer"
                                    onClick={() => window.location.href = `/rooms?location=${encodeURIComponent(location.city)}`}
                                >
                                    <div className="relative aspect-[4/5] overflow-hidden rounded-sm mb-6">
                                        <img
                                            src={getLocationImage(location.city)}
                                            alt={location.city}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[1.5s]"
                                        />
                                        <div className="absolute inset-0 bg-navy-950/20 group-hover:bg-navy-950/40 transition-colors duration-500" />

                                        <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                            <div className="flex items-center gap-2 mb-2">
                                                <MapPin className="w-4 h-4 text-gold-400" />
                                                <span className="text-white/80 text-[10px] uppercase tracking-widest font-bold">LuxeStay Representative</span>
                                            </div>
                                            <h3 className="text-3xl font-serif text-white group-hover:text-gold-400 transition-colors">{location.city}</h3>
                                        </div>
                                    </div>
                                    <div className="glass-panel p-6 rounded-sm">
                                        <p className="text-white/60 text-xs font-light leading-relaxed mb-6 line-clamp-2 italic">
                                            {location.description}
                                        </p>
                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <div>
                                                <span className="text-[9px] text-white/40 uppercase tracking-widest block mb-1">Experience from</span>
                                                <span className="text-gold-400 font-bold text-lg">₹{location.price ? String(location.price).replace(/[^0-9.]/g, '') : '—'}</span>
                                            </div>
                                            <button className="px-6 py-2 border border-gold-400/30 text-gold-400 hover:bg-gold-400 hover:text-navy-950 text-[10px] font-bold uppercase tracking-widest transition-all">
                                                Explore
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* International Locations */}
                    <section className="mb-32">
                        <div className="flex items-end justify-between mb-12 border-b border-white/5 pb-6">
                            <div>
                                <h2 className="text-3xl font-serif text-white">Global <span className="italic text-gold-400">Icons</span></h2>
                                <p className="text-white/40 text-sm mt-2 font-light">Legendary hospitality across continents.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {internationalLocations.map((location, index) => (
                                <motion.div
                                    key={location._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    className="group relative h-[500px] overflow-hidden rounded-sm shadow-2xl cursor-pointer"
                                    onClick={() => window.location.href = `/rooms?location=${encodeURIComponent(location.city)}`}
                                >
                                    <img
                                        src={getLocationImage(location.city)}
                                        alt={location.city}
                                        className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[2s]"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/20 to-transparent" />
                                    <div className="absolute bottom-0 left-0 p-12 w-full">
                                        <span className="text-gold-400 text-[10px] uppercase tracking-[0.3em] font-bold mb-4 block">World Class</span>
                                        <h3 className="text-5xl font-serif text-white mb-4">{location.city}</h3>
                                        <p className="text-white/60 font-light italic mb-8 max-w-sm line-clamp-2">{location.description}</p>
                                        <div className="pt-8 border-t border-white/20 flex items-center justify-between">
                                            <div>
                                                <span className="text-[10px] text-white/40 uppercase tracking-widest block mb-1">Starting rate</span>
                                                <span className="text-3xl font-bold text-white">${location.price ? String(location.price).replace(/[^0-9.]/g, '') : '—'}</span>
                                            </div>
                                            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-gold-400 group-hover:border-gold-400 transition-all duration-500">
                                                <ArrowRight className="w-5 h-5 text-white group-hover:text-navy-950 transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* Launching Soon */}
                    <section className="py-24 border-t border-white/5">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-serif text-white mb-4 italic text-gold-400/60 font-serif">Future Horizons</h2>
                            <p className="text-white/40 text-sm font-light">Eagerly anticipated sanctuaries currently in development.</p>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                            {coming_soon_placeholders.map((location, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group text-center"
                                >
                                    <div className="relative aspect-square rounded-full overflow-hidden mb-6 border border-white/5 p-2 transition-all duration-700 hover:border-gold-400/30">
                                        <div className="w-full h-full rounded-full overflow-hidden blur-[2px] group-hover:blur-0 transition-all duration-700">
                                            <img
                                                src={location.image}
                                                alt={location.city}
                                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 grayscale group-hover:grayscale-0"
                                            />
                                        </div>
                                        <div className="absolute inset-0 bg-navy-950/40 flex items-center justify-center pointer-events-none">
                                            <span className="px-4 py-2 glass-panel border-white/10 text-white text-[9px] font-bold uppercase tracking-widest rounded-sm">
                                                Pending 2026
                                            </span>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-serif text-white/50 group-hover:text-gold-400 transition-colors">{location.city}</h3>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

const coming_soon_placeholders = [
    { city: 'Amalfi Coast', image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80' },
    { city: 'Kyoto', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80' },
    { city: 'Santorini', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&q=80' },
    { city: 'Swiss Alps', image: 'https://images.unsplash.com/photo-1491555103944-7c647fd857e6?auto=format&fit=crop&q=80' },
];

export default LocationsPage;





