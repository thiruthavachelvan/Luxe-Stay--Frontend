import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, User, Users, Info, ArrowRight, Tag, Sparkles } from 'lucide-react';
import { TIER_BENEFITS } from '../utils/membership';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ID_TYPES = ['Aadhaar Card', 'PAN Card', 'Passport', 'Driving License', 'Voter ID'];
const GENDERS = ['Male', 'Female', 'Other'];

const GuestDetailsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [bookingDetails, setBookingDetails] = useState(null);
    const [guestDetails, setGuestDetails] = useState([]);
    const [specialRequests, setSpecialRequests] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!location.state || !location.state.roomId) {
            navigate('/rooms');
        } else {
            setBookingDetails(location.state);
            const initialGuests = [];
            const adults = location.state.adults || 1;
            const children = location.state.children || 0;

            for (let i = 0; i < adults; i++) {
                initialGuests.push({
                    type: 'adult',
                    name: '',
                    age: '',
                    gender: '',
                    phone: '',
                    email: '',
                    idType: '',
                    idNumber: ''
                });
            }
            for (let i = 0; i < children; i++) {
                initialGuests.push({
                    type: 'child',
                    name: '',
                    age: '',
                    gender: ''
                });
            }
            setGuestDetails(initialGuests);
        }
    }, [location.state, navigate]);

    if (!bookingDetails) return null;

    const handleGuestChange = (index, field, value) => {
        const newDetails = [...guestDetails];
        newDetails[index][field] = value;
        setGuestDetails(newDetails);

        if (errors[`${index}-${field}`]) {
            setErrors(prev => ({ ...prev, [`${index}-${field}`]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        guestDetails.forEach((guest, i) => {
            if (!guest.name.trim()) newErrors[`${i}-name`] = 'Name is required';
            if (!guest.age) newErrors[`${i}-age`] = 'Age is required';
            if (!guest.gender) newErrors[`${i}-gender`] = 'Gender is required';

            if (guest.type === 'adult') {
                if (!guest.phone.trim()) newErrors[`${i}-phone`] = 'Phone is required';
                if (!guest.idType) newErrors[`${i}-idType`] = 'ID Type is required';
                if (!guest.idNumber.trim()) newErrors[`${i}-idNumber`] = 'ID Number is required';
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleContinue = (e) => {
        e.preventDefault();
        window.scrollTo(0, 0);
        if (validateForm()) {
            navigate('/payment', {
                state: {
                    ...bookingDetails,
                    guestDetails,
                    specialRequests
                }
            });
        }
    };

    const { room, checkIn, checkOut, nights, total } = bookingDetails;

    return (
        <div className="min-h-screen bg-navy-950 flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-32 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                {/* ── Breadcrumbs ── */}
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-4">
                    <span className="hover:text-gold-400 transition-colors cursor-pointer">Archive</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="hover:text-gold-400 transition-colors cursor-pointer" onClick={() => navigate(-1)}>Selection</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-gold-400">Patrons</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="">Secured Payment</span>
                </div>

                {/* ── Header ── */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em]">Patron Registration</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-serif italic text-white tracking-tight leading-tight">Who's checking in?</h1>
                    <p className="text-xs text-white/30 uppercase tracking-widest font-medium max-w-xl">Please formalize the credentials of all guests accompanying you on this journey.</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-16 items-start">
                    {/* ── Left Column: Forms ── */}
                    <div className="lg:col-span-2 space-y-10">
                        {guestDetails.map((guest, index) => (
                            <div key={index} className="glass-panel p-10 relative group overflow-hidden">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-gold-400/20 group-hover:bg-gold-400 transition-colors duration-700" />

                                <div className="flex items-center justify-between mb-10">
                                    <h3 className="text-xl font-serif italic text-white flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-white/40 group-hover:text-gold-400 transition-colors">
                                            {guest.type === 'adult' ? <User className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                                        </div>
                                        {guest.type === 'adult' ? `Adult ${index + 1}` : `Child ${index + 1 - bookingDetails.adults}`}
                                    </h3>
                                    {index === 0 && (
                                        <span className="text-[9px] font-black text-gold-400 uppercase tracking-[0.3em] px-4 py-1.5 bg-gold-400/10 border border-gold-400/20 rounded-full">
                                            Primary Patron
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3 md:col-span-2">
                                        <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-1">Full Legal Name</label>
                                        <input
                                            type="text"
                                            value={guest.name}
                                            onChange={(e) => handleGuestChange(index, 'name', e.target.value)}
                                            placeholder="As per official documentation"
                                            className={`w-full bg-white/5 border ${errors[`${index}-name`] ? 'border-rose-500/50' : 'border-white/10 hover:border-gold-400/30'} rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-gold-400/40 focus:bg-white/10 transition-all font-medium placeholder:text-white/10`}
                                        />
                                        {errors[`${index}-name`] && <p className="text-rose-400 text-[10px] font-black uppercase tracking-widest mt-2 ml-1">{errors[`${index}-name`]}</p>}
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-1">Age</label>
                                        <input
                                            type="number"
                                            value={guest.age}
                                            onChange={(e) => handleGuestChange(index, 'age', e.target.value)}
                                            placeholder="e.g. 35"
                                            className={`w-full bg-white/5 border ${errors[`${index}-age`] ? 'border-rose-500/50' : 'border-white/10 hover:border-gold-400/30'} rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-gold-400/40 focus:bg-white/10 transition-all font-medium placeholder:text-white/10`}
                                        />
                                        {errors[`${index}-age`] && <p className="text-rose-400 text-[10px] font-black uppercase tracking-widest mt-2 ml-1">{errors[`${index}-age`]}</p>}
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-1">Gender</label>
                                        <div className="relative">
                                            <select
                                                value={guest.gender}
                                                onChange={(e) => handleGuestChange(index, 'gender', e.target.value)}
                                                className={`w-full bg-white/5 border ${errors[`${index}-gender`] ? 'border-rose-500/50' : 'border-white/10 hover:border-gold-400/30'} rounded-2xl px-6 py-4 text-sm text-white/80 focus:outline-none focus:border-gold-400/40 focus:bg-white/10 transition-all appearance-none cursor-pointer font-bold`}
                                            >
                                                <option value="" disabled className="bg-navy-950">Select Orientation</option>
                                                {GENDERS.map(g => <option key={g} value={g} className="bg-navy-950">{g.toUpperCase()}</option>)}
                                            </select>
                                            <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 pointer-events-none rotate-90" />
                                        </div>
                                        {errors[`${index}-gender`] && <p className="text-rose-400 text-[10px] font-black uppercase tracking-widest mt-2 ml-1">{errors[`${index}-gender`]}</p>}
                                    </div>

                                    {guest.type === 'adult' && (
                                        <>
                                            <div className="space-y-3">
                                                <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-1">Direct Link (Phone)</label>
                                                <input
                                                    type="tel"
                                                    value={guest.phone}
                                                    onChange={(e) => handleGuestChange(index, 'phone', e.target.value)}
                                                    placeholder="+91"
                                                    className={`w-full bg-white/5 border ${errors[`${index}-phone`] ? 'border-rose-500/50' : 'border-white/10 hover:border-gold-400/30'} rounded-2xl px-6 py-4 text-sm text-white font-mono focus:outline-none focus:border-gold-400/40 focus:bg-white/10 transition-all placeholder:text-white/10`}
                                                />
                                                {errors[`${index}-phone`] && <p className="text-rose-400 text-[10px] font-black uppercase tracking-widest mt-2 ml-1">{errors[`${index}-phone`]}</p>}
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-1">Secure Email (Optional)</label>
                                                <input
                                                    type="email"
                                                    value={guest.email}
                                                    onChange={(e) => handleGuestChange(index, 'email', e.target.value)}
                                                    placeholder="guest@sanctuary.com"
                                                    className={`w-full bg-white/5 border border-white/10 hover:border-gold-400/30 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-gold-400/40 focus:bg-white/10 transition-all placeholder:text-white/10`}
                                                />
                                            </div>

                                            <div className="md:col-span-2 pt-6">
                                                <div className="p-4 bg-gold-400/5 border border-gold-400/10 rounded-2xl flex items-center gap-4">
                                                    <div className="w-8 h-8 rounded-lg bg-gold-400/10 flex items-center justify-center">
                                                        <Info className="w-4 h-4 text-gold-400" />
                                                    </div>
                                                    <span className="text-[9px] font-black text-gold-400/80 uppercase tracking-widest leading-relaxed">Official Government Verification is mandatory at the time of arrival.</span>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-1">Credential Type</label>
                                                <div className="relative">
                                                    <select
                                                        value={guest.idType}
                                                        onChange={(e) => handleGuestChange(index, 'idType', e.target.value)}
                                                        className={`w-full bg-white/5 border ${errors[`${index}-idType`] ? 'border-rose-500/50' : 'border-white/10 hover:border-gold-400/30'} rounded-2xl px-6 py-4 text-sm text-white/80 focus:outline-none focus:border-gold-400/40 focus:bg-white/10 transition-all appearance-none cursor-pointer font-bold`}
                                                    >
                                                        <option value="" disabled className="bg-navy-950">SELECT CREDENTIAL</option>
                                                        {ID_TYPES.map(id => <option key={id} value={id} className="bg-navy-950">{id.toUpperCase()}</option>)}
                                                    </select>
                                                    <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 pointer-events-none rotate-90" />
                                                </div>
                                                {errors[`${index}-idType`] && <p className="text-rose-400 text-[10px] font-black uppercase tracking-widest mt-2 ml-1">{errors[`${index}-idType`]}</p>}
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-1">Credential Identifier</label>
                                                <input
                                                    type="text"
                                                    value={guest.idNumber}
                                                    onChange={(e) => handleGuestChange(index, 'idNumber', e.target.value)}
                                                    placeholder={`Enter ${guest.idType || 'ID'} code`}
                                                    className={`w-full bg-white/5 border ${errors[`${index}-idNumber`] ? 'border-rose-500/50' : 'border-white/10 hover:border-gold-400/30'} rounded-2xl px-6 py-4 text-sm text-white font-mono uppercase focus:outline-none focus:border-gold-400/40 focus:bg-white/10 transition-all placeholder:text-white/10`}
                                                />
                                                {errors[`${index}-idNumber`] && <p className="text-rose-400 text-[10px] font-black uppercase tracking-widest mt-2 ml-1">{errors[`${index}-idNumber`]}</p>}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}

                        <div className="glass-panel p-10 space-y-8 relative overflow-hidden">
                            <h3 className="text-xl font-serif italic text-white flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-white/40">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                Bespoke Requirements
                            </h3>
                            <p className="text-[10px] text-white/30 uppercase tracking-widest leading-relaxed">Kindly detail any nuances—dietary protocols, anniversary commemorations, or sanctuary preferences—to personalize your stay.</p>
                            <textarea
                                value={specialRequests}
                                onChange={(e) => setSpecialRequests(e.target.value)}
                                placeholder="Describe your expectations..."
                                className="w-full bg-white/5 border border-white/10 hover:border-gold-400/30 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-gold-400/40 focus:bg-white/10 transition-all placeholder:text-white/10 min-h-[160px] resize-none font-medium"
                            ></textarea>
                            <p className="text-[9px] text-gold-400/40 font-black uppercase tracking-[0.2em] italic">* Manifestation of special requests is subject to sanctuary availability.</p>
                        </div>
                    </div>

                    {/* ── Right Column: Summary & CTA ── */}
                    <div className="lg:sticky lg:top-32">
                        <div className="glass-panel p-10 space-y-10 border-gold-400/20 relative overflow-hidden group">
                            {/* Animated glow */}
                            <div className="absolute -right-20 -top-20 w-64 h-64 bg-gold-400/5 blur-[80px] rounded-full group-hover:bg-gold-400/10 transition-all duration-[2000ms]" />

                            <div className="relative z-10">
                                <h2 className="text-2xl font-serif italic text-white mb-2">Folio Summary</h2>
                                <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.3em]">Review your itinerary</p>
                            </div>

                            <div className="relative z-10 space-y-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{room.location?.city} Hotel</p>
                                    </div>
                                    <h3 className="text-2xl font-serif italic text-white leading-tight">{room.type}</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-8 py-8 border-y border-white/5">
                                    <div className="space-y-2">
                                        <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">Arrive</p>
                                        <p className="text-xs font-bold text-white uppercase tracking-tighter">{new Date(checkIn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                    <div className="space-y-2 text-right">
                                        <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">Depart</p>
                                        <p className="text-xs font-bold text-white uppercase tracking-tighter">{new Date(checkOut).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">Tenure</p>
                                        <p className="text-xs font-bold text-white uppercase tracking-tighter">{nights} Night{nights > 1 ? 's' : ''}</p>
                                    </div>
                                    <div className="space-y-2 text-right">
                                        <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">Portfolio</p>
                                        <p className="text-xs font-bold text-gold-400/60 font-mono">#{Math.random().toString(36).slice(2, 8).toUpperCase()}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/40">
                                        <span>Base Residence ({nights} Nights)</span>
                                        <span>₹{bookingDetails.originalSubtotal?.toLocaleString() || bookingDetails.subtotal?.toLocaleString()}</span>
                                    </div>

                                    {bookingDetails.membershipDiscount > 0 && (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-gold-400">
                                                <span>Exclusive Benefit ({bookingDetails.membershipTier})</span>
                                                <span>−₹{bookingDetails.membershipDiscount.toLocaleString()}</span>
                                            </div>

                                            {/* Tier specific perks */}
                                            {TIER_BENEFITS[bookingDetails.membershipTier] && (
                                                <div className="p-3 bg-gold-400/5 border border-gold-400/10 rounded-sm space-y-2">
                                                    <p className="text-[7px] font-black text-gold-400/60 uppercase tracking-widest border-b border-gold-400/10 pb-1">Included Sanctuary Privileges</p>
                                                    <div className="space-y-1.5">
                                                        {TIER_BENEFITS[bookingDetails.membershipTier].map((perk, pi) => (
                                                            <div key={pi} className="flex items-center gap-1.5">
                                                                <Sparkles className="w-2 h-2 text-gold-400" />
                                                                <span className="text-[7px] font-bold text-white/40 uppercase tracking-tight">{perk}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {bookingDetails.addOns?.length > 0 && (
                                        <div className="space-y-2">
                                            {bookingDetails.addOns.map((addon, i) => (
                                                <div key={i} className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-white/20">
                                                    <span>+ {addon.name}</span>
                                                    <span>₹{addon.price.toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-white/20 pb-4 border-b border-white/5">
                                        <span>Taxes & Fees</span>
                                        <span>₹{(bookingDetails.serviceFee + bookingDetails.occupancyTax).toLocaleString()}</span>
                                    </div>

                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] pt-4">Total Consideration</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-sm font-serif italic text-gold-400/60 uppercase racking-widest">INR</span>
                                        <p className="text-5xl font-serif italic text-gold-400 tracking-tight">₹{total.toLocaleString()}</p>
                                    </div>
                                    {bookingDetails.offerCode && (
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gold-400/10 border border-gold-400/20 rounded-lg w-max">
                                            <Tag className="w-3 h-3 text-gold-400" />
                                            <span className="text-[8px] font-black text-gold-400 uppercase tracking-widest">{bookingDetails.offerCode} Applied</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={handleContinue}
                                className="relative z-10 w-full py-5 bg-gold-400 text-navy-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-gold-400/10 hover:bg-white transition-all transform active:scale-[0.98] flex items-center justify-center gap-4 group"
                            >
                                Continue to Payment
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                            </button>

                            <p className="text-center text-[8px] font-bold text-white/10 uppercase tracking-[0.4em]">Integrity secured by LuxeStay</p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default GuestDetailsPage;
