# PLTM-01: Gestión de Actividades del Plan de Trabajo

## 📋 CONTEXTO TÉCNICO

### Estado de Implementación Previo
- ✅ **LEG-02**: Registro de Legajo (TLegajo completo) - Base para medidas
- ✅ **MED-01**: Registro Medida (TMedida, TEtapaMedida, TJuzgado) - 19/19 tests
- ✅ **MED-02**: Registro Intervenciones (TIntervencionMedida) - 26/26 tests
- ✅ **MED-03**: Nota de Aval Director (TNotaAval) - 24/24 tests
- ✅ **MED-04**: Informe Jurídico (TInformeJuridico) - 15/15 tests
- ✅ **MED-05**: Ratificación Judicial (TRatificacionJudicial) - 20/20 tests

### Modelos Base Existentes
```python
# infrastructure/models/medida/medida_models.py

class TPlanDeTrabajo(models.Model):
    """
    Plan de trabajo asociado a una medida.
    Agrupa todas las actividades de intervención.
    """
    medida = models.OneToOneField(
        TMedida,
        on_delete=models.CASCADE,
        related_name='plan_trabajo'
    )
    # Otros campos...

class TActividad(models.Model):
    """
    Actividad individual dentro del plan de trabajo.
    Representa una tarea específica a realizar.
    """
    plan_trabajo = models.ForeignKey(
        TPlanDeTrabajo,
        on_delete=models.CASCADE,
        related_name='actividades'
    )
    # Otros campos...
```

### Workflow PLTM Paralelo a MED

```mermaid
graph TD
    A[MED-01: Registro Medida] --> B{Se crea TPlanDeTrabajo}
    B --> C[PLTM-01: Gestión Actividades]

    subgraph "Paralelo a MED-02 → MED-05"
        C --> D[Crear Actividad Manual]
        C --> E[Auto-crear desde Demanda PI]
        C --> F[Auto-crear desde Oficio]

        D --> G[TActividad: PENDIENTE]
        E --> G
        F --> G

        G --> H[PLTM-02: Acción sobre Actividad]
        H --> I[EN_PROGRESO]
        I --> J[REALIZADA / CANCELADA]
    end

    J --> K[PLTM-03: Informes Mensuales]
    K --> L[PLTM-04: Historial Seguimiento]
```

## 🎯 DESCRIPCIÓN

**PLTM-01: Gestión de Actividades del Plan de Trabajo** es el módulo central para organizar y planificar las acciones de intervención asociadas a una Medida de Protección. Opera en **paralelo** al circuito formal de aprobación (MED-02 → MED-05), permitiendo al equipo técnico, residenciales y otros actores crear, visualizar y gestionar actividades específicas que ejecutan el plan de intervención.

### Objetivo Principal
Crear y organizar actividades del Plan de Trabajo en tabs por actor, para ejecutar acciones en paralelo al circuito de aprobación/ratificación, manteniendo trazabilidad completa y automatizando la creación desde Demandas y Oficios.

## 👥 ROLES Y PERMISOS

### Roles Autorizados

#### Creación y Edición Completa
- **Equipo Técnico** (`tecnico=True`): Crear y gestionar actividades propias
- **Equipo Legal** (`legal=True`): Crear y gestionar actividades de Oficios judiciales
- **Director** (Nivel 4+): Crear y gestionar todas las actividades
- **Jefe Zonal (JZ)** (Nivel 3+): Crear y gestionar actividades de su zona

#### Lectura
- **Todos los roles**: Lectura de actividades de legajos de su zona
- **Administrador**: Lectura completa de todas las actividades

### Restricciones por Zona
- Usuario debe pertenecer a la zona del legajo
- Validación vía `TCustomUserZona`
- JZ puede actuar en su zona asignada
- Director puede actuar en toda la provincia

## 📊 ESTADOS DE ACTIVIDADES

### Estados del Modelo TActividad

| Estado | Código | Descripción | Transición |
|--------|--------|-------------|------------|
| **Pendiente** | `PENDIENTE` | Actividad creada, sin iniciar | Estado inicial |
| **En Progreso** | `EN_PROGRESO` | Actividad en ejecución | Desde PENDIENTE |
| **Realizada** | `REALIZADA` | Actividad completada exitosamente | Desde EN_PROGRESO |
| **Cancelada** | `CANCELADA` | Actividad cancelada con motivo | Desde PENDIENTE/EN_PROGRESO |
| **Vencida** | `VENCIDA` | Plazo expirado sin completar | Auto-marcado por sistema |

### Transiciones Automáticas
```python
# Sistema auto-marca VENCIDA si:
if fecha_planificacion < today() and estado != 'REALIZADA':
    estado = 'VENCIDA'
```

## 🏗️ ESTRUCTURA DE MODELOS

### Modelo Catálogo: `TTipoActividad`

```python
# infrastructure/models/medida/TTipoActividad.py

class TTipoActividad(models.Model):
    """
    PLTM-01: Catálogo de tipos de actividades configurables.
    Define los tipos y subactividades disponibles por actor.
    """

    ACTOR_CHOICES = [
        ('EQUIPO_TECNICO', 'Equipo Técnico'),
        ('EQUIPOS_RESIDENCIALES', 'Equipos Residenciales'),
        ('ADULTOS_INSTITUCION', 'Adultos Responsables/Institución'),
        ('EQUIPO_LEGAL', 'Equipo de Legales')
    ]

    actor = models.CharField(
        max_length=30,
        choices=ACTOR_CHOICES,
        help_text="Actor responsable de esta categoría de actividad"
    )

    nombre = models.CharField(
        max_length=100,
        help_text="Nombre del tipo de actividad (ej: 'Visita domiciliaria')"
    )

    descripcion = models.TextField(
        blank=True,
        null=True,
        help_text="Descripción detallada del tipo de actividad"
    )

    requiere_evidencia = models.BooleanField(
        default=False,
        help_text="Si es True, cerrar la actividad exige adjuntos obligatorios"
    )

    activo = models.BooleanField(
        default=True,
        help_text="Indica si este tipo está disponible para selección"
    )

    orden = models.IntegerField(
        default=0,
        help_text="Orden de visualización en listas"
    )

    fecha_creacion = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        db_table = 'tipo_actividad'
        verbose_name = 'Tipo de Actividad'
        verbose_name_plural = 'Tipos de Actividades'
        ordering = ['actor', 'orden', 'nombre']
        indexes = [
            models.Index(fields=['actor', 'activo'], name='idx_tipo_actor_activo'),
        ]

    def __str__(self):
        return f"{self.get_actor_display()} - {self.nombre}"
```

### Modelo Principal: `TActividad` (Extendido)

