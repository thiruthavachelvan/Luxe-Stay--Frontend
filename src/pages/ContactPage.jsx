import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, ChevronRight, Globe, ShieldCheck, Star } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const contactInfo = [
    {
        icon: Mail,
        label: 'Direct Channel',
        value: 'concierge@luxestay.com',
        sub: 'Available 24/7 for refined inquiries',
        color: 'text-gold-400',
        bg: 'bg-gold-400/10',
    },
    {
        icon: Phone,
        label: 'Voice Uplink',
        value: '+1 800-LUXE-STAY',
        sub: 'Operational: 06:00 – 00:00 UTC',
        color: 'text-emerald-400',
        bg: 'bg-emerald-400/10',
    },
    {
        icon: MapPin,
        label: 'Global Headquarters',
        value: '14 Promenade du Lac, Geneva',
        sub: 'Switzerland – CH-1204 Registry',
        color: 'text-purple-400',
        bg: 'bg-purple-400/10',
    },
    {
        icon: Clock,
        label: 'Protocol Speed',
        value: 'Instant Prioritization',
        sub: 'Within 24 Hours Verification',
        color: 'text-amber-400',
        bg: 'bg-amber-400/10',
    },
];

const subjects = [
    'Culinary & Dining Inquiries',
    'Registry Modification Protocol',
    'Special Concierge Directive',
    'Settlement & Billing Audit',
    'Guest Experience Testimonial',
    'Strategic Partnership Protocol',
    'Other Communications',
];

