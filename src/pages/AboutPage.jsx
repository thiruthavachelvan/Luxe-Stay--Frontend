import { useEffect, useState } from 'react';
import { Building2, Globe, Award, Heart, Users, Star, MapPin, Shield, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const values = [
    {
        icon: Star,
        title: 'Uncompromising Excellence',
        desc: 'We set the gold standard in luxury hospitality, constantly raising the bar to exceed guest expectations at every touchpoint.',
        color: 'text-yellow-400',
        bg: 'bg-yellow-400/10',
    },
    {
        icon: Heart,
        title: 'Heartfelt Hospitality',
        desc: 'Every guest interaction is driven by genuine care. Rooted in Indian values of Atithi Devo Bhava — the guest is God — we treat every visitor as family.',
        color: 'text-rose-400',
        bg: 'bg-rose-400/10',
    },
    {
        icon: Globe,
        title: 'Global Perspective',
        desc: 'With properties spanning India and premier global destinations, we celebrate diverse cultures while delivering a consistently exceptional experience.',
        color: 'text-luxury-gold',
        bg: 'bg-[#D4AF37]/10',
    },
    {
        icon: Shield,
        title: 'Trust & Integrity',
        desc: 'From safety protocols to transparent pricing, we build lasting relationships with guests grounded in honesty and accountability.',
        color: 'text-emerald-400',
        bg: 'bg-emerald-400/10',
    },
];

const leadership = [
    { name: 'Rajiv Krishnamurthy', title: 'Founder & Chairman', initials: 'RK', color: 'bg-luxury-gold' },
    { name: 'Ananya Subramaniam', title: 'Chief Executive Officer', initials: 'AS', color: 'bg-purple-600' },
    { name: 'Vikram Mehta', title: 'Chief Operating Officer', initials: 'VM', color: 'bg-rose-600' },
    { name: 'Sunita Rao Iyer', title: 'Chief Experience Officer', initials: 'SR', color: 'bg-amber-600' },
    { name: 'Arjun Nair', title: 'Head of Global Expansion', initials: 'AN', color: 'bg-emerald-600' },
    { name: 'Deepika Venkatesh', title: 'Director of Design & Interiors', initials: 'DV', color: 'bg-indigo-600' },
];

const milestones = [
    { year: '1994', event: 'LuxeStay founded by Rajiv Krishnamurthy with the first flagship property in Chennai, Tamil Nadu.' },
    { year: '2002', event: 'Expanded across South India with a luxury property in Bengaluru.' },
    { year: '2006', event: 'Expanded to Mumbai, bringing LuxeStay\'s signature luxury to India\'s financial capital.' },
    { year: '2010', event: 'Reached 1 million satisfied guests and launched the LuxeStay Loyalty Program.' },
    { year: '2017', event: 'Strengthened pan-India presence across major cities; awarded India\'s Best Luxury Hotel Chain for 5 consecutive years.' },
    { year: '2022', event: 'Expanded internationally with properties in Dubai and New York, marking LuxeStay\'s global footprint.' },
    { year: '2024', event: 'Launched next-gen smart rooms, EV charging infrastructure, and a full sustainability pledge across all locations.' },
];

const AboutPage = () => {
    const [locations, setLocations] = useState([]);
    const [loadingLocations, setLoadingLocations] = useState(true);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await fetch(`${__API_BASE__}/api/public/locations`);
                if (res.ok) {
                    const data = await res.json();
                    setLocations(data);
                }
            } catch (err) {
                console.error('Failed to fetch locations:', err);
            } finally {
                setLoadingLocations(false);
            }
        };
        fetchLocations();
    }, []);

    const totalRooms = locations.reduce((acc, l) => acc + (l.rooms || 0), 0);

    const stats = [
        { label: 'Years of Excellence', value: '30+' },
        { label: 'Hotel Properties', value: locations.length > 0 ? `${locations.length}+` : '—' },
        { label: 'Happy Guests', value: '2M+' },
        { label: 'Awards Won', value: '180+' },
        { label: 'Global Staff', value: '5K+' },
    ];

    return (
        <div className="min-h-screen bg-navy-950 text-white font-sans selection:bg-gold-400 selection:text-navy-950">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.06),transparent_50%)]" />
                <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-gold-400/5 rounded-full blur-[120px] animate-pulse" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="max-w-xl">
                            <div className="flex items-center gap-3 mb-6 animate-in fade-in slide-in-from-left-4 duration-700">
                                <div className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em]">Our Lineage</span>
                            </div>

                            <h1 className="text-5xl md:text-7xl font-serif italic text-white mb-8 tracking-tight leading-[0.95] animate-in fade-in slide-in-from-top-8 duration-1000">
                                The architecture <br />
                                <span className="text-gold-400 block mt-1">of memory.</span>
                            </h1>

                            <p className="text-lg text-white/40 font-light leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                                Founded in 1994, LuxeStay was born from a singular vision: to translate the ancient Indian philosophy of <em className="text-gold-400 not-italic font-serif italic">Atithi Devo Bhava</em> into a contemporary language of absolute luxury.
                            </p>

                            <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
                                <Link to="/" className="hover:text-gold-400 transition-colors">Manifesto</Link>
                                <div className="w-6 h-px bg-white/10" />
                                <span className="text-gold-400">Legacy</span>
                            </div>
                        </div>

                        {/* Visual Ornament - More integrated */}
                        <div className="hidden lg:block relative group">
                            <div className="absolute inset-0 bg-gold-400/10 blur-[80px] group-hover:bg-gold-400/20 transition-all duration-1000" />
                            <div className="relative border border-white/5 aspect-[16/10] rounded-sm overflow-hidden shadow-2xl">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070')] bg-cover bg-center opacity-30 grayscale group-hover:grayscale-0 group-hover:opacity-50 transition-all duration-1000 scale-105 group-hover:scale-100" />
                                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent" />
                                <div className="absolute bottom-6 left-6 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full border border-gold-400/20 flex items-center justify-center">
                                        <Award className="w-4 h-4 text-gold-400" />
                                    </div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gold-400/40">Est. 1994</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section - Premium Grid */}
            <section className="border-y border-white/5 bg-white/[0.01] relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.02),transparent_70%)]" />
                <div className="container mx-auto px-6 py-16 relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-0">
                        {stats.map((s, i) => (
                            <div key={s.label} className={`px-8 py-4 group animate-in fade-in zoom-in-95 duration-700 ${i % 2 !== 0 ? 'border-l border-white/5 md:border-l-0' : ''} ${i !== 0 && i % 3 !== 0 ? 'md:border-l border-white/5' : ''} ${i !== 0 ? 'lg:border-l' : ''}`} style={{ animationDelay: `${i * 100}ms` }}>
                                <div className="relative text-center">
                                    <p className="text-4xl md:text-5xl font-serif italic text-gold-400 mb-2 group-hover:scale-105 transition-all duration-500">{s.value}</p>
                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">{s.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Narrative Section */}
            <section className="py-32 relative">
                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-24 items-center">
                        <div className="space-y-10">
                            <div className="space-y-4">
                                <span className="text-[10px] font-black text-gold-400 uppercase tracking-[0.4em]">The Philosophy</span>
                                <h2 className="text-4xl md:text-5xl font-serif italic text-white leading-tight">An evolution of Indian <br /> hospitality.</h2>
                            </div>

                            <div className="space-y-6 text-white/50 text-base font-light leading-relaxed">
                                <p>
                                    LuxeStay Hotels & Resorts began as a whisper on the shores of Marina Beach, Chennai. Our founder, Rajiv Krishnamurthy, envisioned a sanctuary where the service wasn't just efficient, but emotional.
                                </p>
                                <p>
                                    Three decades later, that whisper has grown into a global symphony. Every LuxeStay property is a curated dialogue between local heritage and international avant-garde design. From the silk-draped corridors of our Indian flagships to the glass spires of our New York enclave.
                                </p>
                                <p>
                                    We don't just host; we curate existence. Over 200,000 patrons every year choose LuxeStay as the canvas for their life's most significant chapters.
                                </p>
                            </div>
                        </div>

                        {/* Milestones - Visual Timeline */}
                        <div className="glass-panel p-10 space-y-12 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-10 text-gold-400/5 group-hover:text-gold-400/10 transition-colors duration-1000">
                                <Award className="w-32 h-32" />
                            </div>

                            <div className="relative space-y-10">
                                {milestones.filter((_, i) => i % 2 === 0).map((m, i) => (
                                    <div key={m.year} className="flex gap-8 group/item">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-px h-full bg-white/10" />
                                            <div className="w-2 h-2 rounded-full border border-gold-400 group-hover/item:bg-gold-400 transition-all shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                                            <div className="w-px h-full bg-white/10" />
                                        </div>
                                        <div className="py-2">
                                            <span className="text-[10px] font-black text-gold-400 uppercase tracking-widest mb-2 block">{m.year}</span>
                                            <p className="text-xs text-white/40 font-medium leading-relaxed group-hover/item:text-white/60 transition-colors">{m.event}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision - Elevated Cards */}
            <section className="bg-white/[0.02] py-40">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Mission */}
                        <div className="glass-panel p-16 space-y-8 relative overflow-hidden group hover:bg-white/[0.04] transition-all duration-700">
                            <div className="w-16 h-16 rounded-[24px] bg-gold-400/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                                <Award className="w-8 h-8 text-gold-400" />
                            </div>
                            <h3 className="text-3xl font-serif italic text-white">The Mission</h3>
                            <p className="text-white/40 font-light leading-[1.8] text-lg">
                                To engineer profound luxury through the lens of Indian warmth. We seek to transcend hospitality, creating atmospheric sanctuaries where every detail is a testament to excellence.
                            </p>
                            <div className="absolute bottom-[-20%] right-[-10%] w-64 h-64 bg-gold-400/5 blur-[80px] rounded-full" />
                        </div>

                        {/* Vision */}
                        <div className="glass-panel p-16 space-y-8 relative overflow-hidden group hover:bg-white/[0.04] transition-all duration-700 border-white/5">
                            <div className="w-16 h-16 rounded-[24px] bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 border border-white/10">
                                <Globe className="w-8 h-8 text-white/40" />
                            </div>
                            <h3 className="text-3xl font-serif italic text-white">The Vision</h3>
                            <p className="text-white/40 font-light leading-[1.8] text-lg">
                                To remain the definitive benchmark for luxury. We aspire to a future where LuxeStay is synonymous with the global celebration of Indian heritage and conscious, aesthetic living.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-32">
                <div className="container mx-auto px-6">
                    <div className="text-center space-y-4 mb-24">
                        <span className="text-[10px] font-black text-gold-400 uppercase tracking-[0.5em]">Cornerstones</span>
                        <h2 className="text-5xl font-serif italic text-white">Our Tenets</h2>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((v, i) => (
                            <div key={v.title} className="glass-panel p-10 hover:border-gold-400/20 transition-all duration-500 group">
                                <div className="w-12 h-12 rounded-[16px] bg-white/5 flex items-center justify-center mb-8 border border-white/10 group-hover:bg-gold-400 group-hover:border-gold-400 transition-all duration-500">
                                    <v.icon className="w-6 h-6 text-white/20 group-hover:text-navy-950 transition-colors" />
                                </div>
                                <h4 className="text-lg font-bold text-white mb-4 uppercase tracking-tighter">{v.title}</h4>
                                <p className="text-[11px] text-white/30 font-medium leading-relaxed uppercase tracking-wider">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Properties Registry */}
            <section className="bg-navy-900/50 py-32 border-y border-white/5">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-8 mb-20 text-center md:text-left">
                        <div className="space-y-4">
                            <span className="text-[10px] font-black text-gold-400 uppercase tracking-[0.4em] block italic">Global Portfolio</span>
                            <h2 className="text-4xl md:text-6xl font-serif italic text-white leading-tight">The Registry</h2>
                        </div>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] max-w-xs md:text-right leading-relaxed italic">
                            {locations.length} architectural landmarks <br className="hidden md:block" /> defined by service.
                        </p>
                    </div>

                    {loadingLocations ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-10 h-10 text-gold-400 animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {locations.map((loc) => (
                                <div key={loc._id} className="glass-panel p-6 flex flex-col gap-6 hover:bg-white/5 transition-all duration-500 group cursor-default">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center border border-gold-400/20 group-hover:bg-gold-400 group-hover:text-navy-950 transition-all duration-500">
                                            <MapPin className="w-4 h-4 text-gold-400 group-hover:text-navy-950 transition-colors" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white uppercase tracking-tighter">{loc.city}</p>
                                            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">{loc.category || 'Region I'}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{loc.rooms > 0 ? `${loc.rooms} Sanctuary Keys` : 'Opening Soon'}</span>
                                        <div className={`w-1.5 h-1.5 rounded-full ${loc.status === 'Active' ? 'bg-emerald-400' : 'bg-gold-400/30'}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Leadership - Minimalist Portraits */}
            <section className="py-40">
                <div className="container mx-auto px-6">
                    <div className="text-center space-y-4 mb-24">
                        <span className="text-[10px] font-black text-gold-400 uppercase tracking-[0.4em] block italic">Stewards</span>
                        <h2 className="text-4xl md:text-6xl font-serif italic text-white leading-tight">The Conserge Board</h2>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-10">
                        {leadership.map((l) => (
                            <div key={l.name} className="group relative">
                                <div className="glass-panel p-8 md:p-10 flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-6 sm:gap-8 hover:bg-white/[0.03] transition-all duration-500 overflow-hidden text-center sm:text-left h-full">
                                    <div className={`w-20 h-20 rounded-full ${l.color} flex-shrink-0 flex items-center justify-center text-white text-2xl font-serif italic border-4 border-navy-950 shadow-2xl group-hover:scale-110 transition-transform duration-500 relative z-10`}>
                                        {l.initials}
                                    </div>
                                    <div className="space-y-2 relative z-10">
                                        <h4 className="text-xl md:text-lg font-bold text-white uppercase tracking-tighter leading-tight">{l.name}</h4>
                                        <p className="text-[10px] font-black text-gold-400/40 uppercase tracking-[0.2em]">{l.title}</p>
                                    </div>
                                    <div className="absolute right-[-20px] bottom-[-20px] w-24 h-24 bg-white/[0.02] rounded-full group-hover:scale-150 transition-transform duration-1000" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA - Cinematic Conclusion */}
            <section className="relative py-48 overflow-hidden">
                <div className="absolute inset-0 bg-navy-900/40" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.08),transparent_70%)]" />

                <div className="container mx-auto px-6 relative z-10 text-center space-y-12">
                    <div className="space-y-6">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold-400 mx-auto" />
                        <h2 className="text-5xl md:text-7xl font-serif italic text-white max-w-4xl mx-auto leading-tight">Begin your chapter in our registry of luxury.</h2>
                    </div>

                    <Link to="/rooms" className="inline-flex items-center gap-6 px-12 py-6 bg-gold-400 text-navy-950 font-black text-[12px] uppercase tracking-[0.4em] rounded-full hover:bg-white transition-all shadow-2xl shadow-gold-400/20 active:scale-95">
                        Reserve a Sanctuary
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default AboutPage;





