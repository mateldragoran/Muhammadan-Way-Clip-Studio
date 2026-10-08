"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Profile, Clip } from "@/types";
import ClipCard from "@/components/shared/ClipCard";
import { Button } from "@/components/ui/Button";
import { User, Download, Film, LogOut, Loader2, Scissors, LogIn } from "lucide-react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { pageTransition, fadeInUp, staggerContainer, scaleIn } from "@/lib/animations";

// Animated counter component
function AnimatedCount({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
    });
    const unsubscribe = rounded.on("change", (v) => setDisplayValue(v));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, count, rounded]);

  return <>{displayValue}</>;
}

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [userClips, setUserClips] = useState<Clip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        // 1. Check User Session
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // 2. Fetch User Profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
        }

        // 3. Fetch ALL Clips created by this user (Both Public and Private!)
        const { data: clipsData } = await supabase
          .from("clips")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        setUserClips(clipsData || []);

      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-soft-gold mb-3" />
        <p className="text-charcoal/60 text-sm font-medium">Loading profile...</p>
      </div>
    );
  }

  // Unauthenticated State
  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="flex flex-col items-center justify-center p-12 text-center h-[60vh] max-w-md mx-auto space-y-4"
      >
        <div className="w-16 h-16 rounded-full bg-sand/50 flex items-center justify-center text-charcoal/40 mb-2 float-animation">
          <User className="w-8 h-8" />
        </div>
        <h2 className="font-heading text-2xl font-semibold text-charcoal">
          Sign in to view your profile
        </h2>
        <p className="text-sm text-charcoal/60">
          Track your contributed clips, total downloads, and leaderboard ranking.
        </p>
        <Link href="/login" className="w-full">
          <Button size="lg" variant="emerald" className="w-full shadow-level-1">
            <LogIn className="w-5 h-5 mr-2" />
            Sign In or Create Account
          </Button>
        </Link>
      </motion.div>
    );
  }

  const totalDownloads = userClips.reduce((sum, clip) => sum + (clip.downloads || 0), 0);

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-8 pb-12"
    >
      
      {/* Profile Header Card */}
      <motion.div
        variants={scaleIn}
        className="bg-white p-6 md:p-8 rounded-large border border-sand shadow-level-1 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 text-center md:text-left"
      >
        
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Avatar with pulsing ring */}
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-soft-gold/30 animate-pulse" />
            <div className="relative w-20 h-20 rounded-full bg-soft-gold/20 border-2 border-soft-gold text-charcoal font-bold text-2xl flex items-center justify-center shrink-0 shadow-sm">
              {profile?.username?.[0]?.toUpperCase() || <User className="w-10 h-10 text-charcoal/50" />}
            </div>
          </div>

          {/* User Info */}
          <div className="space-y-1">
            <h1 className="font-heading text-2xl md:text-3xl font-semibold text-charcoal">
              {profile?.username || "Volunteer Clipper"}
            </h1>
            <p className="text-xs md:text-sm text-charcoal/60">
              {profile?.email}
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-sand/40 text-charcoal/80 text-xs font-medium rounded-full mt-2 border border-sand">
              <span>Volunteer Contributor</span>
            </div>
          </div>
        </div>

        {/* Sign Out Action */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="text-xs text-charcoal/60 hover:text-error-red"
        >
          <LogOut className="w-4 h-4 mr-1.5" />
          Sign Out
        </Button>

      </motion.div>

      {/* Contribution Stats */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-4"
      >
        <motion.div variants={fadeInUp} className="p-4 bg-white rounded-large border border-sand shadow-level-1 flex items-center gap-4">
          <div className="w-12 h-12 rounded-standard bg-soft-gold/15 text-soft-gold flex items-center justify-center shrink-0">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-charcoal/60 block">Clips Created</span>
            <span className="font-heading text-2xl font-bold text-charcoal">
              <AnimatedCount value={userClips.length} />
            </span>
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="p-4 bg-white rounded-large border border-sand shadow-level-1 flex items-center gap-4">
          <div className="w-12 h-12 rounded-standard bg-emerald-green/15 text-emerald-green flex items-center justify-center shrink-0">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-charcoal/60 block">Total Downloads</span>
            <span className="font-heading text-2xl font-bold text-charcoal">
              <AnimatedCount value={totalDownloads} />
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* User's Created Clips Section */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        <motion.div variants={fadeInUp} className="flex items-center justify-between px-1">
          <h3 className="font-heading text-2xl font-semibold text-charcoal">
            Your Reminder Clips
          </h3>
          <span className="text-xs text-charcoal/50 font-medium">
            {userClips.length} total
          </span>
        </motion.div>

        {userClips.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          >
            {userClips.map((clip) => (
              <ClipCard key={clip.id} clip={clip} />
            ))}
          </motion.div>
        ) : (
          <motion.div variants={fadeInUp} className="p-12 text-center bg-white rounded-large border border-sand border-dashed space-y-3">
            <div className="w-12 h-12 bg-sand/40 text-charcoal/40 rounded-full flex items-center justify-center mx-auto float-animation">
              <Scissors className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-medium text-base text-charcoal">No clips created yet</h4>
              <p className="text-xs text-charcoal/60 mt-1 max-w-sm mx-auto">
                Transform long lectures or spiritual nasheeds into short vertical clips to spread the light.
              </p>
            </div>
            <Link href="/library" className="inline-block pt-2">
              <Button size="md" variant="emerald">
                Browse Video Library
              </Button>
            </Link>
          </motion.div>
        )}
      </motion.div>

    </motion.div>
  );
}