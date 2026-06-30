/**
 * Capa central de analytics de negocio (PostHog).
 *
 * Reglas:
 * - NUNCA enviar PII (nombres, DNI, direcciones de NNyA). Solo IDs, tipos,
 *   decisiones, conteos y estados.
 * - `track()` jamás debe romper el flujo de negocio: si PostHog no está
 *   inicializado, falla en silencio.
 *
 * La identificación del usuario se hace en src/app/providers.tsx (no acá).
 */

import posthog from "posthog-js";

/** Nombres canónicos de los eventos de negocio. */
export const AnalyticsEvent = {
  // Autenticación
  LOGIN_EXITOSO: "login_exitoso",
  LOGIN_FALLIDO: "login_fallido",

  // Demanda / Nuevo ingreso
  NUEVO_INGRESO_REGISTRADO: "nuevo_ingreso_registrado",

  // Legajo
  LEGAJO_CREADO: "legajo_creado",
  ADMISION_AUTORIZADA: "admision_autorizada",

  // Medida / Intervención
  INTERVENCION_CREADA: "intervencion_creada",
  INTERVENCION_ENVIADA: "intervencion_enviada",
  INTERVENCION_APROBADA: "intervencion_aprobada",
  INTERVENCION_RECHAZADA: "intervencion_rechazada",
  MEDIDA_CESADA: "medida_cesada",
  NOTA_AVAL_EMITIDA: "nota_aval_emitida",

  // Actividades (plan de trabajo)
  ACTIVIDAD_ACCION: "actividad_accion",

  // Informes / Exportaciones
  INFORME_EXPORTADO: "informe_exportado",
} as const;

export type AnalyticsEventName =
  (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];

/**
 * Registra un evento de negocio en PostHog.
 * @param event Nombre canónico (usar `AnalyticsEvent.*`).
 * @param properties Metadata sin PII (IDs, tipos, conteos, estados).
 */
export function track(
  event: AnalyticsEventName,
  properties?: Record<string, unknown>,
): void {
  try {
    posthog.capture(event, properties);
  } catch {
    // No-op: analytics nunca debe interrumpir la operación del usuario.
  }
}
