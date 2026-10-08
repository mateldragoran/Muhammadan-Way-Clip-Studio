"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2, ArrowLeft, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn } from "@/lib/animations";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }

      router.refresh();
      router.push("/");
      
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-safe-top relative gradient-bg-animated">
      
      {/* Top Back Navigation Button */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="absolute top-4 left-4 sm:top-8 sm:left-8"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-charcoal/70 hover:text-charcoal transition-colors active:scale-95 p-2 rounded-standard hover:bg-black/5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Library
        </Link>
      </motion.div>

      {/* Brand Header */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mb-8 text-center pt-12 sm:pt-0 px-2"
      >
        <motion.div variants={fadeInUp} className="flex items-center justify-center gap-2.5 mb-3">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-10 h-10 rounded-full bg-soft-gold/20 border border-soft-gold/40 flex items-center justify-center text-soft-gold shadow-sm"
          >
            <Sparkles className="w-5 h-5" />
          </motion.div>
        </motion.div>
        <motion.h1 variants={fadeInUp} className="font-heading text-3xl sm:text-4xl font-semibold text-charcoal">
          Muhammadan Way Clip Studio
        </motion.h1>
        <motion.p variants={fadeInUp} className="text-charcoal/70 mt-2 text-sm sm:text-base">
          Spread beneficial reminders effortlessly.
        </motion.p>
      </motion.div>

      {/* Auth Card */}
      <motion.div
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md bg-white rounded-large shadow-level-2 p-6 sm:p-8 border border-sand"
      >
        <motion.h2
          key={isSignUp ? "signup" : "signin"}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-medium text-charcoal mb-6"
        >
          {isSignUp ? "Create your account" : "Welcome back"}
        </motion.h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="space-y-1"
          >
            <label className="text-sm font-medium text-charcoal/80">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full h-12 px-4 rounded-standard border border-sand bg-ivory/30 text-[16px] text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-soft-gold focus:ring-1 focus:ring-soft-gold transition-all duration-200"
            />
          </motion.div>

          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="space-y-1"
          >
            <label className="text-sm font-medium text-charcoal/80">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={6}
              className="w-full h-12 px-4 rounded-standard border border-sand bg-ivory/30 text-[16px] text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-soft-gold focus:ring-1 focus:ring-soft-gold transition-all duration-200"
            />
          </motion.div>

          <AnimatePresence mode="wait">
            {isSignUp && (
              <motion.div
                key="confirm-password"
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-1 overflow-hidden"
              >
                <label className="text-sm font-medium text-charcoal/80">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full h-12 px-4 rounded-standard border border-sand bg-ivory/30 text-[16px] text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-soft-gold focus:ring-1 focus:ring-soft-gold transition-all duration-200"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="p-3 bg-error-red/10 text-error-red text-sm rounded-standard border border-error-red/20"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full h-12 mt-2 flex items-center justify-center rounded-standard bg-soft-gold text-charcoal font-medium hover:bg-soft-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-level-1"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isSignUp ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setConfirmPassword("");
            }}
            className="text-sm text-charcoal/60 hover:text-charcoal transition-colors"
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </motion.div>
    </main>
  );
}