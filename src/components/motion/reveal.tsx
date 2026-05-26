"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";

// Drop-in wrapper for scroll-triggered enter animations. Respects the user's
// prefers-reduced-motion setting — when "Reduce motion" is on at the OS level,
// children render in their final state without any transform/animation.
//
// This is the project's standard reveal primitive. Use it instead of writing
// ad-hoc motion.* components so the reduced-motion contract is honored
// uniformly across every page (mandated for the 50+ primary audience per
// docs/website-outline.md).
//
// Usage:
//   <Reveal>...</Reveal>             // default fade-up
//   <Reveal direction="left">...</Reveal>
//   <Reveal delay={0.1}>...</Reveal>

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  duration?: number;
  // Translation distance in pixels for directional reveals.
  distance?: number;
};

export function Reveal({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 0.6,
  distance = 24,
}: RevealProps) {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return <div className={className}>{children}</div>;
  }

  const offset = directionOffset(direction, distance);
  const variants: Variants = {
    hidden: { opacity: 0, ...offset },
    visible: { opacity: 1, x: 0, y: 0 },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration, delay, ease: "easeOut" }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}

function directionOffset(
  direction: RevealProps["direction"],
  distance: number,
): { x?: number; y?: number } {
  switch (direction) {
    case "up":
      return { y: distance };
    case "down":
      return { y: -distance };
    case "left":
      return { x: distance };
    case "right":
      return { x: -distance };
    case "none":
    default:
      return {};
  }
}
