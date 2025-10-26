# PLTM-02: Acción sobre Actividad del Plan de Trabajo

## 📋 CONTEXTO TÉCNICO

### Estado de Implementación Previo
- ✅ **PLTM-01**: Gestión de Actividades del Plan de Trabajo (TActividadPlanTrabajo completo)
- ✅ **MED-01 → MED-05**: Ciclo completo de Medida (104/104 tests)
- ✅ **LEG-02**: Registro de Legajo (TLegajo completo)
- ✅ Modelos base: `TPlanDeTrabajo`, `TActividadPlanTrabajo`, `TTipoActividadPlanTrabajo`

### Dependencias Críticas de PLTM-01
```python
# Modelo base de actividad ya existe
class TActividadPlanTrabajo(models.Model):
    plan_trabajo = models.ForeignKey(TPlanDeTrabajo, ...)
    tipo_actividad = models.ForeignKey(TTipoActividadPlanTrabajo, ...)
    descripcion = models.TextField()
    fecha_planificacion = models.DateField()
    estado = models.CharField(max_length=50, choices=ESTADOS_ACTIVIDAD)
    responsable = models.ForeignKey(TCustomUser, ...)
    requiere_visado_legales = models.BooleanField(default=False)
    motivo_cancelacion = models.TextField(blank=True, null=True)
    # ... otros campos
```

### Modelos Nuevos a Crear (PLTM-02)
```python
# 1. Comentarios en actividades (con @menciones)
TComentarioActividad

# 2. Adjuntos/evidencias de actividades (con versionado)
TAdjuntoActividad

# 3. Historial inmutable de cambios (auditoría)
THistorialActividad

# 4. Notificaciones de actividad (para @menciones y cambios de estado)
TNotificacionActividad

# 5. Transferencias/derivaciones de actividades a otros equipos
TTransferenciaActividad
```

### Workflow PLTM-02 en Contexto

```mermaid
graph TD
    A[PLTM-01: Actividad creada] --> B{Usuario abre modal de actividad}

    B --> C[Ver detalle completo]
    C --> D[Tabs por actor/responsable]

    D --> E[Acciones disponibles según permisos]

    E --> F[Cambiar estado]
    E --> G[Adjuntar evidencias]
    E --> H[Comentar con @menciones]
    E --> I[Editar campos]
    E --> J[Asignar/modificar responsables]

    F --> K{Validar transición}
    K -->|PI/Oficio sin evidencia| L[Error: Evidencia obligatoria]
    K -->|Sin permisos| M[Error: Solo responsable/JZ/Admin]
    K -->|Estado bloqueado| N[Error: Actividad cerrada]
    K -->|Válido| O[Actualizar estado]

    O --> P{Estado = COMPLETADA?}
    P -->|requiere_visado_legales=True| Q[Auto-transición a PENDIENTE_VISADO]
    P -->|No| R[Mantener COMPLETADA]

    Q --> S[Notificar a Equipo Legal]

    G --> T{Validar evidencia}
    T -->|Actividad grupal| U[Aplicar a todas medidas vinculadas]
    T -->|Individual| V[Aplicar solo a esta medida]

    H --> W{Detectar @menciones}
    W -->|@usuario encontrado| X[Crear TNotificacionActividad]
    X --> Y[Notificar usuario mencionado]
```

## 🎯 DESCRIPCIÓN

**PLTM-02: Acción sobre Actividad** permite al equipo técnico, legal y otros actores interactuar con actividades individuales del Plan de Trabajo, gestionando su ciclo de vida desde un modal detallado. Esta story implementa las **acciones** sobre actividades creadas en PLTM-01.

### Objetivo Principal
Proveer una interfaz completa para ejecutar acciones sobre actividades (cambiar estado, comentar, adjuntar evidencias, reprogramar, transferir entre equipos), manteniendo auditoría inmutable y aplicando reglas de negocio complejas (visado legal, actividades grupales, validaciones de evidencia, permisos de transferencia).

### User Story
**Como** responsable/colaborador de una actividad del Plan de Trabajo, **quiero** abrir la actividad para **ver, comentar, adjuntar evidencias, cambiar estado, reprogramar o transferir a otro equipo**, **para** mantener el seguimiento al día y coordinar con mi equipo.

## 👥 ROLES Y PERMISOS

### Permisos de Edición
- **Responsable de la actividad**: Puede editar todos los campos no bloqueados
- **Jefe Zonal (JZ)** de la zona del legajo: Puede editar y reabrir actividades
- **Director** (Nivel 4+): Puede editar y reabrir actividades de toda la provincia
- **Administrador**: Puede editar y reabrir cualquier actividad

### Permisos de Lectura
- **Todos los roles** con acceso al legajo: Pueden ver actividades
- **Equipo Legal**: Puede visar actividades que requieren visado

### Restricciones por Estado
- **COMPLETADA/CANCELADA/VISADO_APROBADO**: Solo lectura
- **Reapertura**: Solo JZ/Director/Admin pueden reabrir y deben justificar motivo
- **Visado**: Solo Equipo Legal puede aprobar/rechazar desde estado PENDIENTE_VISADO

### Restricciones por Zona
- Usuario debe pertenecer a la zona del legajo (vía `TCustomUserZona`)
- Validación en cada acción crítica

## 📊 ESTADOS Y TRANSICIONES

### Estados Permitidos (reutilizados de PLTM-01)
| Estado | Código | Descripción | Puede Editar |
|--------|--------|-------------|--------------|
| **Pendiente** | `PENDIENTE` | Actividad sin iniciar | ✅ Sí |
| **En Progreso** | `EN_PROGRESO` | Actividad en ejecución | ✅ Sí |
| **Completada** | `COMPLETADA` | Actividad completada exitosamente | ❌ Solo lectura |
| **Pendiente Visado** | `PENDIENTE_VISADO` | Esperando visado Legal | ❌ Solo lectura |
| **Visado con Observación** | `VISADO_CON_OBSERVACION` | Visado rechazado | ✅ Sí (reapertura) |
| **Visado Aprobado** | `VISADO_APROBADO` | Visado aprobado | ❌ Solo lectura |
| **Cancelada** | `CANCELADA` | Actividad cancelada | ❌ Solo lectura |
| **Vencida** | `VENCIDA` | Plazo expirado sin completar | ✅ Sí (reprogramar) |

### Transiciones Válidas (PLTM-02)
```python
TRANSICIONES_PERMITIDAS = {
    'PENDIENTE': ['EN_PROGRESO', 'CANCELADA'],
    'EN_PROGRESO': ['COMPLETADA', 'CANCELADA', 'PENDIENTE'],  # rollback a pendiente
    'COMPLETADA': ['PENDIENTE_VISADO'],  # auto si requiere_visado_legales=True
    'PENDIENTE_VISADO': ['VISADO_APROBADO', 'VISADO_CON_OBSERVACION'],  # solo Legal
    'VISADO_CON_OBSERVACION': ['EN_PROGRESO'],  # reapertura con observaciones
    'VENCIDA': ['EN_PROGRESO', 'CANCELADA'],  # reprogramar
    # CANCELADA no puede transicionar (requiere reapertura manual)
}
```

### Validaciones de Transición
1. **Completar actividad de PI/Oficio**: Requiere al menos 1 adjunto en `TAdjuntoActividad`
2. **Cancelar actividad**: Requiere `motivo_cancelacion` (TextField no vacío)
3. **Aprobar visado**: Solo usuarios con `legal=True`
4. **Reabrir actividad cerrada**: Solo JZ/Director/Admin + motivo de reapertura

## 🏗️ ESTRUCTURA DE MODELOS

### Modelo Nuevo: `TComentarioActividad`

```python
# infrastructure/models/medida/TComentarioActividad.py

from django.db import models
from django.contrib.auth import get_user_model
from django.utils.timezone import now

TCustomUser = get_user_model()

class TComentarioActividad(models.Model):
    """
    Comentarios en actividades del Plan de Trabajo.
    Soporta @menciones para notificaciones.
    Historial cronológico inmutable.
    """
    actividad = models.ForeignKey(
        'TActividadPlanTrabajo',
        on_delete=models.CASCADE,
        related_name='comentarios'
    )
    autor = models.ForeignKey(
        TCustomUser,
        on_delete=models.PROTECT,
        related_name='comentarios_actividades'
    )
    texto = models.TextField(
        help_text="Texto del comentario. Soporta @menciones con formato @username"
    )
    menciones = models.ManyToManyField(
        TCustomUser,
        related_name='menciones_actividades',
        blank=True,
        help_text="Usuarios mencionados con @ en el comentario"
    )
    fecha_creacion = models.DateTimeField(default=now, editable=False)
    editado = models.BooleanField(default=False)
    fecha_edicion = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 't_comentario_actividad'
        ordering = ['fecha_creacion']
        verbose_name = "Comentario de Actividad"
        verbose_name_plural = "Comentarios de Actividades"
        indexes = [
            models.Index(fields=['actividad', 'fecha_creacion']),
            models.Index(fields=['autor']),
        ]

    def __str__(self):
        return f"Comentario de {self.autor.username} en actividad {self.actividad.id}"

    def extraer_menciones(self):
        """
        Extrae usuarios mencionados con @username del texto.
        Retorna QuerySet de TCustomUser.
        """
        import re
        # Regex para @username (alfanumérico, guiones, puntos)
        menciones_raw = re.findall(r'@([\w.-]+)', self.texto)
        return TCustomUser.objects.filter(username__in=menciones_raw)
```

### Modelo Nuevo: `TAdjuntoActividad`

