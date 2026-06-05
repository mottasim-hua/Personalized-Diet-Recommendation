import { create } from 'zustand';

// App-wide state management using Zustand
export const useAppStore = create((set) => ({
  isDark: false,
  sidebarOpen: false,
  user: null,
  loading: false,

  // Toggle dark mode
  toggleDarkMode: () => set((state) => ({ isDark: !state.isDark })),

  // Toggle sidebar
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // Set user
  setUser: (user) => set({ user }),

  // Set loading
  setLoading: (loading) => set({ loading }),

  // Reset store
  reset: () => set({
    isDark: false,
    sidebarOpen: false,
    user: null,
    loading: false,
  }),
}));