```python
# infrastructure/models/medida/medida_models.py

class TActividad(models.Model):
    """
    PLTM-01: Actividad individual del Plan de Trabajo.
    Representa tareas específicas por actor con seguimiento completo.
    """

    # RELACIÓN CON PLAN DE TRABAJO
    plan_trabajo = models.ForeignKey(
        TPlanDeTrabajo,
        on_delete=models.CASCADE,
        related_name='actividades'
    )

    # TIPO Y CLASIFICACIÓN
    tipo_actividad = models.ForeignKey(
        TTipoActividad,
        on_delete=models.PROTECT,
        related_name='actividades',
        help_text="Tipo de actividad (catálogo configurable)"
    )

    subactividad = models.CharField(
        max_length=200,
        help_text="Detalle específico de la subactividad"
    )

    # ACTOR RESPONSABLE (desde TTipoActividad)
    actor = models.CharField(
        max_length=30,
        choices=TTipoActividad.ACTOR_CHOICES,
        help_text="Actor asignado (autocompleta desde tipo_actividad)"
    )

    # PLANIFICACIÓN TEMPORAL
    fecha_planificacion = models.DateField(
        help_text="Fecha planificada para realizar la actividad"
    )

    fecha_inicio_real = models.DateField(
        null=True,
        blank=True,
        help_text="Fecha real de inicio (cuando pasa a EN_PROGRESO)"
    )

    fecha_finalizacion_real = models.DateField(
        null=True,
        blank=True,
        help_text="Fecha real de finalización (cuando pasa a REALIZADA)"
    )

    # ESTADO Y SEGUIMIENTO
    ESTADO_CHOICES = [
        ('PENDIENTE', 'Pendiente'),
        ('EN_PROGRESO', 'En Progreso'),
        ('REALIZADA', 'Realizada'),
        ('CANCELADA', 'Cancelada'),
        ('VENCIDA', 'Vencida')
    ]

    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default='PENDIENTE',
        help_text="Estado actual de la actividad"
    )

    # DESCRIPCIÓN Y DETALLES
    descripcion = models.TextField(
        blank=True,
        null=True,
        help_text="Descripción detallada de la actividad"
    )

    # RESPONSABLES
    responsable_principal = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='actividades_responsable',
        help_text="Usuario responsable principal de la actividad"
    )

    responsables_secundarios = models.ManyToManyField(
        User,
        related_name='actividades_colaborador',
        blank=True,
        help_text="Usuarios colaboradores adicionales"
    )

    # REFERENTES EXTERNOS
    referentes_externos = models.TextField(
        blank=True,
        null=True,
        help_text="Contactos externos: institución, persona, teléfono (JSON o texto libre)"
    )

    # ORIGEN DE LA ACTIVIDAD
    ORIGEN_CHOICES = [
        ('MANUAL', 'Creación Manual'),
        ('DEMANDA_PI', 'Demanda - Petición de Informe'),
        ('DEMANDA_OFICIO', 'Demanda - Carga de Oficios'),
        ('OFICIO', 'Oficio Judicial')
    ]

    origen = models.CharField(
        max_length=20,
        choices=ORIGEN_CHOICES,
        default='MANUAL',
        help_text="Origen de la actividad"
    )

    origen_demanda = models.ForeignKey(
        'TRegistroDemanda',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='actividades_generadas',
        help_text="Demanda que generó esta actividad (si aplica)"
    )

    origen_oficio = models.ForeignKey(
        'TOficio',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='actividades_generadas',
        help_text="Oficio que generó esta actividad (si aplica)"
    )

    # BORRADOR (permite guardar sin completar)
    es_borrador = models.BooleanField(
        default=False,
        help_text="Si es True, la actividad está en modo borrador"
    )

    # AUDITORÍA
    usuario_creacion = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='actividades_creadas',
        help_text="Usuario que creó la actividad"
    )

    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp de creación"
    )

    usuario_modificacion = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='actividades_modificadas',
        null=True,
        blank=True,
        help_text="Último usuario que modificó la actividad"
    )

    fecha_modificacion = models.DateTimeField(
        auto_now=True,
        help_text="Última modificación del registro"
    )

    # CANCELACIÓN (cuando estado = CANCELADA)
    motivo_cancelacion = models.TextField(
        blank=True,
        null=True,
        help_text="Motivo de cancelación de la actividad"
    )

    fecha_cancelacion = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp de cancelación"
    )

    usuario_cancelacion = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='actividades_canceladas',
        help_text="Usuario que canceló la actividad"
    )

    class Meta:
        db_table = 'actividad'
        verbose_name = 'Actividad'
        verbose_name_plural = 'Actividades'
        ordering = ['-fecha_planificacion', '-fecha_creacion']
        indexes = [
            models.Index(fields=['plan_trabajo', 'estado'], name='idx_actividad_plan_estado'),
            models.Index(fields=['responsable_principal', 'estado'], name='idx_actividad_responsable'),
            models.Index(fields=['fecha_planificacion', 'estado'], name='idx_actividad_fecha_estado'),
            models.Index(fields=['actor', 'estado'], name='idx_actividad_actor_estado'),
        ]

    def __str__(self):
        return f"{self.tipo_actividad.nombre} - {self.subactividad} ({self.get_estado_display()})"

    def clean(self):
        """
        Validaciones de negocio antes de guardar.
        """
        from django.core.exceptions import ValidationError
        from django.utils import timezone

        # Validar que fecha_planificacion no sea muy antigua (más de 1 año)
        if self.fecha_planificacion:
            one_year_ago = timezone.now().date() - timedelta(days=365)
            if self.fecha_planificacion < one_year_ago:
                raise ValidationError({
                    'fecha_planificacion': 'La fecha de planificación no puede ser anterior a 1 año.'
                })

        # Validar que si está CANCELADA, tenga motivo
        if self.estado == 'CANCELADA' and not self.motivo_cancelacion:
            raise ValidationError({
                'motivo_cancelacion': 'Debe proporcionar un motivo de cancelación.'
            })

        # Validar que actor coincida con tipo_actividad
        if self.tipo_actividad and self.actor != self.tipo_actividad.actor:
            raise ValidationError({
                'actor': f'El actor debe coincidir con el tipo de actividad: {self.tipo_actividad.actor}'
            })

    def save(self, *args, **kwargs):
        """
        Override save para auto-completar campos y validaciones.
        """
        self.full_clean()

        # Auto-completar actor desde tipo_actividad
        if self.tipo_actividad and not self.actor:
            self.actor = self.tipo_actividad.actor

        # Auto-marcar fecha_inicio_real al pasar a EN_PROGRESO
        if self.estado == 'EN_PROGRESO' and not self.fecha_inicio_real:
            self.fecha_inicio_real = timezone.now().date()

        # Auto-marcar fecha_finalizacion_real al pasar a REALIZADA
        if self.estado == 'REALIZADA' and not self.fecha_finalizacion_real:
            self.fecha_finalizacion_real = timezone.now().date()

        # Auto-marcar fecha_cancelacion al pasar a CANCELADA
        if self.estado == 'CANCELADA' and not self.fecha_cancelacion:
            self.fecha_cancelacion = timezone.now()

        super().save(*args, **kwargs)

    @classmethod
    def marcar_vencidas(cls):
        """
        Método de clase para auto-marcar actividades vencidas.
        Se ejecuta diariamente por un cron job o Celery task.
        """
        from django.utils import timezone
        hoy = timezone.now().date()

        actividades_vencidas = cls.objects.filter(
            fecha_planificacion__lt=hoy,
            estado__in=['PENDIENTE', 'EN_PROGRESO']
        )

        count = actividades_vencidas.update(estado='VENCIDA')
        return count

    @property
    def esta_vencida(self):
        """
        Propiedad para verificar si la actividad está vencida.
        """
        from django.utils import timezone
        if self.fecha_planificacion < timezone.now().date() and self.estado not in ['REALIZADA', 'CANCELADA']:
            return True
        return False

    @property
    def dias_restantes(self):
        """
        Calcula los días restantes hasta el vencimiento.
        Negativo si está vencida.
        """
        from django.utils import timezone
        delta = self.fecha_planificacion - timezone.now().date()
        return delta.days
```

### Modelo de Adjuntos: `TAdjuntoActividad`

```python
# infrastructure/models/medida/TAdjuntoActividad.py

class TAdjuntoActividad(models.Model):
    """
    PLTM-01: Archivos adjuntos de actividades.
    Soporta múltiples tipos: Acta Compromiso, Evidencia, etc.
    """

    TIPO_ADJUNTO_CHOICES = [
        ('ACTA_COMPROMISO', 'Acta Compromiso'),
        ('EVIDENCIA', 'Evidencia'),
        ('INFORME', 'Informe'),
        ('FOTO', 'Fotografía'),
        ('OTRO', 'Otro')
    ]

    actividad = models.ForeignKey(
        TActividad,
        on_delete=models.CASCADE,
        related_name='adjuntos'
    )

    tipo_adjunto = models.CharField(
        max_length=30,
        choices=TIPO_ADJUNTO_CHOICES,
        help_text="Tipo de documento adjunto"
    )

    archivo = models.FileField(
        upload_to='adjuntos/actividades/',
        help_text="Archivo adjunto (PDF, JPG, PNG)"
    )

    descripcion = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Descripción del adjunto"
    )

    fecha_carga = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp de carga del archivo"
    )

    usuario_carga = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        help_text="Usuario que subió el archivo"
    )

    class Meta:
        db_table = 'adjunto_actividad'
        verbose_name = 'Adjunto de Actividad'
        verbose_name_plural = 'Adjuntos de Actividades'
        ordering = ['tipo_adjunto', '-fecha_carga']

    def __str__(self):
        return f"{self.tipo_adjunto} - {self.actividad.id}"

    def clean(self):
        """
        Validar extensión de archivo.
        """
        from django.core.exceptions import ValidationError

        if self.archivo:
            extension = self.archivo.name.split('.')[-1].lower()
            extensiones_permitidas = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx']

            if extension not in extensiones_permitidas:
                raise ValidationError({
                    'archivo': f'Extensión no permitida. Permitidas: {", ".join(extensiones_permitidas)}'
                })
```

## 🔧 SERIALIZERS

### Serializer de Tipo de Actividad: `TTipoActividadSerializer`

```python
# api/serializers/TTipoActividadSerializer.py

from rest_framework import serializers
from infrastructure.models.medida import TTipoActividad


class TTipoActividadSerializer(serializers.ModelSerializer):
    """
    Serializer para tipos de actividad (catálogo).
    """
    actor_display = serializers.CharField(source='get_actor_display', read_only=True)

    class Meta:
        model = TTipoActividad
        fields = [
            'id',
            'actor',
            'actor_display',
            'nombre',
            'descripcion',
            'requiere_evidencia',
            'activo',
            'orden',
            'fecha_creacion'
        ]
        read_only_fields = ['id', 'fecha_creacion', 'actor_display']
```

### Serializer de Adjuntos: `TAdjuntoActividadSerializer`

```python
# api/serializers/TAdjuntoActividadSerializer.py

from rest_framework import serializers
from infrastructure.models.medida import TAdjuntoActividad
from api.serializers.TCustomUserSerializer import TCustomUserSerializer


class TAdjuntoActividadSerializer(serializers.ModelSerializer):
    """
    Serializer para adjuntos de actividades.
    """
    archivo_url = serializers.SerializerMethodField()
    usuario_carga_info = TCustomUserSerializer(source='usuario_carga', read_only=True)
    tipo_adjunto_display = serializers.CharField(source='get_tipo_adjunto_display', read_only=True)

    class Meta:
        model = TAdjuntoActividad
        fields = [
            'id',
            'tipo_adjunto',
            'tipo_adjunto_display',
            'archivo',
            'archivo_url',
            'descripcion',
            'fecha_carga',
            'usuario_carga',
            'usuario_carga_info'
        ]
        read_only_fields = ['id', 'fecha_carga', 'usuario_carga', 'tipo_adjunto_display']

    def get_archivo_url(self, obj):
        if obj.archivo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.archivo.url)
        return None
```