```python
# infrastructure/models/medida/TAdjuntoActividad.py

from django.db import models
from django.contrib.auth import get_user_model
from django.utils.timezone import now
import os

TCustomUser = get_user_model()

def upload_to_actividad(instance, filename):
    """
    Ruta de almacenamiento: uploads/actividades/{actividad_id}/{timestamp}_{filename}
    """
    timestamp = now().strftime('%Y%m%d_%H%M%S')
    return f'uploads/actividades/{instance.actividad.id}/{timestamp}_{filename}'

class TAdjuntoActividad(models.Model):
    """
    Archivos adjuntos/evidencias de actividades.
    Soporta versionado por reemplazo (histórico inmutable).
    Obligatorios para completar actividades de PI/Oficios.
    """
    actividad = models.ForeignKey(
        'TActividadPlanTrabajo',
        on_delete=models.CASCADE,
        related_name='adjuntos'
    )
    archivo = models.FileField(
        upload_to=upload_to_actividad,
        max_length=500
    )
    nombre_original = models.CharField(max_length=255)
    tipo_mime = models.CharField(max_length=100, blank=True)
    tamanio_bytes = models.BigIntegerField(default=0)

    # Metadatos de carga
    subido_por = models.ForeignKey(
        TCustomUser,
        on_delete=models.PROTECT,
        related_name='adjuntos_actividades'
    )
    fecha_subida = models.DateTimeField(default=now, editable=False)

    # Versionado
    version = models.PositiveIntegerField(default=1)
    reemplaza_a = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reemplazado_por'
    )
    activo = models.BooleanField(
        default=True,
        help_text="False si fue reemplazado por otra versión"
    )

    # Categorización (opcional)
    TIPOS_ADJUNTO = [
        ('EVIDENCIA', 'Evidencia de Ejecución'),
        ('ACTA', 'Acta de Reunión'),
        ('INFORME', 'Informe Técnico'),
        ('FOTO', 'Fotografía'),
        ('OFICIO', 'Oficio Judicial'),
        ('OTRO', 'Otro'),
    ]
    tipo_adjunto = models.CharField(
        max_length=20,
        choices=TIPOS_ADJUNTO,
        default='EVIDENCIA'
    )

    class Meta:
        db_table = 't_adjunto_actividad'
        ordering = ['-fecha_subida']
        verbose_name = "Adjunto de Actividad"
        verbose_name_plural = "Adjuntos de Actividades"
        indexes = [
            models.Index(fields=['actividad', 'activo']),
            models.Index(fields=['subido_por']),
        ]

    def __str__(self):
        return f"{self.nombre_original} (v{self.version}) - Actividad {self.actividad.id}"

    def save(self, *args, **kwargs):
        if not self.nombre_original and self.archivo:
            self.nombre_original = os.path.basename(self.archivo.name)
        if self.archivo:
            self.tamanio_bytes = self.archivo.size
        super().save(*args, **kwargs)
```

### Modelo Nuevo: `THistorialActividad`

```python
# infrastructure/models/medida/THistorialActividad.py

from django.db import models
from django.contrib.auth import get_user_model
from django.utils.timezone import now

TCustomUser = get_user_model()

class THistorialActividad(models.Model):
    """
    Historial inmutable de cambios en actividades.
    Auditoría completa de transiciones de estado, ediciones, reaperturas.
    """
    actividad = models.ForeignKey(
        'TActividadPlanTrabajo',
        on_delete=models.CASCADE,
        related_name='historial'
    )
    usuario = models.ForeignKey(
        TCustomUser,
        on_delete=models.PROTECT,
        related_name='historial_actividades'
    )
    fecha_accion = models.DateTimeField(default=now, editable=False)

    # Tipo de acción
    TIPOS_ACCION = [
        ('CREACION', 'Creación de Actividad'),
        ('CAMBIO_ESTADO', 'Cambio de Estado'),
        ('EDICION_CAMPOS', 'Edición de Campos'),
        ('REAPERTURA', 'Reapertura de Actividad'),
        ('ASIGNACION', 'Asignación de Responsable'),
        ('ADJUNTO_AGREGADO', 'Adjunto Agregado'),
        ('COMENTARIO', 'Comentario Agregado'),
        ('VISADO_APROBADO', 'Visado Aprobado'),
        ('VISADO_RECHAZADO', 'Visado Rechazado'),
        ('TRANSFERENCIA', 'Transferencia de Equipo'),
    ]
    tipo_accion = models.CharField(max_length=30, choices=TIPOS_ACCION)

    # Cambios realizados (JSON con before/after)
    estado_anterior = models.CharField(max_length=50, blank=True, null=True)
    estado_nuevo = models.CharField(max_length=50, blank=True, null=True)
    campos_modificados = models.JSONField(
        default=dict,
        blank=True,
        help_text="{'campo': {'antes': valor_anterior, 'despues': valor_nuevo}}"
    )

    # Motivo/comentario de la acción
    motivo = models.TextField(
        blank=True,
        help_text="Motivo de cancelación, reapertura u observaciones"
    )

    # IP y metadatos de auditoría
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table = 't_historial_actividad'
        ordering = ['-fecha_accion']
        verbose_name = "Historial de Actividad"
        verbose_name_plural = "Historiales de Actividades"
        indexes = [
            models.Index(fields=['actividad', 'fecha_accion']),
            models.Index(fields=['usuario']),
            models.Index(fields=['tipo_accion']),
        ]

    def __str__(self):
        return f"{self.tipo_accion} - {self.usuario.username} - {self.fecha_accion}"
```

### Modelo Nuevo: `TNotificacionActividad`

```python
# infrastructure/models/medida/TNotificacionActividad.py

from django.db import models
from django.contrib.auth import get_user_model
from django.utils.timezone import now

TCustomUser = get_user_model()

class TNotificacionActividad(models.Model):
    """
    Notificaciones de actividades (dentro de la aplicación y email).
    Se genera en:
    - Creación de actividad
    - Cambio de estado
    - @menciones en comentarios
    - Requerimiento de visado legal
    """
    actividad = models.ForeignKey(
        'TActividadPlanTrabajo',
        on_delete=models.CASCADE,
        related_name='notificaciones'
    )
    destinatario = models.ForeignKey(
        TCustomUser,
        on_delete=models.CASCADE,
        related_name='notificaciones_actividades'
    )

    # Tipo de notificación
    TIPOS_NOTIFICACION = [
        ('CREACION', 'Actividad Creada'),
        ('ASIGNACION', 'Asignado como Responsable'),
        ('CAMBIO_ESTADO', 'Cambio de Estado'),
        ('MENCION', 'Mencionado en Comentario'),
        ('VISADO_REQUERIDO', 'Visado Legal Requerido'),
        ('VISADO_RESUELTO', 'Visado Resuelto'),
        ('VENCIMIENTO_PROXIMO', 'Vencimiento Próximo'),
        ('TRANSFERENCIA', 'Actividad Transferida'),
    ]
    tipo_notificacion = models.CharField(max_length=30, choices=TIPOS_NOTIFICACION)

    # Contenido
    titulo = models.CharField(max_length=200)
    mensaje = models.TextField()
    enlace = models.CharField(
        max_length=500,
        blank=True,
        help_text="Deep-link a la actividad o recurso relacionado"
    )

    # Estado de lectura
    leida = models.BooleanField(default=False)
    fecha_creacion = models.DateTimeField(default=now, editable=False)
    fecha_lectura = models.DateTimeField(null=True, blank=True)

    # Email enviado
    email_enviado = models.BooleanField(default=False)
    fecha_email = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 't_notificacion_actividad'
        ordering = ['-fecha_creacion']
        verbose_name = "Notificación de Actividad"
        verbose_name_plural = "Notificaciones de Actividades"
        indexes = [
            models.Index(fields=['destinatario', 'leida']),
            models.Index(fields=['actividad']),
        ]

    def __str__(self):
        return f"{self.titulo} - {self.destinatario.username}"
```

### Modelo Nuevo: `TTransferenciaActividad`

```python
# infrastructure/models/medida/TTransferenciaActividad.py

from django.db import models
from django.contrib.auth import get_user_model
from django.utils.timezone import now

TCustomUser = get_user_model()

class TTransferenciaActividad(models.Model):
    """
    Historial de transferencias/derivaciones de actividades entre equipos.

    Lógica de negocio:
    - Solo JZ/Director (nivel 3-4) pueden transferir actividades
    - Equipo de trabajo responsable del legajo puede transferir a otro equipo
    - Dentro del nuevo equipo, el JZ asigna responsables específicos
    - Transferencia queda en historial inmutable
    """
    actividad = models.ForeignKey(
        'TActividadPlanTrabajo',
        on_delete=models.CASCADE,
        related_name='transferencias'
    )

    # Equipos involucrados
    equipo_origen = models.ForeignKey(
        'TCustomUserZona',  # Representa equipo de trabajo (grupo de usuarios en una zona)
        on_delete=models.PROTECT,
        related_name='transferencias_actividad_origen',
        help_text="Equipo que transfiere la actividad"
    )
    equipo_destino = models.ForeignKey(
        'TCustomUserZona',
        on_delete=models.PROTECT,
        related_name='transferencias_actividad_destino',
        help_text="Equipo que recibe la actividad"
    )

    # Responsables involucrados
    responsable_anterior = models.ForeignKey(
        TCustomUser,
        on_delete=models.PROTECT,
        related_name='actividades_transferidas_desde',
        null=True,
        blank=True,
        help_text="Responsable anterior de la actividad"
    )
    responsable_nuevo = models.ForeignKey(
        TCustomUser,
        on_delete=models.PROTECT,
        related_name='actividades_transferidas_hacia',
        null=True,
        blank=True,
        help_text="Nuevo responsable asignado (puede ser null si el JZ del equipo destino asigna después)"
    )

    # Auditoría de la transferencia
    transferido_por = models.ForeignKey(
        TCustomUser,
        on_delete=models.PROTECT,
        related_name='transferencias_realizadas',
        help_text="Usuario JZ/Director que autorizó la transferencia"
    )
    fecha_transferencia = models.DateTimeField(default=now, editable=False)

    # Motivo de transferencia
    motivo = models.TextField(
        help_text="Motivo de la transferencia (ej: 'Competencia técnica específica del equipo X')"
    )

    # Estado de aceptación (opcional - para flujo de aprobación)
    ESTADOS_TRANSFERENCIA = [
        ('PENDIENTE', 'Pendiente de Aceptación'),
        ('ACEPTADA', 'Aceptada por Equipo Destino'),
        ('RECHAZADA', 'Rechazada por Equipo Destino'),
        ('COMPLETADA', 'Transferencia Completada'),
    ]
    estado_transferencia = models.CharField(
        max_length=20,
        choices=ESTADOS_TRANSFERENCIA,
        default='COMPLETADA',  # Por defecto es inmediata, puede configurarse con flujo de aprobación
        help_text="Estado del proceso de transferencia"
    )

    # Metadatos
    observaciones = models.TextField(
        blank=True,
        help_text="Observaciones del equipo destino (en caso de rechazo o aceptación condicionada)"
    )

    class Meta:
        db_table = 't_transferencia_actividad'
        ordering = ['-fecha_transferencia']
        verbose_name = "Transferencia de Actividad"
        verbose_name_plural = "Transferencias de Actividades"
        indexes = [
            models.Index(fields=['actividad', 'fecha_transferencia']),
            models.Index(fields=['transferido_por']),
            models.Index(fields=['equipo_origen', 'equipo_destino']),
        ]

    def __str__(self):
        return f"Transferencia actividad {self.actividad.id}: {self.equipo_origen} → {self.equipo_destino}"

    def clean(self):
        from django.core.exceptions import ValidationError

        # Validar que transferido_por sea JZ o Director
        if self.transferido_por.nivel < 3:
            raise ValidationError(
                "Solo usuarios nivel 3+ (JZ/Director) pueden transferir actividades"
            )

        # Validar que equipos origen y destino sean diferentes
        if self.equipo_origen == self.equipo_destino:
            raise ValidationError(
                "El equipo de origen y destino deben ser diferentes"
            )
```

