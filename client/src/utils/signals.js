import { useState, useCallback, useEffect } from 'react';

/**
 * Antigravity Signals (createSignal)
 * A lightweight hook for local component state that mimics SolidJS signals.
 */
export function createSignal(initialValue) {
  const [state, setState] = useState(initialValue);
  const getter = useCallback(() => state, [state]);
  const setter = useCallback((newValue) => {
    setState(newValue);
  }, []);
  return [getter, setter];
}

/**
 * GLOBAL SIGNAL STORE
 * Simple singleton to share state between components using a subscription model.
 */
let globalCompanionChoice = localStorage.getItem('roam_companion_choice') || null;
let globalCurrentPlannerStep = 1;
let globalDestinationChoice = null;

const listeners = new Set();
const notify = () => listeners.forEach(fn => fn());

export const globalSignals = {
  getCompanionChoice: () => globalCompanionChoice,
  setCompanionChoice: (val) => {
    globalCompanionChoice = val;
    localStorage.setItem('roam_companion_choice', val);
    notify();
  },

  currentPlannerStep: () => globalCurrentPlannerStep,
  setCurrentPlannerStep: (val) => {
    globalCurrentPlannerStep = val;
    notify();
  },

  destinationChoice: () => globalDestinationChoice,
  setDestinationChoice: (val) => {
    globalDestinationChoice = val;
    notify();
  },

  subscribe: (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }
};

/**
 * Hook to use global signals with reactivity.
 * Re-renders the component when the selected global state changes.
 */
export function useGlobalSignal(selector) {
  const [val, setVal] = useState(selector());
  
  useEffect(() => {
    const unsubscribe = globalSignals.subscribe(() => {
      setVal(selector());
    });
    return unsubscribe;
  }, [selector]);

  return val;
}