### Serializer Principal: `TActividadSerializer`

```python
# api/serializers/TActividadSerializer.py

from rest_framework import serializers
from infrastructure.models.medida import TActividad, TAdjuntoActividad, TTipoActividad
from api.serializers.TCustomUserSerializer import TCustomUserSerializer
from api.serializers.TAdjuntoActividadSerializer import TAdjuntoActividadSerializer
from api.serializers.TTipoActividadSerializer import TTipoActividadSerializer
from django.utils import timezone


class TActividadSerializer(serializers.ModelSerializer):
    """
    Serializer para actividades del plan de trabajo (PLTM-01).
    """
    # Read-only nested serializers
    tipo_actividad_info = TTipoActividadSerializer(source='tipo_actividad', read_only=True)
    responsable_principal_info = TCustomUserSerializer(source='responsable_principal', read_only=True)
    responsables_secundarios_info = TCustomUserSerializer(source='responsables_secundarios', many=True, read_only=True)
    usuario_creacion_info = TCustomUserSerializer(source='usuario_creacion', read_only=True)
    adjuntos = TAdjuntoActividadSerializer(many=True, read_only=True)

    # Display fields
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    actor_display = serializers.CharField(source='get_actor_display', read_only=True)
    origen_display = serializers.CharField(source='get_origen_display', read_only=True)

    # Computed fields
    esta_vencida = serializers.BooleanField(read_only=True)
    dias_restantes = serializers.IntegerField(read_only=True)

    # Write-only para archivos adjuntos
    adjuntos_archivos = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        required=False,
        allow_empty=True
    )

    adjuntos_tipos = serializers.ListField(
        child=serializers.ChoiceField(choices=TAdjuntoActividad.TIPO_ADJUNTO_CHOICES),
        write_only=True,
        required=False,
        allow_empty=True
    )

    adjuntos_descripciones = serializers.ListField(
        child=serializers.CharField(allow_blank=True, required=False),
        write_only=True,
        required=False,
        allow_empty=True
    )

    class Meta:
        model = TActividad
        fields = [
            'id',
            'plan_trabajo',
            'tipo_actividad',
            'tipo_actividad_info',
            'subactividad',
            'actor',
            'actor_display',
            'fecha_planificacion',
            'fecha_inicio_real',
            'fecha_finalizacion_real',
            'estado',
            'estado_display',
            'descripcion',
            'responsable_principal',
            'responsable_principal_info',
            'responsables_secundarios',
            'responsables_secundarios_info',
            'referentes_externos',
            'origen',
            'origen_display',
            'origen_demanda',
            'origen_oficio',
            'es_borrador',
            'usuario_creacion',
            'usuario_creacion_info',
            'fecha_creacion',
            'usuario_modificacion',
            'fecha_modificacion',
            'motivo_cancelacion',
            'fecha_cancelacion',
            'usuario_cancelacion',
            'esta_vencida',
            'dias_restantes',
            'adjuntos',
            # Write-only para adjuntos
            'adjuntos_archivos',
            'adjuntos_tipos',
            'adjuntos_descripciones'
        ]
        read_only_fields = [
            'id',
            'actor',
            'fecha_inicio_real',
            'fecha_finalizacion_real',
            'usuario_creacion',
            'fecha_creacion',
            'usuario_modificacion',
            'fecha_modificacion',
            'fecha_cancelacion',
            'usuario_cancelacion',
            'esta_vencida',
            'dias_restantes',
            'adjuntos'
        ]

    def validate_tipo_actividad(self, value):
        """
        Validar que tipo_actividad esté activo.
        """
        if not value.activo:
            raise serializers.ValidationError(
                "El tipo de actividad seleccionado no está activo."
            )
        return value

    def validate_fecha_planificacion(self, value):
        """
        Validar que fecha_planificacion no sea muy antigua.
        """
        one_year_ago = timezone.now().date() - timedelta(days=365)
        if value < one_year_ago:
            raise serializers.ValidationError(
                "La fecha de planificación no puede ser anterior a 1 año."
            )
        return value

    def validate_responsables_secundarios(self, value):
        """
        Validar que responsables_secundarios no incluya al responsable_principal.
        """
        responsable_principal = self.initial_data.get('responsable_principal')
        if responsable_principal and responsable_principal in [u.id for u in value]:
            raise serializers.ValidationError(
                "El responsable principal no puede estar en la lista de responsables secundarios."
            )
        return value

    def validate(self, attrs):
        """
        Validaciones cruzadas.
        """
        # Validar que si estado es CANCELADA, tenga motivo
        estado = attrs.get('estado', self.instance.estado if self.instance else None)
        motivo_cancelacion = attrs.get('motivo_cancelacion')

        if estado == 'CANCELADA' and not motivo_cancelacion:
            raise serializers.ValidationError({
                'motivo_cancelacion': 'Debe proporcionar un motivo de cancelación.'
            })

        # Validar adjuntos: archivos, tipos y descripciones deben tener la misma longitud
        adjuntos_archivos = attrs.get('adjuntos_archivos', [])
        adjuntos_tipos = attrs.get('adjuntos_tipos', [])
        adjuntos_descripciones = attrs.get('adjuntos_descripciones', [])

        if adjuntos_archivos:
            if len(adjuntos_archivos) != len(adjuntos_tipos):
                raise serializers.ValidationError({
                    'adjuntos_tipos': 'Debe proporcionar un tipo para cada archivo adjunto.'
                })

            # Descripciones opcionales, pero si se proveen, deben coincidir en cantidad
            if adjuntos_descripciones and len(adjuntos_descripciones) != len(adjuntos_archivos):
                raise serializers.ValidationError({
                    'adjuntos_descripciones': 'Las descripciones deben coincidir en cantidad con los archivos.'
                })

        return attrs

    def create(self, validated_data):
        """
        Crear actividad + adjuntos.
        """
        # Extraer adjuntos
        adjuntos_archivos = validated_data.pop('adjuntos_archivos', [])
        adjuntos_tipos = validated_data.pop('adjuntos_tipos', [])
        adjuntos_descripciones = validated_data.pop('adjuntos_descripciones', [])

        # Extraer responsables_secundarios (ManyToMany)
        responsables_secundarios = validated_data.pop('responsables_secundarios', [])

        # Obtener usuario del request
        request = self.context.get('request')
        usuario_creacion = request.user if request else None

        # Crear actividad
        actividad = TActividad.objects.create(
            usuario_creacion=usuario_creacion,
            **validated_data
        )

        # Asignar responsables_secundarios
        if responsables_secundarios:
            actividad.responsables_secundarios.set(responsables_secundarios)

        # Crear adjuntos
        for i, archivo in enumerate(adjuntos_archivos):
            tipo_adjunto = adjuntos_tipos[i]
            descripcion = adjuntos_descripciones[i] if i < len(adjuntos_descripciones) else ''

            TAdjuntoActividad.objects.create(
                actividad=actividad,
                tipo_adjunto=tipo_adjunto,
                archivo=archivo,
                descripcion=descripcion,
                usuario_carga=usuario_creacion
            )

        return actividad

    def update(self, instance, validated_data):
        """
        Actualizar actividad (sin adjuntos en PATCH).
        Adjuntos se gestionan en endpoint separado.
        """
        # Extraer responsables_secundarios
        responsables_secundarios = validated_data.pop('responsables_secundarios', None)

        # Obtener usuario del request
        request = self.context.get('request')
        usuario_modificacion = request.user if request else None

        # Actualizar campos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.usuario_modificacion = usuario_modificacion

        # Si se pasa a CANCELADA, registrar usuario y fecha
        if validated_data.get('estado') == 'CANCELADA':
            instance.usuario_cancelacion = usuario_modificacion
            instance.fecha_cancelacion = timezone.now()

        instance.save()

        # Actualizar responsables_secundarios si se proveen
        if responsables_secundarios is not None:
            instance.responsables_secundarios.set(responsables_secundarios)

        return instance
```

## 🌐 ENDPOINTS

### `POST /api/planes-trabajo/<int:plan_pk>/actividades/`
**Descripción**: Crear actividad en un plan de trabajo.

**Permisos**: Equipo Técnico, JZ (Nivel 3+), Director (Nivel 4+)

**Request Body (multipart/form-data)**:
```json
{
  "tipo_actividad": 1,
  "subactividad": "Visita domiciliaria para evaluación de entorno familiar",
  "fecha_planificacion": "2025-11-25",
  "descripcion": "Evaluación de condiciones habitacionales y dinámica familiar",
  "responsable_principal": 10,
  "responsables_secundarios": [12, 15],
  "referentes_externos": "Nombre: María Gómez, Tel: 3815551234, Institución: Escuela N°5",
  "origen": "MANUAL",
  "es_borrador": false,
  "adjuntos_archivos": ["<binary file 1>", "<binary file 2>"],
  "adjuntos_tipos": ["ACTA_COMPROMISO", "EVIDENCIA"],
  "adjuntos_descripciones": ["Acta firmada", "Foto del domicilio"]
}
```

