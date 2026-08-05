import { useEffect, useRef, useState } from 'react';
import { animate, useReducedMotion } from 'framer-motion';

export function useCountUp(target, { duration = 1000, decimals = 0 } = {}) {
  const prefersReducedMotion = useReducedMotion();
  const [value, setValue] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    const next = Number(target) || 0;
    if (prefersReducedMotion) {
      setValue(next);
      prevTarget.current = next;
      return;
    }
    const controls = animate(prevTarget.current, next, {
      duration: duration / 1000,
      ease: 'easeOut',
      onUpdate: (v) => setValue(v),
    });
    prevTarget.current = next;
    return () => controls.stop();
  }, [target, duration, prefersReducedMotion]);

  return decimals ? value.toFixed(decimals) : String(Math.round(value));
}
