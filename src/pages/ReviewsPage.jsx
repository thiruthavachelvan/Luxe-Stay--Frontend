import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Star, Filter, ChevronRight, ThumbsUp, MapPin, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const StarDisplay = ({ rating, size = 'w-4 h-4' }) => (
    <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className={`${size} ${s <= rating ? 'text-gold-400 fill-gold-400' : 'text-white/10'}`} />
        ))}
    </div>
);

const RatingBar = ({ label, value }) => (
    <div className="flex items-center gap-3">
        <span className="text-luxury-muted text-xs w-28 shrink-0 capitalize">{label.replace(/([A-Z])/g, ' $1')}</span>
        <div className="flex-1 bg-luxury-border/30 rounded-full h-1.5 overflow-hidden">
            <div
                className="h-full bg-gradient-to-r from-luxury-blue to-amber-400 rounded-full transition-all duration-700"
                style={{ width: `${(value / 5) * 100}%` }}
            />
        </div>
        <span className="text-white text-xs font-medium w-6 shrink-0">{value}</span>
    </div>
);

const ReviewsPage = () => {
    const [data, setData] = useState({ reviews: [], totalCount: 0, avgRating: 0, breakdown: [], categoryAvgs: {} });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ rating: '', sort: 'newest' });

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.rating) params.append('rating', filters.rating);
            if (filters.sort) params.append('sort', filters.sort);
            const res = await fetch(`${__API_BASE__}/api/reviews?${params}`);
            const json = await res.json();
            setData(json);
        } catch { /* show empty state */ } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReviews(); }, [filters]);

    const { reviews, totalCount, avgRating, breakdown, categoryAvgs } = data;

    return (
        <div className="min-h-screen bg-navy-950 text-slate-200 selection:bg-gold-400 selection:text-navy-950">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#162440_0%,_#0b1220_100%)] pointer-events-none" />
                <div className="container mx-auto px-6 relative text-center">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-gold-400 uppercase tracking-[0.3em] text-xs font-semibold mb-6 block"
                    >
                        Authentic Experiences
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-serif text-white mb-8"
                    >
                        What Our Guests <span className="italic text-gold-400">Are Saying</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed mb-10 font-light"
                    >
                        Every review is submitted by verified guests who have completed their stay.
                        Real experiences, real feedback from across our global destinations.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center justify-center gap-3 text-white/40 text-sm uppercase tracking-widest"
                    >
                        <Link to="/" className="hover:text-gold-400 transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-gold-400">Reviews</span>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 border-y border-white/5 bg-navy-900/40 backdrop-blur-sm">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="text-center md:text-left">
                            <div className="flex items-end justify-center md:justify-start gap-4 mb-4">
                                <p className="text-8xl font-serif text-white leading-none">{avgRating}</p>
                                <div className="pb-2">
                                    <StarDisplay rating={Math.round(avgRating)} size="w-6 h-6" />
                                    <p className="text-gold-400/60 mt-2 text-sm uppercase tracking-widest font-semibold">
                                        Overall Excellence
                                    </p>
                                </div>
                            </div>
                            <p className="text-white/40 text-sm italic">
                                Based on {totalCount} verified stay{totalCount !== 1 ? 's' : ''}
                            </p>
                        </div>

                        <div className="space-y-4 max-w-md ml-auto w-full">
                            {(breakdown.length ? breakdown : [5, 4, 3, 2, 1].map(s => ({ star: s, count: 0 }))).map(({ star, count }) => (
                                <div key={star} className="flex items-center gap-4">
                                    <span className="text-white/40 text-xs w-4 font-bold">{star}</span>
                                    <Star className="w-3 h-3 text-gold-400 fill-gold-400" />
                                    <div className="flex-1 bg-white/5 rounded-full h-1 overflow-hidden">
                                        <div
                                            className="h-full bg-gold-400 transition-all duration-1000"
                                            style={{ width: totalCount ? `${(count / totalCount) * 100}%` : '0%' }}
                                        />
                                    </div>
                                    <span className="text-white/40 text-[10px] w-8 text-right font-medium">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {Object.keys(categoryAvgs).length > 0 && (
                        <div className="mt-20 pt-16 border-t border-white/5">
                            <h3 className="text-gold-400 text-xs uppercase tracking-[0.3em] font-bold mb-10 text-center md:text-left">
                                Detailed Metrics
                            </h3>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8">
                                {Object.entries(categoryAvgs).map(([key, val]) => (
                                    <div key={key} className="space-y-3">
                                        <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
                                            <span className="text-white/60">{key.replace(/([A-Z])/g, ' $1')}</span>
                                            <span className="text-gold-400">{val}</span>
                                        </div>
                                        <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gold-400/50"
                                                style={{ width: `${(val / 5) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Filter Bar */}
            <section className="pt-24 pb-12">
                <div className="container mx-auto px-6">
                    <div className="glass-panel p-4 rounded-sm flex flex-wrap gap-6 items-center justify-between">
                        <div className="flex flex-wrap gap-4 items-center">
                            <div className="flex items-center gap-2 text-gold-400/60 uppercase tracking-widest text-[10px] font-bold">
                                <Filter className="w-3 h-3" />
                                <span>Refine By</span>
                            </div>
                            <select
                                value={filters.rating}
                                onChange={e => setFilters(f => ({ ...f, rating: e.target.value }))}
                                className="bg-navy-950 border border-white/10 rounded-sm px-4 py-2 text-xs text-white focus:outline-none focus:border-gold-400/50 transition-colors cursor-pointer uppercase tracking-widest"
                            >
                                <option value="">All Ratings</option>
                                {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Star{r !== 1 ? 's' : ''}</option>)}
                            </select>
                            <select
                                value={filters.sort}
                                onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}
                                className="bg-navy-950 border border-white/10 rounded-sm px-4 py-2 text-xs text-white focus:outline-none focus:border-gold-400/50 transition-colors cursor-pointer uppercase tracking-widest"
                            >
                                <option value="newest">Most Recent</option>
                                <option value="highest">Highest Rated</option>
                                <option value="lowest">Lowest Rated</option>
                                <option value="oldest">Oldest First</option>
                            </select>
                            {(filters.rating || filters.sort !== 'newest') && (
                                <button
                                    onClick={() => setFilters({ rating: '', sort: 'newest' })}
                                    className="text-gold-400 text-[10px] uppercase tracking-widest font-bold hover:text-white transition-colors"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                        <div className="text-white/40 text-[10px] uppercase tracking-widest font-bold">
                            Showing {reviews.length} Experiences
                        </div>
                    </div>

                    {/* Review Grid */}
                    <div className="mt-16">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="glass-panel h-64 rounded-sm animate-pulse" />
                                ))}
                            </div>
                        ) : reviews.length === 0 ? (
                            <div className="text-center py-32 glass-panel rounded-sm">
                                <Star className="w-12 h-12 text-white/5 mx-auto mb-6" />
                                <h3 className="text-2xl font-serif text-white mb-2">No Stories Found</h3>
                                <p className="text-white/40 font-light">Be the first to share your unforgettable moment.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {reviews.map((r, index) => {
                                    const initials = r.user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'G';
                                    return (
                                        <motion.div
                                            key={r._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: (index % 3) * 0.1 }}
                                            className="glass-panel p-8 rounded-sm group hover:bg-navy-900/60 transition-all duration-500 h-full flex flex-col"
                                        >
                                            <div className="flex items-center justify-between mb-8">
                                                <StarDisplay rating={r.overallRating} />
                                                <div className="text-[10px] text-white/20 uppercase tracking-widest font-bold">
                                                    {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                </div>
                                            </div>

                                            <p className="text-white/80 font-light italic leading-relaxed mb-10 flex-grow">
                                                "{r.comment}"
                                            </p>

                                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-gold-400/10 flex items-center justify-center text-gold-400 text-xs font-bold border border-gold-400/20">
                                                        {initials}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-white font-serif text-sm">{r.user?.fullName || 'Distinguished Guest'}</h4>
                                                        <span className="text-white/40 text-[9px] uppercase tracking-widest font-bold flex items-center gap-1.5 mt-0.5">
                                                            <MapPin className="w-2.5 h-2.5" />
                                                            {r.location}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-gold-400/40">
                                                    <ThumbsUp className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-navy-900/20 pointer-events-none" />
                <div className="container mx-auto px-6 text-center relative z-10">
                    <h2 className="text-4xl font-serif text-white mb-6 italic">Stayed with Us Recently?</h2>
                    <p className="text-white/60 mb-10 max-w-md mx-auto font-light leading-relaxed">
                        Your stories inspire us. Join our circle of distinguished guests and share your unique experience.
                    </p>
                    <Link to="/dashboard">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-10 py-4 bg-gold-400 text-navy-950 font-bold uppercase tracking-widest text-[11px] rounded-sm hover:bg-white transition-colors"
                        >
                            Write a Review
                        </motion.button>
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default ReviewsPage;





