import { Building2, Mail, Globe, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-[#0f1115] pt-24 pb-12 border-t border-luxury-border">
            <div className="container mx-auto px-6">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* Brand Info */}
                    <div className="flex flex-col gap-6">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="p-1.5 bg-luxury-blue rounded">
                                <Building2 className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-widest text-white uppercase">LuxeStay</span>
                        </Link>
                        <p className="text-luxury-muted text-sm leading-relaxed max-w-xs">
                            Creating unforgettable experiences in the world's most luxurious destinations. Excellence in hospitality since 1994.
                        </p>
                        <div className="flex items-center gap-4">
                            <button className="w-10 h-10 rounded-full border border-luxury-border flex items-center justify-center text-luxury-muted hover:text-white hover:border-luxury-gold transition-colors">
                                <Globe className="w-4 h-4" />
                            </button>
                            <button className="w-10 h-10 rounded-full border border-luxury-border flex items-center justify-center text-luxury-muted hover:text-white hover:border-luxury-gold transition-colors">
                                <MessageSquare className="w-4 h-4" />
                            </button>
                            <button className="w-10 h-10 rounded-full border border-luxury-border flex items-center justify-center text-luxury-muted hover:text-white hover:border-luxury-gold transition-colors">
                                <Mail className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex flex-col gap-6">
                        <h4 className="text-white font-bold tracking-widest uppercase text-xs">Navigation</h4>
                        <div className="flex flex-col gap-4 text-sm text-luxury-muted">
                            <Link to="/" className="hover:text-luxury-gold transition-colors w-fit">Home</Link>
                            <Link to="/about" className="hover:text-luxury-gold transition-colors w-fit">About Us</Link>
                            <Link to="/amenities" className="hover:text-luxury-gold transition-colors w-fit">Amenities</Link>
                            <Link to="/reviews" className="hover:text-luxury-gold transition-colors w-fit">Reviews</Link>
                            <Link to="/locations" className="hover:text-luxury-gold transition-colors w-fit">Our Locations</Link>
                            <Link to="/rooms" className="hover:text-luxury-gold transition-colors w-fit">Explore Rooms</Link>
                            <Link to="/offers" className="hover:text-luxury-gold transition-colors w-fit flex items-center gap-1.5">✦ Offers &amp; Memberships</Link>
                        </div>
                    </div>

                    {/* Support */}
                    <div className="flex flex-col gap-6">
                        <h4 className="text-white font-bold tracking-widest uppercase text-xs">Support</h4>
                        <div className="flex flex-col gap-4 text-sm text-luxury-muted">
                            <Link to="/contact" className="hover:text-luxury-gold transition-colors w-fit">Contact Us</Link>
                            <Link to="/policies?section=faqs" className="hover:text-luxury-gold transition-colors w-fit">FAQs</Link>
                            <Link to="/policies?section=privacy" className="hover:text-luxury-gold transition-colors w-fit">Privacy Policy</Link>
                            <Link to="/policies?section=terms" className="hover:text-luxury-gold transition-colors w-fit">Terms of Service</Link>
                            <Link to="/policies?section=cancellation" className="hover:text-luxury-gold transition-colors w-fit">Cancellation Policy</Link>
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div className="flex flex-col gap-6">
                        <h4 className="text-white font-bold tracking-widest uppercase text-xs">Newsletter</h4>
                        <p className="text-luxury-muted text-sm">
                            Subscribe for exclusive offers and travel inspiration.
                        </p>
                        <form className="mt-2 flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="email"
                                    placeholder="Your email"
                                    className="w-full bg-luxury-dark border border-luxury-border rounded px-4 py-3 pb-3 text-sm text-white focus:outline-none focus:border-luxury-blue transition-colors placeholder:text-luxury-muted"
                                />
                            </div>
                            <button type="submit" className="bg-luxury-blue hover:bg-luxury-blue-hover text-white px-6 py-3 rounded text-sm font-medium transition-colors shadow-lg">
                                Join
                            </button>
                        </form>
                    </div>

                </div>

                {/* Footer Bottom */}
                <div className="pt-8 border-t border-luxury-border flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-luxury-muted text-xs">
                        © 2023 LuxeStay Hotels & Resorts. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-xs text-luxury-muted">
                        <Link to="/policies?section=privacy" className="hover:text-white transition-colors uppercase tracking-widest">Privacy</Link>
                        <Link to="/policies?section=terms" className="hover:text-white transition-colors uppercase tracking-widest">Terms</Link>
                        <Link to="/policies?section=cancellation" className="hover:text-white transition-colors uppercase tracking-widest">Refunds</Link>
                        <Link to="/offers" className="hover:text-luxury-gold transition-colors uppercase tracking-widest">Offers</Link>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
