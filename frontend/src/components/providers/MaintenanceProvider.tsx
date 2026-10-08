"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Wrench } from "lucide-react";

interface MaintenanceContextType {
  isMaintenance: boolean;
}

const MaintenanceContext = createContext<MaintenanceContextType>({
  isMaintenance: false,
});

const fetchWithTimeout = async (resource: string, options: RequestInit & { timeout?: number } = {}) => {
  const { timeout = 8000, ...fetchOptions } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(resource, {
      ...fetchOptions,
      signal: controller.signal  
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export function MaintenanceProvider({ children }: { children: React.ReactNode }) {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isChecking, setIsChecking] = useState(true); // Prevents flicker on initial load

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const supabase = createClient();
        
        // 1. Check Backend
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const backendRes = await fetchWithTimeout(`${apiUrl}/health`, { 
            method: "GET",
            timeout: 5000 
        });
        
        if (!backendRes.ok) {
           setIsMaintenance(true);
           setIsChecking(false);
           return;
        }

        // 2. Check Supabase
        const { error } = await supabase.from('videos').select('id').limit(1);
        
        if (error && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
           setIsMaintenance(true);
           setIsChecking(false);
           return;
        }

        // All good
        setIsMaintenance(false);
      } catch (err) {
        console.error("Health check failed:", err);
        setIsMaintenance(true);
      } finally {
        setIsChecking(false);
      }
    };

    // Initial check
    checkHealth();

    // Poll every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Show nothing while doing initial check so it doesn't flicker the app briefly
  // Actually, we can just render children immediately, and if health check fails, overlay appears.
  // This is better for UX if they have a cached layout.

  if (isMaintenance) {
    return (
      <div className="min-h-screen bg-ivory/95 flex flex-col items-center justify-center p-6 text-center z-50 fixed inset-0 backdrop-blur-md transition-all duration-700 ease-in-out overflow-hidden">
        
        {/* Decorative background blurs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-charcoal/5 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-pulse"></div>
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-charcoal/5 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-pulse" 
          style={{ animationDelay: '2s' }}
        ></div>

        <div className="relative bg-white/70 backdrop-blur-2xl border border-white/60 p-10 md:p-14 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] max-w-lg w-full flex flex-col items-center space-y-8 transform transition-all duration-700 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
          <div className="relative w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-tr from-charcoal/5 to-charcoal/10 border border-white/60 shadow-inner">
            <div className="absolute inset-0 rounded-full bg-charcoal/10 animate-ping opacity-20"></div>
            <Wrench className="w-12 h-12 text-charcoal relative z-10" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-br from-charcoal to-charcoal/70 leading-tight">
              System Maintenance
            </h1>
            <p className="text-charcoal/70 text-lg leading-relaxed max-w-sm mx-auto font-medium">
              We're polishing the gears and tuning the engine. Thank you for your patience—we'll be back online shortly!
            </p>
          </div>

          <div className="w-full max-w-[200px] h-1.5 bg-charcoal/5 rounded-full overflow-hidden relative shadow-inner">
            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-charcoal/30 to-charcoal/50 rounded-full w-full animate-pulse origin-left"></div>
          </div>
        </div>
      </div>
    );
  }

  // Render children underneath if not in maintenance
  return (
    <MaintenanceContext.Provider value={{ isMaintenance }}>
      {children}
    </MaintenanceContext.Provider>
  );
}

export const useMaintenance = () => useContext(MaintenanceContext);
