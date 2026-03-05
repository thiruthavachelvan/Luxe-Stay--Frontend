import { motion } from "motion/react";
import Button from "./ui/Button";
import { Search, MapPin, Calendar, Users, ChevronDown } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=3270&auto=format&fit=crop" 
          alt="Luxury Hotel" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/60 via-navy-950/20 to-navy-950" />
      </div>

      <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium leading-tight mb-6 text-white tracking-tight">
            Experience Luxury <br />
            <span className="italic text-gold-400">Redefined</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-light tracking-wide">
            Curated sanctuaries where timeless elegance meets modern luxury in the world's most iconic destinations.
          </p>
        </motion.div>

        {/* Floating Booking Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="max-w-5xl mx-auto w-full glass-panel rounded-xl p-6 md:p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            
            {/* Destination */}
            <div className="space-y-2 border-b border-white/10 pb-4 md:border-b-0 md:pb-0 md:border-r md:pr-4">
              <label className="text-xs uppercase tracking-widest text-white/50 font-medium flex items-center gap-2">
                <MapPin className="w-3 h-3 text-gold-400" /> Destination
              </label>
              <div className="flex items-center justify-between cursor-pointer group">
                <span className="text-white font-serif text-lg group-hover:text-gold-400 transition-colors">Maldives</span>
                <ChevronDown className="w-4 h-4 text-white/30" />
              </div>
            </div>

            {/* Check In */}
            <div className="space-y-2 border-b border-white/10 pb-4 md:border-b-0 md:pb-0 md:border-r md:pr-4">
              <label className="text-xs uppercase tracking-widest text-white/50 font-medium flex items-center gap-2">
                <Calendar className="w-3 h-3 text-gold-400" /> Check In
              </label>
              <div className="flex items-center justify-between cursor-pointer group">
                <span className="text-white font-serif text-lg group-hover:text-gold-400 transition-colors">12 Oct</span>
                <ChevronDown className="w-4 h-4 text-white/30" />
              </div>
            </div>

            {/* Check Out */}
            <div className="space-y-2 border-b border-white/10 pb-4 md:border-b-0 md:pb-0 md:border-r md:pr-4">
              <label className="text-xs uppercase tracking-widest text-white/50 font-medium flex items-center gap-2">
                <Calendar className="w-3 h-3 text-gold-400" /> Check Out
              </label>
              <div className="flex items-center justify-between cursor-pointer group">
                <span className="text-white font-serif text-lg group-hover:text-gold-400 transition-colors">19 Oct</span>
                <ChevronDown className="w-4 h-4 text-white/30" />
              </div>
            </div>

            {/* Guests */}
            <div className="space-y-2 border-b border-white/10 pb-4 md:border-b-0 md:pb-0 md:border-r md:pr-4">
              <label className="text-xs uppercase tracking-widest text-white/50 font-medium flex items-center gap-2">
                <Users className="w-3 h-3 text-gold-400" /> Guests
              </label>
              <div className="flex items-center justify-between cursor-pointer group">
                <span className="text-white font-serif text-lg group-hover:text-gold-400 transition-colors">2 Adults</span>
                <ChevronDown className="w-4 h-4 text-white/30" />
              </div>
            </div>

             {/* Room Type */}
             <div className="space-y-2 border-b border-white/10 pb-4 md:border-b-0 md:pb-0 md:border-r md:pr-4">
              <label className="text-xs uppercase tracking-widest text-white/50 font-medium flex items-center gap-2">
                <Search className="w-3 h-3 text-gold-400" /> Room
              </label>
              <div className="flex items-center justify-between cursor-pointer group">
                <span className="text-white font-serif text-lg group-hover:text-gold-400 transition-colors">Suite</span>
                <ChevronDown className="w-4 h-4 text-white/30" />
              </div>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <Button variant="primary" className="w-full h-12 !text-xs">
                Search Rooms
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