**Response Success (201)**:
```json
{
  "id": 1,
  "plan_trabajo": 5,
  "tipo_actividad": 1,
  "tipo_actividad_info": {
    "id": 1,
    "actor": "EQUIPO_TECNICO",
    "actor_display": "Equipo Técnico",
    "nombre": "Visita Domiciliaria",
    "descripcion": "Visita al hogar del niño/adolescente",
    "requiere_evidencia": true,
    "activo": true,
    "orden": 1
  },
  "subactividad": "Visita domiciliaria para evaluación de entorno familiar",
  "actor": "EQUIPO_TECNICO",
  "actor_display": "Equipo Técnico",
  "fecha_planificacion": "2025-11-25",
  "fecha_inicio_real": null,
  "fecha_finalizacion_real": null,
  "estado": "PENDIENTE",
  "estado_display": "Pendiente",
  "descripcion": "Evaluación de condiciones habitacionales y dinámica familiar",
  "responsable_principal": 10,
  "responsable_principal_info": {
    "id": 10,
    "username": "tecnico_user",
    "full_name": "Juan Pérez"
  },
  "responsables_secundarios": [12, 15],
  "responsables_secundarios_info": [
    {
      "id": 12,
      "username": "tecnico_user2",
      "full_name": "Ana López"
    },
    {
      "id": 15,
      "username": "tecnico_user3",
      "full_name": "Carlos Ruiz"
    }
  ],
  "referentes_externos": "Nombre: María Gómez, Tel: 3815551234, Institución: Escuela N°5",
  "origen": "MANUAL",
  "origen_display": "Creación Manual",
  "origen_demanda": null,
  "origen_oficio": null,
  "es_borrador": false,
  "usuario_creacion": 10,
  "usuario_creacion_info": {
    "id": 10,
    "username": "tecnico_user",
    "full_name": "Juan Pérez"
  },
  "fecha_creacion": "2025-11-01T10:00:00Z",
  "usuario_modificacion": null,
  "fecha_modificacion": "2025-11-01T10:00:00Z",
  "motivo_cancelacion": null,
  "fecha_cancelacion": null,
  "usuario_cancelacion": null,
  "esta_vencida": false,
  "dias_restantes": 24,
  "adjuntos": [
    {
      "id": 1,
      "tipo_adjunto": "ACTA_COMPROMISO",
      "tipo_adjunto_display": "Acta Compromiso",
      "archivo_url": "http://localhost:8000/media/adjuntos/actividades/acta_123.pdf",
      "descripcion": "Acta firmada",
      "fecha_carga": "2025-11-01T10:00:00Z",
      "usuario_carga": 10,
      "usuario_carga_info": {
        "id": 10,
        "username": "tecnico_user",
        "full_name": "Juan Pérez"
      }
    },
    {
      "id": 2,
      "tipo_adjunto": "EVIDENCIA",
      "tipo_adjunto_display": "Evidencia",
      "archivo_url": "http://localhost:8000/media/adjuntos/actividades/foto_domicilio_123.jpg",
      "descripcion": "Foto del domicilio",
      "fecha_carga": "2025-11-01T10:00:00Z",
      "usuario_carga": 10,
      "usuario_carga_info": {
        "id": 10,
        "username": "tecnico_user",
        "full_name": "Juan Pérez"
      }
    }
  ]
}
```

**Response Error (400)**:
```json
{
  "tipo_actividad": ["El tipo de actividad seleccionado no está activo."],
  "fecha_planificacion": ["La fecha de planificación no puede ser anterior a 1 año."],
  "motivo_cancelacion": ["Debe proporcionar un motivo de cancelación."]
}
```

**Response Error (403)**:
```json
{
  "detail": "No tiene permisos para crear actividades. Debe ser Equipo Técnico, JZ o Director."
}
```

### `GET /api/planes-trabajo/<int:plan_pk>/actividades/`
**Descripción**: Listar actividades de un plan de trabajo.

**Permisos**: Equipo Técnico, JZ, Director, Legal (lectura)

**Query Parameters**:
- `estado`: Filtrar por estado (PENDIENTE, EN_PROGRESO, REALIZADA, CANCELADA, VENCIDA)
- `actor`: Filtrar por actor (EQUIPO_TECNICO, EQUIPOS_RESIDENCIALES, ADULTOS_INSTITUCION, EQUIPO_LEGAL)
- `responsable_principal`: Filtrar por ID de responsable
- `fecha_desde`: Filtrar desde fecha (formato: YYYY-MM-DD)
- `fecha_hasta`: Filtrar hasta fecha (formato: YYYY-MM-DD)
- `origen`: Filtrar por origen (MANUAL, DEMANDA_PI, DEMANDA_OFICIO, OFICIO)
- `es_borrador`: Filtrar por borrador (true/false)
- `ordering`: Ordenar por campo (fecha_planificacion, -fecha_creacion, estado)

**Response Success (200)**:
```json
{
  "count": 15,
  "next": "http://localhost:8000/api/planes-trabajo/5/actividades/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "tipo_actividad_info": {...},
      "subactividad": "Visita domiciliaria para evaluación de entorno familiar",
      "actor_display": "Equipo Técnico",
      "fecha_planificacion": "2025-11-25",
      "estado_display": "Pendiente",
      "responsable_principal_info": {...},
      "esta_vencida": false,
      "dias_restantes": 24,
      "adjuntos": [...]
    },
    ...
  ]
}
```

### `GET /api/actividades/<int:actividad_id>/`
**Descripción**: Obtener detalle de una actividad específica.

**Permisos**: Equipo Técnico, JZ, Director, Legal (lectura)

**Response Success (200)**: Mismo formato que POST

**Response Error (404)**:
```json
{
  "detail": "No se encontró la actividad."
}
```

### `PATCH /api/actividades/<int:actividad_id>/`
**Descripción**: Modificar actividad (sin adjuntos).

**Permisos**: Responsable de la actividad, JZ, Director, Admin

**Request Body (parcial)**:
```json
{
  "estado": "EN_PROGRESO",
  "descripcion": "Actualizando estado a En Progreso"
}
```

**Response Success (200)**: Mismo formato que GET

**Response Error (403)**:
```json
{
  "detail": "No tiene permisos para modificar esta actividad."
}
```

### `DELETE /api/actividades/<int:actividad_id>/`
**Descripción**: Cancelar actividad (soft delete).

**Permisos**: Responsable de la actividad, JZ, Director, Admin

**Request Body**:
```json
{
  "motivo_cancelacion": "Actividad duplicada, se canceló por error administrativo"
}
```

**Response Success (200)**:
```json
{
  "detail": "Actividad cancelada exitosamente.",
  "actividad": {
    "id": 1,
    "estado": "CANCELADA",
    "motivo_cancelacion": "Actividad duplicada, se canceló por error administrativo",
    "fecha_cancelacion": "2025-11-02T14:30:00Z",
    "usuario_cancelacion": 10
  }
}
```

**Response Error (400)**:
```json
{
  "motivo_cancelacion": ["Debe proporcionar un motivo de cancelación."]
}
```

### `POST /api/actividades/<int:actividad_id>/adjuntos/`
**Descripción**: Agregar adjuntos a una actividad existente.

**Permisos**: Responsable, responsables_secundarios, JZ, Director

**Request Body (multipart/form-data)**:
```json
{
  "tipo_adjunto": "EVIDENCIA",
  "archivo": "<binary file>",
  "descripcion": "Nueva evidencia fotográfica"
}
```

**Response Success (201)**:
```json
{
  "id": 3,
  "tipo_adjunto": "EVIDENCIA",
  "tipo_adjunto_display": "Evidencia",
  "archivo_url": "http://localhost:8000/media/adjuntos/actividades/evidencia_nueva_123.jpg",
  "descripcion": "Nueva evidencia fotográfica",
  "fecha_carga": "2025-11-03T10:00:00Z",
  "usuario_carga": 10,
  "usuario_carga_info": {
    "id": 10,
    "username": "tecnico_user",
    "full_name": "Juan Pérez"
  }
}
```

### `GET /api/tipos-actividad/`
**Descripción**: Listar tipos de actividad disponibles (catálogo).

**Permisos**: Todos los usuarios autenticados

**Query Parameters**:
- `actor`: Filtrar por actor (EQUIPO_TECNICO, EQUIPOS_RESIDENCIALES, ADULTOS_INSTITUCION, EQUIPO_LEGAL)
- `activo`: Filtrar por activo (true/false)

**Response Success (200)**:
```json
{
  "count": 15,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "actor": "EQUIPO_TECNICO",
      "actor_display": "Equipo Técnico",
      "nombre": "Visita Domiciliaria",
      "descripcion": "Visita al hogar del niño/adolescente",
      "requiere_evidencia": true,
      "activo": true,
      "orden": 1
    },
    {
      "id": 2,
      "actor": "EQUIPO_TECNICO",
      "actor_display": "Equipo Técnico",
      "nombre": "Entrevista con Referentes",
      "descripcion": "Entrevista con adultos responsables o referentes comunitarios",
      "requiere_evidencia": false,
      "activo": true,
      "orden": 2
    },
    ...
  ]
}
```

### `POST /api/actividades/marcar-vencidas/`
**Descripción**: Endpoint administrativo para auto-marcar actividades vencidas (ejecutado por cron).

**Permisos**: Admin only

**Response Success (200)**:
```json
{
  "detail": "Se marcaron 5 actividades como vencidas.",
  "count": 5
}
```

## ✅ CRITERIOS DE ACEPTACIÓN

