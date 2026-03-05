import { motion } from "motion/react";
import { Star, MapPin, ArrowRight } from "lucide-react";
import Button from "./ui/Button";

const rooms = [
  {
    id: 1,
    name: "Ocean View Villa",
    location: "Maldives",
    type: "Private Villa",
    price: "$1,200",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=2574&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Royal Penthouse",
    location: "Paris, France",
    type: "Penthouse Suite",
    price: "$2,500",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1590490360182-f33efe80a713?q=80&w=2670&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Alpine Chalet",
    location: "Swiss Alps",
    type: "Luxury Cabin",
    price: "$1,800",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1513581166391-887a96ddeafd?q=80&w=2669&auto=format&fit=crop",
  }
];

export default function FeaturedRooms() {
  return (
    <section className="py-32 relative bg-navy-950" id="rooms">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-gold-400 uppercase tracking-widest text-xs font-semibold mb-4 block"
            >
              Accommodations
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-serif text-white"
            >
              Featured <span className="italic text-gold-400">Suites</span>
            </motion.h2>
          </div>
          <Button variant="outline" className="hidden md:flex">
            View All Rooms
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="group relative h-[600px] w-full overflow-hidden rounded-sm cursor-pointer"
            >
              <div className="absolute inset-0 bg-navy-950">
                <img 
                  src={room.image} 
                  alt={room.name} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                />
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/20 to-transparent opacity-90" />

              <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-3 h-3 text-gold-400" />
                  <span className="text-white/70 text-xs uppercase tracking-widest">{room.location}</span>
                </div>
                
                <h3 className="text-3xl font-serif text-white mb-2">{room.name}</h3>
                <p className="text-white/50 text-sm mb-6">{room.type}</p>

                <div className="flex items-center justify-between border-t border-white/10 pt-6">
                  <div>
                    <p className="text-gold-400 text-xl font-serif">{room.price} <span className="text-xs text-white/50 font-sans uppercase tracking-wider">/ Night</span></p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-gold-400 fill-gold-400" />
                      <span className="text-white/70 text-xs">{room.rating} (120 Reviews)</span>
                    </div>
                  </div>
                  
                  <button className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white group-hover:bg-gold-400 group-hover:border-gold-400 group-hover:text-navy-950 transition-all duration-300">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
