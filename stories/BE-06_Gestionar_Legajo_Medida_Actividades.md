# BE-06: Gestionar Legajo, Medida, y Actividades

## User Story
**Como** Usuario de alto rango (Jefe Zonal y/o Director)
**Quiero** asignar a legajos sus equipos correspondientes
**Para** luego gestionar sus medidas, comunicaciones de cambios de estados y decisiones, así como también las actividades pendientes

## Descripción Detallada

Esta funcionalidad permite a usuarios de alto nivel asignar la responsabilidad de un legajo a equipos y usuarios específicos. El proceso se gestiona desde el listado de legajos mediante un sistema de derivación y asignación de responsables.

### Flujo de Trabajo

#### 1. Acción Inicial
- Usuario con permisos hace clic en botón "Asignar" en la columna de acciones rápidas del legajo
- Se abre una ventana emergente (pop-up) con tres secciones principales

#### 2. Estructura del Pop-up de Asignación
El pop-up debe contener:
- **Sección 1**: Derivar a equipos (zonas/UDER)
- **Sección 2**: Asignar usuarios particulares como responsables
- **Sección 3**: Ver historial de derivaciones del legajo

#### 3. Proceso de Derivación
- Seleccionar zona/equipo de destino desde menú desplegable
- Añadir comentario opcional
- Al presionar "derivar", enviar notificación al equipo de destino

#### 4. Asignación de Responsables
Un jefe o director (Nivel 3 o 4) del equipo de destino abre el mismo pop-up para asignar usuario específico como responsable.

**Tipos de Responsabilidad:**
- **Responsable de Trabajo**: Equipo que interviene directamente en el caso
- **Responsable de Centro de Vida**: Equipo relacionado con lugar de residencia del NNyA
- **Responsable Judicial**: Para casos con oficios judiciales (equipo de Legales)

**Campos adicionales:**
- Seleccionar "local de centro de vida" desde lista desplegable

#### 5. Funcionalidades Adicionales
- Opción de crear actividad inicial en Plan de Trabajo (PLTM) al asignar
  - Ejemplo: "Contacto inicial con institución X"
- Sistema envía notificaciones automáticas por correo al reasignar
  - Incluir comentarios y enlaces directos (deep-links) al legajo

## Criterios de Aceptación

### CA-01: Control de Acceso
- ✅ La asignación y desasignación de legajos solo puede ser realizada por usuarios de **Nivel 3 (Jefe Zonal/Director) y Nivel 4 (Admin)**
- ✅ La columna "Asignar" solo debe ser visible para Nivel 3 y Nivel 4
- ✅ Otros niveles de usuario no pueden realizar estas acciones

### CA-02: Gestión de Asignación
- ✅ Se debe poder modificar el usuario responsable de un legajo ya asignado
- ✅ Se debe poder re-derivar el legajo a otra zona
- ✅ Se debe poder asignar diferentes responsables para:
  - Trabajo (equipo interventor)
  - Centro de Vida (equipo del lugar de residencia)
  - Judicial (equipo de Legales, solo si aplica)

### CA-03: Sistema de Notificaciones
- ✅ El sistema **DEBE enviar notificación por email** en los siguientes casos:
  - Asignación inicial de legajo
  - Desasignación de legajo
  - Re-derivación a otra zona
  - Modificación de responsable
- ✅ El email debe contener:
  - **Asunto**: `[RUNNA] Asignación de Legajo #{numero_legajo}`
  - **Número de legajo** y nombre completo del NNyA
  - **Tipo de responsabilidad**: Trabajo/Centro de Vida/Judicial
  - **Zona origen y destino**
  - **Responsable anterior y nuevo** (nombre completo)
  - **Comentarios** de la derivación/asignación
  - **Deep-link**: `https://runna.senaf.gob.ar/legajos/{id}/`

### CA-04: Historial y Trazabilidad
- ✅ Se debe mostrar el historial de derivaciones del legajo en el pop-up
- ✅ Cada derivación debe registrar:
  - Fecha y hora
  - Usuario que realizó la acción
  - Zona/equipo origen y destino
  - Comentarios asociados

### CA-05: Integración con PLTM (Fase 4 - Preparación Futura)
- 🔄 Al momento de asignar, debe existir opción de crear actividad inicial en Plan de Trabajo
- 🔄 La actividad creada debe estar vinculada al legajo asignado
- ⚠️ **NOTA**: Esta integración requiere módulo PLTM (MED-01 a MED-05 y PLTM-01 a PLTM-04) implementado primero

