"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
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

function canAnimate(): boolean {
  return typeof IntersectionObserver !== "undefined" && !prefersReducedMotion();
}

const noopSubscribe = () => () => {};

/**
 * Número que sube desde 0 la primera vez que se ve, sin saltos:
 * - Al hidratar, el HTML del servidor ya trae el valor final. Si el número está
 *   a la vista se deja tal cual (el usuario ya lo ha visto); si está fuera de
 *   pantalla se pone a 0 y sube cuando entra en el viewport.
 * - Si el componente se monta en el cliente (navegación), empieza en 0 sin
 *   haberse pintado antes con el valor final y sube cuando es visible.
 * - Si el valor cambia después, se desliza del anterior al nuevo.
 * Con `prefers-reduced-motion: reduce` se muestra siempre el valor final.
 */
export function CountUp({ value, suffix = "", durationMs = 600 }: Props) {
  // false mientras se hidrata (HTML del servidor), true si se monta en el cliente.
  const clientMount = useSyncExternalStore(noopSubscribe, () => true, () => false);
  // null = mostrar el valor final tal cual.
  const [shown, setShown] = useState<number | null>(() => (clientMount && canAnimate() ? 0 : null));
  const ref = useRef<HTMLSpanElement>(null);
  /** El número está en 0 esperando a ser visible para subir. */
  const waiting = useRef(shown === 0);
  const revealed = useRef(false);
  const last = useRef(value);
  const frame = useRef(0);

  const animate = useCallback(
    (start: number, end: number) => {
      cancelAnimationFrame(frame.current);
      const begin = performance.now();
      const tick = (now: number) => {
        const progress = (now - begin) / durationMs;
        setShown(progress >= 1 ? null : tweenValue(start, end, progress));
        if (progress < 1) frame.current = requestAnimationFrame(tick);
      };
      frame.current = requestAnimationFrame(tick);
    },
    [durationMs],
  );

  // Primera aparición en pantalla.
  useEffect(() => {
    const element = ref.current;
    if (!element || !canAnimate()) {
      revealed.current = true;
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        observer.disconnect();
        revealed.current = true;
        if (waiting.current) {
          waiting.current = false;
          animate(0, last.current);
        }
      } else if (!waiting.current) {
        // Fuera de pantalla: nadie lo ve, se prepara para subir desde 0.
        waiting.current = true;
        setShown(0);
      }
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame.current);
    };
  }, [animate]);

  // Cambios de valor después de haberse mostrado.
  useEffect(() => {
    const previous = last.current;
    last.current = value;
    if (!revealed.current || previous === value) return;
    if (prefersReducedMotion()) return;
    animate(previous, value);
  }, [value, animate]);

  return (
    <>
      {/* Los lectores de pantalla leen siempre el valor final. */}
      <span ref={ref} aria-hidden="true">
        {shown ?? value}
        {suffix}
      </span>
      <span className="sr-only">
        {value}
        {suffix}
      </span>
    </>
  );
}
