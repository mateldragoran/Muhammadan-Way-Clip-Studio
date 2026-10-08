import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AdminState {
  isAdminAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      isAdminAuthenticated: false,
      login: () => set({ isAdminAuthenticated: true }),
      logout: () => set({ isAdminAuthenticated: false }),
    }),
    {
      name: "admin-auth", // The key used in sessionStorage
      storage: createJSONStorage(() => sessionStorage), // Only lives as long as the tab is open
    }
  )
);