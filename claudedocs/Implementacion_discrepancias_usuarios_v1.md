# Implementación de Discrepancias de Clasificación de Usuarios

**Fecha**: 2026-02-01
**Versión**: 1.0
**Backend Migration**: `0075_add_jz_visado_and_tecnico_residencial`
**Branch**: `RUNNA-v2.LEGAJOS`

---

## Resumen Ejecutivo

Se implementaron tres discrepancias identificadas en el análisis de clasificación de usuarios (documento de referencia: `CLASIFICACION_USUARIOS_CONCLUSION_FINAL.md`):

| # | Discrepancia | Prioridad | Estado |
|---|-------------|-----------|--------|
| 3 | JZ no puede visar actividades PLTM | Crítica | ✅ Implementado |
| 4 | Legal sin visibilidad provincial | Importante | ✅ Implementado |
| 7 | Técnico Residencial inexistente | Menor | ✅ Implementado |

---

## 1. Discrepancia #3: Visado JZ antes de Legal

### Descripción del Cambio

**Antes**: Las actividades PLTM que requerían visado pasaban directamente de `COMPLETADA` a `PENDIENTE_VISADO` (Legal).

**Ahora**: Se agrega un paso intermedio donde el Jefe Zonal (JZ) debe visar la actividad antes de que llegue al equipo Legal.

### Nuevo Flujo de Estados

```
COMPLETADA
    ↓ (auto si requiere_visado_legales=True)
PENDIENTE_VISADO_JZ    ← NUEVO ESTADO
    ├─→ (JZ aprueba) → PENDIENTE_VISADO (Legal)
    └─→ (JZ rechaza) → EN_PROGRESO (corrección)
         ↓
PENDIENTE_VISADO (Legal)
    ├─→ VISADO_APROBADO
    └─→ VISADO_CON_OBSERVACION
```

### Cambios en API

#### Nuevo Endpoint: `POST /api/actividades/{id}/visar-jz/`

**Permisos requeridos**:
- JZ de la zona del legajo
- Director
- Admin

**Request Body**:
```json
{
  "aprobado": true,
  "observaciones": "Actividad revisada y conforme"
}
```

**Response**: Objeto `TActividadPlanTrabajo` actualizado

**Códigos de respuesta**:
- `200 OK`: Visado exitoso
- `400 Bad Request`: Estado incorrecto o campo faltante
- `403 Forbidden`: Usuario sin permisos

#### Nuevos Campos en `TActividadPlanTrabajo`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `visador_jz` | FK → CustomUser | JZ que realizó el visado |
| `fecha_visado_jz` | DateTime | Timestamp del visado JZ |
| `observaciones_visado_jz` | Text | Observaciones del JZ |

#### Nuevo Estado

| Valor | Display | Descripción |
|-------|---------|-------------|
| `PENDIENTE_VISADO_JZ` | "Pendiente de Visado JZ" | Espera revisión del JZ |

### Impacto Frontend

#### Bandeja de Actividades PLTM

1. **Filtro por estado**: Agregar opción `PENDIENTE_VISADO_JZ` al dropdown de filtros
2. **Indicador visual**: Badge/chip para actividades pendientes de visado JZ
3. **Botón de acción**: "Visar" visible solo para usuarios JZ cuando estado = `PENDIENTE_VISADO_JZ`

#### Vista de Detalle de Actividad

1. **Sección de Visado JZ**: Mostrar campos `visador_jz`, `fecha_visado_jz`, `observaciones_visado_jz` cuando estén poblados
2. **Modal/Formulario de Visado JZ**:
   - Toggle o radio buttons: Aprobar / Rechazar
   - Campo de texto: Observaciones (opcional si aprueba, recomendado si rechaza)
   - Botón: "Confirmar Visado"

#### Notificaciones

El backend ya envía notificaciones automáticas:
- **Al aprobar**: Notifica a usuarios Legal de la zona
- **Al rechazar**: Notifica al responsable principal de la actividad

---

## 2. Discrepancia #4: Visibilidad Provincial para Legal

### Descripción del Cambio

**Problema**: Los usuarios del equipo Legal tenían visibilidad limitada a sus zonas asignadas, pero según la especificación deberían ver "todas las actividades(PLTM) y todos los Legajos existentes en el Sistema".

**Solución**: Se implementó un Admin Action que permite asignar un usuario a TODAS las zonas con el flag `legal=True`.

### Cambios en Backend

#### Admin Action: "Asignar usuario(s) a TODAS las zonas como Legal"

**Ubicación**: Panel de administración Django → Usuarios → Seleccionar usuario(s) → Acciones

**Comportamiento**:
1. Crea `TCustomUserZona` para cada zona existente si no existe
2. Si ya existe el registro, actualiza `legal=True` si no lo estaba
3. Mantiene otros flags (`director`, `jefe`) intactos

### Impacto Frontend

**No requiere cambios en frontend**. Este es un proceso administrativo que se realiza desde el panel de Django Admin.

### Comunicación al PO

> **Para usuarios Legal que necesiten visibilidad provincial**: El administrador debe seleccionar el usuario en el panel de administración y ejecutar la acción "Asignar usuario(s) a TODAS las zonas como Legal". Esto otorgará acceso a legajos y actividades de todas las zonas del sistema.

---

## 3. Discrepancia #7: Rol Técnico Residencial

