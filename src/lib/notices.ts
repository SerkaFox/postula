/** Avisos de éxito que el panel muestra con ?aviso=… */
export const NOTICE_MESSAGES = {
  creada: "Candidatura creada.",
  guardada: "Cambios guardados.",
  borrada: "Candidatura borrada.",
} as const;

export type NoticeKey = keyof typeof NOTICE_MESSAGES;

/** Solo claves propias: "__proto__", "toString", etc. no son avisos. */
export function isNoticeKey(value: unknown): value is NoticeKey {
  return typeof value === "string" && Object.hasOwn(NOTICE_MESSAGES, value);
}
