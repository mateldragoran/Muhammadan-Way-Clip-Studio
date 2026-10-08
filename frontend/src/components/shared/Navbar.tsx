"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clapperboard, Trophy, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  // Scroll-aware header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Library", href: "/library", icon: Clapperboard },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <>
      {/* ========================================= */}
      {/* DESKTOP NAVIGATION (Hidden on Mobile)     */}
      {/* ========================================= */}
      <motion.header
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "hidden md:flex sticky top-0 z-50 w-full items-center justify-between px-8 transition-all duration-300",
          scrolled
            ? "bg-ivory/95 backdrop-blur-xl border-b border-sand/80 h-14 shadow-level-1"
            : "bg-ivory/80 backdrop-blur-md border-b border-sand h-16"
        )}
      >
        {/* Full Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="w-8 h-8 rounded-full bg-soft-gold/20 border border-soft-gold/40 flex items-center justify-center text-soft-gold shadow-2xs"
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>
          <span className="font-heading text-2xl font-semibold text-charcoal tracking-wide">
            MuhammadanWay <span className="text-soft-gold font-normal">Clip Studio</span>
          </span>
        </Link>

        {/* Desktop Links with animated active indicator */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href === "/library" && pathname.startsWith("/video"));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-2 text-sm font-medium transition-colors px-4 py-2 rounded-standard",
                  isActive ? "text-charcoal" : "text-charcoal/60 hover:text-charcoal hover:bg-sand/30"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="desktop-nav-active"
                    className="absolute inset-0 bg-soft-gold/12 border border-soft-gold/25 rounded-standard"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <item.icon className={cn("w-4 h-4 relative z-10", isActive && "text-soft-gold")} />
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </motion.header>

      {/* ========================================= */}
      {/* MOBILE TOP BAR (Full Name Displayed)      */}
      {/* ========================================= */}
      <motion.header
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "md:hidden sticky top-0 z-50 w-full flex items-center justify-center px-3 transition-all duration-300",
          scrolled
            ? "bg-ivory/95 backdrop-blur-xl border-b border-sand/80 h-12 shadow-level-1"
            : "bg-ivory/90 backdrop-blur-md border-b border-sand h-14"
        )}
      >
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-soft-gold/20 border border-soft-gold/40 flex items-center justify-center text-soft-gold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-heading text-base font-semibold text-charcoal tracking-wide whitespace-nowrap">
            MuhammadanWay <span className="text-soft-gold font-normal">Clip Studio</span>
          </span>
        </Link>
      </motion.header>

      {/* ========================================= */}
      {/* MOBILE BOTTOM TAB BAR                     */}
      {/* ========================================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-sand pb-safe-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href === "/library" && pathname.startsWith("/video"));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors active:scale-95",
                  isActive ? "text-soft-gold font-semibold" : "text-charcoal/50"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-tab-active"
                    className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-soft-gold rounded-full"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <item.icon className={cn("w-6 h-6", isActive && "fill-soft-gold/20")} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}