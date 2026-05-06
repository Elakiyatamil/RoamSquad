import React, { useState, useEffect, useRef } from 'react';
import './LiquidFlowLoader.css';

const LiquidFlowLoader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [showCounter, setShowCounter] = useState(true);
  // Wave phase for animating the sine wave surface independently
  const [wavePhase, setWavePhase] = useState(0);
  const rafRef = useRef(null);
  const progressRef = useRef(0);

  // -- 1. Wave animation via requestAnimationFrame (smooth, not CSS) --
  useEffect(() => {
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const t = (timestamp - startTime) / 1000;
      setWavePhase(t);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // -- 2. Faster Loading Simulation (~2.5-3s) --
  useEffect(() => {
    const interval = setInterval(() => {
      progressRef.current = Math.min(progressRef.current + Math.random() * 4 + 1, 100);
      setProgress(Math.floor(progressRef.current));
      if (progressRef.current >= 100) clearInterval(interval);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  // -- 3. Refined Exit: fast zoom IN, then parallel gradual fade --
  useEffect(() => {
    if (progress >= 100) {
      // 400ms pause at solid black, then fire zoom + fade simultaneously
      const zoomTimer = setTimeout(() => {
        setShowCounter(false);
        setIsZooming(true);

        // onComplete fires after the fade animation finishes (1s)
        const completeTimer = setTimeout(() => {
          if (onComplete) onComplete();
        }, 1000);

        return () => clearTimeout(completeTimer);
      }, 400);

      return () => clearTimeout(zoomTimer);
    }
  }, [progress, onComplete]);

  // -- 4. Dynamic SVG Wave Path (curvy sine) --
  const buildWavePath = (phase, width = 500, amplitude = 14, freq = 2) => {
    const points = 256; // Quadrupled points for ultra-smooth curve
    let d = '';
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * width;
      const y = amplitude * Math.sin((i / points) * freq * 2 * Math.PI + phase);
      if (i === 0) d += `M ${x} ${y}`;
      else d += ` L ${x} ${y}`;
    }
    // Close the shape downward to fill the bottom
    d += ` L ${width} 200 L 0 200 Z`;
    return d;
  };

  const fillY = 150 - progress * 1.5; // 0% => bottom, 100% => top

  return (
    <div className={`liquid-loader-container ${isZooming ? 'execute-zoom' : ''}`}>
      {/* Background Texture */}
      <div className="liquid-loader-bg-waves" />

      <div className="liquid-logo-wrapper">
        <svg className="liquid-logo-svg" viewBox="0 0 500 150" overflow="visible">
          <defs>
            {/* Text shape used as a clipping mask for the rising ink */}
            <clipPath id="roamgClip">
              <text
                x="50%"
                y="50%"
                dy=".35em"
                textAnchor="middle"
                className="liquid-logo-text"
              >
                RoamG
              </text>
            </clipPath>
          </defs>

          {/* 1. Half-White skeleton with a razor-thin solid black stroke for visibility */}
          <text
            x="50%"
            y="50%"
            dy=".35em"
            textAnchor="middle"
            className="liquid-logo-text"
            fill="#FFFFFF"
            fillOpacity="0.6"
            stroke="#000000"
            strokeWidth="0.15"
            strokeOpacity="1"
          >
            RoamG
          </text>

          {/* 2. Rising Black Ink - clipped to text shape */}
          <g clipPath="url(#roamgClip)">
            {/* Static black fill below the wave */}
            <rect x="0" y={fillY + 12} width="500" height="200" fill="#000000" />

            {/* Dynamic curvy wave surface */}
            <g transform={`translate(0, ${fillY})`}>
              <path
                d={buildWavePath(wavePhase * 3, 500, 12, 3)}
                fill="#000000"
              />
            </g>
          </g>
        </svg>

        {/* 3. Percentage Counter */}
        {showCounter && (
          <div className={`liquid-counter ${progress > 82 ? 'over-fill' : ''}`}>
            loading... {progress}%
          </div>
        )}
      </div>
    </div>
  );
};

export default LiquidFlowLoader;
