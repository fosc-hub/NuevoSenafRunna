# Clasificación de Usuarios y Permisos — Conclusión Final

**Fecha:** 2026-01-31
**Alcance:** Comparación entre especificación conceptual (`clasificaciones-y-scope-de-users.pdf`) e implementación real del backend RUNNA
**Coincidencia global:** ~58%

---

## 1. Modelo de Roles — Implementación Real

El sistema **no** usa un campo explícito `tipo_usuario`. Los roles se infieren a partir de flags booleanos en `TCustomUserZona` y del campo `is_superuser` en `CustomUser`.

| Rol | Como se identifica en código | Fuente |
|-----|------------------------------|--------|
| Admin | `CustomUser.is_superuser = True` | [CustomUser.py:8-17](runna/customAuth/models/CustomUser.py#L8-L17) |
| Director (DIR) | `TCustomUserZona.director = True` | [CustomUser.py:21](runna/customAuth/models/CustomUser.py#L21) |
| Jefe Zonal (JZ) | `TCustomUserZona.jefe = True` | [CustomUser.py:22](runna/customAuth/models/CustomUser.py#L22) |
| Legal | `TCustomUserZona.legal = True` | [CustomUser.py:23-26](runna/customAuth/models/CustomUser.py#L23-L26) |
| Técnico | Tiene registro en `TCustomUserZona` sin flags especiales | [CustomUser.py:20-44](runna/customAuth/models/CustomUser.py#L20-L44) |
| Técnico Residencial | **No existe en el modelo** | — |

Restricciones de cardinalidad por zona (enforced en `save()`):
- 1 JZ máximo por zona — [CustomUser.py:38-39](runna/customAuth/models/CustomUser.py#L38-L39)
- 1 Director máximo por zona — [CustomUser.py:40-41](runna/customAuth/models/CustomUser.py#L40-L41)

---

## 2. Matriz de Permisos — Implementación Real vs Especificación

Leyenda de celdas:
- `✅ IMPL` — Implementado y coincide con la especificación
- `✅ IMPL*` — Implementado con diferencias menores aceptables
- `⚠️ PARCIAL` — Implementado pero con gap significativo respecto a la especificación
- `❌ AUSENTE` — No implementado (la especificación lo requiere)
- `🔒 SEGURIDAD` — Gap de seguridad: operación permitida sin validación de rol
- `—` — No aplica según la especificación

### 2.1 Módulo: Mesa de Entradas (coincidencia: 67%)

| Operación | Admin | DIR | JZ | Legal | Técnico | Téc. Resid. | Fuente |
|-----------|-------|-----|----|-------|---------|-------------|--------|
| Ver demandas de sus zonas | ⚠️ PARCIAL (sin bypass) | ✅ IMPL | ✅ IMPL | ⚠️ PARCIAL (por zona) | ✅ IMPL | ❌ AUSENTE | [ComposedView.py:113-156](runna/api/views/ComposedView.py#L113-L156) |
| Ver demandas propias (registradas por el usuario) | ✅ IMPL | ✅ IMPL | ✅ IMPL | ✅ IMPL | ✅ IMPL | ❌ AUSENTE | [ComposedView.py:148](runna/api/views/ComposedView.py#L148) |
| Ver demandas inactivas en sus zonas | — | ✅ IMPL | ✅ IMPL | ✅ IMPL* | ❌ AUSENTE (solo activas) | — | [ComposedView.py:140-143](runna/api/views/ComposedView.py#L140-L143) |
| Registrar nueva demanda | ✅ IMPL | ✅ IMPL | ✅ IMPL | ✅ IMPL | ✅ IMPL | ❌ AUSENTE | [ComposedView.py:RegistroDemandaFormView](runna/api/views/ComposedView.py) |

**Gaps en este módulo:**
- Admin no tiene bypass explícito (`is_superuser` no se evalúa) — si el Admin no tiene un `TCustomUserZona`, ve cero demandas.
- Legal se filtra por zona igual que Técnico; la especificación no define visibilidad provincial para Legal en esta sección.
- Técnico Residencial no existe como rol ni como filtro.

---

### 2.2 Módulo: PLTM — Actividades (coincidencia: 67%)

| Operación | Admin | DIR | JZ | Legal | Técnico | Téc. Resid. | Fuente |
|-----------|-------|-----|----|-------|---------|-------------|--------|
| Ver actividades | ✅ IMPL | ✅ IMPL (provincial) | ✅ IMPL (zonas) | ⚠️ PARCIAL (zonas, no provincial) | ✅ IMPL (zonas + asignadas) | ❌ AUSENTE | [TActividadPlanTrabajoViewSet.py:100-151](runna/api/views/TActividadPlanTrabajoViewSet.py#L100-L151) |
| Crear actividad | ✅ IMPL | ✅ IMPL | ✅ IMPL | ✅ IMPL | ✅ IMPL | ❌ AUSENTE | [TActividadPlanTrabajoViewSet.py:perform_create](runna/api/views/TActividadPlanTrabajoViewSet.py) |
| Editar actividad | ✅ IMPL | ✅ IMPL | ✅ IMPL (zona del legajo) | ❌ AUSENTE | ✅ IMPL (si es responsable) | ❌ AUSENTE | [pltm02_validaciones.py:128-166](runna/infrastructure/business_logic/pltm02_validaciones.py#L128-L166) |
| Visar actividad (PENDIENTE_VISADO → VISADA) | — | — | ❌ AUSENTE | ✅ IMPL | — | — | [pltm02_validaciones.py:170-182](runna/infrastructure/business_logic/pltm02_validaciones.py#L170-L182) |
| Completar actividad | — | — | — | — | ✅ IMPL (si es responsable) | — | [pltm02_validaciones.py](runna/infrastructure/business_logic/pltm02_validaciones.py) |

**Gaps en este módulo:**
- **JZ no puede visar.** La especificación indica que JZ visa antes de enviar a Legal. En el código, `puede_visar_actividad()` solo permite a Legal (`legal=True`). No existe función ni paso intermedio de visado por JZ.
- **Legal no tiene visibilidad provincial.** El docstring de `get_queryset` agrupa Legal con JZ y Técnico bajo el mismo filtro por zona. La especificación indica que Legal "ve todas las actividades (PLTM)".
- El auto-transition `COMPLETADA → PENDIENTE_VISADO` va directamente a Legal sin pasar por JZ — [TActividadPlanTrabajo.py:315-316](runna/infrastructure/models/medida/TActividadPlanTrabajo.py#L315-L316).

---

### 2.3 Módulo: Evaluaciones (coincidencia: 33%)

| Operación | Admin | DIR | JZ | Legal | Técnico | Téc. Resid. | Fuente |
|-----------|-------|-----|----|-------|---------|-------------|--------|
| Ver evaluaciones | ✅ IMPL* (sin filtro zona) | ✅ IMPL* (sin filtro zona) | ✅ IMPL* (sin filtro zona) | ✅ IMPL* (sin filtro zona) | ✅ IMPL* (sin filtro zona) | ❌ AUSENTE | [EvaluacionView.py:TEvaluacionViewSet](runna/api/views/EvaluacionView.py) |
| Crear evaluación | ✅ IMPL | ✅ IMPL | ✅ IMPL | ✅ IMPL | ✅ IMPL | ❌ AUSENTE | [EvaluacionView.py](runna/api/views/EvaluacionView.py) |
| Autorizar evaluación (decisión director) | 🔒 SEGURIDAD | 🔒 SEGURIDAD | 🔒 SEGURIDAD | 🔒 SEGURIDAD | 🔒 SEGURIDAD | 🔒 SEGURIDAD | [EvaluacionView.py:528-572](runna/api/views/EvaluacionView.py#L528-L572) |

**Gaps en este módulo:**
- **Autorización sin control de rol.** Cualquier usuario autenticado puede ejecutar la acción `autorizar` y establecer `decision_director`. No hay validación de que el usuario sea DIR o JZ. La especificación requiere que solo el Director autorice.
- **Sin filtro por zona en listado.** `TEvaluacionViewSet` usa `IsAuthenticated` como única permission class. No hay `get_queryset()` custom que filtre por zona del usuario. Todos los usuarios ven todas las evaluaciones.

---

### 2.4 Módulo: Conexiones / Búsqueda Vinculación (coincidencia: 0%)

| Operación | Admin | DIR | JZ | Legal | Técnico | Téc. Resid. | Fuente |
|-----------|-------|-----|----|-------|---------|-------------|--------|
| Buscar personas/demandas/legajos | 🔒 SEGURIDAD | 🔒 SEGURIDAD | 🔒 SEGURIDAD | 🔒 SEGURIDAD | 🔒 SEGURIDAD | 🔒 SEGURIDAD | [ConexionesView.py:19-32](runna/api/views/ConexionesView.py#L19-L32) |

**Gaps en este módulo:**
- **Endpoint público sin autenticación ni autorización.** `DemandaBusquedaVinculacionView` hereda de `APIView` y no define `permission_classes`. No hay `get_queryset()` ni filtro por zona o rol.
- Retorna objetos `TLegajo` completos y IDs de NNyA sin control de acceso.
- Este es el módulo con mayor divergencia respecto a la especificación.

---

## 3. Resumen de Discrepancias por Prioridad

### 🔴 Críticas (Seguridad o funcionalidad bloqueante)

| # | Discrepancia | Especificación dice | Implementación real | Fuente |
|---|-------------|--------------------|--------------------|--------|
| 1 | Autorización de evaluaciones sin control de rol | Solo Director puede autorizar | Cualquier usuario autenticado puede autorizar | [EvaluacionView.py:528-572](runna/api/views/EvaluacionView.py#L528-L572) |
| 2 | Búsqueda de vinculación sin autenticación | Debe estar restringida por rol | Endpoint público, sin permission_classes | [ConexionesView.py:19-32](runna/api/views/ConexionesView.py#L19-L32) |
| 3 | JZ no puede visar actividades | JZ visa antes de enviar a Legal | Solo Legal puede visar (`puede_visar_actividad` verifica `legal=True` únicamente) | [pltm02_validaciones.py:170-182](runna/infrastructure/business_logic/pltm02_validaciones.py#L170-L182) |

### 🟡 Importantes (Gap funcional respecto a la especificación)

| # | Discrepancia | Especificación dice | Implementación real | Fuente |
|---|-------------|--------------------|--------------------|--------|
| 4 | Legal no tiene visibilidad provincial en PLTM | Legal "ve todas las actividades (PLTM) y todos los Legajos existentes en el Sistema" | Legal se filtra por zona como Técnico | [TActividadPlanTrabajoViewSet.py:132-148](runna/api/views/TActividadPlanTrabajoViewSet.py#L132-L148) |
| 5 | Admin sin bypass en Mesa de Entradas | Admin debe ver todo | No evalúa `is_superuser`; depende de tener `TCustomUserZona` | [ComposedView.py:113-156](runna/api/views/ComposedView.py#L113-L156) |
| 6 | Evaluaciones sin filtro por zona | Roles deben ver según scope zonal | Todos los usuarios ven todas las evaluaciones | [EvaluacionView.py:TEvaluacionViewSet](runna/api/views/EvaluacionView.py) |

### 🟢 Menores (Rol no implementado)

| # | Discrepancia | Especificación dice | Implementación real | Fuente |
|---|-------------|--------------------|--------------------|--------|
| 7 | Técnico Residencial no existe | Rol con scope restringido a residencias asignadas | No hay campo `tecnico_residencial` ni `residencia` en `TCustomUserZona` | [CustomUser.py:20-44](runna/customAuth/models/CustomUser.py#L20-L44) |

---

## 4. Métricas por Módulo

| Módulo | Coincidencia | Patrón de filtrado | Observación |
|--------|-------------|-------------------|-------------|
| Mesa de Entradas | 67% | `get_queryset()` con zona + OR logic | Falta Admin bypass y Téc. Residencial |
| PLTM — Actividades | 67% | `get_queryset()` con zona + OR logic | Falta visado JZ y visibilidad Legal provincial |
| Evaluaciones | 33% | `IsAuthenticated` sin filtro zona | Falta control de rol en autorización y filtro zonal |
| Conexiones | 0% | Sin protección | Endpoint público |

---

## 5. Métricas por Rol

| Rol | Implementado | Scope correcto | Fidelidad estimada |
|-----|-------------|---------------|-------------------|
| Admin | Sí (`is_superuser`) | Parcial (falta bypass en MdE) | 75% |
| Director | Sí (`director=True`) | Sí (provincial en PLTM) | 85% |
| JZ | Sí (`jefe=True`) | Sí (zonal) pero falta visado | 60% |
| Legal | Sí (`legal=True`) | No (filtrado por zona, no provincial) | 40% |
| Técnico | Sí (inferido) | Sí (zonal, solo activas en MdE) | 80% |
| Técnico Residencial | No | — | 0% |

---

## 6. Módulos con buena implementación (referencia)

Los siguientes módulos demuestran el patrón correcto de filtrado por zona que debería aplicarse en Evaluaciones y Conexiones:

**Patrón de referencia en `TActividadPlanTrabajoViewSet.get_queryset()`** — [TActividadPlanTrabajoViewSet.py:100-151](runna/api/views/TActividadPlanTrabajoViewSet.py#L100-L151):
1. Bypass inmediato para Admin (`is_superuser`) y Director
2. Construcción de condiciones con `Q()` y lógica OR
3. Filtro por zona del legajo asociado
4. Filtro por asignación directa (responsable principal / secundario)
5. `distinct()` para evitar duplicados por JOINs

**Patrón de referencia en `MesaDeEntradaListView.get_queryset()`** — [ComposedView.py:113-156](runna/api/views/ComposedView.py#L113-L156):
1. Separación de zonas por rol (jefe/director vs normal)
2. Tratamiento diferencial: JZ/DIR ven todo en sus zonas; Técnico solo activas
3. Inclusión de recursos propios del usuario (`registrado_por_user`)
4. Combinación con OR y `distinct()`