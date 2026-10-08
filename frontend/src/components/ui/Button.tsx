import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // NEW: Added 'emerald' variant
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "emerald";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    
    // Base classes applied to every button
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all rounded-standard focus:outline-none focus:ring-2 focus:ring-soft-gold focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";
    
    // Variant-specific styles matching the Brand PRD
    const variants = {
      primary: "bg-soft-gold text-charcoal hover:bg-soft-gold/90 active:bg-soft-gold/80 shadow-level-1",
      secondary: "border border-sand bg-white text-charcoal hover:bg-sand/40 active:bg-sand/60",
      ghost: "bg-transparent text-charcoal hover:bg-black/5 active:bg-black/10",
      destructive: "bg-error-red/10 text-error-red hover:bg-error-red/20 active:bg-error-red/30",
      // NEW: Emerald variant for export/download buttons
      emerald: "bg-emerald-green text-ivory hover:bg-emerald-green/90 active:bg-emerald-green/80 shadow-level-1", 
    };

    // Size-specific styles
    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-11 px-6 text-[16px]", 
      lg: "h-14 px-8 text-lg rounded-large",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };