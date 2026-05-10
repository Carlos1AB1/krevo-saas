import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function AnimatedNumber({
  value,
  duration = 1.4,
  format,
  className,
  prefix = "",
  suffix = "",
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (n) =>
    format ? format(n) : Math.round(n).toLocaleString("es-CO"),
  );

  useEffect(() => {
    if (inView) {
      const controls = animate(mv, value, { duration, ease: [0.16, 1, 0.3, 1] });
      return controls.stop;
    }
  }, [inView, value, duration, mv]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}
