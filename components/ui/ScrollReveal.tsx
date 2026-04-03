"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * SSR-safe scroll-triggered entrance animation.
 *
 * Server render: content is fully visible so crawlers always see it.
 * After hydration, below-fold content animates in when it enters the viewport.
 */
export function ScrollReveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    let frameId = 0;
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const scheduleMount = () => {
      frameId = window.requestAnimationFrame(() => {
        setMounted(true);
      });
    };

    const scheduleReveal = () => {
      frameId = window.requestAnimationFrame(() => {
        setIsVisible(true);
        setMounted(true);
      });
    };

    if (!element) {
      scheduleMount();
      return () => window.cancelAnimationFrame(frameId);
    }

    if (prefersReducedMotion || typeof window.IntersectionObserver === "undefined") {
      scheduleReveal();
      return () => window.cancelAnimationFrame(frameId);
    }

    const rect = element.getBoundingClientRect();

    if (rect.top < window.innerHeight * 1.1) {
      scheduleReveal();
      return () => window.cancelAnimationFrame(frameId);
    }

    scheduleMount();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.08 },
    );

    observer.observe(element);

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, []);

  const style: React.CSSProperties = !mounted
    ? {}
    : {
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "none" : "translateY(16px)",
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        willChange: isVisible ? "auto" : "opacity, transform",
      };

  return (
    <div className={className} ref={ref} style={style}>
      {children}
    </div>
  );
}
