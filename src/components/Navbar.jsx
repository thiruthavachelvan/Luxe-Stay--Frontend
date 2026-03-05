import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "./ui/Button";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 50);
    });

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Locations", href: "/locations" },
        { name: "Rooms", href: "/rooms" },
        { name: "Dining", href: "/restaurant" },
        { name: "Spa", href: "/spa" },
        { name: "Amenities", href: "/amenities" },
        { name: "Offers", href: "/offers" },
        { name: "Reviews", href: "/reviews" },
    ];

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
                    <Link to="/login" className="text-xs font-medium text-white hover:text-gold-400 transition-colors uppercase tracking-widest">
                        Login
                    </Link>
                    <Link to="/signup">
                        <Button variant="primary" className="!py-3 !px-6">
                            Sign Up
                        </Button>
                    </Link>
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
            {isMobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="xl:hidden bg-navy-950 border-b border-white/10"
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
                            <Link to="/login" className="text-left text-white/80 uppercase tracking-widest text-sm" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                            <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                                <Button variant="primary" className="w-full">Sign Up</Button>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.nav>
    );
}
