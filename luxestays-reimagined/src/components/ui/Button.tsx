import { motion } from "motion/react";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  className?: string;
  onClick?: () => void;
}

export default function Button({ children, variant = "primary", className = "", onClick }: ButtonProps) {
  const baseStyles = "px-8 py-3 rounded-none font-medium tracking-widest uppercase text-xs transition-all duration-300 relative overflow-hidden group";
  
  const variants = {
    primary: "bg-gold-400 text-navy-950 hover:bg-white hover:text-navy-950 shadow-lg shadow-gold-400/10",
    secondary: "bg-navy-800 text-white hover:bg-navy-700",
    outline: "bg-transparent border border-white/20 text-white hover:border-gold-400 hover:text-gold-400",
    ghost: "bg-transparent text-white/70 hover:text-gold-400",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
    >
      <span className="relative z-10 flex items-center gap-2 justify-center">{children}</span>
    </motion.button>
  );
}
