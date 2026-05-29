# Registro de Cambios - 29 de Mayo de 2026

## Tema: Granularidad por legajo en medidas compartidas (SAC compartido)

Cuando varios NNyA comparten una misma medida judicial (mismo número SAC), el backend guarda **una sola medida** vinculada a varios legajos (primario + adicionales vía `TMedidaLegajo`). El frontend no estaba dirigiendo correctamente la lectura/escritura al legajo desde el que se está viendo la medida, por lo que distintas vistas mostraban/escribían datos del legajo **primario** en lugar del que el operador tenía abierto.

Esta entrega cablea la "óptica de legajo" (`?legajo_id=` en lectura, campo `legajo` en escritura) en todas las vistas afectadas. Referencia de contratos: `SENAF-RUNNA-db-backend/claudedocs/MEDIDA_COMPARTIDA_VISTA_LEGAJO_FRONTEND.md` y `GRANULARIDAD_LEGAJOS_MEDIDA_COMPARTIDA.md`.

> Nota: todo lo siguiente fue verificado por lectura de código + `tsc` (sin errores nuevos; baseline del proyecto: 320 errores preexistentes, ignorados por build). **No se corrió en runtime.** Requiere los commits de backend deployados (ver sección final).

---

## 1. Tabla de medidas del legajo — incluir compartidas (`medidas-activas-section.tsx`)
- **Problema**: la tabla "Registro de medidas tomadas" se alimentaba de `getMedidasByLegajo()` → `GET /api/legajos/{id}/medidas/`, endpoint que solo devuelve medidas donde el legajo es **primario**. Las compartidas donde el legajo es **vinculado** no aparecían.
- **Solución**: se alimenta de `legajoData.historial_medidas` (el detalle `GET /api/legajos/{id}/` ya las incluye, Mejora 1 del backend). Se agregó chip **"Compartida" / "Compartida · vinculado"** distinguiendo si el legajo es primario o vinculado.
- Se extendió `MedidaBasicResponse` con `legajo_id?`, `legajos_adicionales?`, `estado_vigencia_display?`.

## 2. Filtro visual de etapas por legajo (`useMedidaDetail` + `getMedidaDetail`)
- `getMedidaDetail(id, legajoId?)` y `useMedidaDetail(medidaId, { legajoId })` ahora envían `?legajo_id=`; `medida-detail.tsx` pasa el legajo de la ruta.
- Efecto: `historial_etapas` se filtra a grupales + las del legajo abierto (oculta las específicas de otros hermanos). El `legajoId` se incluye en el `queryKey` (las invalidaciones por `medidaKeys.detail(id)` siguen funcionando por prefijo).

## 3. Historial de etapa + documentos por legajo (`etapa-detail-api-service.ts` + `unified-workflow-tab.tsx`)
- `getEtapaDetail(medidaId, tipoEtapa, etapaId?, legajoId?)` ahora arma el query con `URLSearchParams` y agrega `?legajo_id=`.
- `unified-workflow-tab` lee el legajo de la ruta (`useParams`) y lo pasa. Filtra la etapa por defecto y la lista `etapas_mismo_tipo` (el "Historial de Innovación · N etapas registradas · específica (x/y NNyAs)") a la óptica del legajo.

## 4. Tabla de actividades del plan de trabajo (`UnifiedActividadesTable.tsx`)
- La variante "medida" no enviaba `legajo_id`. Ahora lee el legajo de la ruta (`useParams`) y lo agrega al fetch (`?legajo_id=`), devolviendo actividades grupales + las del legajo. `ActividadFilters` ya tenía el campo.

## 5. Seguimiento en Dispositivo — direccionamiento por legajo (núcleo de esta entrega)

Cada registro de seguimiento (situación, taller, traslado, nota, info educativa/salud) tiene su propio FK `legajo`: **son individuales por NNyA**, no se comparten. El backend defaultea al **primario** si no se le indica el legajo. Bugs corregidos:

- **5.a — Escritura mandaba el campo equivocado** (`seguimiento-dispositivo-api-service.ts`): el helper `withLegajo` agregaba `legajo_id` al body, pero el backend (`resolve_legajo_for_create` → serializer) lee el campo **`legajo`**. DRF ignoraba `legajo_id` → el registro caía al primario. Corregido a `legajo`. Afectaba situación / taller / cambio-lugar / nota en **MPE y MPJ**.
- **5.b — info-educativa / info-salud (PATCH)**: el front mandaba el legajo en el body, pero esos endpoints lo leen de la **query** (`resolve_legajo_id(request)`). Las 4 funciones (create/update de educativa y salud) ahora mandan `?legajo_id=` en la URL y no en el body.
- **5.c — Secciones compartidas no aceptaban `legajoId`** (`TalleresSection`, `InformacionEducativaSection`, `InformacionSaludSection`): no tenían el prop → caían al primario incluso en el tab MPJ. Se les agregó `legajoId` y lo reenvían al service (lectura + escritura), con refetch al cambiar de legajo.
- **5.d — Óptica de legajo desde la RUTA, sin selector** (`mpj-tabs/seguimiento-dispositivo-tab.tsx` y `mpe-tabs/residencias-tab.tsx`): como la medida siempre se ve bajo `/legajo/[id]/medida/[medidaId]`, el legajo de la ruta (`useParams().id`) ES el NNyA cuyo seguimiento se ve/edita. Ambos tabs derivan `effectiveLegajoId` de la ruta y lo pasan a todas las secciones (situación/cambio-lugar/notas + las 3 compartidas). Para ver a otro hermano se navega a su legajo, igual que etapas y actividades.
  - **Se eliminó el selector de NNyA** (`NnyaSelectorMedida`) que existía en el tab MPJ: defaulteaba al legajo **primario** (no al de la ruta), así que entrando desde `/legajo/49/...` mostraba el seguimiento del primario hasta cambiarlo a mano. El enfoque route-based corrige ese default y unifica el comportamiento con el resto de las vistas.
- **5.e — Limpieza de plumbing**: se quitó la propagación de `legajoPrimario`/`legajosAdicionales` (ya innecesaria) hacia los tabs de seguimiento en `mpj-header.tsx`, `mpe-header.tsx` y `medida-detail.tsx`. El componente `NnyaSelectorMedida` queda sin uso (puede borrarse si no se reutiliza en otro lado).

---

## Archivos modificados
```
src/app/(runna)/legajo-mesa/api/medidas-api-service.ts
src/app/(runna)/legajo-mesa/types/medida-api.ts
src/app/(runna)/legajo/[id]/medida/medida-detail.tsx
src/app/(runna)/legajo/[id]/medida/[medidaId]/hooks/useMedidaDetail.ts
src/app/(runna)/legajo/[id]/medida/[medidaId]/api/etapa-detail-api-service.ts
src/app/(runna)/legajo/[id]/medida/[medidaId]/api/seguimiento-dispositivo-api-service.ts
src/app/(runna)/legajo/[id]/medida/[medidaId]/components/legajo/medidas-activas-section.tsx
src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/unified-workflow-tab.tsx
src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/mpe-header.tsx
src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/mpe-tabs/residencias-tab.tsx
src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/mpj-tabs/seguimiento-dispositivo-tab.tsx
src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/shared/TalleresSection.tsx
src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/shared/InformacionEducativaSection.tsx
src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/shared/InformacionSaludSection.tsx
src/app/(runna)/legajo/actividades/components/UnifiedActividadesTable.tsx
```

## Dependencias de backend (deben estar deployadas)
Repo `SENAF-RUNNA-db-backend`, commits:
- `f631698` — legajo detalle incluye medidas donde el legajo es adicional (`LegajoDetalleSerializer`). → habilita punto 1.
- `8616f3f` — filtro `?legajo_id=` en `historial_etapas` (`TMedidaSerializer`) + herencia de scope en informes. → habilita punto 2.
- `c29af1f` — filtro `?legajo_id=` en `GET /api/medidas/{id}/etapa/{tipo}/` (`TMedidaView`). → habilita punto 3.
- `6223caf` — validación de pertenencia de `legajos_alcance` en actividades.
- Módulo de seguimiento (`TSeguimientoView`: `resolve_legajo_id` lee `?legajo_id=` de query; `resolve_legajo_for_create` lee `legajo` del body; serializers con `legajo` escribible). → habilita punto 5.

## Verificación pendiente (runtime)
Con una medida MPE/MPJ compartida entre hermanos, abrir el seguimiento desde `/legajo/{A}/medida/{M}` y desde `/legajo/{B}/medida/{M}`, y confirmar que situación/notas/talleres/cambio-lugar/educativa/salud **muestran y guardan distinto por NNyA según el legajo de la URL**. En Network: GET con `?legajo_id={de la ruta}`; POST con `legajo` en el body; GET/PATCH de educativa-salud con `?legajo_id=`.
