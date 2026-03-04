import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
            <div className="min-h-screen bg-luxury-dark flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-luxury-gold animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-luxury-dark font-sans selection:bg-luxury-gold selection:text-white">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="container mx-auto px-6">
                    {/* Hero Section */}
                    <div className="mb-20">
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                            Explore Global Destinations
                        </h1>
                        <p className="text-luxury-muted text-lg max-w-2xl leading-relaxed italic">
                            Experience unparalleled luxury across the globe. From serene beach resorts to bustling metropolitan icons, discover stays that redefine excellence.
                        </p>
                    </div>

                    {/* India Locations */}
                    <section className="mb-24">
                        <div className="flex items-end justify-between mb-10 border-b border-white/5 pb-4">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 italic">India Locations</h2>
                                <p className="text-luxury-muted text-sm">Our most coveted stays in the subcontinent.</p>
                            </div>
                            <Link to="/explore/india" className="text-luxury-blue hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest group">
                                View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {indiaLocations.map((location) => (
                                <div key={location._id} className="group cursor-pointer">
                                    <div className="relative aspect-[3/2] rounded-xl overflow-hidden mb-4 shadow-lg">
                                        <img
                                            src={getLocationImage(location.city)}
                                            alt={location.city}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-bold text-white group-hover:text-luxury-blue transition-colors">{location.city}</h3>
                                            <p className="text-luxury-muted text-[10px] mt-1 line-clamp-1">{location.description}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                                        <div>
                                            <span className="text-[9px] text-luxury-muted uppercase tracking-widest block mb-0.5">Starting at</span>
                                            <span className="text-luxury-blue font-bold text-sm">₹{location.price ? String(location.price).replace(/[^0-9.]/g, '') : '—'}<span className="text-[10px] font-normal text-luxury-muted">/night</span></span>
                                        </div>
                                        <button className="px-4 py-1.5 bg-luxury-blue/10 hover:bg-luxury-blue text-luxury-blue hover:text-white text-[9px] font-bold uppercase rounded transition-all">
                                            Explore
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Featured Collection: Stadium View — Coming Soon */}
                    <section className="mb-24">
                        <div className="relative bg-gradient-to-r from-black/80 to-transparent rounded-3xl overflow-hidden border border-white/10 flex flex-col md:flex-row items-center gap-0">
                            {/* Coming-soon overlay content */}
                            <div className="flex-1 z-10 p-8 md:p-12">
                                <span className="px-3 py-1 bg-luxury-gold text-luxury-dark text-[10px] font-bold uppercase tracking-widest rounded-full mb-6 inline-flex items-center gap-1.5">
                                    🏟 Coming Soon
                                </span>
                                <h2 className="text-3xl md:text-5xl font-bold text-white/70 mb-6 leading-tight">Stadium View Collection</h2>
                                <p className="text-luxury-muted text-lg mb-8 max-w-xl italic">
                                    Exclusive suites overlooking the world's most iconic sports arenas — Mumbai, Melbourne & London. Opening late 2025.
                                </p>
                                <div className="flex gap-4">
                                    <button disabled className="px-8 py-3 bg-white/10 border border-white/10 text-white/40 rounded font-bold text-sm cursor-not-allowed">
                                        Notify Me
                                    </button>
                                </div>
                            </div>
                            {/* Stadium photo */}
                            <div className="flex-1 relative h-72 md:h-96 w-full">
                                <img
                                    src="https://images.unsplash.com/photo-1540747737770-4aef9a0f4831?auto=format&fit=crop&q=80"
                                    alt="Stadium view"
                                    className="w-full h-full object-cover grayscale opacity-60"
                                />
                                {/* Big badge */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="px-8 py-4 bg-black/60 backdrop-blur-md border border-luxury-gold/50 rounded-2xl text-center">
                                        <p className="text-luxury-gold font-bold text-2xl tracking-widest uppercase">Coming Soon</p>
                                        <p className="text-white/50 text-xs mt-1">Late 2025</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* International Locations */}
                    <section className="mb-24">
                        <div className="flex items-end justify-between mb-10 border-b border-white/5 pb-4">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 italic">International Locations</h2>
                                <p className="text-luxury-muted text-sm">World-class hospitality in every corner of the globe.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {internationalLocations.map((location) => (
                                <div key={location._id} className="group relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden cursor-pointer shadow-2xl">
                                    <img
                                        src={getLocationImage(location.city)}
                                        alt={location.city}
                                        className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                                    <div className="absolute bottom-0 left-0 p-8">
                                        <h3 className="text-3xl font-bold text-white mb-2">{location.city}</h3>
                                        <p className="text-luxury-muted italic mb-4 max-w-sm line-clamp-1">{location.description}</p>
                                        <div className="pt-4 border-t border-white/20">
                                            <span className="text-[10px] text-white/60 uppercase tracking-widest block mb-1">Starting at</span>
                                            <span className="text-2xl font-bold text-white">${location.price ? String(location.price).replace(/[^0-9.]/g, '') : '—'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Launching Soon */}
                    <section>
                        <div className="mb-10 border-b border-white/5 pb-4">
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 italic">Launching Soon</h2>
                            <p className="text-luxury-muted text-sm">New horizons currently in development.</p>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {comingSoonLocations.map((location) => (
                                <div key={location._id} className="group">
                                    <div className="relative aspect-square rounded-xl overflow-hidden mb-4 grayscale group-hover:grayscale-0 transition-all duration-700">
                                        <img
                                            src={getLocationImage(location.city)}
                                            alt={location.city}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
                                        />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[9px] font-bold uppercase tracking-widest rounded">
                                                Coming Soon
                                            </span>
                                        </div>
                                    </div>
                                    <h3 className="text-center text-lg font-bold text-white/60">{location.city}</h3>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default LocationsPage;





