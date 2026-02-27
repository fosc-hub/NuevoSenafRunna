# Registro de Cambios - 27 de Febrero de 2026

## 1. MPE y Formularios de Etapas de Medidas
- **Navegación**: Se extrajo la vieja directiva del `<Navbar />` desde el componente interno de `page.tsx` hacia el layout global del dominio (`src/app/(runna)/layout.tsx`), quitando código redundante.
- **Fix en Pre-carga de Fechas**: Se solucionó un bug en el formulario de la etapa de **Cese** (`CeseForm.tsx`). La base de datos guarda la fecha en formato ISO ISO-8601 (`YYYY-MM-DDTHH:mm:ss`), pero el input `<input type="date" />` exige estrictamente el formato `YYYY-MM-DD`. Se creó una lógica de conversión y parseo en `useCeseState.ts` y en el formulario para asegurar que si viene la fecha de la base de datos se muestre correctamente al usuario en lugar de salir vacía, y re-convierta la misma para su envío final.

## 2. Sistema de Alertas y Notificaciones ("Single Source of Truth")
- **Problema de origen**: El componente `Navbar.tsx` (Campanita superior) y `legajos-table.tsx` calculaban las notificaciones que merecerían la atención del operador de forma inconsistente y por su cuenta. 
- **Solución Centralizada**: Se creó un archivo de utilidad `src/utils/notification-utils.ts` estandarizando tres funciones puras cruciales: `shouldHighlightLegajoUtil`, `shouldNotifyActivity` y `shouldNotifyMedida`.
- A partir de esto, se actualizó la lógica en ambos componentes (`Navbar.tsx` y `legajos-table.tsx`) para usar las funciones centralizadas de modo que si un Director visualiza un "Pendiente Nota Aval" en la campanita, también visualizará la fila remarcada en color primario con seguridad.

## 3. Rol Múltiple y Extracción de Etapas
- La lógica anterior del proyecto asumía erróneamente que una "Medida" tenía únicamente "1" Etapa en progreso visible `m.etapa_actual`.
- **Detecciones Robustas de Múltiples Tareas Simúltaneas**: Esto impedía, por ejemplo, que Legales detectara su "Informe Jurídico" al mismo tiempo que Directivo esperaba su "Nota de Aval" (etapas diferentes en paralelo). El algoritmo analítico `allStates` de la tabla de legajos se potenció iterando recursivamente a través de _todo_: `m.etapas`, `m.etapas_activas`, `m.pasos` e `m.historial_etapas` y aplicando saneamiento alfabético (`normalizeState`) antes de consultar sus roles, dando soporte real al procesamiento y notificación asíncrona por distintos departamentos.

## 4. Corrección de Bug IDE (TypeScript Type Check) en UI
- **Refactorización Limpia**: En la misma tabla `legajos-table.tsx` el IDE notificaba persistentes errores de sintaxis a pesar de su correcto rendimiento (`3 Error` → `1 Error`). Se corrigieron llamados erróneos originados por un mal tipo declarado de TypeScript al solicitar `user_id` en el *hook* de permisos, así como un error en los _props_ requeridos no utilizados en el subcomponente `LegajoButtons` (`onFilterChange` y `handleNuevoRegistro`). Al pasarlos a opcionales (`?`), se desvaneció el indicador de alerta roja en la Interfaz de Desarrollo.

## 5. Consultas Adicionales y Auditoría Visual Lógica
- Se diagnosticó `UnifiedActividadesTable.tsx` sin editar nada en crudo para entregar una reseña rápida y certera al usuario aclarando por qué la bandeja de actividades pintaba de un distinto color a _determinadas actividades_. (Azules a las prioritarias por rol, Celestes a las no leídas/recientes, Rojo claro para las vencidas y Naranjas para borradores).
