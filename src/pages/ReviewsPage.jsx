import { useState, useEffect } from 'react';
import { Star, Filter, ChevronRight, ThumbsUp, MapPin, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const StarDisplay = ({ rating, size = 'w-4 h-4' }) => (
    <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className={`${size} ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-luxury-border fill-luxury-border'}`} />
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
            const res = await fetch(`http://localhost:5000/api/reviews?${params}`);
            const json = await res.json();
            setData(json);
        } catch { /* show empty state */ } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReviews(); }, [filters]);

    const { reviews, totalCount, avgRating, breakdown, categoryAvgs } = data;

    return (
        <div className="min-h-screen bg-luxury-dark text-luxury-text">
            <Navbar />

            {/* Hero */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 via-transparent to-luxury-blue/10 pointer-events-none" />
                <div className="container mx-auto px-6 relative">
                    <span className="text-luxury-blue text-xs font-bold tracking-[0.2em] uppercase mb-4 block">
                        Authentic Experiences
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        What Our Guests <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-luxury-blue">
                            Are Saying
                        </span>
                    </h1>
                    <p className="text-luxury-muted text-lg max-w-2xl leading-relaxed mb-6">
                        Every review is submitted by verified guests who have completed their stay. Real experiences, real feedback.
                    </p>
                    <div className="flex items-center gap-2 text-luxury-muted text-sm">
                        <span>Home</span><ChevronRight className="w-4 h-4" /><span className="text-luxury-blue">Reviews</span>
                    </div>
                </div>
            </section>

            {/* Stats & Breakdown */}
            <section className="bg-[#1A2235] border-y border-luxury-border py-12">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Overall Score */}
                        <div className="text-center md:text-left">
                            <p className="text-7xl font-bold text-white mb-2">{avgRating}</p>
                            <StarDisplay rating={Math.round(avgRating)} size="w-6 h-6" />
                            <p className="text-luxury-muted mt-3 text-sm">{totalCount} verified guest review{totalCount !== 1 ? 's' : ''}</p>
                        </div>

                        {/* Rating Breakdown */}
                        <div className="space-y-3">
                            {(breakdown.length ? breakdown : [5, 4, 3, 2, 1].map(s => ({ star: s, count: 0 }))).map(({ star, count }) => (
                                <div key={star} className="flex items-center gap-3">
                                    <span className="text-luxury-muted text-xs w-4">{star}</span>
                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                    <div className="flex-1 bg-luxury-border/30 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-full bg-amber-400 rounded-full transition-all duration-700"
                                            style={{ width: totalCount ? `${(count / totalCount) * 100}%` : '0%' }}
                                        />
                                    </div>
                                    <span className="text-luxury-muted text-xs w-6">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Category Ratings */}
                    {Object.keys(categoryAvgs).length > 0 && (
                        <div className="mt-10 pt-10 border-t border-luxury-border">
                            <p className="text-white font-semibold mb-5 text-sm uppercase tracking-widest">Category Breakdown</p>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(categoryAvgs).map(([key, val]) => (
                                    <RatingBar key={key} label={key} value={val} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Filters & Reviews */}
            <section className="py-16">
                <div className="container mx-auto px-6">
                    {/* Filter Bar */}
                    <div className="flex flex-wrap gap-4 items-center mb-10 pb-6 border-b border-luxury-border">
                        <div className="flex items-center gap-2 text-luxury-muted">
                            <Filter className="w-4 h-4" />
                            <span className="text-sm font-medium">Filter by:</span>
                        </div>
                        <select
                            value={filters.rating}
                            onChange={e => setFilters(f => ({ ...f, rating: e.target.value }))}
                            className="bg-[#1A2235] border border-luxury-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-luxury-blue transition-colors"
                        >
                            <option value="">All Ratings</option>
                            {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Star{r !== 1 ? 's' : ''}</option>)}
                        </select>
                        <select
                            value={filters.sort}
                            onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}
                            className="bg-[#1A2235] border border-luxury-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-luxury-blue transition-colors"
                        >
                            <option value="newest">Most Recent</option>
                            <option value="highest">Highest Rated</option>
                            <option value="lowest">Lowest Rated</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                        {(filters.rating || filters.sort !== 'newest') && (
                            <button onClick={() => setFilters({ rating: '', sort: 'newest' })} className="text-luxury-blue text-sm hover:underline">
                                Clear filters
                            </button>
                        )}
                    </div>

                    {/* Review Cards */}
                    {loading ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="bg-[#1A2235] border border-luxury-border rounded-2xl p-6 animate-pulse">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-luxury-border/40" />
                                        <div className="space-y-2">
                                            <div className="w-24 h-3 bg-luxury-border/40 rounded" />
                                            <div className="w-16 h-2 bg-luxury-border/40 rounded" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="w-full h-3 bg-luxury-border/40 rounded" />
                                        <div className="w-3/4 h-3 bg-luxury-border/40 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-20">
                            <Star className="w-16 h-16 text-luxury-border mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No Reviews Yet</h3>
                            <p className="text-luxury-muted">Guest reviews will appear here after their stays are completed.</p>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {reviews.map((r) => {
                                const initials = r.user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'G';
                                const colors = ['bg-luxury-gold', 'bg-purple-500', 'bg-rose-500', 'bg-emerald-500', 'bg-amber-500'];
                                const color = colors[initials.charCodeAt(0) % colors.length];
                                return (
                                    <div key={r._id} className="bg-[#1A2235] border border-luxury-border rounded-2xl p-6 group hover:border-luxury-blue/30 hover:-translate-y-1 transition-all duration-300">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`${color} w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                                                    {initials}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium text-sm">{r.user?.fullName || 'Guest'}</p>
                                                    <div className="flex items-center gap-1 text-luxury-muted text-xs mt-0.5">
                                                        <MapPin className="w-3 h-3" />
                                                        <span>{r.location}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <StarDisplay rating={r.overallRating} />
                                        </div>
                                        <p className="text-luxury-muted text-sm leading-relaxed mb-4 line-clamp-4">{r.comment}</p>
                                        <div className="flex items-center justify-between text-xs text-luxury-muted pt-3 border-t border-luxury-border">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                <span>{new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-luxury-blue">
                                                <ThumbsUp className="w-3 h-3" />
                                                <span>Verified Stay</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA */}
            <section className="bg-gradient-to-r from-amber-900/20 to-luxury-blue/20 border-t border-luxury-border py-16">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-2xl font-bold text-white mb-3">Stayed with Us Recently?</h2>
                    <p className="text-luxury-muted mb-6 max-w-md mx-auto text-sm">Log in to your dashboard to share your experience and help future guests.</p>
                    <a href="/dashboard" className="inline-block px-8 py-3 bg-luxury-blue text-white font-medium rounded hover:bg-luxury-blue-hover transition-colors">
                        Write a Review
                    </a>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default ReviewsPage;
