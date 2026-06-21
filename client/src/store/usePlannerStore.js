import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const usePlannerStore = create(
  persist(
    (set, get) => ({
      step: 1,
      destination: null,
      duration: 3,
      startDate: '',
      endDate: '',
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
        endDate: '',
        travelers: { adults: 2, kids: 0 },
        vibe: null,
      }),

      isValid: () => {
        const { step, destination, duration, startDate, endDate } = get();
        if (step === 1) return !!destination;
        if (step === 2) {
          // Both dates are required
          if (!startDate || !endDate) return false;
          const start = new Date(startDate);
          const end = new Date(endDate);
          // End date must be on or after start date
          if (end < start) return false;
          // Duration must be valid and within limits
          const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
          if (diffDays > 90) return false;
          return duration > 0;
        }
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
