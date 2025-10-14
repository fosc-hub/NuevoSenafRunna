# MED-02a: Modelos y Registro de Intervención

**Fecha de Creación:** 2025-10-11
**Sprint:** TBD
**Estimación:** 10 puntos (Mediano-Grande)
**Prioridad:** Alta
**Estado:** Documentada
**Dependencias:** MED-01a, MED-01b, MED-01c (✅ Completadas)

---

## Historia de Usuario

**Como** Desarrollador del sistema RUNNA
**Quiero** implementar la estructura de datos para registro de intervenciones de medidas
**Para** permitir que el Equipo Técnico documente la primera intervención y guarde borradores

---

## Alcance de MED-02a

Esta sub-story se enfoca **exclusivamente** en:
- ✅ Crear modelos de base de datos (TIntervencionMedida, catálogos)
- ✅ Configurar migración 0041
- ✅ Crear fixtures de datos base
- ✅ Crear serializers básicos para CRUD
- ✅ Implementar ViewSet con create, update, list, retrieve
- ✅ Implementar endpoints POST, PATCH, GET
- ✅ Tests de creación, borrador, validaciones básicas (8-10 tests)
- ❌ NO incluye transiciones de estado (ver MED-02b)
- ❌ NO incluye adjuntos (ver MED-02c)

---

## Modelos a Implementar

### 1. TIntervencionMedida (Modelo Principal)

**Ubicación:** `runna/infrastructure/models/medida/TIntervencionMedida.py`

```python
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

CustomUser = get_user_model()


class TIntervencionMedida(models.Model):
    """
    Modelo para registrar datos de la primera intervención de una medida.

    Este modelo almacena toda la información ingresada por el Equipo Técnico
    en MED-02, incluyendo datos básicos, detalles de intervención y
    configuración adicional.

    Estados:
    - BORRADOR: Guardado parcial, puede editarse
    - ENVIADO: Enviado a aprobación (MED-02b)
    - APROBADO: Aprobado por JZ (MED-02b)
    - RECHAZADO: Rechazado por JZ (MED-02b)
    """

    ESTADO_BORRADOR = 'BORRADOR'
    ESTADO_ENVIADO = 'ENVIADO'
    ESTADO_APROBADO = 'APROBADO'
    ESTADO_RECHAZADO = 'RECHAZADO'

    ESTADO_CHOICES = [
        (ESTADO_BORRADOR, 'Borrador'),
        (ESTADO_ENVIADO, 'Enviado a Aprobación'),
        (ESTADO_APROBADO, 'Aprobado'),
        (ESTADO_RECHAZADO, 'Rechazado'),
    ]

    # =================== IDENTIFICACIÓN ===================
    medida = models.ForeignKey(
        'TMedida',
        on_delete=models.CASCADE,
        related_name='intervenciones',
        help_text="Medida a la que pertenece este registro de intervención"
    )

    codigo_intervencion = models.CharField(
        max_length=50,
        unique=True,
        help_text="Código único autogenerado (INT-MED-YYYY-NNNNNN)"
    )

    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default=ESTADO_BORRADOR,
        help_text="Estado actual del registro de intervención"
    )

    # =================== INFORMACIÓN BÁSICA ===================
    fecha_intervencion = models.DateField(
        help_text="Fecha en que se realizó la intervención"
    )

    # Snapshot de datos del legajo (solo lectura en formulario, pero guardados)
    legajo_numero = models.CharField(
        max_length=50,
        help_text="Número de legajo (autocompletado)"
    )
    persona_nombre = models.CharField(
        max_length=200,
        help_text="Nombre del NNyA (autocompletado)"
    )
    persona_apellido = models.CharField(
        max_length=200,
        help_text="Apellido del NNyA (autocompletado)"
    )
    persona_dni = models.CharField(
        max_length=20,
        null=True,
        blank=True,
        help_text="DNI del NNyA (autocompletado)"
    )
    zona_nombre = models.CharField(
        max_length=200,
        help_text="Zona del legajo (autocompletado)"
    )

    # Tipo de dispositivo (dropdown)
    tipo_dispositivo = models.ForeignKey(
        'TTipoDispositivo',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        help_text="Tipo de dispositivo de intervención"
    )

    # =================== DETALLES DE INTERVENCIÓN ===================
    motivo = models.ForeignKey(
        'TCategoriaMotivo',
        on_delete=models.PROTECT,
        help_text="Motivo principal de la intervención"
    )

    sub_motivo = models.ForeignKey(
        'TSubMotivo',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        help_text="Sub-motivo específico (dependiente de motivo)"
    )

    categoria_intervencion = models.ForeignKey(
        'TCategoriaIntervencion',
        on_delete=models.PROTECT,
        help_text="Categoría de la intervención"
    )

    intervencion_especifica = models.TextField(
        help_text="Descripción específica de la intervención realizada"
    )

    descripcion_detallada = models.TextField(
        null=True,
        blank=True,
        help_text="Descripción adicional o contexto de la intervención"
    )

    # =================== CONFIGURACIÓN ADICIONAL ===================
    motivo_vulneraciones = models.TextField(
        null=True,
        blank=True,
        help_text="Descripción de vulneraciones de derechos detectadas"
    )

    requiere_informes_ampliatorios = models.BooleanField(
        default=False,
        help_text="Indica si se requieren informes ampliatorios posteriores"
    )

    # =================== PROCESO DE APROBACIÓN ===================
    # (Usado en MED-02b, pero definidos aquí)
    fecha_envio = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Fecha y hora de envío a aprobación"
    )

    fecha_aprobacion = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Fecha y hora de aprobación por JZ"
    )

    fecha_rechazo = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Fecha y hora de rechazo por JZ"
    )

    registrado_por = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        related_name='intervenciones_registradas',
        help_text="Usuario (Equipo Técnico) que registró la intervención"
    )

    aprobado_por = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='intervenciones_aprobadas',
        help_text="Usuario (Jefe Zonal) que aprobó (MED-02b)"
    )

    rechazado_por = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='intervenciones_rechazadas',
        help_text="Usuario (Jefe Zonal) que rechazó (MED-02b)"
    )

    observaciones_jz = models.TextField(
        null=True,
        blank=True,
        help_text="Observaciones del JZ en caso de rechazo (MED-02b)"
    )

    # =================== AUDITORÍA ===================
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'infrastructure'
        db_table = 't_intervencion_medida'
        verbose_name = _('Intervención de Medida')
        verbose_name_plural = _('Intervenciones de Medidas')
        ordering = ['-fecha_creacion']
        indexes = [
            models.Index(fields=['medida', 'estado']),
            models.Index(fields=['codigo_intervencion']),
        ]

    def __str__(self):
        return f"{self.codigo_intervencion} - {self.medida.numero_medida} - {self.get_estado_display()}"

    def save(self, *args, **kwargs):
        """Override save para generar codigo_intervencion automáticamente"""
        if not self.codigo_intervencion:
            self.codigo_intervencion = self.generar_codigo_intervencion()
        super().save(*args, **kwargs)

    @staticmethod
    def generar_codigo_intervencion():
        """
        Genera código único de intervención con formato:
        INT-MED-{año}-{consecutivo:06d}

        Ejemplo: INT-MED-2025-000001
        """
        from datetime import datetime

        año_actual = datetime.now().year

        # Obtener último código del año
        ultima_intervencion = TIntervencionMedida.objects.filter(
            codigo_intervencion__startswith=f"INT-MED-{año_actual}-"
        ).order_by('-codigo_intervencion').first()

        if ultima_intervencion:
            try:
                partes = ultima_intervencion.codigo_intervencion.split('-')
                consecutivo = int(partes[3]) + 1
            except (IndexError, ValueError):
                consecutivo = 1
        else:
            consecutivo = 1

        return f"INT-MED-{año_actual}-{consecutivo:06d}"

    def puede_editar(self, usuario):
        """Verifica si usuario puede editar esta intervención"""
        # Solo en estado BORRADOR o RECHAZADO
        if self.estado not in [self.ESTADO_BORRADOR, self.ESTADO_RECHAZADO]:
            return False

        # Admin: siempre puede
        if usuario.is_superuser:
            return True

        # Director: siempre puede
        if hasattr(usuario, 'nivel_usuario') and usuario.nivel_usuario == 'DIRECTOR':
            return True

        # Jefe Zonal: puede si es de su zona
        if hasattr(usuario, 'nivel_usuario') and usuario.nivel_usuario == 'JEFEZONAL':
            legajo = self.medida.legajo
            if hasattr(usuario, 'zona') and usuario.zona == legajo.zona:
                return True

        # Equipo Técnico: solo si es el responsable
        if self.registrado_por == usuario:
            return True

        return False
```

---

### 2. TTipoDispositivo (Catálogo)

**Ubicación:** `runna/infrastructure/models/dropdown/TTipoDispositivo.py`

```python
from django.db import models
from django.utils.translation import gettext_lazy as _


class TTipoDispositivo(models.Model):
    """Catálogo de tipos de dispositivo de intervención"""

    nombre = models.CharField(
        max_length=200,
        unique=True,
        help_text="Nombre del tipo de dispositivo"
    )
    descripcion = models.TextField(
        null=True,
        blank=True,
        help_text="Descripción del tipo de dispositivo"
    )
    activo = models.BooleanField(
        default=True,
        help_text="Indica si el tipo está activo"
    )

    class Meta:
        app_label = 'infrastructure'
        db_table = 't_tipo_dispositivo'
        verbose_name = _('Tipo de Dispositivo')
        verbose_name_plural = _('Tipos de Dispositivos')
        ordering = ['nombre']

    def __str__(self):
        return self.nombre
```

---

### 3. TSubMotivo (Catálogo)

**Ubicación:** `runna/infrastructure/models/dropdown/TSubMotivo.py`

```python
from django.db import models
from django.utils.translation import gettext_lazy as _


class TSubMotivo(models.Model):
    """Catálogo de sub-motivos de intervención (dependiente de TCategoriaMotivo)"""

    categoria_motivo = models.ForeignKey(
        'TCategoriaMotivo',
        on_delete=models.CASCADE,
        related_name='sub_motivos',
        help_text="Categoría de motivo padre"
    )
    nombre = models.CharField(
        max_length=200,
        help_text="Nombre del sub-motivo"
    )
    descripcion = models.TextField(
        null=True,
        blank=True,
        help_text="Descripción del sub-motivo"
    )
    activo = models.BooleanField(
        default=True,
        help_text="Indica si el sub-motivo está activo"
    )

    class Meta:
        app_label = 'infrastructure'
        db_table = 't_sub_motivo'
        verbose_name = _('Sub-motivo')
        verbose_name_plural = _('Sub-motivos')
        ordering = ['categoria_motivo', 'nombre']
        unique_together = [['categoria_motivo', 'nombre']]

    def __str__(self):
        return f"{self.categoria_motivo.nombre} - {self.nombre}"
```

---

### 4. TCategoriaIntervencion (Catálogo)

**Ubicación:** `runna/infrastructure/models/dropdown/TCategoriaIntervencion.py`

```python
from django.db import models
from django.utils.translation import gettext_lazy as _


class TCategoriaIntervencion(models.Model):
    """Catálogo de categorías de intervención"""

    nombre = models.CharField(
        max_length=200,
        unique=True,
        help_text="Nombre de la categoría de intervención"
    )
    descripcion = models.TextField(
        null=True,
        blank=True,
        help_text="Descripción de la categoría"
    )
    activo = models.BooleanField(
        default=True,
        help_text="Indica si la categoría está activa"
    )

    class Meta:
        app_label = 'infrastructure'
        db_table = 't_categoria_intervencion'
        verbose_name = _('Categoría de Intervención')
        verbose_name_plural = _('Categorías de Intervenciones')
        ordering = ['nombre']

    def __str__(self):
        return self.nombre
```

---

## Migración 0041

**Archivo:** `runna/infrastructure/migrations/0041_crear_modelos_intervencion.py`

