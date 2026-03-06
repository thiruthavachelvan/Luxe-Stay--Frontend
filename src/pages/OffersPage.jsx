import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Crown, Medal, Star, Gem, CreditCard, Tag, Check, ChevronRight,
    Sparkles, Zap, Gift, BadgePercent, Calendar, ArrowRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MEMBERSHIP_TIERS = [
    {
        id: 'Silver',
        icon: Medal,
        color: 'from-gray-300 to-gray-500',
        glow: 'rgba(156,163,175,0.3)',
        border: 'border-gray-400/30',
        price: 2999,
        badge: '🥈',
        tagline: 'Your gateway to luxury',
        benefits: [
            '5% off all room bookings',
            'Priority check-in at all properties',
            'Welcome drink on every arrival',
            'Access to member newsletter & deals',
        ],
    },
    {
        id: 'Gold',
        icon: Star,
        color: 'from-[#D4AF37] to-yellow-600',
        glow: 'rgba(212,175,55,0.35)',
        border: 'border-[#D4AF37]/40',
        price: 5999,
        badge: '🥇',
        tagline: 'Elevate every stay',
        popular: true,
        benefits: [
            '10% off bookings & dining',
            'Exclusive lounge access at all locations',
            'Late checkout (up to 2 PM)',
            'Complimentary breakfast (1 day/stay)',
            'Early room selection',
        ],
    },
    {
        id: 'Platinum',
        icon: Gem,
        color: 'from-blue-400 to-purple-500',
        glow: 'rgba(96,165,250,0.3)',
        border: 'border-luxury-gold/40',
        price: 9999,
        badge: '💎',
        tagline: 'Curated excellence at every step',
        benefits: [
            '15% off all hotel services',
            'Spa credits worth ₹2,000/stay',
            'Complimentary room upgrades (availability)',
            'Free breakfast for 3 days/stay',
            'Airport pickup service',
            'Dedicated concierge line',
        ],
    },
    {
        id: 'Diamond',
        icon: Crown,
        color: 'from-cyan-300 to-yellow-600',
        glow: 'rgba(34,211,238,0.3)',
        border: 'border-cyan-400/40',
        price: 19999,
        badge: '👑',
        tagline: 'Because only the best will do',
        benefits: [
            '20% off all services',
            'Personal butler service during stay',
            'Round-trip airport transfers',
            'Free breakfast for full stay duration',
            'Dedicated 24/7 concierge hotline',
            'Guaranteed suite upgrade on availability',
        ],
    },
    {
        id: 'Black Card',
        icon: CreditCard,
        color: 'from-gray-900 to-black',
        glow: 'rgba(212,175,55,0.5)',
        border: 'border-[#D4AF37]/60',
        price: 49999,
        badge: '⬛',
        tagline: 'The pinnacle of prestige — for those who accept nothing less',
        elite: true,
        benefits: [
            '30% off all services across all properties',
            'Personal concierge available 24/7/365',
            'Exclusive invitations to private events',
            'Unlimited room category upgrades',
            'Complimentary all meals (entire stay)',
            'Private chauffeur transfers anywhere in city',
            'Dedicated relationship manager',
        ],
    },
];

const DEFAULT_SEASONAL_OFFERS = [
    {
        title: 'Monsoon Retreat',
        subtitle: 'SPA SPECIAL',
        description: 'Experience the magic of rains with 20% off on all spa-connected suites.',
        discount: '20% OFF',
        tag: 'Limited Time',
        color: 'from-blue-900/60 to-[#0F1626]',
        image: 'https://images.unsplash.com/photo-1544124499-58912cbddaa3?auto=format&fit=crop&q=80',
        code: 'MONSOON20',
        roomTypeFilter: 'Spa-connected Suite'
    },
    {
        title: 'Honeymoon Bliss',
        subtitle: 'Couples Special',
        description: 'A curated romance package with a private pool suite, sunset dinner, and couple spa sessions.',
        discount: '₹5,000 OFF',
        tag: 'Most Popular',
        color: 'from-rose-900/60 to-[#0F1626]',
        image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&q=80&w=800',
        code: 'HONEYMOON25',
        roomTypeFilter: 'Private Pool Room'
    },
    {
        title: 'Corporate Excellence Rate',
        subtitle: 'Business Travellers',
        description: 'Extended stay rates with high-speed workspace, meeting room credits, daily breakfast, and priority booking across all properties.',
        discount: '15% OFF',
        tag: 'Business',
        color: 'from-gray-900/60 to-[#0F1626]',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800',
        code: 'CORP15',
        roomTypeFilter: 'Executive Room'
    },
];

