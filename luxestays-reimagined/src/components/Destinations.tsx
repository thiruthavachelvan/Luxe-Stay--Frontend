import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

const destinations = [
  {
    id: 1,
    name: "Dubai",
    image: "https://images.unsplash.com/photo-1512453979798-5ea904acfb5a?q=80&w=2000&auto=format&fit=crop",
    properties: "12 Properties"
  },
  {
    id: 2,
    name: "Maldives",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=2667&auto=format&fit=crop",
    properties: "8 Properties"
  },
  {
    id: 3,
    name: "Paris",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2673&auto=format&fit=crop",
    properties: "15 Properties"
  },
  {
    id: 4,
    name: "Tokyo",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2694&auto=format&fit=crop",
    properties: "9 Properties"
  },
  {
    id: 5,
    name: "Bali",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2638&auto=format&fit=crop",
    properties: "18 Properties"
  }
];

export default function Destinations() {
  return (
    <section className="py-24 overflow-hidden" id="locations">
      <div className="container mx-auto px-6 mb-12 flex items-end justify-between">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-gold-400 uppercase tracking-widest text-xs font-semibold mb-4 block"
          >
            Explore
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-serif text-white"
          >
            Iconic <span className="italic text-gold-400">Destinations</span>
          </motion.h2>
        </div>
        <div className="hidden md:flex gap-4">
            <button className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                ←
            </button>
            <button className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                →
            </button>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-12 px-6 md:px-0 container mx-auto no-scrollbar snap-x">
        {destinations.map((dest, index) => (
          <motion.div
            key={dest.id}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="min-w-[300px] md:min-w-[400px] h-[500px] relative rounded-sm overflow-hidden group cursor-pointer snap-center"
          >
            <img 
              src={dest.image} 
              alt={dest.name} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent opacity-80" />
            
            <div className="absolute bottom-0 left-0 p-8">
              <span className="text-gold-400 text-xs uppercase tracking-widest mb-2 block">{dest.properties}</span>
              <h3 className="text-4xl font-serif text-white mb-4">{dest.name}</h3>
              <div className="w-12 h-[1px] bg-white/30 group-hover:w-24 transition-all duration-500" />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
