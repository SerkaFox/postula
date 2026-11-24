/** Utilidades puras de movimiento (D16: duraciones cortas, sin CLS). */

/** Retardo máximo de una aparición escalonada, para que nada tarde en verse. */
export const MAX_STAGGER_MS = 360;

/** Retardo (ms) del elemento `index` en una aparición escalonada, con tope. */
export function staggerDelay(index: number, stepMs = 70): number {
  if (!Number.isFinite(index) || index <= 0) return 0;
  return Math.min(Math.round(index) * stepMs, MAX_STAGGER_MS);
}

/** Estilo en línea con el retardo de aparición del elemento `index`. */
export function staggerStyle(index: number, stepMs?: number): { animationDelay: string } {
  return { animationDelay: `${staggerDelay(index, stepMs)}ms` };
}

/** Curva de desaceleración: rápida al principio, suave al final. */
export function easeOutCubic(t: number): number {
  const clamped = Math.min(Math.max(t, 0), 1);
  return 1 - (1 - clamped) ** 3;
}

/**
 * Valor que muestra un contador animado de `from` a `to` en el instante
 * `progress` (0–1). Siempre entero y nunca se pasa del valor final.
 */
export function tweenValue(from: number, to: number, progress: number): number {
  if (!Number.isFinite(to)) return 0;
  if (!Number.isFinite(from) || progress >= 1) return to;
  if (progress <= 0) return from;
  const value = Math.round(from + (to - from) * easeOutCubic(progress));
  return from <= to ? Math.min(value, to) : Math.max(value, to);
}
