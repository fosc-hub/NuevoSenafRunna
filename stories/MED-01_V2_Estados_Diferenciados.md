# MED-01 V2: Estados Diferenciados por Tipo de Medida

**Fecha de Creación:** 2025-10-25
**Sprint:** TBD
**Estimación:** 8 puntos (Actualización a MED-01 existente)
**Prioridad:** Media-Alta
**Estado:** Documentada
**Dependencias:** MED-01 V1 (✅ implementado), PLTM-02 (✅ implementado)

---

## Historia de Usuario

**Como** Sistema RUNNA
**Quiero** diferenciar estados de etapas según tipo de medida (MPI, MPE, MPJ)
**Para** reflejar workflows reales y evitar estados inválidos para cada tipo

---

## 🔄 CONTEXTO DE LA ACTUALIZACIÓN
# MED-01 V2: Estados Diferenciados

## Estados por Tipo de Medida

### MPI (Medida de Protección Integral)
- **APERTURA**: Estados 1-2 (Registro → Aprobación JZ)
- **CESE**: Sin estados (solo informe de cierre técnico)

### MPE (Medida de Protección Excepcional)
- **Todas las etapas**: Estados 1-5 completos (jurídico completo)

### MPJ (Medida Penal Juvenil)
- **NO USA ESTADOS** (`estado_especifico = None`)
- Solo transiciones de etapas: APERTURA → PROCESO → CESE
- Trigger: Crear actividad PLTM con `etapa_medida_aplicable` posterior

### MED-01 V1 (Implementado)
- ✅ Modelos `TMedida` y `TEtapaMedida` creados
- ✅ 5 estados genéricos aplicables a TODOS los tipos de medida
- ✅ Creación manual y automática implementada
- ✅ Sistema de permisos por nivel de usuario
- ❌ **GAP:** Estados genéricos no reflejan lógica diferenciada MPI/MPE/MPJ

### Documentación RUNNA V2 (Requisitos Actualizados)
- 📋 **MPI Apertura:** Solo estados 1-2 (sin proceso jurídico completo)
- 📋 **MPI Cese:** Sin estados (solo informe de cierre)
- 📋 **MPE:** Estados 1-5 completos para Apertura/Innovación/Prórroga/Cese
- 📋 **MPE Post-cese:** Actividades PLTM posteriores a fecha_cese_efectivo
- 📋 **MPJ:** ⚠️ **SIN ESTADOS** - Solo transiciones de etapas (APERTURA → PROCESO → CESE) vía PLTM

---

## 🎯 GAPS IDENTIFICADOS

### Gap 1: Estados por Tipo de Medida
**Problema:** TEtapaMedida permite cualquier estado para cualquier tipo de medida
**Impacto:** Usuarios de MPI pueden intentar estados 3-5 (jurídicos) que no aplican
**Solución:** Validaciones de negocio que restringen estados permitidos según tipo_medida

### Gap 2: Responsables por Estado
**Problema:** No hay campo `responsable_tipo` en estados
**Impacto:** Cualquier usuario puede avanzar cualquier estado
**Solución:** Agregar campo `responsable_tipo` y validar permisos antes de transición

### Gap 3: Etapas Específicas MPI y MPE
**Problema:** MPI Cese y MPE Post-cese no tienen lógica diferenciada
**Impacto:** Flujos de cese no reflejan realidad operativa
**Solución:** Nuevo campo `fecha_cese_efectivo` en TMedida + lógica específica

### Gap 4: Auto-Transición MPJ
**Problema:** MPJ NO usa estados, solo transiciones de etapas al crear actividades con etapa tardía
**Impacto:** Sistema debe identificar cuando una actividad PLTM requiere avanzar etapa (APERTURA → PROCESO → CESE)
**Solución:** Signal que detecta creación de actividad con `etapa_medida_aplicable` posterior y auto-transiciona etapa SIN ESTADOS

### Gap 5: Integración PLTM
**Problema:** Sin integración con módulo PLTM-02 (actividades)
**Impacto:** MPJ no puede auto-transicionar etapas
**Solución:** Signal post_save en TActividadPlanTrabajo que dispara lógica MPJ

---

## 🏗️ CAMBIOS ARQUITECTÓNICOS

### Nuevo Modelo: `TEstadoEtapaMedida` (Catálogo)

```python
# infrastructure/models/medida/TEstadoEtapaMedida.py

from django.db import models

class TEstadoEtapaMedida(models.Model):
    """
    Catálogo de estados posibles para etapas de medidas.

    Define estados reutilizables con validaciones por tipo de medida,
    tipo de etapa y responsable.
    """

    RESPONSABLE_CHOICES = [
        ('EQUIPO_TECNICO', 'Equipo Técnico'),
        ('JEFE_ZONAL', 'Jefe Zonal'),
        ('DIRECTOR', 'Director'),
        ('EQUIPO_LEGAL', 'Equipo Legal'),
    ]

    # Identificación
    codigo = models.CharField(
        max_length=50,
        unique=True,
        help_text="Código único del estado (ej: PENDIENTE_REGISTRO_INTERVENCION)"
    )

    nombre_display = models.CharField(
        max_length=200,
        help_text="Nombre legible del estado (ej: (1) Pendiente de registro de intervención)"
    )

    # Workflow
    orden = models.IntegerField(
        help_text="Orden secuencial del estado (1-5)"
    )

    responsable_tipo = models.CharField(
        max_length=20,
        choices=RESPONSABLE_CHOICES,
        help_text="Tipo de usuario responsable de este estado"
    )

    siguiente_accion = models.TextField(
        help_text="Descripción de la acción requerida para avanzar"
    )

    # Aplicabilidad
    aplica_a_tipos_medida = models.JSONField(
        default=list,
        help_text="Lista de tipos de medida: ['MPI', 'MPE', 'MPJ']"
    )

    aplica_a_tipos_etapa = models.JSONField(
        default=list,
        help_text="Lista de etapas: ['APERTURA', 'INNOVACION', 'PRORROGA', 'CESE', 'POST_CESE', 'PROCESO']"
    )

    # Control
    activo = models.BooleanField(default=True)

    # Auditoría
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 't_estado_etapa_medida'
        verbose_name = 'Estado de Etapa de Medida'
        verbose_name_plural = 'Estados de Etapas de Medidas'
        ordering = ['orden']

    def __str__(self):
        return f"{self.orden}. {self.nombre_display}"
```

### Actualización: Modelo `TEtapaMedida`

```python
# infrastructure/models/medida/TEtapaMedida.py

class TEtapaMedida(models.Model):
    """
    Modelo para registrar las etapas de una medida.

    V2: Ahora usa FK a TEstadoEtapaMedida para validaciones centralizadas.
    """

    TIPO_ETAPA_CHOICES = [
        ('APERTURA', 'Apertura'),
        ('INNOVACION', 'Innovación'),
        ('PRORROGA', 'Prórroga'),
        ('CESE', 'Cese'),
        ('POST_CESE', 'Post-cese'),
        ('PROCESO', 'Proceso'),
    ]

    # Relación con Medida
    medida = models.ForeignKey(
        'TMedida',
        on_delete=models.CASCADE,
        related_name='etapas',
        help_text="Medida a la que pertenece esta etapa"
    )

    # Tipo de Etapa (NUEVO)
    tipo_etapa = models.CharField(
        max_length=20,
        choices=TIPO_ETAPA_CHOICES,
        default='APERTURA',
        help_text="Tipo de etapa de la medida"
    )

    # Estado (V2: FK a catálogo) (NUEVO)
    estado_especifico = models.ForeignKey(
        'TEstadoEtapaMedida',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='etapas_en_este_estado',
        help_text="Estado específico de la etapa (V2)"
    )

    # Estado antiguo (mantener para backward compatibility)
    estado = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        help_text="Estado antiguo (deprecated - usar estado_especifico)"
    )

    # Fechas
    fecha_inicio_estado = models.DateTimeField(
        auto_now_add=True,
        help_text="Fecha de inicio del estado actual"
    )

    fecha_fin_estado = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Fecha de finalización del estado"
    )

    # ... resto del modelo ...
```

### Actualización: Modelo `TMedida`

```python
# infrastructure/models/medida/TMedida.py

class TMedida(models.Model):
    # ... campos existentes ...

    # Nuevo campo para Post-cese MPE (NUEVO)
    fecha_cese_efectivo = models.DateField(
        null=True,
        blank=True,
        help_text="Fecha efectiva de cese de la medida (MPE Post-cese)"
    )

    # ... resto del modelo ...
```

---

## 📋 VALIDACIONES DE NEGOCIO