const ContactPage = () => {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${__API_BASE__}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to transmit message');
            setSuccess(true);
            setForm({ name: '', email: '', subject: '', message: '' });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-navy-950 text-white font-sans selection:bg-gold-400 selection:text-navy-950">
            <Navbar />

            {/* Hero Section - Cinematic Uplink */}
            <section className="relative pt-48 pb-32 overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1920"
                        alt="Contact"
                        className="w-full h-full object-cover opacity-10 scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-950/40 to-navy-950"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="h-[1px] w-12 bg-gold-500/30"></div>
                            <span className="text-[10px] font-black text-gold-500 uppercase tracking-[0.5em] italic">Get In Touch</span>
                            <div className="h-[1px] w-12 bg-gold-500/30"></div>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-bold text-white mb-8 tracking-tighter">
                            Establish <br />
                            <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-yellow-200 to-gold-500 underline decoration-gold-500/10 underline-offset-[20px]">Communication</span>
                        </h1>
                        <p className="text-white/40 max-w-2xl mx-auto text-lg font-serif italic leading-relaxed">
                            Whether you seek a rare request or immediate concierge support — our global operatives are standing by to ensure your LuxeStay registry is flawless.
                        </p>
                    </motion.div>

                    <div className="flex items-center justify-center gap-2 text-gold-500/40 text-[10px] font-black uppercase tracking-widest italic pt-12">
                        <span>Home Hub</span><ChevronRight className="w-3 h-3" /><span>Communication Portal</span>
                    </div>
                </div>
            </section>

            {/* Contact Info Grid - Structured Assets */}
            <section className="py-20 bg-navy-900/40 border-y border-white/5 backdrop-blur-3xl relative">
                <div className="container mx-auto px-6">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {contactInfo.map((c, idx) => (
                            <motion.div
                                key={c.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className="glass-panel p-8 group hover:border-gold-500/40 transition-all duration-700"
                            >
                                <div className={`w-12 h-12 rounded-2xl ${c.bg} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 shadow-2xl shadow-navy-950`}>
                                    <c.icon className={`w-6 h-6 ${c.color}`} />
                                </div>
                                <p className="text-gold-500/40 text-[10px] font-black uppercase tracking-[0.3em] mb-3 italic">{c.label}</p>
                                <p className="text-white font-serif italic text-lg mb-2 tracking-wide group-hover:text-gold-400 transition-colors">{c.value}</p>
                                <p className="text-white/20 text-[10px] uppercase font-bold tracking-widest">{c.sub}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Communication Manifest - Form Section */}
            <section className="py-32 relative overflow-hidden">
                <div className="absolute top-1/2 left-0 w-96 h-96 bg-gold-400/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-24 items-start">

                        {/* Left: Tactical Info */}
                        <div className="space-y-12">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-[1px] bg-gold-500/30"></div>
                                    <span className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em] italic">Send Transmission</span>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-bold text-white font-serif italic mb-8 leading-tight underline decoration-gold-500/10 underline-offset-8">Directives Received <br />Round the Clock.</h2>
                                <p className="text-white/40 text-lg leading-relaxed font-serif italic">
                                    Your transmissions are processed with absolute priority. Our concierge array monitors the global stream for any emergency directives or bespoke stay requirements.
                                </p>
                            </motion.div>

                            <div className="grid gap-6">
                                {[
                                    { text: 'Bespoke Registry & Suite Customization', icon: Star },
                                    { text: 'Tactical Cancellation & Refund Support', icon: ShieldCheck },
                                    { text: 'Culinary Feedbacks & Special Diets', icon: Globe },
                                    { text: 'Corporate & Diplomatic Event Logistics', icon: ChevronRight }
                                ].map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 + idx * 0.1 }}
                                        viewport={{ once: true }}
                                        className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-gold-500/20 transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-gold-500/5 flex items-center justify-center group-hover:bg-gold-500/20 transition-all">
                                            <item.icon className="w-4 h-4 text-gold-500" />
                                        </div>
                                        <span className="text-sm font-medium text-white/50 group-hover:text-white transition-colors">{item.text}</span>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="p-8 glass-panel rounded-[2rem] border-gold-500/20 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
                                <p className="text-gold-500 text-[10px] font-black uppercase tracking-[0.4em] mb-3 italic">Emergency Signal</p>
                                <p className="text-white font-serif italic text-lg leading-relaxed">
                                    "For critical directives during an active residency, utilize the secure voice link <span className="text-gold-400 underline decoration-gold-500/30 underline-offset-4">+1 800-LUXE-STAY</span>."
                                </p>
                            </div>
                        </div>

                        {/* Right: Secure Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="glass-panel p-12 rounded-[3rem] shadow-2xl relative"
                        >
                            {success ? (
                                <div className="text-center py-20 space-y-8">
                                    <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                                        <CheckCircle className="w-12 h-12 text-emerald-400 px-1" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-white font-serif italic">Transmission Received</h3>
                                    <p className="text-white/40 max-w-xs mx-auto text-sm leading-relaxed">The signal has been routed to our central concierge. Expect a protocol update within 24 hours.</p>
                                    <button
                                        onClick={() => setSuccess(false)}
                                        className="px-10 py-4 bg-navy-950 border border-gold-500/10 text-gold-400 hover:text-white hover:border-gold-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all italic active:scale-95"
                                    >
                                        Generate New Transmission
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid sm:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.4em] ml-1 italic">Full Identity Registry</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={form.name}
                                                onChange={handleChange}
                                                required
                                                placeholder="Resident Name"
                                                className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-gold-500 transition-all font-serif italic shadow-inner"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.4em] ml-1 italic">Communication Node</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={form.email}
                                                onChange={handleChange}
                                                required
                                                placeholder="Email Address"
                                                className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-gold-500 transition-all font-serif italic shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.4em] ml-1 italic">Communication Subject</label>
                                        <select
                                            name="subject"
                                            value={form.subject}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-gold-500 transition-all font-serif italic shadow-inner appearance-none cursor-pointer"
                                        >
                                            <option value="">Select Protocol</option>
                                            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gold-500/40 uppercase tracking-[0.4em] ml-1 italic">Mission Message</label>
                                        <textarea
                                            name="message"
                                            value={form.message}
                                            onChange={handleChange}
                                            required
                                            rows={5}
                                            placeholder="Detailed Directive..."
                                            className="w-full bg-navy-950 border border-gold-500/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-gold-500 transition-all font-serif italic shadow-inner resize-none"
                                        />
                                    </div>

                                    {error && (
                                        <div className="p-5 bg-red-400/10 border border-red-400/20 rounded-2xl flex items-center gap-4 animate-in slide-in-from-left-4">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                            <p className="text-red-400 text-[10px] font-black uppercase tracking-widest">{error}</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-5 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-navy-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] transition-all shadow-2xl shadow-gold-500/20 active:scale-[0.98] flex items-center justify-center gap-3 italic"
                                    >
                                        {loading ? (
                                            <div className="w-4 h-4 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                Transmit Directive
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default ContactPage;





