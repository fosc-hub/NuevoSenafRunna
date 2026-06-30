"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useUser } from "@/utils/auth/userZustand";

// Inicialización única en el cliente.
if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    // Reverse proxy vía next.config.mjs (evita bloqueo por adblockers).
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",

    // Pageviews los capturamos manualmente (App Router) en PostHogPageView.
    capture_pageview: false,
    capture_pageleave: true,

    // Error tracking: excepciones JS no manejadas + promesas rechazadas.
    capture_exceptions: true,

    // Autocapture de clicks/forms (interacciones, no contenido de inputs).
    autocapture: true,

    persistence: "localStorage+cookie",

    // ── Session Replay SIN masking ────────────────────────────────────
    // Decisión del equipo: grabar la información visible para máxima utilidad
    // del replay. ATENCIÓN: los recordings capturarán PII de NNyA (nombres,
    // DNI, legajos) tal como se ve en pantalla y se almacenará en PostHog.
    // Nota: las contraseñas SIEMPRE se enmascaran (PostHog lo fuerza).
    // Para re-enmascarar un componente puntual, agregarle la clase `ph-no-capture`.
    session_recording: {
      maskAllInputs: false,
    },
  });
}

/** Captura $pageview en cada cambio de ruta del App Router. */
function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ph = usePostHog();

  useEffect(() => {
    if (!pathname || !ph) return;
    let url = window.origin + pathname;
    const qs = searchParams?.toString();
    if (qs) url += `?${qs}`;
    ph.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams, ph]);

  return null;
}

/** Asocia los eventos al usuario logueado (datos de staff, no de NNyA). */
function PostHogIdentify() {
  const user = useUser((state) => state.user);
  const ph = usePostHog();

  useEffect(() => {
    if (!ph || !user) return;
    ph.identify(String(user.id), {
      username: user.username,
      email: user.email,
      name: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(),
      is_staff: user.is_staff,
      is_superuser: user.is_superuser,
      groups: user.groups?.map((g) => g.name) ?? [],
      tipo_legal: user.zonas?.[0]?.tipo_legal ?? null,
      legal: user.legal ?? false,
      zonas_ids: user.zonas_ids ?? [],
    });
  }, [user, ph]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      <PostHogIdentify />
      {children}
    </PHProvider>
  );
}