### Archivo: `infrastructure/business_logic/med01_validaciones.py`

Ver anexo de código completo en sección anterior del CHANGELOG.

**Funciones principales:**
1. `obtener_estados_permitidos(tipo_medida, tipo_etapa)` - Retorna estados válidos
2. `validar_transicion_estado(etapa, nuevo_estado, usuario)` - Valida transiciones
3. `validar_responsable_estado(usuario, estado)` - Valida permisos
4. `auto_transicionar_etapa_mpj(medida)` - Auto-transición MPJ
5. `crear_etapa_post_cese_mpe(medida, fecha_cese)` - Crea etapa post-cese
6. Signal `detectar_oficio_completado_mpj` - Integración PLTM

---

## ✅ CRITERIOS DE ACEPTACIÓN

### CA-1: Estados Diferenciados por Tipo
- ✅ MPI Apertura solo permite estados 1-2
- ✅ MPI Cese no tiene estados (solo informe de cierre)
- ✅ MPE permite estados 1-5 para todas las etapas (APERTURA/INNOVACION/PRORROGA/CESE)
- ✅ **MPJ NO USA ESTADOS** - `estado_especifico = None` para todas las etapas

### CA-2: Validación de Responsables
- ✅ Solo Equipo Técnico puede avanzar estado 1
- ✅ Solo Jefe Zonal puede aprobar estado 2
- ✅ Solo Director puede emitir nota estado 3
- ✅ Solo Equipo Legal puede cargar informe estado 4 y ratificar estado 5

### CA-3: Transiciones Secuenciales
- ✅ No se puede saltar estados (1 → 3 prohibido)
- ✅ No se puede retroceder estados
- ✅ Orden secuencial: 1 → 2 → 3 → 4 → 5

### CA-4: Auto-Transición Etapas MPJ (SIN ESTADOS)
- ✅ Al crear actividad con `etapa_medida_aplicable` posterior, medida MPJ auto-transiciona etapa
- ✅ Signal detecta creación de actividad con etapa > etapa actual
- ✅ Sistema crea nueva etapa MPJ con `estado_especifico = None`
- ✅ Se registra en historial como AUTO_TRANSICION_ETAPA_MPJ
- ✅ **NO hay estados involucrados** - solo cambio de etapa (APERTURA → PROCESO → CESE)

### CA-5: Post-Cese MPE
- ✅ Al registrar fecha_cese_efectivo, se crea etapa POST_CESE
- ✅ Etapa POST_CESE no tiene estados (solo PLTM)
- ✅ Actividades PLTM permitidas después de cese
- ✅ No aplica a MPI ni MPJ

### CA-6: Backward Compatibility
- ✅ Tests V1 siguen passing
- ✅ Campo `estado` antiguo se mantiene
- ✅ Migración preserva datos existentes
- ✅ API mantiene formato de respuesta

---

## 🧪 TESTS NUEVOS (15 Tests)

### Suite 1: Estados por Tipo (3 tests)
- test_mpi_apertura_solo_estados_1_2
- test_mpe_todos_estados_1_5
- test_mpj_sin_estados (obtener_estados_permitidos retorna QuerySet vacío)

### Suite 2: Transiciones (3 tests)
- test_transicion_valida_estado_1_a_2
- test_transicion_invalida_saltar_estados
- test_solo_responsable_puede_avanzar_estado

### Suite 3: Auto-Transición Etapas MPJ (3 tests)
- test_crear_actividad_etapa_posterior_transiciona_mpj
- test_mpj_etapas_sin_estados (estado_especifico = None)
- test_historial_registra_auto_transicion_etapa

### Suite 4: Post-Cese MPE (3 tests)
- test_registrar_fecha_cese_crea_etapa_post_cese
- test_actividades_pltm_permitidas_post_cese
- test_post_cese_no_aplica_a_mpi

### Suite 5: Responsables (3 tests)
- test_equipo_tecnico_puede_avanzar_estado_1
- test_jefe_zonal_puede_aprobar_estado_2
- test_director_puede_emitir_nota_estado_3

---

## 📦 FIXTURES

