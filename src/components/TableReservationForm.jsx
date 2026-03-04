import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Coffee, Check, AlertCircle, ShieldCheck } from 'lucide-react';

const loadScript = (src) => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const TableReservationForm = ({ user, onSuccess, userBookings }) => {
    // Merge user Bookings into user prop for easy access
    user = { ...user, userBookings };
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [guests, setGuests] = useState(2);
    const [specialRequests, setSpecialRequests] = useState('');
    const [menuItems, setMenuItems] = useState([]);
    const [selectedMeals, setSelectedMeals] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [bookingPreference, setBookingPreference] = useState('arrival');

    // Coupon state
    const [couponInput, setCouponInput] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0); // percent
    const [couponStatus, setCouponStatus] = useState(null); // null | 'valid' | 'invalid'
    const [couponMessage, setCouponMessage] = useState('');
    const [couponValidating, setCouponValidating] = useState(false);

    const handleApplyCoupon = async () => {
        const code = couponInput.trim().toUpperCase();
        if (!code) return;
        setCouponValidating(true);
        try {
            const currentTotal = calculateTotal();
            const res = await fetch(`${__API_BASE__}/api/public/coupons/validate?code=${encodeURIComponent(code)}&amount=${currentTotal}&appliesTo=all`);
            const data = await res.json();
            if (data.valid) {
                setCouponCode(code);
                setCouponDiscount(data.discountValue || 0);
                setCouponStatus('valid');
                setCouponMessage(data.message || `${code} applied — ${data.discountValue}% off your pre-booked meals!`);
                setCouponInput(code);
            } else {
                setCouponStatus('invalid');
                setCouponMessage(data.message || 'Invalid or inactive coupon code.');
                setCouponCode('');
            }
        } catch {
            setCouponStatus('invalid');
            setCouponMessage('Unable to validate coupon. Try again.');
        }
        setCouponValidating(false);
    };

    const removeCoupon = () => {
        setCouponCode(''); setCouponInput(''); setCouponDiscount(0);
        setCouponStatus(null); setCouponMessage('');
    };

    // Fetch public menu items for pre-booking
    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const res = await fetch(`${__API_BASE__}/api/public/menu`);
                if (res.ok) {
                    const data = await res.json();
                    setMenuItems(data);
                }
            } catch (err) {
                console.error("Error fetching menu for pre-booking", err);
            }
        };
        fetchMenu();
    }, []);

    // Calculate valid date range from active bookings
    const activeBookings = user.userBookings?.filter(b => b.status === 'Confirmed' || b.status === 'CheckedIn') || [];
    let minDate = new Date().toISOString().split('T')[0];
    let maxDate = '';

    if (activeBookings.length > 0) {
        const checkIns = activeBookings.map(b => new Date(b.checkIn).getTime());
        const checkOuts = activeBookings.map(b => new Date(b.checkOut).getTime());

        const minTime = Math.max(new Date().setHours(0, 0, 0, 0), Math.min(...checkIns));
        minDate = new Date(minTime).toISOString().split('T')[0];
        maxDate = new Date(Math.max(...checkOuts)).toISOString().split('T')[0];
    }

    const handleMealSelection = (itemId, change) => {
        setSelectedMeals(prev => {
            const currentQuantity = prev[itemId] || 0;
            const newQuantity = Math.max(0, currentQuantity + change);

            if (newQuantity === 0) {
                const newState = { ...prev };
                delete newState[itemId];
                return newState;
            }
            return { ...prev, [itemId]: newQuantity };
        });
    };

    const calculateTotal = () => {
        let total = 0;
        Object.entries(selectedMeals).forEach(([itemId, quantity]) => {
            const item = menuItems.find(m => m._id === itemId);
            if (item) {
                total += item.price * quantity;
            }
        });
        return total;
    };

    const calculateDiscountedTotal = () => {
        const raw = calculateTotal();
        if (couponDiscount > 0 && raw > 0) {
            return Math.round(raw * (1 - couponDiscount / 100));
        }
        return raw;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const preBookedMealsList = bookingPreference === 'pre-book'
                ? Object.entries(selectedMeals).map(([menuItem, quantity]) => ({
                    menuItem,
                    quantity
                }))
                : [];

            const totalAmount = bookingPreference === 'pre-book' ? calculateDiscountedTotal() : 0;

            if (totalAmount > 0) {
                // Razorpay Flow
                const resScript = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
                if (!resScript) {
                    setError('Razorpay SDK failed to load. Are you online?');
                    setLoading(false);
                    return;
                }

                const orderRes = await fetch(`${__API_BASE__}/api/payment/create-order`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
                    body: JSON.stringify({ amount: totalAmount })
                });

                if (!orderRes.ok) throw new Error('Could not create payment order');
                const orderData = await orderRes.json();

                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                    amount: orderData.amount,
                    currency: orderData.currency,
                    name: "LuxeStay Hotel",
                    description: "Dining Reservation Pre-Booking",
                    order_id: orderData.id,
                    handler: async function (response) {
                        setLoading(true);
                        // Verify
                        const verifyRes = await fetch(`${__API_BASE__}/api/payment/verify`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            })
                        });

                        const verifyData = await verifyRes.json();
                        if (verifyData.success) {
                            await processReservation(preBookedMealsList, totalAmount, response.razorpay_payment_id);
                        } else {
                            setError('Payment verification failed');
                            setLoading(false);
                        }
                    },
                    prefill: {
                        name: user.name || "LuxeStay Guest",
                    },
                    theme: { color: "#D4AF37" }
                };

                const rzp1 = new window.Razorpay(options);
                rzp1.on('payment.failed', function (response) {
                    setError(response.error.description);
                    setLoading(false);
                });
                rzp1.open();
                return; // Stop here, handler will resume
            }

            // Normal Flow (No Payment)
            await processReservation(preBookedMealsList, 0, null);

        } catch (err) {
            setError(err.message || 'An error occurred. Please try again later.');
            setLoading(false);
        }
    };

    const processReservation = async (preBookedMealsList, totalPreBookedAmount, transactionId) => {
        const response = await fetch(`${__API_BASE__}/api/reservations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({
                date,
                time,
                guests,
                specialRequests,
                preBookedMeals: preBookedMealsList,
                totalPreBookedAmount,
                transactionId // Note: if backend is updated to store this for reservations
            })
        });

        if (response.ok) {
            setSuccess(true);
            setDate('');
            setTime('');
            setGuests(2);
            setSpecialRequests('');
            setSelectedMeals({});
            setLoading(false);
        } else {
            const data = await response.json();
            throw new Error(data.message || 'Failed to submit reservation');
        }
    };

    if (success) {
        return (
            <div className="bg-[#1A2235] p-8 rounded-2xl border border-white/10 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Reservation Confirmed!</h3>
                <p className="text-gray-400 mb-6">Your table has been successfully booked. We look forward to hosting you.</p>
                <button
                    onClick={() => setSuccess(false)}
                    className="px-6 py-2 bg-[#D4AF37] text-[#0F1626] rounded-full font-bold hover:bg-[#F3E5AB] transition-colors"
                >
                    Make Another Reservation
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="bg-[#1A2235] p-6 rounded-2xl border border-white/10">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#D4AF37]" />
                    Book a Table
                </h3>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Date</label>
                            <input
                                type="date"
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                min={minDate}
                                max={maxDate}
                                className="w-full bg-[#0F1626] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Time</label>
                            <input
                                type="time"
                                required
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full bg-[#0F1626] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Guests</label>
                            <div className="relative">
                                <Users className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    max="20"
                                    value={guests}
                                    onChange={(e) => setGuests(parseInt(e.target.value))}
                                    className="w-full bg-[#0F1626] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Meal Booking Preference */}
                    <div className="pt-6 border-t border-white/5">
                        <label className="block text-sm font-medium text-gray-400 mb-4">Meal Preferences</label>
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <label className={`flex-1 flex items-center p-4 rounded-xl border cursor-pointer transition-colors ${bookingPreference === 'arrival' ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-white' : 'bg-[#0F1626] border-white/10 text-gray-400 hover:border-white/20'}`}>
                                <input
                                    type="radio"
                                    name="mealPreference"
                                    value="arrival"
                                    checked={bookingPreference === 'arrival'}
                                    onChange={(e) => setBookingPreference(e.target.value)}
                                    className="hidden"
                                />
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${bookingPreference === 'arrival' ? 'border-[#D4AF37]' : 'border-gray-500'}`}>
                                        {bookingPreference === 'arrival' && <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />}
                                    </div>
                                    <span className="font-medium">Book meals after arrival</span>
                                </div>
                            </label>

                            <label className={`flex-1 flex items-center p-4 rounded-xl border cursor-pointer transition-colors ${bookingPreference === 'pre-book' ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-white' : 'bg-[#0F1626] border-white/10 text-gray-400 hover:border-white/20'}`}>
                                <input
                                    type="radio"
                                    name="mealPreference"
                                    value="pre-book"
                                    checked={bookingPreference === 'pre-book'}
                                    onChange={(e) => setBookingPreference(e.target.value)}
                                    className="hidden"
                                />
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${bookingPreference === 'pre-book' ? 'border-[#D4AF37]' : 'border-gray-500'}`}>
                                        {bookingPreference === 'pre-book' && <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />}
                                    </div>
                                    <span className="font-medium">Pre-book meals now</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Pre-book Meals Section */}
                    {bookingPreference === 'pre-book' && (
                        <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Coffee className="w-5 h-5 text-[#D4AF37]" />
                                Menu Selection
                            </h4>
                            <p className="text-sm text-gray-400 mb-6">Select items from our menu to have them prepared for your arrival.</p>

                            <div className="space-y-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {Object.entries(
                                    menuItems.reduce((acc, item) => {
                                        const cat = item.category || 'Other';
                                        if (!acc[cat]) acc[cat] = [];
                                        acc[cat].push(item);
                                        return acc;
                                    }, {})
                                ).map(([category, items]) => (
                                    <div key={category} className="space-y-4">
                                        <h5 className="text-[10px] font-bold text-luxury-muted uppercase tracking-[0.2em] border-b border-white/5 pb-2">{category}</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {items.map(item => (
                                                <div key={item._id} className="bg-[#0F1626] p-4 rounded-xl border border-white/5 flex items-center justify-between group hover:border-white/20 transition-colors relative">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h5 className="text-white font-medium">{item.name}</h5>
                                                            {item.isSpecial && (
                                                                <span className="px-2 py-0.5 bg-[#D4AF37]/20 text-[#D4AF37] text-[8px] font-bold uppercase tracking-wider rounded">Signature</span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[#D4AF37] text-sm font-bold">₹{item.price}</span>
                                                            {item.isComplimentary && (
                                                                <span className="text-[9px] text-green-400 font-bold uppercase tracking-widest">Complimentary</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 bg-[#1A2235] rounded-lg p-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleMealSelection(item._id, -1)}
                                                            className="w-8 h-8 rounded-md bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="w-4 text-center text-white text-sm font-medium">
                                                            {selectedMeals[item._id] || 0}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleMealSelection(item._id, 1)}
                                                            className="w-8 h-8 rounded-md bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center transition-colors"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {Object.keys(selectedMeals).length > 0 && (
                                <div className="mt-6 p-4 bg-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/20">
                                    {couponDiscount > 0 ? (
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-gray-300 text-sm">Subtotal</span>
                                                <span className="text-white line-through text-sm">₹{calculateTotal().toFixed(2)}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-green-400 text-xs mb-2">
                                                <span>{couponCode} ({couponDiscount}% off)</span>
                                                <span>- ₹{(calculateTotal() - calculateDiscountedTotal()).toFixed(2)}</span>
                                            </div>
                                            <div className="flex items-center justify-between border-t border-white/10 pt-2">
                                                <span className="text-gray-300 font-bold">Pre-booked Total:</span>
                                                <span className="text-xl font-bold text-[#D4AF37]">₹{calculateDiscountedTotal().toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-300">Pre-booked Total:</span>
                                            <span className="text-xl font-bold text-[#D4AF37]">₹{calculateTotal().toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Coupon Code ── */}
                    <div className="pt-6 border-t border-white/5">
                        <label className="block text-sm font-medium text-gray-400 mb-3">🏷️ Have a Coupon Code?</label>
                        {couponStatus === 'valid' ? (
                            <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
                                <div>
                                    <p className="text-green-400 text-sm font-bold">{couponCode} applied!</p>
                                    <p className="text-green-400/70 text-xs mt-0.5">{couponMessage}</p>
                                </div>
                                <button type="button" onClick={removeCoupon} className="text-white/40 hover:text-white transition-colors ml-4 text-lg leading-none">&times;</button>
                            </div>
                        ) : (
                            <>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={couponInput}
                                        onChange={e => setCouponInput(e.target.value.toUpperCase())}
                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
                                        placeholder="e.g. RESERVE15"
                                        className="flex-1 bg-[#0F1626] border border-white/10 rounded-xl px-4 py-3 text-white font-mono uppercase focus:outline-none focus:border-[#D4AF37] transition-colors placeholder:text-gray-600"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleApplyCoupon}
                                        disabled={couponValidating || !couponInput.trim()}
                                        className="px-5 py-3 bg-[#D4AF37] text-[#0F1626] rounded-xl font-bold text-sm hover:bg-[#F3E5AB] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {couponValidating ? '...' : 'Apply'}
                                    </button>
                                </div>
                                {couponStatus === 'invalid' && (
                                    <p className="text-red-400 text-xs mt-2">⚠ {couponMessage}</p>
                                )}
                            </>
                        )}
                    </div>

                    <div className="pt-6 border-t border-white/5">
                        <label className="block text-sm font-medium text-gray-400 mb-2">Special Requests</label>
                        <textarea
                            value={specialRequests}
                            onChange={(e) => setSpecialRequests(e.target.value)}
                            placeholder="Anniversary, dietary restrictions, window seat preferred..."
                            className="w-full bg-[#0F1626] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors resize-none h-24"
                        ></textarea>
                    </div>

                    <div className="flex justify-end pt-4 items-center gap-4">
                        {bookingPreference === 'pre-book' && calculateTotal() > 0 && (
                            <div className="flex items-center gap-1.5 text-green-500 mr-auto">
                                <ShieldCheck className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Secured by Razorpay</span>
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={loading || (bookingPreference === 'pre-book' && calculateTotal() > 0 && loading)}
                            className={`px-8 py-3 bg-[#D4AF37] text-[#0F1626] rounded-xl font-bold transition-all flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#F3E5AB] hover:scale-[1.02] active:scale-95 shadow-lg shadow-[#D4AF37]/20'}`}
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-[#0F1626]/30 border-t-[#0F1626] rounded-full animate-spin" />
                            ) : null}
                            {loading ? (bookingPreference === 'pre-book' && calculateTotal() > 0 ? 'Processing...' : 'Confirming...') : (bookingPreference === 'pre-book' && calculateTotal() > 0 ? 'Pay & Confirm' : 'Confirm Reservation')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TableReservationForm;





