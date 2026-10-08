import { Variants, Transition, TargetAndTransition } from "framer-motion";

// =============================================
// TIMING CURVES (Matching CSS custom properties)
// =============================================
export const spring = {
  gentle: { type: "spring", stiffness: 120, damping: 14 } as Transition,
  bouncy: { type: "spring", stiffness: 300, damping: 20 } as Transition,
  snappy: { type: "spring", stiffness: 400, damping: 25 } as Transition,
  slow:   { type: "spring", stiffness: 80, damping: 20 } as Transition,
};

export const ease = {
  smooth: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } as Transition,
  snappy: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } as Transition,
  slow:   { duration: 0.6, ease: [0.16, 1, 0.3, 1] } as Transition,
};

// =============================================
// PAGE & SECTION TRANSITIONS
// =============================================

/** Full page fade-in entrance */
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.3, ease: [0.4, 0, 1, 1] },
  },
};

/** Tab transition crossfade with slight slide */
export const tabTransition: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  },
};

// =============================================
// STAGGER CONTAINERS
// =============================================

/** Parent container that staggers children */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

/** Slower stagger for larger grids */
export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

// =============================================
// CHILD ITEM ANIMATIONS
// =============================================

/** Fade in + slide up (most common child animation) */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
};

/** Alias for child stagger items */
export const staggerItem: Variants = fadeInUp;

/** Smaller fade-in-up for list items */
export const fadeInUpSmall: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
};

/** Scale in from center (for modals, cards) */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
};

/** Slide in from right (for forward step transitions) */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    x: -30,
    transition: { duration: 0.25, ease: [0.4, 0, 1, 1] },
  },
};

/** Slide in from left (for backward step transitions) */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    x: 30,
    transition: { duration: 0.25, ease: [0.4, 0, 1, 1] },
  },
};

// =============================================
// MODAL ANIMATIONS
// =============================================

/** Modal backdrop */
export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15, delay: 0.1 } },
};

/** Modal panel — slides up on mobile, scales in on desktop */
export const modalPanel: Variants = {
  hidden: { opacity: 0, y: 60, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 25 },
  },
  exit: {
    opacity: 0,
    y: 40,
    scale: 0.97,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  },
};

// =============================================
// INTERACTIVE HOVER & TAP
// =============================================

/** Subtle card lift on hover */
export const hoverLift: TargetAndTransition = {
  y: -4,
  transition: { type: "spring", stiffness: 300, damping: 20 },
};

/** Card shadow increase on hover */
export const hoverGlow: TargetAndTransition = {
  boxShadow: "0 8px 30px -6px rgba(35, 35, 35, 0.12)",
  transition: { duration: 0.25 },
};

/** Tap press effect */
export const tapScale: TargetAndTransition = { scale: 0.97 };

/** Gentle tap for buttons */
export const tapScaleSmall: TargetAndTransition = { scale: 0.98 };

// =============================================
// SPECIAL EFFECTS
// =============================================

/** Number counting animation config */
export const countingConfig = {
  duration: 1.2,
  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
};

/** Pulse animation for attention-drawing elements */
export const pulseVariants: Variants = {
  initial: { scale: 1 },
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

/** Success checkmark path animation */
export const checkmarkPath = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] },
  },
};

/** Shimmer effect for skeleton loaders (use as a child div) */
export const shimmer: Variants = {
  initial: { x: "-100%" },
  animate: {
    x: "100%",
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: "linear",
    },
  },
};