**Operaciones:**
1. Crear tabla `t_tipo_dispositivo`
2. Crear tabla `t_sub_motivo`
3. Crear tabla `t_categoria_intervencion`
4. Crear tabla `t_intervencion_medida`
5. Crear índices para búsquedas eficientes

```python
# Generated by Django X.X on 2025-10-11

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('infrastructure', '0040_previous_migration'),
    ]

    operations = [
        migrations.CreateModel(
            name='TTipoDispositivo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(help_text='Nombre del tipo de dispositivo', max_length=200, unique=True)),
                ('descripcion', models.TextField(blank=True, help_text='Descripción del tipo de dispositivo', null=True)),
                ('activo', models.BooleanField(default=True, help_text='Indica si el tipo está activo')),
            ],
            options={
                'verbose_name': 'Tipo de Dispositivo',
                'verbose_name_plural': 'Tipos de Dispositivos',
                'db_table': 't_tipo_dispositivo',
                'ordering': ['nombre'],
            },
        ),
        migrations.CreateModel(
            name='TCategoriaIntervencion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(help_text='Nombre de la categoría de intervención', max_length=200, unique=True)),
                ('descripcion', models.TextField(blank=True, help_text='Descripción de la categoría', null=True)),
                ('activo', models.BooleanField(default=True, help_text='Indica si la categoría está activa')),
            ],
            options={
                'verbose_name': 'Categoría de Intervención',
                'verbose_name_plural': 'Categorías de Intervenciones',
                'db_table': 't_categoria_intervencion',
                'ordering': ['nombre'],
            },
        ),
        migrations.CreateModel(
            name='TSubMotivo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(help_text='Nombre del sub-motivo', max_length=200)),
                ('descripcion', models.TextField(blank=True, help_text='Descripción del sub-motivo', null=True)),
                ('activo', models.BooleanField(default=True, help_text='Indica si el sub-motivo está activo')),
                ('categoria_motivo', models.ForeignKey(help_text='Categoría de motivo padre', on_delete=django.db.models.deletion.CASCADE, related_name='sub_motivos', to='infrastructure.tcategoriamotivo')),
            ],
            options={
                'verbose_name': 'Sub-motivo',
                'verbose_name_plural': 'Sub-motivos',
                'db_table': 't_sub_motivo',
                'ordering': ['categoria_motivo', 'nombre'],
                'unique_together': {('categoria_motivo', 'nombre')},
            },
        ),
        migrations.CreateModel(
            name='TIntervencionMedida',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('codigo_intervencion', models.CharField(help_text='Código único autogenerado (INT-MED-YYYY-NNNNNN)', max_length=50, unique=True)),
                ('estado', models.CharField(choices=[('BORRADOR', 'Borrador'), ('ENVIADO', 'Enviado a Aprobación'), ('APROBADO', 'Aprobado'), ('RECHAZADO', 'Rechazado')], default='BORRADOR', help_text='Estado actual del registro de intervención', max_length=20)),
                ('fecha_intervencion', models.DateField(help_text='Fecha en que se realizó la intervención')),
                ('legajo_numero', models.CharField(help_text='Número de legajo (autocompletado)', max_length=50)),
                ('persona_nombre', models.CharField(help_text='Nombre del NNyA (autocompletado)', max_length=200)),
                ('persona_apellido', models.CharField(help_text='Apellido del NNyA (autocompletado)', max_length=200)),
                ('persona_dni', models.CharField(blank=True, help_text='DNI del NNyA (autocompletado)', max_length=20, null=True)),
                ('zona_nombre', models.CharField(help_text='Zona del legajo (autocompletado)', max_length=200)),
                ('intervencion_especifica', models.TextField(help_text='Descripción específica de la intervención realizada')),
                ('descripcion_detallada', models.TextField(blank=True, help_text='Descripción adicional o contexto de la intervención', null=True)),
                ('motivo_vulneraciones', models.TextField(blank=True, help_text='Descripción de vulneraciones de derechos detectadas', null=True)),
                ('requiere_informes_ampliatorios', models.BooleanField(default=False, help_text='Indica si se requieren informes ampliatorios posteriores')),
                ('fecha_envio', models.DateTimeField(blank=True, help_text='Fecha y hora de envío a aprobación', null=True)),
                ('fecha_aprobacion', models.DateTimeField(blank=True, help_text='Fecha y hora de aprobación por JZ', null=True)),
                ('fecha_rechazo', models.DateTimeField(blank=True, help_text='Fecha y hora de rechazo por JZ', null=True)),
                ('observaciones_jz', models.TextField(blank=True, help_text='Observaciones del JZ en caso de rechazo (MED-02b)', null=True)),
                ('fecha_creacion', models.DateTimeField(auto_now_add=True)),
                ('fecha_modificacion', models.DateTimeField(auto_now=True)),
                ('medida', models.ForeignKey(help_text='Medida a la que pertenece este registro de intervención', on_delete=django.db.models.deletion.CASCADE, related_name='intervenciones', to='infrastructure.tmedida')),
                ('tipo_dispositivo', models.ForeignKey(blank=True, help_text='Tipo de dispositivo de intervención', null=True, on_delete=django.db.models.deletion.PROTECT, to='infrastructure.ttipodispositivo')),
                ('motivo', models.ForeignKey(help_text='Motivo principal de la intervención', on_delete=django.db.models.deletion.PROTECT, to='infrastructure.tcategoriamotivo')),
                ('sub_motivo', models.ForeignKey(blank=True, help_text='Sub-motivo específico (dependiente de motivo)', null=True, on_delete=django.db.models.deletion.PROTECT, to='infrastructure.tsubmotivo')),
                ('categoria_intervencion', models.ForeignKey(help_text='Categoría de la intervención', on_delete=django.db.models.deletion.PROTECT, to='infrastructure.tcategoriaintervencion')),
                ('registrado_por', models.ForeignKey(help_text='Usuario (Equipo Técnico) que registró la intervención', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='intervenciones_registradas', to=settings.AUTH_USER_MODEL)),
                ('aprobado_por', models.ForeignKey(blank=True, help_text='Usuario (Jefe Zonal) que aprobó (MED-02b)', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='intervenciones_aprobadas', to=settings.AUTH_USER_MODEL)),
                ('rechazado_por', models.ForeignKey(blank=True, help_text='Usuario (Jefe Zonal) que rechazó (MED-02b)', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='intervenciones_rechazadas', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Intervención de Medida',
                'verbose_name_plural': 'Intervenciones de Medidas',
                'db_table': 't_intervencion_medida',
                'ordering': ['-fecha_creacion'],
            },
        ),
        migrations.AddIndex(
            model_name='tintervencionmedida',
            index=models.Index(fields=['medida', 'estado'], name='t_interven_medida__idx'),
        ),
        migrations.AddIndex(
            model_name='tintervencionmedida',
            index=models.Index(fields=['codigo_intervencion'], name='t_interven_codigo__idx'),
        ),
    ]
```