### CA-01: Creación Manual de Actividad
- [ ] Usuario Equipo Técnico, JZ o Director puede crear actividades
- [ ] Campos obligatorios: `tipo_actividad`, `subactividad`, `fecha_planificacion`, `responsable_principal`
- [ ] Actor se auto-completa desde `tipo_actividad.actor`
- [ ] Se puede guardar como **Borrador** (`es_borrador=True`)
- [ ] Error 400 si faltan campos obligatorios

### CA-02: Auto-creación desde Demanda PI
- [ ] Si Demanda tiene objetivo "Petición de Informe (PI)": crear actividad automáticamente
- [ ] `origen = 'DEMANDA_PI'`
- [ ] `origen_demanda` apunta a la demanda origen
- [ ] `tipo_actividad` se asigna según tipo de PI
- [ ] Sistema registra en auditoría la auto-creación

### CA-03: Auto-creación desde Oficio Judicial
- [ ] Si Oficio judicial se carga: crear actividad automáticamente según tipo
- [ ] **Tipos de Oficio y Actores Responsables**:
  - [ ] **Ratificación de Medida** → Actor: `EQUIPO_LEGAL`, Actividad: "Gestionar Ratificación Judicial"
  - [ ] **Pedido de Informe** → Actor: `EQUIPO_LEGAL`, Actividad: "Responder Pedido Judicial"
  - [ ] **Orden de Medida** → Actor: `EQUIPO_TECNICO`, Actividad: "Ejecutar Medida Ordenada"
  - [ ] **Otros** → Actor: `EQUIPO_LEGAL`, Actividad: "Gestionar Oficio Judicial"
- [ ] `origen = 'OFICIO'`
- [ ] `origen_oficio` apunta al oficio origen
- [ ] `tipo_actividad` se asigna automáticamente según tipo de Oficio
- [ ] `responsable_principal` se asigna según actor: Jefe de Legales o Jefe Técnico
- [ ] **Notificaciones**: Enviar a Equipo Legal + JZ + Equipo Técnico del legajo
- [ ] **Vincular con MED-05**: Si es "Ratificación", crear registro MED-05 en estado PENDIENTE
- [ ] Sistema registra en auditoría la auto-creación con tipo de Oficio

### CA-04: Tabs por Actor
- [ ] Modal "Plan de Acción MPE" tiene 4 tabs:
  - [ ] Equipo técnico
  - [ ] Equipos residenciales
  - [ ] Adultos responsables/Institución
  - [ ] Equipo de Legales (solo visible para usuarios con `legal=True`)
- [ ] Cada tab filtra `TTipoActividad` por `actor`
- [ ] Actividad creada hereda el `actor` del tab activo

### CA-05: Adjuntos Múltiples
- [ ] Se pueden adjuntar múltiples archivos al crear actividad
- [ ] Tipos soportados: ACTA_COMPROMISO, EVIDENCIA, INFORME, FOTO, OTRO
- [ ] Extensiones permitidas: PDF, JPG, JPEG, PNG, DOC, DOCX
- [ ] Cada adjunto tiene descripción opcional
- [ ] Error 400 si extensión no permitida

### CA-06: Estados y Transiciones
- [ ] Estado inicial: `PENDIENTE`
- [ ] Transición manual: `PENDIENTE` → `EN_PROGRESO` → `REALIZADA`
- [ ] Transición manual: `PENDIENTE/EN_PROGRESO` → `CANCELADA` (requiere motivo)
- [ ] Transición automática: `PENDIENTE/EN_PROGRESO` → `VENCIDA` (si fecha_planificacion < hoy)
- [ ] Sistema marca `fecha_inicio_real` al pasar a `EN_PROGRESO`
- [ ] Sistema marca `fecha_finalizacion_real` al pasar a `REALIZADA`

### CA-07: Validaciones de Negocio
- [ ] `fecha_planificacion` no puede ser anterior a 1 año
- [ ] `tipo_actividad` debe estar activo
- [ ] Si `estado = CANCELADA`: `motivo_cancelacion` es obligatorio
- [ ] Actor debe coincidir con `tipo_actividad.actor`
- [ ] Responsable principal no puede estar en `responsables_secundarios`

### CA-08: Permisos por Rol y Zona
- [ ] Creación: Equipo Técnico, JZ (Nivel 3+), Director (Nivel 4+)
- [ ] Edición: Responsable, JZ, Director, Admin
- [ ] Lectura: Todos los roles (incluido Legal)
- [ ] Validar zona del usuario con `TCustomUserZona`
- [ ] Error 403 si usuario no autorizado

### CA-09: Deep-links Requeridos
- [ ] Actividad vinculada a `plan_trabajo` → `medida` → `legajo`
- [ ] Si origen es DEMANDA_PI: link a `origen_demanda`
- [ ] Si origen es OFICIO: link a `origen_oficio`
- [ ] Frontend puede navegar desde actividad a cualquier entidad relacionada

### CA-10: Notificaciones Configurables
- [ ] Al crear actividad con plazo: notificar a `responsable_principal`
- [ ] Recordatorios automáticos:
  - [ ] N-3 días antes del vencimiento
  - [ ] N-1 día antes del vencimiento
  - [ ] Día N (día del vencimiento)
- [ ] Notificar a `responsables_secundarios` si están configurados
- [ ] Notificaciones in-app y email (configurable)
- [ ] Registrar envío en tabla de notificaciones

### CA-11: Auditoría Completa
- [ ] Registrar `usuario_creacion` en creación
- [ ] Registrar `fecha_creacion` automáticamente
- [ ] Registrar `usuario_modificacion` en cada actualización
- [ ] Registrar `fecha_modificacion` en cada actualización
- [ ] Si se cancela: registrar `usuario_cancelacion` y `fecha_cancelacion`
- [ ] Mantener historial inmutable de cambios

### CA-12: Response Structure Completa
- [ ] Incluir datos de actividad completos
- [ ] Incluir `tipo_actividad_info` (nested serializer)
- [ ] Incluir `responsable_principal_info` y `responsables_secundarios_info`
- [ ] Incluir adjuntos con URLs completas
- [ ] Incluir campos computados: `esta_vencida`, `dias_restantes`
- [ ] Formato JSON consistente con MED y LEG

### CA-13: Casos Edge
- [ ] Impedir creación de actividad sin `tipo_actividad` activo
- [ ] Impedir cancelación sin motivo
- [ ] Impedir modificación de actividad `REALIZADA` o `CANCELADA` (solo Admin/JZ puede reabrir)
- [ ] Impedir acceso si usuario no pertenece a zona del legajo
- [ ] Error 400 con mensajes claros por campo

### CA-14: Funcionalidad de Borrador
- [ ] Se puede guardar actividad como borrador (`es_borrador=True`)
- [ ] Actividades borrador no generan notificaciones
- [ ] Actividades borrador no se cuentan en métricas de informes
- [ ] Al publicar borrador (`es_borrador=False`): generar notificaciones

### CA-15: Testing Completo
- [ ] Mínimo 15 tests unitarios cubriendo:
  - [ ] Creación manual exitosa
  - [ ] Auto-creación desde Demanda PI
  - [ ] Auto-creación desde Oficio
  - [ ] Validación de campos obligatorios
  - [ ] Validación de tipo_actividad activo
  - [ ] Transiciones de estado
  - [ ] Auto-marcado de VENCIDA
  - [ ] Adjuntos múltiples
  - [ ] Permisos por rol
  - [ ] Validación de zona
  - [ ] Borrador y publicación
  - [ ] Cancelación con motivo
  - [ ] Casos edge (modificación de finalizada, etc.)
  - [ ] Deep-links correctos
  - [ ] Notificaciones automáticas
- [ ] Coverage >90% del código relacionado

## 🧪 CASOS DE USO DETALLADOS

### Caso de Uso 1: Creación Manual de Actividad por Equipo Técnico
**Precondiciones**:
- Plan de Trabajo existe para la medida
- Usuario es Equipo Técnico de la zona del legajo
- Tipos de actividad están configurados en el sistema

**Flujo**:
1. Usuario accede a la medida en el sistema
2. Navega a la pestaña "Plan de Trabajo"
3. Presiona botón "Crear Actividad"
4. Sistema abre modal "Plan de Acción MPE"
5. Selecciona tab "Equipo técnico"
6. Selecciona tipo: "Visita Domiciliaria"
7. Ingresa subactividad: "Evaluación de entorno familiar"
8. Ingresa fecha de planificación: 2025-11-25
9. Ingresa descripción: "Verificar condiciones habitacionales"
10. Selecciona responsable principal: Juan Pérez (auto-completa)
11. Agrega responsable secundario: Ana López
12. Ingresa referentes externos: "Escuela N°5 - María Gómez - 381555123"
13. Adjunta archivo: acta_compromiso.pdf (tipo: ACTA_COMPROMISO)
14. Presiona "Guardar"

**Resultado**:
- Sistema crea actividad con `estado=PENDIENTE`
- Sistema auto-completa `actor=EQUIPO_TECNICO`
- Sistema registra `usuario_creacion=Juan Pérez`
- Sistema crea adjunto con `tipo_adjunto=ACTA_COMPROMISO`
- Sistema envía notificación a Juan Pérez y Ana López
- Sistema programa recordatorios para 2025-11-22, 2025-11-24, 2025-11-25
- Usuario ve confirmación: "Actividad creada exitosamente"

