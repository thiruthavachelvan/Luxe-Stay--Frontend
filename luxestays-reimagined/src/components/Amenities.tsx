import { motion } from "motion/react";
import { Wifi, Utensils, Waves, Dumbbell, Wine, Sparkles } from "lucide-react";

const amenities = [
  { icon: Wifi, name: "Free WiFi" },
  { icon: Sparkles, name: "Luxury Spa" },
  { icon: Waves, name: "Infinity Pool" },
  { icon: Dumbbell, name: "Gym Center" },
  { icon: Utensils, name: "Fine Dining" },
  { icon: Wine, name: "Rooftop Bar" },
];

export default function Amenities() {
  return (
    <section className="py-24 bg-navy-900/50" id="amenities">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-gold-400 uppercase tracking-widest text-xs font-semibold mb-4 block"
          >
            Our Services
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-serif text-white mb-6"
          >
            Hotel <span className="italic text-gold-400">Amenities</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {amenities.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="flex flex-col items-center justify-center p-8 rounded-xl bg-navy-800/30 border border-white/5 backdrop-blur-sm group cursor-pointer transition-all duration-300 hover:bg-navy-800/60 hover:border-gold-400/30 hover:shadow-xl hover:shadow-gold-400/5"
            >
              <div className="w-16 h-16 rounded-full bg-navy-950 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/10 group-hover:border-gold-400/50 shadow-lg">
                <item.icon className="w-6 h-6 text-white group-hover:text-gold-400 transition-colors" />
              </div>
              <h3 className="text-white font-medium text-sm tracking-widest uppercase text-center group-hover:text-gold-400 transition-colors">{item.name}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
