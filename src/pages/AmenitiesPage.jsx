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
        <div className="min-h-screen bg-navy-950 text-white font-sans selection:bg-gold-400 selection:text-navy-950">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-40 pb-24 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.05),transparent_50%)]" />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex items-center gap-3 mb-6 animate-in fade-in slide-in-from-left-4 duration-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em]">Sanctuary Facilities</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-serif italic text-white mb-8 tracking-tight leading-[0.9] animate-in fade-in slide-in-from-top-8 duration-1000">
                        Every luxury, <br />
                        <span className="text-gold-400">perfectly curated.</span>
                    </h1>

                    <p className="text-xl text-white/40 font-light leading-relaxed max-w-2xl mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                        From state-of-the-art wellness centers to digital-first convenience, explore the comprehensive ecosystem of LuxeStay excellence.
                    </p>

                    <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
                        <span className="hover:text-gold-400 transition-colors cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Archive</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-gold-400">Amenities</span>
                    </div>
                </div>
            </section>

            {/* Elevated Sticky Tabs */}
            <section className="sticky top-20 z-40 py-6">
                <div className="container mx-auto px-6">
                    <div className="glass-panel p-2 flex gap-2 overflow-x-auto scrollbar-hide border-white/5 bg-navy-950/40 backdrop-blur-2xl">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveTab(cat.id)}
                                className={`flex-shrink-0 px-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${activeTab === cat.id
                                    ? `bg-gold-400 text-navy-950 shadow-2xl shadow-gold-400/20`
                                    : 'text-white/40 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Items Grid with Glassmorphism */}
            <section className="py-24 relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gold-400/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
                        <div className="space-y-4">
                            <span className="text-[10px] font-black text-gold-400 uppercase tracking-[0.5em]">Registry of Service</span>
                            <h2 className="text-4xl md:text-5xl font-serif italic text-white leading-tight">{active.label}</h2>
                        </div>
                        <div className="h-0.5 w-32 bg-gold-400/20" />
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {active.items.map((item, i) => (
                            <div
                                key={item.name}
                                className="glass-panel p-10 group hover:border-gold-400/20 transition-all duration-700 hover:bg-white/[0.03] animate-in fade-in slide-in-from-bottom-8"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <div className="w-14 h-14 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center mb-10 group-hover:bg-gold-400 group-hover:border-gold-400 transition-all duration-700">
                                    <item.icon className="w-6 h-6 text-white/20 group-hover:text-navy-950 transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-tighter group-hover:text-gold-400 transition-colors">{item.name}</h3>
                                <p className="text-xs text-white/40 font-medium leading-relaxed group-hover:text-white/60 transition-colors uppercase tracking-widest">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Complete Registry Overview */}
            <section className="bg-white/[0.02] border-y border-white/5 py-32">
                <div className="container mx-auto px-6">
                    <div className="text-center space-y-4 mb-20">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Overview</span>
                        <h2 className="text-4xl font-serif italic text-white">The Full Collection</h2>
                    </div>

                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => { setActiveTab(cat.id); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                                className="glass-panel p-8 text-left group hover:bg-white/5 transition-all duration-500 overflow-hidden relative"
                            >
                                <div className="relative z-10 space-y-4">
                                    <p className="text-[10px] font-black text-gold-400 uppercase tracking-widest">{cat.label}</p>
                                    <div className="flex items-center justify-between">
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">{cat.items.length} Amenities</p>
                                        <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-gold-400 transition-colors transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gold-400/[0.02] rounded-full group-hover:scale-150 transition-transform duration-1000" />
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