---

## Fixtures

### 1. tipos_dispositivo.json

**Ubicación:** `runna/infrastructure/fixtures/tipos_dispositivo.json`

```json
[
  {
    "model": "infrastructure.ttipodispositivo",
    "pk": 1,
    "fields": {
      "nombre": "Acogimiento Familiar",
      "descripcion": "Intervención mediante acogimiento en familia",
      "activo": true
    }
  },
  {
    "model": "infrastructure.ttipodispositivo",
    "pk": 2,
    "fields": {
      "nombre": "Abrigo Institucional",
      "descripcion": "Intervención en abrigo o hogar institucional",
      "activo": true
    }
  },
  {
    "model": "infrastructure.ttipodispositivo",
    "pk": 3,
    "fields": {
      "nombre": "Centro de Día",
      "descripcion": "Intervención mediante centro de día",
      "activo": true
    }
  },
  {
    "model": "infrastructure.ttipodispositivo",
    "pk": 4,
    "fields": {
      "nombre": "Intervención Domiciliaria",
      "descripcion": "Intervención realizada en el domicilio del NNyA",
      "activo": true
    }
  },
  {
    "model": "infrastructure.ttipodispositivo",
    "pk": 5,
    "fields": {
      "nombre": "Residencia Especializada",
      "descripcion": "Intervención en residencia especializada",
      "activo": true
    }
  }
]
```

---

### 2. sub_motivos.json

**Ubicación:** `runna/infrastructure/fixtures/sub_motivos.json`

```json
[
  {
    "model": "infrastructure.tsubmotivo",
    "pk": 1,
    "fields": {
      "categoria_motivo": 1,
      "nombre": "Violencia Física",
      "descripcion": "Situación de violencia física detectada",
      "activo": true
    }
  },
  {
    "model": "infrastructure.tsubmotivo",
    "pk": 2,
    "fields": {
      "categoria_motivo": 1,
      "nombre": "Violencia Psicológica",
      "descripcion": "Situación de violencia psicológica detectada",
      "activo": true
    }
  },
  {
    "model": "infrastructure.tsubmotivo",
    "pk": 3,
    "fields": {
      "categoria_motivo": 1,
      "nombre": "Negligencia",
      "descripcion": "Situación de negligencia parental detectada",
      "activo": true
    }
  },
  {
    "model": "infrastructure.tsubmotivo",
    "pk": 4,
    "fields": {
      "categoria_motivo": 2,
      "nombre": "Abuso Sexual Intrafamiliar",
      "descripcion": "Situación de abuso sexual dentro del núcleo familiar",
      "activo": true
    }
  },
  {
    "model": "infrastructure.tsubmotivo",
    "pk": 5,
    "fields": {
      "categoria_motivo": 2,
      "nombre": "Explotación Sexual Comercial",
      "descripcion": "Situación de explotación sexual con fines comerciales",
      "activo": true
    }
  }
]
```

---

### 3. categorias_intervencion.json

**Ubicación:** `runna/infrastructure/fixtures/categorias_intervencion.json`

```json
[
  {
    "model": "infrastructure.tcategoriaintervencion",
    "pk": 1,
    "fields": {
      "nombre": "Protección Integral de Derechos",
      "descripcion": "Intervención enfocada en protección integral",
      "activo": true
    }
  },
  {
    "model": "infrastructure.tcategoriaintervencion",
    "pk": 2,
    "fields": {
      "nombre": "Protección Excepcional",
      "descripcion": "Intervención de protección excepcional con separación del hogar",
      "activo": true
    }
  },
  {
    "model": "infrastructure.tcategoriaintervencion",
    "pk": 3,
    "fields": {
      "nombre": "Acompañamiento Familiar",
      "descripcion": "Intervención de acompañamiento y fortalecimiento familiar",
      "activo": true
    }
  },
  {
    "model": "infrastructure.tcategoriaintervencion",
    "pk": 4,
    "fields": {
      "nombre": "Articulación Intersectorial",
      "descripcion": "Intervención mediante articulación con otros organismos",
      "activo": true
    }
  },
  {
    "model": "infrastructure.tcategoriaintervencion",
    "pk": 5,
    "fields": {
      "nombre": "Seguimiento y Monitoreo",
      "descripcion": "Intervención de seguimiento de medida vigente",
      "activo": true
    }
  }
]
```

---

## Serializers

### 1. TIntervencionMedidaSerializer

**Ubicación:** `runna/api/serializers/TIntervencionMedidaSerializer.py`