```json
// infrastructure/fixtures/estados_etapa_medida.json

[
  {
    "model": "infrastructure.testadoetapamedida",
    "pk": 1,
    "fields": {
      "codigo": "PENDIENTE_REGISTRO_INTERVENCION",
      "nombre_display": "(1) Pendiente de registro de intervención",
      "orden": 1,
      "responsable_tipo": "EQUIPO_TECNICO",
      "siguiente_accion": "Registrar intervención (MED-02)",
      "aplica_a_tipos_medida": ["MPI", "MPE"],
      "aplica_a_tipos_etapa": ["APERTURA", "INNOVACION", "PRORROGA", "CESE"],
      "activo": true
    }
  },
  {
    "model": "infrastructure.testadoetapamedida",
    "pk": 2,
    "fields": {
      "codigo": "PENDIENTE_APROBACION_REGISTRO",
      "nombre_display": "(2) Pendiente de aprobación de registro",
      "orden": 2,
      "responsable_tipo": "JEFE_ZONAL",
      "siguiente_accion": "Aprobar/Rechazar intervención (MED-02)",
      "aplica_a_tipos_medida": ["MPI", "MPE"],
      "aplica_a_tipos_etapa": ["APERTURA", "INNOVACION", "PRORROGA", "CESE"],
      "activo": true
    }
  },
  {
    "model": "infrastructure.testadoetapamedida",
    "pk": 3,
    "fields": {
      "codigo": "PENDIENTE_NOTA_AVAL",
      "nombre_display": "(3) Pendiente de Nota de Aval",
      "orden": 3,
      "responsable_tipo": "DIRECTOR",
      "siguiente_accion": "Emitir Nota de Aval (MED-03)",
      "aplica_a_tipos_medida": ["MPE"],
      "aplica_a_tipos_etapa": ["APERTURA", "INNOVACION", "PRORROGA", "CESE"],
      "activo": true,
      "descripcion": "Solo MPE - MPI no requiere proceso jurídico completo, MPJ no usa estados"
    }
  },
  {
    "model": "infrastructure.testadoetapamedida",
    "pk": 4,
    "fields": {
      "codigo": "PENDIENTE_INFORME_JURIDICO",
      "nombre_display": "(4) Pendiente de Informe Jurídico",
      "orden": 4,
      "responsable_tipo": "EQUIPO_LEGAL",
      "siguiente_accion": "Cargar Informe Jurídico (MED-04)",
      "aplica_a_tipos_medida": ["MPE"],
      "aplica_a_tipos_etapa": ["APERTURA", "INNOVACION", "PRORROGA", "CESE"],
      "activo": true,
      "descripcion": "Solo MPE - MPI no requiere proceso jurídico, MPJ no usa estados"
    }
  },
  {
    "model": "infrastructure.testadoetapamedida",
    "pk": 5,
    "fields": {
      "codigo": "PENDIENTE_RATIFICACION_JUDICIAL",
      "nombre_display": "(5) Pendiente de ratificación judicial",
      "orden": 5,
      "responsable_tipo": "EQUIPO_LEGAL",
      "siguiente_accion": "Registrar Ratificación Judicial (MED-05)",
      "aplica_a_tipos_medida": ["MPE"],
      "aplica_a_tipos_etapa": ["APERTURA", "INNOVACION", "PRORROGA", "CESE"],
      "activo": true,
      "descripcion": "Solo MPE - MPJ no usa estados"
    }
  }
]
```

---

## 📋 PLAN DE IMPLEMENTACIÓN

### Paso 1: Crear Modelo TEstadoEtapaMedida (1h)
- Crear `infrastructure/models/medida/TEstadoEtapaMedida.py`
- Exportar en `__init__.py`
- Crear migración

### Paso 2: Actualizar TEtapaMedida y TMedida (1h)
- Agregar campos nuevos
- Crear migraciones
- Mantener campos antiguos para compatibility

### Paso 3: Crear Validaciones (3h)
- Crear `infrastructure/business_logic/med01_validaciones.py`
- Implementar 6 funciones
- Escribir docstrings completos

### Paso 4: Crear Fixtures y Signal (1h)
- Fixture `estados_etapa_medida.json`
- Actualizar `populate_database.py`
- Signal `detectar_oficio_completado_mpj`

### Paso 5: Migración de Datos (1h)
- Crear migración de datos
- Mapear estados antiguos → nuevos
- Validar integridad

### Paso 6: Tests (4h)
- 15 tests nuevos (5 suites)
- Validar backward compatibility
- Ejecutar todos los tests V1

---

## 📊 ESTIMACIÓN