### Caso de Uso 2A: Auto-creación desde Demanda PI (Equipo Técnico)
**Precondiciones**:
- Demanda registrada con objetivo "Petición de Informe (PI)"
- Demanda asignada a un legajo con medida activa
- Plan de Trabajo existe para la medida

**Flujo**:
1. Sistema detecta nueva Demanda con objetivo "PI"
2. Sistema identifica legajo y medida asociados
3. Sistema obtiene plan_trabajo de la medida
4. Sistema crea actividad automáticamente:
   - `tipo_actividad`: "Elaboración de Informe" (según tipo PI)
   - `subactividad`: "Informe solicitado por Juzgado X"
   - `fecha_planificacion`: fecha_vencimiento de la demanda
   - `responsable_principal`: Jefe de Equipo Técnico de la zona
   - `actor`: "EQUIPO_TECNICO"
   - `origen`: "DEMANDA_PI"
   - `origen_demanda`: ID de la demanda
5. Sistema registra en auditoría la auto-creación
6. Sistema notifica al responsable asignado (Equipo Técnico)

**Resultado**:
- Actividad creada automáticamente con origen trazable
- Responsable notificado con deep-link a la demanda
- Plazo sincronizado con vencimiento de la demanda
- Auditoría completa del proceso de auto-creación

### Caso de Uso 2B: Auto-creación desde Oficio Judicial (Equipo Legal)
**Precondiciones**:
- Demanda registrada con objetivo "Carga de Oficios"
- Oficio registrado con tipo específico (Ratificación, Pedido de Informe, Orden de Medida)
- Legajo con medida activa asociado
- Plan de Trabajo existe para la medida

**Flujo - Caso 1: Oficio de Ratificación**:
1. Usuario de Mesa de Entrada registra Demanda con objetivo "Carga de Oficios"
2. Sistema abre asistente de registro de Oficio
3. Usuario selecciona tipo: "Ratificación de Medida"
4. Usuario completa datos: Juzgado, Carátula, Expediente, Fecha, Adjunto PDF
5. Sistema vincula Oficio a Legajo y Medida existente
6. Sistema ejecuta auto-creación:
   - Crea actividad con `tipo_actividad`: "Gestionar Ratificación Judicial" (pk: 11)
   - `subactividad`: "Ratificación - Exp. [Número] - [Juzgado]"
   - `fecha_planificacion`: fecha_vencimiento del Oficio
   - `responsable_principal`: Jefe de Equipo Legal de la zona
   - `actor`: "EQUIPO_LEGAL"
   - `origen`: "OFICIO"
   - `origen_oficio`: ID del oficio
7. **Integración MED-05**: Sistema crea registro TRatificacionJudicial en estado PENDIENTE
8. Sistema genera deep-link desde actividad a MED-05
9. Sistema envía notificaciones:
   - Equipo Legal de la zona
   - Jefe Zonal (JZ)
   - Equipo Técnico del legajo
10. Sistema bloquea Demanda para acciones no judiciales

**Resultado**:
- Actividad de Ratificación asignada a Equipo Legal
- Registro MED-05 creado en estado PENDIENTE
- Deep-link bidireccional: Actividad ↔ MED-05 ↔ Oficio
- Notificaciones enviadas a 3 actores: Legal, JZ, Técnico
- Demanda bloqueada hasta cierre de ratificación

**Flujo - Caso 2: Oficio de Pedido de Informe**:
1-5. [Mismo flujo inicial]
6. Sistema ejecuta auto-creación:
   - Crea actividad con `tipo_actividad`: "Responder Pedido Judicial" (pk: 12)
   - `subactividad`: "Respuesta a pedido judicial - Exp. [Número]"
   - `actor`: "EQUIPO_LEGAL"
   - `responsable_principal`: Jefe de Equipo Legal
7. Sistema genera deep-link a CONS-03 (Envío de respuestas)
8. Sistema notifica a Legal, JZ, Técnico
9. Cierre de actividad requiere adjuntar acuse de recibo

**Resultado**:
- Actividad de Respuesta asignada a Equipo Legal
- Deep-link a CONS-03 para envío de respuesta
- Validación obligatoria de acuse de recibo al cerrar

**Flujo - Caso 3: Oficio de Orden de Medida**:
1-5. [Mismo flujo inicial]
6. Sistema ejecuta auto-creación:
   - Crea actividad con `tipo_actividad`: "Ejecutar Medida Ordenada" (pk: 13 - EQUIPO_TECNICO)
   - `subactividad`: "Ejecutar medida ordenada - Exp. [Número]"
   - `actor`: "EQUIPO_TECNICO" (Excepción: este tipo es para Equipo Técnico)
   - `responsable_principal`: Jefe de Equipo Técnico de la zona
7. Sistema genera deep-link a MED-01/MED-02 para registro/intervención
8. Sistema notifica a Técnico, Legal, JZ

**Resultado**:
- Actividad de Ejecución asignada a Equipo Técnico
- Deep-link a MED-01/02 para gestión de medida
- Coordinación entre Técnico (ejecutor) y Legal (judicial)

**Auditoría Completa**:
- Registro de tipo de Oficio que generó la actividad
- Timestamps de creación automática
- Usuario que registró el Oficio
- Trazabilidad completa: Demanda → Oficio → Actividad → MED-05 (si aplica)

### Caso de Uso 3: Transición de Estado: PENDIENTE → EN_PROGRESO → REALIZADA
**Precondiciones**:
- Actividad existe con `estado=PENDIENTE`
- Usuario es responsable principal de la actividad

**Flujo**:
1. Usuario accede a la actividad
2. Presiona botón "Iniciar Actividad"
3. Sistema cambia `estado` a `EN_PROGRESO`
4. Sistema marca `fecha_inicio_real` con fecha actual
5. Sistema registra `usuario_modificacion`
6. Usuario ejecuta la actividad (visita, entrevista, etc.)
7. Usuario regresa al sistema
8. Presiona botón "Marcar como Realizada"
9. Sistema valida si `tipo_actividad.requiere_evidencia=True`:
   - Si es True: exige adjuntar evidencia obligatoria
10. Usuario adjunta evidencia (foto, acta, informe)
11. Sistema cambia `estado` a `REALIZADA`
12. Sistema marca `fecha_finalizacion_real` con fecha actual
13. Sistema registra `usuario_modificacion`
14. Sistema notifica a responsables_secundarios y JZ

**Resultado**:
- Actividad completada con timestamps reales
- Evidencia adjuntada y trazable
- Auditoría completa del ciclo de vida
- Métricas actualizadas para informes mensuales

### Caso de Uso 4: Auto-marcado de Actividad VENCIDA
**Precondiciones**:
- Actividad existe con `estado=PENDIENTE` o `EN_PROGRESO`
- `fecha_planificacion` < fecha actual
- Cron job configurado para ejecutar diariamente

**Flujo**:
1. Cron job ejecuta a las 00:00 hrs diariamente
2. Sistema ejecuta `TActividad.marcar_vencidas()`
3. Sistema filtra actividades con:
   - `fecha_planificacion < hoy`
   - `estado IN ('PENDIENTE', 'EN_PROGRESO')`
4. Sistema cambia `estado` a `VENCIDA` en todas las actividades filtradas
5. Sistema registra cantidad de actividades marcadas
6. Sistema envía notificación a responsables principales
7. Sistema notifica a JZ/Director con listado de actividades vencidas

**Resultado**:
- Actividades vencidas identificadas automáticamente
- Responsables notificados para tomar acciones correctivas
- Métricas de vencimiento actualizadas
- Reporte de actividades vencidas disponible para auditoría

### Caso de Uso 5: Cancelación de Actividad con Motivo
**Precondiciones**:
- Actividad existe con `estado=PENDIENTE` o `EN_PROGRESO`
- Usuario es responsable, JZ, Director o Admin

**Flujo**:
1. Usuario accede a la actividad
2. Presiona botón "Cancelar Actividad"
3. Sistema abre modal de cancelación
4. Sistema exige ingresar `motivo_cancelacion`
5. Usuario ingresa: "Actividad duplicada, ya se realizó en otra medida"
6. Usuario confirma cancelación
7. Sistema cambia `estado` a `CANCELADA`
8. Sistema marca `usuario_cancelacion` y `fecha_cancelacion`
9. Sistema bloquea edición de la actividad (solo lectura)
10. Sistema notifica a responsables y JZ/Director

**Resultado**:
- Actividad cancelada con motivo trazable
- Auditoría completa del motivo de cancelación
- Actividad bloqueada para evitar modificaciones accidentales
- Notificaciones enviadas a stakeholders

### Caso de Uso 6: Agregar Adjunto a Actividad Existente
**Precondiciones**:
- Actividad existe con `estado=EN_PROGRESO`
- Usuario es responsable principal o secundario

**Flujo**:
1. Usuario accede a la actividad
2. Navega a la sección "Adjuntos"
3. Presiona botón "Agregar Adjunto"
4. Selecciona tipo: "EVIDENCIA"
5. Sube archivo: foto_visita_domiciliaria.jpg
6. Ingresa descripción: "Foto del hogar durante visita"
7. Presiona "Guardar"
8. Sistema valida extensión (JPG permitido)
9. Sistema crea adjunto vinculado a la actividad
10. Sistema registra `usuario_carga` y `fecha_carga`