```python
from rest_framework import serializers
from infrastructure.models import (
    TIntervencionMedida, TTipoDispositivo, TSubMotivo,
    TCategoriaIntervencion, TCategoriaMotivo
)


class TIntervencionMedidaSerializer(serializers.ModelSerializer):
    """Serializer para intervenciones de medida - CRUD básico (MED-02a)"""

    # Campos calculados
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)

    # Nested serializers para lectura
    tipo_dispositivo_detalle = serializers.SerializerMethodField(read_only=True)
    motivo_detalle = serializers.SerializerMethodField(read_only=True)
    sub_motivo_detalle = serializers.SerializerMethodField(read_only=True)
    categoria_intervencion_detalle = serializers.SerializerMethodField(read_only=True)
    registrado_por_detalle = serializers.SerializerMethodField(read_only=True)

    # IDs para escritura
    tipo_dispositivo_id = serializers.PrimaryKeyRelatedField(
        queryset=TTipoDispositivo.objects.filter(activo=True),
        source='tipo_dispositivo',
        write_only=True,
        required=False,
        allow_null=True
    )
    motivo_id = serializers.PrimaryKeyRelatedField(
        queryset=TCategoriaMotivo.objects.all(),
        source='motivo',
        write_only=True
    )
    sub_motivo_id = serializers.PrimaryKeyRelatedField(
        queryset=TSubMotivo.objects.filter(activo=True),
        source='sub_motivo',
        write_only=True,
        required=False,
        allow_null=True
    )
    categoria_intervencion_id = serializers.PrimaryKeyRelatedField(
        queryset=TCategoriaIntervencion.objects.filter(activo=True),
        source='categoria_intervencion',
        write_only=True
    )

    class Meta:
        model = TIntervencionMedida
        fields = [
            'id', 'codigo_intervencion', 'medida', 'estado', 'estado_display',

            # Información Básica
            'fecha_intervencion',
            'legajo_numero', 'persona_nombre', 'persona_apellido', 'persona_dni', 'zona_nombre',

            # Tipo Dispositivo
            'tipo_dispositivo_id', 'tipo_dispositivo_detalle',

            # Detalles de Intervención
            'motivo_id', 'motivo_detalle',
            'sub_motivo_id', 'sub_motivo_detalle',
            'categoria_intervencion_id', 'categoria_intervencion_detalle',
            'intervencion_especifica', 'descripcion_detallada',

            # Configuración Adicional
            'motivo_vulneraciones', 'requiere_informes_ampliatorios',

            # Proceso de Aprobación (solo lectura en MED-02a)
            'fecha_envio', 'fecha_aprobacion', 'fecha_rechazo',
            'registrado_por_detalle', 'observaciones_jz',

            # Auditoría
            'fecha_creacion', 'fecha_modificacion'
        ]
        read_only_fields = [
            'id', 'codigo_intervencion',
            'legajo_numero', 'persona_nombre', 'persona_apellido', 'persona_dni', 'zona_nombre',
            'fecha_envio', 'fecha_aprobacion', 'fecha_rechazo',
            'observaciones_jz',
            'fecha_creacion', 'fecha_modificacion'
        ]

    def get_tipo_dispositivo_detalle(self, obj):
        if obj.tipo_dispositivo:
            return {
                'id': obj.tipo_dispositivo.id,
                'nombre': obj.tipo_dispositivo.nombre
            }
        return None

    def get_motivo_detalle(self, obj):
        return {
            'id': obj.motivo.id,
            'nombre': obj.motivo.nombre
        }

    def get_sub_motivo_detalle(self, obj):
        if obj.sub_motivo:
            return {
                'id': obj.sub_motivo.id,
                'nombre': obj.sub_motivo.nombre
            }
        return None

    def get_categoria_intervencion_detalle(self, obj):
        return {
            'id': obj.categoria_intervencion.id,
            'nombre': obj.categoria_intervencion.nombre
        }

    def get_registrado_por_detalle(self, obj):
        if obj.registrado_por:
            return {
                'id': obj.registrado_por.id,
                'nombre_completo': f"{obj.registrado_por.first_name} {obj.registrado_por.last_name}".strip(),
                'username': obj.registrado_por.username
            }
        return None

    def validate_fecha_intervencion(self, value):
        """Validar que fecha_intervencion no sea futura"""
        from datetime import date
        if value > date.today():
            raise serializers.ValidationError("La fecha de intervención no puede ser futura")
        return value

    def validate(self, attrs):
        """Validaciones adicionales"""
        # Validar que sub_motivo pertenezca al motivo seleccionado
        sub_motivo = attrs.get('sub_motivo')
        motivo = attrs.get('motivo')

        if sub_motivo and motivo:
            if sub_motivo.categoria_motivo != motivo:
                raise serializers.ValidationError({
                    'sub_motivo': f"El sub-motivo debe pertenecer a la categoría '{motivo.nombre}'"
                })

        return attrs
```

---

### 2. TTipoDispositivoSerializer

**Ubicación:** `runna/api/serializers/TTipoDispositivoSerializer.py`

```python
from rest_framework import serializers
from infrastructure.models import TTipoDispositivo


class TTipoDispositivoSerializer(serializers.ModelSerializer):
    """Serializer para catálogo de tipos de dispositivo"""

    class Meta:
        model = TTipoDispositivo
        fields = ['id', 'nombre', 'descripcion', 'activo']
```

---

### 3. TSubMotivoSerializer

**Ubicación:** `runna/api/serializers/TSubMotivoSerializer.py`

```python
from rest_framework import serializers
from infrastructure.models import TSubMotivo


class TSubMotivoSerializer(serializers.ModelSerializer):
    """Serializer para catálogo de sub-motivos"""

    categoria_motivo_nombre = serializers.CharField(
        source='categoria_motivo.nombre',
        read_only=True
    )

    class Meta:
        model = TSubMotivo
        fields = ['id', 'categoria_motivo', 'categoria_motivo_nombre', 'nombre', 'descripcion', 'activo']
```

---

### 4. TCategoriaIntervencionSerializer

**Ubicación:** `runna/api/serializers/TCategoriaIntervencionSerializer.py`

```python
from rest_framework import serializers
from infrastructure.models import TCategoriaIntervencion


class TCategoriaIntervencionSerializer(serializers.ModelSerializer):
    """Serializer para catálogo de categorías de intervención"""

    class Meta:
        model = TCategoriaIntervencion
        fields = ['id', 'nombre', 'descripcion', 'activo']
```

---

## ViewSet

### TIntervencionMedidaViewSet

**Ubicación:** `runna/api/views/TIntervencionMedidaView.py`

