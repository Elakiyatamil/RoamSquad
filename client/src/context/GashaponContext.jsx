import React, { createContext, useContext, useState } from 'react';

const GashaponContext = createContext(null);

export const GashaponProvider = ({ children }) => {
    const [isGashaponOpen, setIsGashaponOpen] = useState(false);

    const openGashapon = () => setIsGashaponOpen(true);
    const closeGashapon = () => setIsGashaponOpen(false);

    return (
        <GashaponContext.Provider value={{ isGashaponOpen, openGashapon, closeGashapon }}>
            {children}
        </GashaponContext.Provider>
    );
};

export const useGashapon = () => {
    const ctx = useContext(GashaponContext);
    if (!ctx) throw new Error('useGashapon must be used inside <GashaponProvider>');
    return ctx;
};

export default GashaponContext;