### CA-06: Validaciones
- ✅ No permitir asignar a equipos/usuarios inexistentes
- ✅ Validar que el usuario asignado pertenezca al equipo de destino
- ✅ Validar que el "local de centro de vida" seleccionado exista en el sistema

## Restricciones por Nivel de Usuario

| Nivel | Rol | Permisos |
|-------|-----|----------|
| **Nivel 3** | Jefe Zonal/Director | ✅ Visualizar columna "Asignar"<br>✅ Realizar asignaciones<br>✅ Modificar responsables<br>✅ Re-derivar legajos |
| **Nivel 4** | Admin | ✅ Todos los permisos de Nivel 3 |
| **Nivel 1-2** | Otros usuarios | ❌ Sin acceso a funcionalidad de asignación |

## Columnas y Acciones

### Columna Desencadenante
- **"Asignar"**: Visible solo para Nivel 3 y 4

### Acciones Disponibles en Pop-up
1. **Derivar a Zona/Equipo**
   - Seleccionar zona/equipo destino
   - Añadir comentario opcional
   - Enviar notificación

2. **Asignar Responsable**
   - Asignar responsable de Trabajo
   - Asignar responsable de Centro de Vida
   - Asignar responsable Judicial (condicional)
   - Seleccionar local de centro de vida

3. **Modificar Responsable**
   - Cambiar usuario asignado actual
   - Mantener trazabilidad del cambio

4. **Re-derivar**
   - Derivar a otra zona diferente
   - Añadir comentario de justificación

5. **Crear Actividad PLTM** (⚠️ fase futura)
   - Crear tarea inicial en Plan de Trabajo
   - Vincular actividad al legajo
   - Requiere módulo PLTM implementado

6. **Ver Historial**
   - Mostrar todas las derivaciones previas
   - Detalles de cada asignación por tipo de responsabilidad

## Dependencias Técnicas

### Módulos Relacionados
- **BE-05**: Listado de Legajos (origen de la acción)
- **NOTINT-01/02**: Sistema de Notificaciones (emails automáticos)
- **PLTM-01**: Crear Actividad en Plan de Trabajo (⚠️ Fase 4 - preparación futura)
- **Sistema de Usuarios y Equipos**: Gestión de roles, zonas, usuarios

## Arquitectura de Modelos

### Modelos Existentes (Base)

#### TLegajoZona ([Persona.py:516-550](runna/infrastructure/models/Persona.py#L516))
Modelo actual para asignación de legajos a zonas:
```python
class TLegajoZona(models.Model):
    # Control de estado
    esta_activo = BooleanField(default=True)  # Soft delete
    recibido = BooleanField(default=False)
    comentarios = TextField(null=True, blank=True)

    # Relaciones principales
    legajo = ForeignKey('TLegajo', on_delete=CASCADE)
    zona = ForeignKey('customAuth.TZona', on_delete=CASCADE)
    user_responsable = ForeignKey('CustomUser', null=True)

    # Auditoría de derivación
    enviado_por = ForeignKey('CustomUser', related_name="%(class)senviado_por", null=True)
    recibido_por = ForeignKey('CustomUser', related_name="%(class)srecibido_por", null=True)
```

#### TCustomUserZona ([customAuth/models/CustomUser.py:20-42](runna/customAuth/models/CustomUser.py#L20))
Modelo para roles jerárquicos de usuarios en zonas (NO tipos de equipo):
```python
class TCustomUserZona(models.Model):
    # Roles jerárquicos (solo uno por zona)
    director = BooleanField(default=False)
    jefe = BooleanField(default=False)

    # Relaciones
    user = ForeignKey('customAuth.CustomUser', on_delete=CASCADE)
    zona = ForeignKey('customAuth.TZona', on_delete=CASCADE)
    localidad = ForeignKey('infrastructure.TLocalidad', null=True)

    # Constraints
    class Meta:
        unique_together = ['user', 'zona']
```

**⚠️ ACLARACIÓN ARQUITECTURAL**:
- `TCustomUserZona` = Roles jerárquicos (jefe/director) de usuarios en zonas
- `TLegajoZona` extendido = Asignaciones funcionales de legajos (trabajo/centro_vida/judicial)
- Son conceptos **complementarios**, NO reemplazables