// Reusable gold label with flanking lines
const GoldLabel = ({ children, center }) => (
    <div className={`flex items-center gap-4 mb-6 ${center ? 'justify-center' : ''}`}>
        <div className="h-[1px] w-12 bg-gold-500/30" />
        <span className="text-[10px] font-black text-gold-500 uppercase tracking-[0.5em] italic">{children}</span>
        <div className="h-[1px] w-12 bg-gold-500/30" />
    </div>
);

const OffersPage = () => {
    const navigate = useNavigate();
    const [hoveredTier, setHoveredTier] = useState(null);
    const [seasonalOffers, setSeasonalOffers] = useState(DEFAULT_SEASONAL_OFFERS);

    useEffect(() => {
        fetch(`${__API_BASE__}/api/public/coupons/featured`)
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    const mapped = data.map(c => ({
                        title: c.featuredTitle || c.code,
                        subtitle: c.featuredSubtitle || '',
                        description: c.featuredDescription || c.description,
                        discount: c.discountType === 'percent' ? `${c.discountValue}% OFF` : `₹${Number(c.discountValue).toLocaleString('en-IN')} OFF`,
                        tag: c.featuredTag || 'Special Offer',
                        color: c.featuredColor || 'from-blue-900/60 to-navy-950',
                        image: c.featuredImage || 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=800',
                        code: c.code,
                        roomTypeFilter: ''
                    }));
                    setSeasonalOffers(mapped);
                }
            })
            .catch(() => { }); // Silently fall back to defaults on error
    }, []);

    useEffect(() => {
        const syncUser = () => {
            const stored = sessionStorage.getItem('userData');
            setUser((stored && stored !== 'undefined') ? JSON.parse(stored) : null);
        };
        const handleGlobalLogout = (e) => {
            if (e.key === 'luxe-stay-logout') {
                sessionStorage.removeItem('userToken');
                sessionStorage.removeItem('userData');
                setUser(null);
            }
        };
        window.addEventListener('focus', syncUser);
        window.addEventListener('storage', handleGlobalLogout);
        return () => {
            window.removeEventListener('focus', syncUser);
            window.removeEventListener('storage', handleGlobalLogout);
        };
    }, []);

    const handleBuyMembership = (tier) => {
        const userData = sessionStorage.getItem('userData');
        if (!userData) {
            navigate('/login?redirect=/offers');
        } else {
            navigate('/dashboard', { state: { section: 'membership', selectedTier: tier } });
        }
    };

    const handleBookOffer = (offer) => {
        const destUrl = `/rooms?offerCode=${offer.code}&roomType=${encodeURIComponent(offer.roomTypeFilter)}`;
        navigate(destUrl);
    };

    return (
        <div className="min-h-screen bg-navy-950 text-white font-sans selection:bg-gold-400 selection:text-navy-950">
            <Navbar />

            {/* ── Hero Banner ── */}
            <section className="relative pt-48 pb-32 overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=1920"
                        alt="Luxury"
                        className="w-full h-full object-cover opacity-20 scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-950/40 to-navy-950" />
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gold-400/5 rounded-full blur-[120px] animate-pulse pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gold-500/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="container mx-auto px-6 text-center relative z-10 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <GoldLabel center>Exclusive Benefits</GoldLabel>
                        <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 tracking-tighter">
                            Offers & <br />
                            <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-yellow-200 to-gold-500 underline decoration-gold-500/10 underline-offset-[20px]">Memberships</span>
                        </h1>
                        <p className="text-white/40 max-w-2xl mx-auto text-lg font-serif italic leading-relaxed">
                            Unlock a world of privilege. From seasonal deals to lifetime memberships — we reward the discerning traveller with unparalleled sophistication.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="flex flex-wrap items-center justify-center gap-10 pt-12 text-[10px] font-black text-gold-500/40 uppercase tracking-[0.4em] italic"
                    >
                        <div className="flex items-center gap-3"><Check className="w-4 h-4 text-gold-400" /> Instant Activation</div>
                        <div className="flex items-center gap-3"><Check className="w-4 h-4 text-gold-400" /> Valid at All Properties</div>
                        <div className="flex items-center gap-3"><Check className="w-4 h-4 text-gold-400" /> 12 Month Validity</div>
                    </motion.div>
                </div>
            </section>

            {/* ── Membership Tiers ── */}
            <section className="py-32 relative overflow-hidden bg-navy-900/20">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-24">
                        <GoldLabel center>Membership Tiers</GoldLabel>
                        <h2 className="text-4xl md:text-6xl font-bold text-white font-serif italic tracking-tight">
                            Choose Your Privilege
                        </h2>
                        <div className="w-24 h-[1px] bg-gold-500/20 mx-auto mt-8 mb-6"></div>
                        <p className="text-gold-500/40 text-sm font-serif italic tracking-widest max-w-xl mx-auto uppercase">
                            Exclusive monthly rewards transmitted directly to your registry.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
                        {MEMBERSHIP_TIERS.map((tier) => {
                            const Icon = tier.icon;
                            const isHovered = hoveredTier === tier.id;
                            return (
                                <div
                                    key={tier.id}
                                    onMouseEnter={() => setHoveredTier(tier.id)}
                                    onMouseLeave={() => setHoveredTier(null)}
                                    className={`relative group rounded-2xl border ${tier.border} bg-[#172036] overflow-hidden transition-all duration-500 flex flex-col
                                        ${tier.elite ? 'ring-1 ring-[#D4AF37]/30' : ''}
                                        ${isHovered ? 'scale-[1.03] shadow-2xl' : ''}
                                    `}
                                    style={{ boxShadow: isHovered ? `0 20px 60px ${tier.glow}` : undefined }}
                                >
                                    {tier.popular && (
                                        <div className="absolute top-3 right-3 bg-[#D4AF37] text-[#0F1626] text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full z-10">
                                            Most Popular
                                        </div>
                                    )}
                                    {tier.elite && (
                                        <div className="absolute top-3 right-3 bg-gradient-to-r from-[#D4AF37] to-yellow-500 text-[#0F1626] text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full z-10">
                                            Elite
                                        </div>
                                    )}

                                    {/* Gradient top bar */}
                                    <div className={`h-1.5 bg-gradient-to-r ${tier.color}`} />

                                    <div className="p-6 flex flex-col flex-1">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4`}
                                            style={{ boxShadow: `0 0 20px ${tier.glow}` }}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>

                                        <h3 className="text-lg font-bold text-white mb-1">{tier.badge} {tier.id}</h3>
                                        <p className="text-white/40 text-xs mb-4 italic">{tier.tagline}</p>

                                        <div className="mb-4">
                                            <span className="text-2xl font-bold text-white">₹{tier.price.toLocaleString('en-IN')}</span>
                                            <span className="text-white/40 text-xs ml-1">/year</span>
                                        </div>

                                        <ul className="space-y-2 mb-6 flex-1">
                                            {tier.benefits.map((b, i) => (
                                                <li key={i} className="flex items-start gap-2 text-xs text-white/60">
                                                    <Check className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                                                    {b}
                                                </li>
                                            ))}
                                        </ul>

                                        <button
                                            onClick={() => handleBuyMembership(tier.id)}
                                            className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300
                                                ${tier.elite
                                                    ? 'bg-gradient-to-r from-[#D4AF37] to-yellow-500 text-[#0F1626] shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                                                    : 'bg-white/5 border border-white/10 text-white hover:bg-gradient-to-r hover:from-[#D4AF37] hover:to-yellow-500 hover:text-[#0F1626] hover:border-transparent'
                                                }`}
                                        >
                                            {tier.elite ? '✦ Get Black Card' : `Buy ${tier.id}`}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── Seasonal Offers ── */}
            <section className="py-20 bg-[#0A1020] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
                <div className="container mx-auto px-6">
                    <div className="text-center mb-14">
                        <GoldLabel center>Seasonal Deals</GoldLabel>
                        <h2 className="text-3xl md:text-5xl font-bold text-white">
                            Curated{' '}
                            <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-yellow-200 to-[#D4AF37]">Packages</span>
                        </h2>
                        <p className="text-white/40 text-sm mt-3 max-w-xl mx-auto">
                            Handpicked offers for every occasion — from romantic getaways to business retreats.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
                        {seasonalOffers.map((offer, i) => (
                            <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/5 hover:border-[#D4AF37]/30 transition-all duration-500 cursor-pointer shadow-xl hover:shadow-[0_20px_60px_rgba(212,175,55,0.1)]">
                                <div className="absolute inset-0">
                                    <img src={offer.image} alt={offer.title} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-700" />
                                    <div className={`absolute inset-0 bg-gradient-to-t ${offer.color}`} />
                                </div>
                                <div className="relative z-10 p-7 h-80 flex flex-col justify-end">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                                            {offer.tag}
                                        </span>
                                        <span className="text-white/40 text-[10px] uppercase tracking-widest">{offer.subtitle}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{offer.title}</h3>
                                    <p className="text-white/50 text-xs leading-relaxed mb-2">{offer.description}</p>
                                    {offer.code && (
                                        <div className="mb-3 inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 w-fit">
                                            <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest">Code:</span>
                                            <span className="text-white font-mono text-xs font-bold">{offer.code}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <span className="text-[#D4AF37] text-lg font-bold">{offer.discount}</span>
                                        <button
                                            onClick={() => handleBookOffer(offer)}
                                            className="flex items-center gap-1.5 text-xs font-bold text-white/60 group-hover:text-[#D4AF37] transition-colors uppercase tracking-widest"
                                        >
                                            Book Now <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Coupon Code Section ── */}
            <section className="py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/5 via-transparent to-blue-500/5 pointer-events-none" />
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto text-center">
                        <GoldLabel center>Coupon Codes</GoldLabel>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Have a Code?{' '}
                            <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-yellow-200 to-[#D4AF37]">Save More</span>
                        </h2>
                        <p className="text-white/50 text-sm mb-10 font-light">
                            LuxeStays members receive exclusive coupon codes every month. Apply them on the payment page before confirming your booking for instant savings.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            {[
                                { icon: Tag, label: 'Where to apply', desc: 'Enter your code in the "Coupon Code" field on the payment page — just before you confirm your booking.', color: 'text-[#D4AF37]' },
                                { icon: BadgePercent, label: 'What you save', desc: 'Coupons offer either a flat ₹ discount or a percentage off your total booking amount — applied instantly.', color: 'text-luxury-gold' },
                                { icon: Gift, label: 'How to get codes', desc: 'Buy a membership to get monthly exclusive codes. Seasonal codes are also shared via our newsletter.', color: 'text-purple-400' },
                            ].map((item, i) => {
                                const Icon = item.icon;
                                return (
                                    <div key={i} className="bg-[#172036] border border-white/5 rounded-2xl p-6 text-left hover:border-[#D4AF37]/20 transition-colors">
                                        <Icon className={`w-6 h-6 ${item.color} mb-4`} />
                                        <h4 className="text-sm font-bold text-white mb-2">{item.label}</h4>
                                        <p className="text-white/40 text-xs leading-relaxed">{item.desc}</p>
                                    </div>
                                );
                            })}
                        </div>

                        <Link
                            to="/rooms"
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#D4AF37] to-yellow-500 text-[#0F1626] rounded-full font-bold text-sm uppercase tracking-widest hover:shadow-[0_8px_25px_rgba(212,175,55,0.4)] hover:scale-[1.02] transition-all shadow-lg"
                        >
                            Browse Rooms & Apply Code
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default OffersPage;





