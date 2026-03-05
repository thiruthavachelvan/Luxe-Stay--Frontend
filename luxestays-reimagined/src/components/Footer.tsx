import { motion } from "motion/react";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-navy-950 pt-24 pb-12 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl font-serif font-bold tracking-widest text-white">
                LUXESTAYS
              </span>
              <div className="w-2 h-2 rounded-full bg-gold-400 mt-1" />
            </div>
            <p className="text-white/50 mb-8 leading-relaxed font-light text-sm">
              Curating the world's most exceptional stays since 1994. Experience the pinnacle of hospitality.
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-gold-400 hover:border-gold-400 transition-all duration-300">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-serif text-lg mb-6">Navigation</h4>
            <ul className="space-y-4">
              {["Home", "Destinations", "Rooms", "Dining", "Spa & Wellness", "Offers"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-white/50 hover:text-gold-400 transition-colors text-sm uppercase tracking-wider">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-serif text-lg mb-6">Support</h4>
            <ul className="space-y-4">
              {["Contact Us", "FAQs", "Privacy Policy", "Terms of Service", "Sitemap"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-white/50 hover:text-gold-400 transition-colors text-sm uppercase tracking-wider">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-serif text-lg mb-6">Contact</h4>
            <ul className="space-y-4 text-sm text-white/50 font-light">
              <li>123 Luxury Avenue, Paris, France</li>
              <li>+1 (800) 123-4567</li>
              <li>concierge@luxestays.com</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs tracking-wider">
            © 2026 LuxeStays Hotels & Resorts. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-white/30 uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