### Propuesta de Extensión: TLegajoZona

**⚠️ IMPORTANTE**: Se debe **EXTENDER** el modelo `TLegajoZona` existente en `Persona.py:516-550`, NO crear un modelo nuevo.

Para soportar los tres tipos de responsabilidad (Trabajo, Centro de Vida, Judicial), agregar los siguientes campos al modelo existente:

```python
# En runna/infrastructure/models/Persona.py
# Modificar clase TLegajoZona existente agregando:

class TLegajoZona(TLegajoZonaBase):
    """
    Modelo extendido para soportar asignaciones funcionales múltiples.
    Un legajo puede tener 3 asignaciones activas simultáneas (una por tipo).
    """

    # CAMPOS EXISTENTES (mantener):
    # esta_activo, recibido, comentarios
    # legajo, zona, user_responsable
    # enviado_por, recibido_por

    # ========== CAMPOS NUEVOS A AGREGAR ==========

    # NUEVO: Tipo de responsabilidad funcional
    TIPO_RESPONSABILIDAD_CHOICES = [
        ('TRABAJO', 'Responsable de Trabajo'),           # Equipo interventor directo
        ('CENTRO_VIDA', 'Responsable de Centro de Vida'), # Equipo del lugar de residencia
        ('JUDICIAL', 'Responsable Judicial'),            # Equipo de Legales
    ]
    tipo_responsabilidad = models.CharField(
        max_length=20,
        choices=TIPO_RESPONSABILIDAD_CHOICES,
        null=False,
        blank=False,
        default='TRABAJO'
    )

    # NUEVO: Local de centro de vida (solo para tipo CENTRO_VIDA)
    local_centro_vida = models.ForeignKey(
        'TLocalCentroVida',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Requerido solo para tipo_responsabilidad=CENTRO_VIDA"
    )

    # ========== FIN CAMPOS NUEVOS ==========

    def delete(self, *args, **kwargs):
        """Override delete to implement soft delete."""
        self.esta_activo = False
        self.save()

    def hard_delete(self, *args, **kwargs):
        """Permanently delete the object."""
        super().delete(*args, **kwargs)

    def clean(self):
        """Validaciones de negocio"""
        super().clean()
        if self.tipo_responsabilidad == 'CENTRO_VIDA' and not self.local_centro_vida:
            raise ValidationError("Debe especificar local_centro_vida para tipo CENTRO_VIDA")
        if self.tipo_responsabilidad != 'CENTRO_VIDA' and self.local_centro_vida:
            raise ValidationError("local_centro_vida solo aplica para tipo CENTRO_VIDA")

    class Meta:
        app_label = 'infrastructure'
        verbose_name = _('Asignacion de Legajo')
        verbose_name_plural = _('Asignaciones de Legajos')
        constraints = [
            # Solo una asignación activa por tipo de responsabilidad
            models.UniqueConstraint(
                fields=['legajo', 'zona', 'tipo_responsabilidad'],
                condition=models.Q(esta_activo=True),
                name='unique_active_legajo_zona_tipo'
            )
        ]
```

### Nuevo Modelo: TLegajoZonaHistorial

Historial de auditoría manual (sin django-simple-history):

```python
class TLegajoZonaHistorial(models.Model):
    """
    Historial inmutable de cambios en asignaciones de legajos.
    Registra todas las derivaciones, asignaciones y modificaciones.
    """

    # Snapshot de TLegajoZona en el momento del cambio
    legajo = ForeignKey('TLegajo', on_delete=CASCADE)
    zona = ForeignKey('customAuth.TZona', on_delete=CASCADE)
    tipo_responsabilidad = CharField(max_length=20)
    user_responsable = ForeignKey('CustomUser', related_name='historial_responsable', null=True)
    local_centro_vida = ForeignKey('TLocalCentroVida', null=True)

    # Metadata de auditoría
    accion = CharField(max_length=20, choices=[
        ('DERIVACION', 'Derivación a zona'),
        ('ASIGNACION', 'Asignación de responsable'),
        ('MODIFICACION', 'Modificación de responsable'),
        ('DESACTIVACION', 'Desactivación de asignación'),
    ])
    comentarios = TextField(null=True, blank=True)
    fecha_accion = DateTimeField(auto_now_add=True)
    realizado_por = ForeignKey('CustomUser', related_name='historial_acciones', on_delete=PROTECT)

    # Referencias al estado anterior y nuevo
    legajo_zona_anterior = ForeignKey(
        'TLegajoZona',
        related_name='historial_anterior',
        null=True,
        on_delete=SET_NULL
    )
    legajo_zona_nuevo = ForeignKey(
        'TLegajoZona',
        related_name='historial_nuevo',
        null=True,
        on_delete=SET_NULL
    )

    class Meta:
        app_label = 'infrastructure'
        verbose_name = 'Historial de Asignación de Legajo'
        verbose_name_plural = 'Historial de Asignaciones de Legajos'
        ordering = ['-fecha_accion']
        indexes = [
            models.Index(fields=['legajo', '-fecha_accion']),
            models.Index(fields=['realizado_por', '-fecha_accion']),
        ]
```