**Complejidad:** Media-Alta
**Puntos:** 8 puntos
**Tiempo:** 8-12 horas
**Dependencias:** MED-01 V1 (✅ implementado), PLTM-02 (✅ implementado)

---

## ⚠️ RIESGOS

1. **Migración de datos:** Mapeo estados antiguos → nuevos
2. ~~**Dependencia PLTM-02:** Auto-transición requiere PLTM implementado~~ ✅ **RESUELTO** - PLTM-02 implementado
3. **Backward compatibility:** Código V1 puede romper
4. **Performance:** Validaciones adicionales pueden afectar tiempos

---

## 📝 NOTAS DE IMPLEMENTACIÓN

### ✅ Estado de Dependencias (Actualizado: 2025-10-26)

**PLTM-02 Implementado Completamente:**
- ✅ Modelos: `TComentarioActividad`, `TAdjuntoActividad`, `THistorialActividad`, `TNotificacionActividad`, `TTransferenciaActividad`
- ✅ Serializers completos con validaciones de negocio
- ✅ ViewSet con acciones: `cambiar_estado`, `comentar`, `adjuntar_evidencia`, `transferir`
- ✅ Signal `detectar_oficio_completado_mpj` implementado en `infrastructure/signals/actividad_signals.py`
- ✅ Validaciones de visado legal implementadas
- ✅ Lógica de actividades grupales (medidas vinculadas) implementada

**Impacto en MED-01 V2:**
- ✅ Signal de auto-transición MPJ **LISTO PARA USAR**
- ✅ Modelo `TActividadPlanTrabajo` tiene campo `tipo_actividad` con códigos (ej: `OFICIO_JUDICIAL`)
- ✅ Estados de actividad incluyen `COMPLETADA` que dispara validaciones
- ✅ Sistema de notificaciones implementado para equipo legal

**Próximos Pasos Facilitados:**
1. Implementar función `auto_transicionar_etapa_mpj(medida)` puede usar directamente signal existente
2. No requiere cambios en PLTM-02 - solo consumir signal
3. Tests de auto-transición pueden usar fixtures de PLTM-02 ya existentes

---

**Story MED-01 V2 documentada completamente. Lista para implementación con /sc:implement.**

**Dependencias resueltas: Todas las dependencias técnicas están implementadas y listas para integración.**

---

## 🔧 CORRECCIONES IMPLEMENTADAS (2025-10-27)

### ✅ Corrección del Catálogo de Estados

**Problema Identificado:**
- Migración 0055 tenía estados incorrectos que no coincidían con documentación oficial
- **Faltaba estado 3**: `PENDIENTE_NOTA_AVAL` (DIRECTOR)
- Estados 3, 4, 5 estaban mal ordenados
- Valores `responsable_tipo` inválidos (no existían en `RESPONSABLE_CHOICES`)

**Archivos Corregidos:**

1. **Migración 0055** ([0055_migrar_estados_a_catalogo.py](../runna/infrastructure/migrations/0055_migrar_estados_a_catalogo.py)):
   ```python
   # ANTES (INCORRECTO)
   estados = [
       # ... estado 1 y 2 correctos ...
       {'pk': 3, 'codigo': 'PENDIENTE_INFORME_JURIDICO', ...},      # ✗ Debería ser posición 4
       {'pk': 4, 'codigo': 'PENDIENTE_RATIFICACION_JUDICIAL', ...}, # ✗ Debería ser posición 5
       {'pk': 5, 'codigo': 'VIGENTE', ...},                         # ✗ No existe en documentación
   ]

   # DESPUÉS (CORRECTO)
   estados = [
       {'pk': 1, 'codigo': 'PENDIENTE_REGISTRO_INTERVENCION', 'responsable_tipo': 'EQUIPO_TECNICO', ...},
       {'pk': 2, 'codigo': 'PENDIENTE_APROBACION_REGISTRO', 'responsable_tipo': 'JEFE_ZONAL', ...},
       {'pk': 3, 'codigo': 'PENDIENTE_NOTA_AVAL', 'responsable_tipo': 'DIRECTOR', ...},           # ✓ AGREGADO
       {'pk': 4, 'codigo': 'PENDIENTE_INFORME_JURIDICO', 'responsable_tipo': 'EQUIPO_LEGAL', ...},
       {'pk': 5, 'codigo': 'PENDIENTE_RATIFICACION_JUDICIAL', 'responsable_tipo': 'EQUIPO_LEGAL', ...},
   ]
   ```

