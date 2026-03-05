import { motion } from "motion/react";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Sarah Jenkins",
    location: "New York, USA",
    text: "An absolute dream. The service was impeccable, and the villa was beyond our wildest expectations. Truly a redefining moment in luxury travel.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2574&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Michael Chen",
    location: "Singapore",
    text: "From the moment we arrived, we were treated like royalty. The attention to detail in every aspect of the resort is simply world-class.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2574&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    location: "Madrid, Spain",
    text: "The perfect escape. The spa treatments were divine, and the culinary experiences were a journey in themselves. We will definitely be back.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2864&auto=format&fit=crop"
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-navy-950" id="reviews">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-gold-400 uppercase tracking-widest text-xs font-semibold mb-4 block"
          >
            Guest Stories
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-serif text-white"
          >
            Unforgettable <span className="italic text-gold-400">Experiences</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="bg-navy-900/40 border border-white/5 p-8 rounded-sm relative group hover:bg-navy-900/60 transition-colors"
            >
              <Quote className="w-10 h-10 text-gold-400/20 absolute top-8 right-8" />
              
              <div className="flex items-center gap-1 mb-6">
                {[...Array(item.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-gold-400 fill-gold-400" />
                ))}
              </div>

              <p className="text-white/80 font-light italic mb-8 leading-relaxed">"{item.text}"</p>

              <div className="flex items-center gap-4">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-12 h-12 rounded-full object-cover border border-white/10"
                />
                <div>
                  <h4 className="text-white font-serif text-lg">{item.name}</h4>
                  <span className="text-white/40 text-xs uppercase tracking-wider">{item.location}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