**Resultado**:
- Adjunto agregado exitosamente con metadata completa
- Archivo disponible para descarga con URL completa
- Auditoría de carga registrada
- Usuario ve confirmación: "Adjunto agregado exitosamente"

## 📐 DIAGRAMA DE FLUJO COMPLETO PLTM-01

### Flujo de Creación y Ciclo de Vida de Actividades

```mermaid
graph TD
    subgraph "Creación de Actividad"
        A[Trigger: Manual / Demanda PI / Oficio] --> B{Tipo de Origen}
        B -- MANUAL --> C[Usuario crea desde modal]
        B -- DEMANDA_PI --> D[Sistema auto-crea desde PI]
        D --> D1[Actor: EQUIPO_TECNICO]
        B -- OFICIO --> E{Tipo de Oficio}

        E -- Ratificación --> E1[Actor: EQUIPO_LEGAL]
        E1 --> E1A[Crear MED-05 PENDIENTE]
        E1A --> E1B[Deep-link: Actividad ↔ MED-05]

        E -- Pedido Informe --> E2[Actor: EQUIPO_LEGAL]
        E2 --> E2A[Deep-link: CONS-03]

        E -- Orden Medida --> E3[Actor: EQUIPO_TECNICO]
        E3 --> E3A[Deep-link: MED-01/02]

        E -- Otros --> E4[Actor: EQUIPO_LEGAL]

        C --> F[Validar campos obligatorios]
        D1 --> F
        E1B --> F
        E2A --> F
        E3A --> F
        E4 --> F

        F --> G{Validación OK?}
        G -- NO --> H[Error 400: Mostrar errores]
        G -- SÍ --> I[Crear TActividad]

        I --> J[Auto-completar actor desde tipo_actividad]
        J --> K[Crear adjuntos si existen]
        K --> L[Asignar responsables_secundarios]
        L --> M{es_borrador?}
        M -- SÍ --> N[Guardar sin notificar]
        M -- NO --> O{Actor?}
        O -- EQUIPO_LEGAL --> O1[Notif: Legal + JZ + Técnico]
        O -- EQUIPO_TECNICO --> O2[Notif: Técnico + JZ]
        O -- OTROS --> O3[Notif: Responsable + JZ]
        O1 --> P[Programar recordatorios N-3, N-1, N]
        O2 --> P
        O3 --> P
    end

    subgraph "Ciclo de Vida"
        P --> Q[Estado: PENDIENTE]
        Q --> R{Acción del usuario}
        R -- Iniciar --> S[Estado: EN_PROGRESO]
        R -- Cancelar --> T[Estado: CANCELADA - Exige motivo]

        S --> U{Acción del usuario}
        U -- Completar --> V{requiere_evidencia?}
        V -- SÍ --> W[Validar adjuntos obligatorios]
        V -- NO --> X[Estado: REALIZADA]
        W -- OK --> X
        W -- FALTA --> Y[Error: Adjuntar evidencia]
        U -- Cancelar --> T

        Q --> Z{fecha_planificacion < hoy?}
        S --> Z
        Z -- SÍ --> AA[Cron: Estado VENCIDA]
        Z -- NO --> AB[Mantener estado actual]
    end

    subgraph "Notificaciones"
        P --> AC[Notif: Creación a responsables]
        S --> AD[Notif: Inicio a secundarios]
        X --> AE[Notif: Completada a JZ/Director]
        T --> AF[Notif: Cancelada a stakeholders]
        AA --> AG[Notif: Vencida a responsables]
    end
```

## 📝 NOTAS DE IMPLEMENTACIÓN

### Orden de Implementación
1. **Modelo Catálogo**: `TTipoActividad`
2. **Fixture**: Poblar `TTipoActividad` con tipos predefinidos
3. **Modelo Extendido**: Actualizar `TActividad` con campos nuevos
4. **Modelo Adjuntos**: `TAdjuntoActividad`
5. **Serializers**: `TTipoActividadSerializer`, `TAdjuntoActividadSerializer`, `TActividadSerializer`
6. **ViewSets**: `TTipoActividadViewSet`, `TActividadViewSet`
7. **URLs**: Registrar endpoints en `api/urls.py`
8. **Tests**: Mínimo 15 tests cubriendo todos los CA
9. **Fixtures de Testing**: Datos de ejemplo para tests
10. **Migraciones**: Aplicar y validar en DB
11. **Cron Job**: Configurar auto-marcado de VENCIDAS (Celery o Django-cron)
12. **Notificaciones**: Integrar con sistema de notificaciones (NOTINT-01/02)

### Validaciones Críticas
- `tipo_actividad` debe estar activo
- `fecha_planificacion` no puede ser muy antigua (>1 año)
- Actor debe coincidir con `tipo_actividad.actor`
- Si `estado=CANCELADA`: exigir `motivo_cancelacion`
- Si `tipo_actividad.requiere_evidencia=True` y `estado=REALIZADA`: exigir adjuntos
- Usuario debe pertenecer a zona del legajo vía `TCustomUserZona`
- Responsable principal no puede estar en `responsables_secundarios`

### Integración con MED-01 a MED-05
- `TActividad.plan_trabajo` → `TPlanDeTrabajo.medida` → `TMedida`
- Actividades operan en paralelo a etapas de medida (MED-02 → MED-05)
- No bloquean transiciones de estado de medida
- Se registran en PLTM-04 (Historial de Seguimiento)

### Checklist Post-Implementación
- [ ] Modelos exportados en `infrastructure/models/__init__.py`
- [ ] Serializers exportados en `api/serializers/__init__.py`
- [ ] ViewSets exportados en `api/views/__init__.py`
- [ ] URLs registradas en `api/urls.py`
- [ ] Tests implementados en `tests/test_actividades_pltm01.py`
- [ ] Fixtures creados en `infrastructure/fixtures/tipos_actividad.json`
- [ ] Migraciones creadas: `makemigrations`
- [ ] Migraciones aplicadas: `migrate`
- [ ] `setup_project.py` actualizado con migraciones PLTM-01
- [ ] `populate_database.py` actualizado con fixtures de tipos_actividad
- [ ] Tests ejecutados y pasando: 15+ tests
- [ ] Cron job configurado para auto-marcado de VENCIDAS
- [ ] Notificaciones integradas con NOTINT-01/02

## 🎯 OBJETIVOS DE TESTING

### Mínimo 15 Tests
1. `test_crear_actividad_manual_exitoso`: Creación manual con todos los campos
2. `test_crear_actividad_auto_desde_demanda_pi`: Auto-creación desde Demanda PI
3. `test_crear_actividad_auto_desde_oficio`: Auto-creación desde Oficio
4. `test_crear_actividad_sin_tipo_activo_falla`: Error si tipo_actividad.activo=False
5. `test_crear_actividad_sin_campos_obligatorios_falla`: Error si faltan campos
6. `test_transicion_pendiente_a_en_progreso`: Validar transición de estado
7. `test_transicion_en_progreso_a_realizada`: Validar transición de estado
8. `test_transicion_a_cancelada_sin_motivo_falla`: Error si falta motivo
9. `test_auto_marcar_vencida`: Cron marca VENCIDA si fecha_planificacion < hoy
10. `test_crear_actividad_con_adjuntos_multiples`: Validar creación de adjuntos
11. `test_crear_actividad_sin_permisos_falla`: Error 403 si no es Técnico/JZ/Director
12. `test_crear_actividad_fuera_de_zona_falla`: Error 403 si usuario no pertenece a zona
13. `test_guardar_actividad_como_borrador`: Validar `es_borrador=True`
14. `test_publicar_borrador_genera_notificaciones`: Notificaciones al publicar
15. `test_agregar_adjunto_a_actividad_existente`: Endpoint de adjuntos
16. `test_modificar_actividad_realizada_falla`: Error si estado=REALIZADA (solo Admin puede)
17. `test_deep_links_correctos`: Validar origen_demanda y origen_oficio

## 🔗 DEPENDENCIAS TÉCNICAS

### Modelos Requeridos
- ✅ `TPlanDeTrabajo` (existente en medida_models.py)
- ✅ `TMedida` (MED-01)
- ✅ `TCustomUserZona` (para validación de permisos)
- ✅ `User` (Django Auth)
- ⚠️ `TRegistroDemanda` (REG-01 - para auto-creación desde PI)
- ⚠️ `TOficio` (módulo Oficios - pendiente de implementación)

### Métodos Requeridos
- ⚠️ Sistema de Notificaciones (NOTINT-01/02 - pendiente)
- ⚠️ Cron Job o Celery Task para auto-marcar VENCIDAS
- ⚠️ Integración con PLTM-04 (Historial de Seguimiento)

### Fixtures Requeridos
- Tipos de actividad por actor (fixture obligatorio)
- Usuarios de Equipo Técnico, JZ, Director con zonas asignadas
- Planes de trabajo con medidas asociadas
- Demandas con objetivo "PI" para testing de auto-creación
- Oficios para testing de auto-creación

---

## 📝 FIXTURE: Tipos de Actividad Predefinidos

