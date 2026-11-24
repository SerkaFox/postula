"use client";

import { useEffect, useRef, useState } from "react";
import { tweenValue } from "@/lib/motion";

type Props = {
  /** Valor final (entero). */
  value: number;
  /** Texto que va detrás del número, p. ej. " %". */
  suffix?: string;
  durationMs?: number;
};

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Número que sube hasta `value` al montarse (y se desliza si cambia). El HTML
 * del servidor ya trae el valor final y, con `prefers-reduced-motion: reduce`,
 * se muestra directamente sin animar.
 */
export function CountUp({ value, suffix = "", durationMs = 600 }: Props) {
  // null = mostrar el valor final tal cual.
  const [animated, setAnimated] = useState<number | null>(null);
  const from = useRef(0);

  useEffect(() => {
    const start = from.current;
    from.current = value;
    if (start === value || prefersReducedMotion()) return;

    let frame = 0;
    const begin = performance.now();
    const tick = (now: number) => {
      const progress = (now - begin) / durationMs;
      setAnimated(progress >= 1 ? null : tweenValue(start, value, progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, durationMs]);

  return (
    <>
      {/* Los lectores de pantalla leen siempre el valor final. */}
      <span aria-hidden="true">
        {animated ?? value}
        {suffix}
      </span>
      <span className="sr-only">
        {value}
        {suffix}
      </span>
    </>
  );
}
