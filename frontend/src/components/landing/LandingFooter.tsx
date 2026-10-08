"use client";

import Link from "next/link";
import { Sparkles, Heart, ExternalLink, Globe } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="relative z-10 w-full border-t border-sand/70 bg-ivory/70 backdrop-blur-md pt-12 sm:pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* ========================================================================= */}
        {/* 2-COLUMN BALANCED GRID                                                    */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Brand & Spiritual Mission (7 cols) */}
          <div className="md:col-span-7 space-y-3.5">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-soft-gold/20 border border-soft-gold/40 flex items-center justify-center text-soft-gold">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-heading text-2xl font-semibold text-charcoal tracking-wide">
                Muhammadan Way <span className="text-soft-gold font-normal text-xl">Clip Studio</span>
              </span>
            </Link>

            <p className="text-sm text-charcoal/70 leading-relaxed max-w-lg">
              A dedicated spiritual production tool designed to spread the sacred love of Sayyidina Muhammad ﷺ across modern social media through the teachings of Mawlana Shaykh Nurjan Mirahmadi (Q).
            </p>
          </div>

          {/* Right Column: Official Resources (5 cols) */}
          <div className="md:col-span-5 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal/90">
              Official Resources
            </h4>
            
            <ul className="space-y-2.5 text-sm text-charcoal/70">
              <li>
                <a
                  href="https://www.youtube.com/@MuhammadanWay"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-soft-gold transition-colors inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-error-red fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span>YouTube Channel</span>
                  <ExternalLink className="w-3 h-3 text-charcoal/40" />
                </a>
              </li>

              <li>
                <a
                  href="https://nurmuhammad.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-soft-gold transition-colors inline-flex items-center gap-2"
                >
                  <Globe className="w-4 h-4 text-emerald-green" />
                  <span>NurMuhammad.com</span>
                  <ExternalLink className="w-3 h-3 text-charcoal/40" />
                </a>
              </li>

              {/* UPDATED: FZHH Charity Link */}
              <li>
                <a
                  href="https://muslimcharity.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-soft-gold transition-colors inline-flex items-center gap-2"
                >
                  <Heart className="w-4 h-4 text-soft-gold" />
                  <span>FZHH Charity</span>
                  <ExternalLink className="w-3 h-3 text-charcoal/40" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-sand/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal/50 text-center sm:text-left">
          <p>© 2026 Muhammadan Way Clip Studio. All rights reserved.</p>
          <p className="font-heading italic text-sm text-charcoal/70">
            "Spread love, kindness, and heavenly knowledge to all souls."
          </p>
        </div>

      </div>
    </footer>
  );
}