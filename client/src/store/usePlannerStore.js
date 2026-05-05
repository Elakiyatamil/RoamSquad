import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const usePlannerStore = create(
  persist(
    (set, get) => ({
      step: 1,
      destination: null,
      duration: 3,
      startDate: '',
      travelers: {
        adults: 2,
        kids: 0,
      },
      vibe: null,
      
      setStep: (step) => set({ step }),
      
      updateData: (data) => set((state) => ({
        ...state,
        ...data,
      })),
      
      resetPlanner: () => set({
        step: 1,
        destination: null,
        duration: 3,
        startDate: '',
        travelers: { adults: 2, kids: 0 },
        vibe: null,
      }),

      isValid: () => {
        const { step, destination, duration, startDate } = get();
        if (step === 1) return !!destination;
        if (step === 2) return duration > 0 && !!startDate;
        if (step === 3) return !!get().vibe;
        return true;
      }
    }),
    {
      name: 'roamg-planner-store',
    }
  )
);

export default usePlannerStore;
