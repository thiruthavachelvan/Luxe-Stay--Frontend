import { useState, useEffect, useRef } from 'react';
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
                alert('Razorpay SDK failed to load. Are you online?');
                setIsLoading(false);
                return;
            }

            const orderRes = await fetch('__API_BASE__/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ amount: finalAmount })
            });

            if (!orderRes.ok) {
                alert('Server error creating order.');
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
                    const verifyRes = await fetch('__API_BASE__/api/payment/verify', {
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
                        const bookingRes = await fetch('__API_BASE__/api/auth/bookings', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({
                                roomId: room._id,
                                locationId: room.location?._id || room.location,
                                checkIn,
                                checkOut,
                                guests: { adults: bookingDetails.adults, children: bookingDetails.children },
                                totalPrice: total - couponDiscount,
                                originalPrice: total,
                                couponCode: couponCode || null,
                                discountAmount: couponDiscount,
                                paymentStatus: paymentSchedule === 'full' ? 'Paid' : 'Advance Paid',
                                paymentMethod: paymentMethod === 'card' ? 'Credit / Debit Card' : paymentMethod === 'upi' ? 'UPI' : 'Cryptocurrency',
                                transactionId: response.razorpay_payment_id
                            })
                        });
                        if (bookingRes.ok) {
                            navigate('/dashboard', { state: { section: 'bookings' }, replace: true });
                            setTimeout(() => alert('Booking Confirmed! Welcome to LuxeStay.'), 500);
                        } else {
                            alert('Booking failed after payment. Please contact support.');
                        }
                    } else {
                        alert('Payment verification failed');
                    }
                    setIsLoading(false);
                },
                prefill: { name: "John Doe", email: "guest@example.com", contact: "9999999999" },
                theme: { color: "#D4AF37" }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response) {
                alert(response.error.description);
                setIsLoading(false);
            });
            rzp1.open();

        } catch (error) {
            console.error('Payment Error:', error);
            alert('An error occurred during payment processing.');
            setIsLoading(false);
        }
    };

    // If no booking details yet, show nothing (redirect is handled in useEffect)
    if (!bookingDetails) return null;

    const { room, checkIn, checkOut, subtotal, serviceFee, occupancyTax, addOns } = bookingDetails;

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
                    <span className="text-luxury-blue font-bold">Secure Payment</span>
                </div>

                {/* ── Header ── */}
                <div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 font-serif italic tracking-tight">Complete Your Booking</h1>
                    <p className="text-sm text-luxury-muted tracking-wide">Verify your stay details and choose a payment method below.</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-10">
                    {/* ── Left Column: Booking Summary ── */}
                    <div className="space-y-6">
                        <div className="bg-luxury-card border border-luxury-border/30 rounded-[2rem] overflow-hidden shadow-2xl p-6 lg:p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-white font-serif italic">Booking Summary</h2>
                                <span className="bg-luxury-blue/10 text-luxury-blue text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-luxury-blue/30">Reserved</span>
                            </div>

                            <div className="w-full h-48 sm:h-64 rounded-2xl overflow-hidden shadow-lg border border-luxury-border/20 mb-8 relative">
                                <img src={room.images?.[0] || "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80"} className="w-full h-full object-cover" alt="Room" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <span className="text-[10px] font-bold text-luxury-blue uppercase tracking-widest block mb-1">Stay Details</span>
                                    <h3 className="text-2xl font-bold text-white font-serif italic mb-1">{room.type || 'Luxury Suite'}</h3>
                                    <p className="text-xs text-luxury-muted flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{room.location?.city || room.location?.name || 'LuxeStay Property'}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-luxury-border/30">
                                    <div>
                                        <span className="text-[9px] font-bold text-luxury-muted uppercase tracking-widest block mb-1">Check-in</span>
                                        <p className="text-sm text-white font-bold">{new Date(checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                    <div>
                                        <span className="text-[9px] font-bold text-luxury-muted uppercase tracking-widest block mb-1">Check-out</span>
                                        <p className="text-sm text-white font-bold">{new Date(checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-6 border-t border-luxury-border/30 text-sm">
                                    <div className="flex justify-between text-luxury-muted">
                                        <span>Room Rate ({bookingDetails.nights} nights)</span>
                                        <span className="text-white">₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    {(addOns && addOns.length > 0) && addOns.map((a, i) => (
                                        <div key={i} className="flex justify-between text-luxury-muted text-xs">
                                            <span>{a.name}</span>
                                            <span className="text-white">₹{a.price.toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between text-luxury-muted">
                                        <span>Service Fee & Taxes</span>
                                        <span className="text-white">₹{(serviceFee + occupancyTax).toLocaleString()}</span>
                                    </div>
                                    {couponDiscount > 0 && (
                                        <div className="flex justify-between text-green-400 text-sm">
                                            <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" />Coupon ({couponCode})</span>
                                            <span>−₹{couponDiscount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                        <span className="font-bold text-white tracking-widest uppercase text-xs">Total Amount</span>
                                        <span className="font-bold text-luxury-blue text-xl font-serif italic">₹{(total - couponDiscount).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Coupon Code */}
                        <div className={`bg-luxury-card/50 border rounded-2xl p-5 transition-all ${paymentSchedule === 'advance' ? 'border-white/5 opacity-60' : 'border-luxury-border/30'}`}>
                            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                                <Tag className="w-4 h-4 text-[#D4AF37]" />
                                Have a Coupon Code?
                                {paymentSchedule === 'advance' && (
                                    <span className="ml-auto text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                                        <Lock className="w-2.5 h-2.5" /> Full payment only
                                    </span>
                                )}
                            </h3>

                            {paymentSchedule === 'advance' ? (
                                <div className="text-center py-4 text-luxury-muted text-xs">
                                    <Lock className="w-5 h-5 mx-auto mb-2 text-amber-500/50" />
                                    Coupon codes are available for full payment bookings only.
                                </div>
                            ) : couponStatus === 'valid' ? (
                                <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
                                    <div>
                                        <p className="text-green-400 text-sm font-bold">{couponCode} applied!</p>
                                        <p className="text-green-400/70 text-xs mt-0.5">{couponMessage}</p>
                                    </div>
                                    <button onClick={handleRemoveCoupon} className="text-white/40 hover:text-white transition-colors ml-4">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={couponInput}
                                            onChange={e => setCouponInput(e.target.value.toUpperCase())}
                                            onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                                            placeholder="Enter code e.g. WELCOME10"
                                            className="flex-1 bg-luxury-dark border border-luxury-border/30 rounded-xl px-4 py-3 text-sm text-white font-mono focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 outline-none transition-all placeholder:text-luxury-muted/40 uppercase"
                                        />
                                        <button
                                            onClick={handleApplyCoupon}
                                            disabled={isValidatingCoupon || !couponInput.trim()}
                                            className="px-5 py-3 bg-[#D4AF37] text-[#0F1626] rounded-xl font-bold text-sm hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                        >
                                            {isValidatingCoupon ? '...' : 'Apply'}
                                        </button>
                                    </div>
                                    {couponStatus === 'invalid' && (
                                        <p className="text-red-400 text-xs mt-2 flex items-center gap-1.5">
                                            <AlertTriangle className="w-3.5 h-3.5" /> {couponMessage}
                                        </p>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Security Banner */}
                        <div className="bg-luxury-card/50 border border-luxury-border/30 rounded-2xl p-5 flex items-center gap-5">
                            <div className="w-12 h-12 bg-luxury-blue/10 rounded-full flex items-center justify-center flex-shrink-0">
                                <ShieldCheck className="w-6 h-6 text-luxury-blue" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white">100% Secure Transaction</h4>
                                <p className="text-[10px] sm:text-xs text-luxury-muted mt-0.5">Your information is encrypted with industry-leading SSL standards.</p>
                            </div>
                        </div>
                    </div>

                    {/* ── Right Column: Payment Details ── */}
                    <div className="space-y-6">
                        {/* Payment Schedule */}
                        <div className="bg-luxury-card border border-luxury-border/30 rounded-[2rem] p-6 lg:p-8 space-y-6 shadow-xl relative overflow-hidden">
                            <h2 className="text-lg font-bold text-white font-serif italic relative z-10">Payment Schedule</h2>

                            <div className="bg-luxury-dark rounded-xl p-1 flex relative z-10">
                                <button
                                    onClick={() => setPaymentSchedule('full')}
                                    className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-lg transition-all ${paymentSchedule === 'full' ? 'bg-luxury-card text-white shadow-lg border border-luxury-border/20' : 'text-luxury-muted hover:text-white'}`}
                                >
                                    Full Payment
                                </button>
                                <button
                                    onClick={() => {
                                        setPaymentSchedule('advance');
                                        // Coupons not allowed on advance payment — clear any applied
                                        handleRemoveCoupon();
                                    }}
                                    className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-lg transition-all ${paymentSchedule === 'advance' ? 'bg-luxury-card text-white shadow-lg border border-luxury-border/20' : 'text-luxury-muted hover:text-white'}`}
                                >
                                    25% Advance
                                </button>
                            </div>

                            <p className="text-[10px] text-luxury-muted italic relative z-10">
                                {paymentSchedule === 'full'
                                    ? '✓ Full payment unlocks coupon codes, free breakfast & late checkout.'
                                    : 'Advance deposit secures your room. Coupon codes are not applicable on advance payments.'}
                            </p>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-luxury-card border border-luxury-border/30 rounded-[2rem] p-6 lg:p-8 shadow-xl">
                            <h2 className="text-lg font-bold text-white font-serif italic mb-6">Select Payment Method</h2>

                            <div className="space-y-3">
                                {/* Card Option */}
                                <div className={`border rounded-2xl transition-all ${paymentMethod === 'card' ? 'border-luxury-blue bg-luxury-blue/5' : 'border-luxury-border/30 bg-luxury-dark/50 hover:border-luxury-border/60'}`}>
                                    <label className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setPaymentMethod('card')}>
                                        <div className="flex items-center gap-3">
                                            <CreditCard className={`w-5 h-5 ${paymentMethod === 'card' ? 'text-luxury-blue' : 'text-luxury-muted'}`} />
                                            <div>
                                                <h4 className="text-sm font-bold text-white">Credit / Debit Card</h4>
                                                <p className="text-[10px] text-luxury-muted mt-0.5">Visa, Mastercard, Amex</p>
                                            </div>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-luxury-blue' : 'border-luxury-muted'}`}>
                                            {paymentMethod === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-luxury-blue"></div>}
                                        </div>
                                    </label>

                                    {paymentMethod === 'card' && (
                                        <div className="p-5 border-t border-luxury-border/20 space-y-4 animate-in fade-in slide-in-from-top-2">
                                            <div>
                                                <label className="text-[9px] font-bold text-luxury-muted uppercase tracking-widest mb-1.5 block">Cardholder Name</label>
                                                <input type="text" value={cardName} onChange={e => setCardName(e.target.value)} className="w-full bg-luxury-dark border border-luxury-border/30 rounded-xl px-4 py-3 text-sm text-white focus:border-luxury-blue focus:ring-1 focus:ring-luxury-blue outline-none transition-all placeholder:text-luxury-muted/30" placeholder="John Doe" />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-bold text-luxury-muted uppercase tracking-widest mb-1.5 block">Card Number</label>
                                                <input type="text" value={cardNumber} onChange={e => setCardNumber(e.target.value)} className="w-full bg-luxury-dark border border-luxury-border/30 rounded-xl px-4 py-3 text-sm text-white font-mono focus:border-luxury-blue focus:ring-1 focus:ring-luxury-blue outline-none transition-all placeholder:text-luxury-muted/30" placeholder="**** **** **** 1234" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[9px] font-bold text-luxury-muted uppercase tracking-widest mb-1.5 block">Expiry Date</label>
                                                    <input type="text" value={expiry} onChange={e => setExpiry(e.target.value)} className="w-full bg-luxury-dark border border-luxury-border/30 rounded-xl px-4 py-3 text-sm text-white font-mono focus:border-luxury-blue focus:ring-1 focus:ring-luxury-blue outline-none transition-all placeholder:text-luxury-muted/30" placeholder="MM/YY" />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] font-bold text-luxury-muted uppercase tracking-widest mb-1.5 block">CVV</label>
                                                    <input type="password" value={cvv} onChange={e => setCvv(e.target.value)} className="w-full bg-luxury-dark border border-luxury-border/30 rounded-xl px-4 py-3 text-sm text-white font-mono focus:border-luxury-blue focus:ring-1 focus:ring-luxury-blue outline-none transition-all placeholder:text-luxury-muted/30" placeholder="***" maxLength="4" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* UPI Option */}
                                <div className={`border rounded-2xl transition-all ${paymentMethod === 'upi' ? 'border-luxury-blue bg-luxury-blue/5' : 'border-luxury-border/30 bg-luxury-dark/50 hover:border-luxury-border/60'}`}>
                                    <label className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setPaymentMethod('upi')}>
                                        <div className="flex items-center gap-3">
                                            <Wallet className={`w-5 h-5 ${paymentMethod === 'upi' ? 'text-luxury-blue' : 'text-luxury-muted'}`} />
                                            <div>
                                                <h4 className="text-sm font-bold text-white">UPI / Instant Transfer</h4>
                                                <p className="text-[10px] text-luxury-muted mt-0.5">Pay using Google Pay, PhonePe, or BHIM</p>
                                            </div>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'upi' ? 'border-luxury-blue' : 'border-luxury-muted'}`}>
                                            {paymentMethod === 'upi' && <div className="w-2.5 h-2.5 rounded-full bg-luxury-blue"></div>}
                                        </div>
                                    </label>
                                </div>

                                {/* Crypto Option */}
                                <div className={`border rounded-2xl transition-all ${paymentMethod === 'crypto' ? 'border-luxury-blue bg-luxury-blue/5' : 'border-luxury-border/30 bg-luxury-dark/50 hover:border-luxury-border/60'}`}>
                                    <label className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setPaymentMethod('crypto')}>
                                        <div className="flex items-center gap-3">
                                            <Bitcoin className={`w-5 h-5 ${paymentMethod === 'crypto' ? 'text-luxury-blue' : 'text-luxury-muted'}`} />
                                            <div>
                                                <h4 className="text-sm font-bold text-white">Cryptocurrency</h4>
                                                <p className="text-[10px] text-luxury-muted mt-0.5">Pay with BTC, ETH, or USDC via Coinbase</p>
                                            </div>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'crypto' ? 'border-luxury-blue' : 'border-luxury-muted'}`}>
                                            {paymentMethod === 'crypto' && <div className="w-2.5 h-2.5 rounded-full bg-luxury-blue"></div>}
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Razorpay Secured Warning */}
                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex gap-4">
                            <ShieldCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-green-500">Secured Checkout via Razorpay</h4>
                                <p className="text-[10px] text-green-400/80 mt-1">Your payment is processed securely by Razorpay. A popup will appear to collect payment details once you click Confirm.</p>
                            </div>
                        </div>

                        {/* CTA */}
                        <button
                            onClick={handleConfirmPayment}
                            disabled={isLoading}
                            className="w-full py-4 bg-luxury-blue text-white rounded-2xl font-bold text-sm sm:text-base shadow-xl shadow-luxury-blue/20 hover:bg-luxury-blue-hover transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Lock className="w-4 h-4" />
                                    Confirm & Pay ₹{finalAmount.toLocaleString()}
                                </>
                            )}
                        </button>

                        <div className="text-center pt-2">
                            <span onClick={() => navigate(-1)} className="text-xs text-luxury-muted hover:text-white cursor-pointer transition-colors border-b border-transparent hover:border-white pb-0.5">Return to Room Details</span>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PaymentPage;




