import { motion } from "motion/react";
import Button from "./ui/Button";

export default function Newsletter() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=3270&auto=format&fit=crop"
                    alt="Luxury"
                    className="w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-navy-950/90" />
            </div>

            <div className="container mx-auto px-6 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-2xl mx-auto"
                >
                    <span className="text-gold-400 uppercase tracking-widest text-xs font-semibold mb-4 block">
                        Join The Club
                    </span>
                    <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">
                        Unlock Exclusive <span className="italic text-gold-400">Privileges</span>
                    </h2>
                    <p className="text-white/60 mb-10 font-light">
                        Subscribe to our newsletter for early access to new destinations, special offers, and curated travel inspiration.
                    </p>

                    <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
                        <input
                            type="email"
                            placeholder="Your Email Address"
                            className="flex-1 bg-white/5 border border-white/10 px-6 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-gold-400 transition-colors"
                            required
                        />
                        <Button variant="primary" type="submit">Subscribe</Button>
                    </form>
                </motion.div>
            </div>
        </section>
    );
}