```json
[
  {
    "model": "infrastructure.TTipoActividad",
    "pk": 1,
    "fields": {
      "actor": "EQUIPO_TECNICO",
      "nombre": "Visita Domiciliaria",
      "descripcion": "Visita al hogar del niño/adolescente para evaluación de entorno familiar",
      "requiere_evidencia": true,
      "activo": true,
      "orden": 1
    }
  },
  {
    "model": "infrastructure.TTipoActividad",
    "pk": 2,
    "fields": {
      "actor": "EQUIPO_TECNICO",
      "nombre": "Entrevista con Referentes",
      "descripcion": "Entrevista con adultos responsables o referentes comunitarios",
      "requiere_evidencia": false,
      "activo": true,
      "orden": 2
    }
  },
  {
    "model": "infrastructure.TTipoActividad",
    "pk": 3,
    "fields": {
      "actor": "EQUIPO_TECNICO",
      "nombre": "Elaboración de Informe",
      "descripcion": "Elaboración de informe técnico para presentar al juzgado",
      "requiere_evidencia": true,
      "activo": true,
      "orden": 3
    }
  },
  {
    "model": "infrastructure.TTipoActividad",
    "pk": 4,
    "fields": {
      "actor": "EQUIPO_TECNICO",
      "nombre": "Reunión de Equipo",
      "descripcion": "Reunión de coordinación y análisis de caso",
      "requiere_evidencia": false,
      "activo": true,
      "orden": 4
    }
  },
  {
    "model": "infrastructure.TTipoActividad",
    "pk": 5,
    "fields": {
      "actor": "EQUIPOS_RESIDENCIALES",
      "nombre": "Taller con NNyA",
      "descripcion": "Taller recreativo, educativo o terapéutico con niños/adolescentes",
      "requiere_evidencia": true,
      "activo": true,
      "orden": 1
    }
  },
  {
    "model": "infrastructure.TTipoActividad",
    "pk": 6,
    "fields": {
      "actor": "EQUIPOS_RESIDENCIALES",
      "nombre": "Reunión de Convivencia",
      "descripcion": "Reunión de convivencia y resolución de conflictos",
      "requiere_evidencia": false,
      "activo": true,
      "orden": 2
    }
  },
  {
    "model": "infrastructure.TTipoActividad",
    "pk": 7,
    "fields": {
      "actor": "EQUIPOS_RESIDENCIALES",
      "nombre": "Actividad Recreativa",
      "descripcion": "Salida recreativa o actividad lúdica",
      "requiere_evidencia": true,
      "activo": true,
      "orden": 3
    }
  },
  {
    "model": "infrastructure.TTipoActividad",
    "pk": 8,
    "fields": {
      "actor": "ADULTOS_INSTITUCION",
      "nombre": "Reunión con Familiares",
      "descripcion": "Reunión con adultos responsables para evaluar revinculación",
      "requiere_evidencia": false,
      "activo": true,
      "orden": 1
    }
  },
  {
    "model": "infrastructure.TTipoActividad",
    "pk": 9,
    "fields": {
      "actor": "ADULTOS_INSTITUCION",
      "nombre": "Acta de Compromiso",
      "descripcion": "Firma de acta de compromiso con adultos responsables",
      "requiere_evidencia": true,
      "activo": true,
      "orden": 2
    }
  },
  {
    "model": "infrastructure.TTipoActividad",
    "pk": 10,
    "fields": {
      "actor": "ADULTOS_INSTITUCION",
      "nombre": "Articulación Institucional",
      "descripcion": "Reunión con instituciones externas (escuela, salud, etc.)",
      "requiere_evidencia": false,
      "activo": true,
      "orden": 3
    }
  },
  {
    "model": "infrastructure.TTipoActividad",
    "pk": 11,
    "fields": {
      "actor": "EQUIPO_LEGAL",
      "nombre": "Gestionar Ratificación Judicial",
      "descripcion": "Gestión de oficio de ratificación de medida - Vinculado a MED-05",
      "requiere_evidencia": true,
      "activo": true,
      "orden": 1
    }
  },
  {
    "model": "infrastructure.TTipoActividad",
    "pk": 12,
    "fields": {
      "actor": "EQUIPO_LEGAL",
      "nombre": "Responder Pedido Judicial",
      "descripcion": "Respuesta a pedido de informe judicial - Vinculado a CONS-03",
      "requiere_evidencia": true,
      "activo": true,
      "orden": 2
    }
  },
  {
    "model": "infrastructure.TTipoActividad",
    "pk": 13,
    "fields": {
      "actor": "EQUIPO_TECNICO",
      "nombre": "Ejecutar Medida Ordenada",
      "descripcion": "Ejecución de medida ordenada judicialmente - Vinculado a MED-01/02",
      "requiere_evidencia": true,
      "activo": true,
      "orden": 5
    }
  },
  {
    "model": "infrastructure.TTipoActividad",
    "pk": 14,
    "fields": {
      "actor": "EQUIPO_LEGAL",
      "nombre": "Gestionar Oficio Judicial",
      "descripcion": "Gestión de oficio judicial de tipo 'Otros'",
      "requiere_evidencia": false,
      "activo": true,
      "orden": 4
    }
  }
]
```

---

**Última actualización**: 2025-10-18 (Corrección: Agregado actor EQUIPO_LEGAL para Oficios)
**Story creada por**: Claude Code + Gemini CLI Analysis
**Basado en**: Documentacion RUNNA.md - Secciones PLTM, BE-04, MED-05, REG-01
**Estado**: ✅ Documentación completa y corregida - Lista para implementación

---

## 📝 NOTAS DE CORRECCIÓN ARQUITECTÓNICA

### Corrección: Gestión de Oficios por Equipo Legal (2025-10-18)

**Problema Identificado**:
- Versión inicial asumía que Oficios generaban actividades genéricas
- Análisis de Gemini CLI sobre BE-04 y MED-05 reveló que Oficios son responsabilidad del EQUIPO LEGAL
- Faltaba diferenciación por tipo de Oficio y sus actores específicos

**Cambios Aplicados**:

1. **Nuevo Actor en TTipoActividad.ACTOR_CHOICES**:
   ```python
   ('EQUIPO_LEGAL', 'Equipo de Legales')
   ```

2. **CA-03 Corregido - Auto-creación desde Oficio**:
   - Especificado que actor por defecto es EQUIPO_LEGAL
   - Diferenciación por tipo de Oficio:
     * **Ratificación** → EQUIPO_LEGAL + Crear MED-05 PENDIENTE
     * **Pedido de Informe** → EQUIPO_LEGAL + Deep-link CONS-03
     * **Orden de Medida** → EQUIPO_TECNICO (excepción) + Deep-link MED-01/02
     * **Otros** → EQUIPO_LEGAL
   - Notificaciones: Legal + JZ + Equipo Técnico

3. **4 Nuevos Tipos de Actividad** (Fixture pk: 11, 12, 13, 14):
   - pk 11 - Gestionar Ratificación Judicial (Actor: EQUIPO_LEGAL, requiere_evidencia=True)
   - pk 12 - Responder Pedido Judicial (Actor: EQUIPO_LEGAL, requiere_evidencia=True)
   - pk 13 - Ejecutar Medida Ordenada (Actor: EQUIPO_TECNICO, requiere_evidencia=True)
   - pk 14 - Gestionar Oficio Judicial (Actor: EQUIPO_LEGAL, requiere_evidencia=False)

4. **Nuevo Caso de Uso 2B**: Auto-creación desde Oficio Judicial
   - 3 flujos detallados por tipo de Oficio
   - Integración con MED-05 para Ratificaciones
   - Deep-links específicos según tipo
   - Notificaciones a 3 actores: Legal, JZ, Técnico

5. **Actualización de Roles y Permisos**:
   - Equipo Legal puede crear y gestionar actividades de Oficios
   - Tab "Equipo de Legales" en modal (visible solo para `legal=True`)

6. **Diagrama de Flujo Actualizado**:
   - Bifurcación en auto-creación por tipo de Oficio
   - Diferenciación de actor según tipo
   - Notificaciones específicas por actor

**Razones del Cambio**:
1. **Coherencia con Documentacion RUNNA.md**: BE-04 especifica que Legales gestiona Oficios
2. **Integración con MED-05**: Ratificaciones deben crear registro MED-05 automáticamente
3. **Separación de Responsabilidades**: Legal maneja judicial, Técnico maneja intervención
4. **Trazabilidad Completa**: Deep-links bidireccionales entre Oficio, Actividad y MED-05

**Impacto en Implementación**:
- ✅ Modelo: Agregar 'EQUIPO_LEGAL' a ACTOR_CHOICES
- ✅ Fixture: Agregar 3 tipos de actividad legal (pk: 11, 12, 13)
- ✅ Lógica Auto-creación: Diferenciar por tipo de Oficio al crear actividad
- ✅ Notificaciones: Enviar a 3 actores (Legal, JZ, Técnico) para Oficios
- ✅ ViewSet: Validar permisos específicos para actor EQUIPO_LEGAL
- ✅ Tests: Agregar tests para auto-creación desde Oficios con tipos específicos

**Beneficios**:
- Responsabilidades claras: Legal → Judicial, Técnico → Intervención
- Workflow alineado con proceso real documentado
- Integración automática con MED-05 para Ratificaciones
- Notificaciones completas a todos los stakeholders
- Trazabilidad bidireccional completa

**Fecha de Corrección**: 2025-10-18
**Corregido por**: Claude Code con análisis Gemini CLI
**Basado en**: Análisis de BE-04, MED-05, REG-01 en Documentacion RUNNA.md
**Estado**: ✅ Corrección documentada y lista para implementación
