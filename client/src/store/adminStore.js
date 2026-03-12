import { create } from 'zustand';

export const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    setAuth: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
    },
    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
    },
}));

export const useSidebarStore = create((set) => ({
    isOpen: true,
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    setOpen: (isOpen) => set({ isOpen }),
}));

export const useTreeStore = create((set) => ({
    tree: [],
    selectedNode: null,
    expandedIds: new Set(),
    setTree: (tree) => set({ tree }),
    setSelectedNode: (node) => set({ selectedNode: node }),
    toggleExpand: (id) => set((state) => {
        const newExpanded = new Set(state.expandedIds);
        if (newExpanded.has(id)) newExpanded.delete(id);
        else newExpanded.add(id);
        return { expandedIds: newExpanded };
    }),
}));

export const useThemeStore = create((set) => ({
    theme: 'light',
    toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}));
