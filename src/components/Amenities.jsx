import { Wifi, Sparkles, Dumbbell, Waves, Utensils, Wine } from 'lucide-react';

const amenities = [
    { id: 1, name: 'Free WiFi', icon: Wifi, color: 'text-luxury-gold', glow: 'rgba(96,165,250,0.4)', bg: 'bg-[#D4AF37]/10', border: 'border-luxury-gold/20' },
    { id: 2, name: 'Luxury Spa', icon: Sparkles, color: 'text-purple-400', glow: 'rgba(192,132,252,0.4)', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
    { id: 3, name: 'Gym Center', icon: Dumbbell, color: 'text-orange-400', glow: 'rgba(251,146,60,0.4)', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
    { id: 4, name: 'Heated Pool', icon: Waves, color: 'text-cyan-400', glow: 'rgba(34,211,238,0.4)', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' },
    { id: 5, name: 'Fine Dining', icon: Utensils, color: 'text-rose-400', glow: 'rgba(251,113,133,0.4)', bg: 'bg-rose-400/10', border: 'border-rose-400/20' },
    { id: 6, name: 'Rooftop Bar', icon: Wine, color: 'text-[#D4AF37]', glow: 'rgba(212,175,55,0.4)', bg: 'bg-[#D4AF37]/10', border: 'border-[#D4AF37]/20' },
];

// Reusable gold label with flanking lines — matches Hero section
const GoldLabel = ({ children }) => (
    <div className="flex items-center justify-center gap-3 mb-4">
        <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#D4AF37]/60" />
        <span className="text-[#D4AF37] uppercase tracking-[0.3em] text-xs font-bold">{children}</span>
        <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#D4AF37]/60" />
    </div>
);

const Amenities = () => {
    return (
        <section className="py-24 bg-[#0A1020] relative overflow-hidden">
            {/* Ambient blobs */}
            <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-luxury-gold/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
            <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />

            <div className="container mx-auto px-6 text-center relative z-10">

                {/* Heading */}
                <GoldLabel>Exclusive Services</GoldLabel>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                    World-Class{' '}
                    <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-yellow-200 to-[#D4AF37]">
                        Amenities
                    </span>
                </h2>
                <p className="text-white/40 text-sm mb-16 font-light max-w-xl mx-auto">
                    Every detail of your stay is curated for perfection — from wellness and
                    gastronomy to adventure and relaxation.
                </p>

                {/* Amenity Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-5xl mx-auto">
                    {amenities.map((item) => (
                        <div
                            key={item.id}
                            className="flex flex-col items-center group cursor-pointer"
                        >
                            {/* Icon card — glassmorphism style */}
                            <div
                                className={`w-20 h-20 rounded-2xl ${item.bg} border ${item.border} flex items-center justify-center mb-5 group-hover:-translate-y-3 transition-all duration-400 relative overflow-hidden`}
                                style={{ '--glow': item.glow }}
                            >
                                {/* Inner shimmer */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                {/* Glow shadow on hover via inline style */}
                                <div
                                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                                    style={{ boxShadow: `0 0 30px ${item.glow}` }}
                                />
                                <item.icon
                                    className={`w-8 h-8 ${item.color} group-hover:scale-110 transition-transform duration-300 relative z-10`}
                                    style={{ filter: `drop-shadow(0 0 8px ${item.glow})` }}
                                />
                            </div>
                            <span className="text-white/70 font-medium text-sm tracking-wide group-hover:text-[#D4AF37] transition-colors duration-300">
                                {item.name}
                            </span>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default Amenities;