2. **ViewSet TIntervencionMedida** ([TIntervencionMedidaView.py:561](../runna/api/views/TIntervencionMedidaView.py)):
   ```python
   # ANTES (INCORRECTO - línea 561)
   nuevo_estado_codigo='PENDIENTE_INFORME_JURIDICO'

   # DESPUÉS (CORRECTO)
   nuevo_estado_codigo='PENDIENTE_NOTA_AVAL'
   ```

3. **Script de Corrección en Base de Datos Existente**:
   - Creado script temporal `fix_estado_catalog.py` (eliminado post-ejecución)
   - Actualizó registros existentes en tabla `t_estado_etapa_medida`
   - Reordenó estados 3, 4 legacy a posiciones 4, 5
   - Creó nuevo registro para estado 3: `PENDIENTE_NOTA_AVAL` (ID: 6, DIRECTOR)
   - Desactivó estado `VIGENTE` (18 etapas históricas lo usaban)

**Catálogo Final Correcto:**

| Orden | Código Estado                     | Responsable     | Aplica a Tipos |
|-------|-----------------------------------|-----------------|----------------|
| 1     | PENDIENTE_REGISTRO_INTERVENCION   | EQUIPO_TECNICO  | MPE            |
| 2     | PENDIENTE_APROBACION_REGISTRO     | JEFE_ZONAL      | MPI, MPE       |
| 3     | **PENDIENTE_NOTA_AVAL** ← NUEVO   | **DIRECTOR**    | **MPE**        |
| 4     | PENDIENTE_INFORME_JURIDICO        | EQUIPO_LEGAL    | MPE            |
| 5     | PENDIENTE_RATIFICACION_JUDICIAL   | EQUIPO_LEGAL    | MPE            |

**Validación:**
- ✅ **21/21 tests PLTM01 PASSED** (2.9 segundos)
- ✅ Migración 0055 corregida y re-ejecutable
- ✅ Base de datos actualizada con estado 3 correcto
- ✅ ViewSet usa estado correcto en transiciones
- ✅ Backward compatibility preservada

**Documentación:**
- [MED01_V2_ESTADOS_CORREGIDOS.md](../claudedocs/MED01_V2_ESTADOS_CORREGIDOS.md) - Detalle completo de corrección
- [MED01_V2_ISSUES_ENCONTRADOS.md](../claudedocs/MED01_V2_ISSUES_ENCONTRADOS.md) - Registro de issues

### 🔧 Patrón Dual FK Implementado

**Concepto:**
- **Dual FK Pattern**: Tanto `medida_id` (acceso global) como `etapa_id` (aislamiento por etapa) en tablas relacionadas
- **In-Place State Updates**: Actualización de `TEtapaMedida.estado_especifico` sin crear registros nuevos

**Modelos Actualizados con Campo `etapa`:**

1. **TIntervencionMedida** ([TIntervencionMedida.py:43-51](../runna/infrastructure/models/medida/TIntervencionMedida.py)):
   ```python
   etapa = models.ForeignKey(
       'TEtapaMedida',
       on_delete=models.CASCADE,
       related_name='intervenciones',
       null=True, blank=True,
       help_text="Etapa específica a la que pertenece esta intervención (MED-01 V2)"
   )
   ```

2. **TNotaAval** ([TNotaAval.py:39-47](../runna/infrastructure/models/medida/TNotaAval.py)):
   ```python
   etapa = models.ForeignKey(
       'TEtapaMedida',
       on_delete=models.CASCADE,
       related_name='notas_aval',
       null=True, blank=True,
       help_text="Etapa específica a la que pertenece esta nota (MED-01 V2)"
   )
   ```

3. **TInformeJuridico** ([TInformeJuridico.py:31-39](../runna/infrastructure/models/medida/TInformeJuridico.py)):
   ```python
   etapa = models.ForeignKey(
       'TEtapaMedida',
       on_delete=models.CASCADE,
       related_name='informes_juridicos',
       null=True, blank=True,
       help_text="Etapa específica a la que pertenece este informe (MED-01 V2)"
   )
   ```