## 🔌 ENDPOINTS

### 1. Cambiar Estado de Actividad

**Endpoint**: `PATCH /api/actividades/{id}/cambiar-estado/`

**Permisos**: `IsAuthenticated`, responsable de actividad, JZ/Director/Admin de la zona

**Request Body**:
```json
{
  "nuevo_estado": "EN_PROGRESO",
  "motivo": "Iniciando visita domiciliaria" // Opcional, obligatorio para CANCELADA
}
```

**Response 200 OK**:
```json
{
  "id": 123,
  "estado": "EN_PROGRESO",
  "estado_anterior": "PENDIENTE",
  "fecha_cambio": "2025-10-25T14:30:00Z",
  "cambiado_por": {
    "id": 5,
    "username": "tecnico_zona1",
    "nombre_completo": "Juan Pérez"
  },
  "historial_id": 456
}
```

**Errores**:
- `400`: Transición inválida (ej. PENDIENTE → COMPLETADA directo)
- `400`: Falta evidencia obligatoria para completar actividad de PI/Oficio
- `400`: Falta motivo de cancelación
- `403`: Usuario sin permisos para cambiar estado
- `404`: Actividad no existe
- `409`: Actividad en estado bloqueado (COMPLETADA, CANCELADA, VISADO_APROBADO)

### 2. Agregar Comentario (con @menciones)

**Endpoint**: `POST /api/actividades/{id}/comentarios/`

**Permisos**: `IsAuthenticated`, acceso al legajo

**Request Body**:
```json
{
  "texto": "Reunión exitosa con la familia. @jz_zona1 revisar informe adjunto."
}
```

**Response 201 Created**:
```json
{
  "id": 789,
  "actividad_id": 123,
  "autor": {
    "id": 5,
    "username": "tecnico_zona1",
    "nombre_completo": "Juan Pérez"
  },
  "texto": "Reunión exitosa con la familia. @jz_zona1 revisar informe adjunto.",
  "menciones": [
    {
      "id": 3,
      "username": "jz_zona1",
      "nombre_completo": "María González"
    }
  ],
  "fecha_creacion": "2025-10-25T14:35:00Z",
  "editado": false,
  "notificaciones_enviadas": 1
}
```

**Lógica de Backend**:
1. Extraer @menciones con regex `r'@([\w.-]+)'`
2. Validar que usuarios mencionados existen
3. Crear `TComentarioActividad`
4. Crear `TNotificacionActividad` para cada mención (tipo `MENCION`)
5. Crear entrada en `THistorialActividad` (tipo `COMENTARIO`)

### 3. Adjuntar Evidencia

**Endpoint**: `POST /api/actividades/{id}/adjuntos/`

**Permisos**: `IsAuthenticated`, responsable de actividad, JZ/Director/Admin de la zona

**Request**: `multipart/form-data`
```
archivo: [FILE]
tipo_adjunto: "EVIDENCIA" // Opcional
```

**Response 201 Created**:
```json
{
  "id": 321,
  "actividad_id": 123,
  "archivo": "/media/uploads/actividades/123/20251025_143000_informe.pdf",
  "nombre_original": "informe.pdf",
  "tipo_mime": "application/pdf",
  "tamanio_bytes": 2048576,
  "tipo_adjunto": "EVIDENCIA",
  "version": 1,
  "subido_por": {
    "id": 5,
    "username": "tecnico_zona1"
  },
  "fecha_subida": "2025-10-25T14:30:00Z",
  "activo": true
}
```

**Validaciones**:
- Tamaño máximo: 10 MB
- Tipos MIME permitidos: PDF, JPG, PNG, DOCX
- Si actividad es de PI/Oficio: obligatorio para completar

### 4. Listar Adjuntos de Actividad

**Endpoint**: `GET /api/actividades/{id}/adjuntos/`

**Permisos**: `IsAuthenticated`, acceso al legajo

**Query Params**:
- `activo=true` (default): Solo adjuntos activos (no reemplazados)
- `activo=false`: Incluir adjuntos históricos reemplazados

**Response 200 OK**:
```json
{
  "count": 2,
  "results": [
    {
      "id": 321,
      "nombre_original": "informe_v2.pdf",
      "tipo_adjunto": "INFORME",
      "version": 2,
      "reemplaza_a": 320,
      "activo": true,
      "fecha_subida": "2025-10-25T15:00:00Z"
    },
    {
      "id": 320,
      "nombre_original": "informe_v1.pdf",
      "tipo_adjunto": "INFORME",
      "version": 1,
      "activo": false,
      "fecha_subida": "2025-10-25T14:00:00Z"
    }
  ]
}
```

### 5. Reabrir Actividad Cerrada

**Endpoint**: `POST /api/actividades/{id}/reabrir/`

**Permisos**: `IsAuthenticated`, JZ/Director/Admin solamente

**Request Body**:
```json
{
  "motivo": "Error en carga de evidencia, requiere corrección"
}
```

**Response 200 OK**:
```json
{
  "id": 123,
  "estado": "EN_PROGRESO",
  "estado_anterior": "COMPLETADA",
  "reabierta_por": {
    "id": 3,
    "username": "jz_zona1",
    "nivel": 3
  },
  "motivo_reapertura": "Error en carga de evidencia, requiere corrección",
  "fecha_reapertura": "2025-10-25T16:00:00Z"
}
```

**Validaciones**:
- Usuario debe ser JZ (nivel 3+), Director (nivel 4+) o Admin
- Motivo obligatorio (mínimo 10 caracteres)
- Estado anterior debe ser COMPLETADA, CANCELADA o VISADO_APROBADO

### 6. Visar Actividad (Equipo Legal)

**Endpoint**: `POST /api/actividades/{id}/visar/`

**Permisos**: `IsAuthenticated`, `legal=True` en perfil usuario

**Request Body**:
```json
{
  "aprobado": true,
  "observaciones": "Adjunto acuse judicial firmado" // Opcional si aprobado=false
}
```

**Response 200 OK**:
```json
{
  "id": 123,
  "estado": "VISADO_APROBADO",
  "estado_anterior": "PENDIENTE_VISADO",
  "visado_por": {
    "id": 8,
    "username": "legal_zona1",
    "legal": true
  },
  "observaciones": "Adjunto acuse judicial firmado",
  "fecha_visado": "2025-10-25T17:00:00Z"
}
```

**Validaciones**:
- Usuario debe tener `legal=True`
- Estado actual debe ser `PENDIENTE_VISADO`
- Si `aprobado=false`, observaciones son obligatorias

### 7. Obtener Historial Completo de Actividad

**Endpoint**: `GET /api/actividades/{id}/historial/`

**Permisos**: `IsAuthenticated`, acceso al legajo

**Response 200 OK**:
```json
{
  "count": 5,
  "results": [
    {
      "id": 789,
      "tipo_accion": "CAMBIO_ESTADO",
      "usuario": {
        "id": 5,
        "username": "tecnico_zona1"
      },
      "fecha_accion": "2025-10-25T14:30:00Z",
      "estado_anterior": "PENDIENTE",
      "estado_nuevo": "EN_PROGRESO",
      "motivo": "Iniciando visita domiciliaria"
    },
    {
      "id": 788,
      "tipo_accion": "ADJUNTO_AGREGADO",
      "usuario": {
        "id": 5,
        "username": "tecnico_zona1"
      },
      "fecha_accion": "2025-10-25T14:35:00Z",
      "campos_modificados": {
        "adjunto_id": 321,
        "nombre_archivo": "informe.pdf"
      }
    }
  ]
}
```

### 8. Transferir/Derivar Actividad a Otro Equipo

**Endpoint**: `POST /api/actividades/{id}/transferir/`

**Permisos**: `IsAuthenticated`, JZ/Director (nivel 3-4) solamente

**Request Body**:
```json
{
  "equipo_destino_id": 15,
  "responsable_nuevo_id": 42,  // Opcional - puede asignarse después por JZ del equipo destino
  "motivo": "Equipo técnico especializado en adicciones",
  "estado_transferencia": "COMPLETADA"  // Opcional - default COMPLETADA (inmediata)
}
```

**Response 201 Created**:
```json
{
  "id": 567,
  "actividad_id": 123,
  "equipo_origen": {
    "id": 10,
    "nombre": "Equipo Técnico Zona 1",
    "zona": "Zona 1"
  },
  "equipo_destino": {
    "id": 15,
    "nombre": "Equipo Especializado Adicciones",
    "zona": "Zona 2"
  },
  "responsable_anterior": {
    "id": 5,
    "username": "tecnico_zona1",
    "nombre_completo": "Juan Pérez"
  },
  "responsable_nuevo": {
    "id": 42,
    "username": "especialista_adicciones",
    "nombre_completo": "María López"
  },
  "transferido_por": {
    "id": 3,
    "username": "jz_zona1",
    "nivel": 3
  },
  "fecha_transferencia": "2025-10-25T18:00:00Z",
  "motivo": "Equipo técnico especializado en adicciones",
  "estado_transferencia": "COMPLETADA",
  "observaciones": ""
}
```

**Lógica de Backend**:
1. Validar que usuario sea JZ/Director (nivel 3-4)
2. Validar que equipo origen y destino sean diferentes
3. Crear `TTransferenciaActividad`
4. Actualizar `TActividadPlanTrabajo.responsable` (si responsable_nuevo especificado)
5. Crear entrada en `THistorialActividad` (tipo `TRANSFERENCIA`)
6. Crear `TNotificacionActividad` para:
   - Responsable anterior (informar de transferencia)
   - Responsable nuevo (si especificado - informar asignación)
   - JZ del equipo destino (si responsable_nuevo=null - para que asigne responsable)
