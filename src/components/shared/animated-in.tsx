"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

type AnimatedInProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

/**
 * Fade-and-rise on scroll into view. Honours `prefers-reduced-motion` by
 * rendering the content with no animation at all.
 */
export function AnimatedIn({
  children,
  delay = 0,
  className,
}: AnimatedInProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