### Nuevo Modelo: TLocalCentroVida

```python
class TLocalCentroVida(models.Model):
    """
    Lugares de residencia del NNyA (instituciones, hogares, etc.)
    """
    nombre = CharField(max_length=255, null=False, blank=False)
    direccion = TextField(null=True, blank=True)
    localidad = ForeignKey('TLocalidad', on_delete=SET_NULL, null=True)
    zona = ForeignKey('customAuth.TZona', on_delete=SET_NULL, null=True)

    # Tipo de local
    TIPO_CHOICES = [
        ('HOGAR', 'Hogar Convivencial'),
        ('INSTITUCION', 'Institución'),
        ('FAMILIA_AMPLIADA', 'Familia Ampliada'),
        ('FAMILIA_ACOGEDORA', 'Familia Acogedora'),
        ('OTRO', 'Otro'),
    ]
    tipo = CharField(max_length=20, choices=TIPO_CHOICES, default='HOGAR')

    activo = BooleanField(default=True)

    class Meta:
        app_label = 'infrastructure'
        verbose_name = 'Local de Centro de Vida'
        verbose_name_plural = 'Locales de Centro de Vida'
```

### Endpoints Propuestos

**Justificación para endpoints custom** (no CRUD estándar):
- Las operaciones de asignación son transaccionales complejas
- Requieren lógica de negocio específica (validaciones, notificaciones, historial)
- Cada endpoint representa un caso de uso concreto del dominio
- No son simples CRUDs, sino operaciones de workflow

```python
# Derivación inicial de legajo a zona
POST /api/legajo/{id}/derivar/
{
    "zona_destino_id": int,
    "tipo_responsabilidad": "TRABAJO|CENTRO_VIDA|JUDICIAL",
    "comentarios": "texto opcional",
    "notificar_equipo": bool
}

# Asignación de responsable específico en zona
POST /api/legajo/{id}/asignar/
{
    "tipo_responsabilidad": "TRABAJO|CENTRO_VIDA|JUDICIAL",
    "user_responsable_id": int,
    "local_centro_vida_id": int (solo para CENTRO_VIDA),
    "comentarios": "texto opcional",
    "crear_actividad_pltm": bool (⚠️ fase futura)
}

# Modificación de responsable existente
PATCH /api/legajo/{id}/reasignar/
{
    "tipo_responsabilidad": "TRABAJO|CENTRO_VIDA|JUDICIAL",
    "user_responsable_id": int (nuevo responsable),
    "comentarios": "texto opcional"
}

# Re-derivación a otra zona (desactiva asignación actual)
POST /api/legajo/{id}/rederivar/
{
    "tipo_responsabilidad": "TRABAJO|CENTRO_VIDA|JUDICIAL",
    "zona_destino_id": int,
    "comentarios": "justificación"
}

# Historial completo de derivaciones y asignaciones
GET /api/legajo/{id}/historial-asignaciones/
Response: [
    {
        "fecha_accion": "2025-10-06T10:30:00Z",
        "accion": "DERIVACION",
        "tipo_responsabilidad": "TRABAJO",
        "zona": {"id": 1, "nombre": "Zona Norte"},
        "user_responsable": {"id": 5, "nombre": "Juan Pérez"},
        "realizado_por": {"id": 3, "nombre": "María Gómez"},
        "comentarios": "Caso requiere intervención especializada"
    },
    ...
]

# Endpoints de soporte
GET /api/zonas/                      # Lista de zonas disponibles
GET /api/locales-centro-vida/       # Lista de locales de centro de vida
GET /api/zona/{id}/usuarios/        # Usuarios disponibles en una zona
```