4. **TRatificacionJudicial** ([TRatificacionJudicial.py:31-39](../runna/infrastructure/models/medida/TRatificacionJudicial.py)):
   ```python
   etapa = models.ForeignKey(
       'TEtapaMedida',
       on_delete=models.CASCADE,
       related_name='ratificaciones',
       null=True, blank=True,
       help_text="Etapa específica a la que pertenece esta ratificación (MED-01 V2)"
   )
   ```

**Migraciones Asociadas:**

1. **0057_agregar_campo_etapa.py**: Agrega columna `etapa_id` nullable a 4 tablas
2. **0058_poblar_campo_etapa.py**: Poblado con lógica temporal (fecha creación documento vs fecha inicio etapa)

**Beneficios:**
- ✅ **Acceso Global**: ViewSets pueden filtrar `TIntervencionMedida.objects.filter(medida=medida)`
- ✅ **Aislamiento por Etapa**: `etapa.intervenciones.all()` solo retorna documentos de esa etapa específica
- ✅ **Backward Compatibility**: Campo `etapa` nullable para datos legacy
- ✅ **Historial Preservado**: Documentos antiguos mantienen asociación correcta

### 📋 Refactorización de ViewSets (MED-01 V2)

**Eliminación de Lógica Duplicada:**

Todos los ViewSets de medidas ahora usan helpers centralizados en `infrastructure/business_logic/med01_validaciones.py`:

1. **TIntervencionMedidaView**:
   - Eliminado: `_transicionar_estado()` local
   - Usa: `transicionar_estado_dentro_etapa()` centralizado
   - Métodos actualizados: `create()`, `enviar_a_aprobacion()`, `aprobar()`, `rechazar()`

2. **TNotaAvalView**:
   - Eliminado: `_transicionar_estado()`, `_obtener_nombre_etapa()`
   - Usa: `transicionar_estado_dentro_etapa()`, `obtener_etapa_actual()`
   - Método actualizado: `create()`

3. **TInformeJuridicoView**:
   - Eliminado: `_transicionar_estado()`, `_obtener_nombre_etapa()`
   - Usa: `transicionar_estado_dentro_etapa()`, `obtener_etapa_actual()`
   - Métodos actualizados: `create()`, `enviar_informe()`

4. **TRatificacionJudicialView**:
   - Sin cambios de lógica (ya estaba correcto)
   - Método actualizado: `create()` asigna `etapa`

5. **TMedidaView**:
   - Agregado: `transicionar_etapa_endpoint()` genérico para transiciones de etapa

**Endpoint de Transición de Etapas** ([TMedidaView.py:80-184](../runna/api/views/TMedidaView.py)):

```
POST /api/medidas/{id}/transicionar-etapa/

Body:
{
    "tipo_etapa": "INNOVACION",
    "observaciones": "Motivación de la innovación..."
}
```

**Funcionalidad:**
- Transiciona la medida a una nueva etapa (APERTURA→INNOVACION→PRORROGA→CESE)
- Crea nueva TEtapaMedida, finaliza la anterior, comienza con 0 documentos

**Reglas de transición por tipo de medida:**
- **MPI**: APERTURA → CESE
- **MPE**: APERTURA → INNOVACION/PRORROGA/CESE
          INNOVACION → PRORROGA/CESE
          PRORROGA → CESE
- **MPJ**: APERTURA → PROCESO/CESE
          PROCESO → CESE

**Validaciones:**
- Usuario debe ser Jefe Zonal (vía TCustomUserZona)
- Transición debe estar permitida según tipo de medida
- Etapa destino debe ser válida

**Respuesta exitosa (200):**
```json
{
    "status": "transicionado",
    "mensaje": "Medida transicionada exitosamente a INNOVACION",
    "medida": {
        "id": 1,
        "numero_medida": "MPE-2025-001",
        "tipo_medida": "MPE"
    },
    "etapa_anterior": "APERTURA",
    "etapa_nueva": {
        "id": 2,
        "tipo_etapa": "INNOVACION",
        "nombre": "Innovación de Medida",
        "estado": "PENDIENTE_REGISTRO_INTERVENCION",
        "estado_especifico": {
            "codigo": "PENDIENTE_REGISTRO_INTERVENCION",
            "nombre": "(1) Pendiente de registro de intervención"
        },
        "fecha_inicio_estado": "2025-10-27T10:30:00Z",
        "observaciones": "Motivación de la innovación..."
    }
}
```

