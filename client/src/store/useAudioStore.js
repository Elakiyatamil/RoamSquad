import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAudioStore = create(
  persist(
    (set) => ({
      isMuted: false, // Default to sound enabled
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      setMute: (val) => set({ isMuted: val }),
    }),
    {
      name: 'roamsquad-audio-pref',
    }
  )
);

export default useAudioStore;
