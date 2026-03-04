import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FileText, Shield, RefreshCw, HelpCircle, ChevronDown, ChevronRight, Search, MessageCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// ─── Content ─────────────────────────────────────────────────────────────────

const sections = [
    {
        id: 'terms',
        icon: FileText,
        label: 'Terms & Conditions',
        lastUpdated: 'January 15, 2024',
        color: 'text-luxury-gold',
        bg: 'bg-[#D4AF37]/10',
        content: () => (
            <div className="space-y-8">
                <div>
                    <h3 className="text-white font-semibold text-lg mb-3">1. Acceptance of Terms</h3>
                    <p className="text-luxury-muted text-sm leading-relaxed">By accessing or using LuxeStay Hotels & Resorts services — including our website, mobile application, and on-property facilities — you agree to be bound by these Terms & Conditions. If you do not agree, please refrain from using our services.</p>
                </div>
                <div>
                    <h3 className="text-white font-semibold text-lg mb-3">2. Booking & Reservations</h3>
                    <p className="text-luxury-muted text-sm leading-relaxed">All reservations are subject to availability and confirmation by LuxeStay. A valid government-issued ID and a credit/debit card are required at check-in. LuxeStay reserves the right to deny service to guests who violate property policies.</p>
                </div>
                <div>
                    <h3 className="text-white font-semibold text-lg mb-3">3. Guest Responsibilities</h3>
                    <p className="text-luxury-muted text-sm leading-relaxed">Guests are responsible for the behavior of all members in their party. Any damage to hotel property caused by guests will be billed to the registered credit card. Illegal activities on hotel premises will result in immediate removal and reporting to authorities.</p>
                </div>
                <div>
                    <h3 className="text-white font-semibold text-lg mb-3">4. Intellectual Property</h3>
                    <p className="text-luxury-muted text-sm leading-relaxed">All content on the LuxeStay website — including images, logos, text, and design elements — is the exclusive intellectual property of LuxeStay Hotels & Resorts and may not be reproduced without written consent.</p>
                </div>
                <div>
                    <h3 className="text-white font-semibold text-lg mb-3">5. Limitation of Liability</h3>
                    <p className="text-luxury-muted text-sm leading-relaxed">LuxeStay is not liable for indirect, incidental, or consequential damages arising from the use of our services. Our total liability shall not exceed the amount paid for the booking in question.</p>
                </div>
                <div>
                    <h3 className="text-white font-semibold text-lg mb-3">6. Governing Law</h3>
                    <p className="text-luxury-muted text-sm leading-relaxed">These terms are governed by the laws of Switzerland. Any disputes shall be subject to the exclusive jurisdiction of the courts of Geneva, Switzerland.</p>
                </div>
            </div>
        ),
    },
    {
        id: 'privacy',
        icon: Shield,
        label: 'Privacy Policy',
        lastUpdated: 'January 15, 2024',
        color: 'text-emerald-400',
        bg: 'bg-emerald-400/10',
        content: () => (
            <div className="space-y-8">
                <div>
                    <h3 className="text-white font-semibold text-lg mb-3">1. Information We Collect</h3>
                    <p className="text-luxury-muted text-sm leading-relaxed">We collect personal information you provide directly, including name, email, phone number, payment details, and stay preferences. We also collect technical data such as IP addresses, browser type, and usage patterns through cookies and analytics tools.</p>
                </div>
                <div>
                    <h3 className="text-white font-semibold text-lg mb-3">2. How We Use Your Information</h3>
                    <ul className="space-y-2 text-luxury-muted text-sm">
                        {['Process and manage your bookings and reservations', 'Send booking confirmations, receipts, and service updates', 'Personalize your experience and offer tailored recommendations', 'Improve our website, app, and services through analytics', 'Communicate exclusive offers via email (with your consent)', 'Comply with legal and regulatory obligations'].map(item => (
                            <li key={item} className="flex items-start gap-2"><span className="text-emerald-400 mt-1">•</span><span>{item}</span></li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3 className="text-white font-semibold text-lg mb-3">3. Data Sharing</h3>
                    <p className="text-luxury-muted text-sm leading-relaxed">We never sell your personal data. We may share information with trusted service providers (payment processors, analytics tools) strictly for operational purposes under data processing agreements. We may disclose data if required by law.</p>
                </div>
                <div>
                    <h3 className="text-white font-semibold text-lg mb-3">4. Cookies</h3>
                    <p className="text-luxury-muted text-sm leading-relaxed">We use essential cookies for site functionality and optional analytics cookies to understand user behavior. You may control cookie preferences through your browser settings. Disabling essential cookies may impact site functionality.</p>
                </div>
                <div>
                    <h3 className="text-white font-semibold text-lg mb-3">5. Data Retention & Your Rights</h3>
                    <p className="text-luxury-muted text-sm leading-relaxed">We retain personal data only as long as necessary for the purposes described. You have the right to access, correct, or request deletion of your data. To exercise these rights, contact us at <span className="text-luxury-blue">privacy@luxestay.com</span>.</p>
                </div>
                <div>
                    <h3 className="text-white font-semibold text-lg mb-3">6. Security</h3>
                    <p className="text-luxury-muted text-sm leading-relaxed">We implement industry-standard security measures including SSL encryption, secure payment gateways, and regular security audits to protect your information from unauthorized access or disclosure.</p>
                </div>
            </div>
        ),
    },
    {
        id: 'cancellation',
        icon: RefreshCw,
        label: 'Cancellation & Refunds',
        lastUpdated: 'October 24, 2023',
        color: 'text-amber-400',
        bg: 'bg-amber-400/10',
        content: () => (
            <div className="space-y-8">
                <div>
                    <h3 className="text-white font-semibold text-lg mb-5">Refund Tiers</h3>
                    <div className="overflow-x-auto rounded-xl border border-luxury-border">
                        <table className="w-full text-sm">
                            <thead className="bg-[#1A2235] border-b border-luxury-border">
                                <tr>
                                    <th className="text-left text-luxury-muted px-5 py-3 font-medium text-xs uppercase tracking-wider">Cancellation Window</th>
                                    <th className="text-left text-luxury-muted px-5 py-3 font-medium text-xs uppercase tracking-wider">Refund Amount</th>
                                    <th className="text-left text-luxury-muted px-5 py-3 font-medium text-xs uppercase tracking-wider">Processing Fee</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-luxury-border">
                                <tr className="hover:bg-white/2 transition-colors">
                                    <td className="px-5 py-4"><p className="text-white font-medium">Standard Early Notice</p><p className="text-luxury-muted text-xs mt-0.5">More than 14 days before check-in</p></td>
                                    <td className="px-5 py-4"><span className="px-2.5 py-1 bg-emerald-400/10 text-emerald-400 rounded text-xs font-medium">100% Refund</span></td>
                                    <td className="px-5 py-4 text-luxury-muted">No admin fee</td>
                                </tr>
                                <tr className="hover:bg-white/2 transition-colors">
                                    <td className="px-5 py-4"><p className="text-white font-medium">Standard Notice</p><p className="text-luxury-muted text-xs mt-0.5">7 – 14 days before check-in</p></td>
                                    <td className="px-5 py-4"><span className="px-2.5 py-1 bg-amber-400/10 text-amber-400 rounded text-xs font-medium">50% Refund</span></td>
                                    <td className="px-5 py-4 text-luxury-muted">10% of total booking</td>
                                </tr>
                                <tr className="hover:bg-white/2 transition-colors">
                                    <td className="px-5 py-4"><p className="text-white font-medium">Late Notice</p><p className="text-luxury-muted text-xs mt-0.5">Less than 7 days before check-in</p></td>
                                    <td className="px-5 py-4"><span className="px-2.5 py-1 bg-rose-400/10 text-rose-400 rounded text-xs font-medium">Non-Refundable</span></td>
                                    <td className="px-5 py-4 text-luxury-muted">Full stay charge</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div>
                    <h3 className="text-white font-semibold text-lg mb-3">How to Request a Cancellation</h3>
                    <p className="text-luxury-muted text-sm leading-relaxed">Log in to your User Dashboard, navigate to "My Bookings," and select the reservation you wish to cancel. Click "Cancel Booking" and confirm. Refunds are automatically calculated based on the policy tiers above and processed to your original payment method within 5–10 business days.</p>
                </div>
                <div>
                    <h3 className="text-white font-semibold text-lg mb-3">Exceptional Circumstances</h3>
                    <p className="text-luxury-muted text-sm leading-relaxed">In cases of documented medical emergencies, natural disasters, or travel advisories, LuxeStay may offer full refunds or date changes regardless of the standard policy. Please contact our support team with relevant documentation.</p>
                </div>
                <div className="bg-luxury-blue/10 border border-luxury-blue/20 rounded-xl p-5 flex gap-4">
                    <Shield className="w-5 h-5 text-luxury-blue shrink-0 mt-0.5" />
                    <div>
                        <p className="text-white font-semibold mb-1">Our Guest Guarantee</p>
                        <p className="text-luxury-muted text-sm">We strive for 100% transparency. If you find any discrepancies between our policy and your experience, contact our Guest Relations team at <span className="text-luxury-blue">support@luxestay.com</span> for individual review.</p>
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: 'faqs',
        icon: HelpCircle,
        label: 'FAQs',
        lastUpdated: null,
        color: 'text-purple-400',
        bg: 'bg-purple-400/10',
        content: () => {
            const faqs = [
                { q: 'How do I make a booking?', a: 'Visit our "Explore Rooms" page, select your preferred room and location, choose your dates, and proceed to checkout. You will need to be logged in to complete a booking.' },
                { q: 'Can I modify my booking after confirmation?', a: 'Yes. Log in to your User Dashboard, go to "My Bookings," and select the booking you wish to modify. Date changes are subject to availability and may result in price adjustments.' },
                { q: 'How do I request a refund?', a: 'Cancellations and refunds are processed from your User Dashboard under "My Bookings." Refunds are calculated automatically per our Cancellation & Refund Policy and credited within 5–10 business days.' },
                { q: 'Are \'Non-Refundable\' bookings truly final?', a: 'Generally, yes. However, in cases of documented emergencies or medical situations, please contact our support team for individual review. Our Guest Relations team is authorized to make exceptions.' },
                { q: 'How do I pre-book meals or services?', a: 'You can pre-book meals during the room reservation process, or from your User Dashboard under "Services." You can also request spa, transport, and concierge services from the dashboard.' },
                { q: 'Is my payment information secure?', a: 'Absolutely. All transactions are processed through industry-standard encrypted payment gateways. LuxeStay never stores your full card details on our servers.' },
                { q: 'How can I submit a review?', a: 'After your checkout is marked as completed, you can submit a review from your User Dashboard under the "Reviews" section. Only verified stays are eligible to prevent fraudulent reviews.' },
                { q: 'What is the LuxeStay Loyalty Program?', a: 'Our Loyalty Program rewards repeat guests with exclusive discounts, room upgrades, and priority check-in. Points are earned automatically with every booking and can be redeemed on future stays.' },
                { q: 'How do I contact LuxeStay support?', a: 'You can reach us via email at support@luxestay.com, call us at +1 800-LUXE-STAY, or use our Contact Us page to submit a message. We respond within 24 hours.' },
            ];

            const [open, setOpen] = useState(null);
            return (
                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <div key={i} className={`border rounded-xl transition-colors ${open === i ? 'border-luxury-blue/40 bg-luxury-blue/5' : 'border-luxury-border bg-[#1A2235] hover:border-luxury-blue/20'}`}>
                            <button
                                className="w-full flex items-center justify-between px-5 py-4 text-left"
                                onClick={() => setOpen(open === i ? null : i)}
                            >
                                <span className="text-white font-medium text-sm pr-4">{faq.q}</span>
                                <ChevronDown className={`w-4 h-4 text-luxury-muted shrink-0 transition-transform duration-300 ${open === i ? 'rotate-180 text-luxury-blue' : ''}`} />
                            </button>
                            {open === i && (
                                <div className="px-5 pb-4">
                                    <p className="text-luxury-muted text-sm leading-relaxed">{faq.a}</p>
                                </div>
                            )}
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
        <div className="min-h-screen bg-luxury-dark text-luxury-text">
            <Navbar />

            <div className="pt-20 flex min-h-screen">
                {/* Sidebar */}
                <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 border-r border-luxury-border bg-[#0f1115] sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
                    <div className="p-5 border-b border-luxury-border">
                        <p className="text-luxury-muted text-xs uppercase tracking-widest font-medium mb-4">Resource Center</p>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-luxury-muted" />
                            <input
                                type="text"
                                placeholder="Search policies..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full bg-luxury-dark border border-luxury-border rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder:text-luxury-muted focus:outline-none focus:border-luxury-blue transition-colors"
                            />
                        </div>
                    </div>

                    <nav className="p-3 flex-1 space-y-1">
                        {sections.map((sec) => (
                            <button
                                key={sec.id}
                                onClick={() => handleNav(sec.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all duration-200 ${activeId === sec.id
                                        ? 'bg-luxury-blue text-white font-medium'
                                        : 'text-luxury-muted hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <sec.icon className="w-4 h-4 shrink-0" />
                                {sec.label}
                            </button>
                        ))}
                    </nav>

                    {/* Need Help? */}
                    <div className="m-4 p-4 bg-luxury-dark border border-luxury-border rounded-xl">
                        <p className="text-white font-semibold text-sm mb-1">Need Help?</p>
                        <p className="text-luxury-muted text-xs mb-4 leading-relaxed">Our dedicated support team is available 24/7 for emergency booking changes.</p>
                        <Link
                            to="/contact"
                            className="w-full py-2 bg-[#1A2235] border border-luxury-border text-white text-xs font-medium rounded-lg flex items-center justify-center gap-2 hover:border-luxury-blue/40 transition-colors"
                        >
                            <MessageCircle className="w-3.5 h-3.5" />
                            Contact Support
                        </Link>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    {/* Mobile section tabs */}
                    <div className="lg:hidden border-b border-luxury-border overflow-x-auto">
                        <div className="flex gap-1 p-3">
                            {sections.map((sec) => (
                                <button
                                    key={sec.id}
                                    onClick={() => handleNav(sec.id)}
                                    className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeId === sec.id ? 'bg-luxury-blue text-white' : 'text-luxury-muted hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {sec.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 max-w-3xl">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-luxury-muted text-xs mb-6">
                            <span>Home</span><ChevronRight className="w-3 h-3" /><span className="text-luxury-blue">{active.label}</span>
                        </div>

                        {/* Header */}
                        {active.lastUpdated && (
                            <p className="flex items-center gap-1.5 text-luxury-blue text-xs font-medium uppercase tracking-widest mb-4">
                                <span className="w-1.5 h-1.5 rounded-full bg-luxury-blue inline-block" />
                                Last Updated, {active.lastUpdated}
                            </p>
                        )}
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{active.label}</h1>
                        <p className="text-luxury-muted text-sm leading-relaxed mb-10 pb-8 border-b border-luxury-border">
                            {activeId === 'terms' && 'Please read these terms carefully before using LuxeStay services. By proceeding, you agree to be bound by these terms.'}
                            {activeId === 'privacy' && 'At LuxeStay Hotels, we are committed to protecting your privacy and handling your personal data with the utmost care and transparency.'}
                            {activeId === 'cancellation' && 'At LuxeStay Hotels, we understand that plans can change. Our goal is to provide a transparent and fair cancellation process for all our global guests.'}
                            {activeId === 'faqs' && 'Find answers to the most frequently asked questions about bookings, policies, services, and more.'}
                        </p>

                        <ContentComponent />
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
};

export default PolicyPage;




