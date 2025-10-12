import React, { useState, useEffect } from "react";
import { Spin } from "antd";

interface FullscreenLoaderProps {
  active: boolean;
  onComplete?: () => void;
  speed?: number; // optional interval speed (default 100ms)
}

/**
 * A reusable fullscreen loader with smooth progress simulation.
 * 
 * Usage:
 * <FullscreenLoader active={loading} onComplete={() => console.log('done')} />
 */
export default function FullscreenLoader({
  active,
  onComplete,
  speed = 100
}: FullscreenLoaderProps) {
  const [percent, setPercent] = useState(0);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    if (active) {
      setSpinning(true);
      let ptg = 0;

      const interval = setInterval(() => {
        ptg += 10;
        setPercent(ptg);

        if (ptg >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setSpinning(false);
            setPercent(0);
            onComplete?.();
          }, 500);
        }
      }, speed);

      return () => clearInterval(interval);
    }
  }, [active, onComplete, speed]);

  return (
    <Spin
      spinning={spinning}
      percent={percent}
      fullscreen
      size="large"
    />
  );
}
