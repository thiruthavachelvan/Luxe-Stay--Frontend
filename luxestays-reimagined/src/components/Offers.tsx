import { motion } from "motion/react";
import Button from "./ui/Button";

export default function Offers() {
  return (
    <section className="py-24 bg-navy-900/30" id="offers">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Offer 1 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative h-[400px] rounded-sm overflow-hidden group"
          >
            <img 
              src="https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2670&auto=format&fit=crop" 
              alt="Resort" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-navy-950/40 group-hover:bg-navy-950/30 transition-colors" />
            <div className="absolute inset-0 p-10 flex flex-col justify-center items-start">
              <span className="bg-gold-400 text-navy-950 text-xs font-bold px-3 py-1 uppercase tracking-widest mb-4">Limited Offer</span>
              <h3 className="text-3xl md:text-4xl font-serif text-white mb-4">Stay 3 Nights, <br /> Pay for 2</h3>
              <p className="text-white/80 mb-8 max-w-sm">Experience more luxury for less. Book your extended weekend getaway now.</p>
              <Button variant="outline">View Details</Button>
            </div>
          </motion.div>

          {/* Offer 2 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative h-[400px] rounded-sm overflow-hidden group"
          >
            <img 
              src="https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=2574&auto=format&fit=crop" 
              alt="Honeymoon" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-navy-950/40 group-hover:bg-navy-950/30 transition-colors" />
            <div className="absolute inset-0 p-10 flex flex-col justify-center items-start">
              <span className="bg-white text-navy-950 text-xs font-bold px-3 py-1 uppercase tracking-widest mb-4">Exclusive</span>
              <h3 className="text-3xl md:text-4xl font-serif text-white mb-4">Romantic <br /> Honeymoon Package</h3>
              <p className="text-white/80 mb-8 max-w-sm">Champagne on arrival, sunset dinner, and a couple's spa treatment included.</p>
              <Button variant="outline">View Details</Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