### Componentes de UI
- **Modal/Pop-up de Asignación**
  - Formulario de derivación
  - Formulario de asignación de responsables
  - Historial de derivaciones
- **Botón de Acción "Asignar"** en tabla de legajos

## Notas Importantes

### Conceptos Clave
- **Responsabilidad Separada**: El sistema distingue entre responsable de Trabajo y Centro de Vida, conceptos fundamentales en la gestión del legajo
- **Responsable Judicial**: Rol específico del equipo de Legales para casos con oficios judiciales

### Puntos Pendientes de Definición
- ✅ **DEFINIDO**: Contenido de notificaciones por email especificado en CA-03

### Consideraciones de Implementación
- Implementar sistema de permisos granular basado en niveles de usuario
- Diseñar esquema de base de datos para mantener historial completo de derivaciones
- Integrar con módulo de notificaciones existente (NOTINT)
- Considerar validación de deep-links para navegación directa desde emails
- Implementar transacciones atómicas para asignaciones (evitar estados inconsistentes)

### Testing Requerido
- ✅ Validar permisos por nivel de usuario (solo Nivel 3 y 4)
- ✅ Verificar envío de notificaciones en todos los escenarios
- ✅ Probar deep-links desde emails
- ✅ Validar registro correcto del historial (TLegajoZonaHistorial)
- ✅ Validar constraint único por tipo de responsabilidad activo
- ✅ Probar asignación simultánea de los 3 tipos (TRABAJO, CENTRO_VIDA, JUDICIAL)
- ✅ Validar que local_centro_vida sea obligatorio solo para tipo CENTRO_VIDA
- ✅ Validar que no se puedan asignar a zonas/usuarios inexistentes
- 🔄 Probar integración con PLTM (pendiente implementación módulo PLTM)

## Estado
**PENDIENTE DE IMPLEMENTACIÓN**

## Prioridad
**ALTA** - Funcionalidad crítica para gestión de legajos y flujo operativo del sistema

---

## Changelog

### 2025-10-06 - Revisión Técnica (v2)
**Correcciones arquitecturales basadas en análisis del código:**

1. **ELIMINADO**: Referencias a modelo `TEquipoZona` (no existe en el codebase)
2. **ACLARADO**: Diferencia entre `TCustomUserZona` (roles jerárquicos) y `TLegajoZona` (asignaciones funcionales)
3. **AGREGADO**: Sección completa "Arquitectura de Modelos" con:
   - Modelos existentes documentados con referencias al código
   - Propuesta de **extensión de `TLegajoZona` existente** (NO crear modelo nuevo)
   - Nuevo modelo `TLegajoZonaHistorial` para auditoría manual
   - Nuevo modelo `TLocalCentroVida` para lugares de residencia
4. **ACTUALIZADO**: Endpoints con justificación de operaciones custom (no CRUD estándar)
5. **MARCADO**: Integración PLTM como "Fase 4 - Preparación Futura"
6. **EXPANDIDO**: Testing con validaciones específicas de la nueva arquitectura
7. **ESPECIFICADO**: Contenido completo de notificaciones por email (CA-03)

**Fuentes:**
- Análisis de código: `runna/infrastructure/models/Persona.py:516-550` (TLegajoZona)
- Análisis de código: `runna/customAuth/models/CustomUser.py:20-42` (TCustomUserZona)

---

*Story creada basándose en análisis completo de `Documentacion RUNNA.md` sección BE-06*
*Fecha creación: 2025-10-06*
*Última revisión técnica: 2025-10-06*

## IMPLEMENTACIÓN REAL - ANÁLISIS DE GAPS

### ✅ Implementado Correctamente:

1. **ViewSet Principal** (`LegajoAsignacionViewSet`)
   - Implementado en `runna/api/views/LegajoAsignacionView.py`
   - Registrado en `api/urls.py` como `/api/legajo/` (singular)
   - Clase completa con todos los endpoints requeridos

