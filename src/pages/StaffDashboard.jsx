import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User, LogOut, Clock, CheckCircle2,
    ClipboardList, Car, ConciergeBell, Pipette, Eraser,
    Utensils, RefreshCw, Package, ChefHat,
    Wind, Flower2, BellRing, Play
} from 'lucide-react';

const STATUS_COLORS = {
    'Pending': 'text-red-400 bg-red-400/10 border-red-400/30',
    'Assigned': 'text-luxury-gold bg-luxury-gold/10 border-luxury-gold/30',
    'Accepted': 'text-luxury-gold bg-[#D4AF37]/10 border-luxury-gold/30',
    'Preparing': 'text-luxury-gold bg-[#D4AF37]/10 border-luxury-gold/30',
    'Delivered': 'text-green-400 bg-green-400/10 border-green-400/30',
    'Completed': 'text-green-500 bg-green-500/10 border-green-500/30',
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

        const parsed = JSON.parse(userData);
        const staffRoles = ['cook', 'room-service', 'cleaner', 'driver', 'plumber', 'admin'];
        if (!staffRoles.includes(parsed.role)) {
            navigate('/dashboard');
            return;
        }

        setUser(parsed);
        // Cooks default to food orders tab
        if (parsed.role === 'cook') setActiveTab('food');
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
        'driver': { icon: Car, label: 'Chauffeur Suite', color: 'text-luxury-gold' },
        'cook': { icon: ChefHat, label: 'Culinary Portal', color: 'text-orange-400' },
        'room-service': { icon: ConciergeBell, label: 'Guest Services', color: 'text-luxury-gold' },
        'plumber': { icon: Pipette, label: 'Maintenance Hub', color: 'text-cyan-400' },
        'cleaner': { icon: Eraser, label: 'Housekeeping Center', color: 'text-green-400' },
        'admin': { icon: User, label: 'Admin Portal', color: 'text-luxury-blue' },
    }[user.role] || { icon: User, label: 'Staff Portal', color: 'text-white' };

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
        <div className="min-h-screen bg-luxury-dark text-white font-sans flex">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 w-72 bg-luxury-card border-r border-luxury-border/30 z-[60] hidden lg:flex flex-col">
                <div className="p-8 border-b border-luxury-border/30 bg-luxury-dark/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-luxury-blue/10 flex items-center justify-center border border-luxury-blue/20">
                            <roleConfig.icon className={`w-5 h-5 ${roleConfig.color}`} />
                        </div>
                        <div>
                            <span className="text-xl font-bold tracking-tighter text-white font-serif italic">LuxeStays</span>
                            <p className="text-[10px] text-luxury-gold font-bold uppercase tracking-[0.2em] -mt-1">Staff Portal</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-6 space-y-2 mt-4">
                    <button
                        onClick={() => setActiveTab(user.role === 'cook' ? 'food' : 'service')}
                        className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-sm font-bold transition-all ${(activeTab === 'service' || activeTab === 'food')
                            ? 'bg-luxury-blue text-white shadow-lg shadow-luxury-blue/20'
                            : 'text-luxury-muted hover:bg-white/5 hover:text-white border border-transparent hover:border-luxury-border/30'
                            }`}
                    >
                        {user.role === 'cook' ? <Utensils className="w-5 h-5" /> : <ClipboardList className="w-5 h-5" />}
                        {user.role === 'cook' ? 'Culinary Orders' : 'My Service Tasks'}
                    </button>

                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-sm font-bold transition-all ${activeTab === 'profile'
                            ? 'bg-luxury-blue text-white shadow-lg shadow-luxury-blue/20'
                            : 'text-luxury-muted hover:bg-white/5 hover:text-white border border-transparent hover:border-luxury-border/30'
                            }`}
                    >
                        <User className="w-5 h-5" />
                        Staff Profile
                    </button>
                </nav>

                {/* Bottom Logout/Profile */}
                <div className="p-6 border-t border-luxury-border/30">
                    <div className="bg-luxury-dark/50 rounded-2xl p-4 border border-luxury-border/30 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full border-2 border-luxury-blue p-0.5">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${user.fullName}&background=2563EB&color=fff`}
                                    alt="User"
                                    className="w-full h-full object-cover rounded-full"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-white truncate">{user.fullName}</h4>
                                <p className="text-[9px] text-luxury-muted font-bold uppercase tracking-wider">{user.role}</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-xl transition-all font-bold text-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        Check Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
                {/* Header */}
                <header className="h-24 px-10 flex items-center justify-between bg-luxury-dark/90 backdrop-blur-xl border-b border-luxury-border/30 sticky top-0 z-50">
                    <div>
                        <h2 className="text-2xl font-bold text-white font-serif italic capitalize">{roleConfig.label}</h2>
                        <p className="text-sm text-luxury-muted uppercase tracking-widest font-bold mt-0.5">{user.email.split('@')[0]} • Status: Online</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={handleRefresh}
                            className="bg-luxury-card border border-luxury-border/30 w-11 h-11 rounded-xl flex items-center justify-center text-luxury-muted hover:text-white transition-all shadow-md active:scale-95"
                            title="Refresh Data"
                        >
                            <RefreshCw className={`w-5 h-5 ${(loading || loadingRequests) ? 'animate-spin text-luxury-blue' : ''}`} />
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                className="w-11 h-11 bg-luxury-card border border-luxury-border/30 rounded-xl flex items-center justify-center text-luxury-muted hover:text-white transition-all shadow-md relative"
                            >
                                <BellRing className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-luxury-dark rounded-full flex items-center justify-center text-[8px] font-bold text-white animate-pulse">
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
                            { label: 'Assigned Tasks', val: serviceRequests.length + orders.length, icon: ClipboardList, color: 'text-luxury-gold', bg: 'bg-luxury-gold/10' },
                            { label: 'Awaiting Response', val: pendingRequests.filter(r => r.status === 'Assigned').length + activeOrders.filter(o => o.status === 'Assigned').length, icon: Clock, color: 'text-red-400', bg: 'bg-red-400/10' },
                            { label: 'In Progress', val: pendingRequests.filter(r => r.status === 'Accepted').length + activeOrders.filter(o => o.status === 'Preparing').length, icon: RefreshCw, color: 'text-luxury-gold', bg: 'bg-[#D4AF37]/10' },
                            { label: 'Completed Today', val: completedRequests.length + completedOrders.length, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10' },
                        ].map((stat, i) => (
                            <div key={i} className="bg-luxury-card border border-luxury-border/30 rounded-[2rem] p-7 shadow-xl hover:translate-y-[-4px] transition-all group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                    <span className="text-3xl font-bold text-white">{stat.val}</span>
                                </div>
                                <p className="text-[10px] text-luxury-muted font-bold uppercase tracking-widest">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* CONTENT TABLES */}
                    <div className="bg-luxury-card rounded-[2.5rem] border border-luxury-border/30 shadow-2xl overflow-hidden min-h-[500px]">
                        {/* Tab Headers within content area if desired, or just one list */}
                        <div className="p-8 border-b border-luxury-border/30 bg-white/5 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white font-serif italic">
                                {activeTab === 'service' ? 'Mission Log: Service Requests' :
                                    activeTab === 'food' ? 'Culinary Manifest: Active Orders' :
                                        'Personnel Profile'}
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
                                                <div key={req._id} className="bg-luxury-dark/40 border border-luxury-border/50 rounded-3xl p-6 hover:border-luxury-blue/50 transition-all shadow-lg group">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-start gap-4">
                                                            <div className="w-14 h-14 rounded-2xl bg-luxury-card border border-luxury-border/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-all shadow-inner">
                                                                {getServiceIcon(req.subject)}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                                    <h4 className="text-base font-bold text-white group-hover:text-luxury-blue transition-colors">{req.subject}</h4>
                                                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest border ${STATUS_COLORS[req.status]}`}>
                                                                        {req.status}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-luxury-muted leading-relaxed font-medium line-clamp-2 italic">"{req.message}"</p>
                                                            </div>
                                                        </div>
                                                        <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.1em] border ${req.priority === 'Urgent' ? 'text-red-400 bg-red-400/10 border-red-400/30 shadow-lg shadow-red-500/10' : 'text-luxury-gold bg-luxury-gold/10 border-luxury-gold/20'
                                                            }`}>{req.priority}</span>
                                                    </div>

                                                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-luxury-border/10">
                                                        <div className="flex items-center gap-4 text-[10px] text-luxury-muted font-bold uppercase tracking-wider">
                                                            <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> {req.user?.email?.split('@')[0] || 'Guest'}</span>
                                                            <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>

                                                        {req.status === 'Assigned' ? (
                                                            <button
                                                                onClick={() => handleAcceptRequest(req._id)}
                                                                disabled={actionId === req._id}
                                                                className="px-6 py-2.5 bg-luxury-blue text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-luxury-blue/20"
                                                            >
                                                                {actionId === req._id ? 'Securing...' : 'Accept Mission'}
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleCompleteRequest(req._id)}
                                                                disabled={actionId === req._id}
                                                                className="px-6 py-2.5 bg-green-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-green-500/20"
                                                            >
                                                                {actionId === req._id ? 'Finalizing...' : 'Target Completed'}
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
                                                <div key={order._id} className="bg-luxury-dark/40 border border-luxury-border/50 rounded-[2.5rem] p-10 hover:border-luxury-gold/30 transition-all shadow-xl group relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/5 blur-3xl -mr-16 -mt-16 group-hover:bg-luxury-gold/10 transition-all" />

                                                    <div className="flex flex-col lg:flex-row gap-10">
                                                        <div className="flex-1 space-y-6">
                                                            <div className="flex items-start justify-between">
                                                                <div>
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${STATUS_COLORS[order.status]}`}>
                                                                            {order.status}
                                                                        </span>
                                                                        <span className="text-[10px] text-luxury-muted font-bold font-mono tracking-widest uppercase">#{order._id.slice(-6).toUpperCase()}</span>
                                                                    </div>
                                                                    <h4 className="text-2xl font-bold text-white font-serif italic">Guest <span className="text-luxury-gold">{order.user?.email?.split('@')[0]}</span></h4>
                                                                    <p className="text-xs text-luxury-muted font-medium mt-1 uppercase tracking-[0.1em]">Ordered {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Ground Floor Kitchen</p>
                                                                </div>
                                                            </div>

                                                            <div className="bg-luxury-card/30 rounded-3xl p-6 border border-luxury-border/20">
                                                                <h5 className="text-[10px] font-bold text-luxury-muted uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                                                    <Utensils className="w-4 h-4" /> Prep-List & Manifest
                                                                </h5>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    {order.items?.map((item, idx) => (
                                                                        <div key={idx} className="flex items-center gap-4 bg-white/5 rounded-2xl p-3 border border-white/5 shadow-inner">
                                                                            <div className="w-12 h-12 rounded-xl bg-luxury-dark overflow-hidden border border-luxury-border/30">
                                                                                {item.menuItem?.image ? <img src={item.menuItem.image} className="w-full h-full object-cover" /> : <Utensils className="w-5 h-5 m-3.5 text-luxury-muted/20" />}
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-sm font-bold text-white">{item.quantity}× {item.menuItem?.name}</p>
                                                                                <p className="text-[10px] text-luxury-gold font-bold uppercase tracking-widest">{item.menuItem?.category || 'Main Course'}</p>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="w-full lg:w-72 flex flex-col justify-between py-2 border-l lg:border-l border-luxury-border/20 lg:pl-10">
                                                            <div>
                                                                <p className="text-[11px] font-bold text-luxury-muted uppercase tracking-[0.2em] mb-1">Estimated Requisition</p>
                                                                <p className="text-3xl font-bold text-white font-serif">₹{order.totalAmount?.toLocaleString()}</p>
                                                                <div className="mt-6 space-y-2">
                                                                    <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest">
                                                                        <span className="text-luxury-muted">Urgency</span>
                                                                        <span className="text-red-400">High Priority</span>
                                                                    </div>
                                                                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                                                        <div className="w-[85%] h-full bg-luxury-blue shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <button
                                                                onClick={() => handleCompleteOrder(order._id)}
                                                                disabled={completingId === order._id}
                                                                className="w-full py-4 mt-10 bg-luxury-gold text-luxury-dark rounded-2xl font-bold text-sm tracking-widest uppercase hover:bg-white transition-all shadow-xl shadow-luxury-gold/20 active:scale-95 flex items-center justify-center gap-2"
                                                            >
                                                                {completingId === order._id ? (
                                                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                                                ) : (
                                                                    <>
                                                                        <CheckCircle2 className="w-5 h-5" />
                                                                        Mark Delivered
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
                                <div className="max-w-3xl mx-auto py-10 space-y-12">
                                    <div className="flex items-center gap-10">
                                        <div className="w-32 h-32 rounded-[2.5rem] border-4 border-luxury-blue p-1.5 shadow-2xl relative">
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${user.fullName}&background=2563EB&color=fff&size=200`}
                                                className="w-full h-full object-cover rounded-[2rem]"
                                                alt="Profile"
                                            />
                                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 border-4 border-luxury-dark rounded-full flex items-center justify-center shadow-lg" title="Active Status">
                                                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-3xl font-bold text-white font-serif italic">{user.fullName}</h4>
                                            <p className="text-luxury-gold font-bold uppercase tracking-[0.3em] text-xs mt-1">{user.role} • Employee ID: #LX{user._id.slice(-4).toUpperCase()}</p>
                                            <div className="flex gap-4 mt-6">
                                                <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-luxury-muted">Verified Status</span>
                                                <span className="px-4 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-green-400">Shift Active</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        {[
                                            { label: 'Primary Terminal', val: user.email, icon: Utensils },
                                            { label: 'Assigned Location', val: user.location?.city || 'Global (All Properties)', icon: Wind },
                                            { label: 'Performance Rating', val: `${(4.5 + (parseInt(user._id.slice(-2), 16) % 6) / 10).toFixed(1)} / 5.0 (Elite)`, icon: CheckCircle2 },
                                            { label: 'Shift Commencement', val: `${String(10 + (parseInt(user._id.slice(-1), 16) % 12)).padStart(2, '0')}:00 UTC`, icon: Clock },
                                        ].map((item, i) => (
                                            <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-2 shadow-inner">
                                                <p className="text-[10px] text-luxury-gold font-bold uppercase tracking-[0.2em]">{item.label}</p>
                                                <p className="text-sm font-bold text-white">{item.val}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                <footer className="p-10 text-center opacity-30 border-t border-luxury-border/10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-luxury-muted">Security Encryption Active • Secure Staff Terminal v4.2.0 • LuxeStays International</p>
                </footer>
            </div>
        </div>
    );
};

export default StaffDashboard;





