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
                const res = await fetch('http://localhost:5000/api/public/locations');
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
    ];

    return (
        <div className="min-h-screen bg-luxury-dark text-luxury-text">
            <Navbar />

            {/* Hero */}
            <section className="relative pt-32 pb-24 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-luxury-blue/20 via-transparent to-purple-900/10 pointer-events-none" />
                <div className="absolute top-20 right-0 w-96 h-96 bg-luxury-blue/5 rounded-full blur-3xl pointer-events-none" />
                <div className="container mx-auto px-6 relative">
                    <span className="text-luxury-blue text-xs font-bold tracking-[0.2em] uppercase mb-4 block">
                        Our Story
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Crafting Extraordinary <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-luxury-blue to-purple-400">
                            Stays Since 1994
                        </span>
                    </h1>
                    <p className="text-luxury-muted text-lg max-w-2xl leading-relaxed mb-10">
                        Born in Chennai, raised across India, and celebrated globally — LuxeStay Hotels & Resorts was built on a simple philosophy deeply rooted in Tamil Nadu's culture of warmth: <em>Atithi Devo Bhava</em> — the guest is God. For three decades, we've turned that belief into a world-class reality.
                    </p>
                    <div className="flex items-center gap-2 text-luxury-muted text-sm">
                        <Link to="/" className="hover:text-luxury-blue transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-luxury-blue">About Us</span>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="bg-[#1A2235] border-y border-luxury-border py-12">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {stats.map((s) => (
                            <div key={s.label}>
                                <p className="text-4xl font-bold text-white mb-2">{s.value}</p>
                                <p className="text-luxury-muted text-sm tracking-wide">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-24">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="text-luxury-blue text-xs font-bold tracking-[0.2em] uppercase mb-4 block">Who We Are</span>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">A Legacy Built on Indian Hospitality</h2>
                            <div className="space-y-4 text-luxury-muted leading-relaxed">
                                <p>
                                    LuxeStay Hotels & Resorts began as a single boutique property on Chennai's famed Marina Beach promenade, conceived by Tamil Nadu hospitality visionary Rajiv Krishnamurthy. His philosophy was both ancient and radical: guests shouldn't just be served — they should be celebrated, just as the tradition of Tamil Nadu demands.
                                </p>
                                <p>
                                    Over three decades, that founding philosophy has grown into a proud Indian hospitality brand — now spanning {locations.length > 0 ? locations.length : 'multiple'} properties across India and international destinations. Each property is a unique reflection of its locale, yet every one carries the unmistakable LuxeStay hallmarks of impeccable design, flawless service, and genuine warmth.
                                </p>
                                <p>
                                    Today, we welcome over 200,000 guests annually — from honeymooners and families to business travelers and dignitaries — all united by a shared appreciation for Indian luxury at its finest.
                                </p>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="relative pl-6 border-l-2 border-luxury-border space-y-8">
                            {milestones.map((m) => (
                                <div key={m.year} className="relative group">
                                    <div className="absolute -left-[29px] w-4 h-4 rounded-full bg-luxury-blue border-2 border-luxury-dark group-hover:scale-125 transition-transform" />
                                    <span className="text-luxury-blue text-xs font-bold tracking-widest uppercase">{m.year}</span>
                                    <p className="text-luxury-muted text-sm mt-1 leading-relaxed">{m.event}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="bg-[#1A2235] py-24">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Mission */}
                        <div className="bg-luxury-dark border border-luxury-border rounded-2xl p-8 relative overflow-hidden group hover:border-luxury-blue/50 transition-colors">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-luxury-blue/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-luxury-blue/10 transition-colors" />
                            <div className="w-12 h-12 rounded-xl bg-luxury-blue/10 flex items-center justify-center mb-6">
                                <Award className="w-6 h-6 text-luxury-blue" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
                            <p className="text-luxury-muted leading-relaxed">
                                To provide every guest with an unparalleled luxury experience that seamlessly blends world-class comfort, the richness of Indian culture, and heartfelt service — creating memories that last a lifetime.
                            </p>
                        </div>
                        {/* Vision */}
                        <div className="bg-luxury-dark border border-luxury-border rounded-2xl p-8 relative overflow-hidden group hover:border-purple-500/50 transition-colors">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/10 transition-colors" />
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6">
                                <Globe className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
                            <p className="text-luxury-muted leading-relaxed">
                                To be India's most celebrated luxury hotel brand — recognized globally not just for the beauty of our properties, but for the depth of our human connections, our celebration of Indian heritage, and our commitment to sustainable tourism.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-24">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-luxury-blue text-xs font-bold tracking-[0.2em] uppercase mb-4 block">What Drives Us</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">Our Core Values</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((v) => (
                            <div
                                key={v.title}
                                className="bg-[#1A2235] border border-luxury-border rounded-2xl p-6 group hover:border-luxury-blue/30 hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className={`w-12 h-12 rounded-xl ${v.bg} flex items-center justify-center mb-5`}>
                                    <v.icon className={`w-6 h-6 ${v.color}`} />
                                </div>
                                <h4 className="text-white font-semibold mb-3">{v.title}</h4>
                                <p className="text-luxury-muted text-sm leading-relaxed">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Locations — live from admin */}
            <section className="bg-[#1A2235] py-24">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <span className="text-luxury-blue text-xs font-bold tracking-[0.2em] uppercase mb-4 block">Where We Are</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Hotel Properties</h2>
                        <p className="text-luxury-muted max-w-xl mx-auto">
                            {locations.length > 0
                                ? `${locations.length} exceptional properties across India and international destinations, each telling a unique story.`
                                : 'Exceptional properties across India and international destinations, each telling a unique story.'}
                        </p>
                    </div>

                    {loadingLocations ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="w-8 h-8 text-luxury-blue animate-spin" />
                        </div>
                    ) : locations.length === 0 ? (
                        <div className="text-center text-luxury-muted py-8">No locations available yet.</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {locations.map((loc) => (
                                <div
                                    key={loc._id}
                                    className="bg-luxury-dark border border-luxury-border rounded-xl p-5 flex flex-col gap-2 group hover:border-luxury-blue/50 hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-luxury-blue/10 flex items-center justify-center flex-shrink-0">
                                            <MapPin className="w-4 h-4 text-luxury-blue" />
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold text-sm">{loc.city}</p>
                                            <p className="text-luxury-muted text-[10px] font-bold uppercase tracking-widest">{loc.category || 'India'}</p>
                                        </div>
                                    </div>
                                    {loc.rooms > 0 && (
                                        <p className="text-[10px] text-luxury-muted pl-1">{loc.rooms} rooms available</p>
                                    )}
                                    {loc.status && (
                                        <span className={`self-start px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${loc.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'}`}>
                                            {loc.status}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Aggregate room count */}
                    {!loadingLocations && locations.length > 0 && totalRooms > 0 && (
                        <p className="text-center text-luxury-muted text-sm mt-8">
                            Combined inventory of <span className="text-white font-semibold">{totalRooms.toLocaleString()} keys</span> across all properties
                        </p>
                    )}
                </div>
            </section>

            {/* Leadership */}
            <section className="py-24">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-luxury-blue text-xs font-bold tracking-[0.2em] uppercase mb-4 block">The People Behind LuxeStay</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">Our Leadership</h2>
                        <p className="text-luxury-muted mt-3 max-w-xl mx-auto text-sm">
                            A passionate team of Indian hospitality professionals united by a shared vision of redefining luxury.
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {leadership.map((l) => (
                            <div key={l.name} className="bg-[#1A2235] border border-luxury-border rounded-2xl p-6 flex items-center gap-5 group hover:border-luxury-blue/40 hover:-translate-y-1 transition-all duration-300">
                                <div className={`${l.color} w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0`}>
                                    {l.initials}
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold">{l.name}</h4>
                                    <p className="text-luxury-muted text-xs tracking-wide mt-1">{l.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-gradient-to-r from-luxury-blue/20 to-purple-900/20 border-y border-luxury-border py-20">
                <div className="container mx-auto px-6 text-center">
                    <Users className="w-12 h-12 text-luxury-blue mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to Experience LuxeStay?</h2>
                    <p className="text-luxury-muted mb-8 max-w-md mx-auto">Join millions of guests who have discovered the art of truly exceptional Indian hospitality.</p>
                    <Link to="/rooms" className="inline-block px-8 py-3 bg-luxury-blue text-white font-medium rounded hover:bg-luxury-blue-hover transition-colors shadow-[0_0_20px_rgba(30,64,175,0.4)]">
                        Explore Our Rooms
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default AboutPage;