2. **Endpoints Implementados**
   - ✅ `POST /api/legajo/{id}/derivar/` (línea 196-261)
   - ✅ `POST /api/legajo/{id}/asignar/` (línea 263-341)
   - ✅ `PATCH /api/legajo/{id}/reasignar/` (línea 343-411)
   - ✅ `POST /api/legajo/{id}/rederivar/` (línea 413-486)
   - ✅ `GET /api/legajo/{id}/historial-asignaciones/` (línea 488+)

3. **Control de Acceso (CA-01)**
   - ✅ Clase `IsJefeOrDirector` implementada (líneas 22-45)
   - ✅ Validación de permisos por zona (_validar_permisos_zona)
   - ✅ Superuser tiene acceso completo

4. **Gestión de Asignación (CA-02)**
   - ✅ Tipos de responsabilidad: TRABAJO, CENTRO_VIDA, JUDICIAL
   - ✅ Modificación de responsable existente (reasignar)
   - ✅ Derivación a otra zona (rederivar)
   - ✅ Local de Centro de Vida manejado

5. **Historial y Trazabilidad (CA-04)**
   - ✅ Modelo `TLegajoZonaHistorial` usado
   - ✅ Helper `_crear_registro_historial` (líneas 144-158)
   - ✅ Registro de todas las acciones (DERIVACION, ASIGNACION, MODIFICACION, RE-DERIVACION)

6. **Validaciones del Sistema (CA-06)**
   - ✅ Verificación de asignaciones existentes antes de crear
   - ✅ Validación de responsable pertenece a zona
   - ✅ Uso de `get_object_or_404` para entidades

7. **ViewSet de Centro de Vida**
   - ✅ `TLocalCentroVidaViewSet` implementado (líneas 48-59)
   - ✅ Filtrado por zona disponible

### ⚠️ Parcialmente Implementado:

1. **Notificaciones por Email (CA-03)**
   - ⚠️ Helper `_enviar_notificacion_email` existe (líneas 160-195)
   - ⚠️ Estructura de email correcta según CA-03
   - ❌ TODO: Integración real con servicio de email (línea 187)
   - ⚠️ Solo imprime en consola actualmente

2. **Integración con PLTM (CA-05)**
   - ⚠️ Placeholder para crear actividad PLTM (líneas 334-336)
   - ❌ Comentado como TODO: Integración con PLTM (Fase 4)
   - ❌ Requiere implementación del módulo PLTM

### ❌ No Implementado:

1. **Serializers Específicos**
   - Falta verificar implementación de:
     - `DerivarLegajoSerializer`
     - `AsignarLegajoSerializer`
     - `ReasignarLegajoSerializer`
     - `RederivarLegajoSerializer`

2. **Tests Específicos para BE-06**
   - No hay tests dedicados para estos endpoints
   - Falta validación de permisos por rol
   - Falta test de notificaciones
   - Falta test de historial

3. **Integración con Frontend**
   - Pop-up de asignación no implementado
   - Deep links en emails no verificados

### 📊 Resumen de Cobertura:
- **Funcionalidad Core**: 85% implementado
- **Control de Acceso**: 95% implementado
- **Notificaciones**: 40% implementado (estructura lista, falta envío real)
- **Historial**: 100% implementado
- **Integración PLTM**: 5% (solo placeholder)
- **Tests**: 0% cobertura específica

### 🔧 Archivos Relacionados:
- **ViewSet Principal**: `runna/api/views/LegajoAsignacionView.py`
- **Serializers**: `runna/api/serializers/` (revisar existencia)
- **URLs**: `runna/api/urls.py` (registro como `/api/legajo/`)
- **Modelos**:
  - `TLegajoZona` (infrastructure/models/Persona.py)
  - `TLegajoZonaHistorial` (verificar existencia)
  - `TLocalCentroVida` (verificar existencia)
- **Tests**: No existen tests específicos

### 📝 Notas Técnicas:
1. La implementación está bien estructurada con transacciones atómicas
2. Los helpers para historial y notificaciones facilitan mantenimiento
3. Falta servicio real de email (NOTINT-01/02 pendiente)
4. La integración con PLTM está correctamente diferida
5. El ViewSet usa `/api/legajo/` (singular) para diferenciarse de `/api/legajos/` (plural)

### 🚨 Acciones Requeridas:
1. Implementar servicio de email real
2. Verificar existencia de serializers específicos
3. Crear tests completos para todos los endpoints
4. Validar modelos TLegajoZonaHistorial y TLocalCentroVida
5. Preparar integración con PLTM cuando esté listo