```python
from rest_framework import status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .BaseView import BaseViewSet
from infrastructure.models import TIntervencionMedida, TMedida
from api.serializers import TIntervencionMedidaSerializer


class TIntervencionMedidaViewSet(BaseViewSet):
    """
    ViewSet para intervenciones de medida - MED-02a: CRUD básico

    MED-02b agregará actions para transiciones de estado (enviar, aprobar, rechazar)
    """

    model = TIntervencionMedida
    serializer_class = TIntervencionMedidaSerializer
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get_queryset(self):
        """Filtrar intervenciones según permisos del usuario"""
        user = self.request.user

        # Admin: todas las intervenciones
        if user.is_superuser:
            return TIntervencionMedida.objects.all().select_related(
                'medida', 'medida__legajo', 'medida__legajo__zona',
                'tipo_dispositivo', 'motivo', 'sub_motivo',
                'categoria_intervencion', 'registrado_por'
            )

        # Director: todas las intervenciones
        if hasattr(user, 'nivel_usuario') and user.nivel_usuario == 'DIRECTOR':
            return TIntervencionMedida.objects.all().select_related(
                'medida', 'medida__legajo', 'medida__legajo__zona',
                'tipo_dispositivo', 'motivo', 'sub_motivo',
                'categoria_intervencion', 'registrado_por'
            )

        # Jefe Zonal: intervenciones de su zona
        if hasattr(user, 'nivel_usuario') and user.nivel_usuario == 'JEFEZONAL':
            if hasattr(user, 'zona'):
                return TIntervencionMedida.objects.filter(
                    medida__legajo__zona=user.zona
                ).select_related(
                    'medida', 'medida__legajo', 'medida__legajo__zona',
                    'tipo_dispositivo', 'motivo', 'sub_motivo',
                    'categoria_intervencion', 'registrado_por'
                )

        # Equipo Técnico: solo las que registró
        return TIntervencionMedida.objects.filter(
            registrado_por=user
        ).select_related(
            'medida', 'medida__legajo', 'medida__legajo__zona',
            'tipo_dispositivo', 'motivo', 'sub_motivo',
            'categoria_intervencion', 'registrado_por'
        )

    def create(self, request, *args, **kwargs):
        """
        POST /api/medidas/{medida_id}/intervenciones/

        Crear borrador de intervención
        """
        # Obtener medida
        medida_id = kwargs.get('medida_pk') or request.data.get('medida')
        medida = get_object_or_404(TMedida, pk=medida_id)

        # Verificar que medida esté en Estado 1
        if medida.etapa_actual.estado != 'PENDIENTE_REGISTRO_INTERVENCION':
            return Response(
                {
                    'error': 'ESTADO_INVALIDO',
                    'detalle': 'Solo se puede registrar intervención en Estado 1 (Pendiente de Registro)',
                    'estado_actual': medida.etapa_actual.get_estado_display()
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar permisos
        legajo = medida.legajo
        user = request.user

        puede_crear = False
        if user.is_superuser:
            puede_crear = True
        elif hasattr(user, 'nivel_usuario'):
            if user.nivel_usuario == 'DIRECTOR':
                puede_crear = True
            elif user.nivel_usuario == 'JEFEZONAL':
                if hasattr(user, 'zona') and user.zona == legajo.zona:
                    puede_crear = True
            elif user.nivel_usuario == 'EQUIPOTECNICO':
                # Solo si es responsable del legajo
                if legajo.responsable == user:
                    puede_crear = True

        if not puede_crear:
            return Response(
                {
                    'error': 'PERMISO_DENEGADO',
                    'detalle': 'No tiene permisos para crear intervenciones en este legajo'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # Autocompletar datos del legajo
        data = request.data.copy()
        data['medida'] = medida.id
        data['legajo_numero'] = legajo.numero_legajo
        data['persona_nombre'] = legajo.persona.nombre
        data['persona_apellido'] = legajo.persona.apellido
        data['persona_dni'] = legajo.persona.dni if hasattr(legajo.persona, 'dni') else None
        data['zona_nombre'] = legajo.zona.nombre if legajo.zona else 'Sin zona'

        # Crear intervención
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)

        # Guardar con usuario registrante
        intervencion = serializer.save(registrado_por=request.user)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """
        PATCH /api/medidas/{medida_id}/intervenciones/{id}/

        Actualizar borrador de intervención
        """
        partial = kwargs.pop('partial', True)
        instance = self.get_object()

        # Verificar que se puede editar
        if not instance.puede_editar(request.user):
            return Response(
                {
                    'error': 'PERMISO_DENEGADO',
                    'detalle': 'No puede editar esta intervención',
                    'motivo': 'Solo se pueden editar intervenciones en estado BORRADOR o RECHAZADO'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

    def list(self, request, *args, **kwargs):
        """
        GET /api/medidas/{medida_id}/intervenciones/

        Listar intervenciones de una medida
        """
        medida_id = kwargs.get('medida_pk')
        if medida_id:
            queryset = self.get_queryset().filter(medida_id=medida_id)
        else:
            queryset = self.get_queryset()

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        """
        GET /api/medidas/{medida_id}/intervenciones/{id}/

        Detalle de una intervención
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
```

---

## Endpoints

### POST /api/medidas/{medida_id}/intervenciones/

**Request:**
```json
{
  "fecha_intervencion": "2025-01-20",
  "tipo_dispositivo_id": 1,
  "motivo_id": 2,
  "sub_motivo_id": 5,
  "categoria_intervencion_id": 3,
  "intervencion_especifica": "Se realizó intervención domiciliaria...",
  "descripcion_detallada": "Entrevista con familia...",
  "motivo_vulneraciones": "Vulneración de derecho a la educación...",
  "requiere_informes_ampliatorios": false
}
```

