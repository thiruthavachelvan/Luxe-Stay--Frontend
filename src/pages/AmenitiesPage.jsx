import { useState } from 'react';
import {
    Wifi, Tv, Wind, Lock, Coffee, Bath, Waves, Sparkles, Dumbbell,
    Utensils, Wine, HeartPulse, Car, BriefcaseBusiness, CalendarDays,
    Zap, ShieldCheck, Trophy, Bike, PersonStanding, Baby, ChevronRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const categories = [
    {
        id: 'room',
        label: 'Room Amenities',
        color: 'text-luxury-gold',
        bg: 'bg-[#D4AF37]/10',
        border: 'border-luxury-gold/30',
        activeBg: 'bg-blue-400',
        items: [
            { icon: Wifi, name: 'High-Speed WiFi', desc: 'Complimentary gigabit fiber internet in every room and common area.' },
            { icon: Wind, name: 'Smart Air Conditioning', desc: 'Individual climate control with eco-smart scheduling technology.' },
            { icon: Tv, name: 'Smart TV with OTT', desc: '65" 4K displays with Netflix, Prime, Disney+ and 200+ channels included.' },
            { icon: Coffee, name: 'In-Room Dining', desc: '24/7 gourmet room service crafted by our Michelin-starred kitchen team.' },
            { icon: Bath, name: 'Luxury Bath Suite', desc: 'Rain showers, soaking tubs, and designer toiletries in every room.' },
            { icon: Lock, name: 'In-Room Safe', desc: 'Biometric digital safe for secure storage of valuables and documents.' },
        ],
    },
    {
        id: 'hotel',
        label: 'Hotel Amenities',
        color: 'text-emerald-400',
        bg: 'bg-emerald-400/10',
        border: 'border-emerald-400/30',
        activeBg: 'bg-emerald-400',
        items: [
            { icon: Waves, name: 'Infinity Pool', desc: 'Heated year-round rooftop infinity pool with panoramic city or ocean views.' },
            { icon: Sparkles, name: 'Luxury Spa', desc: 'Full-service spa offering massages, facials, Ayurvedic treatments and more.' },
            { icon: Dumbbell, name: 'State-of-Art Gym', desc: '24/7 fitness center with Technogym equipment and personal trainers.' },
            { icon: Utensils, name: 'Fine Dining Restaurant', desc: 'Award-winning on-site restaurant with international and local cuisine.' },
            { icon: Wine, name: 'Rooftop Bar & Lounge', desc: 'Curated cocktail menu and premium spirits with spectacular views.' },
            { icon: HeartPulse, name: 'Medical Support', desc: 'On-call doctor and first-aid services available 24/7 for guest safety.' },
        ],
    },
    {
        id: 'business',
        label: 'Business & Events',
        color: 'text-purple-400',
        bg: 'bg-purple-400/10',
        border: 'border-purple-400/30',
        activeBg: 'bg-purple-400',
        items: [
            { icon: BriefcaseBusiness, name: 'Business Lounge', desc: 'Fully equipped business center with high-speed internet and workstations.' },
            { icon: CalendarDays, name: 'Conference Halls', desc: 'Multiple AV-equipped conference suites accommodating 10 to 500 guests.' },
            { icon: Trophy, name: 'Banquet Halls', desc: 'Elegant ballrooms for weddings, galas, and corporate celebrations.' },
            { icon: Zap, name: 'EV Charging Stations', desc: 'Dedicated electric vehicle charging bays available across all our locations.' },
            { icon: Car, name: 'Valet & Rental Transport', desc: 'Complimentary valet parking and premium car rental services on request.' },
            { icon: Wifi, name: 'Dedicated Event WiFi', desc: 'Separate high-bandwidth event network ensures seamless presentations.' },
        ],
    },
    {
        id: 'sports',
        label: 'Sports & Recreation',
        color: 'text-orange-400',
        bg: 'bg-orange-400/10',
        border: 'border-orange-400/30',
        activeBg: 'bg-orange-400',
        items: [
            { icon: Trophy, name: 'Tennis & Squash Courts', desc: 'Professional-grade courts with coaching available for all skill levels.' },
            { icon: Bike, name: 'Cycling & Nature Trails', desc: 'Curated cycling routes and guided nature walks around each property.' },
            { icon: PersonStanding, name: 'Yoga & Pilates Studio', desc: 'Daily sunrise yoga and pilates classes led by certified instructors.' },
            { icon: Baby, name: 'Kids Club', desc: 'Supervised activities, playground, and creative programs for young guests.' },
            { icon: ShieldCheck, name: '24/7 Security', desc: 'Round-the-clock security personnel, CCTV monitoring, and key card access.' },
            { icon: Waves, name: 'Water Sports', desc: 'Kayaking, paddle boarding, and snorkeling at select coastal properties.' },
        ],
    },
];

const AmenitiesPage = () => {
    const [activeTab, setActiveTab] = useState('room');
    const active = categories.find(c => c.id === activeTab);

    return (
        <div className="min-h-screen bg-luxury-dark text-luxury-text">
            <Navbar />

            {/* Hero */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 via-transparent to-luxury-blue/10 pointer-events-none" />
                <div className="container mx-auto px-6 relative">
                    <span className="text-luxury-blue text-xs font-bold tracking-[0.2em] uppercase mb-4 block">
                        World-Class Facilities
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        Every Convenience, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-luxury-blue to-emerald-400">
                            Perfectly Curated
                        </span>
                    </h1>
                    <p className="text-luxury-muted text-lg max-w-2xl leading-relaxed mb-6">
                        From the moment you arrive, every amenity is designed to elevate your stay. Explore our comprehensive facilities across all LuxeStay properties.
                    </p>
                    <div className="flex items-center gap-2 text-luxury-muted text-sm">
                        <span>Home</span><ChevronRight className="w-4 h-4" /><span className="text-luxury-blue">Amenities</span>
                    </div>
                </div>
            </section>

            {/* Tabs */}
            <section className="sticky top-16 z-30 bg-luxury-dark/95 backdrop-blur-md border-b border-luxury-border">
                <div className="container mx-auto px-6">
                    <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveTab(cat.id)}
                                className={`flex-shrink-0 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === cat.id
                                        ? `${cat.activeBg} text-white shadow-lg`
                                        : 'text-luxury-muted hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Items Grid */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <div className="mb-12">
                        <h2 className={`text-2xl font-bold text-white mb-2 ${active.color}`}>{active.label}</h2>
                        <div className={`w-12 h-0.5 ${active.activeBg}`} />
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {active.items.map((item) => (
                            <div
                                key={item.name}
                                className={`bg-[#1A2235] border ${active.border} rounded-2xl p-6 group hover:-translate-y-1 hover:shadow-xl transition-all duration-300`}
                            >
                                <div className={`w-12 h-12 rounded-xl ${active.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                                    <item.icon className={`w-6 h-6 ${active.color}`} />
                                </div>
                                <h3 className="text-white font-semibold mb-2">{item.name}</h3>
                                <p className="text-luxury-muted text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* All Categories Overview */}
            <section className="bg-[#1A2235] border-t border-luxury-border py-20">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <span className="text-luxury-blue text-xs font-bold tracking-[0.2em] uppercase mb-4 block">Complete Overview</span>
                        <h2 className="text-3xl font-bold text-white">Everything In One Place</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => { setActiveTab(cat.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                className={`${cat.bg} border ${cat.border} rounded-2xl p-6 text-left group hover:-translate-y-1 transition-all duration-300`}
                            >
                                <p className={`font-semibold ${cat.color} mb-2`}>{cat.label}</p>
                                <p className="text-luxury-muted text-sm">{cat.items.length} amenities</p>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default AmenitiesPage;





