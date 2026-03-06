import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    User, LogOut, Clock, CheckCircle2,
    ClipboardList, Car, ConciergeBell, Pipette, Eraser,
    Utensils, RefreshCw, Package, ChefHat,
    Wind, Flower2, BellRing, Play
} from 'lucide-react';

const STATUS_COLORS = {
    'Pending': 'text-rose-400 bg-rose-400/10 border-rose-400/30',
    'Assigned': 'text-gold-500 bg-gold-500/10 border-gold-500/30',
    'Accepted': 'text-gold-400 bg-gold-400/10 border-gold-400/30',
    'Preparing': 'text-gold-400 bg-gold-400/10 border-gold-400/30',
    'Delivered': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    'Completed': 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
};

const StaffDashboard = () => {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [serviceRequests, setServiceRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [completingId, setCompletingId] = useState(null);
    const [actionId, setActionId] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [activeTab, setActiveTab] = useState('service');
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = sessionStorage.getItem('userToken');
        const userData = sessionStorage.getItem('userData');

        if (!token || !userData) {
            navigate('/login');
            return;
        }

        const parsed = (userData && userData !== 'undefined') ? JSON.parse(userData) : null;
        if (!parsed) {
            navigate('/login');
            return;
        }
        const staffRoles = ['cook', 'room-service', 'cleaner', 'driver', 'plumber', 'admin'];
        if (!staffRoles.includes(parsed.role?.toLowerCase())) {
            navigate('/dashboard');
            return;
        }

        setUser(parsed);
        // Cooks default to food orders tab
        if (parsed.role === 'cook') setActiveTab('food');

        const handleGlobalLogout = (e) => {
            if (e.key === 'luxe-stay-logout') {
                sessionStorage.removeItem('userToken');
                sessionStorage.removeItem('userData');
                setUser(null);
                navigate('/');
            }
        };

        window.addEventListener('storage', handleGlobalLogout);
        return () => window.removeEventListener('storage', handleGlobalLogout);
    }, [navigate]);

    const fetchOrders = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const token = sessionStorage.getItem('userToken');
            const res = await fetch(`${__API_BASE__}/api/auth/staff/food-orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (err) {
            console.error('Error fetching assigned orders:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const fetchServiceRequests = useCallback(async () => {
        if (!user) return;
        setLoadingRequests(true);
        try {
            const token = sessionStorage.getItem('userToken');
            const res = await fetch(`${__API_BASE__}/api/support/staff/my-requests`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setServiceRequests(data);
            }
        } catch (err) {
            console.error('Error fetching service requests:', err);
        } finally {
            setLoadingRequests(false);
        }
    }, [user]);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const token = sessionStorage.getItem('userToken');
            const res = await fetch(`${__API_BASE__}/api/auth/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.isRead).length);
            }
        } catch (err) {
            console.error('Error fetching staff notifications:', err);
        }
    }, [user]);

    const fetchUserProfile = useCallback(async () => {
        try {
            const token = sessionStorage.getItem('userToken');
            const res = await fetch(`${__API_BASE__}/api/auth/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const updatedUser = await res.json();
                setUser(updatedUser);
                sessionStorage.setItem('userData', JSON.stringify(updatedUser));
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        }
    }, []);

    useEffect(() => {
        if (user) {
            if (user.role === 'cook') fetchOrders();
            fetchServiceRequests();
            fetchNotifications();
            fetchUserProfile(); // Get latest location etc.
            const interval = setInterval(() => {
                if (user.role === 'cook') fetchOrders();
                fetchServiceRequests();
                fetchNotifications();
            }, 30000);
            return () => clearInterval(interval);
        }
    }, [user, fetchOrders, fetchServiceRequests, fetchNotifications, fetchUserProfile]);

    const handleCompleteOrder = async (orderId) => {
        setCompletingId(orderId);
        try {
            const token = sessionStorage.getItem('userToken');
            const res = await fetch(`${__API_BASE__}/api/auth/staff/food-orders/${orderId}/complete`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setSuccessMsg('Order marked as delivered! ✅');
                setTimeout(() => setSuccessMsg(''), 3000);
                fetchOrders();
            }
        } catch (err) {
            console.error('Error completing order:', err);
        } finally {
            setCompletingId(null);
        }
    };

    const handleAcceptRequest = async (requestId) => {
        setActionId(requestId);
        try {
            const token = sessionStorage.getItem('userToken');
            const res = await fetch(`${__API_BASE__}/api/support/staff/${requestId}/accept`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setSuccessMsg('Task accepted! Head over to complete it. ✅');
                setTimeout(() => setSuccessMsg(''), 3000);
                fetchServiceRequests();
            }
        } catch (err) {
            console.error('Error accepting request:', err);
        } finally {
            setActionId(null);
        }
    };

    const handleCompleteRequest = async (requestId) => {
        setActionId(requestId);
        try {
            const token = sessionStorage.getItem('userToken');
            const res = await fetch(`${__API_BASE__}/api/support/staff/${requestId}/complete`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setSuccessMsg('Task completed successfully! 🎉');
                setTimeout(() => setSuccessMsg(''), 3000);
                fetchServiceRequests();
            }
        } catch (err) {
            console.error('Error completing request:', err);
        } finally {
            setActionId(null);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            const token = sessionStorage.getItem('userToken');
            await fetch(`${__API_BASE__}/api/auth/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchNotifications();
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    const handleClearNotifications = async () => {
        try {
            const token = sessionStorage.getItem('userToken');
            await fetch(`${__API_BASE__}/api/auth/notifications/clear`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchNotifications();
        } catch (err) {
            console.error('Error clearing notifications:', err);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('userToken');
        sessionStorage.removeItem('userData');
        localStorage.setItem('luxe-stay-logout', Date.now().toString());
        navigate('/');
    };

    const handleRefresh = () => {
        if (user.role === 'cook') fetchOrders();
        fetchServiceRequests();
        fetchNotifications();
        fetchUserProfile();
    };

    if (!user) return null;

    const roleConfig = {
        'driver': { icon: Car, label: 'Chauffeur Terminal', color: 'text-gold-500' },
        'cook': { icon: ChefHat, label: 'Culinary Command', color: 'text-gold-500' },
        'room-service': { icon: ConciergeBell, label: 'Service Hub', color: 'text-gold-500' },
        'plumber': { icon: Pipette, label: 'Stability Control', color: 'text-gold-500' },
        'cleaner': { icon: Eraser, label: 'Sanctuary Protocols', color: 'text-gold-500' },
        'admin': { icon: User, label: 'Central Command', color: 'text-gold-500' },
    }[user.role] || { icon: User, label: 'Registry Terminal', color: 'text-white' };

    const activeOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Completed');
    const completedOrders = orders.filter(o => o.status === 'Delivered' || o.status === 'Completed');
    const pendingRequests = serviceRequests.filter(r => r.status === 'Assigned' || r.status === 'Accepted');
    const completedRequests = serviceRequests.filter(r => r.status === 'Completed');

    const getServiceIcon = (subject) => {
        if (subject?.includes('Cleaning') || subject?.includes('Housekeeping')) return <Wind className="w-5 h-5 text-luxury-gold" />;
        if (subject?.includes('Transport')) return <Car className="w-5 h-5 text-luxury-gold" />;
        if (subject?.includes('Spa')) return <Flower2 className="w-5 h-5 text-pink-400" />;
        return <BellRing className="w-5 h-5 text-luxury-muted" />;
    };

    return (
        <div className="min-h-screen bg-navy-950 text-white font-sans flex selection:bg-gold-500/30">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 w-72 bg-navy-900/50 backdrop-blur-2xl border-r border-white/10 z-[60] hidden lg:flex flex-col">
                <div className="p-8 border-b border-white/10 bg-navy-950/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center border border-gold-500/20">
                            <roleConfig.icon className={`w-5 h-5 ${roleConfig.color.replace('luxury-gold', 'gold-500')}`} />
                        </div>
                        <div>
                            <span className="text-xl font-bold tracking-tighter text-white font-serif italic">LuxeStay</span>
                            <p className="text-[10px] text-gold-500 font-bold uppercase tracking-[0.2em] -mt-1">Staff Command</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-6 space-y-2 mt-4">
                    <button
                        onClick={() => setActiveTab(user.role === 'cook' ? 'food' : 'service')}
                        className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-sm font-bold transition-all duration-300 group ${(activeTab === 'service' || activeTab === 'food')
                            ? 'bg-gold-500 text-navy-950 shadow-lg shadow-gold-500/20'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                            }`}
                    >
                        {user.role === 'cook' ? <Utensils className="w-5 h-5" /> : <ClipboardList className="w-5 h-5" />}
                        {user.role === 'cook' ? 'Culinary Manifest' : 'Service Decrypt'}
                    </button>

                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'profile'
                            ? 'bg-gold-500 text-navy-950 shadow-lg shadow-gold-500/20'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                            }`}
                    >
                        <User className="w-5 h-5" />
                        Personnel Data
                    </button>
                </nav>

                {/* Bottom Logout/Profile */}
                <div className="p-6 border-t border-white/10">
                    <div className="bg-navy-950/40 rounded-2xl p-4 border border-white/10 mb-4 glass-panel">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full border border-gold-500/30 p-0.5">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${user.fullName}&background=D4AF37&color=000`}
                                    alt="User"
                                    className="w-full h-full object-cover rounded-full"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-white truncate">{user.fullName}</h4>
                                <p className="text-[9px] text-gold-500 font-bold uppercase tracking-wider">{user.role}</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded-xl transition-all font-bold text-sm tracking-widest uppercase"
                    >
                        <LogOut className="w-4 h-4" />
                        Terminate Session
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 lg:ml-72 flex flex-col min-h-screen bg-[#020617]">
                {/* Header */}
                <header className="h-24 px-10 flex items-center justify-between bg-navy-950/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
                    <div>
                        <h2 className="text-2xl font-bold text-white font-serif italic capitalize">{roleConfig.label}</h2>
                        <p className="text-[10px] text-gray-500 uppercase tracking-[0.34em] font-medium mt-1">Uplink: Active • Terminal: {user.email.split('@')[0]}</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={handleRefresh}
                            className="bg-white/5 border border-white/10 w-12 h-12 rounded-xl flex items-center justify-center text-gray-400 hover:text-gold-500 hover:border-gold-500/30 transition-all shadow-md active:scale-95"
                            title="Re-synchronize Data"
                        >
                            <RefreshCw className={`w-5 h-5 ${(loading || loadingRequests) ? 'animate-spin text-gold-500' : ''}`} />
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-gold-500 hover:border-gold-500/30 transition-all shadow-md relative"
                            >
                                <BellRing className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 border-2 border-navy-950 rounded-full flex items-center justify-center text-[8px] font-bold text-white animate-pulse">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {isNotificationOpen && (
                                <div className="absolute right-0 mt-4 w-[400px] bg-luxury-card border border-luxury-border/30 rounded-3xl shadow-2xl z-[70] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="p-6 border-b border-luxury-border/20 bg-white/5 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-white tracking-widest uppercase">Command Center Alerts</h3>
                                            <p className="text-[10px] text-luxury-muted font-bold tracking-widest uppercase mt-1">Status: Operational</p>
                                        </div>
                                        {notifications.length > 0 && (
                                            <button
                                                onClick={handleClearNotifications}
                                                className="text-[9px] font-bold text-luxury-gold uppercase tracking-widest hover:text-white transition-colors"
                                            >
                                                Purge All
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                                        {notifications.length === 0 ? (
                                            <div className="py-20 text-center">
                                                <BellRing className="w-12 h-12 text-luxury-muted/10 mx-auto mb-4" />
                                                <p className="text-[10px] text-luxury-muted font-bold uppercase tracking-widest">No active alerts</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-luxury-border/10">
                                                {notifications.map((notif) => (
                                                    <div
                                                        key={notif._id}
                                                        onClick={() => handleMarkAsRead(notif._id)}
                                                        className={`p-6 cursor-pointer hover:bg-white/5 transition-all relative group ${!notif.isRead ? 'bg-luxury-blue/5' : ''}`}
                                                    >
                                                        <div className="flex gap-4">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-white/5 shadow-inner flex-shrink-0 ${notif.status === 'Urgent' ? 'bg-red-400/10 text-red-400' :
                                                                notif.status === 'Success' ? 'bg-green-400/10 text-green-400' :
                                                                    'bg-luxury-blue/10 text-luxury-blue'
                                                                }`}>
                                                                {notif.type === 'Order' ? <Utensils className="w-4 h-4" /> : <ClipboardList className="w-4 h-4" />}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-luxury-muted">{notif.type}</span>
                                                                    <span className="text-[9px] font-bold text-luxury-muted/50">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                </div>
                                                                <p className={`text-xs leading-relaxed font-medium ${!notif.isRead ? 'text-white' : 'text-luxury-muted'}`}>
                                                                    {notif.message}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {!notif.isRead && (
                                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-luxury-blue shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 border-t border-luxury-border/10 bg-white/5 text-center">
                                        <p className="text-[9px] font-bold text-luxury-muted uppercase tracking-[0.3em]">LuxeStay Secure Communications</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="p-10 flex-1 space-y-10 max-w-7xl mx-auto w-full">
                    {/* Success Banner */}
                    {successMsg && (
                        <div className="p-5 bg-green-500/10 border border-green-500/30 text-green-400 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
                            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-sm">{successMsg}</span>
                        </div>
                    )}

                    {/* Stats Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Mandated Tasks', val: serviceRequests.length + orders.length, icon: ClipboardList, color: 'text-gold-500', bg: 'bg-gold-500/10' },
                            { label: 'Awaiting Uplink', val: pendingRequests.filter(r => r.status === 'Assigned').length + activeOrders.filter(o => o.status === 'Assigned').length, icon: Clock, color: 'text-rose-400', bg: 'bg-rose-400/10' },
                            { label: 'Operational', val: pendingRequests.filter(r => r.status === 'Accepted').length + activeOrders.filter(o => o.status === 'Preparing').length, icon: RefreshCw, color: 'text-gold-400', bg: 'bg-gold-400/10' },
                            { label: 'Finalized Today', val: completedRequests.length + completedOrders.length, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                        ].map((stat, i) => (
                            <div key={i} className="bg-navy-900/40 border border-white/10 rounded-2xl p-7 shadow-xl hover:translate-y-[-4px] transition-all duration-300 group glass-panel">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                    <span className="text-3xl font-bold text-white font-serif">{stat.val}</span>
                                </div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* CONTENT TABLES */}
                    <div className="bg-navy-900/50 rounded-3xl border border-white/10 shadow-2xl overflow-hidden min-h-[500px] glass-panel">
                        <div className="p-8 border-b border-white/10 bg-white/5 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white font-serif italic">
                                {activeTab === 'service' ? 'Service Mission Log' :
                                    activeTab === 'food' ? 'Culinary Requisition Manifest' :
                                        'Personnel Credentials'}
                            </h3>
                        </div>

                        <div className="p-8">
                            {/* SERVICE REQUESTS TAB */}
                            {activeTab === 'service' && (
                                <div className="space-y-6">
                                    {loadingRequests && serviceRequests.length === 0 ? (
                                        <div className="py-20 text-center">
                                            <div className="w-10 h-10 border-4 border-luxury-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                            <p className="text-luxury-muted text-sm font-serif italic">Accessing central command...</p>
                                        </div>
                                    ) : pendingRequests.length === 0 ? (
                                        <div className="py-20 text-center">
                                            <Package className="w-16 h-16 text-luxury-muted/20 mx-auto mb-6" />
                                            <h4 className="text-white font-bold text-xl">All Quiet on the Front</h4>
                                            <p className="text-luxury-muted mt-2 max-w-xs mx-auto text-sm">No active service tasks are currently designated for your attention.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {pendingRequests.map(req => (
                                                <div key={req._id} className="bg-white/2 border border-white/5 rounded-2xl p-6 hover:border-gold-500/30 transition-all duration-500 shadow-lg group relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 blur-3xl -mr-12 -mt-12 group-hover:bg-gold-500/10 transition-all" />

                                                    <div className="flex items-start justify-between mb-4 relative z-10">
                                                        <div className="flex items-start gap-4">
                                                            <div className="w-14 h-14 rounded-xl bg-navy-950 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-all shadow-inner">
                                                                {getServiceIcon(req.subject)}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                                    <h4 className="text-base font-bold text-white group-hover:text-gold-400 transition-colors font-serif italic">{req.subject}</h4>
                                                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest border ${STATUS_COLORS[req.status]}`}>
                                                                        {req.status}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-gray-500 leading-relaxed font-light italic">"{req.message}"</p>
                                                            </div>
                                                        </div>
                                                        <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] border ${req.priority === 'Urgent' ? 'text-rose-400 bg-rose-400/10 border-rose-400/30' : 'text-gold-500 bg-gold-500/10 border-gold-500/20'
                                                            }`}>{req.priority}</span>
                                                    </div>

                                                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5 relative z-10">
                                                        <div className="flex items-center gap-4 text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                                                            <span className="flex items-center gap-1.5"><User className="w-3 h-3 text-gold-500" /> {req.user?.email?.split('@')[0] || 'Guest'}</span>
                                                            <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-gold-500" /> {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>

                                                        {req.status === 'Assigned' ? (
                                                            <button
                                                                onClick={() => handleAcceptRequest(req._id)}
                                                                disabled={actionId === req._id}
                                                                className="px-6 py-2.5 bg-gold-500 text-navy-950 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-gold-500/10"
                                                            >
                                                                {actionId === req._id ? 'Authenticating...' : 'Authorize Mission'}
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleCompleteRequest(req._id)}
                                                                disabled={actionId === req._id}
                                                                className="px-6 py-2.5 bg-emerald-500 text-navy-950 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-emerald-500/10"
                                                            >
                                                                {actionId === req._id ? 'Neutralizing...' : 'Fulfill Mandate'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* History section */}
                                    {completedRequests.length > 0 && (
                                        <div className="mt-12 pt-8 border-t border-luxury-border/20">
                                            <h4 className="text-sm font-bold text-luxury-muted uppercase tracking-[0.2em] mb-6">Archive: Resolved Tasks</h4>
                                            <div className="space-y-4">
                                                {completedRequests.slice(0, 5).map(req => (
                                                    <div key={req._id} className="bg-white/5 rounded-2xl p-5 border border-white/5 flex items-center justify-between opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-luxury-dark border border-luxury-border/30 flex items-center justify-center">
                                                                {getServiceIcon(req.subject)}
                                                            </div>
                                                            <div>
                                                                <h5 className="text-sm font-bold text-white">{req.subject}</h5>
                                                                <p className="text-[10px] text-luxury-muted font-bold uppercase tracking-widest mt-0.5">Resolved @ {new Date(req.completedAt).toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                        <CheckCircle2 className="w-5 h-5 text-green-500/50" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* FOOD ORDERS TAB */}
                            {activeTab === 'food' && user.role === 'cook' && (
                                <div className="space-y-8">
                                    {loading && orders.length === 0 ? (
                                        <div className="py-20 text-center">
                                            <div className="w-10 h-10 border-4 border-luxury-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                            <p className="text-luxury-muted text-sm font-serif italic">Synchronizing kitchen flow...</p>
                                        </div>
                                    ) : activeOrders.length === 0 ? (
                                        <div className="py-20 text-center">
                                            <Utensils className="w-16 h-16 text-luxury-muted/20 mx-auto mb-6" />
                                            <h4 className="text-white font-bold text-xl">Kitchen is Idle</h4>
                                            <p className="text-luxury-muted mt-2 max-w-xs mx-auto text-sm">No active culinary orders have been assigned to your station.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-8">
                                            {activeOrders.map(order => (
                                                <div key={order._id} className="bg-white/2 border border-white/10 rounded-[2rem] p-10 hover:border-gold-500/30 transition-all duration-500 shadow-2xl group relative overflow-hidden glass-panel">
                                                    <div className="absolute top-0 right-0 w-48 h-48 bg-gold-500/5 blur-[100px] -mr-24 -mt-24 group-hover:bg-gold-500/10 transition-all" />

                                                    <div className="flex flex-col lg:flex-row gap-12 relative z-10">
                                                        <div className="flex-1 space-y-8">
                                                            <div className="flex items-start justify-between">
                                                                <div>
                                                                    <div className="flex items-center gap-4 mb-3">
                                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${STATUS_COLORS[order.status]}`}>
                                                                            {order.status}
                                                                        </span>
                                                                        <span className="text-[10px] text-gray-500 font-bold font-mono tracking-widest uppercase">ID: {order._id.slice(-8).toUpperCase()}</span>
                                                                    </div>
                                                                    <h4 className="text-3xl font-serif italic text-white mb-2">Registry: <span className="text-gold-400">{order.user?.email?.split('@')[0]}</span></h4>
                                                                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em]">Logged {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Main Galley</p>
                                                                </div>
                                                            </div>

                                                            <div className="bg-navy-950/50 rounded-2xl p-6 border border-white/5">
                                                                <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mb-5 flex items-center gap-2">
                                                                    <Utensils className="w-4 h-4 text-gold-500" /> Requisition Specifics
                                                                </h5>
                                                                <div className="grid grid-cols-1 gap-4">
                                                                    {order.items?.map((item, idx) => (
                                                                        <div key={idx} className="flex items-center gap-5 bg-white/2 rounded-xl p-4 border border-white/5 group/item hover:bg-white/5 transition-colors">
                                                                            <div className="w-14 h-14 rounded-lg bg-navy-950 overflow-hidden border border-white/10 shrink-0">
                                                                                {item.menuItem?.image ? <img src={item.menuItem.image} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-700" /> : <Utensils className="w-5 h-5 m-4.5 text-gray-700" />}
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-base font-medium text-white">{item.quantity}× <span className="font-serif italic">{item.menuItem?.name}</span></p>
                                                                                <p className="text-[9px] text-gold-500/60 font-bold uppercase tracking-widest mt-1">{item.menuItem?.category || 'Elite Course'}</p>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="w-full lg:w-80 flex flex-col justify-between py-2 border-t lg:border-t-0 lg:border-l border-white/10 lg:pl-12">
                                                            <div>
                                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">Total Valuation</p>
                                                                <p className="text-4xl font-serif italic text-white">₹{order.totalAmount?.toLocaleString()}</p>
                                                                <div className="mt-8 space-y-3">
                                                                    <div className="flex justify-between text-[10px] uppercase font-bold tracking-[0.2em]">
                                                                        <span className="text-gray-500">Urgency Level</span>
                                                                        <span className="text-rose-400">Strategic Priority</span>
                                                                    </div>
                                                                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                                                        <motion.div
                                                                            initial={{ width: 0 }}
                                                                            animate={{ width: '85%' }}
                                                                            className="h-full bg-gold-500 shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <button
                                                                onClick={() => handleCompleteOrder(order._id)}
                                                                disabled={completingId === order._id}
                                                                className="w-full py-4 mt-12 bg-gold-500 text-navy-950 rounded-xl font-bold text-xs tracking-[0.2em] uppercase hover:bg-white transition-all shadow-xl shadow-gold-500/10 active:scale-95 flex items-center justify-center gap-3 group/btn"
                                                            >
                                                                {completingId === order._id ? (
                                                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                                                ) : (
                                                                    <>
                                                                        <CheckCircle2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                                                        Verify Fulfillment
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* PROFILE TAB */}
                            {activeTab === 'profile' && (
                                <div className="max-w-3xl mx-auto py-12 space-y-12">
                                    <div className="flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
                                        <div className="w-40 h-40 rounded-[3rem] border-2 border-gold-500 p-2 shadow-2xl relative bg-navy-900/50 glass-panel">
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${user.fullName}&background=D4AF37&color=000&size=200`}
                                                className="w-full h-full object-cover rounded-[2.5rem]"
                                                alt="Profile"
                                            />
                                            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-emerald-500 border-4 border-navy-950 rounded-full flex items-center justify-center shadow-lg" title="Active Uplink">
                                                <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-4xl font-bold text-white font-serif italic mb-2">{user.fullName}</h4>
                                            <p className="text-gold-500 font-bold uppercase tracking-[0.4em] text-xs">{user.role} • Employee ID: #LX{user._id.slice(-4).toUpperCase()}</p>
                                            <div className="flex gap-4 mt-8 justify-center md:justify-start">
                                                <span className="px-5 py-2 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold uppercase tracking-widest text-gray-400">Identity Verified</span>
                                                <span className="px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-bold uppercase tracking-widest text-emerald-400">Shift Synchronized</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {[
                                            { label: 'Primary Terminal', val: user.email, icon: Utensils },
                                            { label: 'Assigned Sector', val: user.location?.city || 'Global (All Properties)', icon: Wind },
                                            { label: 'Performance Rating', val: `${(4.5 + (parseInt(user._id.slice(-2), 16) % 6) / 10).toFixed(1)} / 5.0 (Elite)`, icon: CheckCircle2 },
                                            { label: 'Uplink Commencement', val: `${String(10 + (parseInt(user._id.slice(-1), 16) % 12)).padStart(2, '0')}:00 UTC`, icon: Clock },
                                        ].map((item, i) => (
                                            <div key={i} className="bg-navy-900/40 border border-white/10 rounded-[2rem] p-8 flex flex-col gap-3 shadow-2xl glass-panel group hover:border-gold-500/20 transition-all">
                                                <p className="text-[9px] text-gold-500 font-bold uppercase tracking-[0.3em]">{item.label}</p>
                                                <p className="text-sm font-bold text-white group-hover:text-gold-400 transition-colors uppercase tracking-widest">{item.val}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                <footer className="p-10 text-center opacity-20 border-t border-white/5">
                    <p className="text-[9px] font-bold uppercase tracking-[0.6em] text-gray-500">Secure Staff Uplink v4.5.1 • Encryption: AES-256 • LuxeStays Internal Network</p>
                </footer>
            </div>
        </div>
    );
};

export default StaffDashboard;