### Descripción del Cambio

**Antes**: El rol "Técnico Residencial" no existía en el sistema.

**Ahora**: Se implementa un nuevo rol con las siguientes características:
- **Visibilidad transversal**: Ve legajos de CUALQUIER zona (sin restricción zonal)
- **Filtrado por dispositivo**: Solo ve legajos con medidas que tienen intervenciones en los subtipos de dispositivo asignados
- **Rol inferido**: No hay un campo booleano; el rol se determina automáticamente por la existencia de asignaciones

### Nuevo Modelo: `TUsuarioSubtipoDispositivo`

```
Tabla: t_usuario_subtipo_dispositivo

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | PK | Identificador |
| usuario_id | FK → CustomUser | Usuario asignado |
| subtipo_dispositivo_id | FK → TSubtipoDispositivo | Subtipo asignado |
| fecha_asignacion | DateTime | Fecha de asignación |
| activo | Boolean | Si la asignación está activa |
```

### Nuevo Campo en `TIntervencionMedida`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `subtipo_dispositivo` | FK → TSubtipoDispositivo | Subtipo específico de la intervención |

### Lógica de Filtrado

```
Si usuario tiene registros activos en TUsuarioSubtipoDispositivo:
    → Es Técnico Residencial
    → Ve legajos donde:
        - medidas.intervenciones.subtipo_dispositivo IN [subtipos_asignados]
        - medidas.estado_vigencia = 'VIGENTE'
    → SIN restricción de zona
```

### Impacto Frontend

#### Panel de Administración (requiere implementación)

1. **Gestión de Asignaciones**: CRUD para `TUsuarioSubtipoDispositivo`
   - Listar usuarios con subtipos asignados
   - Asignar subtipo de dispositivo a usuario
   - Desactivar asignación

#### Formulario de Intervención

1. **Nuevo campo**: Selector de `subtipo_dispositivo`
   - Debe filtrarse por el `tipo_dispositivo` seleccionado
   - Campo opcional pero recomendado para medidas MPE

#### Vista de Legajos (automático)

**No requiere cambios**: El filtrado se aplica automáticamente en el backend según el usuario autenticado.

### Deprecación de TLocalCentroVida

El modelo `TLocalCentroVida` está marcado como **DEPRECATED**. No usar para nuevas implementaciones. Se mantiene solo para compatibilidad con datos existentes.

---

## Resumen de Endpoints Afectados

| Método | Endpoint | Cambio |
|--------|----------|--------|
| POST | `/api/actividades/{id}/visar-jz/` | **NUEVO** |
| GET | `/api/actividades/` | Nuevo estado `PENDIENTE_VISADO_JZ` en filtros |
| GET | `/api/legajos/` | Filtrado automático para Técnico Residencial |

---

## Checklist de Implementación Frontend

### Discrepancia #3 (JZ Visado) - **Prioridad Alta**

- [ ] Agregar estado `PENDIENTE_VISADO_JZ` al enum/constantes de estados
- [ ] Actualizar filtro de estados en bandeja de actividades
- [ ] Crear componente de modal/formulario para visado JZ
- [ ] Implementar llamada a `POST /api/actividades/{id}/visar-jz/`
- [ ] Mostrar campos de visado JZ en detalle de actividad
- [ ] Agregar badge visual para estado `PENDIENTE_VISADO_JZ`
- [ ] Controlar visibilidad del botón "Visar JZ" según permisos

### Discrepancia #4 (Legal Provincial) - **Sin cambios frontend**

- [x] No requiere cambios (proceso administrativo)

### Discrepancia #7 (Técnico Residencial) - **Prioridad Media**

- [ ] Agregar selector `subtipo_dispositivo` en formulario de intervención
- [ ] Implementar dependencia tipo_dispositivo → subtipo_dispositivo
- [ ] (Opcional) Crear interfaz de gestión de asignaciones usuario-subtipo
- [ ] Verificar que listado de legajos funciona correctamente para técnicos residenciales

---

## Notas para el Product Owner

### Flujo de Visado Actualizado

El proceso de visado de actividades PLTM ahora tiene **dos niveles**:

1. **Visado JZ (nuevo)**: El Jefe Zonal de la zona del legajo revisa y aprueba/rechaza
2. **Visado Legal (existente)**: El equipo Legal realiza la revisión final

Esto permite mayor control y trazabilidad antes de que las actividades lleguen al área Legal.

### Técnico Residencial

Se ha implementado un nuevo tipo de usuario para personal que trabaja en dispositivos residenciales (hogares, instituciones, etc.):

- **Asignación**: Se asignan subtipos de dispositivo específicos a cada técnico
- **Visibilidad**: Solo ven legajos relacionados con sus dispositivos asignados
- **Alcance**: Visibilidad transversal (no limitada por zona geográfica)

### Usuarios Legal con Visibilidad Provincial

Para otorgar a un usuario Legal acceso a TODOS los legajos del sistema (visibilidad provincial), el administrador debe ejecutar la acción correspondiente desde el panel de administración.

---

## Contacto

Para consultas técnicas sobre esta implementación, referirse a:
- Plan de implementación: `C:\Users\facun\.claude\plans\idempotent-sauteeing-pillow.md`
- Análisis original: `claudedocs/CLASIFICACION_USUARIOS_CONCLUSION_FINAL.md`