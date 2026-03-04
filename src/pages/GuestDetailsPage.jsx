import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, User, Users, Info, ArrowRight } from 'lucide-react';
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

        // Clear error for this field
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
        window.scrollTo(0, 0); // Scroll to top for validation errors if any
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
        <div className="min-h-screen bg-luxury-dark flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-24 sm:py-32 space-y-8 animate-in fade-in duration-500">
                {/* ── Breadcrumbs ── */}
                <div className="flex items-center gap-2 text-xs text-luxury-muted mb-4">
                    <span className="hover:text-luxury-blue cursor-pointer">Search</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="hover:text-luxury-blue cursor-pointer" onClick={() => navigate(-1)}>Room Selection</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-luxury-blue font-bold">Guest Details</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-luxury-muted">Secure Payment</span>
                </div>

                {/* ── Header ── */}
                <div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 font-serif italic tracking-tight">Who's checking in?</h1>
                    <p className="text-sm text-luxury-muted tracking-wide">Please provide the details of all guests staying with us.</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-10 items-start">
                    {/* ── Left Column: Forms ── */}
                    <div className="lg:col-span-2 space-y-8">
                        {guestDetails.map((guest, index) => (
                            <div key={index} className="bg-luxury-card border border-luxury-border/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-luxury-blue"></div>

                                <h3 className="text-lg font-bold text-white font-serif italic mb-5 flex items-center gap-2">
                                    {guest.type === 'adult' ? <User className="w-5 h-5 text-luxury-blue" /> : <Users className="w-5 h-5 text-luxury-blue" />}
                                    {guest.type === 'adult' ? `Adult ${index + 1}` : `Child ${index + 1 - bookingDetails.adults}`}
                                    {index === 0 && <span className="ml-2 text-[10px] bg-luxury-blue/20 text-luxury-blue px-2 py-0.5 rounded-full uppercase tracking-wider not-italic font-sans">Primary Guest</span>}
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest pl-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={guest.name}
                                            onChange={(e) => handleGuestChange(index, 'name', e.target.value)}
                                            placeholder="As per official ID"
                                            className={`w-full bg-luxury-dark border ${errors[`${index}-name`] ? 'border-red-500 focus:ring-red-500/20' : 'border-luxury-border/30 focus:border-luxury-blue focus:ring-luxury-blue/20'} rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 transition-all placeholder:text-luxury-muted/40`}
                                        />
                                        {errors[`${index}-name`] && <p className="text-red-500 text-xs pl-1">{errors[`${index}-name`]}</p>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest pl-1">Age</label>
                                        <input
                                            type="number"
                                            value={guest.age}
                                            onChange={(e) => handleGuestChange(index, 'age', e.target.value)}
                                            placeholder="e.g. 35"
                                            className={`w-full bg-luxury-dark border ${errors[`${index}-age`] ? 'border-red-500 focus:ring-red-500/20' : 'border-luxury-border/30 focus:border-luxury-blue focus:ring-luxury-blue/20'} rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 transition-all placeholder:text-luxury-muted/40`}
                                        />
                                        {errors[`${index}-age`] && <p className="text-red-500 text-xs pl-1">{errors[`${index}-age`]}</p>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest pl-1">Gender</label>
                                        <select
                                            value={guest.gender}
                                            onChange={(e) => handleGuestChange(index, 'gender', e.target.value)}
                                            className={`w-full bg-luxury-dark border ${errors[`${index}-gender`] ? 'border-red-500 focus:ring-red-500/20' : 'border-luxury-border/30 focus:border-luxury-blue focus:ring-luxury-blue/20'} rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 transition-all appearance-none cursor-pointer [color-scheme:dark]`}
                                        >
                                            <option value="" disabled>Select Gender</option>
                                            {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                        {errors[`${index}-gender`] && <p className="text-red-500 text-xs pl-1">{errors[`${index}-gender`]}</p>}
                                    </div>

                                    {guest.type === 'adult' && (
                                        <>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest pl-1">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    value={guest.phone}
                                                    onChange={(e) => handleGuestChange(index, 'phone', e.target.value)}
                                                    placeholder="+91"
                                                    className={`w-full bg-luxury-dark border ${errors[`${index}-phone`] ? 'border-red-500 focus:ring-red-500/20' : 'border-luxury-border/30 focus:border-luxury-blue focus:ring-luxury-blue/20'} rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:ring-1 transition-all placeholder:text-luxury-muted/40`}
                                                />
                                                {errors[`${index}-phone`] && <p className="text-red-500 text-xs pl-1">{errors[`${index}-phone`]}</p>}
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest pl-1">Email (Optional)</label>
                                                <input
                                                    type="email"
                                                    value={guest.email}
                                                    onChange={(e) => handleGuestChange(index, 'email', e.target.value)}
                                                    placeholder="guest@example.com"
                                                    className={`w-full bg-luxury-dark border border-luxury-border/30 focus:border-luxury-blue focus:ring-luxury-blue/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 transition-all placeholder:text-luxury-muted/40`}
                                                />
                                            </div>

                                            <div className="space-y-1.5 border-t border-luxury-border/20 md:col-span-2 pt-4 mt-2">
                                                <div className="flex items-center gap-1.5 mb-1 bg-blue-500/10 text-blue-400 w-max px-2 py-1 rounded border border-blue-500/20">
                                                    <Info className="w-3 h-3" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">Govt ID Proof Required at Check-in</span>
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest pl-1">ID Type</label>
                                                <select
                                                    value={guest.idType}
                                                    onChange={(e) => handleGuestChange(index, 'idType', e.target.value)}
                                                    className={`w-full bg-luxury-dark border ${errors[`${index}-idType`] ? 'border-red-500 focus:ring-red-500/20' : 'border-luxury-border/30 focus:border-luxury-blue focus:ring-luxury-blue/20'} rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 transition-all appearance-none cursor-pointer [color-scheme:dark]`}
                                                >
                                                    <option value="" disabled>Select ID</option>
                                                    {ID_TYPES.map(id => <option key={id} value={id}>{id}</option>)}
                                                </select>
                                                {errors[`${index}-idType`] && <p className="text-red-500 text-xs pl-1">{errors[`${index}-idType`]}</p>}
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest pl-1">ID Number</label>
                                                <input
                                                    type="text"
                                                    value={guest.idNumber}
                                                    onChange={(e) => handleGuestChange(index, 'idNumber', e.target.value)}
                                                    placeholder={`Enter ${guest.idType || 'ID'} number`}
                                                    className={`w-full bg-luxury-dark border ${errors[`${index}-idNumber`] ? 'border-red-500 focus:ring-red-500/20' : 'border-luxury-border/30 focus:border-luxury-blue focus:ring-luxury-blue/20'} rounded-xl px-4 py-3 text-sm text-white font-mono uppercase focus:outline-none focus:ring-1 transition-all placeholder:text-luxury-muted/40`}
                                                />
                                                {errors[`${index}-idNumber`] && <p className="text-red-500 text-xs pl-1">{errors[`${index}-idNumber`]}</p>}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}

                        <div className="bg-luxury-card border border-luxury-border/30 rounded-2xl p-6 shadow-xl">
                            <h3 className="text-lg font-bold text-white font-serif italic mb-4">Special Requests</h3>
                            <p className="text-xs text-luxury-muted mb-4">Let us know if you have any dietary requirements, need an extra bed, or have a special occasion.</p>
                            <textarea
                                value={specialRequests}
                                onChange={(e) => setSpecialRequests(e.target.value)}
                                placeholder="E.g., Twin beds preferred, ground floor, celebrating anniversary..."
                                className="w-full bg-luxury-dark border border-luxury-border/30 focus:border-luxury-blue focus:ring-luxury-blue/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 transition-all placeholder:text-luxury-muted/40 min-h-[120px] resize-y"
                            ></textarea>
                            <p className="text-[10px] text-luxury-muted/70 mt-2">* Special requests are subject to availability and cannot be guaranteed.</p>
                        </div>
                    </div>

                    {/* ── Right Column: Summary & CTA ── */}
                    <div className="lg:sticky lg:top-28">
                        <div className="bg-luxury-card border border-luxury-border/30 rounded-[2.5rem] p-7 shadow-2xl space-y-6">
                            <h2 className="text-lg font-bold text-white font-serif italic mb-2">Booking Summary</h2>

                            <div className="space-y-4">
                                <div className="pb-4 border-b border-luxury-border/20">
                                    <h3 className="text-white font-bold">{room.type}</h3>
                                    <p className="text-xs text-luxury-muted">{room.location?.city}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-luxury-border/20">
                                    <div>
                                        <p className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest pl-1 mb-1">Check-in</p>
                                        <p className="text-sm text-white font-medium">{new Date(checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest pl-1 mb-1">Check-out</p>
                                        <p className="text-sm text-white font-medium">{new Date(checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest pl-1 mb-1">Stay Duration</p>
                                        <p className="text-sm text-white font-medium">{nights} Night{nights > 1 ? 's' : ''}</p>
                                    </div>
                                </div>

                                <div className="pb-4 border-b border-luxury-border/20">
                                    <p className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest pl-1 mb-1">Total Amount</p>
                                    <p className="text-2xl font-bold text-luxury-blue font-serif italic">₹{total.toLocaleString()}</p>
                                    {bookingDetails.offerCode && <p className="text-xs text-yellow-500 mt-1">Pre-tax estimate. Coupon will be applied at payment.</p>}
                                </div>
                            </div>

                            <button
                                onClick={handleContinue}
                                className="w-full py-4 bg-luxury-blue text-white rounded-2xl font-bold text-sm sm:text-base shadow-xl shadow-luxury-blue/20 hover:bg-luxury-blue-hover transition-all flex items-center justify-center gap-2 group mt-2"
                            >
                                Continue to Payment
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <p className="text-center text-[10px] text-luxury-muted">You won't be charged yet.</p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default GuestDetailsPage;
