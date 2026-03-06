import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Shield, RefreshCw, HelpCircle, ChevronDown, ChevronRight, Search, MessageCircle, Gavel, Eye, CreditCard } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// ─── Content ─────────────────────────────────────────────────────────────────

const sections = [
    {
        id: 'terms',
        icon: Gavel,
        label: 'Terms of Service',
        lastUpdated: 'January 15, 2024',
        color: 'text-gold-500',
        bg: 'bg-gold-500/10',
        description: 'The legal framework governing our mutual relationship and service protocols.',
        content: () => (
            <div className="space-y-8 font-light">
                <div className="group">
                    <h3 className="text-gold-400 font-serif italic text-xl mb-3 group-hover:text-gold-300 transition-colors">1. Acceptance of Mandate</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">By accessing the LuxeStay Registry or utilizing our elite hospitality services, you formally acknowledge and accept these Terms & Conditions. This constitutes a binding agreement between the Guest and the LuxeStay Command.</p>
                </div>
                <div>
                    <h3 className="text-gold-400 font-serif italic text-xl mb-3">2. Registry & Reservations</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">All reservations are subject to status verification by the LuxeStay Concierge. Authenticated government credentials and a premium credit instrument are mandatory upon arrival. LuxeStay reserves the right to decline services to Maintain the integrity of our sanctuary.</p>
                </div>
                <div>
                    <h3 className="text-gold-400 font-serif italic text-xl mb-3">3. Code of Conduct</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">Guests are custodians of the sanctuary during their stay. Any compromise to the hotel's aesthetic or functional integrity will be rectified at the guest's expense. We maintain a zero-tolerance policy for disturbances of the peace.</p>
                </div>
                <div>
                    <h3 className="text-gold-400 font-serif italic text-xl mb-3">4. Intellectual Custodianship</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">The LuxeStay visual identity, including our digital interface and architecture, remains our exclusive intellectual domain. Unauthorized reproduction is strictly prohibited under international protocol.</p>
                </div>
                <div>
                    <h3 className="text-gold-400 font-serif italic text-xl mb-3">5. Jurisdictional Protocol</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">These statutes are governed by the sovereign laws of Switzerland. Any litigation shall be adjudicated within the exclusive jurisdiction of the Cantonal Courts of Geneva.</p>
                </div>
            </div>
        ),
    },
    {
        id: 'privacy',
        icon: Eye,
        label: 'Privacy Protocol',
        lastUpdated: 'February 01, 2024',
        color: 'text-gold-500',
        bg: 'bg-gold-500/10',
        description: 'How we safeguard your digital signature and personal stay data.',
        content: () => (
            <div className="space-y-8 font-light">
                <div>
                    <h3 className="text-gold-400 font-serif italic text-xl mb-3">1. Data Acquisition</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">We curate personal data necessary for exceptional service: biometric identifiers, financial instruments, and localized preferences. Our sensors also capture technical metadata to optimize your digital interface.</p>
                </div>
                <div>
                    <h3 className="text-gold-400 font-serif italic text-xl mb-3">2. Strategic Utilization</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-400 text-sm">
                        {['Secure Registry Management', 'Tailored Experience Mapping', 'Operational Analytics Integration', 'Encrypted Communication Uplinks'].map(item => (
                            <li key={item} className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
                                <Shield className="w-4 h-4 text-gold-500" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3 className="text-gold-400 font-serif italic text-xl mb-3">3. Confidentiality Shield</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">Your data is never mobilized for third-party commercial gain. Information is only disseminated to verified partners under strict NDA protocols to facilitate your stay requirements.</p>
                </div>
                <div>
                    <h3 className="text-gold-400 font-serif italic text-xl mb-3">4. Right to Erasure</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">Guests maintain the "Right to be Forgotten." Upon request, we will purge all non-essential data from our central servers, subject to legal retention mandates.</p>
                </div>
            </div>
        ),
    },
    {
        id: 'cancellation',
        icon: RefreshCw,
        label: 'Reversion Policy',
        lastUpdated: 'December 12, 2023',
        color: 'text-gold-500',
        bg: 'bg-gold-500/10',
        description: 'The methodology for reservation modifications and financial reversals.',
        content: () => (
            <div className="space-y-8">
                <div className="overflow-hidden rounded-2xl border border-white/10 glass-panel">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 border-b border-white/10">
                            <tr>
                                <th className="text-left text-gold-400 px-6 py-4 font-serif italic text-base">Timeline</th>
                                <th className="text-left text-gold-400 px-6 py-4 font-serif italic text-base">Reversal Rate</th>
                                <th className="text-left text-gold-400 px-6 py-4 font-serif italic text-base">Service Fee</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {[
                                { t: 'Advance Notice (> 14 Days)', r: '100% Reversal', f: 'None' },
                                { t: 'Standard Notice (7 - 14 Days)', r: '50% Reversal', f: '10% Admin' },
                                { t: 'Critical Notice (< 7 Days)', r: 'Finalized', f: 'Full Charge' }
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-5 text-gray-300 font-light">{row.t}</td>
                                    <td className="px-6 py-5">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${row.r.includes('100%') ? 'bg-emerald-500/10 text-emerald-400' : row.r.includes('50%') ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                            {row.r}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-gray-500 text-xs italic">{row.f}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-6 rounded-2xl border border-gold-500/20 bg-gold-500/5 flex gap-4">
                    <CreditCard className="w-6 h-6 text-gold-500 shrink-0" />
                    <div>
                        <h4 className="text-white font-serif italic text-lg mb-2">Electronic Reversal Protocol</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">To initiate a reversal, navigate to your Command Dashboard. Funds will be repatriated to your original credit instrument within 5–10 operational days.</p>
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: 'faqs',
        icon: HelpCircle,
        label: 'Inquiry Matrix',
        lastUpdated: null,
        color: 'text-gold-500',
        bg: 'bg-gold-500/10',
        description: 'Immediate resolutions for frequently encountered procedural queries.',
        content: () => {
            const faqs = [
                { q: 'How is the Registry authenticated?', a: 'Via our secure digital terminal. Once your identity is verified against our global database, your stay credentials will be activated.' },
                { q: 'Can I modify my stay duration?', a: 'Indeed. Access your Command Dashboard to adjust your temporal requirements, subject to sanctuary availability.' },
                { q: 'What is the refund protocol?', a: 'Refunds are executed automatically based on the Reversion Policy tiers and credited to your original instrument.' },
                { q: 'How do I access concierge services?', a: 'The digital concierge is available 24/7 through the "Services" module in your personal dashboard.' },
            ];

            const [open, setOpen] = useState(null);
            return (
                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div key={i} className={`overflow-hidden rounded-xl transition-all duration-300 border ${open === i ? 'border-gold-500/40 bg-gold-500/5' : 'border-white/10 bg-white/2 hover:border-white/20'}`}>
                            <button
                                className="w-full flex items-center justify-between px-6 py-5 text-left group"
                                onClick={() => setOpen(open === i ? null : i)}
                            >
                                <span className={`font-serif italic text-lg transition-colors ${open === i ? 'text-gold-400' : 'text-white group-hover:text-gold-200'}`}>
                                    {faq.q}
                                </span>
                                <ChevronDown className={`w-5 h-5 text-gold-500/50 transition-transform duration-500 ${open === i ? 'rotate-180 text-gold-500' : ''}`} />
                            </button>
                            <AnimatePresence>
                                {open === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="px-6 pb-6 text-gray-400 text-sm leading-relaxed border-t border-gold-500/10 pt-4">
                                            {faq.a}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            );
        },
    },
];

// ─── Page Component ───────────────────────────────────────────────────────────

const PolicyPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeId, setActiveId] = useState(searchParams.get('section') || 'terms');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const s = searchParams.get('section');
        if (s && sections.find(sec => sec.id === s)) setActiveId(s);
    }, [searchParams]);

    const handleNav = (id) => {
        setActiveId(id);
        setSearchParams({ section: id });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const active = sections.find(s => s.id === activeId);
    const ContentComponent = active.content;

    return (
        <div className="min-h-screen bg-navy-950 text-white selection:bg-gold-500/30">
            <Navbar />

            <div className="pt-24 flex min-h-screen">
                {/* Sidebar */}
                <aside className="hidden lg:flex flex-col w-72 xl:w-80 shrink-0 border-r border-white/10 bg-navy-900/50 backdrop-blur-xl sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto z-10">
                    <div className="p-6 border-b border-white/10 bg-navy-950/20">
                        <p className="text-gold-500 text-[10px] uppercase tracking-[0.3em] font-medium mb-5">Command Center / Legal</p>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-gold-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Locate protocol..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full bg-navy-950/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all"
                            />
                        </div>
                    </div>

                    <nav className="p-4 flex-1 space-y-2">
                        {sections.map((sec) => (
                            <button
                                key={sec.id}
                                onClick={() => handleNav(sec.id)}
                                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-all duration-300 group ${activeId === sec.id
                                    ? 'bg-gold-500/10 border border-gold-500/20 text-gold-400'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                                    }`}
                            >
                                <sec.icon className={`w-4 h-4 shrink-0 transition-transform duration-300 ${activeId === sec.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">{sec.label}</span>
                                    {activeId === sec.id && (
                                        <motion.span
                                            layoutId="active-indicator"
                                            className="text-[9px] text-gold-500/60 font-light truncate max-w-[150px]"
                                        >
                                            Operational Protocol Active
                                        </motion.span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </nav>

                    {/* Support Uplink */}
                    <div className="m-6 p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-navy-800 to-navy-950 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
                        <p className="text-white font-serif italic text-base mb-2 relative z-10">Direct Uplink</p>
                        <p className="text-gray-500 text-xs mb-5 leading-relaxed relative z-10">Our legal attachés are available for clarity on complex stay mandates.</p>
                        <Link
                            to="/contact"
                            className="w-full py-3 bg-gold-500 text-navy-950 text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gold-400 transition-all shadow-lg shadow-gold-500/10 relative z-10"
                        >
                            <MessageCircle className="w-4 h-4" />
                            Secure Channel
                        </Link>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0 bg-[#020617]">
                    {/* Mobile Navigation */}
                    <div className="lg:hidden border-b border-white/10 bg-navy-950/80 backdrop-blur-md sticky top-20 z-20">
                        <div className="flex flex-wrap justify-center gap-2 p-4">
                            {sections.map((sec) => (
                                <button
                                    key={sec.id}
                                    onClick={() => handleNav(sec.id)}
                                    className={`flex-shrink-0 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeId === sec.id
                                        ? 'bg-gold-500 text-navy-950 shadow-lg shadow-gold-500/20'
                                        : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    {sec.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <motion.div
                        key={activeId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="p-8 md:p-16 max-w-4xl"
                    >
                        {/* Header Section */}
                        <div className="mb-16 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-3 text-gold-500/60 text-[10px] uppercase tracking-[0.4em] mb-8">
                                <span className="italic">Architecture</span>
                                <ChevronRight className="w-3 h-3" />
                                <span className="text-gold-500 font-bold">{active.label}</span>
                            </div>

                            {active.lastUpdated && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex items-center justify-center md:justify-start gap-2 mb-6"
                                >
                                    <div className="flex gap-1">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-1 h-1 rounded-full bg-gold-500/40 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                                        ))}
                                    </div>
                                    <span className="text-gold-500/70 text-[10px] uppercase tracking-widest font-medium italic">Revision: {active.lastUpdated}</span>
                                </motion.div>
                            )}

                            <h1 className="text-4xl md:text-7xl font-serif italic text-white mb-6 leading-tight">
                                {active.label}
                            </h1>

                            <p className="text-gray-400 text-lg font-light leading-relaxed max-w-2xl mx-auto md:mx-0">
                                {active.description}
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="h-px w-full bg-gradient-to-r from-gold-500/30 via-gold-500/5 to-transparent mb-16" />

                        {/* Component Content */}
                        <div className="relative">
                            {/* Decorative background element */}
                            <div className="absolute -left-20 top-0 w-40 h-40 bg-gold-500/5 blur-[100px] rounded-full pointer-events-none" />
                            <ContentComponent />
                        </div>

                        {/* Footer Citation */}
                        <div className="mt-24 pt-8 border-t border-white/5 text-[10px] text-gray-600 uppercase tracking-widest flex flex-col md:flex-row justify-between items-center gap-4">
                            <span>LuxeStay Hotels & Resorts Global Compliance © 2024</span>
                            <div className="flex gap-6">
                                <span className="hover:text-gold-500 transition-colors pointer-events-auto cursor-help">Digital Signature: Verified</span>
                                <span className="hover:text-gold-500 transition-colors pointer-events-auto cursor-help">Encryption: AES-256</span>
                            </div>
                        </div>
                    </motion.div>
                </main>
            </div>

            <Footer />

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .glass-panel {
                    background: rgba(15, 23, 42, 0.4);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                }
            `}</style>
        </div>
    );
};

export default PolicyPage;