**Response 201 CREATED:**
```json
{
  "id": 1,
  "codigo_intervencion": "INT-MED-2025-000001",
  "medida": 1,
  "estado": "BORRADOR",
  "estado_display": "Borrador",
  "fecha_intervencion": "2025-01-20",
  "legajo_numero": "LEG-2025-0001",
  "persona_nombre": "Juan",
  "persona_apellido": "Pérez",
  "persona_dni": "12345678",
  "zona_nombre": "Zona Norte",
  "tipo_dispositivo_detalle": {
    "id": 1,
    "nombre": "Acogimiento Familiar"
  },
  "motivo_detalle": {
    "id": 2,
    "nombre": "Violencia Familiar"
  },
  "sub_motivo_detalle": {
    "id": 5,
    "nombre": "Violencia Física"
  },
  "categoria_intervencion_detalle": {
    "id": 3,
    "nombre": "Acompañamiento Familiar"
  },
  "intervencion_especifica": "Se realizó intervención domiciliaria...",
  "descripcion_detallada": "Entrevista con familia...",
  "motivo_vulneraciones": "Vulneración de derecho a la educación...",
  "requiere_informes_ampliatorios": false,
  "fecha_envio": null,
  "fecha_aprobacion": null,
  "fecha_rechazo": null,
  "registrado_por_detalle": {
    "id": 5,
    "nombre_completo": "María González",
    "username": "mgonzalez"
  },
  "observaciones_jz": null,
  "fecha_creacion": "2025-01-20T10:30:00Z",
  "fecha_modificacion": "2025-01-20T10:30:00Z"
}
```

---

### PATCH /api/medidas/{medida_id}/intervenciones/{id}/

**Request:**
```json
{
  "descripcion_detallada": "Actualización: Se agregó seguimiento con escuela..."
}
```

**Response 200 OK:** (igual estructura que POST)

---

### GET /api/medidas/{medida_id}/intervenciones/

**Response 200 OK:**
```json
[
  {
    "id": 1,
    "codigo_intervencion": "INT-MED-2025-000001",
    "estado": "BORRADOR",
    "estado_display": "Borrador",
    "fecha_intervencion": "2025-01-20",
    "registrado_por_detalle": { ... }
  }
]
```

---

### GET /api/medidas/{medida_id}/intervenciones/{id}/

**Response 200 OK:** (estructura completa igual que POST)

---

## Tests Requeridos (8-10 tests)

### Test Suite: Creación y Registro

**Archivo:** `runna/tests/test_intervencion_med02a.py`