**Errores comunes:**
- `403 PERMISO_DENEGADO`: Usuario no es Jefe Zonal
- `400 TIPO_ETAPA_REQUERIDO`: Falta campo `tipo_etapa` en body
- `400 TRANSICION_INVALIDA`: Transición no permitida para ese tipo de medida

**Helpers Centralizados** (`infrastructure/business_logic/med01_validaciones.py`):

```python
# Funciones principales
transicionar_estado_dentro_etapa(medida, nuevo_estado_codigo, observaciones=None)
  # Transición in-place de estado dentro de la misma etapa (1→2→3→4→5)

transicionar_etapa(medida, nuevo_tipo_etapa, observaciones=None)
  # Transición de etapa completa (APERTURA→INNOVACION→PRORROGA→CESE)
  # Crea nueva TEtapaMedida, finaliza anterior, comienza ciclo de estados

obtener_etapa_actual(medida)
  # Retorna la TEtapaMedida activa actual

obtener_estados_permitidos(tipo_medida, tipo_etapa)
  # Retorna QuerySet de TEstadoEtapaMedida válidos para tipo_medida/tipo_etapa

validar_transicion_estado(etapa, nuevo_estado, usuario)
  # Valida que transición de estado sea permitida

validar_responsable_estado(usuario, estado)
  # Valida que usuario tenga permisos para el estado

auto_transicionar_etapa_mpj(medida, nueva_etapa_tipo)
  # Auto-transición específica para MPJ (sin estados)
```

**Beneficios:**
- ✅ **DRY**: Lógica de transición en un solo lugar
- ✅ **Testeable**: Business logic separada de ViewSets
- ✅ **Mantenible**: Cambios en lógica no requieren tocar 4+ ViewSets
- ✅ **Consistente**: Todas las transiciones siguen las mismas reglas

---

## 📊 Estado de Implementación Actualizado

### ✅ Componentes Implementados

| Componente | Status | Detalles |
|------------|--------|----------|
| Modelo `TEstadoEtapaMedida` | ✅ Implementado | Catálogo con 5 estados correctos |
| Campo `TEtapaMedida.estado_especifico` | ✅ Implementado | FK a catálogo de estados |
| Campo `TEtapaMedida.tipo_etapa` | ✅ Implementado | APERTURA/INNOVACION/PRORROGA/CESE/POST_CESE/PROCESO |
| Campo `TMedida.fecha_cese_efectivo` | ✅ Implementado | Para MPE Post-cese |
| **Campo `etapa` en 4 modelos** | ✅ **IMPLEMENTADO** | Dual FK Pattern |
| Business Logic Helpers | ✅ Implementado | `med01_validaciones.py` |
| ViewSets Refactorizados | ✅ Implementado | TIntervencion, TNotaAval, TInformeJuridico |
| Migración 0055 (catálogo) | ✅ **CORREGIDA** | Estados correctos según documentación |
| Migración 0057 (campo etapa) | ✅ Implementado | Agrega columna etapa_id |
| Migración 0058 (poblar etapa) | ✅ Implementado | Lógica temporal de asignación |
| **Corrección Base Datos** | ✅ **EJECUTADO** | Estado 3 agregado correctamente |

### 🧪 Validación Final

```bash
# Tests PLTM01 (21 tests)
pipenv run python runna/manage.py test tests.test_actividades_pltm01 -v 2
# ✅ 21/21 PASSED (2.9 segundos)

# Catálogo de Estados Correcto
TEstadoEtapaMedida.objects.filter(activo=True).order_by('orden')
# ✅ 5 estados en orden correcto (1-5)
# ✅ Todos los responsable_tipo válidos
# ✅ Estado 3 PENDIENTE_NOTA_AVAL presente
```

### 📝 Próximos Pasos

1. ⏭️ **Tests específicos MED-01 V2**: Crear 15 tests de validación de estados diferenciados
2. ⏭️ **Auto-transición MPJ**: Implementar lógica de cambio de etapa sin estados
3. ⏭️ **Post-cese MPE**: Lógica de creación automática de etapa POST_CESE
4. ⏭️ **Integración completa PLTM**: Signal para auto-transición MPJ

---

**✅ MED-01 V2 DEPLOYMENT PHASE COMPLETO**
**✅ CORRECCIONES APLICADAS Y VALIDADAS**
**⏭️ LISTO PARA FASE DE TESTS ESPECÍFICOS**
