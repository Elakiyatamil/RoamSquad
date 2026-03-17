import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

const CustomCursor = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const cursorX = useSpring(0, { stiffness: 500, damping: 50, mass: 0.5 });
    const cursorY = useSpring(0, { stiffness: 500, damping: 50, mass: 0.5 });

    const ringX = useSpring(0, { stiffness: 100, damping: 30, mass: 1 });
    const ringY = useSpring(0, { stiffness: 100, damping: 30, mass: 1 });

    useEffect(() => {
        const mouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
            cursorX.set(e.clientX - 5);
            cursorY.set(e.clientY - 5);
            ringX.set(e.clientX - 16);
            ringY.set(e.clientY - 16);
        };

        window.addEventListener("mousemove", mouseMove);
        return () => {
            window.removeEventListener("mousemove", mouseMove);
        };
    }, [cursorX, cursorY, ringX, ringY]);

    return (
        <>
            <motion.div
                className="custom-cursor-dot"
                style={{
                    x: cursorX,
                    y: cursorY,
                }}
            />
            <motion.div
                className="custom-cursor-ring"
                style={{
                    x: ringX,
                    y: ringY,
                }}
            />
        </>
    );
};

export default CustomCursor;
