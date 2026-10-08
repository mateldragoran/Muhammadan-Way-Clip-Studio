"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types";
import { Trophy, Download, User, Crown, Medal, Film } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { pageTransition, fadeInUp, fadeInUpSmall, staggerContainer } from "@/lib/animations";

// Animated counter component
function AnimatedCount({ value, delay = 0 }: { value: number; delay?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const controls = animate(count, value, {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1],
      });
      const unsubscribe = rounded.on("change", (v) => setDisplayValue(v));
      return () => {
        controls.stop();
        unsubscribe();
      };
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [value, count, rounded, delay]);

  return <>{displayValue}</>;
}

export default function LeaderboardPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [clipCounts, setClipCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("total_downloads", { ascending: false })
          .limit(50);

        if (error) throw error;
        setProfiles(data || []);

        // Calculate clip counts across the platform
        const { data: clips } = await supabase
          .from("clips")
          .select("user_id");
          
        if (clips) {
          const counts: Record<string, number> = {};
          clips.forEach((c: any) => {
            if (c.user_id) {
              counts[c.user_id] = (counts[c.user_id] || 0) + 1;
            }
          });
          setClipCounts(counts);
        }
      } catch (err: any) {
        console.error("Error fetching leaderboard:", err);
        setError("Could not load community rankings.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeaderboard();
  }, [supabase]);

  // Separate top 3 for podium treatment
  const top3 = profiles.slice(0, 3);
  const rest = profiles.slice(3);

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      className="max-w-3xl mx-auto space-y-6 md:space-y-8"
    >
      
      {/* Page Header */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="text-center md:text-left">
        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 bg-soft-gold/15 text-charcoal text-xs font-semibold rounded-full border border-soft-gold/30 mb-2">
          <Trophy className="w-3.5 h-3.5 text-soft-gold" />
          Community Contributors
        </motion.div>
        <motion.h1 variants={fadeInUp} className="font-heading text-3xl md:text-4xl font-semibold text-charcoal">
          Top Reminders Shared
        </motion.h1>
        <motion.p variants={fadeInUp} className="text-charcoal/70 text-sm md:text-base mt-1">
          Celebrating volunteers who help transform lectures into shareable reminders.
        </motion.p>
      </motion.div>

      {/* Error Feedback */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-error-red/10 text-error-red text-sm rounded-standard border border-error-red/20"
        >
          {error}
        </motion.div>
      )}

      {/* Top 3 Podium (only when data is loaded) */}
      {!isLoading && top3.length > 0 && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-3 gap-3"
        >
          {top3.map((user, index) => {
            const rank = index + 1;
            const podiumStyles = {
              1: { bg: "bg-gradient-to-b from-soft-gold/20 to-white", border: "border-soft-gold/40", avatarBg: "bg-soft-gold", icon: <Crown className="w-4 h-4 text-charcoal" /> },
              2: { bg: "bg-gradient-to-b from-sand/50 to-white", border: "border-sand/60", avatarBg: "bg-sand", icon: <Medal className="w-4 h-4 text-charcoal/70" /> },
              3: { bg: "bg-gradient-to-b from-sand/30 to-white", border: "border-sand/40", avatarBg: "bg-sand/60", icon: <Medal className="w-4 h-4 text-charcoal/50" /> },
            }[rank]!;

            return (
              <motion.div
                key={user.id}
                variants={fadeInUp}
                className={cn(
                  "flex flex-col items-center text-center p-4 sm:p-5 rounded-large border shadow-level-1",
                  podiumStyles.bg, podiumStyles.border,
                  rank === 1 && "ring-1 ring-soft-gold/30"
                )}
              >
                {/* Rank indicator */}
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center mb-3 shadow-sm",
                  podiumStyles.avatarBg
                )}>
                  {podiumStyles.icon}
                </div>

                {/* Avatar */}
                <div className={cn(
                  "w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-charcoal font-bold text-lg border-2 mb-2",
                  rank === 1 ? "border-soft-gold bg-soft-gold/15" : "border-sand bg-sand/30"
                )}>
                  {user.username?.[0]?.toUpperCase() || <User className="w-6 h-6 text-charcoal/50" />}
                </div>

                <h4 className="font-medium text-sm text-charcoal truncate w-full">
                  {user.username || "Anonymous"}
                </h4>

                <div className="flex flex-wrap justify-center items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-sand/40 rounded-full border border-sand text-xs font-semibold text-charcoal">
                    <Download className="w-3 h-3 text-soft-gold" />
                    <AnimatedCount value={user.total_downloads || 0} delay={0.3 + index * 0.15} />
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-sand/40 rounded-full border border-sand text-xs font-semibold text-charcoal">
                    <Film className="w-3 h-3 text-emerald-green" />
                    <AnimatedCount value={clipCounts[user.id] || 0} delay={0.4 + index * 0.15} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Leaderboard Table Container */}
      <motion.div
        variants={fadeInUp}
        className="bg-white rounded-large shadow-level-1 border border-sand overflow-hidden"
      >
        {isLoading ? (
          /* Skeleton Loader */
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-7 h-7 rounded-full skeleton-shimmer" />
                <div className="w-10 h-10 rounded-full skeleton-shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 skeleton-shimmer rounded w-1/3" />
                  <div className="h-3 skeleton-shimmer rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : rest.length === 0 && top3.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center">
            <div className="float-animation">
              <Trophy className="w-8 h-8 text-charcoal/30 mx-auto mb-3" />
            </div>
            <h3 className="font-medium text-charcoal text-base">No contributors yet</h3>
            <p className="text-xs text-charcoal/60 mt-1">
              Be the first volunteer to create and share a reminder clip!
            </p>
          </div>
        ) : rest.length > 0 ? (
          /* Remaining Leaderboard List (after top 3) */
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="divide-y divide-sand/50"
          >
            {rest.map((user, index) => {
              const rank = index + 4; // starts at 4 (since top3 are separate)

              return (
                <motion.div
                  key={user.id}
                  variants={fadeInUpSmall}
                  className="flex items-center gap-3 sm:gap-4 p-4 transition-colors hover:bg-ivory/50 group"
                >
                  {/* Rank Badge */}
                  <div className="w-8 flex justify-center shrink-0">
                    <span className="text-sm font-semibold text-charcoal/50">
                      {rank}
                    </span>
                  </div>

                  {/* User Avatar */}
                  <div className="w-10 h-10 rounded-full bg-sand/50 border border-sand flex items-center justify-center text-charcoal font-bold text-sm shrink-0">
                    {user.username?.[0]?.toUpperCase() || <User className="w-5 h-5 text-charcoal/50" />}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-charcoal truncate">
                      {user.username || "Anonymous Clipper"}
                    </h4>
                    <p className="text-xs text-charcoal/50">
                      Volunteer Contributor
                    </p>
                  </div>

                  {/* Clip Count Metric */}
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-sand/30 rounded-full border border-sand text-xs font-semibold text-charcoal shrink-0 group-hover:bg-emerald-green/10 group-hover:border-emerald-green/30 transition-colors">
                    <Film className="w-3.5 h-3.5 text-emerald-green" />
                    <span>{clipCounts[user.id] || 0}</span>
                    <span className="text-[10px] text-charcoal/50 font-normal hidden sm:inline">
                      clips
                    </span>
                  </div>

                  {/* Downloads Metric */}
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-sand/30 rounded-full border border-sand text-xs font-semibold text-charcoal shrink-0 group-hover:bg-soft-gold/10 group-hover:border-soft-gold/30 transition-colors">
                    <Download className="w-3.5 h-3.5 text-soft-gold" />
                    <span>{user.total_downloads || 0}</span>
                    <span className="text-[10px] text-charcoal/50 font-normal hidden sm:inline">
                      downloads
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : null}
      </motion.div>

    </motion.div>
  );
}