7. Si `estado_transferencia=PENDIENTE`, esperar aceptación del equipo destino

**Validaciones**:
- Usuario debe ser nivel 3+ (JZ/Director)
- Motivo obligatorio (mínimo 15 caracteres)
- Equipo destino debe existir y ser diferente al origen
- Responsable nuevo (si especificado) debe pertenecer al equipo destino

**Errores**:
- `403`: Usuario sin permisos (nivel < 3)
- `400`: Equipo origen y destino son iguales
- `400`: Responsable nuevo no pertenece al equipo destino
- `400`: Motivo demasiado corto o vacío
- `404`: Actividad no existe
- `404`: Equipo destino no existe

### 9. Listar Transferencias de Actividad

**Endpoint**: `GET /api/actividades/{id}/transferencias/`

**Permisos**: `IsAuthenticated`, acceso al legajo

**Response 200 OK**:
```json
{
  "count": 3,
  "results": [
    {
      "id": 567,
      "equipo_origen": {"id": 10, "nombre": "Equipo Técnico Zona 1"},
      "equipo_destino": {"id": 15, "nombre": "Equipo Especializado Adicciones"},
      "responsable_anterior": {"id": 5, "username": "tecnico_zona1"},
      "responsable_nuevo": {"id": 42, "username": "especialista_adicciones"},
      "transferido_por": {"id": 3, "username": "jz_zona1"},
      "fecha_transferencia": "2025-10-25T18:00:00Z",
      "motivo": "Equipo técnico especializado en adicciones",
      "estado_transferencia": "COMPLETADA"
    },
    {
      "id": 566,
      "equipo_origen": {"id": 8, "nombre": "Equipo Legal Zona 1"},
      "equipo_destino": {"id": 10, "nombre": "Equipo Técnico Zona 1"},
      "fecha_transferencia": "2025-10-20T10:00:00Z",
      "estado_transferencia": "COMPLETADA"
    }
  ]
}
```

## 📝 CRITERIOS DE ACEPTACIÓN

### CA-01: Notificación a Legales (Crítico) ✅
**DADO** una actividad con `tipo_actividad.requiere_visado_legales=True`
**CUANDO** el responsable cambia estado a `COMPLETADA`
**ENTONCES**:
1. Sistema auto-transiciona estado a `PENDIENTE_VISADO`
2. Crea `TNotificacionActividad` para todos los usuarios con `legal=True` de la zona
3. Email se envía a equipo legal con deep-link a actividad
4. Actividad queda bloqueada hasta visado

**Tests**:
- `test_completar_actividad_con_visado_legal_auto_transicion`
- `test_notificacion_legal_se_crea_correctamente`
- `test_email_enviado_a_equipo_legal`
- `test_actividad_bloqueada_hasta_visado`

---

### CA-02: Gestión de Actividades en Grupo (Crítico) ✅
**DADO** una actividad marcada como `actividad_grupal=True` con varias medidas vinculadas
**CUANDO** el responsable:
- Cambia estado a `COMPLETADA`
- Adjunta evidencia
- Agrega comentario
**ENTONCES**:
1. Acción se replica a todas las actividades del grupo de medidas vinculadas
2. Historial se crea para cada actividad del grupo
3. Notificaciones se envían a responsables de cada medida vinculada

**Tests**:
- `test_cambio_estado_actividad_grupal_replica_a_todas`
- `test_adjunto_actividad_grupal_aplica_a_grupo`
- `test_comentario_actividad_grupal_replica_a_todas`
- `test_notificaciones_grupo_se_envian_a_todos_responsables`

---

### CA-03: Permisos de Edición ✅
**DADO** un usuario autenticado
**CUANDO** intenta editar una actividad
**ENTONCES**:
1. **Permitido** si es responsable de la actividad
2. **Permitido** si es JZ de la zona del legajo
3. **Permitido** si es Director (nivel 4+)
4. **Permitido** si es Administrador
5. **Denegado** (403) para cualquier otro usuario

**Tests**:
- `test_responsable_puede_editar_actividad`
- `test_jz_puede_editar_actividad_de_su_zona`
- `test_director_puede_editar_cualquier_actividad`
- `test_admin_puede_editar_cualquier_actividad`
- `test_usuario_sin_permisos_no_puede_editar`

---

### CA-04: Transiciones de Estado Válidas ✅
**DADO** una actividad en estado `X`
**CUANDO** se intenta cambiar a estado `Y`
**ENTONCES**:
1. **Válido**: Transiciones permitidas en `TRANSICIONES_PERMITIDAS`
2. **Inválido** (400): Transiciones no permitidas (ej. PENDIENTE → COMPLETADA)
3. **CANCELADA** requiere `motivo_cancelacion` no vacío
4. **COMPLETADA** de PI/Oficio requiere al menos 1 adjunto

**Tests**:
- `test_transicion_pendiente_a_en_progreso_valida`
- `test_transicion_en_progreso_a_completada_valida`
- `test_transicion_invalida_pendiente_a_completada`
- `test_cancelar_sin_motivo_falla`
- `test_completar_actividad_pi_sin_adjunto_falla`
- `test_completar_actividad_pi_con_adjunto_exitosa`

---

### CA-05: Auditoría e Inmutabilidad ✅
**DADO** cualquier acción sobre una actividad
**CUANDO** se ejecuta la acción
**ENTONCES**:
1. Se crea entrada en `THistorialActividad` con:
   - `usuario` que ejecutó la acción
   - `fecha_accion` (timestamp automático)
   - `tipo_accion` correspondiente
   - `campos_modificados` (JSON before/after)
   - `ip_address` y `user_agent`
2. Historial es **inmutable** (no se puede editar ni eliminar)
3. Orden cronológico garantizado por `ordering = ['-fecha_accion']`

**Tests**:
- `test_historial_se_crea_en_cambio_estado`
- `test_historial_registra_usuario_y_fecha`
- `test_historial_es_inmutable`
- `test_historial_orden_cronologico`

---

### CA-06: Gestión de Adjuntos ✅
**DADO** un usuario autorizado
**CUANDO** adjunta un archivo a la actividad
**ENTONCES**:
1. Archivo se guarda en `uploads/actividades/{actividad_id}/`
2. `nombre_original`, `tipo_mime`, `tamanio_bytes` se extraen automáticamente
3. `version=1` para primer adjunto
4. Si reemplaza adjunto existente: `version` incrementa, adjunto anterior marca `activo=False`
5. Vista previa y descarga disponibles vía endpoint `/api/actividades/{id}/adjuntos/{adjunto_id}/descargar/`

**Tests**:
- `test_adjuntar_archivo_crea_registro_correcto`
- `test_metadatos_adjunto_se_extraen_automaticamente`
- `test_versionado_adjunto_incrementa_version`
- `test_adjunto_anterior_marca_inactivo_al_reemplazar`
- `test_descargar_adjunto_retorna_archivo`

---

### CA-07: Notificaciones ✅
**DADO** diferentes eventos en la actividad
**CUANDO** ocurre el evento
**ENTONCES**:
1. **Creación actividad**: Notifica a responsable asignado
2. **Cambio estado**: Notifica a responsable y observadores
3. **@mención en comentario**: Notifica a usuarios mencionados
4. **Visado requerido**: Notifica a equipo legal
5. Notificación incluye:
   - `titulo` descriptivo
   - `mensaje` con detalles
   - `enlace` (deep-link a actividad)
   - `email_enviado=True` si se envió email

**Tests**:
- `test_notificacion_creacion_actividad`
- `test_notificacion_cambio_estado`
- `test_notificacion_mencion_en_comentario`
- `test_notificacion_visado_legal_requerido`
- `test_email_se_envia_en_notificaciones`

---

### CA-08: Bloqueo de Actividades ✅
**DADO** una actividad en estado `COMPLETADA`, `CANCELADA` o `VISADO_APROBADO`
**CUANDO** un usuario intenta editar
**ENTONCES**:
1. **Lectura permitida** para todos
2. **Edición denegada** (409 Conflict) con mensaje "Actividad cerrada"
3. **Reapertura permitida** solo para JZ/Director/Admin con motivo
4. Reapertura cambia estado a `EN_PROGRESO` y crea entrada en historial

**Tests**:
- `test_actividad_completada_solo_lectura`
- `test_editar_actividad_completada_falla`
- `test_reabrir_actividad_por_jz_exitosa`
- `test_reabrir_actividad_sin_motivo_falla`
- `test_reabrir_actividad_por_usuario_sin_permisos_falla`

---

### CA-09: Transferencia de Actividades entre Equipos (Crítico) ✅
**DADO** un usuario JZ/Director (nivel 3-4) del equipo responsable del legajo
**CUANDO** transfiere una actividad a otro equipo
**ENTONCES**:
1. Sistema crea `TTransferenciaActividad` con:
   - `equipo_origen` (equipo actual del legajo)
   - `equipo_destino` (equipo especificado)
   - `responsable_anterior` (responsable actual de la actividad)
   - `responsable_nuevo` (si especificado, null si JZ destino asigna después)
   - `transferido_por` (usuario que autoriza transferencia)
   - `motivo` (obligatorio, mínimo 15 caracteres)
2. Actualiza `TActividadPlanTrabajo.responsable` al nuevo responsable (si especificado)
3. Crea entrada en `THistorialActividad` tipo `TRANSFERENCIA`
4. Crea `TNotificacionActividad` para:
   - Responsable anterior (informar transferencia saliente)
   - Responsable nuevo (si especificado - informar asignación)
   - JZ del equipo destino (si responsable_nuevo=null - para asignar responsable)
5. Transferencia queda en historial **inmutable** de la actividad
6. Solo usuarios nivel 3+ pueden transferir (validación estricta)

**Validaciones**:
- Usuario debe ser nivel 3+ (JZ/Director)
- Equipo origen ≠ equipo destino
- Motivo obligatorio (mínimo 15 caracteres)
- Responsable nuevo (si especificado) debe pertenecer al equipo destino

