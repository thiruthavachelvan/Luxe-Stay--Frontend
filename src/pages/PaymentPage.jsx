import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, MapPin, CreditCard, Wallet, Bitcoin, AlertTriangle, Lock, ChevronRight, CheckCircle2, Tag, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const loadScript = (src) => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [bookingDetails, setBookingDetails] = useState(null);
    const [paymentSchedule, setPaymentSchedule] = useState('full');
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [isLoading, setIsLoading] = useState(false);

    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [couponInput, setCouponInput] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponStatus, setCouponStatus] = useState(null);
    const [couponMessage, setCouponMessage] = useState('');
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

    // Form states
    const [cardName, setCardName] = useState('John Doe');
    const [cardNumber, setCardNumber] = useState('4444 4444 4444 1234');
    const [expiry, setExpiry] = useState('12/26');
    const [cvv, setCvv] = useState('123');

    // Ref to prevent double auto-apply — MUST be before any conditional return
    const autoAppliedRef = useRef(false);

    // Load booking details from navigation state
    useEffect(() => {
        if (!location.state || !location.state.roomId) {
            navigate('/rooms');
        } else {
            setBookingDetails(location.state);
            if (location.state.offerCode) {
                setCouponInput(location.state.offerCode);
            }
        }
    }, [location.state, navigate]);

    // Auto-apply offer coupon once booking details are loaded
    useEffect(() => {
        const offerCode = location.state?.offerCode;
        const currentTotal = location.state?.total;
        if (offerCode && currentTotal && !autoAppliedRef.current) {
            autoAppliedRef.current = true;
            // Run validate directly here using the total from state (not component-level derived value)
            const applyCode = async () => {
                setIsValidatingCoupon(true);
                try {
                    const res = await fetch(
                        `${__API_BASE__}/api/public/coupons/validate?code=${encodeURIComponent(offerCode)}&amount=${currentTotal}`
                    );
                    const data = await res.json();
                    if (data.valid) {
                        setCouponCode(offerCode.toUpperCase());
                        setCouponDiscount(data.discountAmount || 0);
                        setCouponStatus('valid');
                        setCouponMessage(data.message || `${offerCode.toUpperCase()} applied!`);
                        setCouponInput(offerCode.toUpperCase());
                    }
                } catch (_) { /* silently fail */ }
                setIsValidatingCoupon(false);
            };
            applyCode();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bookingDetails]);

    // All derived values (safe to compute even if bookingDetails is null)
    const total = bookingDetails?.total ?? 0;
    const finalAmount = paymentSchedule === 'full'
        ? Math.max(0, total - couponDiscount)
        : Math.max(0, total - couponDiscount) * 0.25;

    const handleApplyCoupon = async (codeToApply) => {
        const code = (typeof codeToApply === 'string' ? codeToApply : couponInput).trim();
        if (!code) return;
        setIsValidatingCoupon(true);
        setCouponStatus(null);
        try {
            const res = await fetch(
                `${__API_BASE__}/api/public/coupons/validate?code=${encodeURIComponent(code)}&amount=${total}`
            );
            const data = await res.json();
            if (data.valid) {
                setCouponCode(code.toUpperCase());
                setCouponDiscount(data.discountAmount || 0);
                setCouponStatus('valid');
                setCouponMessage(data.message || `Coupon applied! You save ₹${(data.discountAmount || 0).toLocaleString()}.`);
                setCouponInput(code.toUpperCase());
            } else {
                setCouponStatus('invalid');
                setCouponMessage(data.message || 'Invalid coupon code.');
                setCouponDiscount(0);
                setCouponCode('');
            }
        } catch {
            setCouponStatus('invalid');
            setCouponMessage('Unable to validate coupon. Please try again.');
        }
        setIsValidatingCoupon(false);
    };

    const handleRemoveCoupon = () => {
        setCouponCode('');
        setCouponDiscount(0);
        setCouponStatus(null);
        setCouponMessage('');
        setCouponInput('');
    };

    const handleConfirmPayment = async (e) => {
        e.preventDefault();
        if (!bookingDetails) return;
        setIsLoading(true);

        const token = sessionStorage.getItem('userToken');
        if (!token) return navigate('/login');

        const { room, checkIn, checkOut } = bookingDetails;

        try {
            const resScript = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
            if (!resScript) {
                toast.error('Razorpay SDK failed to load. Are you online?');
                setIsLoading(false);
                return;
            }

            const orderRes = await fetch(`${__API_BASE__}/api/payment/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ amount: finalAmount })
            });

            if (!orderRes.ok) {
                toast.error('Server error creating order.');
                setIsLoading(false);
                return;
            }

            const orderData = await orderRes.json();

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "LuxeStay Hotel",
                description: "Booking Payment",
                order_id: orderData.id,
                handler: async function (response) {
                    setIsLoading(true);
                    const verifyRes = await fetch(`${__API_BASE__}/api/payment/verify`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        })
                    });

                    const verifyData = await verifyRes.json();
                    if (verifyData.success) {
                        const bookingRes = await fetch(`${__API_BASE__}/api/auth/bookings`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({
                                roomId: room._id,
                                locationId: room.location?._id || room.location,
                                checkIn,
                                checkOut,
                                guests: { adults: bookingDetails.adults, children: bookingDetails.children },
                                guestDetails: bookingDetails.guestDetails,
                                specialRequests: bookingDetails.specialRequests,
                                totalPrice: total - couponDiscount,
                                originalPrice: total,
                                couponCode: couponCode || null,
                                discountAmount: couponDiscount,
                                paymentStatus: paymentSchedule === 'full' ? 'Paid' : 'Advance Paid',
                                paymentMethod: paymentMethod === 'card' ? 'Credit / Debit Card' : paymentMethod === 'upi' ? 'UPI' : 'Cryptocurrency',
                                transactionId: response.razorpay_payment_id,
                                addOns: addOns || []
                            })
                        });
                        if (bookingRes.ok) {
                            toast.success('Payment Successful! Confirmation email sent.');
                            // Short delay to let the toast be seen before redirect
                            setTimeout(() => {
                                window.location.href = '/dashboard?section=bookings';
                            }, 2000);
                        } else {
                            toast.error('Booking failed after payment. Please contact support.');
                        }
                    } else {
                        toast.error('Payment verification failed');
                    }
                    setIsLoading(false);
                },
                prefill: { name: "John Doe", email: "guest@example.com", contact: "9999999999" },
                theme: { color: "#D4AF37" }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response) {
                toast.error(response.error.description);
                setIsLoading(false);
            });
            rzp1.open();

        } catch (error) {
            console.error('Payment Error:', error);
            toast.error('An error occurred during payment processing.');
            setIsLoading(false);
        }
    };

    // If no booking details yet, show nothing (redirect is handled in useEffect)
    if (!bookingDetails) return null;

    const { room, checkIn, checkOut, subtotal, serviceFee, occupancyTax, addOns, guestDetails } = bookingDetails;

    return (
        <div className="min-h-screen bg-navy-950 flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-32 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                {/* ── Breadcrumbs ── */}
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-4">
                    <span className="hover:text-gold-400 transition-colors cursor-pointer" onClick={() => navigate('/rooms')}>Archive</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="hover:text-gold-400 transition-colors cursor-pointer" onClick={() => navigate(-1)}>Patrons</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-gold-400">Secured Payment</span>
                </div>

                {/* ── Header ── */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em]">Financial Settlement</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-serif italic text-white tracking-tight leading-tight">Finalize your sanctuary.</h1>
                    <p className="text-xs text-white/30 uppercase tracking-widest font-medium max-w-xl">A final validation of your itinerary followed by a secure transfer of consideration.</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-16">
                    {/* ── Left Column: Folio Summary ── */}
                    <div className="space-y-10">
                        <div className="glass-panel p-10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/5 blur-[60px] rounded-full group-hover:bg-gold-400/10 transition-all duration-1000" />

                            <div className="flex justify-between items-center mb-10 relative z-10">
                                <h2 className="text-2xl font-serif italic text-white">Folio Summary</h2>
                                <div className="px-4 py-1 bg-gold-400/10 border border-gold-400/20 rounded-full">
                                    <span className="text-[9px] font-black text-gold-400 uppercase tracking-widest leading-relaxed">Itinerary Reserved</span>
                                </div>
                            </div>

                            <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-10 relative border border-white/10 group-hover:border-gold-400/20 transition-colors duration-700">
                                <img src={room.images?.[0] || "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3000ms]" alt="Room" />
                                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent" />
                                <div className="absolute bottom-6 left-6">
                                    <h3 className="text-2xl font-serif italic text-white mb-1">{room.type}</h3>
                                    <div className="flex items-center gap-2 text-white/40">
                                        <MapPin className="w-3 h-3 text-gold-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{room.location?.city} Sanctuary</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-10 py-10 border-y border-white/5 relative z-10">
                                <div className="space-y-2">
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">Arrival</p>
                                    <p className="text-xs font-bold text-white uppercase tracking-tighter">{new Date(checkIn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                </div>
                                <div className="space-y-2 text-right">
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">Departure</p>
                                    <p className="text-xs font-bold text-white uppercase tracking-tighter">{new Date(checkOut).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                </div>
                            </div>

                            <div className="space-y-6 pt-10 relative z-10">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Base Rate ({bookingDetails.nights} nights)</span>
                                        <span className="text-xs font-mono text-white/60">₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    {(addOns && addOns.length > 0) && addOns.map((a, i) => (
                                        <div key={i} className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{a.name}</span>
                                            <span className="text-xs font-mono text-white/60">₹{a.price.toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center pb-6">
                                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Regulatory Fees & Dues</span>
                                        <span className="text-xs font-mono text-white/60">₹{(serviceFee + occupancyTax).toLocaleString()}</span>
                                    </div>

                                    {couponDiscount > 0 && (
                                        <div className="flex justify-between items-center p-4 bg-emerald-400/5 border border-emerald-400/10 rounded-xl">
                                            <div className="flex items-center gap-2">
                                                <Tag className="w-3.5 h-3.5 text-emerald-400" />
                                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Patron Benefit ({couponCode})</span>
                                            </div>
                                            <span className="text-sm font-mono text-emerald-400">−₹{couponDiscount.toLocaleString()}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center pt-8 border-t border-white/10">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black text-gold-400 uppercase tracking-widest">Grand Consideration</span>
                                            <p className="text-[8px] text-white/20 italic">inclusive of all sanctuary dues</p>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xs font-serif italic text-gold-400/60 uppercase tracking-widest pr-1">INR</span>
                                            <span className="text-4xl font-serif italic text-gold-400 tracking-tighter">₹{(total - couponDiscount).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Coupon Logic Section ── */}
                        <div className={`glass-panel p-8 transition-all relative overflow-hidden group ${paymentSchedule === 'advance' ? 'opacity-40 grayscale pointer-events-none' : 'hover:border-gold-400/20'}`}>
                            {paymentSchedule === 'advance' && (
                                <div className="absolute inset-0 bg-navy-950/40 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center space-y-3">
                                    <Lock className="w-6 h-6 text-gold-400" />
                                    <p className="text-[9px] font-black text-gold-400 uppercase tracking-[0.3em]">Full Settlement Required</p>
                                </div>
                            )}

                            <h3 className="text-sm font-serif italic text-white flex items-center gap-3 mb-6 relative z-10">
                                <div className="w-8 h-8 rounded-lg bg-gold-400/10 flex items-center justify-center">
                                    <Tag className="w-4 h-4 text-gold-400" />
                                </div>
                                Privilege Voucher
                            </h3>

                            <div className="relative z-10">
                                {couponStatus === 'valid' ? (
                                    <div className="flex items-center justify-between p-4 bg-emerald-400/5 border border-emerald-400/20 rounded-2xl group/btn">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{couponCode} Validated</p>
                                            <p className="text-[9px] text-emerald-400/60 font-medium italic">{couponMessage}</p>
                                        </div>
                                        <button onClick={handleRemoveCoupon} className="p-2 hover:bg-rose-500/10 rounded-lg text-white/20 hover:text-rose-400 transition-all">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex gap-3">
                                            <div className="relative flex-1">
                                                <input
                                                    type="text"
                                                    value={couponInput}
                                                    onChange={e => setCouponInput(e.target.value.toUpperCase())}
                                                    onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                                                    placeholder="ENTER VOUCHER CODE"
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white font-mono uppercase tracking-widest focus:outline-none focus:border-gold-400/30 focus:bg-white/10 transition-all placeholder:text-white/10"
                                                />
                                            </div>
                                            <button
                                                onClick={handleApplyCoupon}
                                                disabled={isValidatingCoupon || !couponInput.trim()}
                                                className="px-8 bg-gold-400 text-navy-950 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all disabled:opacity-20 active:scale-95"
                                            >
                                                {isValidatingCoupon ? 'Validating...' : 'Apply'}
                                            </button>
                                        </div>
                                        {couponStatus === 'invalid' && (
                                            <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/5 border border-rose-500/20 rounded-xl">
                                                <AlertTriangle className="w-3 h-3 text-rose-400" />
                                                <p className="text-rose-400 text-[9px] font-black uppercase tracking-widest">{couponMessage}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Security Trust ── */}
                        <div className="flex items-center gap-6 p-8 glass-panel border-white/5 bg-white/[0.02]">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                                <ShieldCheck className="w-8 h-8 text-white/20" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">End-to-End Encryption</h4>
                                <p className="text-[9px] text-white/20 font-medium leading-relaxed">Your financial credentials are processed through an isolated, PCI-DSS compliant vault. Integrity is non-negotiable.</p>
                            </div>
                        </div>
                    </div>

                    {/* ── Right Column: Payment Details ── */}
                    <div className="space-y-10 lg:sticky lg:top-32 h-max">
                        {/* ── Payment Schedule ── */}
                        <div className="glass-panel p-10 space-y-10 relative overflow-hidden group">
                            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gold-400/5 blur-[80px] rounded-full group-hover:bg-gold-400/10 transition-all duration-[2000ms]" />

                            <div className="relative z-10">
                                <h2 className="text-2xl font-serif italic text-white mb-2">Settlement Protocol</h2>
                                <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.3em]">Choose your preference</p>
                            </div>

                            <div className="p-1 bg-white/5 border border-white/10 rounded-[24px] flex relative z-10">
                                <button
                                    onClick={() => setPaymentSchedule('full')}
                                    className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-[20px] transition-all duration-500 ${paymentSchedule === 'full' ? 'bg-gold-400 text-navy-950 shadow-2xl' : 'text-white/40 hover:text-white'}`}
                                >
                                    Full Consideration
                                </button>
                                <button
                                    onClick={() => {
                                        setPaymentSchedule('advance');
                                        handleRemoveCoupon();
                                    }}
                                    className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-[20px] transition-all duration-500 ${paymentSchedule === 'advance' ? 'bg-gold-400 text-navy-950 shadow-2xl' : 'text-white/40 hover:text-white'}`}
                                >
                                    25% Earnest Money
                                </button>
                            </div>

                            <div className="p-5 bg-gold-400/5 border border-gold-400/10 rounded-2xl relative z-10">
                                <div className="flex items-start gap-4">
                                    <Info className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                                    <p className="text-[9px] font-bold text-gold-400 uppercase tracking-widest leading-relaxed">
                                        {paymentSchedule === 'full'
                                            ? 'Unlocks exclusive sanctuary benefits: complimentary buffet access, expedited lounge check-in, and late departure privileges.'
                                            : 'Advance deposit secures the itinerary. The residual consideration of 75% plus applicable dues shall be payable upon arrival.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ── Razorpay Secure Warning ── */}
                        <div className="p-8 bg-emerald-400/5 border border-emerald-400/10 rounded-[32px] space-y-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 text-emerald-400/5 group-hover:text-emerald-400/10 transition-colors">
                                <Lock className="w-24 h-24 rotate-12" />
                            </div>

                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center">
                                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                </div>
                                <h4 className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em]">Secured Checkout Channel</h4>
                            </div>
                            <p className="text-[10px] text-emerald-400/60 font-medium leading-relaxed relative z-10">
                                Upon confirmation, you will be redirected to our secure payment gateway (Razorpay). Multi-factor authentication is enforced for all significant transfers.
                            </p>
                        </div>

                        {/* ── CTA ── */}
                        <div className="space-y-6">
                            <button
                                onClick={handleConfirmPayment}
                                disabled={isLoading}
                                className="w-full py-7 bg-gold-400 text-navy-950 rounded-[32px] font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl shadow-gold-400/20 hover:bg-white transition-all transform active:scale-[0.98] flex items-center justify-center gap-4 group disabled:opacity-50 disabled:grayscale"
                            >
                                {isLoading ? (
                                    <div className="w-6 h-6 border-4 border-navy-950/20 border-t-navy-950 rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Authorize Transfer INR {finalAmount.toLocaleString()}
                                    </>
                                )}
                            </button>

                            <div className="flex flex-col items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Live Verification Active</span>
                                </div>
                                <span onClick={() => navigate(-1)} className="text-[10px] font-black text-white/10 uppercase tracking-[0.2em] hover:text-gold-400 transition-colors cursor-pointer border-b border-white/5 hover:border-gold-400 pb-1">Revise Itinerary</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PaymentPage;





