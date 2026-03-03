import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    User,
    CreditCard,
    Headset,
    Bell,
    Settings,
    MapPin,
    Sun,
    ChevronRight,
    Utensils,
    Wind,
    Car,
    Flower2,
    CheckCircle2,
    Clock,
    Circle,
    Bed,
    LogOut,
    Wine,
    Star,
    ShieldAlert,
    AlertCircle,
    X,
    Menu,
    Crown
} from 'lucide-react';
import TableReservationForm from '../components/TableReservationForm';

const UserDashboard = () => {
    const [user, setUser] = useState(null);
    const [activeSection, setActiveSection] = useState('dashboard');
    const [activeTab, setActiveTab] = useState('Active');
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [payments, setPayments] = useState([]);
    const [queries, setQueries] = useState([]);
    const [diningReservations, setDiningReservations] = useState([]);
    const [supportFormDefaults, setSupportFormDefaults] = useState({ subject: '', message: '', priority: 'Standard' });
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileFormData, setProfileFormData] = useState({});
    // Review state
    const [myReviews, setMyReviews] = useState([]);
    const [reviewForm, setReviewForm] = useState({ bookingId: '', overallRating: 0, comment: '', categoryRatings: { cleanliness: 0, service: 0, location: 0, foodQuality: 0, valueForMoney: 0 } });
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewSuccess, setReviewSuccess] = useState('');
    const [reviewError, setReviewError] = useState('');
    const [reviewedBookings, setReviewedBookings] = useState({});
    const [hasFetchedReviews, setHasFetchedReviews] = useState(false);

    // Cancellation Modal State
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState(null);
    const [refundAmount, setRefundAmount] = useState(0);
    const [refundPercentage, setRefundPercentage] = useState(0);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Coupon state — Dining
    const [diningCouponInput, setDiningCouponInput] = useState('');
    const [diningCouponCode, setDiningCouponCode] = useState('');
    const [diningCouponDiscount, setDiningCouponDiscount] = useState(0);
    const [diningCouponStatus, setDiningCouponStatus] = useState(null); // null | 'valid' | 'invalid'
    const [diningCouponMessage, setDiningCouponMessage] = useState('');
    const [diningCouponValidating, setDiningCouponValidating] = useState(false);

    // Coupon state — Membership
    const [memberCouponInput, setMemberCouponInput] = useState('');
    const [memberCouponCode, setMemberCouponCode] = useState('');
    const [memberCouponDiscount, setMemberCouponDiscount] = useState(0); // percent off membership price
    const [memberCouponStatus, setMemberCouponStatus] = useState(null);
    const [memberCouponMessage, setMemberCouponMessage] = useState('');
    const [memberCouponValidating, setMemberCouponValidating] = useState(false);

    const navigate = useNavigate();

    const loadScript = (src) => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    useEffect(() => {
        const storedUser = JSON.parse(sessionStorage.getItem('userData'));
        if (!storedUser) {
            navigate('/login');
        } else {
            setUser(storedUser);
            fetchAllData();

            // Check URL for section routing
            const params = new URLSearchParams(window.location.search);
            const section = params.get('section');
            if (section && ['dashboard', 'bookings', 'dining', 'reviews', 'profile', 'payment', 'support', 'membership'].includes(section)) {
                setActiveSection(section);
            }
        }
    }, [navigate, window.location.search]);

    const fetchAllData = async () => {
        setLoading(true);
        const token = sessionStorage.getItem('userToken');
        const headers = { 'Authorization': `Bearer ${token}` };

        try {
            // Fetch Profile
            const profileRes = await fetch('http://localhost:5000/api/auth/profile', { headers });
            if (profileRes.ok) setProfile(await profileRes.json());

            // Fetch Bookings
            const bookingsRes = await fetch('http://localhost:5000/api/auth/my-bookings', { headers });
            if (bookingsRes.ok) {
                const data = await bookingsRes.json();
                data.sort((a, b) => {
                    if (a.status === 'CheckedIn' && b.status !== 'CheckedIn') return -1;
                    if (b.status === 'CheckedIn' && a.status !== 'CheckedIn') return 1;
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });
                setBookings(data);
            }

            // Fetch Payments
            const paymentsRes = await fetch('http://localhost:5000/api/auth/payment-history', { headers });
            if (paymentsRes.ok) setPayments(await paymentsRes.json());

            // Fetch Queries
            const queriesRes = await fetch('http://localhost:5000/api/support/my-queries', { headers });
            if (queriesRes.ok) setQueries(await queriesRes.json());

            const notifRes = await fetch('http://localhost:5000/api/auth/notifications', { headers });
            if (notifRes.ok) {
                const data = await notifRes.json();
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.isRead).length);
            }

            // Fetch Dining Reservations
            const reservationsRes = await fetch('http://localhost:5000/api/reservations/my-reservations', { headers });
            if (reservationsRes.ok) setDiningReservations(await reservationsRes.json());

            setLoading(false);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setLoading(false);
        }
    };

    // ── Razorpay Membership Integration ─────────────────
    const handleBuyMembership = async (tierName, overridePrice) => {
        setLoading(true);
        const token = sessionStorage.getItem('userToken');
        if (!token) { navigate('/login'); return; }

        try {
            // 1. Create Order
            const orderRes = await fetch('http://localhost:5000/api/auth/membership/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ tier: tierName, overridePrice })
            });

            if (!orderRes.ok) {
                const errData = await orderRes.json();
                throw new Error(errData.message || 'Error creating membership order');
            }

            const { order } = await orderRes.json();
            const isMockOrder = order.id?.startsWith('order_mock_');

            // 2a. MOCK path — bypass Razorpay entirely
            if (isMockOrder) {
                const mockPaymentId = 'pay_mock_' + Math.random().toString(36).substr(2, 9);
                const verifyRes = await fetch('http://localhost:5000/api/auth/membership/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({
                        razorpay_order_id: order.id,
                        razorpay_payment_id: mockPaymentId,
                        razorpay_signature: 'mock_signature',
                        tier: tierName
                    })
                });
                const verifyData = await verifyRes.json();
                if (verifyRes.ok && verifyData.success) {
                    alert(`✅ Successfully upgraded to ${tierName}! Your membership is now active.`);
                    fetchAllData();
                } else {
                    alert(verifyData.message || 'Membership activation failed.');
                }
                setLoading(false);
                return;
            }

            // 2b. REAL Razorpay path
            if (!(await loadScript('https://checkout.razorpay.com/v1/checkout.js'))) {
                alert('Razorpay SDK failed to load. Are you online?');
                setLoading(false);
                return;
            }

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'LuxeStays Membership',
                description: `${tierName} Tier Subscription`,
                order_id: order.id,
                handler: async function (response) {
                    try {
                        const verifyRes = await fetch('http://localhost:5000/api/auth/membership/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                tier: tierName
                            })
                        });
                        const verifyData = await verifyRes.json();
                        if (verifyRes.ok && verifyData.success) {
                            alert(`✅ Successfully upgraded to ${tierName}! Your membership is now active.`);
                            fetchAllData();
                        } else {
                            alert(verifyData.message || 'Payment verification failed');
                        }
                    } catch (verifyErr) {
                        console.error('Membership verification error:', verifyErr);
                        alert('An unexpected error occurred verifying your membership.');
                    }
                },
                prefill: { name: profile.fullName || 'Guest', email: profile.email || '' },
                theme: { color: '#D4AF37' }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                alert(response.error.description);
            });
            rzp.open();

        } catch (err) {
            console.error('Membership Order Error:', err);
            alert(err.message || 'An error occurred initiating purchase.');
        } finally {
            setLoading(false);
        }
    };
    // ────────────────────────────────────────────────────

    const handleLogout = () => {
        sessionStorage.removeItem('userData');
        sessionStorage.removeItem('userToken');
        navigate('/');
    };

    // ── Generic coupon validator ──────────────────────────
    const validateCoupon = async (code, amount, appliesTo) => {
        const res = await fetch(
            `http://localhost:5000/api/public/coupons/validate?code=${encodeURIComponent(code)}&amount=${amount}&appliesTo=${appliesTo}`
        );
        return res.json();
    };

    const handleDiningCoupon = async () => {
        const code = diningCouponInput.trim().toUpperCase();
        if (!code) return;
        setDiningCouponValidating(true);
        try {
            const data = await validateCoupon(code, 0, 'all');
            if (data.valid) {
                setDiningCouponCode(code);
                setDiningCouponDiscount(data.discountValue || 0);
                setDiningCouponStatus('valid');
                setDiningCouponMessage(data.message || `${code} applied!`);
                setDiningCouponInput(code);
            } else {
                setDiningCouponStatus('invalid');
                setDiningCouponMessage(data.message || 'Invalid coupon code.');
                setDiningCouponCode('');
            }
        } catch {
            setDiningCouponStatus('invalid');
            setDiningCouponMessage('Unable to validate coupon.');
        }
        setDiningCouponValidating(false);
    };

    const removeDiningCoupon = () => {
        setDiningCouponCode(''); setDiningCouponInput('');
        setDiningCouponDiscount(0); setDiningCouponStatus(null); setDiningCouponMessage('');
    };

    const handleMemberCoupon = async (tierPrice = 0) => {
        const code = memberCouponInput.trim().toUpperCase();
        if (!code) return;
        setMemberCouponValidating(true);
        try {
            const data = await validateCoupon(code, tierPrice, 'membership');
            if (data.valid) {
                setMemberCouponCode(code);
                setMemberCouponDiscount(data.discountValue || 0);
                setMemberCouponStatus('valid');
                setMemberCouponMessage(data.message || `${code} applied! ${data.discountValue}% off membership.`);
                setMemberCouponInput(code);
            } else {
                setMemberCouponStatus('invalid');
                setMemberCouponMessage(data.message || 'Invalid coupon code.');
                setMemberCouponCode('');
            }
        } catch {
            setMemberCouponStatus('invalid');
            setMemberCouponMessage('Unable to validate coupon.');
        }
        setMemberCouponValidating(false);
    };

    const removeMemberCoupon = () => {
        setMemberCouponCode(''); setMemberCouponInput('');
        setMemberCouponDiscount(0); setMemberCouponStatus(null); setMemberCouponMessage('');
    };
    // ─────────────────────────────────────────────────────

    const handleMarkAsRead = async (id) => {
        try {
            const token = sessionStorage.getItem('userToken');
            await fetch(`http://localhost:5000/api/auth/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification read:', error);
        }
    };

    const handleClearNotifications = async () => {
        try {
            const token = sessionStorage.getItem('userToken');
            const res = await fetch(`http://localhost:5000/api/auth/notifications/clear`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setNotifications([]);
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error clearing notifications:', error);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = sessionStorage.getItem('userToken');
            const res = await fetch('http://localhost:5000/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileFormData)
            });

            if (res.ok) {
                const data = await res.json();
                setProfile(data);
                setIsEditingProfile(false);
                alert('Profile updated successfully.');
            } else {
                alert('Failed to update profile.');
            }
        } catch (err) {
            console.error('Error updating profile:', err);
        }
    };

    if (loading || !user || !profile) return (
        <div className="min-h-screen bg-luxury-dark flex items-center justify-center">
            <div className="animate-spin w-10 h-10 border-4 border-luxury-blue border-t-transparent rounded-full"></div>
        </div>
    );

    const sidebarLinks = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'bookings', label: 'My Bookings', icon: Calendar },
        { id: 'dining', label: 'Dining', icon: Wine },
        { id: 'reviews', label: 'Reviews', icon: Star },
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'payment', label: 'Guest Ledger / Folio', icon: CreditCard },
        { id: 'support', label: 'Concierge', icon: Headset },
        { id: 'membership', label: 'Membership', icon: Crown },
    ];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkInDate = (dateString) => { const d = new Date(dateString); d.setHours(0, 0, 0, 0); return d; };
    const checkOutDate = (dateString) => { const d = new Date(dateString); d.setHours(0, 0, 0, 0); return d; };

    const activeBookings = bookings.filter(b => ['Confirmed', 'CheckedIn'].includes(b.status) && checkInDate(b.checkIn) <= today && checkOutDate(b.checkOut) >= today);
    const upcomingBookings = bookings.filter(b => b.status === 'Confirmed' && checkInDate(b.checkIn) > today);
    const pastBookings = bookings.filter(b => ['Completed', 'CheckedOut', 'Cancelled'].includes(b.status) || (['Confirmed', 'CheckedIn'].includes(b.status) && checkOutDate(b.checkOut) < today));

    let displayBookings = [];
    if (activeTab === 'Active') displayBookings = activeBookings;
    else if (activeTab === 'Upcoming') displayBookings = upcomingBookings;
    else if (activeTab === 'Past') displayBookings = pastBookings;

    const displayedBooking = displayBookings[0];
    const hasActiveStay = activeBookings.length > 0;

    const timelineItems = queries.slice(0, 3).map(q => ({
        title: q.subject,
        time: new Date(q.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' ' + new Date(q.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: q.status === 'Open' ? 'Request received and being processed.' : `Resolved: ${q.response || 'Completed by concierge.'}`,
        icon: q.subject.includes('Food') || q.subject.includes('Dining') ? Utensils : q.subject.includes('Transport') ? Car : q.subject.includes('Cleaning') ? Wind : Circle,
        active: q.status === 'Open',
        color: 'text-luxury-blue'
    }));

    const renderDashboardOverview = () => (
        <>
            {/* Hero Banner */}
            <section className="relative h-80 rounded-[2.5rem] overflow-hidden group shadow-2xl">
                <img
                    src={displayedBooking?.location?.image || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=2000"}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    alt="Resort"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-luxury-sidebar via-luxury-sidebar/60 to-transparent"></div>
                <div className="relative z-10 h-full p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-3 text-white/80 mb-6 drop-shadow-lg">
                        <Sun className="w-5 h-5 text-luxury-gold" />
                        <span className="text-sm font-bold tracking-wide uppercase">{displayedBooking?.location?.city || 'LuxeStays'} • Real-time info</span>
                    </div>
                    <h2 className="text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-xl font-serif italic">
                        Welcome back, {profile?.fullName?.split(' ')[0] || 'Guest'}.
                    </h2>
                    <p className="text-lg text-white/70 max-w-xl mb-10 font-medium drop-shadow-lg">
                        {hasActiveStay ? 'Your stay is active. Experience luxury like never before with our personalized concierge services.' : 'Book a new extraordinary journey with LuxeStays.'}
                    </p>
                    <div className="flex gap-4">
                        <button onClick={() => setActiveSection('bookings')} className="px-8 py-3.5 bg-luxury-blue text-white rounded-xl font-bold hover:bg-luxury-blue-hover transition-all shadow-xl shadow-luxury-blue/30 active:scale-95">
                            {hasActiveStay ? 'View Active Stay' : 'My Bookings'}
                        </button>
                        <button onClick={() => { if (!hasActiveStay) return alert('Concierge services are exclusively available during an active stay.'); setActiveSection('support'); }} className="px-8 py-3.5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl font-bold hover:bg-white/20 transition-all active:scale-95">
                            Contact Concierge
                        </button>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: Stays & Timeline */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Tabs */}
                    <div className="flex gap-8 border-b border-luxury-border/30">
                        {['Active', 'Upcoming', 'Past'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 text-sm font-bold transition-all relative ${activeTab === tab ? 'text-luxury-blue' : 'text-luxury-muted hover:text-white'
                                    }`}
                            >
                                {tab}
                                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-luxury-blue rounded-full"></div>}
                            </button>
                        ))}
                    </div>

                    {/* Active Stay Card */}
                    {displayedBooking ? (
                        <div className="bg-luxury-card rounded-[2.5rem] overflow-hidden border border-luxury-border/30 flex group shadow-xl">
                            <div className="w-56 overflow-hidden">
                                <img
                                    src={displayedBooking.location?.image || "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800"}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    alt="Suite"
                                />
                            </div>
                            <div className="flex-1 p-8 flex flex-col justify-between">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <MapPin className="w-3.5 h-3.5 text-luxury-blue" />
                                            <span className="text-[10px] font-bold text-luxury-blue uppercase tracking-[0.2em]">{displayedBooking.location?.city} Hotel</span>
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-2 font-serif italic">{displayedBooking.room?.roomType}</h3>
                                        <p className="text-sm text-luxury-muted font-medium uppercase tracking-wider">
                                            {new Date(displayedBooking.checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - {new Date(displayedBooking.checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} • Room {displayedBooking.room?.roomNumber}
                                        </p>
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase border ${activeTab === 'Active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : activeTab === 'Upcoming' ? 'bg-luxury-blue/10 text-luxury-blue border-luxury-blue/20' : 'bg-luxury-border/30 text-luxury-muted border-white/5'}`}>
                                        {activeTab}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between pt-6 border-t border-luxury-border/20">
                                    <div className="flex gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-bold text-luxury-muted uppercase tracking-widest mb-1">Guest Capacity</span>
                                            <span className="text-xs font-bold text-white">{displayedBooking.guests?.adults} Adults, {displayedBooking.guests?.children} Child</span>
                                        </div>
                                        <div className="w-[1px] h-8 bg-luxury-border/30"></div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-bold text-luxury-muted uppercase tracking-widest mb-1">Amenities</span>
                                            <div className="flex gap-2">
                                                <Wind className="w-3.5 h-3.5 text-luxury-muted" />
                                                <Utensils className="w-3.5 h-3.5 text-luxury-muted" />
                                                <Flower2 className="w-3.5 h-3.5 text-luxury-muted" />
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => setActiveSection('bookings')} className="text-sm font-bold text-luxury-blue hover:underline underline-offset-4">Manage Booking</button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-luxury-card rounded-[2.5rem] p-16 border border-luxury-border/30 flex flex-col items-center justify-center text-center shadow-xl">
                            <Bed className="w-12 h-12 text-luxury-muted/20 mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No {activeTab} Rooms Booked</h3>
                            <p className="text-sm text-luxury-muted">You do not have any {activeTab.toLowerCase()} reservations at this time.</p>
                        </div>
                    )}

                    {/* Service Timeline */}
                    <div className="bg-luxury-card rounded-[2.5rem] p-8 border border-luxury-border/30 shadow-xl">
                        <div className="flex items-center gap-3 mb-8">
                            <Clock className="w-5 h-5 text-luxury-blue" />
                            <h3 className="text-lg font-bold text-white">Service Timeline</h3>
                        </div>
                        {timelineItems.length > 0 ? (
                            <div className="space-y-8 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-luxury-border/30">
                                {timelineItems.map((item, i) => (
                                    <div key={i} className="flex gap-10 items-start relative">
                                        <div className={`z-10 w-6 h-6 rounded-full border-4 border-luxury-card flex items-center justify-center ${item.active ? 'bg-luxury-blue' : 'bg-luxury-card'}`}>
                                            <item.icon className={`w-3 h-3 ${item.active ? 'text-white' : item.color || 'text-luxury-muted'}`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="text-sm font-bold text-white">{item.title}</h4>
                                                <span className="text-xs text-luxury-muted font-medium">{item.time}</span>
                                            </div>
                                            {item.status && <p className="text-xs text-luxury-muted leading-relaxed font-medium">{item.status}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-luxury-muted text-sm italic">No recent service history found.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Services & Map */}
                <div className="space-y-10">
                    {/* In-Stay Services */}
                    <div className="bg-luxury-dark space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Bell className="w-4 h-4 text-luxury-blue" />
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest">In-Stay Services</h3>
                        </div>
                        {[
                            { title: 'Order Food', sub: 'Gourmet room service', icon: Utensils, action: () => { if (!hasActiveStay) return alert('Available during active stays only.'); navigate('/menu'); } },
                            { title: 'Request Cleaning', sub: 'Fresh towels & turnover', icon: Wind, action: () => { if (!hasActiveStay) return alert('Available during active stays only.'); handleServiceRequest('Cleaning'); } },
                            { title: 'Book Transport', sub: 'Luxury fleet at your door', icon: Car, action: () => { if (!hasActiveStay) return alert('Available during active stays only.'); handleServiceRequest('Transport'); } },
                            { title: 'Spa & Wellness', sub: 'Book treatments & massage', icon: Flower2, action: () => { if (!hasActiveStay) return alert('Available during active stays only.'); handleServiceRequest('Spa'); } },
                        ].map((service, i) => (
                            <button
                                key={i}
                                onClick={service.action}
                                className="w-full bg-luxury-card border border-luxury-border/30 p-5 rounded-2xl flex items-center justify-between group hover:bg-luxury-blue/5 hover:border-luxury-blue/30 transition-all shadow-md active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-luxury-blue/10 flex items-center justify-center text-luxury-blue group-hover:scale-110 transition-transform">
                                        <service.icon className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="text-sm font-bold text-white group-hover:text-luxury-blue transition-colors">{service.title}</h4>
                                        <p className="text-[10px] text-luxury-muted font-medium uppercase tracking-wider mt-0.5">{service.sub}</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-luxury-muted group-hover:text-luxury-blue transition-colors group-hover:translate-x-1" />
                            </button>
                        ))}
                    </div>

                    {/* Map Section */}
                    <div className="bg-luxury-card rounded-[2.5rem] overflow-hidden border border-luxury-border/30 shadow-xl group cursor-pointer relative h-72">
                        {displayedBooking ? (
                            <iframe
                                className="w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700"
                                frameBorder="0"
                                scrolling="no"
                                marginHeight="0"
                                marginWidth="0"
                                src={`https://maps.google.com/maps?q=${encodeURIComponent(displayedBooking.location?.city + ' hotel')}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                            ></iframe>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center bg-luxury-dark/50">
                                <MapPin className="w-10 h-10 text-luxury-muted/30 mb-3" />
                                <p className="text-luxury-muted text-sm font-medium">Map location unavailable.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );

    const openCancelModal = (booking) => {
        setBookingToCancel(booking);

        // Calculate refund preview based on same logic as backend
        const now = new Date();
        const checkIn = new Date(booking.checkIn);
        const createdAt = new Date(booking.createdAt);

        const daysToCheckIn = Math.floor((checkIn - now) / (1000 * 60 * 60 * 24));
        const hoursSinceBooking = (now - createdAt) / (1000 * 60 * 60);

        const isAdvancePayment = booking.paymentStatus === 'Advance Paid';
        let percentage = 0;

        if (!isAdvancePayment) {
            if (hoursSinceBooking < 24 && daysToCheckIn > 0) {
                percentage = 75;
            } else if (daysToCheckIn > 2) {
                percentage = 50;
            } else if (daysToCheckIn === 1) {
                percentage = 25;
            } else {
                percentage = 0;
            }
        }

        setRefundPercentage(percentage);
        setRefundAmount(Math.round(((booking.totalPrice || 0) * percentage) / 100));
        setCancelModalOpen(true);
    };

    const handleCancelBooking = async () => {
        if (!bookingToCancel) return;
        const token = sessionStorage.getItem('userToken');
        try {
            const res = await fetch(`http://localhost:5000/api/auth/bookings/${bookingToCancel._id}/cancel`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                alert('Reservation cancelled successfully.');
                setCancelModalOpen(false);
                setBookingToCancel(null);
                fetchAllData();
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to cancel booking.');
            }
        } catch (err) {
            console.error('Error cancelling booking:', err);
            alert('An error occurred while cancelling.');
        }
    };

    const handleCheckIn = async (bookingId) => {
        try {
            const token = sessionStorage.getItem('userToken');
            const res = await fetch(`http://localhost:5000/api/auth/bookings/${bookingId}/check-in`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                alert('Checked in successfully. Enjoy your stay!');
                fetchAllData();
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to check in.');
            }
        } catch (err) {
            console.error('Check-in error:', err);
        }
    };

    const handleCheckOut = async (bookingId) => {
        try {
            const token = sessionStorage.getItem('userToken');
            const res = await fetch(`http://localhost:5000/api/auth/bookings/${bookingId}/check-out`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                alert('Checked out successfully. We hope to see you again!');
                // Optimistically update local booking list so the Review form dropdown renders correctly instantly
                setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'CheckedOut' } : b));

                // Pre-select the booking for review
                setReviewForm(prev => ({ ...prev, bookingId }));
                setActiveSection('reviews');
                fetchAllData();
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to check out.');
            }
        } catch (err) {
            console.error('Check-out error:', err);
        }
    };

    const submitSupportQuery = async (subject, message, priority = 'Standard') => {
        try {
            const token = sessionStorage.getItem('userToken');
            const res = await fetch('http://localhost:5000/api/support/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ subject, message, priority })
            });

            if (res.ok) {
                fetchAllData();
                return true;
            }
            return false;
        } catch (err) {
            console.error('Error submitting query:', err);
            return false;
        }
    };

    const handleSupportSubmit = async (e) => {
        e.preventDefault();
        const subject = e.target.subject.value;
        const message = e.target.message.value;
        const priority = e.target.priority.value;

        if (!subject || !message) return alert('Please provide both subject and message.');

        const success = await submitSupportQuery(subject, message, priority);
        if (success) {
            e.target.reset();
            alert('Your query has been dispatched to our concierge.');
        } else {
            alert('Failed to dispatch query. Please try again.');
        }
    };

    const handleServiceRequest = (serviceType) => {
        let subject = '';
        let message = '';

        switch (serviceType) {
            case 'Cleaning':
                subject = 'Housekeeping Request';
                message = 'Guest has requested priority room cleaning and turnover service.';
                break;
            case 'Transport':
                subject = 'Transport Booking';
                message = 'Guest has requested a luxury fleet vehicle for immediate or scheduled transport.';
                break;
            case 'Spa':
                subject = 'Spa Appointment';
                message = 'Guest has requested a consultation for spa treatments and wellness sessions.';
                break;
            default:
                return;
        }

        setSupportFormDefaults({ subject, message, priority: 'Standard' });
        setActiveSection('support');
    };

    const fetchMyReviews = async () => {
        try {
            const token = sessionStorage.getItem('userToken');
            // We only show the user's own via check endpoints
            // Fetch check for each completed booking
            const completedIds = bookings.filter(b => b.status === 'CheckedOut' || b.status === 'Completed').map(b => b._id);
            const checks = await Promise.all(
                completedIds.map(id =>
                    fetch(`http://localhost:5000/api/reviews/check/${id}`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json())
                )
            );
            const reviewed = {};
            completedIds.forEach((id, i) => { if (checks[i]?.hasReview) reviewed[id] = checks[i].review; });
            setReviewedBookings(reviewed);
        } catch (err) { console.error(err); }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!reviewForm.bookingId || !reviewForm.overallRating || !reviewForm.comment.trim()) {
            return setReviewError('Please select a booking, give a rating, and write a comment.');
        }
        setReviewLoading(true);
        setReviewError('');
        try {
            const token = sessionStorage.getItem('userToken');
            const res = await fetch('http://localhost:5000/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(reviewForm)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setReviewSuccess('Review submitted successfully! Thank you for your feedback.');
            setReviewForm({ bookingId: '', overallRating: 0, comment: '', categoryRatings: { cleanliness: 0, service: 0, location: 0, foodQuality: 0, valueForMoney: 0 } });
            fetchMyReviews();
        } catch (err) {
            setReviewError(err.message);
        } finally {
            setReviewLoading(false);
        }
    };

    const StarPicker = ({ value, onChange, size = 'w-7 h-7' }) => (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(s => (
                <button key={s} type="button" onClick={() => onChange(s)}>
                    <Star className={`${size} transition-colors ${s <= value ? 'text-amber-400 fill-amber-400' : 'text-luxury-border hover:text-amber-400'}`} />
                </button>
            ))}
        </div>
    );

    const renderReviews = () => {
        const completedBookings = bookings.filter(b => b.status === 'CheckedOut' || b.status === 'Completed');
        const categories = [
            { key: 'cleanliness', label: 'Cleanliness' },
            { key: 'service', label: 'Service' },
            { key: 'location', label: 'Location' },
            { key: 'foodQuality', label: 'Food Quality' },
            { key: 'valueForMoney', label: 'Value for Money' },
        ];

        // Fetch review statuses when section opens
        if (!hasFetchedReviews && activeSection === 'reviews') {
            setHasFetchedReviews(true);
            fetchMyReviews();
        }

        return (
            <div className="space-y-10 animate-in fade-in duration-500">
                <div>
                    <h2 className="text-3xl font-bold text-white font-serif italic">My Reviews</h2>
                    <p className="text-sm text-luxury-muted mt-1 uppercase tracking-widest font-bold">Share & View Your Experience</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-10">
                    {/* Review Form */}
                    <div className="bg-luxury-card rounded-[2.5rem] p-8 border border-luxury-border/30 shadow-xl space-y-6">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-luxury-border/20 pb-4">Write a Review</h3>

                        {completedBookings.length === 0 ? (
                            <div className="py-12 text-center">
                                <Star className="w-12 h-12 text-luxury-muted/20 mx-auto mb-4" />
                                <p className="text-white font-bold mb-2">No Completed Stays</p>
                                <p className="text-luxury-muted text-sm px-4">You can selectively write reviews right here after checking out of your stay.</p>
                            </div>
                        ) : reviewSuccess ? (
                            <div className="py-12 text-center">
                                <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto mb-4" />
                                <p className="text-white font-bold mb-2">Thank You!</p>
                                <p className="text-luxury-muted text-sm mb-6">{reviewSuccess}</p>
                                <button onClick={() => setReviewSuccess('')} className="text-luxury-blue text-sm hover:underline">Write Another</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmitReview} className="space-y-5">
                                <div>
                                    <label className="text-[9px] font-bold text-luxury-muted uppercase tracking-widest mb-2 block">Select Booking</label>
                                    <select
                                        value={reviewForm.bookingId}
                                        onChange={e => setReviewForm({ ...reviewForm, bookingId: e.target.value })}
                                        className="w-full bg-luxury-dark border border-luxury-border/30 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:border-luxury-blue/50 transition-all"
                                    >
                                        <option value="">Choose a completed stay...</option>
                                        {completedBookings.map(b => (
                                            <option key={b._id} value={b._id} disabled={!!reviewedBookings[b._id]}>
                                                {b.room?.roomType} — {b.location?.city} ({new Date(b.checkIn).toLocaleDateString('en-GB')}) {reviewedBookings[b._id] ? '✓ Reviewed' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[9px] font-bold text-luxury-muted uppercase tracking-widest mb-2 block">Overall Rating *</label>
                                    <StarPicker value={reviewForm.overallRating} onChange={v => setReviewForm({ ...reviewForm, overallRating: v })} />
                                </div>

                                <div>
                                    <label className="text-[9px] font-bold text-luxury-muted uppercase tracking-widest mb-3 block">Category Ratings (Optional)</label>
                                    <div className="space-y-3">
                                        {categories.map(cat => (
                                            <div key={cat.key} className="flex items-center justify-between">
                                                <span className="text-xs text-luxury-muted font-medium w-28">{cat.label}</span>
                                                <StarPicker size="w-4 h-4" value={reviewForm.categoryRatings[cat.key]} onChange={v => setReviewForm({ ...reviewForm, categoryRatings: { ...reviewForm.categoryRatings, [cat.key]: v } })} />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[9px] font-bold text-luxury-muted uppercase tracking-widest mb-2 block">Your Review *</label>
                                    <textarea
                                        rows={4}
                                        value={reviewForm.comment}
                                        onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                        placeholder="Share your experience in detail..."
                                        className="w-full bg-luxury-dark border border-luxury-border/30 rounded-xl px-5 py-3 text-sm text-white placeholder:text-luxury-muted focus:outline-none focus:border-luxury-blue/50 transition-all resize-none"
                                    />
                                </div>

                                {reviewError && <p className="text-rose-400 text-xs bg-rose-400/10 border border-rose-400/20 rounded-lg px-4 py-2">{reviewError}</p>}

                                <button
                                    type="submit"
                                    disabled={reviewLoading}
                                    className="w-full py-3 bg-luxury-blue text-white rounded-xl font-bold text-sm shadow-xl shadow-luxury-blue/20 hover:bg-luxury-blue-hover disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                                >
                                    {reviewLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Star className="w-4 h-4" /> Submit Review</>}
                                </button>
                            </form>
                        )}
                    </div>
                    {/* Review History */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-luxury-border/20 pb-4">Your Review History</h3>
                        {Object.keys(reviewedBookings).length === 0 ? (
                            <div className="p-10 text-center bg-luxury-card rounded-3xl border border-luxury-border/30">
                                <p className="text-luxury-muted text-sm italic">You haven't submitted any reviews yet.</p>
                            </div>
                        ) : (
                            Object.entries(reviewedBookings).map(([bookingId, review]) => (
                                <div key={bookingId} className="bg-luxury-card p-6 rounded-3xl border border-luxury-border/30 shadow-lg space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-bold text-luxury-blue uppercase tracking-widest">Verified Review</span>
                                        <div className="flex items-center gap-0.5">
                                            {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= review.overallRating ? 'text-amber-400 fill-amber-400' : 'text-luxury-border'}`} />)}
                                        </div>
                                    </div>
                                    <p className="text-sm text-luxury-muted leading-relaxed italic">"{review.comment}"</p>
                                    <p className="text-[9px] text-luxury-muted font-bold tracking-widest uppercase">{new Date(review.createdAt).toLocaleDateString()}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    };


    const renderBookings = () => (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white font-serif italic">My Stays</h2>
                    <p className="text-sm text-luxury-muted mt-1 uppercase tracking-widest font-bold">Historical Record & Upcoming Journeys</p>
                </div>
                <button onClick={() => navigate('/rooms')} className="px-6 py-2.5 bg-luxury-blue text-white rounded-xl font-bold text-sm shadow-xl shadow-luxury-blue/20 hover:scale-105 transition-all">
                    New Booking
                </button>
            </div>

            <div className="space-y-6">
                {bookings.length === 0 ? (
                    <div className="p-20 text-center bg-luxury-card rounded-[2.5rem] border border-luxury-border/30">
                        <Calendar className="w-16 h-16 text-luxury-muted/20 mx-auto mb-6" />
                        <h3 className="text-white font-bold text-xl">No Journeys Found</h3>
                        <p className="text-luxury-muted mt-2">Your travel history with LuxeStays is currently a blank canvas.</p>
                    </div>
                ) : (
                    bookings.map(booking => (
                        <div key={booking._id} className="bg-luxury-card rounded-[2.5rem] p-8 border border-luxury-border/30 flex items-center justify-between group hover:border-luxury-blue/50 transition-all shadow-xl">
                            <div className="flex items-center gap-8">
                                <div className="w-32 h-32 rounded-3xl overflow-hidden border border-luxury-border/30 shadow-2xl grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700">
                                    <img src={booking.location?.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80"} className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000" alt="Resort" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MapPin className="w-3 h-3 text-luxury-blue" />
                                        <span className="text-[9px] font-bold text-luxury-muted uppercase tracking-[0.3em] font-bold">{booking.location?.city}</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white font-serif italic">{booking.room?.roomType} <span className="text-luxury-muted text-lg font-normal">#{booking.room?.roomNumber}</span></h3>
                                    <p className="text-xs text-luxury-muted font-medium">
                                        {new Date(booking.checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} — {new Date(booking.checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-12 text-right">
                                <div>
                                    <div className="flex flex-col items-end gap-2 mb-3">
                                        <span className={`px-4 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase border transition-all ${booking.status === 'Confirmed' ? 'bg-luxury-blue/10 text-luxury-blue border-luxury-blue/30 shadow-lg shadow-luxury-blue/10' :
                                            booking.status === 'CheckedIn' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 shadow-lg shadow-indigo-500/10' :
                                                booking.status === 'CheckedOut' || booking.status === 'Completed' ? 'bg-green-500/10 text-green-500 border-green-500/30' :
                                                    'bg-red-500/10 text-red-500 border-red-500/30'
                                            }`}>
                                            {booking.status === 'CheckedIn' ? 'Actively Staying' : booking.status}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-widest uppercase border ${booking.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-orange-500/10 text-orange-500 border-orange-500/30'}`}>
                                            {booking.paymentStatus === 'Paid' ? 'Paid in Full' : booking.paymentStatus === 'Advance Paid' ? '25% Advance Paid' : 'Pending Payment'}
                                        </span>
                                    </div>
                                    <p className="text-2xl font-bold text-white font-serif italic">₹{booking.totalPrice?.toLocaleString()}</p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {(booking.paymentStatus === 'Advance Paid' || booking.paymentStatus === 'Pending') && ['Confirmed', 'CheckedIn'].includes(booking.status) && (
                                        <button onClick={() => handleSettleFolio(booking)} className="p-3 bg-luxury-gold/5 text-luxury-gold rounded-xl hover:bg-luxury-gold/10 border border-luxury-gold/20 transition-all font-bold text-xs whitespace-nowrap shadow-lg shadow-luxury-gold/5">
                                            Settle Balance
                                        </button>
                                    )}
                                    {booking.status === 'Confirmed' && new Date() >= new Date(new Date(booking.checkIn).setHours(0, 0, 0, 0)) && (
                                        <button onClick={() => handleCheckIn(booking._id)} className="p-3 bg-luxury-blue hover:bg-luxury-blue-hover text-white rounded-xl transition-all font-bold text-xs whitespace-nowrap shadow-lg shadow-luxury-blue/20">
                                            Check In Now
                                        </button>
                                    )}
                                    {booking.status === 'CheckedIn' && (
                                        <button onClick={() => handleCheckOut(booking._id)} className="p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all font-bold text-xs whitespace-nowrap shadow-lg shadow-emerald-500/20">
                                            Check Out
                                        </button>
                                    )}
                                    {booking.status === 'Confirmed' && (
                                        <button onClick={() => openCancelModal(booking)} className="p-3 bg-red-500/5 text-red-500 rounded-xl hover:bg-red-500/10 border border-red-500/10 transition-all font-bold text-xs whitespace-nowrap">
                                            Cancel Stay
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    const renderProfile = () => (
        <div className="space-y-10 animate-in fade-in duration-500 max-w-4xl">
            <div className="flex items-center gap-8 bg-luxury-card rounded-[2.5rem] p-12 border border-luxury-border/30 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-16 opacity-5">
                    <User className="w-64 h-64 text-luxury-blue" />
                </div>
                <div className="relative z-10 w-40 h-40 rounded-full border-4 border-luxury-blue p-1 shadow-2xl flex-shrink-0">
                    <img src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.fullName}&background=2563EB&color=fff`} className="w-full h-full object-cover rounded-full" alt="Avatar" />
                </div>
                <div className="relative z-10 flex-1">
                    <span className="text-[10px] font-bold text-luxury-blue uppercase tracking-[0.5em] mb-3 block">Guest Identity</span>
                    <h2 className="text-5xl font-bold text-white font-serif italic mb-4">{profile.fullName}</h2>
                    <p className="text-luxury-muted text-sm font-medium tracking-wide max-w-md">Member ID: #LS-2026-7721 • Loyal Guest since Mar 2026</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-luxury-card p-10 rounded-[2.5rem] border border-luxury-border/30 shadow-xl space-y-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-luxury-border/20 pb-4">Personal Information</h3>
                    {isEditingProfile ? (
                        <div className="space-y-4">
                            <div>
                                <label className="text-[9px] font-bold text-luxury-muted uppercase tracking-widest mb-1 block">Full Identity</label>
                                <input type="text" value={profileFormData.fullName || ''} onChange={(e) => setProfileFormData({ ...profileFormData, fullName: e.target.value })} className="w-full bg-luxury-dark border border-luxury-border/30 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-luxury-blue/50 transition-all font-medium" />
                            </div>
                            <div>
                                <label className="text-[9px] font-bold text-luxury-muted uppercase tracking-widest mb-1 block">Electronic Mail (Read Only)</label>
                                <input type="email" value={profileFormData.email || ''} readOnly className="w-full bg-luxury-dark border border-luxury-border/30 rounded-lg px-4 py-2 text-sm text-luxury-muted cursor-not-allowed font-medium" />
                            </div>
                            <div>
                                <label className="text-[9px] font-bold text-luxury-muted uppercase tracking-widest mb-1 block">Cellular Link</label>
                                <input type="text" value={profileFormData.phoneNumber || ''} onChange={(e) => setProfileFormData({ ...profileFormData, phoneNumber: e.target.value })} className="w-full bg-luxury-dark border border-luxury-border/30 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-luxury-blue/50 transition-all font-medium" />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <p className="text-[9px] font-bold text-luxury-muted uppercase tracking-widest mb-1">Full Identity</p>
                                <p className="text-sm font-bold text-white">{profile.fullName}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-luxury-muted uppercase tracking-widest mb-1">Electronic Mail</p>
                                <p className="text-sm font-bold text-white">{profile.email}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-luxury-muted uppercase tracking-widest mb-1">Cellular Link</p>
                                <p className="text-sm font-bold text-white">{profile.phoneNumber || 'Not Linked'}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-luxury-card p-10 rounded-[2.5rem] border border-luxury-border/30 shadow-xl space-y-6 flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-luxury-border/20 pb-4">Stay Preferences</h3>
                        {isEditingProfile ? (
                            <div className="space-y-4 pt-4">
                                <div>
                                    <label className="text-[9px] font-bold text-luxury-muted uppercase tracking-widest mb-1 block">Preferred Cuisine</label>
                                    <input type="text" value={profileFormData.preferences?.dietary || ''} onChange={(e) => setProfileFormData({ ...profileFormData, preferences: { ...profileFormData.preferences, dietary: e.target.value } })} className="w-full bg-luxury-dark border border-luxury-border/30 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-luxury-blue/50 transition-all font-medium" placeholder="e.g. Authentic Indian, Vegan" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold text-luxury-muted uppercase tracking-widest mb-1 block">Room Environment</label>
                                    <input type="text" value={profileFormData.preferences?.roomType || ''} onChange={(e) => setProfileFormData({ ...profileFormData, preferences: { ...profileFormData.preferences, roomType: e.target.value } })} className="w-full bg-luxury-dark border border-luxury-border/30 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-luxury-blue/50 transition-all font-medium" placeholder="e.g. Quiet Zone, High Floor" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold text-luxury-muted uppercase tracking-widest mb-1 block">Special Requests</label>
                                    <input type="text" value={profileFormData.preferences?.specialRequests || ''} onChange={(e) => setProfileFormData({ ...profileFormData, preferences: { ...profileFormData.preferences, specialRequests: e.target.value } })} className="w-full bg-luxury-dark border border-luxury-border/30 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-luxury-blue/50 transition-all font-medium" placeholder="e.g. Extra Towels" />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 pt-4">
                                <div>
                                    <p className="text-[9px] font-bold text-luxury-muted uppercase tracking-widest mb-1">Preferred Cuisine</p>
                                    <p className="text-sm font-bold text-white">{profile.preferences?.dietary || 'Authentic Indian'}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-luxury-muted uppercase tracking-widest mb-1">Room Environment</p>
                                    <p className="text-sm font-bold text-white">{profile.preferences?.roomType || 'Quiet Zone'}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-luxury-muted uppercase tracking-widest mb-1">Special Requests</p>
                                    <p className="text-sm font-bold text-white">{profile.preferences?.specialRequests || 'None'}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {isEditingProfile ? (
                        <div className="flex gap-4 mt-8 pt-4 border-t border-luxury-border/20">
                            <button onClick={() => setIsEditingProfile(false)} className="px-4 py-2 text-xs font-bold text-luxury-muted hover:text-white transition-colors uppercase tracking-widest">Cancel</button>
                            <button onClick={handleProfileUpdate} className="flex-1 px-4 py-2 bg-luxury-blue text-white rounded-lg text-xs font-bold hover:bg-luxury-blue-hover transition-all uppercase tracking-widest shadow-lg shadow-luxury-blue/20">Save Changes</button>
                        </div>
                    ) : (
                        <div className="mt-8 pt-4 border-t border-luxury-border/20">
                            <button onClick={() => { setProfileFormData({ fullName: profile.fullName, email: profile.email, phoneNumber: profile.phoneNumber, preferences: profile.preferences || {} }); setIsEditingProfile(true); }} className="text-xs font-bold text-luxury-blue hover:underline uppercase tracking-widest">Edit Profile Settings</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const handleSettleFolio = async (booking) => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem('userToken');

            // Find sum of all past successful payments for this booking
            const successfulPayments = payments.filter(p => p.booking?._id === booking._id && p.status === 'Success');
            const amountPaid = successfulPayments.reduce((acc, p) => acc + p.amount, 0);

            // Calculate exact outstanding balance based on ledger history
            const outstandingAmount = booking.totalPrice > amountPaid ? booking.totalPrice - amountPaid : 0;

            if (outstandingAmount <= 0) {
                alert('This booking is already fully paid.');
                setLoading(false);
                return;
            }

            // Load Razorpay
            const resScript = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
            if (!resScript) {
                alert('Razorpay SDK failed to load. Are you online?');
                setLoading(false);
                return;
            }

            // Create Order
            const orderRes = await fetch('http://localhost:5000/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ amount: outstandingAmount })
            });

            if (!orderRes.ok) throw new Error('Could not create payment order');
            const orderData = await orderRes.json();

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "LuxeStay Hotel",
                description: `Folio Settlement: ${booking.room?.roomType}`,
                order_id: orderData.id,
                handler: async function (response) {
                    try {
                        setLoading(true);
                        // Verify
                        const verifyRes = await fetch('http://localhost:5000/api/payment/verify', {
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
                            // Settle Folio
                            const settleRes = await fetch(`http://localhost:5000/api/auth/bookings/${booking._id}/settle-folio`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                body: JSON.stringify({
                                    amount: outstandingAmount,
                                    transactionId: response.razorpay_payment_id
                                })
                            });

                            if (settleRes.ok) {
                                alert('Folio settled successfully.');
                                fetchAllData();
                            } else {
                                const errData = await settleRes.json();
                                alert(errData.message || 'Error settling folio in backend.');
                                setLoading(false);
                            }
                        } else {
                            alert('Payment verification failed');
                            setLoading(false);
                        }
                    } catch (handlerErr) {
                        console.error('Razorpay Handler Error:', handlerErr);
                        alert('An unexpected error occurred during payment verification.');
                        setLoading(false);
                    }
                },
                prefill: {
                    name: profile.fullName || "LuxeStay Guest",
                    email: profile.email || "",
                },
                theme: { color: "#2563EB" }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response) {
                alert(response.error.description);
                setLoading(false);
            });
            rzp1.open();
        } catch (err) {
            console.error('Settle Folio Error:', err);
            alert('An error occurred. Please try again later.');
            setLoading(false);
        }
    };

    const renderPaymentHistory = () => {
        // Find bookings that have outstanding balances
        const outstandingBookings = bookings.filter(b => ['Confirmed', 'CheckedIn'].includes(b.status) && (b.paymentStatus === 'Pending' || b.paymentStatus === 'Advance Paid'));

        return (
            <div className="space-y-10 animate-in fade-in duration-500">
                <div>
                    <h2 className="text-3xl font-bold text-white font-serif italic">Guest Ledger / Folio</h2>
                    <p className="text-sm text-luxury-muted mt-1 uppercase tracking-widest font-bold">Consolidated Financial Records & Outstanding Balances</p>
                </div>

                {outstandingBookings.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-luxury-border/20 pb-4">Outstanding Balances</h3>
                        <div className="grid gap-4">
                            {outstandingBookings.map(b => {
                                const successfulPayments = payments.filter(p => p.booking?._id === b._id && p.status === 'Success');
                                const amountPaid = successfulPayments.reduce((acc, p) => acc + p.amount, 0);
                                const outstandingAmount = b.totalPrice > amountPaid ? b.totalPrice - amountPaid : 0;

                                return (
                                    <div key={b._id} className="bg-luxury-card rounded-2xl p-6 border border-luxury-border/30 shadow-lg flex items-center justify-between">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 border border-red-500/20">
                                                <AlertCircle className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white uppercase tracking-widest">{b.room?.roomType} at {b.location?.city}</p>
                                                <p className="text-[10px] text-luxury-muted font-bold mt-1 uppercase tracking-wider">Booking #{b._id.slice(-6)} • Check-in: {new Date(b.checkIn).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-6">
                                            <div>
                                                <p className="text-sm font-bold text-white font-serif italic mb-1">Due: ₹{outstandingAmount.toLocaleString()}</p>
                                                <span className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-widest uppercase border bg-orange-500/10 text-orange-500 border-orange-500/30`}>
                                                    {b.paymentStatus}
                                                </span>
                                            </div>
                                            <button onClick={() => handleSettleFolio(b)} className="px-4 py-2 bg-luxury-blue text-white rounded-lg text-xs font-bold shadow-lg shadow-luxury-blue/20 hover:scale-105 transition-all">
                                                Settle Account
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-luxury-border/20 pb-4">Completed Transactions</h3>
                    <div className="bg-luxury-card rounded-[2.5rem] border border-luxury-border/30 shadow-2xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-luxury-border/30 bg-white/5">
                                    <th className="p-8 text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Transaction ID</th>
                                    <th className="p-8 text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Description</th>
                                    <th className="p-8 text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Date</th>
                                    <th className="p-8 text-[10px] font-bold text-luxury-muted uppercase tracking-widest">Method</th>
                                    <th className="p-8 text-[10px] font-bold text-luxury-muted uppercase tracking-widest text-right">Amount</th>
                                    <th className="p-8 text-[10px] font-bold text-luxury-muted uppercase tracking-widest text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-20 text-center text-luxury-muted italic">No payment records observed in the ledger.</td>
                                    </tr>
                                ) : (
                                    payments.map(payment => (
                                        <tr key={payment._id} className="border-b border-luxury-border/20 hover:bg-white/[0.02] transition-colors">
                                            <td className="p-8">
                                                <p className="text-xs font-bold text-white font-mono uppercase">#{payment.transactionId || payment._id.slice(-8)}</p>
                                            </td>
                                            <td className="p-8">
                                                {payment.booking ? (
                                                    <>
                                                        <p className="text-sm font-bold text-white">Stay at {payment.booking.location?.city || 'LuxeStays'}</p>
                                                        <p className="text-[10px] text-luxury-muted font-medium mt-1 uppercase tracking-wider">Booking ID: #{(payment.booking._id || payment.booking).toString().slice(-6)}</p>
                                                    </>
                                                ) : payment.tableReservation ? (
                                                    <>
                                                        <p className="text-sm font-bold text-white">Dining Reservation (Pre-Booked Meals)</p>
                                                        <p className="text-[10px] text-luxury-muted font-medium mt-1 uppercase tracking-wider">Reservation ID: #{(payment.tableReservation._id || payment.tableReservation).toString().slice(-6)}</p>
                                                    </>
                                                ) : payment.foodOrder ? (
                                                    <>
                                                        <p className="text-sm font-bold text-white">In-Room Dining (Food Order)</p>
                                                        <p className="text-[10px] text-luxury-muted font-medium mt-1 uppercase tracking-wider">Order ID: #{(payment.foodOrder._id || payment.foodOrder).toString().slice(-6)}</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="text-sm font-bold text-white">Miscellaneous Folio Charge</p>
                                                        <p className="text-[10px] text-luxury-muted font-medium mt-1 uppercase tracking-wider">Payment ID: #{payment._id.slice(-6)}</p>
                                                    </>
                                                )}
                                            </td>
                                            <td className="p-8">
                                                <p className="text-xs font-medium text-luxury-muted">{new Date(payment.createdAt).toLocaleDateString('en-GB')}</p>
                                            </td>
                                            <td className="p-8">
                                                <p className="text-xs font-bold text-white uppercase tracking-widest">{payment.method}</p>
                                            </td>
                                            <td className="p-8 text-right">
                                                <p className="text-md font-bold text-white">₹{payment.amount?.toLocaleString()}</p>
                                            </td>
                                            <td className="p-8 text-center">
                                                <span className={`px-4 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase border ${payment.status === 'Success' ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}>
                                                    {payment.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const renderSupport = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in duration-500">
            <div className="space-y-10">
                <div>
                    <h2 className="text-3xl font-bold text-white font-serif italic">Concierge Support</h2>
                    <p className="text-sm text-luxury-muted mt-1 uppercase tracking-widest font-bold">Submit your queries to our global desk</p>
                </div>

                <form onSubmit={handleSupportSubmit} className="bg-luxury-card p-10 rounded-[2.5rem] border border-luxury-border/30 shadow-2xl space-y-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[9px] font-bold text-luxury-muted uppercase tracking-widest mb-2 block">Subject of Inquiry</label>
                                <input
                                    name="subject"
                                    type="text"
                                    required
                                    defaultValue={supportFormDefaults.subject}
                                    key={supportFormDefaults.subject}
                                    placeholder="e.g. Booking Modification..."
                                    className="w-full bg-luxury-dark border border-luxury-border/30 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-luxury-blue/50 transition-all font-medium"
                                />
                            </div>
                            <div>
                                <label className="text-[9px] font-bold text-luxury-muted uppercase tracking-widest mb-2 block">Priority Level</label>
                                <select
                                    name="priority"
                                    defaultValue={supportFormDefaults.priority || "Standard"}
                                    key={supportFormDefaults.priority}
                                    className="w-full bg-luxury-dark border border-luxury-border/30 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-luxury-blue/50 transition-all font-medium appearance-none cursor-pointer"
                                >
                                    <option value="Urgent">Urgent Attention</option>
                                    <option value="Standard">Standard Service</option>
                                    <option value="General">General Inquiry</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-luxury-muted uppercase tracking-widest mb-2 block">Detailed Message</label>
                            <textarea
                                name="message"
                                rows="5"
                                required
                                defaultValue={supportFormDefaults.message}
                                key={supportFormDefaults.message}
                                placeholder="Describe your request in detail..."
                                className="w-full bg-luxury-dark border border-luxury-border/30 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-luxury-blue/50 transition-all font-medium resize-none"
                            ></textarea>
                        </div>
                    </div>
                    <button type="submit" className="w-full py-4 bg-luxury-blue text-white rounded-xl font-bold text-sm shadow-xl shadow-luxury-blue/20 hover:bg-luxury-blue-hover transition-all active:scale-95">
                        Dispatch Query to Admin
                    </button>
                    <p className="text-[10px] text-luxury-muted text-center font-medium italic">Expected response time: Within 2 Sanctuary Hours</p>
                </form>
            </div>

            <div className="space-y-8">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-luxury-border/20 pb-4">Dispatch History</h3>
                <div className="space-y-6 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                    {queries.length === 0 ? (
                        <div className="p-12 text-center text-luxury-muted italic bg-white/[0.02] rounded-3xl border border-white/5">No active queries in the dispatch stream.</div>
                    ) : (
                        queries.map(q => (
                            <div key={q._id} className="bg-luxury-card p-8 rounded-3xl border border-luxury-border/30 shadow-lg space-y-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="text-md font-bold text-white">{q.subject}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`px-2 py-0.5 rounded text-[7px] font-bold uppercase tracking-wider ${q.priority === 'Urgent' ? 'bg-red-500/20 text-red-500 border border-red-500/30 shadow-lg shadow-red-500/10' :
                                                q.priority === 'Standard' ? 'bg-luxury-blue/10 text-luxury-blue border border-luxury-blue/20' :
                                                    'bg-white/5 text-white/40 border border-white/10'
                                                }`}>
                                                {q.priority === 'Urgent' ? 'Urgent Attention' :
                                                    q.priority === 'Standard' ? 'Standard Service' :
                                                        'General Inquiry'}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[8px] font-bold tracking-widest uppercase border ${q.status === 'Open' ? 'bg-luxury-blue/10 text-luxury-blue border-luxury-blue/30' : q.status === 'Resolved' ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-orange-500/10 text-orange-500 border-orange-500/30'}`}>
                                        {q.status}
                                    </span>
                                </div>
                                <p className="text-xs text-luxury-muted leading-relaxed font-medium">{q.message}</p>
                                {q.adminResponse && (
                                    <div className="mt-4 pt-4 border-t border-luxury-border/20">
                                        <p className="text-[9px] font-bold text-luxury-blue uppercase tracking-widest mb-2">Concierge Response</p>
                                        <p className="text-xs text-white bg-white/5 p-4 rounded-xl italic">{q.adminResponse}</p>
                                    </div>
                                )}
                                <p className="text-[9px] text-luxury-muted font-bold tracking-widest uppercase">{new Date(q.createdAt).toLocaleDateString()}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );

    const renderDining = () => (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold text-white font-serif italic">Dining Reservations</h2>
                <p className="text-sm text-luxury-muted mt-1 uppercase tracking-widest font-bold">Book a table &amp; Pre-order meals</p>
            </div>

            {/* ── Dining Coupon ── */}
            <div className="bg-luxury-card/50 border border-luxury-border/30 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                    🏷️ Have a Dining Coupon Code?
                    <span className="ml-auto text-[10px] text-luxury-muted">e.g. RESERVE15</span>
                </h3>
                {diningCouponStatus === 'valid' ? (
                    <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
                        <div>
                            <p className="text-green-400 text-sm font-bold">{diningCouponCode} applied!</p>
                            <p className="text-green-400/70 text-xs mt-0.5">{diningCouponMessage}</p>
                        </div>
                        <button onClick={removeDiningCoupon} className="text-white/40 hover:text-white transition-colors ml-4 text-lg leading-none">&times;</button>
                    </div>
                ) : (
                    <>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={diningCouponInput}
                                onChange={e => setDiningCouponInput(e.target.value.toUpperCase())}
                                onKeyDown={e => e.key === 'Enter' && handleDiningCoupon()}
                                placeholder="Enter coupon code"
                                className="flex-1 bg-luxury-dark border border-luxury-border/30 rounded-xl px-4 py-3 text-sm text-white font-mono uppercase focus:border-[#D4AF37] outline-none transition-all placeholder:text-luxury-muted/40"
                            />
                            <button
                                onClick={handleDiningCoupon}
                                disabled={diningCouponValidating || !diningCouponInput.trim()}
                                className="px-5 py-3 bg-[#D4AF37] text-[#0F1626] rounded-xl font-bold text-sm hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {diningCouponValidating ? '...' : 'Apply'}
                            </button>
                        </div>
                        {diningCouponStatus === 'invalid' && (
                            <p className="text-red-400 text-xs mt-2 flex items-center gap-1.5">⚠ {diningCouponMessage}</p>
                        )}
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div>
                    {/* The pass onSuccess to refetch dining reservations when they successfully book */}
                    <TableReservationForm user={user} onSuccess={fetchAllData} userBookings={bookings} appliedCouponCode={diningCouponCode} couponDiscount={diningCouponDiscount} />
                </div>

                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6 border-b border-luxury-border/30 pb-4">
                        <Calendar className="w-5 h-5 text-luxury-blue" />
                        Upcoming Reservations
                    </h3>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {diningReservations.length === 0 ? (
                            <div className="p-10 text-center bg-luxury-card rounded-3xl border border-luxury-border/30">
                                <Wine className="w-12 h-12 text-luxury-muted/20 mx-auto mb-4" />
                                <p className="text-luxury-muted text-sm italic">No dining reservations found.</p>
                            </div>
                        ) : (
                            diningReservations.map(res => (
                                <div key={res._id} className="bg-luxury-card p-6 rounded-2xl border border-luxury-border/30 shadow-lg relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4">
                                        <span className={`px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold tracking-widest uppercase ${res.status === 'Confirmed' ? 'text-green-500' : 'text-luxury-blue'}`}>
                                            {res.status}
                                        </span>
                                    </div>
                                    <div className="flex gap-4 items-start mb-4">
                                        <div className="w-12 h-12 bg-luxury-blue/10 rounded-xl flex items-center justify-center text-luxury-blue border border-luxury-blue/20">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-white font-serif">Table for {res.guests}</h4>
                                            <p className="text-xs font-bold text-luxury-muted uppercase tracking-widest mt-1">
                                                {new Date(res.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} at {res.time}
                                            </p>
                                        </div>
                                    </div>

                                    {res.preBookedMeals && res.preBookedMeals.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-luxury-border/20">
                                            <p className="text-[10px] text-luxury-muted font-bold tracking-widest uppercase mb-3 flex items-center gap-2">
                                                <Utensils className="w-3 h-3" /> Pre-Booked Menu
                                            </p>
                                            <ul className="space-y-2">
                                                {res.preBookedMeals.map((meal, idx) => (
                                                    <li key={idx} className="flex justify-between items-center text-sm">
                                                        <span className="text-white/80">{meal.quantity}x {meal.menuItem?.name || 'Item'}</span>
                                                        <span className="text-luxury-gold">₹{(meal.quantity * (meal.menuItem?.price || 0)).toFixed(2)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                                                <span className="text-xs text-luxury-muted">Pre-booked Total</span>
                                                <span className="text-sm font-bold text-luxury-gold">₹{res.totalPreBookedAmount?.toFixed(2) || '0.00'}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderMembership = () => {
        const tiers = [
            { name: 'Silver', price: 2999, desc: '5% off bookings, priority check-in', icon: '🥈', color: 'text-gray-400', border: 'border-gray-400/30' },
            { name: 'Gold', price: 5999, desc: '10% off bookings + dining, lounge access', icon: '🥇', color: 'text-[#D4AF37]', border: 'border-[#D4AF37]/30' },
            { name: 'Platinum', price: 9999, desc: '15% off all + spa credits + room upgrades', icon: '💎', color: 'text-[#D4AF37]', border: 'border-[#D4AF37]/30' },
            { name: 'Diamond', price: 19999, desc: '20% off + butler service + airport transfer', icon: '👑', color: 'text-purple-400', border: 'border-purple-400/30' },
            { name: 'Black Card', price: 49999, desc: '30% off + exclusive events + personal concierge', icon: '⬛', color: 'text-zinc-500', border: 'border-zinc-500/50', bg: 'bg-zinc-900/50' }
        ];

        return (
            <div className="space-y-10 animate-in fade-in duration-500">
                <div>
                    <h2 className="text-3xl font-bold text-white font-serif italic">Exclusive Membership</h2>
                    <p className="text-sm text-luxury-muted mt-1 uppercase tracking-widest font-bold">Elevate your stay with premium benefits.</p>
                </div>

                {profile?.membershipTier && profile.membershipTier !== 'None' ? (
                    <div className="bg-gradient-to-br from-luxury-card to-luxury-dark border border-[#D4AF37]/40 shadow-2xl rounded-3xl p-8 relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 opacity-10 blur-xl">
                            <Crown className="w-64 h-64 text-[#D4AF37]" />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start justify-between">
                            <div>
                                <span className="px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4 inline-block">Active Subscription</span>
                                <h3 className="text-4xl font-bold text-white mb-2">{profile.membershipTier} Tier</h3>
                                <p className="text-sm text-luxury-muted max-w-md">Your exclusive benefits are active. Discounts will be automatically applied at checkout.</p>
                                {/* We don't have exact expiry date in User model for now, could fetch from membership model */}
                            </div>
                            <div className="w-full md:w-auto text-center bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/5">
                                <Crown className="w-10 h-10 text-[#D4AF37] mx-auto mb-3" />
                                <button className="px-6 py-2 bg-[#D4AF37] text-zinc-900 font-bold text-sm rounded-xl cursor-not-allowed opacity-50">Auto-Renews Annually</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-luxury-card border border-luxury-border/30 rounded-3xl p-8 text-center text-luxury-muted">
                        <Crown className="w-12 h-12 text-luxury-muted/30 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Active Membership</h3>
                        <p className="text-sm max-w-md mx-auto">You are currently on the basic guest tier. Upgrade to unlock extraordinary perks and savings on every booking.</p>
                    </div>
                )}

                <div className="space-y-6">
                    {/* ── Membership Coupon ── */}
                    <div className="bg-luxury-card/50 border border-luxury-border/30 rounded-2xl p-5">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                            🏷️ Have a Membership Coupon Code?
                            <span className="ml-auto text-[10px] text-luxury-muted">e.g. MEMBERSHIP20</span>
                        </h3>
                        {memberCouponStatus === 'valid' ? (
                            <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
                                <div>
                                    <p className="text-green-400 text-sm font-bold">{memberCouponCode} applied!</p>
                                    <p className="text-green-400/70 text-xs mt-0.5">{memberCouponMessage}</p>
                                </div>
                                <button onClick={removeMemberCoupon} className="text-white/40 hover:text-white transition-colors ml-4 text-lg leading-none">&times;</button>
                            </div>
                        ) : (
                            <>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={memberCouponInput}
                                        onChange={e => setMemberCouponInput(e.target.value.toUpperCase())}
                                        onKeyDown={e => e.key === 'Enter' && handleMemberCoupon()}
                                        placeholder="Enter coupon code"
                                        className="flex-1 bg-luxury-dark border border-luxury-border/30 rounded-xl px-4 py-3 text-sm text-white font-mono uppercase focus:border-[#D4AF37] outline-none transition-all placeholder:text-luxury-muted/40"
                                    />
                                    <button
                                        onClick={handleMemberCoupon}
                                        disabled={memberCouponValidating || !memberCouponInput.trim()}
                                        className="px-5 py-3 bg-[#D4AF37] text-[#0F1626] rounded-xl font-bold text-sm hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {memberCouponValidating ? '...' : 'Apply'}
                                    </button>
                                </div>
                                {memberCouponStatus === 'invalid' && (
                                    <p className="text-red-400 text-xs mt-2 flex items-center gap-1.5">⚠ {memberCouponMessage}</p>
                                )}
                            </>
                        )}
                    </div>

                    <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-luxury-border/20 pb-4">Available Tiers</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tiers.map(t => {
                            const discountedPrice = memberCouponDiscount > 0
                                ? Math.round(t.price * (1 - memberCouponDiscount / 100))
                                : t.price;
                            return (
                                <div key={t.name} className={`relative bg-luxury-card border ${t.border} rounded-3xl p-6 flex flex-col shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#D4AF37]/10 group ${t.bg || ''}`}>
                                    <div className="text-4xl mb-4">{t.icon}</div>
                                    <h4 className={`text-xl font-bold ${t.color} font-serif mb-1`}>{t.name}</h4>
                                    <div className="mb-4">
                                        {memberCouponDiscount > 0 ? (
                                            <div>
                                                <span className="line-through text-luxury-muted text-lg mr-2">₹{t.price.toLocaleString()}</span>
                                                <span className="text-2xl font-bold text-[#D4AF37]">₹{discountedPrice.toLocaleString()}</span>
                                                <span className="text-xs text-luxury-muted font-normal uppercase tracking-widest ml-1">/ Year</span>
                                            </div>
                                        ) : (
                                            <div className="text-2xl font-bold text-white">₹{t.price.toLocaleString()} <span className="text-xs text-luxury-muted font-normal uppercase tracking-widest">/ Year</span></div>
                                        )}
                                    </div>
                                    <p className="text-sm text-white/80 leading-relaxed flex-1 mb-8">{t.desc}</p>

                                    <button
                                        onClick={() => handleBuyMembership(t.name, discountedPrice)}
                                        disabled={profile?.membershipTier === t.name || loading}
                                        className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg ${profile?.membershipTier === t.name
                                            ? 'bg-white/5 text-luxury-muted cursor-not-allowed'
                                            : 'bg-[#D4AF37] text-[#0F1626] hover:bg-yellow-400 hover:shadow-[#D4AF37]/30'
                                            }`}
                                    >
                                        {profile?.membershipTier === t.name ? 'Current Tier' : 'Upgrade Now'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    return (

        <div className="min-h-screen bg-luxury-dark text-luxury-text flex font-sans">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" />
            )}

            {/* Sidebar */}
            <aside className={`w-72 bg-luxury-sidebar border-r border-luxury-border/30 flex flex-col fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 overflow-y-auto custom-scrollbar`}>
                <div className="p-8">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-luxury-blue rounded-xl flex items-center justify-center shadow-lg shadow-luxury-blue/20">
                                <Bed className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-white">LuxeStays</h1>
                        </div>
                        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-luxury-muted hover:text-white p-1">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <nav className="space-y-1">
                        {sidebarLinks.map((link) => (
                            <button
                                key={link.id}
                                onClick={() => {
                                    if (['dining', 'support'].includes(link.id)) {
                                        // Only restrict dining/concierge if NO upcoming or active stays.
                                        if (!hasActiveStay && upcomingBookings.length === 0) {
                                            return alert(`Please make a room booking to access the ${link.label} features.`);
                                        }
                                    }
                                    setActiveSection(link.id);
                                    setIsSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${activeSection === link.id
                                    ? 'bg-luxury-blue text-white shadow-lg shadow-luxury-blue/20'
                                    : 'text-luxury-muted hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <link.icon className="w-5 h-5" />
                                <span className="font-medium text-sm">{link.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-6 space-y-6">
                    {/* Membership / Loyalty Card — shows only one based on tier */}
                    {profile?.membershipTier && profile.membershipTier !== 'None' ? (
                        // Paid tier — show gold badge
                        <div onClick={() => setActiveSection('membership')} className="bg-gradient-to-r from-luxury-gold/20 to-luxury-gold/5 border border-luxury-gold/50 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-luxury-gold transition-all">
                            <div className="w-10 h-10 bg-luxury-gold/20 rounded-full flex items-center justify-center border border-luxury-gold shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                                <Crown className="w-5 h-5 text-luxury-gold" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white uppercase tracking-widest">{profile.membershipTier} Member</h4>
                                <p className="text-[10px] text-luxury-gold font-bold">Exclusive Benefits Active</p>
                            </div>
                        </div>
                    ) : (
                        // No paid tier — show loyalty points card
                        <div onClick={() => setActiveSection('membership')} className="bg-luxury-card rounded-2xl p-5 border border-luxury-border/30 relative overflow-hidden group cursor-pointer hover:border-luxury-blue/50 transition-all">
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-luxury-blue uppercase tracking-wider">Guest Member</span>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-luxury-blue" />
                                </div>
                                <div className="mb-4">
                                    <span className="text-2xl font-bold text-white">{profile?.loyaltyPoints?.toLocaleString() || '0'}</span>
                                    <p className="text-[10px] text-luxury-muted font-medium mt-0.5">Loyalty Points Balance</p>
                                </div>
                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-luxury-blue w-1/5 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
                                </div>
                                <p className="text-[9px] text-luxury-muted mt-2 text-center underline underline-offset-2">Upgrade to unlock exclusive benefits</p>
                            </div>
                        </div>
                    )}

                    {/* User Profile */}

                    <div className="flex items-center gap-4 p-2">
                        <div className="w-10 h-10 rounded-full border-2 border-luxury-blue p-0.5">
                            <img
                                src={profile?.avatar || `https://ui-avatars.com/api/?name=${profile?.fullName}&background=2563EB&color=fff`}
                                alt="User"
                                className="w-full h-full object-cover rounded-full"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-white truncate">{profile?.fullName}</h4>
                            <p className="text-[10px] text-luxury-muted font-bold uppercase tracking-wider">#{profile?._id?.slice(-4)} • {profile?.role}</p>
                        </div>
                        <button onClick={handleLogout} title="Check Out" className="text-luxury-muted hover:text-red-500 transition-colors">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-72 bg-luxury-dark min-h-screen p-6 lg:p-10 space-y-10 overflow-x-hidden w-full">
                {/* Top Bar */}
                <header className="flex items-center justify-between gap-4 mb-8">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2.5 bg-luxury-card border border-luxury-border/30 rounded-xl text-luxury-muted hover:text-white transition-all z-20">
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-4 ml-auto">
                        <div className="relative">
                            <button onClick={() => setIsNotificationOpen(!isNotificationOpen)} className="relative w-11 h-11 bg-luxury-card border border-luxury-border/30 rounded-xl flex items-center justify-center text-luxury-muted hover:text-white transition-all cursor-pointer z-50">
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-luxury-dark rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg animate-pulse">{unreadCount}</span>
                                )}
                            </button>
                            {isNotificationOpen && (
                                <div className="absolute top-14 right-0 w-80 md:w-96 bg-luxury-card border border-luxury-border/50 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="p-4 border-b border-luxury-border/30 flex justify-between items-center bg-luxury-dark/50">
                                        <h3 className="font-bold text-white text-sm">Notifications</h3>
                                        {notifications.length > 0 && (
                                            <button onClick={handleClearNotifications} className="text-[10px] font-bold text-luxury-muted hover:text-red-500 transition-colors uppercase tracking-widest">
                                                Clear All
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-luxury-muted text-xs font-bold uppercase tracking-widest">No Notifications</div>
                                        ) : (
                                            notifications.map(n => (
                                                <div
                                                    key={n._id}
                                                    onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                                                    className={`p-4 border-b border-luxury-border/10 cursor-pointer transition-all hover:bg-white/5 ${!n.isRead ? 'bg-luxury-blue/10 border-l-2 border-l-luxury-blue' : ''}`}
                                                >
                                                    <div className="flex items-start justify-between gap-3 mb-2">
                                                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${n.type === 'System' ? 'text-luxury-blue bg-luxury-blue/10' : n.type === 'Staff Alert' ? 'text-luxury-gold bg-luxury-gold/10' : 'text-green-500 bg-green-500/10'}`}>{n.type}</span>
                                                        <span className="text-[9px] text-luxury-muted font-mono">{new Date(n.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className={`text-xs ${!n.isRead ? 'text-white font-bold' : 'text-luxury-muted font-medium'}`}>{n.message}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button onClick={() => setActiveSection('profile')} className="w-11 h-11 bg-luxury-card border border-luxury-border/30 rounded-xl flex items-center justify-center text-luxury-muted hover:text-white transition-all cursor-pointer">
                            <Settings className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-6 py-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl hover:bg-red-500/20 transition-all font-bold text-sm ml-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Check Out
                        </button>
                    </div>
                </header>

                <div className="pb-20">
                    {activeSection === 'dashboard' && renderDashboardOverview()}
                    {activeSection === 'bookings' && renderBookings()}
                    {activeSection === 'dining' && renderDining()}
                    {activeSection === 'reviews' && renderReviews()}
                    {activeSection === 'profile' && renderProfile()}
                    {activeSection === 'payment' && renderPaymentHistory()}
                    {activeSection === 'support' && renderSupport()}
                    {activeSection === 'membership' && renderMembership()}
                </div>

                {/* Cancellation Modal */}
                {cancelModalOpen && bookingToCancel && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                        <div className="bg-luxury-card border border-luxury-border/30 rounded-3xl w-full max-w-lg p-8 space-y-6 relative animate-in fade-in zoom-in-95 duration-300">
                            <button onClick={() => setCancelModalOpen(false)} className="absolute top-6 right-6 text-luxury-muted hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                    <ShieldAlert className="w-6 h-6 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white font-serif italic">Cancel Reservation</h3>
                                    <p className="text-xs text-luxury-muted tracking-widest uppercase mt-1">Review Refund Details</p>
                                </div>
                            </div>

                            <div className="bg-luxury-dark/40 border border-luxury-border/20 rounded-2xl p-6 space-y-4">
                                <div className="flex justify-between items-center pb-4 border-b border-luxury-border/20">
                                    <span className="text-luxury-muted text-sm">Total Amount Paid</span>
                                    <span className="text-white font-bold">₹{bookingToCancel.totalPrice?.toLocaleString() || 0}</span>
                                </div>

                                {bookingToCancel.paymentStatus === 'Advance Paid' ? (
                                    <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
                                        <p className="text-red-400 text-xs leading-relaxed text-center">
                                            As this booking was secured with a 25% Advance Payment, the amount paid is strictly non-refundable per our cancellation policy.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-luxury-muted">Eligible Refund ({refundPercentage}%)</span>
                                            <span className="text-emerald-400 font-bold tracking-wide">₹{refundAmount.toLocaleString()}</span>
                                        </div>
                                        {refundPercentage < 75 && (
                                            <p className="text-[10px] text-luxury-muted">
                                                Refund percentage is based on the remaining days until check-in.
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setCancelModalOpen(false)}
                                    className="flex-1 py-3.5 rounded-xl border border-luxury-border/30 text-white font-bold text-sm hover:bg-white/5 transition-all outline-none"
                                >
                                    Keep Booking
                                </button>
                                <button
                                    onClick={handleCancelBooking}
                                    className="flex-1 py-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm shadow-lg shadow-red-500/20 transition-all outline-none"
                                >
                                    Confirm Cancellation
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default UserDashboard;
