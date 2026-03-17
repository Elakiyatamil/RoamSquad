import { create } from 'zustand';

const useStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    sidebarOpen: true,
    currentDestinationId: null,

    setUser: (user) => set({ user, isAuthenticated: !!user }),
    logout: () => set({ user: null, isAuthenticated: false }),
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setCurrentDestination: (id) => set({ currentDestinationId: id }),
}));

export default useStore;