**Tests**:
- `test_jz_puede_transferir_actividad_a_otro_equipo`
- `test_director_puede_transferir_actividad_cualquier_equipo`
- `test_transferir_actividad_sin_responsable_nuevo`
- `test_transferir_actividad_con_responsable_nuevo`
- `test_transferencia_crea_notificaciones_correctas`
- `test_transferencia_sin_motivo_falla`
- `test_transferencia_motivo_corto_falla`
- `test_usuario_sin_permisos_no_puede_transferir`
- `test_transferencia_equipo_origen_igual_destino_falla`
- `test_responsable_nuevo_no_pertenece_equipo_destino_falla`
- `test_historial_transferencia_es_inmutable`

---

## 🧪 TEST CASES COMPLETOS

### Tests de Transiciones de Estado (5 tests)

```python
# tests/test_pltm02_transiciones.py

def test_transicion_pendiente_a_en_progreso_valida():
    """Transición PENDIENTE → EN_PROGRESO debe ser exitosa"""
    actividad = crear_actividad_pendiente()

    response = client.patch(
        f'/api/actividades/{actividad.id}/cambiar-estado/',
        {'nuevo_estado': 'EN_PROGRESO'},
        **headers_responsable
    )

    assert response.status_code == 200
    actividad.refresh_from_db()
    assert actividad.estado == 'EN_PROGRESO'
    assert THistorialActividad.objects.filter(
        actividad=actividad,
        tipo_accion='CAMBIO_ESTADO',
        estado_anterior='PENDIENTE',
        estado_nuevo='EN_PROGRESO'
    ).exists()

def test_transicion_en_progreso_a_completada_valida():
    """Transición EN_PROGRESO → COMPLETADA debe ser exitosa"""
    actividad = crear_actividad_en_progreso()

    response = client.patch(
        f'/api/actividades/{actividad.id}/cambiar-estado/',
        {'nuevo_estado': 'COMPLETADA'},
        **headers_responsable
    )

    assert response.status_code == 200
    actividad.refresh_from_db()
    assert actividad.estado == 'COMPLETADA'

def test_transicion_invalida_pendiente_a_completada():
    """Transición directa PENDIENTE → COMPLETADA debe fallar"""
    actividad = crear_actividad_pendiente()

    response = client.patch(
        f'/api/actividades/{actividad.id}/cambiar-estado/',
        {'nuevo_estado': 'COMPLETADA'},
        **headers_responsable
    )

    assert response.status_code == 400
    assert 'Transición no permitida' in response.data['error']

def test_cancelar_sin_motivo_falla():
    """Cancelar actividad sin motivo debe retornar 400"""
    actividad = crear_actividad_pendiente()

    response = client.patch(
        f'/api/actividades/{actividad.id}/cambiar-estado/',
        {'nuevo_estado': 'CANCELADA'},  # Sin motivo
        **headers_responsable
    )

    assert response.status_code == 400
    assert 'motivo_cancelacion es obligatorio' in response.data['error']

def test_cancelar_con_motivo_exitosa():
    """Cancelar actividad con motivo debe ser exitosa"""
    actividad = crear_actividad_en_progreso()

    response = client.patch(
        f'/api/actividades/{actividad.id}/cambiar-estado/',
        {
            'nuevo_estado': 'CANCELADA',
            'motivo': 'Familia no contactada en 3 intentos'
        },
        **headers_responsable
    )

    assert response.status_code == 200
    actividad.refresh_from_db()
    assert actividad.estado == 'CANCELADA'
    assert actividad.motivo_cancelacion == 'Familia no contactada en 3 intentos'
```

### Tests de Evidencias Obligatorias (3 tests)

```python
def test_completar_actividad_pi_sin_adjunto_falla():
    """Completar actividad de PI sin adjunto debe fallar"""
    actividad = crear_actividad_pi_en_progreso()  # origen='PI'

    response = client.patch(
        f'/api/actividades/{actividad.id}/cambiar-estado/',
        {'nuevo_estado': 'COMPLETADA'},
        **headers_responsable
    )

    assert response.status_code == 400
    assert 'Evidencia obligatoria' in response.data['error']

def test_completar_actividad_pi_con_adjunto_exitosa():
    """Completar actividad de PI con adjunto debe ser exitosa"""
    actividad = crear_actividad_pi_en_progreso()
    adjuntar_evidencia(actividad)  # Crear TAdjuntoActividad

    response = client.patch(
        f'/api/actividades/{actividad.id}/cambiar-estado/',
        {'nuevo_estado': 'COMPLETADA'},
        **headers_responsable
    )

    assert response.status_code == 200
    assert actividad.adjuntos.filter(activo=True).count() >= 1

def test_completar_actividad_manual_sin_adjunto_exitosa():
    """Completar actividad manual sin adjunto debe ser exitosa (no obligatorio)"""
    actividad = crear_actividad_manual_en_progreso()  # origen='MANUAL'

    response = client.patch(
        f'/api/actividades/{actividad.id}/cambiar-estado/',
        {'nuevo_estado': 'COMPLETADA'},
        **headers_responsable
    )

    assert response.status_code == 200
    actividad.refresh_from_db()
    assert actividad.estado == 'COMPLETADA'
```

### Tests de Permisos (5 tests)

```python
def test_responsable_puede_editar_actividad():
    """Responsable de actividad puede editar"""
    actividad = crear_actividad_pendiente(responsable=usuario_tecnico)

    response = client.patch(
        f'/api/actividades/{actividad.id}/',
        {'descripcion': 'Descripción actualizada'},
        **headers_tecnico  # Usuario es responsable
    )

    assert response.status_code == 200

def test_jz_puede_editar_actividad_de_su_zona():
    """JZ puede editar actividades de su zona"""
    actividad = crear_actividad_zona1()

    response = client.patch(
        f'/api/actividades/{actividad.id}/',
        {'descripcion': 'Editado por JZ'},
        **headers_jz_zona1  # JZ de zona 1
    )

    assert response.status_code == 200

def test_director_puede_editar_cualquier_actividad():
    """Director puede editar actividades de cualquier zona"""
    actividad_zona2 = crear_actividad_zona2()

    response = client.patch(
        f'/api/actividades/{actividad_zona2.id}/',
        {'descripcion': 'Editado por Director'},
        **headers_director  # Director nivel 4
    )

    assert response.status_code == 200

def test_admin_puede_editar_cualquier_actividad():
    """Admin puede editar cualquier actividad"""
    actividad = crear_actividad_cualquier_zona()

    response = client.patch(
        f'/api/actividades/{actividad.id}/',
        {'descripcion': 'Editado por Admin'},
        **headers_admin
    )

    assert response.status_code == 200

def test_usuario_sin_permisos_no_puede_editar():
    """Usuario sin permisos no puede editar"""
    actividad_zona1 = crear_actividad_zona1()

    response = client.patch(
        f'/api/actividades/{actividad_zona1.id}/',
        {'descripcion': 'Intento de edición'},
        **headers_usuario_zona2  # Usuario de otra zona
    )

    assert response.status_code == 403
    assert 'sin permisos' in response.data['error'].lower()
```

### Tests de Visado Legal (4 tests)

```python
def test_completar_actividad_con_visado_legal_auto_transicion():
    """Completar actividad con visado legal debe auto-transicionar a PENDIENTE_VISADO"""
    tipo_actividad = crear_tipo_actividad(requiere_visado_legales=True)
    actividad = crear_actividad_en_progreso(tipo_actividad=tipo_actividad)
    adjuntar_evidencia(actividad)

    response = client.patch(
        f'/api/actividades/{actividad.id}/cambiar-estado/',
        {'nuevo_estado': 'COMPLETADA'},
        **headers_responsable
    )

    assert response.status_code == 200
    actividad.refresh_from_db()
    assert actividad.estado == 'PENDIENTE_VISADO'

def test_notificacion_legal_se_crea_correctamente():
    """Notificación a equipo legal se debe crear al requerir visado"""
    tipo_actividad = crear_tipo_actividad(requiere_visado_legales=True)
    actividad = crear_actividad_en_progreso(tipo_actividad=tipo_actividad)
    adjuntar_evidencia(actividad)

    client.patch(
        f'/api/actividades/{actividad.id}/cambiar-estado/',
        {'nuevo_estado': 'COMPLETADA'},
        **headers_responsable
    )

    notificaciones = TNotificacionActividad.objects.filter(
        actividad=actividad,
        tipo_notificacion='VISADO_REQUERIDO'
    )

    assert notificaciones.count() > 0
    assert all(n.destinatario.legal for n in notificaciones)

def test_visar_actividad_aprobado_exitoso():
    """Equipo legal puede aprobar visado"""
    actividad = crear_actividad_pendiente_visado()

    response = client.post(
        f'/api/actividades/{actividad.id}/visar/',
        {'aprobado': True, 'observaciones': 'Todo correcto'},
        **headers_legal
    )

    assert response.status_code == 200
    actividad.refresh_from_db()
    assert actividad.estado == 'VISADO_APROBADO'

def test_visar_actividad_rechazado_requiere_observaciones():
    """Rechazar visado sin observaciones debe fallar"""
    actividad = crear_actividad_pendiente_visado()

    response = client.post(
        f'/api/actividades/{actividad.id}/visar/',
        {'aprobado': False},  # Sin observaciones
        **headers_legal
    )

    assert response.status_code == 400
    assert 'observaciones obligatorias' in response.data['error'].lower()
```

### Tests de Reapertura (3 tests)

```python
def test_reabrir_actividad_por_jz_exitosa():
    """JZ puede reabrir actividad cerrada con motivo"""
    actividad = crear_actividad_completada()

    response = client.post(
        f'/api/actividades/{actividad.id}/reabrir/',
        {'motivo': 'Corrección de evidencia requerida'},
        **headers_jz
    )

    assert response.status_code == 200
    actividad.refresh_from_db()
    assert actividad.estado == 'EN_PROGRESO'

def test_reabrir_actividad_sin_motivo_falla():
    """Reabrir actividad sin motivo debe fallar"""
    actividad = crear_actividad_completada()

    response = client.post(
        f'/api/actividades/{actividad.id}/reabrir/',
        {},  # Sin motivo
        **headers_jz
    )

    assert response.status_code == 400
    assert 'motivo obligatorio' in response.data['error'].lower()

def test_reabrir_actividad_por_usuario_sin_permisos_falla():
    """Usuario sin permisos no puede reabrir actividad"""
    actividad = crear_actividad_completada()

    response = client.post(
        f'/api/actividades/{actividad.id}/reabrir/',
        {'motivo': 'Intento sin permisos'},
        **headers_tecnico  # Técnico sin nivel JZ
    )

    assert response.status_code == 403
```

