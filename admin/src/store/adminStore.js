import { create } from 'zustand';

export const useSidebarStore = create((set) => ({
    isOpen: true,
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));

export const useTreeStore = create((set) => ({
    tree: [],
    setTree: (tree) => set({ tree }),
    selectedNode: null,
    setSelectedNode: (node) => set({ selectedNode: node }),
    expandedIds: new Set(),
    toggleExpand: (id) => set((state) => {
        const newSet = new Set(state.expandedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        return { expandedIds: newSet };
    }),
}));
