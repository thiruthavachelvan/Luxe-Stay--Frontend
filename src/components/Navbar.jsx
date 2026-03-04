import { Link, useNavigate } from 'react-router-dom';
import { Building2, User, LogOut, ChevronDown, LayoutDashboard, Settings } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [userData, setUserData] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Re-read user from localStorage whenever the component mounts or window focuses
    const loadUser = () => {
        const stored = sessionStorage.getItem('userData');
        setUserData(stored ? JSON.parse(stored) : null);
    };

    useEffect(() => {
        loadUser();
        window.addEventListener('focus', loadUser);
        window.addEventListener('storage', loadUser);
        return () => {
            window.removeEventListener('focus', loadUser);
            window.removeEventListener('storage', loadUser);
        };
    }, []);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem('userToken');
        sessionStorage.removeItem('userData');
        setUserData(null);
        setDropdownOpen(false);
        navigate('/');
    };

    const firstName = userData?.fullName?.split(' ')[0] || userData?.name?.split(' ')[0] || 'User';
    const isAdmin = userData?.role === 'admin';

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-luxury-dark/90 backdrop-blur-md border-b border-luxury-border py-4' : 'bg-transparent py-6'}`}>
            <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="p-1.5 bg-luxury-blue rounded group-hover:bg-luxury-blue-hover transition-colors">
                        <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-widest text-white uppercase">LuxeStays</span>
                </Link>

                {/* Navigation Links */}
                <div className="hidden lg:flex items-center gap-8">
                    <Link to="/" className="text-sm font-medium text-white hover:text-luxury-blue transition-colors">Home</Link>
                    <Link to="/about" className="text-sm font-medium text-luxury-text hover:text-luxury-blue transition-colors">About Us</Link>
                    <Link to="/locations" className="text-sm font-medium text-luxury-text hover:text-luxury-blue transition-colors">Locations</Link>
                    <Link to="/rooms" className="text-sm font-medium text-luxury-text hover:text-luxury-blue transition-colors">Rooms</Link>
                    <Link to="/restaurant" className="text-sm font-medium text-luxury-text hover:text-luxury-blue transition-colors">Dining</Link>
                    <Link to="/spa" className="text-sm font-medium text-luxury-text hover:text-luxury-blue transition-colors">Spa</Link>
                    <Link to="/amenities" className="text-sm font-medium text-luxury-text hover:text-luxury-blue transition-colors">Amenities</Link>
                    <Link to="/offers" className="text-sm font-medium text-luxury-text hover:text-luxury-blue transition-colors">Offers</Link>
                </div>

                {/* Auth Area */}
                <div className="hidden lg:flex items-center gap-4">
                    {userData ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(v => !v)}
                                className="flex items-center gap-2.5 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                            >
                                <div className="w-7 h-7 rounded-full bg-luxury-blue flex items-center justify-center text-white text-xs font-bold">
                                    {firstName[0].toUpperCase()}
                                </div>
                                <span className="text-sm text-white font-medium">{firstName}</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-white/50 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-52 bg-[#1a1f2e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                                    <div className="px-4 py-3 border-b border-white/5">
                                        <p className="text-white text-sm font-bold">{userData.fullName || userData.name}</p>
                                        <p className="text-gray-500 text-xs mt-0.5">{userData.email}</p>
                                    </div>
                                    <div className="p-2">
                                        <Link
                                            to={isAdmin ? '/admin' : '/dashboard'}
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
                                        >
                                            <LayoutDashboard className="w-4 h-4" />
                                            {isAdmin ? 'Admin Panel' : 'My Dashboard'}
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-medium text-luxury-text hover:text-luxury-blue transition-colors">Login</Link>
                            <Link to="/signup" className="px-6 py-2 bg-luxury-blue text-white text-sm font-medium rounded hover:bg-luxury-blue-hover transition-colors shadow-[0_0_15px_rgba(30,64,175,0.4)]">Sign Up</Link>
                        </>
                    )}
                </div>

            </div>
        </nav>
    );
};

export default Navbar;