```python
from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from infrastructure.models import (
    TMedida, TEtapaMedida, TIntervencionMedida,
    TTipoDispositivo, TSubMotivo, TCategoriaIntervencion,
    TCategoriaMotivo
)

CustomUser = get_user_model()


class IntervencionCreacionTestCase(TestCase):
    """Tests de creación y borrador de intervenciones (MED-02a)"""

    def setUp(self):
        """Configurar datos de prueba"""
        # Crear usuarios
        self.admin = CustomUser.objects.create_superuser(...)
        self.et_user = CustomUser.objects.create_user(nivel_usuario='EQUIPOTECNICO', ...)

        # Crear medida en Estado 1
        self.medida = TMedida.objects.create(...)
        self.etapa = TEtapaMedida.objects.create(
            medida=self.medida,
            estado='PENDIENTE_REGISTRO_INTERVENCION'
        )
        self.medida.etapa_actual = self.etapa
        self.medida.save()

        # Crear catálogos
        self.tipo_dispositivo = TTipoDispositivo.objects.create(...)
        self.motivo = TCategoriaMotivo.objects.create(...)
        self.sub_motivo = TSubMotivo.objects.create(categoria_motivo=self.motivo, ...)
        self.categoria = TCategoriaIntervencion.objects.create(...)

        self.client = APIClient()

    def test_crear_intervencion_genera_codigo_unico(self):
        """Código de intervención se genera automáticamente y es único"""
        self.client.force_authenticate(user=self.admin)

        # Crear 3 intervenciones
        for i in range(3):
            response = self.client.post(
                f'/api/medidas/{self.medida.id}/intervenciones/',
                data={...}
            )
            self.assertEqual(response.status_code, 201)

        # Verificar códigos secuenciales
        intervenciones = TIntervencionMedida.objects.all().order_by('id')
        self.assertEqual(len(intervenciones), 3)
        self.assertIn('INT-MED-2025-000001', intervenciones[0].codigo_intervencion)
        self.assertIn('INT-MED-2025-000002', intervenciones[1].codigo_intervencion)
        self.assertIn('INT-MED-2025-000003', intervenciones[2].codigo_intervencion)

    def test_crear_intervencion_autocompleta_datos_legajo(self):
        """Datos de legajo y persona se autocomple human automáticamente"""
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            f'/api/medidas/{self.medida.id}/intervenciones/',
            data={
                'fecha_intervencion': '2025-01-20',
                'motivo_id': self.motivo.id,
                'categoria_intervencion_id': self.categoria.id,
                'intervencion_especifica': 'Test'
            }
        )

        self.assertEqual(response.status_code, 201)
        data = response.json()

        # Verificar autocompletado
        self.assertEqual(data['legajo_numero'], self.medida.legajo.numero_legajo)
        self.assertEqual(data['persona_nombre'], self.medida.legajo.persona.nombre)
        self.assertEqual(data['persona_apellido'], self.medida.legajo.persona.apellido)

    def test_crear_intervencion_estado_inicial_borrador(self):
        """Intervención creada tiene estado BORRADOR por defecto"""
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(...)

        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data['estado'], 'BORRADOR')
        self.assertEqual(data['estado_display'], 'Borrador')

    def test_guardar_borrador_parcial_sin_validacion(self):
        """Sistema permite guardar borrador con datos parciales"""
        self.client.force_authenticate(user=self.admin)

        # Crear con solo campos mínimos
        response = self.client.post(
            f'/api/medidas/{self.medida.id}/intervenciones/',
            data={
                'fecha_intervencion': '2025-01-20',
                'motivo_id': self.motivo.id,
                'categoria_intervencion_id': self.categoria.id,
                'intervencion_especifica': 'Borrador inicial'
                # Faltan campos opcionales
            }
        )

        self.assertEqual(response.status_code, 201)

        # Verificar que se guardó
        intervencion = TIntervencionMedida.objects.first()
        self.assertIsNotNone(intervencion)
        self.assertEqual(intervencion.estado, 'BORRADOR')

    def test_editar_borrador_actualiza_datos(self):
        """Equipo Técnico puede editar su borrador"""
        self.client.force_authenticate(user=self.et_user)

        # Crear intervención
        intervencion = TIntervencionMedida.objects.create(
            medida=self.medida,
            estado='BORRADOR',
            registrado_por=self.et_user,
            fecha_intervencion='2025-01-20',
            motivo=self.motivo,
            categoria_intervencion=self.categoria,
            intervencion_especifica='Versión 1'
        )

        # Editar
        response = self.client.patch(
            f'/api/medidas/{self.medida.id}/intervenciones/{intervencion.id}/',
            data={'intervencion_especifica': 'Versión 2 actualizada'}
        )

        self.assertEqual(response.status_code, 200)

        # Verificar actualización
        intervencion.refresh_from_db()
        self.assertEqual(intervencion.intervencion_especifica, 'Versión 2 actualizada')

    def test_validar_fecha_intervencion_no_futura(self):
        """Fecha de intervención no puede ser futura"""
        self.client.force_authenticate(user=self.admin)

        from datetime import date, timedelta
        fecha_futura = date.today() + timedelta(days=10)

        response = self.client.post(
            f'/api/medidas/{self.medida.id}/intervenciones/',
            data={
                'fecha_intervencion': str(fecha_futura),
                'motivo_id': self.motivo.id,
                'categoria_intervencion_id': self.categoria.id,
                'intervencion_especifica': 'Test'
            }
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('fecha_intervencion', response.json())

    def test_validar_sub_motivo_pertenece_a_motivo(self):
        """Sub-motivo debe pertenecer a la categoría de motivo seleccionada"""
        self.client.force_authenticate(user=self.admin)

        # Crear otro motivo y sub-motivo
        otro_motivo = TCategoriaMotivo.objects.create(nombre='Otro Motivo')
        sub_motivo_otro = TSubMotivo.objects.create(
            categoria_motivo=otro_motivo,
            nombre='Sub-motivo de otro motivo'
        )

        # Intentar crear con motivo1 + sub_motivo de motivo2
        response = self.client.post(
            f'/api/medidas/{self.medida.id}/intervenciones/',
            data={
                'fecha_intervencion': '2025-01-20',
                'motivo_id': self.motivo.id,  # Motivo 1
                'sub_motivo_id': sub_motivo_otro.id,  # Sub-motivo de Motivo 2
                'categoria_intervencion_id': self.categoria.id,
                'intervencion_especifica': 'Test'
            }
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('sub_motivo', response.json())

    def test_solo_equipo_tecnico_responsable_puede_crear(self):
        """Solo ET responsable del legajo puede crear intervención"""
        otro_et = CustomUser.objects.create_user(
            username='otro_et',
            nivel_usuario='EQUIPOTECNICO'
        )
        self.client.force_authenticate(user=otro_et)

        response = self.client.post(
            f'/api/medidas/{self.medida.id}/intervenciones/',
            data={...}
        )

        self.assertEqual(response.status_code, 403)
        self.assertIn('PERMISO_DENEGADO', response.json()['error'])

    def test_listar_intervenciones_filtrado_por_medida(self):
        """Listar intervenciones de una medida específica"""
        self.client.force_authenticate(user=self.admin)

        # Crear 2 intervenciones para esta medida
        TIntervencionMedida.objects.create(medida=self.medida, ...)
        TIntervencionMedida.objects.create(medida=self.medida, ...)

        # Crear otra medida con intervención
        otra_medida = TMedida.objects.create(...)
        TIntervencionMedida.objects.create(medida=otra_medida, ...)

        response = self.client.get(f'/api/medidas/{self.medida.id}/intervenciones/')

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 2)  # Solo las 2 de esta medida

    def test_detalle_intervencion_devuelve_estructura_completa(self):
        """GET detalle devuelve todos los campos y nested objects"""
        self.client.force_authenticate(user=self.admin)

        intervencion = TIntervencionMedida.objects.create(
            medida=self.medida,
            estado='BORRADOR',
            registrado_por=self.admin,
            fecha_intervencion='2025-01-20',
            tipo_dispositivo=self.tipo_dispositivo,
            motivo=self.motivo,
            sub_motivo=self.sub_motivo,
            categoria_intervencion=self.categoria,
            intervencion_especifica='Test detalle'
        )

        response = self.client.get(
            f'/api/medidas/{self.medida.id}/intervenciones/{intervencion.id}/'
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Verificar nested objects
        self.assertIn('tipo_dispositivo_detalle', data)
        self.assertIn('motivo_detalle', data)
        self.assertIn('sub_motivo_detalle', data)
        self.assertIn('categoria_intervencion_detalle', data)
        self.assertIn('registrado_por_detalle', data)
```

---

## Criterios de Aceptación (MED-02a)

### CA-1: Formulario de Registro ✅

- ✅ Formulario multi-sección accesible desde detalle de medida
- ✅ Código de intervención se genera automáticamente
- ✅ Datos de legajo, persona y zona se autocomple human

### CA-3: Guardar Borrador ✅

- ✅ Sistema guarda datos parciales sin validar obligatoriedad
- ✅ Usuario puede salir y volver más tarde
- ✅ Datos guardados están prellenados al volver
- ✅ Estado de medida permanece en Estado 1

### CA-8: Permisos de Acceso ✅ (Parcial)

- ✅ Equipo Técnico responsable puede crear y editar borrador
- ✅ Jefe Zonal de la zona puede crear y editar
- ✅ Director puede crear y editar
- ✅ Admin puede crear y editar
- ❌ Aprobar/Rechazar → MED-02b

---

## Próximos Pasos

Una vez completado MED-02a, continuar con:

1. **MED-02b**: Transiciones de estado (enviar, aprobar, rechazar) + notificaciones
2. **MED-02c**: Adjuntos y validaciones avanzadas de archivos

---

## Actualizar Management Commands

### setup_project.py

Agregar migración 0041:
```python
call_command('migrate', '0041_crear_modelos_intervencion')
```

### populate_database.py

Agregar carga de fixtures:
```python
call_command('loaddata', 'tipos_dispositivo.json')
call_command('loaddata', 'sub_motivos.json')
call_command('loaddata', 'categorias_intervencion.json')
```

---

**Fin de MED-02a: Modelos y Registro de Intervención**
