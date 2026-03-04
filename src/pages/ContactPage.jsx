import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const contactInfo = [
    {
        icon: Mail,
        label: 'Email Us',
        value: 'support@luxestay.com',
        sub: 'Available 24/7 for inquiries',
        color: 'text-luxury-gold',
        bg: 'bg-[#D4AF37]/10',
    },
    {
        icon: Phone,
        label: 'Call Us',
        value: '+1 800-LUXE-STAY',
        sub: 'Mon – Sun, 6:00 AM – 12:00 AM',
        color: 'text-emerald-400',
        bg: 'bg-emerald-400/10',
    },
    {
        icon: MapPin,
        label: 'Corporate Office',
        value: '14 Promenade du Lac, Geneva',
        sub: 'Switzerland – CH-1204',
        color: 'text-purple-400',
        bg: 'bg-purple-400/10',
    },
    {
        icon: Clock,
        label: 'Response Time',
        value: 'Within 24 Hours',
        sub: 'Priority handling for urgent issues',
        color: 'text-amber-400',
        bg: 'bg-amber-400/10',
    },
];

const subjects = [
    'Booking Inquiry',
    'Reservation Change / Cancellation',
    'Special Request',
    'Billing & Payments',
    'Feedback & Complaint',
    'Partnership / Corporate Inquiry',
    'Other',
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
            if (!res.ok) throw new Error(data.message || 'Failed to send message');
            setSuccess(true);
            setForm({ name: '', email: '', subject: '', message: '' });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-luxury-dark text-luxury-text">
            <Navbar />

            {/* Hero */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-luxury-blue/10 via-transparent to-purple-900/10 pointer-events-none" />
                <div className="container mx-auto px-6 relative">
                    <span className="text-luxury-blue text-xs font-bold tracking-[0.2em] uppercase mb-4 block">
                        Get In Touch
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        We're Here to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-luxury-blue to-purple-400">
                            Help You
                        </span>
                    </h1>
                    <p className="text-luxury-muted text-lg max-w-2xl leading-relaxed mb-6">
                        Whether you have a question, a special request, or need assistance — our dedicated team is ready to ensure your LuxeStay experience is flawless.
                    </p>
                    <div className="flex items-center gap-2 text-luxury-muted text-sm">
                        <span>Home</span><ChevronRight className="w-4 h-4" /><span className="text-luxury-blue">Contact Us</span>
                    </div>
                </div>
            </section>

            {/* Contact Info Cards */}
            <section className="bg-[#1A2235] border-y border-luxury-border py-12">
                <div className="container mx-auto px-6">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {contactInfo.map((c) => (
                            <div key={c.label} className="bg-luxury-dark border border-luxury-border rounded-xl p-5 group hover:border-luxury-blue/40 transition-colors">
                                <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center mb-4`}>
                                    <c.icon className={`w-5 h-5 ${c.color}`} />
                                </div>
                                <p className="text-luxury-muted text-xs uppercase tracking-widest mb-1">{c.label}</p>
                                <p className="text-white font-medium text-sm mb-1">{c.value}</p>
                                <p className="text-luxury-muted text-xs">{c.sub}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form */}
            <section className="py-24">
                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-start">

                        {/* Left side info */}
                        <div>
                            <span className="text-luxury-blue text-xs font-bold tracking-[0.2em] uppercase mb-4 block">Send a Message</span>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                                We Read Every Message
                            </h2>
                            <p className="text-luxury-muted leading-relaxed mb-8">
                                Fill out the form and our team will respond within 24 hours. For urgent hotel matters or emergency assistance during a stay, please call our 24/7 helpline directly.
                            </p>

                            <div className="space-y-4">
                                {['Booking inquiries & special requests', 'Cancellation & refund assistance', 'Feedback, suggestions & complaints', 'Corporate & event planning queries'].map((item) => (
                                    <div key={item} className="flex items-center gap-3 text-luxury-muted text-sm">
                                        <CheckCircle className="w-4 h-4 text-luxury-blue shrink-0" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 bg-[#1A2235] border border-luxury-border rounded-xl p-5">
                                <p className="text-white font-semibold mb-1">Emergency Assistance</p>
                                <p className="text-luxury-muted text-sm">For urgent matters during an active stay, call <span className="text-luxury-blue font-medium">+1 800-LUXE-STAY</span> — available 24/7.</p>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="bg-[#1A2235] border border-luxury-border rounded-2xl p-8">
                            {success ? (
                                <div className="text-center py-12">
                                    <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-5" />
                                    <h3 className="text-xl font-bold text-white mb-3">Message Sent!</h3>
                                    <p className="text-luxury-muted mb-6">Thank you for reaching out. Our team will get back to you within 24 hours.</p>
                                    <button
                                        onClick={() => setSuccess(false)}
                                        className="px-6 py-2 bg-luxury-blue text-white rounded hover:bg-luxury-blue-hover transition-colors text-sm"
                                    >
                                        Send Another Message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-medium text-luxury-muted uppercase tracking-widest mb-2">Full Name *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={form.name}
                                                onChange={handleChange}
                                                required
                                                placeholder="Your full name"
                                                className="w-full bg-luxury-dark border border-luxury-border rounded-lg px-4 py-3 text-sm text-white placeholder:text-luxury-muted focus:outline-none focus:border-luxury-blue transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-luxury-muted uppercase tracking-widest mb-2">Email Address *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={form.email}
                                                onChange={handleChange}
                                                required
                                                placeholder="you@example.com"
                                                className="w-full bg-luxury-dark border border-luxury-border rounded-lg px-4 py-3 text-sm text-white placeholder:text-luxury-muted focus:outline-none focus:border-luxury-blue transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-luxury-muted uppercase tracking-widest mb-2">Subject *</label>
                                        <select
                                            name="subject"
                                            value={form.subject}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-luxury-dark border border-luxury-border rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-luxury-blue transition-colors"
                                        >
                                            <option value="">Select a subject</option>
                                            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-luxury-muted uppercase tracking-widest mb-2">Message *</label>
                                        <textarea
                                            name="message"
                                            value={form.message}
                                            onChange={handleChange}
                                            required
                                            rows={5}
                                            placeholder="Describe your inquiry in detail..."
                                            className="w-full bg-luxury-dark border border-luxury-border rounded-lg px-4 py-3 text-sm text-white placeholder:text-luxury-muted focus:outline-none focus:border-luxury-blue transition-colors resize-none"
                                        />
                                    </div>

                                    {error && (
                                        <p className="text-rose-400 text-sm bg-rose-400/10 border border-rose-400/20 rounded-lg px-4 py-3">{error}</p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 bg-luxury-blue text-white font-medium rounded-lg hover:bg-luxury-blue-hover disabled:opacity-60 transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(30,64,175,0.3)]"
                                    >
                                        {loading ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default ContactPage;





