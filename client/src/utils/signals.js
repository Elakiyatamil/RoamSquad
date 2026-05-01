import { useState, useCallback, useEffect } from 'react';

/**
 * Antigravity Signals (createSignal)
 * A lightweight wrapper around React's useState to mimic SolidJS-style signals.
 * 
 * @param {any} initialValue - The initial state value.
 * @returns {[Function, Function]} - [getter, setter]
 */
export function createSignal(initialValue) {
  const [state, setState] = useState(initialValue);

  const getter = useCallback(() => state, [state]);

  const setter = useCallback((newValue) => {
    if (typeof newValue === 'function') {
      setState((prev) => newValue(prev));
    } else {
      setState(newValue);
    }
  }, []);

  return [getter, setter];
}

/**
 * GLOBAL SIGNAL STORE
 * Simple singleton to share state between components.
 */
const globalState = {
  companionChoice: localStorage.getItem('roam_companion_choice') || null,
};

const listeners = new Set();

const notify = () => listeners.forEach(fn => fn());

export const globalSignals = {
  getCompanionChoice: () => globalState.companionChoice,
  setCompanionChoice: (val) => {
    globalState.companionChoice = val;
    localStorage.setItem('roam_companion_choice', val);
    notify();
  },
  subscribe: (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }
};

/**
 * Hook to use global signals with reactivity
 */
export function useGlobalSignal(selector) {
  const [val, setVal] = useState(selector());
  
  useEffect(() => {
    return globalSignals.subscribe(() => {
      setVal(selector());
    });
  }, [selector]);

  return val;
}
