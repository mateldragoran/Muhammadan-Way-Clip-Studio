import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core Brand Colors
        ivory: "#F7F5EF",
        charcoal: "#232323",
        "soft-gold": "#C7A75A",
        "forest-green": "#234533",
        "emerald-green": "#0D7A5F", // NEW: Premium Emerald Accent
        sand: "#ECE6D8",
        
        // Supporting Feedback Colors
        "success-green": "#4A6B58",
        "warning-amber": "#D99A4A",
        "error-red": "#8B3A3A",
        "info-blue": "#5C748C",
      },
      fontFamily: {
        heading: ["var(--font-cormorant)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        oswald: ["var(--font-oswald)", "sans-serif"],
      },
      boxShadow: {
        "level-1": "0 2px 8px -2px rgba(35, 35, 35, 0.05)",
        "level-2": "0 4px 12px -2px rgba(35, 35, 35, 0.08)",
        "level-3": "0 8px 24px -4px rgba(35, 35, 35, 0.12)",
        "level-4": "0 16px 32px -8px rgba(35, 35, 35, 0.16)",
      },
      borderRadius: {
        standard: "12px",
        large: "16px",
        modal: "20px",
      },
      spacing: {
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-left": "env(safe-area-inset-left)",
        "safe-right": "env(safe-area-inset-right)",
      }
    },
  },
  plugins: [],
};

export default config;