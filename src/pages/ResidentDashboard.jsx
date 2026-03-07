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
        <div className="min-h-screen bg-navy-950 text-white selection:bg-gold-400 selection:text-navy-950">
            <Navbar />

            <main className="container mx-auto px-6 pt-32 pb-24">
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div>
                        <span className="text-gold-400 uppercase tracking-[0.4em] text-[10px] font-black mb-4 block italic">
                            The Sanctuary Portal
                        </span>
                        <h1 className="text-4xl md:text-6xl font-serif italic text-white mb-2 leading-tight">
                            Welcome home, <span className="text-gold-400">{user.email.split('@')[0]}</span>
                        </h1>
                        <p className="text-white/30 font-medium uppercase tracking-[0.2em] text-[10px]">Managing your exclusive privileges & private sanctuary.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all relative group shadow-2xl">
                            <Bell className="w-5 h-5 text-white/40 group-hover:text-gold-400 transition-colors" />
                            <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-gold-400 border-2 border-navy-900 rounded-full shadow-lg"></span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-8 py-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl hover:bg-rose-500/20 transition-all font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-rose-500/5 group"
                        >
                            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Relinquish Session
                        </button>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* Left Column - User Info & Stats */}
                    <div className="space-y-10 animate-in fade-in slide-in-from-left-8 duration-1000">
                        {/* Profile Card */}
                        <div className="glass-panel rounded-[2.5rem] p-10 relative overflow-hidden group border-white/5 bg-white/[0.01]">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-gold-400/[0.03] rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-gold-400/[0.08] transition-colors duration-1000"></div>

                            <div className="relative z-10 text-center lg:text-left">
                                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gold-400/20 to-gold-600/20 border border-gold-400/30 flex items-center justify-center mb-8 mx-auto lg:mx-0 shadow-2xl group-hover:scale-105 transition-transform duration-500">
                                    <User className="w-12 h-12 text-gold-400" />
                                </div>
                                <h3 className="text-2xl font-serif italic text-white mb-2 tracking-wide uppercase">{user.email.split('@')[0]}</h3>
                                <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] mb-10">{user.email}</p>

                                <div className="space-y-4 pt-8 border-t border-white/5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Registry Status</span>
                                        <span className="bg-gold-400/10 text-gold-400 border border-gold-400/20 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest italic group-hover:bg-gold-400 group-hover:text-navy-950 transition-all duration-500">Elite Platinum</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Loyalty Portfolio</span>
                                        <span className="text-lg font-serif italic text-white">12,450 <span className="text-[10px] font-black uppercase tracking-widest text-gold-400/60 ml-1">pts</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Menu */}
                        <div className="glass-panel p-4 rounded-[2.5rem] bg-navy-950/40 border-white/5 overflow-hidden">
                            <div className="space-y-1">
                                {[
                                    { icon: Calendar, label: 'My Bookings', badge: '2' },
                                    { icon: Star, label: 'Wishlist', badge: '5' },
                                    { icon: CreditCard, label: 'Payment Methods' },
                                    { icon: Settings, label: 'Preferences' },
                                ].map((item, i) => (
                                    <button key={i} className="w-full flex items-center justify-between p-5 rounded-2xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5">
                                        <div className="flex items-center gap-5">
                                            <div className="p-3 bg-white/5 rounded-xl text-white/20 group-hover:text-gold-400 transition-colors border border-white/5 group-hover:border-gold-400/20">
                                                <item.icon className="w-5 h-5" />
                                            </div>
                                            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] group-hover:text-white transition-colors">{item.label}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {item.badge && <span className="bg-gold-400/10 text-gold-400 px-2.5 py-1 rounded-lg text-[9px] font-black italic">{item.badge}</span>}
                                            <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-gold-400 transition-all transform group-hover:translate-x-1" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Middle/Right Column - Content */}
                    <div className="lg:col-span-2 space-y-10 animate-in fade-in slide-in-from-right-8 duration-1000">
                        {/* Featured Booking / Active Stay */}
                        <div className="glass-panel rounded-[3rem] overflow-hidden group border-white/5 bg-navy-950/40 shadow-2xl">
                            <div className="relative h-64 overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1542314831-c6a4d14d8c85?auto=format&fit=crop&q=80" alt="Active Stay" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 contrast-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/20 to-transparent"></div>
                                <div className="absolute top-6 right-6 bg-gold-400 text-navy-950 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em] shadow-2xl italic border border-white/20">Confirmed Protocol</div>
                            </div>
                            <div className="p-12">
                                <div className="flex items-center gap-3 mb-4">
                                    <MapPin className="w-4 h-4 text-gold-400/60" />
                                    <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] italic">Dubai Marina Superior Precinct</span>
                                </div>
                                <h3 className="text-4xl md:text-5xl font-serif italic text-white mb-8 leading-tight">Royal Penthouse Suite</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-10 border-t border-white/5 pt-10">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-[9px] uppercase font-black tracking-[0.4em] text-white/20 italic">Check In</span>
                                        <span className="text-sm font-serif italic text-white/80">24 Oct 2023, 14:00</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <span className="text-[9px] uppercase font-black tracking-[0.4em] text-white/20 italic">Check Out</span>
                                        <span className="text-sm font-serif italic text-white/80">28 Oct 2023, 11:00</span>
                                    </div>
                                    <div className="flex flex-col gap-2 col-span-2 md:col-span-1">
                                        <span className="text-[9px] uppercase font-black tracking-[0.4em] text-white/20 italic">Registry Unit</span>
                                        <span className="text-sm font-serif italic text-white/80">02 Adults, Wing 4 - 402</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rewards / Special Offers */}
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-[10px] font-black text-gold-400 uppercase tracking-[0.5em] italic">Exclusive Registry Benefits</h2>
                            <div className="h-px shrink-0 w-32 bg-gold-400/20"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                                { title: 'Luxe Spa Treatment', subtitle: '30% Valuation Reduction', icon: '✨' },
                                { title: 'Private Yacht Fleet', subtitle: 'Complimentary Member Charter', icon: '⛵' }
                            ].map((offer, i) => (
                                <div key={i} className="glass-panel p-8 rounded-[2rem] flex items-center gap-8 hover:border-gold-400/30 transition-all duration-700 cursor-pointer group active:scale-95 bg-white/[0.01]">
                                    <div className="w-16 h-16 bg-navy-950 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 border border-white/5 shadow-xl group-hover:bg-gold-400/10">
                                        {offer.icon}
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-lg font-serif italic text-white group-hover:text-gold-400 transition-colors uppercase tracking-widest">{offer.title}</h4>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-white/20 group-hover:text-white/40 transition-colors">{offer.subtitle}</p>
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





