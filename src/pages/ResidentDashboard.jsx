import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { User, LogOut, Calendar, Star, MapPin, ChevronRight, Settings, Bell, CreditCard } from 'lucide-react';

const ResidentDashboard = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userDataStr = sessionStorage.getItem('userData');
        const userData = (userDataStr && userDataStr !== 'undefined') ? JSON.parse(userDataStr) : null;

        if (!userData || userData.role?.toLowerCase() !== 'resident') {
            navigate('/login');
        } else {
            setUser(userData);
        }

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

    const handleLogout = () => {
        sessionStorage.removeItem('userToken');
        sessionStorage.removeItem('userData');
        localStorage.setItem('luxe-stay-logout', Date.now().toString());
        setUser(null);
        navigate('/');
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-luxury-dark text-luxury-text selection:bg-luxury-gold selection:text-white">
            <Navbar />

            <main className="container mx-auto px-6 pt-28 pb-20">
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <span className="text-luxury-blue uppercase tracking-[0.3em] text-xs font-bold mb-3 block">
                            Member Portal
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                            Welcome back, <span className="text-luxury-blue font-serif italic">{user.email.split('@')[0]}</span>
                        </h1>
                        <p className="text-luxury-muted">Manage your luxury experiences and exclusive privileges.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-3 bg-luxury-card border border-luxury-border rounded-lg hover:bg-white/5 transition-colors relative group">
                            <Bell className="w-5 h-5 text-luxury-muted group-hover:text-white transition-colors" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-luxury-blue rounded-full"></span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg hover:bg-red-500/20 transition-all font-medium"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column - User Info & Stats */}
                    <div className="space-y-8">
                        {/* Profile Card */}
                        <div className="bg-luxury-card border border-luxury-border rounded-2xl p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-blue/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-luxury-blue/10 transition-colors duration-500"></div>

                            <div className="relative z-10">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-luxury-blue to-luxury-blue-hover flex items-center justify-center mb-6 shadow-lg shadow-luxury-blue/20">
                                    <User className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1 uppercase tracking-wider">{user.email.split('@')[0]}</h3>
                                <p className="text-sm text-luxury-muted mb-6">{user.email}</p>

                                <div className="space-y-3 pt-6 border-t border-luxury-border">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-luxury-muted">Membership Status</span>
                                        <span className="bg-luxury-gold/10 text-luxury-gold px-2 py-0.5 rounded text-[10px] font-bold uppercase">Elite Platinum</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-luxury-muted">Loyalty Points</span>
                                        <span className="text-white font-bold">12,450 pts</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Menu */}
                        <div className="bg-luxury-card border border-luxury-border rounded-2xl p-4 overflow-hidden">
                            <div className="space-y-1">
                                {[
                                    { icon: Calendar, label: 'My Bookings', badge: '2' },
                                    { icon: Star, label: 'Wishlist', badge: '5' },
                                    { icon: CreditCard, label: 'Payment Methods' },
                                    { icon: Settings, label: 'Preferences' },
                                ].map((item, i) => (
                                    <button key={i} className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-[#1A1D27] rounded-lg text-luxury-muted group-hover:text-luxury-blue transition-colors">
                                                <item.icon className="w-5 h-5" />
                                            </div>
                                            <span className="text-sm font-medium text-luxury-text group-hover:text-white transition-colors">{item.label}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {item.badge && <span className="bg-luxury-blue/10 text-luxury-blue px-2 py-0.5 rounded-md text-[10px] font-bold">{item.badge}</span>}
                                            <ChevronRight className="w-4 h-4 text-luxury-muted group-hover:text-white transition-all transform group-hover:translate-x-1" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Middle/Right Column - Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Featured Booking / Active Stay */}
                        <div className="bg-luxury-card border border-luxury-border rounded-2xl overflow-hidden group">
                            <div className="relative h-48">
                                <img src="https://images.unsplash.com/photo-1542314831-c6a4d14d8c85?auto=format&fit=crop&q=80" alt="Active Stay" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-luxury-dark via-transparent to-transparent"></div>
                                <div className="absolute top-4 right-4 bg-luxury-blue text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest shadow-lg">Confirmed</div>
                            </div>
                            <div className="p-8">
                                <div className="flex items-center gap-2 mb-3">
                                    <MapPin className="w-4 h-4 text-luxury-gold" />
                                    <span className="text-xs font-bold text-luxury-muted uppercase tracking-wider">Dubai Marina, UAE</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">Royal Penthouse Suite</h3>
                                <div className="flex flex-wrap gap-6 items-center text-sm text-luxury-muted border-t border-luxury-border pt-6">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-bold tracking-widest mb-1">Check In</span>
                                        <span className="text-white">24 Oct 2023, 14:00</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-bold tracking-widest mb-1">Check Out</span>
                                        <span className="text-white">28 Oct 2023, 11:00</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-bold tracking-widest mb-1">Guest Room</span>
                                        <span className="text-white">02 Adults, Room 402</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rewards / Special Offers */}
                        <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-[0.2em]">Exclusive Rewards</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { title: 'Luxe Spa Treatment', subtitle: '30% Off on Full Body Massage', icon: '✨' },
                                { title: 'Private Yacht Tour', subtitle: 'Complimentary for Platinum Members', icon: '⛵' }
                            ].map((offer, i) => (
                                <div key={i} className="bg-luxury-card border border-luxury-border p-6 rounded-2xl flex items-center gap-6 hover:border-luxury-blue/30 transition-all cursor-pointer group">
                                    <div className="w-12 h-12 bg-[#1A1D27] rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                        {offer.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white group-hover:text-luxury-blue transition-colors">{offer.title}</h4>
                                        <p className="text-xs text-luxury-muted">{offer.subtitle}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ResidentDashboard;





