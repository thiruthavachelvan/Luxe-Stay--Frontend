import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    MoreHorizontal,
    X,
    Shield,
    MapPin,
    Bed,
    Calendar,
    Utensils,
    BellRing,
    Building,
    Plus,
    Map,
    Wind,
    Car,
    Flower2,
    User,
    Edit2,
    MessageSquare,
    Star,
    Mail,
    Trash2,
    CheckCircle2,
    Tag,
    Megaphone,
    Send,
    Download,
    Menu,
    Crown,
    ShieldCheck,
    CreditCard,
    Headphones,
    Compass,
    History,
    AlertCircle,
    ChevronDown,
    Sparkles,
    ShieldAlert,
    LogOut,
    LayoutDashboard,
    UserPlus,
    Settings,
    Bell,
    TrendingUp,
    CheckCircle,
    Clock,
    ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
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

    const [viewingBooking, setViewingBooking] = useState(null);
    const [spaBillBooking, setSpaBillBooking] = useState(null);

    const getExclusiveBenefits = (tier) => {
        if (!tier || tier === 'None') return [];
        switch (tier) {
            case 'Silver': return ['Welcome Drink', 'Late Check-out (1 PM)'];
            case 'Gold': return ['Welcome Drink', 'Late Check-out (2 PM)', 'Room Upgrade (Subject to availability)'];
            case 'Platinum': return ['Welcome Drink', 'Late Check-out (4 PM)', 'Room Upgrade', 'Complimentary Breakfast', 'Lounge Access'];
            case 'Diamond': return ['Welcome Drink', 'Late Check-out (Flexible)', 'Suite Upgrade', 'Complimentary Breakfast', 'Lounge Access', 'Spa Access (1 hr)'];
            case 'Black Card': return ['Dedicated Butler', 'Anytime Check-in/out', 'Presidential Suite Upgrade', 'All Meals Complimentary', 'Unlimited Spa'];
            default: return [];
        }
    };

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
            const profileRes = await fetch(`${__API_BASE__}/api/auth/profile`, { headers });
            if (profileRes.ok) setProfile(await profileRes.json());

            // Fetch Bookings
            const bookingsRes = await fetch(`${__API_BASE__}/api/auth/my-bookings`, { headers });
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
            const paymentsRes = await fetch(`${__API_BASE__}/api/auth/payment-history`, { headers });
            if (paymentsRes.ok) setPayments(await paymentsRes.json());

            // Fetch Queries
            const queriesRes = await fetch(`${__API_BASE__}/api/support/my-queries`, { headers });
            if (queriesRes.ok) setQueries(await queriesRes.json());

            const notifRes = await fetch(`${__API_BASE__}/api/auth/notifications`, { headers });
            if (notifRes.ok) {
                const data = await notifRes.json();
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.isRead).length);
            }

            // Fetch Dining Reservations
            const reservationsRes = await fetch(`${__API_BASE__}/api/reservations/my-reservations`, { headers });
            if (reservationsRes.ok) setDiningReservations(await reservationsRes.json());

            setLoading(false);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setLoading(false);
        }
    };

    if (loading && !profile?.fullName) {
        return (
            <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070')] bg-cover bg-center opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-b from-navy-950/50 via-navy-950 to-navy-950" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 text-center"
                >
                    <div className="w-24 h-24 mb-8 relative mx-auto">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border-t-2 border-gold-400 rounded-full"
                        />
                        <div className="absolute inset-2 border-t-2 border-gold-400/30 rounded-full" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Bed className="w-8 h-8 text-gold-400" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-serif italic text-white mb-2">Preparing your Sanctuary</h2>
                    <p className="text-gold-400/60 text-[10px] uppercase tracking-[0.4em]">LuxeStay Reimagined</p>
                </motion.div>
            </div>
        );
    }

    // ── Razorpay Membership Integration ─────────────────
    const handleBuyMembership = async (tierName, overridePrice) => {
        setLoading(true);
        const token = sessionStorage.getItem('userToken');
        if (!token) { navigate('/login'); return; }

        try {
            // 1. Create Order
            const orderRes = await fetch(`${__API_BASE__}/api/auth/membership/create-order`, {
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
                const verifyRes = await fetch(`${__API_BASE__}/api/auth/membership/verify`, {
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
                    toast.success(`Successfully upgraded to ${tierName}! Your membership is now active.`);
                    fetchAllData();
                } else {
                    toast.error(verifyData.message || 'Membership activation failed.');
                }
                setLoading(false);
                return;
            }

            // 2b. REAL Razorpay path
            if (!(await loadScript('https://checkout.razorpay.com/v1/checkout.js'))) {
                toast.error('Razorpay SDK failed to load. Are you online?');
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
                        const verifyRes = await fetch(`${__API_BASE__}/api/auth/membership/verify`, {
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
                            toast.success(`Successfully upgraded to ${tierName}! Your membership is now active.`);
                            fetchAllData();
                        } else {
                            toast.error(verifyData.message || 'Payment verification failed');
                        }
                    } catch (verifyErr) {
                        console.error('Membership verification error:', verifyErr);
                        toast.error('An unexpected error occurred verifying your membership.');
                    }
                },
                prefill: { name: profile.fullName || 'Guest', email: profile.email || '' },
                theme: { color: '#D4AF37' }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                toast.error(response.error.description);
            });
            rzp.open();

        } catch (err) {
            console.error('Membership Order Error:', err);
            toast.error(err.message || 'An error occurred initiating purchase.');
        } finally {
            setLoading(false);
        }
    };
    // ────────────────────────────────────────────────────

    const handleUseAmenity = async (bookingId, amenityName) => {
        try {
            const token = sessionStorage.getItem('userToken');
            const res = await fetch(`${__API_BASE__}/api/auth/bookings/${bookingId}/amenities/${encodeURIComponent(amenityName)}/use`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success(`${amenityName} marked as used.`);
                fetchAllData();
                // Update viewingBooking state to reflect change
                const updatedBookings = bookings.map(b => b._id === bookingId ? { ...b, addOns: b.addOns.map(a => a.name === amenityName ? { ...a, usageStatus: 'used' } : a) } : b);
                const updated = updatedBookings.find(b => b._id === bookingId);
                setViewingBooking(updated);
            } else {
                const data = await res.json();
                toast.error(data.message || 'Error updating amenity status.');
            }
        } catch (error) {
            console.error('Error using amenity:', error);
            toast.error('Failed to update amenity usage.');
        }
    };

    const handleAddSpa = async (booking) => {
        setSpaBillBooking(null);
        try {
            const token = sessionStorage.getItem('userToken');
            const spaPrice = 1999; // Same as catalog

            // 1. Order
            const orderRes = await fetch(`${__API_BASE__}/api/payment/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ amount: spaPrice })
            });
            if (!orderRes.ok) {
                const errorData = await orderRes.json();
                console.error('Spa Order Error:', errorData);
                throw new Error('Order creation failed');
            }
            const orderData = await orderRes.json();
            console.log('Spa Order Created:', orderData);

            // 2. Razorpay
            if (!(await loadScript('https://checkout.razorpay.com/v1/checkout.js'))) {
                toast.error('Razorpay failed to load');
                return;
            }

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "LuxeStay Spa",
                description: "Add-on Spa Treatment",
                order_id: orderData.id,
                handler: async function (response) {
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
                    console.log('Spa Payment Verification:', verifyData);
                    if (verifyData.success) {
                        console.log('Triggering Backend add-spa...');
                        const addSpaRes = await fetch(`${__API_BASE__}/api/auth/bookings/${booking._id}/add-spa`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ amount: spaPrice, transactionId: response.razorpay_payment_id })
                        });
                        console.log('Add-Spa Response:', addSpaRes.status);
                        if (addSpaRes.ok) {
                            console.log('Spa added successfully on backend');
                            toast.success('Spa added successfully!');
                            fetchAllData();
                            setViewingBooking(null);
                        } else {
                            const addSpaError = await addSpaRes.json();
                            console.error('Add-Spa Backend Error:', addSpaError);
                        }
                    }
                },
                prefill: { name: profile.fullName || 'Guest', email: profile.email || '' },
                theme: { color: '#D4AF37' }
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error('Add Spa Error:', error);
            toast.error('Error adding spa.');
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('userData');
        sessionStorage.removeItem('userToken');
        navigate('/');
    };

    // ── Generic coupon validator ──────────────────────────
    const validateCoupon = async (code, amount, appliesTo) => {
        const res = await fetch(
            `${__API_BASE__}/api/public/coupons/validate?code=${encodeURIComponent(code)}&amount=${amount}&appliesTo=${appliesTo}`
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
            await fetch(`${__API_BASE__}/api/auth/notifications/${id}/read`, {
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
            const res = await fetch(`${__API_BASE__}/api/auth/notifications/clear`, {
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
            const res = await fetch(`${__API_BASE__}/api/auth/profile`, {
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
                toast.success('Profile updated successfully.');
            } else {
                toast.error('Failed to update profile.');
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
        { id: 'dashboard', label: 'Sanctuary', icon: LayoutDashboard },
        { id: 'bookings', label: 'Journeys', icon: Compass },
        { id: 'dining', label: 'Culinary', icon: Utensils },
        { id: 'membership', label: 'Elite Club', icon: Crown },
        { id: 'payment', label: 'Ledger', icon: CreditCard },
        { id: 'reviews', label: 'Reflections', icon: Star },
        { id: 'support', label: 'Concierge', icon: Headset },
        { id: 'profile', label: 'Identity', icon: User },
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
        <div className="space-y-12">
            {/* Hero Section */}
            <section className="relative h-[22rem] rounded-[2.5rem] overflow-hidden group shadow-2xl">
                <motion.div
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0"
                >
                    <img
                        src={displayedBooking?.location?.image || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=2000"}
                        className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                        alt="Resort"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-950/40 to-transparent" />
                </motion.div>

                <div className="relative z-10 h-full p-12 flex flex-col justify-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 text-gold-400 mb-6"
                    >
                        <Sparkles className="w-5 h-5 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">{displayedBooking?.location?.city || 'Aria Collections'} • Experience Reimagined</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-5xl font-serif italic text-white mb-6 tracking-tight leading-tight"
                    >
                        Welcome back,<br />
                        <span className="text-gold-400">{profile?.fullName || 'Esteemed Guest'}</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg text-white/60 max-w-xl mb-10 font-light leading-relaxed"
                    >
                        {hasActiveStay ? 'Your sanctuary is prepared. Immerse yourself in the pinnacle of luxury and bespoke service.' : 'Your next extraordinary journey awaits. Discover our curated collections of world-class retreats.'}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex gap-6"
                    >
                        <button onClick={() => setActiveSection('bookings')} className="premium-button bg-gold-400 text-navy-950 px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-gold-400/10 active:scale-95 flex items-center gap-2">
                            {hasActiveStay ? 'Manage Active Stay' : 'Explore Journeys'}
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <button onClick={() => { if (!hasActiveStay) return toast.error('Concierge services are exclusively available during an active stay.'); setActiveSection('support'); }} className="px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-navy-950 transition-all active:scale-95">
                            Concierge Desk
                        </button>
                    </motion.div>
                </div>

                {/* Ambient Glow */}
                <div className="absolute top-1/2 right-0 w-64 h-64 bg-gold-400/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Stays & Timeline */}
                <div className="lg:col-span-2 space-y-12">
                    {/* Stay Overview */}
                    <section>
                        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                            <div className="flex gap-10">
                                {['Active', 'Upcoming', 'Past'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all relative group ${activeTab === tab ? 'text-gold-400' : 'text-white/40 hover:text-white'}`}
                                    >
                                        {tab}
                                        {activeTab === tab && (
                                            <motion.div
                                                layoutId="tab-underline"
                                                className="absolute -bottom-6 left-0 right-0 h-0.5 bg-gold-400"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Display Card */}
                        <AnimatePresence mode="wait">
                            {displayedBooking ? (
                                <motion.div
                                    key={displayedBooking._id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="glass-panel overflow-hidden flex group min-h-[16rem]"
                                >
                                    <div className="w-72 overflow-hidden relative">
                                        <img
                                            src={displayedBooking.location?.image || "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800"}
                                            className="h-full w-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                                            alt="Suite"
                                        />
                                        <div className="absolute inset-0 bg-navy-950/20 group-hover:bg-transparent transition-colors duration-500" />
                                    </div>
                                    <div className="flex-1 p-8 flex flex-col">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
                                                    <span className="text-[9px] font-black text-gold-400/80 uppercase tracking-[0.3em]">{displayedBooking.location?.city} Hotel</span>
                                                </div>
                                                <h3 className="text-3xl font-serif italic text-white mb-2 leading-tight">{displayedBooking.room?.roomType}</h3>
                                                <div className="flex items-center gap-4 text-white/40 text-[10px] uppercase tracking-widest font-black">
                                                    <span>{new Date(displayedBooking.checkIn).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} — {new Date(displayedBooking.checkOut).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                                                    <span className="w-1 h-1 rounded-full bg-white/20" />
                                                    <span className="text-white/60">Room {displayedBooking.room?.roomNumber}</span>
                                                </div>
                                            </div>
                                            <div className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-[0.2em] uppercase border ${activeTab === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : activeTab === 'Upcoming' ? 'bg-gold-400/10 text-gold-400 border-gold-400/20' : 'bg-white/5 text-white/40 border-white/10'}`}>
                                                {activeTab}
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between">
                                            <div className="flex gap-8">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Occupancy</span>
                                                    <span className="text-[10px] font-bold text-white/80">{displayedBooking.guests?.adults} Adults • {displayedBooking.guests?.children} Child</span>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Services</span>
                                                    <div className="flex gap-3">
                                                        <Utensils className="w-3.5 h-3.5 text-gold-400/60" />
                                                        <Wine className="w-3.5 h-3.5 text-gold-400/60" />
                                                        <Flower2 className="w-3.5 h-3.5 text-gold-400/60" />
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={() => setActiveSection('bookings')} className="group/btn relative flex items-center gap-2 text-[9px] font-black text-gold-400 uppercase tracking-[0.2em]">
                                                Review Details
                                                <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="glass-panel p-16 flex flex-col items-center justify-center text-center opacity-60"
                                >
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                        <Compass className="w-8 h-8 text-white/20" />
                                    </div>
                                    <h3 className="text-xl font-serif italic text-white mb-2">No {activeTab} Records Found</h3>
                                    <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-medium">Your journal awaits its next entry</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </section>

                    {/* Timeline */}
                    <section className="glass-panel p-10">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center border border-gold-400/20">
                                <Clock className="w-5 h-5 text-gold-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">Service Journal</h3>
                                <p className="text-[9px] text-white/40 uppercase tracking-widest mt-0.5">Your bespoke journey log</p>
                            </div>
                        </div>

                        {timelineItems.length > 0 ? (
                            <div className="space-y-12 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-gold-400/40 before:via-gold-400/20 before:to-transparent">
                                {timelineItems.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex gap-10 items-start relative pl-1"
                                    >
                                        <div className={`z-10 w-5 h-5 rounded-full border border-navy-950 flex items-center justify-center ring-4 ${item.active ? 'bg-gold-400 ring-gold-400/20' : 'bg-navy-900 ring-white/5'}`}>
                                            <item.icon className={`w-2.5 h-2.5 ${item.active ? 'text-navy-950' : 'text-white/40'}`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-xs font-bold text-white uppercase tracking-wider">{item.title}</h4>
                                                <span className="text-[10px] text-white/20 font-black uppercase tracking-tighter">{item.time}</span>
                                            </div>
                                            <p className="text-xs text-white/40 leading-relaxed font-light">{item.status}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] italic">No activity recorded for this journey.</p>
                            </div>
                        )}
                    </section>
                </div>

                {/* Right Column: In-Stay Services */}
                <div className="space-y-12">
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <h3 className="text-[10px] font-black text-gold-400 uppercase tracking-[0.4em]">Bespoke Services</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { title: 'Culinary In-Suite', sub: 'Master-chef creations', icon: Utensils, action: () => { if (!hasActiveStay) return toast.error('Available during active stays only.'); navigate('/menu'); } },
                                { title: 'Sanctuary Care', sub: 'Turndown & Refresh', icon: Wind, action: () => { if (!hasActiveStay) return toast.error('Available during active stays only.'); handleServiceRequest('Cleaning'); } },
                                { title: 'Elite Chauffeur', sub: 'Luxury Fleet', icon: Car, action: () => { if (!hasActiveStay) return toast.error('Available during active stays only.'); handleServiceRequest('Transport'); } },
                                { title: 'Grand Spa', sub: 'Bespoke Wellness', icon: Flower2, action: () => { if (!hasActiveStay) return toast.error('Available during active stays only.'); setSpaBillBooking(displayedBooking); } },
                            ].map((service, i) => (
                                <motion.button
                                    key={i}
                                    whileHover={{ x: 8 }}
                                    onClick={service.action}
                                    className="w-full glass-panel bg-white/5 border-white/5 p-6 flex items-center justify-between group hover:border-gold-400/40 hover:bg-gold-400/5 transition-all duration-500 overflow-hidden relative"
                                >
                                    <div className="flex items-center gap-5 relative z-10">
                                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:bg-gold-400/10 group-hover:text-gold-400 transition-all duration-500">
                                            <service.icon className="w-6 h-6" />
                                        </div>
                                        <div className="text-left">
                                            <h4 className="text-xs font-black text-white uppercase tracking-widest group-hover:text-gold-400 transition-colors duration-500">{service.title}</h4>
                                            <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.2em] mt-1 group-hover:text-gold-400/40 transition-colors duration-500">{service.sub}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-gold-400 transition-all duration-500 relative z-10" />

                                    {/* Hover Shine Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                                </motion.button>
                            ))}
                        </div>
                    </section>

                    <section className="glass-panel overflow-hidden relative group">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449156001437-3a16d1dfda0e?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center grayscale opacity-10 group-hover:opacity-20 transition-all duration-1000 group-hover:scale-110" />
                        <div className="relative z-10 p-8 h-64 flex flex-col justify-end">
                            <h4 className="text-xl font-serif italic text-white mb-2">Discover New Horizons</h4>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-black mb-6">Explore our global locations</p>
                            <button onClick={() => navigate('/locations')} className="w-full py-4 bg-white/10 backdrop-blur-md border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-gold-400 hover:text-navy-950 hover:border-gold-400 transition-all duration-500">
                                View Locations
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
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
            const res = await fetch(`${__API_BASE__}/api/auth/bookings/${bookingToCancel._id}/cancel`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success('Reservation cancelled successfully.');
                setCancelModalOpen(false);
                setBookingToCancel(null);
                fetchAllData();
            } else {
                const data = await res.json();
                toast.error(data.message || 'Failed to cancel booking.');
            }
        } catch (err) {
            console.error('Error cancelling booking:', err);
            toast.error('An error occurred while cancelling.');
        }
    };

    const handleCheckIn = async (bookingId) => {
        try {
            const token = sessionStorage.getItem('userToken');
            const res = await fetch(`${__API_BASE__}/api/auth/bookings/${bookingId}/check-in`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success('Checked in successfully. Enjoy your stay!');
                fetchAllData();
            } else {
                const data = await res.json();
                toast.error(data.message || 'Failed to check in.');
            }
        } catch (err) {
            console.error('Check-in error:', err);
            toast.error('Check-in error occurred.');
        }
    };

    const handleCheckOut = async (bookingId) => {
        try {
            const token = sessionStorage.getItem('userToken');
            const res = await fetch(`${__API_BASE__}/api/auth/bookings/${bookingId}/check-out`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success('Checked out successfully. We hope to see you again!');
                // Optimistically update local booking list so the Review form dropdown renders correctly instantly
                setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'CheckedOut' } : b));

                // Pre-select the booking for review
                setReviewForm(prev => ({ ...prev, bookingId }));
                setActiveSection('reviews');
                fetchAllData();
            } else {
                const data = await res.json();
                toast.error(data.message || 'Failed to check out.');
            }
        } catch (err) {
            console.error('Check-out error:', err);
            toast.error('Check-out error occurred.');
        }
    };

    const submitSupportQuery = async (subject, message, priority = 'Standard') => {
        try {
            const token = sessionStorage.getItem('userToken');
            const res = await fetch(`${__API_BASE__}/api/support/submit`, {
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

        if (!subject || !message) return toast.error('Please provide both subject and message.');

        const success = await submitSupportQuery(subject, message, priority);
        if (success) {
            e.target.reset();
            toast.success('Your query has been dispatched to our concierge.');
        } else {
            toast.error('Failed to dispatch query. Please try again.');
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
                    fetch(`${__API_BASE__}/api/reviews/check/${id}`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json())
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
            const res = await fetch(`${__API_BASE__}/api/reviews`, {
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
            { key: 'cleanliness', label: 'Sanitation' },
            { key: 'service', label: 'Concierge' },
            { key: 'location', label: 'Domain' },
            { key: 'foodQuality', label: 'Gastronomy' },
            { key: 'valueForMoney', label: 'Prestige' },
        ];

        if (!hasFetchedReviews && activeSection === 'reviews') {
            setHasFetchedReviews(true);
            fetchMyReviews();
        }

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
            >
                <div className="flex items-center justify-between border-b border-white/5 pb-8">
                    <div>
                        <h2 className="text-3xl font-serif italic text-white mb-2">Reflections</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-black">Your journal of experiences</p>
                    </div>
                    <div className="w-12 h-12 bg-gold-400/10 rounded-xl flex items-center justify-center border border-gold-400/20">
                        <Star className="w-6 h-6 text-gold-400" />
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Review Submission */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-panel p-10 space-y-8"
                    >
                        <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                            <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">Document an Experience</h3>
                        </div>

                        {completedBookings.length === 0 ? (
                            <div className="py-16 text-center space-y-4">
                                <Sparkles className="w-12 h-12 text-white/5 mx-auto animate-pulse" />
                                <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] italic">No completed journeys to reflect upon</p>
                            </div>
                        ) : reviewSuccess ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-16 text-center space-y-6"
                            >
                                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-serif italic text-white mb-2">Gratitude Expressed</h4>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed px-8">{reviewSuccess}</p>
                                </div>
                                <button onClick={() => setReviewSuccess('')} className="text-gold-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition-colors">
                                    Compose New Reflection
                                </button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmitReview} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-1">Sanctuary Selection</label>
                                    <div className="relative">
                                        <select
                                            value={reviewForm.bookingId}
                                            onChange={e => setReviewForm({ ...reviewForm, bookingId: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white/80 font-bold focus:border-gold-400/40 focus:bg-white/10 outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="" className="bg-navy-950">SELECT A RECENT STAY</option>
                                            {completedBookings.map(b => (
                                                <option key={b._id} value={b._id} disabled={!!reviewedBookings[b._id]} className="bg-navy-950">
                                                    {b.room?.roomType?.toUpperCase()} • {b.location?.city?.toUpperCase()} ({new Date(b.checkIn).toLocaleDateString('en-GB')}) {reviewedBookings[b._id] ? '✓ DOCUMENTED' : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 pointer-events-none rotate-90" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-1">Overall Impression</label>
                                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex justify-center">
                                        <StarPicker value={reviewForm.overallRating} onChange={v => setReviewForm({ ...reviewForm, overallRating: v })} />
                                    </div>
                                </div>

                                <div className="space-y-6 bg-white/[0.02] p-8 rounded-[2rem] border border-white/5">
                                    <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-1">Dimensional Performance</label>
                                    <div className="grid gap-6">
                                        {categories.map(cat => (
                                            <div key={cat.key} className="flex items-center justify-between">
                                                <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">{cat.label}</span>
                                                <StarPicker size="w-5 h-5" value={reviewForm.categoryRatings[cat.key]} onChange={v => setReviewForm({ ...reviewForm, categoryRatings: { ...reviewForm.categoryRatings, [cat.key]: v } })} />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-1">Narrative Reflection</label>
                                    <textarea
                                        rows={5}
                                        value={reviewForm.comment}
                                        onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                        placeholder="CHRONICLE YOUR EXPERIENCE..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white placeholder:text-white/10 focus:border-gold-400/40 focus:bg-white/10 transition-all outline-none resize-none font-medium"
                                    />
                                </div>

                                {reviewError && (
                                    <motion.p
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-rose-400 text-[10px] font-black uppercase tracking-widest bg-rose-400/10 border border-rose-400/20 rounded-xl px-6 py-3 flex items-center gap-3"
                                    >
                                        <ShieldAlert className="w-4 h-4" /> {reviewError}
                                    </motion.p>
                                )}

                                <button
                                    type="submit"
                                    disabled={reviewLoading}
                                    className="w-full py-5 bg-gold-400 text-navy-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-gold-400/10 hover:bg-white transition-all disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-3"
                                >
                                    {reviewLoading ? (
                                        <div className="w-5 h-5 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin" />
                                    ) : (
                                        <>SUBMIT REFLECTION</>
                                    )}
                                </button>
                            </form>
                        )}
                    </motion.div>

                    {/* Review History */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                <Clock className="w-5 h-5 text-white/40" />
                            </div>
                            <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">Chronicle History</h3>
                        </div>

                        <div className="space-y-6 max-h-[900px] overflow-y-auto pr-4 custom-scrollbar">
                            {Object.keys(reviewedBookings).length === 0 ? (
                                <div className="glass-panel p-16 text-center space-y-4">
                                    <Compass className="w-12 h-12 text-white/5 mx-auto animate-pulse" />
                                    <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] italic">No past reflections on record</p>
                                </div>
                            ) : (
                                Object.entries(reviewedBookings).map(([bookingId, review], idx) => (
                                    <motion.div
                                        key={bookingId}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + idx * 0.1 }}
                                        className="glass-panel group p-8 hover:border-gold-400/30 transition-all duration-700 relative overflow-hidden"
                                    >
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                                                <span className="text-[9px] font-black text-gold-400/80 uppercase tracking-[0.3em]">Verified Reflection</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <Star
                                                        key={s}
                                                        className={`w-3 h-3 ${s <= review.overallRating ? 'text-gold-400 fill-gold-400' : 'text-white/10'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <blockquote className="text-lg font-serif italic text-white/80 leading-relaxed mb-8">
                                            "{review.comment}"
                                        </blockquote>

                                        <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                            <p className="text-[9px] text-white/20 font-black uppercase tracking-widest">
                                                {new Date(review.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </p>
                                            <span className="text-[8px] px-3 py-1 bg-white/5 border border-white/10 rounded-full text-white/40 uppercase tracking-widest font-black">
                                                Stay Verified
                                            </span>
                                        </div>

                                        {/* Ambient decoration */}
                                        <Star className="absolute -bottom-6 -right-6 w-24 h-24 text-white/[0.02] pointer-events-none group-hover:text-gold-400/[0.03] transition-colors duration-1000" />
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };


    const renderBookings = () => (
        <div className="space-y-12">
            <div className="flex items-center justify-between border-b border-white/5 pb-8">
                <div>
                    <h2 className="text-3xl font-serif italic text-white mb-2">My Journeys</h2>
                    <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-black">A testament to your travels with us</p>
                </div>
                <button
                    onClick={() => navigate('/rooms')}
                    className="group flex items-center gap-3 px-8 py-4 bg-gold-400 text-navy-950 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-gold-400/10 active:scale-95"
                >
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                    Commence Journey
                </button>
            </div>

            <div className="space-y-8">
                {bookings.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-panel p-24 text-center"
                    >
                        <Compass className="w-16 h-16 text-white/5 mx-auto mb-8 animate-pulse" />
                        <h3 className="text-xl font-serif italic text-white mb-3">The Horizon is Open</h3>
                        <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-medium max-w-sm mx-auto">Your travel history is a blank canvas, awaiting the strokes of your next grand adventure.</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {bookings.map((booking, idx) => (
                            <motion.div
                                key={booking._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="glass-panel group overflow-hidden flex flex-col md:flex-row items-stretch hover:border-gold-400/30 transition-all duration-[800ms] relative"
                            >
                                {/* Booking Image */}
                                <div className="w-full md:w-80 h-64 md:h-auto overflow-hidden relative">
                                    <img
                                        src={booking.location?.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80"}
                                        className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                                        alt="Resort"
                                    />
                                    <div className="absolute inset-0 bg-navy-950/20 group-hover:bg-transparent transition-colors duration-700" />
                                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                                        <span className={`px-4 py-1.5 rounded-full text-[8px] font-black tracking-[0.25em] uppercase border backdrop-blur-md shadow-2xl ${booking.status === 'Confirmed' ? 'bg-navy-950/60 text-gold-400 border-gold-400/30' :
                                            booking.status === 'CheckedIn' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/30' :
                                                booking.status === 'CheckedOut' || booking.status === 'Completed' ? 'bg-white/10 text-white border-white/20' :
                                                    'bg-rose-500/20 text-rose-400 border-rose-400/30'
                                            }`}>
                                            {booking.status === 'CheckedIn' ? 'Residence Active' : booking.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Booking Details */}
                                <div className="flex-1 p-10 flex flex-col">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-white/5 pb-8 mb-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                                                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">{booking.location?.city} Hotel</span>
                                            </div>
                                            <h3 className="text-4xl font-serif italic text-white leading-tight">
                                                {booking.room?.roomType}
                                                <span className="block text-sm font-sans not-italic text-white/40 uppercase tracking-[0.3em] mt-2">Suite #{booking.room?.roomNumber}</span>
                                            </h3>
                                        </div>

                                        <div className="text-left md:text-right space-y-4">
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">Total Consideration</p>
                                                <p className="text-3xl font-serif italic text-gold-400">₹{booking.totalPrice?.toLocaleString()}</p>
                                            </div>
                                            <span className={`inline-block px-3 py-1 rounded-lg text-[8px] font-black tracking-[0.2em] uppercase border ${booking.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                booking.paymentStatus === 'Advance Paid' ? 'bg-gold-400/10 text-gold-400 border-gold-400/20' :
                                                    'bg-rose-500/10 text-rose-400 border-rose-400/20'
                                                }`}>
                                                {booking.paymentStatus === 'Paid' ? 'Audited' : booking.paymentStatus === 'Advance Paid' ? 'Advance Secured' : 'Portfolio Pending'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
                                        <div className="space-y-2">
                                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Arrival</span>
                                            <p className="text-xs font-bold text-white uppercase tracking-tighter">{new Date(booking.checkIn).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Departure</span>
                                            <p className="text-xs font-bold text-white uppercase tracking-tighter">{new Date(booking.checkOut).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Composition</span>
                                            <p className="text-xs font-bold text-white uppercase tracking-tighter">{booking.guests?.adults} Adults • {booking.guests?.children} Child</p>
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Identifier</span>
                                            <p className="text-xs font-mono text-gold-400/60 font-bold">#{booking._id.slice(-6).toUpperCase()}</p>
                                        </div>
                                    </div>

                                    <div className="mt-auto flex flex-wrap gap-4 pt-8 border-t border-white/5">
                                        {(booking.paymentStatus === 'Advance Paid' || booking.paymentStatus === 'Pending') && ['Confirmed', 'CheckedIn'].includes(booking.status) && (
                                            <button onClick={() => handleSettleFolio(booking)} className="px-6 py-3 bg-gold-400/10 text-gold-400 border border-gold-400/30 rounded-full font-black text-[9px] uppercase tracking-[0.2em] hover:bg-gold-400 hover:text-navy-950 transition-all">
                                                Settle Portfolio
                                            </button>
                                        )}
                                        {booking.status === 'Confirmed' && new Date() >= new Date(new Date(booking.checkIn).setHours(0, 0, 0, 0)) && (
                                            <button onClick={() => handleCheckIn(booking._id)} className="px-6 py-3 bg-white text-navy-950 rounded-full font-black text-[9px] uppercase tracking-[0.2em] hover:bg-gold-400 transition-all">
                                                Initiate Check-in
                                            </button>
                                        )}
                                        {booking.status === 'CheckedIn' && (
                                            <button onClick={() => handleCheckOut(booking._id)} className="px-6 py-3 bg-rose-500 text-white rounded-full font-black text-[9px] uppercase tracking-[0.2em] hover:bg-rose-600 transition-all">
                                                Conclude Stay
                                            </button>
                                        )}
                                        {booking.status === 'Confirmed' && (
                                            <button onClick={() => openCancelModal(booking)} className="px-6 py-3 bg-white/5 text-white/40 border border-white/10 rounded-full font-black text-[9px] uppercase tracking-[0.2em] hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-400/30 transition-all">
                                                Relinquish Stay
                                            </button>
                                        )}
                                        <button onClick={() => setViewingBooking(booking)} className="px-6 py-3 bg-white/5 text-white/80 border border-white/10 rounded-full font-black text-[9px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all ml-auto">
                                            Archive Details
                                        </button>
                                    </div>
                                </div>

                                {/* Ambient Glow for active stay */}
                                {booking.status === 'CheckedIn' && (
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] rounded-full -mr-16 -mt-16 pointer-events-none" />
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const renderProfile = () => (
        <div className="space-y-12 max-w-5xl">
            {/* Profile Header */}
            <section className="glass-panel p-12 relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-gold-400/5 blur-[100px] rounded-full group-hover:bg-gold-400/10 transition-all duration-1000" />

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="relative">
                        <div className="w-44 h-44 rounded-full border-2 border-gold-400/30 p-2 shadow-2xl relative z-10">
                            <img
                                src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.fullName}&background=0F172A&color=EAB308&bold=true&font-size=0.33`}
                                className="w-full h-full object-cover rounded-full filter contrast-[1.1]"
                                alt="Avatar"
                            />
                        </div>
                        {/* Decorative orbits */}
                        <div className="absolute inset-0 border border-gold-400/10 rounded-full -m-4 animate-[spin_20s_linear_infinite]" />
                        <div className="absolute inset-0 border border-white/5 rounded-full -m-8 animate-[spin_30s_linear_infinite_reverse]" />
                    </div>

                    <div className="text-center md:text-left space-y-4">
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-center md:justify-start gap-3"
                        >
                            <Crown className="w-4 h-4 text-gold-400" />
                            <span className="text-[10px] font-black text-gold-400 uppercase tracking-[0.5em]">Esteemed Member</span>
                        </motion.div>
                        <h2 className="text-5xl md:text-6xl font-serif italic text-white tracking-tight">{profile.fullName}</h2>
                        <div className="flex flex-wrap justify-center md:justify-start gap-6 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                            <span className="flex items-center gap-2">
                                <ShieldAlert className="w-3 h-3 text-gold-400/40" />
                                ID: LS-2026-{profile._id?.slice(-4) || '7721'}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-white/10 self-center" />
                            <span>Patron since {new Date(profile.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Personal Sanctuary Details */}
                <section className="glass-panel p-10 space-y-8">
                    <div className="flex items-center justify-between border-b border-white/5 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                <User className="w-5 h-5 text-white/40" />
                            </div>
                            <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">Credentials</h3>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {isEditingProfile ? (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black text-white/20 uppercase tracking-widest block ml-1">Full Legal Name</label>
                                    <input
                                        type="text"
                                        value={profileFormData.fullName || ''}
                                        onChange={(e) => setProfileFormData({ ...profileFormData, fullName: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-gold-400/40 focus:bg-white/10 transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2 opacity-60">
                                    <label className="text-[8px] font-black text-white/20 uppercase tracking-widest block ml-1">Secure Email (Read-Only)</label>
                                    <input
                                        type="email"
                                        value={profileFormData.email || ''}
                                        readOnly
                                        className="w-full bg-transparent border border-white/5 rounded-2xl px-6 py-4 text-sm text-white/40 cursor-not-allowed font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black text-white/20 uppercase tracking-widest block ml-1">Direct Communication Link</label>
                                    <input
                                        type="text"
                                        value={profileFormData.phoneNumber || ''}
                                        onChange={(e) => setProfileFormData({ ...profileFormData, phoneNumber: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-gold-400/40 focus:bg-white/10 transition-all font-medium"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="group">
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2 transition-colors group-hover:text-gold-400/40">Full Name</p>
                                    <p className="text-sm font-bold text-white/80">{profile.fullName}</p>
                                </div>
                                <div className="group">
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2 transition-colors group-hover:text-gold-400/40">Registered Email</p>
                                    <p className="text-sm font-bold text-white/80">{profile.email}</p>
                                </div>
                                <div className="group">
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2 transition-colors group-hover:text-gold-400/40">Validated Phone</p>
                                    <p className="text-sm font-bold text-white/80">{profile.phoneNumber || 'Awaiting Link'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Behavioral Preferences */}
                <section className="glass-panel p-10 space-y-8 relative overflow-hidden">
                    {/* Background Texture */}
                    <Compass className="absolute -bottom-10 -right-10 w-48 h-48 text-white/[0.02] pointer-events-none" />

                    <div className="flex items-center justify-between border-b border-white/5 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                <Sparkles className="w-5 h-5 text-white/40" />
                            </div>
                            <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">Palate & Preferences</h3>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {isEditingProfile ? (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black text-white/20 uppercase tracking-widest block ml-1">Culinary Orientation</label>
                                    <input
                                        type="text"
                                        value={profileFormData.preferences?.dietary || ''}
                                        onChange={(e) => setProfileFormData({ ...profileFormData, preferences: { ...profileFormData.preferences, dietary: e.target.value } })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-gold-400/40 focus:bg-white/10 transition-all font-medium"
                                        placeholder="e.g. Modernist Indian, Keto-Focused"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black text-white/20 uppercase tracking-widest block ml-1">Sanctuary Configuration</label>
                                    <input
                                        type="text"
                                        value={profileFormData.preferences?.roomType || ''}
                                        onChange={(e) => setProfileFormData({ ...profileFormData, preferences: { ...profileFormData.preferences, roomType: e.target.value } })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-gold-400/40 focus:bg-white/10 transition-all font-medium"
                                        placeholder="e.g. High-Altitude, Silent Wing"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black text-white/20 uppercase tracking-widest block ml-1">Bespoke Requirements</label>
                                    <textarea
                                        rows="2"
                                        value={profileFormData.preferences?.specialRequests || ''}
                                        onChange={(e) => setProfileFormData({ ...profileFormData, preferences: { ...profileFormData.preferences, specialRequests: e.target.value } })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-gold-400/40 focus:bg-white/10 transition-all font-medium resize-none"
                                        placeholder="Describe any unique expectations..."
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="group">
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2 transition-colors group-hover:text-gold-400/40">Gastronomy preference</p>
                                    <p className="text-sm font-bold text-white/80">{profile.preferences?.dietary || 'Authentic Regional'}</p>
                                </div>
                                <div className="group">
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2 transition-colors group-hover:text-gold-400/40">Ambient Atmosphere</p>
                                    <p className="text-sm font-bold text-white/80">{profile.preferences?.roomType || 'Quiet Zone • High Floor'}</p>
                                </div>
                                <div className="group">
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2 transition-colors group-hover:text-gold-400/40">Historical Notes</p>
                                    <p className="text-sm font-bold text-white/80 italic leading-relaxed">"{profile.preferences?.specialRequests || 'No bespoke requirements recorded.'}"</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-10 flex border-t border-white/5">
                        {isEditingProfile ? (
                            <div className="flex gap-4 w-full">
                                <button
                                    onClick={() => setIsEditingProfile(false)}
                                    className="flex-1 py-4 bg-white/5 text-white/40 border border-white/10 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
                                >
                                    Relinquish
                                </button>
                                <button
                                    onClick={handleProfileUpdate}
                                    className="flex-[2] py-4 bg-gold-400 text-navy-950 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-gold-400/10"
                                >
                                    Commit Changes
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => { setProfileFormData({ fullName: profile.fullName, email: profile.email, phoneNumber: profile.phoneNumber, preferences: profile.preferences || {} }); setIsEditingProfile(true); }}
                                className="w-full py-4 bg-white/5 text-white/80 border border-white/10 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-gold-400 hover:text-navy-950 hover:border-gold-400 transition-all group"
                            >
                                Refine Identity
                                <ChevronRight className="w-4 h-4 inline-block ml-2 group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}
                    </div>
                </section>
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
            const orderRes = await fetch(`${__API_BASE__}/api/payment/create-order`, {
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
                            // Settle Folio
                            const settleRes = await fetch(`${__API_BASE__}/api/auth/bookings/${booking._id}/settle-folio`, {
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
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
            >
                <div className="flex items-center justify-between border-b border-white/5 pb-8">
                    <div>
                        <h2 className="text-3xl font-serif italic text-white mb-2">Guest Ledger / Folio</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-black">Consolidated financial records & settlements</p>
                    </div>
                    <div className="w-12 h-12 bg-gold-400/10 rounded-xl flex items-center justify-center border border-gold-400/20">
                        <CreditCard className="w-6 h-6 text-gold-400" />
                    </div>
                </div>

                {outstandingBookings.length > 0 && (
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-rose-400 uppercase tracking-[0.3em] flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> Outstanding Obligations
                        </h3>
                        <div className="grid gap-6">
                            {outstandingBookings.map(b => {
                                const successfulPayments = payments.filter(p => p.booking?._id === b._id && p.status === 'Success');
                                const amountPaid = successfulPayments.reduce((acc, p) => acc + p.amount, 0);
                                const outstandingAmount = b.totalPrice > amountPaid ? b.totalPrice - amountPaid : 0;

                                return (
                                    <div key={b._id} className="glass-panel p-8 flex flex-col sm:flex-row items-center justify-between group hover:border-rose-500/30 transition-all duration-700">
                                        <div className="flex gap-6 items-center w-full sm:w-auto mb-6 sm:mb-0">
                                            <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 border border-rose-500/20 group-hover:bg-rose-500 group-hover:text-white transition-all duration-700">
                                                <AlertCircle className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-serif italic text-white mb-1">{b.room?.roomType} <span className="text-white/20 mx-2">at</span> {b.location?.city}</h4>
                                                <p className="text-[8px] text-white/40 font-black uppercase tracking-widest">Folio #{b._id.slice(-8)} • Arrival: {new Date(b.checkIn).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-10 w-full sm:w-auto justify-between sm:justify-end">
                                            <div className="text-right">
                                                <p className="text-2xl font-serif italic text-white mb-1">₹{outstandingAmount.toLocaleString()}</p>
                                                <span className="px-3 py-0.5 rounded-full text-[7px] font-black tracking-widest uppercase border bg-white/5 text-white/40 border-white/10 group-hover:border-rose-500/30 transition-colors">
                                                    {b.paymentStatus}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleSettleFolio(b)}
                                                className="px-8 py-4 bg-white text-navy-950 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-gold-400 transition-all shadow-lg active:scale-95 whitespace-nowrap"
                                            >
                                                Settle Account
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Historical Transactions</h3>
                    <div className="glass-panel border-white/10 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/[0.02]">
                                        <th className="p-8 text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">ID</th>
                                        <th className="p-8 text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Particulars</th>
                                        <th className="p-8 text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Date</th>
                                        <th className="p-8 text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Method</th>
                                        <th className="p-8 text-[9px] font-black text-white/20 uppercase tracking-[0.3em] text-right">Debit / Credit</th>
                                        <th className="p-8 text-[9px] font-black text-white/20 uppercase tracking-[0.3em] text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="p-24 text-center">
                                                <CreditCard className="w-12 h-12 text-white/5 mx-auto mb-4 animate-pulse" />
                                                <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] italic">No financial movements observed in the ledger.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        payments.map((payment, idx) => (
                                            <motion.tr
                                                key={payment._id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                                            >
                                                <td className="p-8">
                                                    <p className="text-[9px] font-black text-white/40 font-mono tracking-widest uppercase">#{payment.transactionId?.slice(-8) || payment._id.slice(-8)}</p>
                                                </td>
                                                <td className="p-8">
                                                    {payment.booking ? (
                                                        <div className="space-y-1">
                                                            <p className="text-xs font-bold text-white uppercase tracking-wider">Stay at {payment.booking.location?.city || 'LuxeStays'}</p>
                                                            <p className="text-[8px] text-white/20 font-black uppercase tracking-[0.1em]">Folio: #{(payment.booking._id || payment.booking).toString().slice(-6)}</p>
                                                        </div>
                                                    ) : payment.tableReservation ? (
                                                        <div className="space-y-1">
                                                            <p className="text-xs font-bold text-white uppercase tracking-wider">Dining Experience</p>
                                                            <p className="text-[8px] text-white/20 font-black uppercase tracking-[0.1em]">Res: #{(payment.tableReservation._id || payment.tableReservation).toString().slice(-6)}</p>
                                                        </div>
                                                    ) : payment.foodOrder ? (
                                                        <div className="space-y-1">
                                                            <p className="text-xs font-bold text-white uppercase tracking-wider">Sanctuary Dining</p>
                                                            <p className="text-[8px] text-white/20 font-black uppercase tracking-[0.1em]">Order: #{(payment.foodOrder._id || payment.foodOrder).toString().slice(-6)}</p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-1">
                                                            <p className="text-xs font-bold text-white uppercase tracking-wider">Ancillary Charge</p>
                                                            <p className="text-[8px] text-white/20 font-black uppercase tracking-[0.1em]">ID: #{payment._id.slice(-6)}</p>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-8">
                                                    <p className="text-[10px] font-bold text-white/40">{new Date(payment.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                </td>
                                                <td className="p-8">
                                                    <p className="text-[8px] font-black text-white group-hover:text-gold-400 italic uppercase tracking-[0.2em] transition-colors">{payment.method}</p>
                                                </td>
                                                <td className="p-8 text-right">
                                                    <p className="text-sm font-serif italic text-white group-hover:text-gold-400 transition-colors">₹{payment.amount?.toLocaleString()}</p>
                                                </td>
                                                <td className="p-8 text-center">
                                                    <span className={`px-4 py-1 rounded-full text-[7px] font-black tracking-widest uppercase border ${payment.status === 'Success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                                                        {payment.status}
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    const renderSupport = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12"
        >
            <div className="space-y-12">
                <div className="flex items-center justify-between border-b border-white/5 pb-8">
                    <div>
                        <h2 className="text-3xl font-serif italic text-white mb-2">Concierge Support</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-black">Submit your queries to our global desk</p>
                    </div>
                    <div className="w-12 h-12 bg-gold-400/10 rounded-xl flex items-center justify-center border border-gold-400/20">
                        <Headphones className="w-6 h-6 text-gold-400" />
                    </div>
                </div>

                <motion.form
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onSubmit={handleSupportSubmit}
                    className="glass-panel p-10 space-y-8 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-4">Subject of Inquiry</label>
                                <input
                                    name="subject"
                                    type="text"
                                    required
                                    defaultValue={supportFormDefaults.subject}
                                    key={supportFormDefaults.subject}
                                    placeholder="e.g. Booking Modification"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white font-bold tracking-wider focus:border-gold-400/40 focus:bg-white/10 outline-none transition-all placeholder:text-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-4">Priority Level</label>
                                <div className="relative">
                                    <select
                                        name="priority"
                                        defaultValue={supportFormDefaults.priority || "Standard"}
                                        key={supportFormDefaults.priority}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white font-bold tracking-wider focus:border-gold-400/40 focus:bg-white/10 outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="Urgent">Urgent Attention</option>
                                        <option value="Standard">Standard Service</option>
                                        <option value="General">General Inquiry</option>
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                                        <ChevronDown className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-4">Detailed Message</label>
                            <textarea
                                name="message"
                                rows="6"
                                required
                                defaultValue={supportFormDefaults.message}
                                key={supportFormDefaults.message}
                                placeholder="Describe your request in detail..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white font-bold tracking-wider focus:border-gold-400/40 focus:bg-white/10 outline-none transition-all resize-none placeholder:text-white/10"
                            ></textarea>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <button type="submit" className="w-full py-5 bg-gold-400 text-navy-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-gold-400/10 hover:bg-white transition-all active:scale-95">
                            Dispatch to Concierge Desk
                        </button>
                        <div className="flex items-center justify-center gap-2 text-[8px] text-white/20 font-black uppercase tracking-widest italic">
                            <Clock className="w-3 h-3" /> Average response: Within 2 Sanctuary Hours
                        </div>
                    </div>
                </motion.form>
            </div>

            <div className="space-y-8">
                <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                        <History className="w-5 h-5 text-white/40" />
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">Communication Stream</h3>
                </div>

                <div className="space-y-6 max-h-[800px] overflow-y-auto pr-4 custom-scrollbar">
                    {queries.length === 0 ? (
                        <div className="glass-panel p-16 text-center space-y-4">
                            <MessageSquare className="w-12 h-12 text-white/5 mx-auto animate-pulse" />
                            <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] italic">No active dispatches in the stream</p>
                        </div>
                    ) : (
                        queries.map((q, idx) => (
                            <motion.div
                                key={q._id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="glass-panel p-8 space-y-6 group hover:border-gold-400/30 transition-all duration-700 relative overflow-hidden"
                            >
                                <div className="flex items-start justify-between relative z-10">
                                    <div className="space-y-2">
                                        <h4 className="text-lg font-serif italic text-white group-hover:text-gold-400 transition-colors uppercase tracking-tight">{q.subject}</h4>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-widest border ${q.priority === 'Urgent' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                                q.priority === 'Standard' ? 'bg-gold-400/10 text-gold-400 border-gold-400/20' :
                                                    'bg-white/5 text-white/40 border-white/10'
                                                }`}>
                                                {q.priority}
                                            </span>
                                            <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">{new Date(q.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-full text-[8px] font-black tracking-widest uppercase border ${q.status === 'Open' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                        q.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            'bg-white/5 text-white/20 border-white/10'
                                        }`}>
                                        {q.status}
                                    </span>
                                </div>

                                <p className="text-xs text-white/60 leading-relaxed font-medium relative z-10">{q.message}</p>

                                {q.adminResponse && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-6 pt-6 border-t border-white/5 space-y-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                                            <p className="text-[9px] font-black text-gold-400/60 uppercase tracking-[0.2em]">Concierge Internal response</p>
                                        </div>
                                        <p className="text-xs text-white p-5 bg-white/[0.03] rounded-2xl italic border border-white/5 font-serif">{q.adminResponse}</p>
                                    </motion.div>
                                )}

                                {/* Ambient decoration */}
                                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gold-400/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </motion.div>
    );

    const renderDining = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
        >
            <div className="flex items-center justify-between border-b border-white/5 pb-8">
                <div>
                    <h2 className="text-3xl font-serif italic text-white mb-2">Culinary Experiences</h2>
                    <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-black">Gastronomy redefined in your sanctuary</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gold-400/10 rounded-xl flex items-center justify-center border border-gold-400/20">
                        <Utensils className="w-6 h-6 text-gold-400" />
                    </div>
                </div>
            </div>

            {/* ── Dining Coupon ── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-panel border-gold-400/20 p-8 overflow-hidden relative group"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />

                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3 mb-6">
                    <Sparkles className="w-4 h-4 text-gold-400" />
                    Exquisite Offers
                    <span className="ml-auto text-[8px] text-white/20 font-black tracking-widest">e.g. RESERVE15</span>
                </h3>

                {diningCouponStatus === 'valid' ? (
                    <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-6 py-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-emerald-400 text-sm font-bold tracking-tight">{diningCouponCode} applied successfully</p>
                                <p className="text-emerald-400/50 text-[10px] uppercase tracking-widest font-black mt-0.5">{diningCouponMessage}</p>
                            </div>
                        </div>
                        <button onClick={removeDiningCoupon} className="w-10 h-10 flex items-center justify-center rounded-full text-white/20 hover:text-white hover:bg-white/5 transition-all">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={diningCouponInput}
                                onChange={e => setDiningCouponInput(e.target.value.toUpperCase())}
                                onKeyDown={e => e.key === 'Enter' && handleDiningCoupon()}
                                placeholder="ENTER VOUCHER CODE"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white font-black tracking-widest focus:border-gold-400/40 focus:bg-white/10 outline-none transition-all placeholder:text-white/10"
                            />
                        </div>
                        <button
                            onClick={handleDiningCoupon}
                            disabled={diningCouponValidating || !diningCouponInput.trim()}
                            className="px-10 py-4 bg-gold-400 text-navy-950 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50 shadow-lg shadow-gold-400/10"
                        >
                            {diningCouponValidating ? 'Verifying...' : 'Validate'}
                        </button>
                    </div>
                )}
                {diningCouponStatus === 'invalid' && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-rose-400 text-[10px] font-black uppercase tracking-widest mt-4 flex items-center gap-2"
                    >
                        <ShieldAlert className="w-3 h-3" /> {diningCouponMessage}
                    </motion.p>
                )}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <TableReservationForm
                        user={user}
                        onSuccess={fetchAllData}
                        userBookings={bookings}
                        appliedCouponCode={diningCouponCode}
                        couponDiscount={diningCouponDiscount}
                    />
                </motion.div>

                <div className="space-y-8">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                            <Calendar className="w-5 h-5 text-white/40" />
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">Upcoming Reservations</h3>
                    </div>

                    <div className="space-y-6 max-h-[800px] overflow-y-auto pr-4 custom-scrollbar">
                        {diningReservations.length === 0 ? (
                            <div className="glass-panel p-16 text-center space-y-4">
                                <Wine className="w-12 h-12 text-white/5 mx-auto animate-pulse" />
                                <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] italic">No culinary encounters scheduled</p>
                            </div>
                        ) : (
                            diningReservations.map((res, idx) => (
                                <motion.div
                                    key={res._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + idx * 0.1 }}
                                    className="glass-panel group p-8 hover:border-gold-400/30 transition-all duration-700 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-6">
                                        <span className={`px-4 py-1 rounded-full text-[8px] font-black tracking-widest uppercase border ${res.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gold-400/10 text-gold-400 border-gold-400/20'}`}>
                                            {res.status}
                                        </span>
                                    </div>

                                    <div className="flex gap-6 items-start mb-8">
                                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex flex-col items-center justify-center border border-white/10 group-hover:bg-gold-400/10 group-hover:border-gold-400/20 transition-all duration-700">
                                            <span className="text-lg font-serif italic text-gold-400">{res.guests}</span>
                                            <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Patrons</span>
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-serif italic text-white mb-2">Grand Dining Hall</h4>
                                            <div className="flex items-center gap-4">
                                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                                                    {new Date(res.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </p>
                                                <span className="w-1 h-1 rounded-full bg-white/10" />
                                                <p className="text-[10px] font-black text-gold-400/60 uppercase tracking-widest">{res.time}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {res.preBookedMeals && res.preBookedMeals.length > 0 && (
                                        <div className="mt-8 pt-8 border-t border-white/5 space-y-6">
                                            <div className="flex items-center gap-3">
                                                <Utensils className="w-3 h-3 text-gold-400/60" />
                                                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Bespoke Menu Selection</p>
                                            </div>

                                            <div className="grid gap-3">
                                                {res.preBookedMeals.map((meal, mIdx) => (
                                                    <div key={mIdx} className="flex justify-between items-center bg-white/[0.02] p-4 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors">
                                                        <span className="text-xs font-medium text-white/60">
                                                            <span className="text-gold-400/40 mr-2">{meal.quantity}x</span>
                                                            {meal.menuItem?.name || 'Artisanal Creation'}
                                                        </span>
                                                        <span className="text-xs font-serif italic text-gold-400">₹{(meal.quantity * (meal.menuItem?.price || 0)).toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Culinary Total</span>
                                                <div className="text-right">
                                                    <span className="text-lg font-serif italic text-gold-400">₹{res.totalPreBookedAmount?.toLocaleString() || '0'}</span>
                                                    <p className="text-[7px] text-white/10 uppercase tracking-widest font-black mt-1">Gratuity Included</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Ambient background decoration */}
                                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gold-400/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const renderMembership = () => {
        const tiers = [
            { name: 'Silver', price: 2999, desc: '5% off bookings, priority check-in', icon: <ShieldCheck className="w-8 h-8" />, color: 'text-slate-400', border: 'border-slate-400/20', glow: 'bg-slate-400/5' },
            { name: 'Gold', price: 5999, desc: '10% off bookings + dining, lounge access', icon: <Crown className="w-8 h-8" />, color: 'text-gold-400', border: 'border-gold-400/20', glow: 'bg-gold-400/5' },
            { name: 'Platinum', price: 9999, desc: '15% off all + spa credits + room upgrades', icon: <Sparkles className="w-8 h-8" />, color: 'text-gold-400', border: 'border-gold-400/20', glow: 'bg-gold-400/10' },
            { name: 'Diamond', price: 19999, desc: '20% off + butler service + airport transfer', icon: <Gem className="w-8 h-8" />, color: 'text-purple-400', border: 'border-purple-400/20', glow: 'bg-purple-400/5' },
            { name: 'Black Card', price: 49999, desc: '30% off + exclusive events + personal concierge', icon: <ShieldAlert className="w-8 h-8" />, color: 'text-zinc-400', border: 'border-white/10', glow: 'bg-white/5', glass: 'bg-black/60' }
        ];

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
            >
                <div className="flex items-center justify-between border-b border-white/5 pb-8">
                    <div>
                        <h2 className="text-3xl font-serif italic text-white mb-2">Prestige Membership</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-black">Unlock the heights of hospitality</p>
                    </div>
                    <div className="w-12 h-12 bg-gold-400/10 rounded-xl flex items-center justify-center border border-gold-400/20">
                        <Crown className="w-6 h-6 text-gold-400" />
                    </div>
                </div>

                {profile?.membershipTier && profile.membershipTier !== 'None' ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-panel border-gold-400/30 p-10 relative overflow-hidden group"
                    >
                        {/* Animated background element */}
                        <div className="absolute -right-20 -top-20 w-80 h-80 bg-gold-400/10 blur-[100px] rounded-full group-hover:bg-gold-400/20 transition-all duration-1000" />

                        <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center justify-between">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="px-4 py-1.5 bg-gold-400/10 border border-gold-400/20 rounded-full text-[8px] font-black tracking-[0.3em] text-gold-400 uppercase">
                                        Active Privilege
                                    </div>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                </div>
                                <h3 className="text-5xl font-serif italic text-white tracking-tight">{profile.membershipTier} Tier</h3>
                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] max-w-md leading-relaxed">
                                    Your status is recognized across all our global sanctuaries.
                                    Bespoke privileges and exclusive tariffs are automatically honored.
                                </p>
                            </div>

                            <div className="w-full md:w-auto text-center px-10 py-8 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 group-hover:border-gold-400/30 transition-all duration-700">
                                <Crown className="w-10 h-10 text-gold-400 mx-auto mb-4" />
                                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-4">Elite Renewal Cycle</p>
                                <div className="px-6 py-3 bg-gold-400 text-navy-950 rounded-full font-black text-[9px] uppercase tracking-widest cursor-default">
                                    Perpetual Status
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="glass-panel p-16 text-center space-y-6 border-white/10">
                        <Crown className="w-16 h-16 text-white/5 mx-auto animate-pulse" />
                        <h3 className="text-xl font-serif italic text-white">The Journey to Excellence Awaits</h3>
                        <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed">
                            You are currently traveling as an independent voyager.
                            Ascend through our tiers to unlock a world of reimagined luxury.
                        </p>
                    </div>
                )}

                <div className="space-y-10">
                    {/* ── Membership Coupon ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-panel border-gold-400/20 p-8 overflow-hidden relative group"
                    >
                        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3 mb-6">
                            <Sparkles className="w-4 h-4 text-gold-400" />
                            Invitation Codes
                            <span className="ml-auto text-[8px] text-white/20 font-black tracking-widest">e.g. MEMBERSHIP20</span>
                        </h3>

                        {memberCouponStatus === 'valid' ? (
                            <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-emerald-400 text-sm font-bold tracking-tight">{memberCouponCode} validated</p>
                                        <p className="text-emerald-400/50 text-[10px] uppercase tracking-widest font-black mt-0.5">{memberCouponMessage}</p>
                                    </div>
                                </div>
                                <button onClick={removeMemberCoupon} className="w-10 h-10 flex items-center justify-center rounded-full text-white/20 hover:text-white hover:bg-white/5 transition-all">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={memberCouponInput}
                                        onChange={e => setMemberCouponInput(e.target.value.toUpperCase())}
                                        onKeyDown={e => e.key === 'Enter' && handleMemberCoupon()}
                                        placeholder="ENTER PRIVILEGE CODE"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white font-black tracking-widest focus:border-gold-400/40 focus:bg-white/10 outline-none transition-all placeholder:text-white/10"
                                    />
                                </div>
                                <button
                                    onClick={handleMemberCoupon}
                                    disabled={memberCouponValidating || !memberCouponInput.trim()}
                                    className="px-10 py-4 bg-gold-400 text-navy-950 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50 shadow-lg shadow-gold-400/10"
                                >
                                    {memberCouponValidating ? 'Authenticating...' : 'Authenticate'}
                                </button>
                            </div>
                        )}
                        {memberCouponStatus === 'invalid' && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-rose-400 text-[10px] font-black uppercase tracking-widest mt-4 flex items-center gap-2"
                            >
                                <ShieldAlert className="w-3 h-3" /> {memberCouponMessage}
                            </motion.p>
                        )}
                    </motion.div>

                    <div className="space-y-8">
                        <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Ascension Tiers</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {tiers.map((t, idx) => {
                                const discountedPrice = memberCouponDiscount > 0
                                    ? Math.round(t.price * (1 - memberCouponDiscount / 100))
                                    : t.price;
                                const isCurrent = profile?.membershipTier === t.name;

                                return (
                                    <motion.div
                                        key={t.name}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className={`glass-panel p-8 flex flex-col hover:border-gold-400/30 transition-all duration-700 relative group overflow-hidden ${t.glass || ''}`}
                                    >
                                        <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 opacity-20 group-hover:opacity-40 transition-opacity duration-1000 ${t.glow}`} />

                                        <div className={`w-14 h-14 rounded-2xl bg-white/5 border ${t.border} flex items-center justify-center mb-8 relative z-10 group-hover:bg-white group-hover:scale-110 transition-all duration-700`}>
                                            <div className={`${t.color} group-hover:text-navy-950 transition-colors`}>{t.icon}</div>
                                        </div>

                                        <h4 className={`text-2xl font-serif italic mb-2 relative z-10 ${t.color}`}>{t.name}</h4>

                                        <div className="mb-8 relative z-10">
                                            {memberCouponDiscount > 0 ? (
                                                <div className="space-y-1">
                                                    <span className="line-through text-white/10 text-[9px] font-black uppercase tracking-widest">₹{t.price.toLocaleString()}</span>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-2xl font-serif italic text-gold-400">₹{discountedPrice.toLocaleString()}</span>
                                                        <span className="text-[7px] text-white/20 font-black uppercase tracking-widest">/ Annual Contribution</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-2xl font-serif italic text-white">₹{t.price.toLocaleString()}</span>
                                                    <span className="text-[7px] text-white/20 font-black uppercase tracking-widest">/ Annual Contribution</span>
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-relaxed mb-10 flex-1 relative z-10">{t.desc}</p>

                                        <button
                                            onClick={() => handleBuyMembership(t.name, discountedPrice)}
                                            disabled={isCurrent || loading}
                                            className={`w-full py-4 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all relative z-10 ${isCurrent
                                                ? 'bg-white/5 text-white/20 cursor-default border border-white/5'
                                                : 'bg-gold-400 text-navy-950 hover:bg-white shadow-lg shadow-gold-400/5 active:scale-95'
                                                }`}
                                        >
                                            {isCurrent ? 'Current Standing' : 'Ascend Now'}
                                        </button>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-navy-950 text-white flex font-sans selection:bg-gold-400 selection:text-navy-950 overflow-hidden">
            {/* Cinematic Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070')] bg-cover bg-center opacity-[0.03] scale-110" />
                <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-950 to-navy-900" />
                <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gold-400/5 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2" />
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-navy-950/80 backdrop-blur-md z-[60] lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-[70] w-80 transform transition-transform duration-500 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="h-full bg-navy-950/40 backdrop-blur-2xl border-r border-white/5 flex flex-col overflow-hidden relative">
                    {/* Sidebar Decoration */}
                    <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-gold-400/20 to-transparent" />

                    <div className="p-8 relative">
                        <div className="flex items-center justify-between mb-12">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-4"
                            >
                                <div className="w-12 h-12 bg-gold-400/10 rounded-xl flex items-center justify-center border border-gold-400/20 shadow-lg shadow-gold-400/5 group">
                                    <Bed className="w-6 h-6 text-gold-400 group-hover:scale-110 transition-transform" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-serif italic text-white tracking-wide">LuxeStay</h1>
                                    <p className="text-[8px] text-gold-400/50 uppercase tracking-[0.3em] font-light">The Reimagined</p>
                                </div>
                            </motion.div>
                            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <nav className="space-y-2">
                            {sidebarLinks.map((link, idx) => {
                                const Icon = link.icon;
                                const isActive = activeSection === link.id;
                                return (
                                    <motion.button
                                        key={link.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => {
                                            if (['dining', 'support'].includes(link.id)) {
                                                if (!hasActiveStay && upcomingBookings.length === 0) {
                                                    toast.error(`Please secure a sanctuary to access ${link.label} services.`);
                                                    return;
                                                }
                                            }
                                            setActiveSection(link.id);
                                            setIsSidebarOpen(false);
                                        }}
                                        className={`w-full group relative flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 overflow-hidden ${isActive
                                            ? 'bg-gold-400/10 text-gold-400 shadow-lg shadow-gold-400/5'
                                            : 'text-white/40 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-pill"
                                                className="absolute left-0 w-1 h-6 bg-gold-400 rounded-r-full"
                                            />
                                        )}
                                        <Icon className={`w-5 h-5 transition-transform duration-500 group-hover:scale-110 ${isActive ? 'text-gold-400' : 'text-inherit'}`} />
                                        <span className={`text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>{link.label}</span>
                                    </motion.button>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="mt-auto p-8 border-t border-white/5 space-y-8 relative">
                        {/* Membership Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => setActiveSection('membership')}
                            className="glass-panel border-gold-400/20 p-5 group cursor-pointer hover:border-gold-400/40 transition-all overflow-hidden relative"
                        >
                            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                <Crown className="w-20 h-20 text-gold-400" />
                            </div>
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gold-400/10 flex items-center justify-center border border-gold-400/30 group-hover:bg-gold-400 group-hover:text-navy-950 transition-all duration-500 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                                    <Crown className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-white mb-0.5">
                                        {profile?.membershipTier && profile.membershipTier !== 'None' ? `${profile.membershipTier} Member` : 'Discovery Tier'}
                                    </h4>
                                    <p className="text-[8px] text-gold-400/60 uppercase tracking-widest font-black">
                                        {profile?.membershipTier && profile.membershipTier !== 'None' ? 'Elite Benefits Active' : 'Unlock Excellence'}
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Profile Section */}
                        <div className="flex items-center gap-4">
                            <div className="relative group flex-shrink-0">
                                <div className="absolute -inset-1 bg-gold-400/20 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500" />
                                <div className="w-12 h-12 rounded-full border border-white/10 p-1 relative bg-navy-950 overflow-hidden shadow-xl">
                                    <img
                                        src={profile?.avatar || `https://ui-avatars.com/api/?name=${profile?.fullName}&background=2563EB&color=fff`}
                                        alt="User"
                                        className="w-full h-full object-cover rounded-full grayscale-[0.2] hover:grayscale-0 transition-all duration-500"
                                    />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-serif italic text-white truncate">{profile?.fullName}</h4>
                                <p className="text-[9px] text-white/30 uppercase tracking-widest font-black mt-0.5 group-hover:text-gold-400/60 transition-colors">#{profile?._id?.slice(-4)} • {profile?.role}</p>
                            </div>
                            <button onClick={handleLogout} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white/40 hover:text-rose-400 hover:bg-rose-400/10 transition-all group">
                                <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-80 relative z-10 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="h-24 flex items-center justify-between px-8 lg:px-12 border-b border-white/5 bg-navy-950/20 backdrop-blur-md relative z-50">
                    <div className="flex items-center gap-6">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden w-11 h-11 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white transition-all">
                            <Menu className="w-5 h-5" />
                        </button>
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h2 className="text-sm font-serif italic text-white/60">Welcome back,</h2>
                            <p className="text-lg font-serif italic text-white">{profile?.fullName?.split(' ')[0] || 'Esteemed Guest'}</p>
                        </motion.div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Notifications */}
                        <div className="relative">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                className={`w-11 h-11 flex items-center justify-center rounded-xl border transition-all duration-300 ${isNotificationOpen ? 'bg-gold-400 border-gold-400 text-navy-950' : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/20'}`}
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 border-2 border-navy-950 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                                        {unreadCount}
                                    </span>
                                )}
                            </motion.button>

                            <AnimatePresence>
                                {isNotificationOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                        className="absolute top-16 right-0 w-96 glass-panel border-white/10 shadow-2xl z-[100] overflow-hidden"
                                    >
                                        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
                                            <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-white">Notifications</h3>
                                            {notifications.length > 0 && (
                                                <button onClick={handleClearNotifications} className="text-[9px] font-black text-gold-400/60 hover:text-gold-400 transition-colors uppercase tracking-widest">
                                                    Clear All
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                            {notifications.length === 0 ? (
                                                <div className="p-12 text-center">
                                                    <Bell className="w-10 h-10 text-white/10 mx-auto mb-4" />
                                                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Your stream is empty</p>
                                                </div>
                                            ) : (
                                                notifications.map(n => (
                                                    <div
                                                        key={n._id}
                                                        onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                                                        className={`p-5 border-b border-white/5 cursor-pointer transition-all hover:bg-white/5 relative group ${!n.isRead ? 'bg-gold-400/5' : ''}`}
                                                    >
                                                        {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold-400" />}
                                                        <div className="flex items-start justify-between gap-3 mb-2">
                                                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${n.type === 'System' ? 'text-gold-400 border-gold-400/20 bg-gold-400/5' : n.type === 'Staff Alert' ? 'text-amber-400 border-amber-400/20 bg-amber-400/5' : 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5'}`}>{n.type}</span>
                                                            <span className="text-[8px] text-white/20 font-medium uppercase tracking-tighter">{new Date(n.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className={`text-xs leading-relaxed ${!n.isRead ? 'text-white' : 'text-white/40'}`}>{n.message}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <button onClick={() => setActiveSection('profile')} className="w-11 h-11 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white hover:border-white/20 transition-all cursor-pointer">
                            <Settings className="w-5 h-5" />
                        </button>

                        <div className="h-8 w-px bg-white/5 mx-2" />

                        <button
                            onClick={handleLogout}
                            className="group flex items-center gap-3 px-6 py-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all duration-500 font-bold text-[10px] uppercase tracking-widest"
                        >
                            <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                            <span>Departure</span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                    <div className="px-8 lg:px-12 py-12 pb-32 max-w-7xl mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeSection}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                            >
                                {activeSection === 'dashboard' && renderDashboardOverview()}
                                {activeSection === 'bookings' && renderBookings()}
                                {activeSection === 'dining' && renderDining()}
                                {activeSection === 'reviews' && renderReviews()}
                                {activeSection === 'profile' && renderProfile()}
                                {activeSection === 'payment' && renderPaymentHistory()}
                                {activeSection === 'support' && renderSupport()}
                                {activeSection === 'membership' && renderMembership()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Cancellation Modal */}
                {cancelModalOpen && bookingToCancel && (
                    <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4 text-left">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-panel border-rose-500/30 w-full max-w-lg p-10 space-y-8 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />

                            <button onClick={() => setCancelModalOpen(false)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                                    <ShieldAlert className="w-7 h-7 text-rose-500" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-serif italic text-white leading-none">Relinquish Stay</h3>
                                    <p className="text-[10px] text-white/40 tracking-[0.2em] uppercase font-black">Cancellation Review</p>
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
                                <div className="flex justify-between items-center pb-6 border-b border-white/5">
                                    <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">Total Secured</span>
                                    <span className="text-lg font-serif italic text-white">₹{bookingToCancel.totalPrice?.toLocaleString() || 0}</span>
                                </div>

                                {bookingToCancel.paymentStatus === 'Advance Paid' ? (
                                    <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-6">
                                        <p className="text-rose-400 text-[10px] leading-relaxed text-center font-bold uppercase tracking-wider">
                                            As this sanctuary was secured with a 25% Advance, the deposit is strictly non-refundable per our charter.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">Eligible Credit ({refundPercentage}%)</span>
                                            <span className="text-emerald-400 font-serif italic text-lg tracking-wide">₹{refundAmount.toLocaleString()}</span>
                                        </div>
                                        {refundPercentage < 75 && (
                                            <p className="text-[9px] text-white/20 font-black uppercase tracking-widest italic text-center">
                                                Credit adjusted for proximity to arrival
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <button
                                    onClick={() => setCancelModalOpen(false)}
                                    className="py-5 rounded-2xl border border-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all outline-none"
                                >
                                    Retain Sanctuary
                                </button>
                                <button
                                    onClick={handleCancelBooking}
                                    className="py-5 rounded-2xl bg-rose-500 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-500/20 transition-all hover:bg-rose-600 active:scale-95 outline-none"
                                >
                                    Confirm Relinquish
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Booking Details Modal */}
                {viewingBooking && (
                    <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4 text-left">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-panel border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative shadow-2xl"
                        >
                            <div className="absolute top-0 right-0 w-48 h-48 bg-gold-400/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />

                            <div className="p-10 border-b border-white/5 flex items-center justify-between relative z-10">
                                <div>
                                    <h3 className="text-3xl font-serif italic text-white mb-2">Sanctuary Details</h3>
                                    <p className="text-[10px] text-white/40 tracking-[0.4em] uppercase font-black">Folio #{viewingBooking._id?.slice(-8)}</p>
                                </div>
                                <button onClick={() => setViewingBooking(null)} className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 text-white/20 hover:text-white hover:bg-white/10 transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-12">
                                <div className="grid grid-cols-2 gap-8 bg-white/[0.02] border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Compass className="w-12 h-12 text-gold-400 animate-spin-slow" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Sanctuary Tier</p>
                                        <p className="text-lg font-serif italic text-gold-400">{viewingBooking.room?.roomType}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Standing</p>
                                        <p className={`text-sm font-black uppercase tracking-widest ${viewingBooking.status === 'Confirmed' || viewingBooking.status === 'CheckedIn' ? 'text-emerald-400' : 'text-white/40'}`}>{viewingBooking.status}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Arrival</p>
                                        <p className="text-sm font-bold text-white uppercase tracking-wider">{new Date(viewingBooking.checkIn).toLocaleDateString()}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Departure</p>
                                        <p className="text-sm font-bold text-white uppercase tracking-wider">{new Date(viewingBooking.checkOut).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                {viewingBooking.guestDetails && viewingBooking.guestDetails.length > 0 && (
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-3">
                                            <Users className="w-4 h-4 text-gold-400" />
                                            Registered Patrons
                                        </h4>
                                        <div className="grid gap-4">
                                            {viewingBooking.guestDetails.map((guest, idx) => (
                                                <div key={idx} className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-3">
                                                            <p className="text-sm font-bold text-white tracking-tight">{guest.name}</p>
                                                            <span className="px-2 py-0.5 bg-gold-400/10 text-gold-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-gold-400/20">{guest.type}</span>
                                                        </div>
                                                        <p className="text-[9px] text-white/20 font-black uppercase tracking-widest">Age: {guest.age} • {guest.gender} {guest.phone && `• ${guest.phone}`}</p>
                                                    </div>
                                                    {guest.idType && guest.idNumber && (
                                                        <div className="text-right">
                                                            <p className="text-[8px] font-black text-white/10 uppercase tracking-[0.3em] mb-1">{guest.idType}</p>
                                                            <p className="text-xs font-mono text-white/40 tracking-wider group-hover:text-white transition-colors">{guest.idNumber}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {((viewingBooking.addOns && viewingBooking.addOns.length > 0) || getExclusiveBenefits(profile?.membershipTier).length > 0) && (
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-3">
                                            <Crown className="w-4 h-4 text-gold-400" />
                                            Bespoke Privileges
                                        </h4>
                                        <div className="grid gap-4">
                                            {getExclusiveBenefits(profile?.membershipTier).map((benefit, idx) => (
                                                <div key={`benefit-${idx}`} className="bg-gold-400/5 border border-gold-400/20 p-6 rounded-2xl flex items-center justify-between group hover:bg-gold-400/10 transition-all duration-500">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center border border-gold-400/20">
                                                            <Star className="w-4 h-4 text-gold-400" />
                                                        </div>
                                                        <p className="text-sm font-serif italic text-white">{benefit}</p>
                                                    </div>
                                                    <span className="text-[8px] px-3 py-1 bg-gold-400/10 text-gold-400 border border-gold-400/20 rounded-full font-black uppercase tracking-widest">Elite Benefit</span>
                                                </div>
                                            ))}

                                            {viewingBooking.addOns?.map((addon, idx) => (
                                                <div key={idx} className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl flex items-center justify-between group/addon hover:border-gold-400/30 transition-all duration-700">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-4">
                                                            <p className="text-sm font-bold text-white tracking-tight">{addon.name}</p>
                                                            <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border transition-colors ${addon.usageStatus === 'used'
                                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                                : 'bg-gold-400/10 text-gold-400 border-gold-400/20'
                                                                }`}>
                                                                {addon.usageStatus === 'used' ? 'Cultivated' : 'Reserved'}
                                                            </span>
                                                        </div>
                                                        {addon.spaSchedule && (
                                                            <div className="flex items-center gap-2 text-[9px] text-white/40 font-black uppercase tracking-widest">
                                                                <Clock className="w-3 h-3 text-gold-400" />
                                                                {new Date(addon.spaSchedule).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {addon.usageStatus === 'unused' && (
                                                        <button
                                                            onClick={() => handleUseAmenity(viewingBooking._id, addon.name)}
                                                            className="px-6 py-2 bg-white text-navy-950 rounded-xl text-[9px] font-black uppercase tracking-widest opacity-0 group-hover/addon:opacity-100 transition-all hover:bg-gold-400 active:scale-95"
                                                        >
                                                            Cultivate Now
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {(!viewingBooking.addOns || !viewingBooking.addOns.some(a => a.name.toLowerCase().includes('spa'))) && (viewingBooking.status === 'Confirmed' || viewingBooking.status === 'CheckedIn') && (
                                    <div className="glass-panel border-gold-400/20 p-8 flex flex-col items-center text-center space-y-6 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gold-400/5 blur-3xl rounded-full scale-150 group-hover:bg-gold-400/10 transition-colors duration-1000" />
                                        <Flower2 className="w-10 h-10 text-gold-400 relative z-10 animate-pulse" />
                                        <div className="relative z-10 space-y-2">
                                            <h4 className="text-xl font-serif italic text-white">The Restorative Path</h4>
                                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] max-w-[280px] leading-relaxed italic">
                                                Enrich your journey with a restorative 60-minute therapeutic session.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setSpaBillBooking(viewingBooking)}
                                            className="px-8 py-4 bg-gold-400 text-navy-950 rounded-2xl font-black text-[9px] uppercase tracking-widest relative z-10 hover:bg-white transition-all shadow-lg active:scale-95"
                                        >
                                            Incur Therapeutic Session (₹1,999)
                                        </button>
                                    </div>
                                )}

                                {viewingBooking.specialRequests && (
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Bespoke Requests</h4>
                                        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
                                            <p className="text-xs text-white/60 leading-relaxed italic font-serif leading-relaxed">"{viewingBooking.specialRequests}"</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
                {/* Spa Bill Modal */}
                <AnimatePresence>
                    {spaBillBooking && (
                        <div className="fixed inset-0 bg-navy-950/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4 text-left">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="glass-panel border-gold-400/30 w-full max-w-lg rounded-[2rem] overflow-hidden shadow-2xl relative"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />

                                <div className="p-10 border-b border-white/5 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gold-400/10 flex items-center justify-center border border-gold-400/20">
                                            <Flower2 className="w-6 h-6 text-gold-400" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-2xl font-serif italic text-white leading-none">The Restorative Path</h3>
                                            <p className="text-[10px] text-white/40 tracking-[0.2em] uppercase font-black">Treatment Folio</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-10 space-y-10">
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center pb-6 border-b border-white/5">
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-white">60-Min Restorative Session</p>
                                                <p className="text-[10px] text-white/20 font-black uppercase tracking-widest italic">Therapeutic excellence</p>
                                            </div>
                                            <span className="text-xl font-serif italic text-white">₹1,999</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] text-white/20 font-black uppercase tracking-widest leading-none">Sanctuary Charge Total</span>
                                            <span className="text-2xl font-serif italic text-gold-400">₹1,999</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setSpaBillBooking(null)}
                                            className="py-5 rounded-2xl border border-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all outline-none"
                                        >
                                            Defer
                                        </button>
                                        <button
                                            onClick={() => handleAddSpa(spaBillBooking)}
                                            className="py-5 rounded-2xl bg-gold-400 text-navy-950 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-gold-400/20 transition-all hover:bg-white active:scale-95 outline-none"
                                        >
                                            Authorize & Confirm
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default UserDashboard;





