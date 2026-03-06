import { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "motion/react";
import { Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Button from "./ui/Button";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { scrollY } = useScroll();
    const navigate = useNavigate();

    const [user, setUser] = useState(() => {
        const stored = sessionStorage.getItem('userData');
        return (stored && stored !== 'undefined') ? JSON.parse(stored) : null;
    });

    const syncUser = () => {
        const stored = sessionStorage.getItem('userData');
        setUser((stored && stored !== 'undefined') ? JSON.parse(stored) : null);
    };

    const handleGlobalLogout = (e) => {
        if (e.key === 'luxe-stay-logout') {
            sessionStorage.removeItem('userToken');
            sessionStorage.removeItem('userData');
            setUser(null);
            navigate('/');
        }
    };

    useEffect(() => {
        syncUser();
        window.addEventListener('focus', syncUser);
        window.addEventListener('storage', handleGlobalLogout);
        return () => {
            window.removeEventListener('focus', syncUser);
            window.removeEventListener('storage', handleGlobalLogout);
        };
    }, []);

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 50);
    });

    const handleLogout = () => {
        sessionStorage.removeItem('userToken');
        sessionStorage.removeItem('userData');
        localStorage.setItem('luxe-stay-logout', Date.now().toString());
        setUser(null);
        navigate('/');
    };

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "About Us", href: "/about" },
        { name: "Locations", href: "/locations" },
        { name: "Rooms", href: "/rooms" },
        { name: "Dining", href: "/restaurant" },
        { name: "Spa", href: "/spa" },
        { name: "Amenities", href: "/amenities" },
        { name: "Offers", href: "/offers" },
        { name: "Reviews", href: "/reviews" },
    ];

    const getDashboardLink = () => {
        if (!user) return "/login";
        if (user.role === 'admin') return "/admin";
        if (['cook', 'room-service', 'cleaner', 'driver', 'plumber'].includes(user.role)) return `/staff/${user.role}`;
        return "/dashboard";
    };

    return (
        <motion.nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${isScrolled
                ? "bg-navy-950/80 backdrop-blur-md border-white/5 py-4"
                : "bg-transparent border-transparent py-6"
                }`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <span className="text-2xl font-serif font-bold tracking-widest text-white uppercase">
                        LUXESTAYS
                    </span>
                    <div className="w-2 h-2 rounded-full bg-gold-400 mt-1" />
                </Link>

                {/* Desktop Nav */}
                <div className="hidden xl:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.href}
                            className="text-xs font-medium text-white/70 hover:text-gold-400 transition-colors uppercase tracking-widest"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                <div className="hidden md:flex items-center gap-6">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link to={getDashboardLink()} className="flex items-center gap-3 group">
                                <div className="w-9 h-9 rounded-full bg-gold-400 flex items-center justify-center font-bold text-navy-950 text-xs border border-white/10 group-hover:bg-white transition-colors">
                                    {(user.fullName || 'G')[0]}
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-bold text-white uppercase tracking-widest leading-none mb-1 group-hover:text-gold-400 transition-colors">
                                        {user.fullName?.split(' ')[0] || 'Guest'}
                                    </p>
                                    <p className="text-[9px] text-gold-400/60 uppercase tracking-widest font-bold">Dashboard</p>
                                </div>
                            </Link>
                            <button onClick={handleLogout} className="p-2 text-white/40 hover:text-rose-400 transition-colors" title="Logout">
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="text-xs font-medium text-white hover:text-gold-400 transition-colors uppercase tracking-widest font-bold">
                                Login
                            </Link>
                            <Link to="/signup">
                                <Button variant="primary" className="!py-3 !px-6 text-[10px] font-black uppercase tracking-widest">
                                    Sign Up
                                </Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    className="xl:hidden text-white"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="xl:hidden bg-navy-950 border-b border-white/10 overflow-hidden"
                    >
                        <div className="px-6 py-8 flex flex-col gap-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.href}
                                    className="text-lg font-serif text-white/90"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="h-px bg-white/10 my-2" />
                            <div className="flex flex-col gap-4">
                                {user ? (
                                    <>
                                        <Link to={getDashboardLink()} className="flex items-center gap-4 py-2" onClick={() => setIsMobileMenuOpen(false)}>
                                            <div className="w-10 h-10 rounded-full bg-gold-400 flex items-center justify-center font-bold text-navy-950">
                                                {(user.fullName || 'G')[0]}
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-white uppercase tracking-widest">{user.fullName || 'Guest'}</p>
                                                <p className="text-xs text-gold-400/60 uppercase tracking-widest font-bold">Manage Account</p>
                                            </div>
                                        </Link>
                                        <button onClick={handleLogout} className="flex items-center gap-3 text-rose-400 font-bold uppercase tracking-widest text-xs py-2">
                                            <LogOut className="w-4 h-4" /> Terminate Session
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/login" className="text-left text-white/80 uppercase tracking-widest text-sm font-bold" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                                        <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                                            <Button variant="primary" className="w-full text-[10px] font-black uppercase tracking-widest">Sign Up</Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
