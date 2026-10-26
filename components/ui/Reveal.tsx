"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

/**
 * Returns a ref and whether that element has entered the viewport.
 * `once` keeps it true after the first time it is seen.
 */
export function useInView<T extends Element = HTMLDivElement>({
  threshold = 0.15,
  rootMargin = "0px 0px -60px 0px",
  once = true,
}: { threshold?: number; rootMargin?: string; once?: boolean } = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // No observer support (very old browsers) — just show it
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, inView };
}

type Direction = "up" | "left" | "right" | "none";

const hiddenTransform: Record<Direction, string> = {
  up: "translate-y-6",
  left: "-translate-x-8",
  right: "translate-x-8",
  none: "",
};

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Delay in ms — use for staggering items in a row */
  delay?: number;
  from?: Direction;
}

/** Fades and slides its children in the first time they scroll into view. */
export default function Reveal({
  children,
  as: Tag = "div",
  className = "",
  delay = 0,
  from = "up",
}: RevealProps) {
  const { ref, inView } = useInView<HTMLElement>();

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: inView ? `${delay}ms` : "0ms" }}
      className={`transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:translate-x-0 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
        inView ? "translate-x-0 translate-y-0 opacity-100" : `opacity-0 ${hiddenTransform[from]}`
      } ${className}`}
    >
      {children}
    </Tag>
  );
}