### Tests de Comentarios y Menciones (3 tests)

```python
def test_crear_comentario_con_mencion_crea_notificacion():
    """Comentario con @mención debe crear notificación"""
    actividad = crear_actividad_en_progreso()

    response = client.post(
        f'/api/actividades/{actividad.id}/comentarios/',
        {'texto': 'Revisión necesaria @jz_zona1'},
        **headers_tecnico
    )

    assert response.status_code == 201
    assert 'menciones' in response.data
    assert len(response.data['menciones']) == 1

    notificacion = TNotificacionActividad.objects.get(
        actividad=actividad,
        tipo_notificacion='MENCION',
        destinatario__username='jz_zona1'
    )
    assert notificacion.leida is False

def test_extraer_menciones_multiples():
    """Sistema debe extraer múltiples @menciones correctamente"""
    actividad = crear_actividad_en_progreso()

    response = client.post(
        f'/api/actividades/{actividad.id}/comentarios/',
        {'texto': 'Revisión @jz_zona1 y supervisión @director_provincial'},
        **headers_tecnico
    )

    assert response.status_code == 201
    assert len(response.data['menciones']) == 2

def test_comentario_sin_mencion_no_crea_notificacion_mencion():
    """Comentario sin @mención no debe crear notificación de tipo MENCION"""
    actividad = crear_actividad_en_progreso()

    client.post(
        f'/api/actividades/{actividad.id}/comentarios/',
        {'texto': 'Comentario normal sin menciones'},
        **headers_tecnico
    )

    assert not TNotificacionActividad.objects.filter(
        actividad=actividad,
        tipo_notificacion='MENCION'
    ).exists()
```

### Tests de Adjuntos y Versionado (3 tests)

```python
def test_adjuntar_archivo_crea_registro_correcto():
    """Adjuntar archivo debe crear registro con metadatos correctos"""
    actividad = crear_actividad_en_progreso()

    with open('tests/fixtures/informe.pdf', 'rb') as archivo:
        response = client.post(
            f'/api/actividades/{actividad.id}/adjuntos/',
            {'archivo': archivo, 'tipo_adjunto': 'INFORME'},
            format='multipart',
            **headers_responsable
        )

    assert response.status_code == 201
    assert response.data['nombre_original'] == 'informe.pdf'
    assert response.data['version'] == 1
    assert response.data['activo'] is True

def test_versionado_adjunto_incrementa_version():
    """Reemplazar adjunto debe incrementar versión y marcar anterior como inactivo"""
    actividad = crear_actividad_en_progreso()

    # Primer adjunto
    with open('tests/fixtures/informe_v1.pdf', 'rb') as archivo:
        response1 = client.post(
            f'/api/actividades/{actividad.id}/adjuntos/',
            {'archivo': archivo},
            format='multipart',
            **headers_responsable
        )
    adjunto_v1_id = response1.data['id']

    # Segundo adjunto (reemplazo)
    with open('tests/fixtures/informe_v2.pdf', 'rb') as archivo:
        response2 = client.post(
            f'/api/actividades/{actividad.id}/adjuntos/',
            {'archivo': archivo},
            format='multipart',
            **headers_responsable
        )

    assert response2.status_code == 201
    assert response2.data['version'] == 2

    adjunto_v1 = TAdjuntoActividad.objects.get(id=adjunto_v1_id)
    assert adjunto_v1.activo is False

def test_descargar_adjunto_retorna_archivo():
    """Descargar adjunto debe retornar archivo correcto"""
    actividad = crear_actividad_con_adjunto()
    adjunto = actividad.adjuntos.first()

    response = client.get(
        f'/api/actividades/{actividad.id}/adjuntos/{adjunto.id}/descargar/',
        **headers_usuario_zona
    )

    assert response.status_code == 200
    assert response['Content-Type'] == 'application/pdf'
    assert 'Content-Disposition' in response
```

### Tests de Actividades Grupales (2 tests)

```python
def test_cambio_estado_actividad_grupal_replica_a_todas():
    """Cambio de estado en actividad grupal debe replicarse a todas las medidas vinculadas"""
    # Crear 3 medidas vinculadas
    medidas = crear_grupo_medidas_vinculadas(cantidad=3)
    actividad_grupal = crear_actividad_grupal(medidas=medidas)

    response = client.patch(
        f'/api/actividades/{actividad_grupal.id}/cambiar-estado/',
        {'nuevo_estado': 'EN_PROGRESO'},
        **headers_responsable
    )

    assert response.status_code == 200

    # Verificar que TODAS las actividades del grupo cambiaron
    for medida in medidas:
        actividad = TActividadPlanTrabajo.objects.get(
            plan_trabajo__medida=medida,
            actividad_grupal_id=actividad_grupal.id
        )
        assert actividad.estado == 'EN_PROGRESO'

def test_adjunto_actividad_grupal_aplica_a_grupo():
    """Adjuntar evidencia en actividad grupal debe aplicar a todas las medidas"""
    medidas = crear_grupo_medidas_vinculadas(cantidad=2)
    actividad_grupal = crear_actividad_grupal(medidas=medidas)

    with open('tests/fixtures/evidencia.pdf', 'rb') as archivo:
        response = client.post(
            f'/api/actividades/{actividad_grupal.id}/adjuntos/',
            {'archivo': archivo},
            format='multipart',
            **headers_responsable
        )

    assert response.status_code == 201

    # Verificar que adjunto existe para todas las medidas del grupo
    for medida in medidas:
        actividad = TActividadPlanTrabajo.objects.get(
            plan_trabajo__medida=medida,
            actividad_grupal_id=actividad_grupal.id
        )
        assert actividad.adjuntos.filter(activo=True).count() == 1
```

### Tests de Bloqueo y Solo Lectura (2 tests)

```python
def test_actividad_completada_solo_lectura():
    """Actividad COMPLETADA debe ser solo lectura"""
    actividad = crear_actividad_completada()

    response = client.patch(
        f'/api/actividades/{actividad.id}/',
        {'descripcion': 'Intento de edición'},
        **headers_responsable
    )

    assert response.status_code == 409
    assert 'Actividad cerrada' in response.data['error']

def test_editar_actividad_completada_falla():
    """Editar campos de actividad COMPLETADA debe fallar"""
    actividad = crear_actividad_completada()

    response = client.patch(
        f'/api/actividades/{actividad.id}/cambiar-estado/',
        {'nuevo_estado': 'EN_PROGRESO'},
        **headers_responsable
    )

    assert response.status_code == 409
    assert 'reapertura' in response.data['error'].lower()
```

### Tests de Transferencia de Actividades (11 tests)

