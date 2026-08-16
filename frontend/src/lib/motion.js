import { useReducedMotion } from 'framer-motion';

export function useAnimVariants() {
  const reduce = useReducedMotion();

  return {
    fadeUp: {
      hidden: { opacity: 0, y: reduce ? 0 : 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut' },
      },
    },
    fadeUpSmall: {
      hidden: { opacity: 0, y: reduce ? 0 : 8 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, ease: 'easeOut' },
      },
    },
    staggerContainer: {
      hidden: {},
      visible: {
        transition: {
          staggerChildren: reduce ? 0 : 0.12,
          delayChildren: reduce ? 0 : 0.1,
        },
      },
    },
    staggerList: {
      hidden: {},
      visible: {
        transition: {
          staggerChildren: reduce ? 0 : 0.05,
        },
      },
    },
  };
}
