import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Button from "./ui/Button";

export default function Offers() {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const res = await fetch(`${__API_BASE__}/api/public/coupons/featured`);
                if (res.ok) {
                    const data = await res.json();
                    setOffers(data);
                }
            } catch (error) {
                console.error("Failed to fetch featured offers:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOffers();
    }, []);

    if (loading && offers.length === 0) return null;

    return (
        <section className="py-24 bg-navy-900/30" id="offers">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {offers.map((offer, index) => (
                        <motion.div
                            key={offer._id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="relative h-[400px] rounded-sm overflow-hidden group"
                        >
                            <img
                                src={offer.featuredImage || "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2670&auto=format&fit=crop"}
                                alt={offer.featuredTitle || offer.code}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-navy-950/40 group-hover:bg-navy-950/30 transition-colors" />
                            <div className="absolute inset-0 p-8 flex flex-col justify-center items-start">
                                <span className={`text-navy-950 text-xs font-bold px-3 py-1 uppercase tracking-widest mb-4 ${index % 2 === 0 ? 'bg-gold-400' : 'bg-white'}`}>
                                    {offer.featuredTag || (offer.discountType === 'percent' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`)}
                                </span>
                                <h3 className="text-2xl md:text-3xl font-serif text-white mb-4">
                                    {offer.featuredTitle || offer.description || 'Exclusive Seasonal Offer'}
                                </h3>
                                <p className="text-white/80 mb-8 max-w-sm text-sm">
                                    {offer.featuredSubtitle || `Use code ${offer.code} at checkout.`}
                                </p>
                                <Button variant="outline" className="!py-2 !px-4 text-xs">View Details</Button>
                            </div>
                        </motion.div>
                    ))}

                    {/* Fillers to ensure 3 in a line if less than 3 real offers exist */}
                    {offers.length < 3 && [...Array(3 - offers.length)].map((_, i) => (
                        <motion.div
                            key={`filler-${i}`}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: (offers.length + i) * 0.2 }}
                            className="relative h-[400px] rounded-sm overflow-hidden group"
                        >
                            <img
                                src={i === 0 ? "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=2574&auto=format&fit=crop" : "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=3270&auto=format&fit=crop"}
                                alt="Exclusive"
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-navy-950/40 group-hover:bg-navy-950/30 transition-colors" />
                            <div className="absolute inset-0 p-8 flex flex-col justify-center items-start">
                                <span className="bg-white text-navy-950 text-xs font-bold px-3 py-1 uppercase tracking-widest mb-4">{i === 0 ? 'Membership' : 'Dining'}</span>
                                <h3 className="text-2xl md:text-3xl font-serif text-white mb-4">{i === 0 ? 'LuxeStay Membership Perks' : 'Gourmet Dining Experience'}</h3>
                                <p className="text-white/80 mb-8 max-w-sm text-sm">{i === 0 ? 'Unlock up to 25% discount and free spa sessions.' : 'Savor world-class cuisine with our master chefs.'}</p>
                                <Button variant="outline" className="!py-2 !px-4 text-xs">Explore More</Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