```python
def test_jz_puede_transferir_actividad_a_otro_equipo():
    """JZ puede transferir actividad a otro equipo"""
    actividad = crear_actividad_zona1(responsable=usuario_tecnico_zona1)
    equipo_destino = crear_equipo_zona2()

    response = client.post(
        f'/api/actividades/{actividad.id}/transferir/',
        {
            'equipo_destino_id': equipo_destino.id,
            'motivo': 'Equipo especializado en casos de adicciones'
        },
        **headers_jz_zona1
    )

    assert response.status_code == 201
    assert response.data['equipo_destino']['id'] == equipo_destino.id
    assert response.data['motivo'] == 'Equipo especializado en casos de adicciones'
    assert response.data['transferido_por']['id'] == jz_zona1.id

    # Verificar que se creó el registro de transferencia
    assert TTransferenciaActividad.objects.filter(
        actividad=actividad,
        equipo_destino=equipo_destino
    ).exists()

def test_director_puede_transferir_actividad_cualquier_equipo():
    """Director puede transferir actividad entre cualquier equipo"""
    actividad_zona3 = crear_actividad_zona3()
    equipo_destino_zona1 = crear_equipo_zona1()

    response = client.post(
        f'/api/actividades/{actividad_zona3.id}/transferir/',
        {
            'equipo_destino_id': equipo_destino_zona1.id,
            'motivo': 'Redistribución de carga de trabajo provincial'
        },
        **headers_director
    )

    assert response.status_code == 201
    assert response.data['transferido_por']['nivel'] >= 4

def test_transferir_actividad_sin_responsable_nuevo():
    """Transferir actividad sin asignar responsable nuevo (JZ destino asignará)"""
    actividad = crear_actividad_zona1()
    equipo_destino = crear_equipo_zona2()

    response = client.post(
        f'/api/actividades/{actividad.id}/transferir/',
        {
            'equipo_destino_id': equipo_destino.id,
            'motivo': 'Transferencia para asignación posterior'
        },
        **headers_jz_zona1
    )

    assert response.status_code == 201
    assert response.data['responsable_nuevo'] is None

    # Verificar notificación al JZ del equipo destino
    jz_destino = TCustomUser.objects.get(nivel=3, zonas=equipo_destino.zona)
    assert TNotificacionActividad.objects.filter(
        actividad=actividad,
        destinatario=jz_destino,
        tipo_notificacion='ASIGNACION'
    ).exists()

def test_transferir_actividad_con_responsable_nuevo():
    """Transferir actividad con responsable nuevo especificado"""
    actividad = crear_actividad_zona1(responsable=usuario_tecnico_zona1)
    equipo_destino = crear_equipo_zona2()
    responsable_nuevo = crear_usuario_equipo(equipo_destino)

    response = client.post(
        f'/api/actividades/{actividad.id}/transferir/',
        {
            'equipo_destino_id': equipo_destino.id,
            'responsable_nuevo_id': responsable_nuevo.id,
            'motivo': 'Transferencia con asignación directa'
        },
        **headers_jz_zona1
    )

    assert response.status_code == 201
    assert response.data['responsable_nuevo']['id'] == responsable_nuevo.id

    # Verificar que se actualizó el responsable de la actividad
    actividad.refresh_from_db()
    assert actividad.responsable == responsable_nuevo

    # Verificar historial
    assert THistorialActividad.objects.filter(
        actividad=actividad,
        tipo_accion='TRANSFERENCIA'
    ).exists()

def test_transferencia_crea_notificaciones_correctas():
    """Transferencia debe crear notificaciones para todos los involucrados"""
    actividad = crear_actividad_zona1(responsable=usuario_tecnico_zona1)
    equipo_destino = crear_equipo_zona2()
    responsable_nuevo = crear_usuario_equipo(equipo_destino)

    client.post(
        f'/api/actividades/{actividad.id}/transferir/',
        {
            'equipo_destino_id': equipo_destino.id,
            'responsable_nuevo_id': responsable_nuevo.id,
            'motivo': 'Transferencia con notificaciones'
        },
        **headers_jz_zona1
    )

    # Notificación al responsable anterior
    assert TNotificacionActividad.objects.filter(
        actividad=actividad,
        destinatario=usuario_tecnico_zona1,
        tipo_notificacion='TRANSFERENCIA'
    ).exists()

    # Notificación al responsable nuevo
    assert TNotificacionActividad.objects.filter(
        actividad=actividad,
        destinatario=responsable_nuevo,
        tipo_notificacion='ASIGNACION'
    ).exists()

def test_transferencia_sin_motivo_falla():
    """Transferir sin motivo debe fallar"""
    actividad = crear_actividad_zona1()
    equipo_destino = crear_equipo_zona2()

    response = client.post(
        f'/api/actividades/{actividad.id}/transferir/',
        {
            'equipo_destino_id': equipo_destino.id
            # Sin motivo
        },
        **headers_jz_zona1
    )

    assert response.status_code == 400
    assert 'motivo' in response.data['error'].lower()

def test_transferencia_motivo_corto_falla():
    """Transferir con motivo demasiado corto debe fallar"""
    actividad = crear_actividad_zona1()
    equipo_destino = crear_equipo_zona2()

    response = client.post(
        f'/api/actividades/{actividad.id}/transferir/',
        {
            'equipo_destino_id': equipo_destino.id,
            'motivo': 'Corto'  # Menos de 15 caracteres
        },
        **headers_jz_zona1
    )

    assert response.status_code == 400
    assert 'mínimo 15 caracteres' in response.data['error'].lower()

def test_usuario_sin_permisos_no_puede_transferir():
    """Usuario sin permisos (nivel < 3) no puede transferir actividades"""
    actividad = crear_actividad_zona1()
    equipo_destino = crear_equipo_zona2()

    response = client.post(
        f'/api/actividades/{actividad.id}/transferir/',
        {
            'equipo_destino_id': equipo_destino.id,
            'motivo': 'Intento sin permisos suficientes'
        },
        **headers_tecnico  # Técnico nivel 1-2
    )

    assert response.status_code == 403
    assert 'nivel 3+' in response.data['error'].lower()

def test_transferencia_equipo_origen_igual_destino_falla():
    """Transferir al mismo equipo debe fallar"""
    equipo = crear_equipo_zona1()
    actividad = crear_actividad_zona1(equipo=equipo)

    response = client.post(
        f'/api/actividades/{actividad.id}/transferir/',
        {
            'equipo_destino_id': equipo.id,  # Mismo equipo
            'motivo': 'Intento de transferencia al mismo equipo'
        },
        **headers_jz_zona1
    )

    assert response.status_code == 400
    assert 'origen y destino deben ser diferentes' in response.data['error'].lower()

def test_responsable_nuevo_no_pertenece_equipo_destino_falla():
    """Asignar responsable que no pertenece al equipo destino debe fallar"""
    actividad = crear_actividad_zona1()
    equipo_destino = crear_equipo_zona2()
    responsable_equipo_zona3 = crear_usuario_zona3()  # Usuario de otro equipo

    response = client.post(
        f'/api/actividades/{actividad.id}/transferir/',
        {
            'equipo_destino_id': equipo_destino.id,
            'responsable_nuevo_id': responsable_equipo_zona3.id,  # No pertenece al equipo destino
            'motivo': 'Transferencia con responsable incorrecto'
        },
        **headers_jz_zona1
    )

    assert response.status_code == 400
    assert 'no pertenece al equipo destino' in response.data['error'].lower()

def test_historial_transferencia_es_inmutable():
    """Historial de transferencia debe ser inmutable"""
    actividad = crear_actividad_zona1()
    equipo_destino = crear_equipo_zona2()

    client.post(
        f'/api/actividades/{actividad.id}/transferir/',
        {
            'equipo_destino_id': equipo_destino.id,
            'motivo': 'Transferencia para verificar inmutabilidad'
        },
        **headers_jz_zona1
    )

    transferencia = TTransferenciaActividad.objects.get(actividad=actividad)

    # Intentar modificar
    with pytest.raises(Exception):  # Django impide edición de registros inmutables
        transferencia.motivo = 'Motivo modificado'
        transferencia.save()

    # Verificar que el motivo original se mantiene
    transferencia.refresh_from_db()
    assert transferencia.motivo == 'Transferencia para verificar inmutabilidad'
```

## 📦 SERIALIZERS

### TComentarioActividadSerializer

```python
# api/serializers/TComentarioActividadSerializer.py

from rest_framework import serializers
from runna.infrastructure.models import TComentarioActividad, TCustomUser

class UsuarioBasicoSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.SerializerMethodField()

    class Meta:
        model = TCustomUser
        fields = ['id', 'username', 'nombre_completo']

    def get_nombre_completo(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()

class TComentarioActividadSerializer(serializers.ModelSerializer):
    autor = UsuarioBasicoSerializer(read_only=True)
    menciones = UsuarioBasicoSerializer(many=True, read_only=True)
    notificaciones_enviadas = serializers.SerializerMethodField()

    class Meta:
        model = TComentarioActividad
        fields = [
            'id', 'actividad', 'autor', 'texto', 'menciones',
            'fecha_creacion', 'editado', 'fecha_edicion',
            'notificaciones_enviadas'
        ]
        read_only_fields = ['id', 'autor', 'menciones', 'fecha_creacion', 'editado']

    def get_notificaciones_enviadas(self, obj):
        return obj.menciones.count()

    def create(self, validated_data):
        validated_data['autor'] = self.context['request'].user
        comentario = super().create(validated_data)

        # Extraer y asignar menciones
        menciones = comentario.extraer_menciones()
        comentario.menciones.set(menciones)

        return comentario
```

### TAdjuntoActividadSerializer

```python
# api/serializers/TAdjuntoActividadSerializer.py

from rest_framework import serializers
from runna.infrastructure.models import TAdjuntoActividad

class TAdjuntoActividadSerializer(serializers.ModelSerializer):
    subido_por = UsuarioBasicoSerializer(read_only=True)
    url_descarga = serializers.SerializerMethodField()

    class Meta:
        model = TAdjuntoActividad
        fields = [
            'id', 'actividad', 'archivo', 'nombre_original',
            'tipo_mime', 'tamanio_bytes', 'tipo_adjunto',
            'version', 'reemplaza_a', 'activo',
            'subido_por', 'fecha_subida', 'url_descarga'
        ]
        read_only_fields = [
            'id', 'nombre_original', 'tipo_mime', 'tamanio_bytes',
            'version', 'subido_por', 'fecha_subida', 'activo'
        ]

    def get_url_descarga(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(
                f'/api/actividades/{obj.actividad.id}/adjuntos/{obj.id}/descargar/'
            )
        return None
```

### THistorialActividadSerializer

```python
# api/serializers/THistorialActividadSerializer.py

from rest_framework import serializers
from runna.infrastructure.models import THistorialActividad

class THistorialActividadSerializer(serializers.ModelSerializer):
    usuario = UsuarioBasicoSerializer(read_only=True)

    class Meta:
        model = THistorialActividad
        fields = [
            'id', 'actividad', 'usuario', 'fecha_accion',
            'tipo_accion', 'estado_anterior', 'estado_nuevo',
            'campos_modificados', 'motivo'
        ]
        read_only_fields = '__all__'
```

### TTransferenciaActividadSerializer

```python
# api/serializers/TTransferenciaActividadSerializer.py

from rest_framework import serializers
from runna.infrastructure.models import TTransferenciaActividad, TCustomUserZona

class EquipoSerializer(serializers.ModelSerializer):
    zona = serializers.StringRelatedField()

    class Meta:
        model = TCustomUserZona
        fields = ['id', 'nombre', 'zona']

class TTransferenciaActividadSerializer(serializers.ModelSerializer):
    equipo_origen = EquipoSerializer(read_only=True)
    equipo_destino = EquipoSerializer(read_only=True)
    responsable_anterior = UsuarioBasicoSerializer(read_only=True)
    responsable_nuevo = UsuarioBasicoSerializer(read_only=True)
    transferido_por = UsuarioBasicoSerializer(read_only=True)

    # Write-only fields para creación
    equipo_destino_id = serializers.IntegerField(write_only=True)
    responsable_nuevo_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = TTransferenciaActividad
        fields = [
            'id', 'actividad',
            'equipo_origen', 'equipo_destino',
            'responsable_anterior', 'responsable_nuevo',
            'transferido_por', 'fecha_transferencia',
            'motivo', 'estado_transferencia', 'observaciones',
            # Write-only
            'equipo_destino_id', 'responsable_nuevo_id'
        ]
        read_only_fields = [
            'id', 'equipo_origen', 'responsable_anterior',
            'transferido_por', 'fecha_transferencia'
        ]

    def validate_motivo(self, value):
        if len(value) < 15:
            raise serializers.ValidationError(
                "El motivo debe tener al menos 15 caracteres"
            )
        return value

    def validate(self, attrs):
        request = self.context.get('request')
        actividad = self.context.get('actividad')

        # Validar nivel de usuario
        if request.user.nivel < 3:
            raise serializers.ValidationError(
                "Solo usuarios nivel 3+ (JZ/Director) pueden transferir actividades"
            )

        # Validar equipo destino diferente al origen
        equipo_origen = actividad.plan_trabajo.medida.legajo.equipo
        equipo_destino_id = attrs.get('equipo_destino_id')

        if equipo_origen.id == equipo_destino_id:
            raise serializers.ValidationError(
                "El equipo de origen y destino deben ser diferentes"
            )

        # Validar responsable nuevo pertenece al equipo destino
        responsable_nuevo_id = attrs.get('responsable_nuevo_id')
        if responsable_nuevo_id:
            from runna.infrastructure.models import TCustomUser
            responsable_nuevo = TCustomUser.objects.get(id=responsable_nuevo_id)
            if not responsable_nuevo.zonas.filter(id=equipo_destino_id).exists():
                raise serializers.ValidationError(
                    "El responsable nuevo debe pertenecer al equipo destino"
                )

        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        actividad = self.context.get('actividad')

        # Extraer write-only fields
        equipo_destino_id = validated_data.pop('equipo_destino_id')
        responsable_nuevo_id = validated_data.pop('responsable_nuevo_id', None)

        # Obtener instancias
        equipo_origen = actividad.plan_trabajo.medida.legajo.equipo
        equipo_destino = TCustomUserZona.objects.get(id=equipo_destino_id)

        transferencia = TTransferenciaActividad.objects.create(
            actividad=actividad,
            equipo_origen=equipo_origen,
            equipo_destino=equipo_destino,
            responsable_anterior=actividad.responsable,
            responsable_nuevo_id=responsable_nuevo_id,
            transferido_por=request.user,
            **validated_data
        )

        # Actualizar responsable de actividad si se especificó
        if responsable_nuevo_id:
            actividad.responsable_id = responsable_nuevo_id
            actividad.save()

        return transferencia
```

