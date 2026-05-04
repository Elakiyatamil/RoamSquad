import React, { createContext, useContext, useState, useCallback } from 'react';
import VelvetLoader from '../components/Loader/VelvetLoader';

const LoaderContext = createContext({
  setIsLoading: (val) => {},
});

export const useLoader = () => useContext(LoaderContext);

export const LoaderProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <LoaderContext.Provider value={{ setIsLoading }}>
      <VelvetLoader isLoading={isLoading}>
        {children}
      </VelvetLoader>
    </LoaderContext.Provider>
  );
};
