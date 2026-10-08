"use client";

import { motion, AnimatePresence } from "framer-motion";
import { modalBackdrop, scaleIn, hoverLift } from "@/lib/animations";
import { X, Sparkles, User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface GuestAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
}

export default function GuestAuthModal({ isOpen, onClose, videoId }: GuestAuthModalProps) {
  const router = useRouter();

  const handleContinueAsGuest = () => {
    // Set a session storage flag so we know this user has explicitly opted into guest mode
    sessionStorage.setItem("spiritual-clip-guest", "true");
    onClose();
    router.push(`/editor/${videoId}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal Panel */}
            <motion.div
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-ivory rounded-[24px] shadow-level-3 border border-sand overflow-hidden"
            >
              {/* Header */}
              <div className="relative p-6 pb-4 border-b border-sand/50 text-center">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 p-2 text-charcoal/40 hover:text-charcoal bg-sand/30 hover:bg-sand/60 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="w-12 h-12 bg-soft-gold/20 text-soft-gold rounded-full flex items-center justify-center mx-auto mb-3 shadow-2xs border border-soft-gold/30">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-semibold font-heading text-charcoal">
                  Join the Community
                </h2>
                <p className="text-sm text-charcoal/60 mt-1">
                  Sign in to save your clips to your profile and share them with the world.
                </p>
              </div>

              {/* Body Options */}
              <div className="p-6 space-y-4">
                
                {/* Login / Sign Up */}
                <Link href={`/login?redirect=/editor/${videoId}`} className="block" onClick={onClose}>
                  <motion.div 
                    whileHover={hoverLift}
                    className="w-full flex items-center p-4 rounded-large bg-white border border-sand/80 shadow-level-1 cursor-pointer group"
                  >
                    <div className="w-10 h-10 bg-emerald/10 text-emerald rounded-full flex items-center justify-center shrink-0 mr-4 group-hover:scale-110 transition-transform">
                      <LogIn className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-charcoal">Sign In / Register</h3>
                      <p className="text-xs text-charcoal/60">Sign up for free in 2 mins</p>
                    </div>
                  </motion.div>
                </Link>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="h-px bg-sand flex-1" />
                  <span className="text-xs font-medium text-charcoal/40 uppercase tracking-widest">OR</span>
                  <div className="h-px bg-sand flex-1" />
                </div>

                {/* Continue as Guest */}
                <motion.div 
                  whileHover={hoverLift}
                  onClick={handleContinueAsGuest}
                  className="w-full flex items-center p-4 rounded-large bg-sand/20 border border-sand/50 cursor-pointer group"
                >
                  <div className="w-10 h-10 bg-charcoal/5 text-charcoal/60 rounded-full flex items-center justify-center shrink-0 mr-4 group-hover:scale-110 transition-transform">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-charcoal">Continue as Guest</h3>
                    <p className="text-xs text-charcoal/60">Create and download, but cannot share with community.</p>
                  </div>
                </motion.div>
                
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