## 🔧 VALIDACIONES DE NEGOCIO

### Validación de Evidencia Obligatoria (PI/Oficios)

```python
def validar_evidencia_para_completar(actividad):
    """
    Valida que actividades de PI/Oficio tengan al menos 1 adjunto activo.
    """
    if actividad.origen in ['PI', 'OFICIO']:
        if not actividad.adjuntos.filter(activo=True).exists():
            raise ValidationError(
                "Actividades de Petición de Informe u Oficios requieren evidencia adjunta para completarse."
            )
```

### Validación de Transición de Estado

```python
TRANSICIONES_PERMITIDAS = {
    'PENDIENTE': ['EN_PROGRESO', 'CANCELADA'],
    'EN_PROGRESO': ['COMPLETADA', 'CANCELADA', 'PENDIENTE'],
    'COMPLETADA': ['PENDIENTE_VISADO'],
    'PENDIENTE_VISADO': ['VISADO_APROBADO', 'VISADO_CON_OBSERVACION'],
    'VISADO_CON_OBSERVACION': ['EN_PROGRESO'],
    'VENCIDA': ['EN_PROGRESO', 'CANCELADA'],
}

def validar_transicion_estado(estado_actual, estado_nuevo):
    """
    Valida que la transición de estado sea permitida.
    """
    if estado_nuevo not in TRANSICIONES_PERMITIDAS.get(estado_actual, []):
        raise ValidationError(
            f"Transición no permitida: {estado_actual} → {estado_nuevo}. "
            f"Transiciones válidas: {TRANSICIONES_PERMITIDAS.get(estado_actual, [])}"
        )
```

### Validación de Permisos de Edición

```python
def puede_editar_actividad(usuario, actividad):
    """
    Verifica si usuario tiene permisos para editar actividad.
    """
    # Responsable de la actividad
    if actividad.responsable == usuario:
        return True

    # JZ de la zona del legajo
    if usuario.nivel >= 3:  # JZ
        zona_usuario = usuario.zonas.first()
        zona_legajo = actividad.plan_trabajo.medida.legajo.zona
        if zona_usuario == zona_legajo:
            return True

    # Director (nivel 4+)
    if usuario.nivel >= 4:
        return True

    # Administrador
    if usuario.is_staff or usuario.is_superuser:
        return True

    return False
```

## 🔄 LÓGICA DE ACTIVIDADES GRUPALES

### Replicación de Acciones a Grupo

```python
def replicar_accion_a_grupo(actividad_grupal, tipo_accion, **kwargs):
    """
    Replica acción a todas las actividades del grupo de medidas vinculadas.

    Args:
        actividad_grupal: Actividad marcada como grupal
        tipo_accion: 'CAMBIO_ESTADO', 'ADJUNTO', 'COMENTARIO'
        **kwargs: Parámetros específicos de la acción
    """
    if not actividad_grupal.actividad_grupal:
        return  # No es actividad grupal

    # Obtener todas las actividades del grupo
    actividades_grupo = TActividadPlanTrabajo.objects.filter(
        actividad_grupal_id=actividad_grupal.id
    )

    for actividad in actividades_grupo:
        if tipo_accion == 'CAMBIO_ESTADO':
            actividad.estado = kwargs['nuevo_estado']
            actividad.save()
            crear_historial(actividad, 'CAMBIO_ESTADO', **kwargs)

        elif tipo_accion == 'ADJUNTO':
            # Duplicar adjunto para cada actividad del grupo
            TAdjuntoActividad.objects.create(
                actividad=actividad,
                archivo=kwargs['archivo'],
                **kwargs
            )

        elif tipo_accion == 'COMENTARIO':
            # Replicar comentario
            TComentarioActividad.objects.create(
                actividad=actividad,
                texto=kwargs['texto'],
                autor=kwargs['autor']
            )
```

## 📬 SISTEMA DE NOTIFICACIONES

### Creación de Notificaciones

```python
def crear_notificacion(actividad, tipo, destinatarios, **kwargs):
    """
    Crea notificaciones para destinatarios.

    Args:
        actividad: TActividadPlanTrabajo
        tipo: Tipo de notificación (CREACION, MENCION, etc.)
        destinatarios: QuerySet o lista de TCustomUser
        **kwargs: titulo, mensaje, enlace
    """
    notificaciones = []

    for destinatario in destinatarios:
        notificacion = TNotificacionActividad.objects.create(
            actividad=actividad,
            destinatario=destinatario,
            tipo_notificacion=tipo,
            titulo=kwargs.get('titulo', ''),
            mensaje=kwargs.get('mensaje', ''),
            enlace=kwargs.get('enlace', f'/actividades/{actividad.id}/')
        )
        notificaciones.append(notificacion)

        # Enviar email (asíncrono con Celery)
        enviar_email_notificacion.delay(notificacion.id)

    return notificaciones
```

## 🚀 PLAN DE IMPLEMENTACIÓN

### Fase 1: Modelos y Migraciones (2-3 horas)
1. Crear modelos: `TComentarioActividad`, `TAdjuntoActividad`, `THistorialActividad`, `TNotificacionActividad`
2. Ejecutar `makemigrations` y `migrate`
3. Crear fixtures para tipos de adjunto (si necesario)
4. Actualizar `__init__.py` de modelos

### Fase 2: Serializers y Permisos (2 horas)
1. Crear serializers para los 4 modelos nuevos
2. Implementar `puede_editar_actividad()` en permissions
3. Exportar serializers en `api/serializers/__init__.py`

### Fase 3: ViewSets y Endpoints (4-5 horas)
1. Extender `TActividadPlanTrabajoViewSet` con acciones:
   - `@action(methods=['patch'], detail=True) cambiar_estado()`
   - `@action(methods=['post'], detail=True) comentarios()`
   - `@action(methods=['post'], detail=True) adjuntos()`
   - `@action(methods=['post'], detail=True) reabrir()`
   - `@action(methods=['post'], detail=True) visar()`
   - `@action(methods=['get'], detail=True) historial()`
2. Implementar validaciones de negocio en cada acción
3. Registrar URLs en `api/urls.py`

### Fase 4: Lógica de Negocio (3-4 horas)
1. Implementar lógica de transiciones de estado
2. Implementar auto-transición a `PENDIENTE_VISADO`
3. Implementar replicación de acciones para actividades grupales
4. Implementar extracción de @menciones
5. Implementar versionado de adjuntos

### Fase 5: Sistema de Notificaciones (2-3 horas)
1. Implementar creación de notificaciones en eventos clave
2. Implementar envío de emails (Celery task)
3. Crear endpoint para marcar notificaciones como leídas

### Fase 6: Tests (5-6 horas)
1. Escribir 15+ tests cubriendo todos los CA
2. Ejecutar tests: `python manage.py test tests.test_pltm02 -v 2`
3. Validar cobertura de código (>90%)

### Fase 7: Validación en Base de Datos (1 hora)
1. `pipenv shell`
2. `python runna/manage.py setup_project`
3. `python runna/manage.py populate_database`
4. Pruebas manuales en endpoints
5. Revisión de logs

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] Modelos creados: TComentarioActividad, TAdjuntoActividad, THistorialActividad, TNotificacionActividad, TTransferenciaActividad
- [ ] Migraciones aplicadas: `makemigrations` + `migrate`
- [ ] Modelos exportados en `infrastructure/models/__init__.py`
- [ ] Serializers creados para los 5 modelos
- [ ] Serializers exportados en `api/serializers/__init__.py`
- [ ] ViewSet extendido con 8 acciones nuevas (cambiar-estado, comentarios, adjuntos, reabrir, visar, historial, transferir, transferencias)
- [ ] URLs registradas en `api/urls.py`
- [ ] Validaciones de negocio implementadas (transiciones, evidencias, permisos, transferencias)
- [ ] Sistema de notificaciones funcionando (menciones, visado, transferencias)
- [ ] Tests escritos (mínimo 29: 5 transiciones + 3 evidencias + 5 permisos + 4 visado + 3 reapertura + 3 comentarios + 3 adjuntos + 2 grupales + 2 bloqueo + 11 transferencias)
- [ ] Tests ejecutados y pasando (100%)
- [ ] Base de datos poblada y validada
- [ ] Logs revisados sin errores críticos

---

## 📚 DEPENDENCIAS TÉCNICAS

- ✅ PLTM-01: TActividadPlanTrabajo modelo base
- ✅ MED-01: TPlanDeTrabajo auto-creado con TMedida
- ✅ LEG-02: TLegajo para validaciones de zona
- ✅ Django REST Framework
- ✅ Celery (para emails asíncronos)
- ✅ django-simple-history (opcional para auditoría)

---

## 🎯 CRITERIO DE ÉXITO

**PLTM-02 estará completamente implementado cuando**:
1. Todos los 9 criterios de aceptación pasen (8 originales + transferencias)
2. 29+ tests ejecuten exitosamente (incluyendo 11 tests de transferencia)
3. 9 endpoints respondan según especificaciones (7 acciones + 2 transferencias)
4. Validaciones de negocio funcionen correctamente (transiciones, evidencias, permisos, transferencias)
5. Sistema de notificaciones envíe emails (menciones, visado, transferencias)
6. Actividades grupales repliquen acciones a todas las medidas
7. Historial sea inmutable y completo (incluyendo transferencias)
8. Permisos se apliquen correctamente según rol/zona (edición, visado, transferencia)
9. Transferencias entre equipos funcionen con auditoría completa y notificaciones
