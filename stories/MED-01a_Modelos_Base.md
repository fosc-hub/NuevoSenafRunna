# MED-01a: Modelos Base para Medidas de Protección

**Fecha de Creación:** 2025-10-10
**Sprint:** TBD
**Estimación:** 8 puntos (Mediano)
**Prioridad:** Alta
**Estado:** Documentada
**Dependencias:** LEG-04 (Legajo debe existir)

---

## Historia de Usuario

**Como** Desarrollador del sistema RUNNA
**Quiero** implementar la estructura de datos base para medidas de protección (MPI, MPE, MPJ)
**Para** permitir el registro y seguimiento formal de medidas asociadas a legajos

---

## Alcance de MED-01a

Esta sub-story se enfoca **exclusivamente** en:
- ✅ Crear modelos de base de datos
- ✅ Definir estructura de datos
- ✅ Configurar migraciones
- ✅ Crear fixtures de datos base
- ✅ Tests de modelos y validaciones
- ❌ NO incluye endpoints API (ver MED-01b)
- ❌ NO incluye creación automática (ver MED-01c)

---

## Modelos a Implementar

### 1. TMedida (Modelo Principal)

```python
# infrastructure/models/medida/TMedida.py

from django.db import models
from django.contrib.auth import get_user_model
from simple_history.models import HistoricalRecords
from infrastructure.models import TLegajo
from infrastructure.models.dropdown import TJuzgado, TUrgencia

CustomUser = get_user_model()

class TMedida(models.Model):
    """
    Modelo para registrar Medidas de Protección (MPI, MPE, MPJ)
    vinculadas a un legajo.

    Estados de Vigencia:
    - VIGENTE: Medida activa y en proceso
    - CERRADA: Medida finalizada por cumplimiento
    - ARCHIVADA: Medida archivada por resolución judicial
    - NO_RATIFICADA: Medida no ratificada judicialmente
    """

    TIPO_MEDIDA_CHOICES = [
        ('MPI', 'Medida de Protección Integral'),
        ('MPE', 'Medida de Protección Excepcional'),
        ('MPJ', 'Medida Penal Juvenil'),
    ]

    ESTADO_VIGENCIA_CHOICES = [
        ('VIGENTE', 'Vigente'),
        ('CERRADA', 'Cerrada'),
        ('ARCHIVADA', 'Archivada'),
        ('NO_RATIFICADA', 'No Ratificada'),
    ]

    # Identificación
    numero_medida = models.CharField(
        max_length=50,
        unique=True,
        help_text="Número de medida autogenerado (ej: MED-2025-001-MPE)"
    )

    # Tipo y Estado
    tipo_medida = models.CharField(
        max_length=3,
        choices=TIPO_MEDIDA_CHOICES,
        help_text="Tipo de medida: MPI, MPE o MPJ"
    )

    estado_vigencia = models.CharField(
        max_length=20,
        choices=ESTADO_VIGENCIA_CHOICES,
        default='VIGENTE',
        help_text="Estado de vigencia de la medida"
    )

    # Fechas
    fecha_apertura = models.DateTimeField(
        auto_now_add=True,
        help_text="Fecha de apertura de la medida"
    )

    fecha_cierre = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Fecha de cierre de la medida"
    )

    # Relaciones
    legajo = models.ForeignKey(
        TLegajo,
        on_delete=models.CASCADE,
        related_name='medidas',
        help_text="Legajo al que pertenece la medida"
    )

    juzgado = models.ForeignKey(
        TJuzgado,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        help_text="Juzgado que interviene (opcional para MPI)"
    )

    nro_sac = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        help_text="Número SAC (Sistema de Administración de Causas)"
    )

    urgencia = models.ForeignKey(
        TUrgencia,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        help_text="Nivel de urgencia de la medida"
    )

    # Etapa Actual (FK a TEtapaMedida)
    etapa_actual = models.ForeignKey(
        'TEtapaMedida',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='medidas_en_esta_etapa',
        help_text="Etapa actual de la medida"
    )

    # Auditoría
    creado_por = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        related_name='medidas_creadas'
    )

    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)

    # Historia
    history = HistoricalRecords()

    class Meta:
        db_table = 't_medida'
        verbose_name = 'Medida'
        verbose_name_plural = 'Medidas'
        ordering = ['-fecha_apertura']
        indexes = [
            models.Index(fields=['numero_medida']),
            models.Index(fields=['tipo_medida', 'estado_vigencia']),
            models.Index(fields=['legajo', 'estado_vigencia']),
        ]

    def __str__(self):
        return f"{self.numero_medida} - {self.get_tipo_medida_display()}"

    def save(self, *args, **kwargs):
        """Override save para generar numero_medida automáticamente"""
        if not self.numero_medida:
            self.numero_medida = self.generar_numero_medida()
        super().save(*args, **kwargs)

    @staticmethod
    def generar_numero_medida():
        """
        Genera número de medida único con formato:
        MED-{año}-{consecutivo:03d}
        Ejemplo: MED-2025-001

        Nota: El tipo (MPI/MPE/MPJ) se agrega después manualmente si se desea
        """
        from datetime import datetime

        año_actual = datetime.now().year

        # Obtener último número del año
        ultima_medida = TMedida.objects.filter(
            numero_medida__startswith=f"MED-{año_actual}-"
        ).order_by('-numero_medida').first()

        if ultima_medida:
            # Extraer consecutivo de formato MED-2025-001
            partes = ultima_medida.numero_medida.split('-')
            consecutivo = int(partes[2]) + 1
        else:
            consecutivo = 1

        return f"MED-{año_actual}-{consecutivo:03d}"

    @property
    def duracion_dias(self):
        """Calcula duración de la medida en días"""
        from datetime import datetime

        fecha_fin = self.fecha_cierre or datetime.now()
        delta = fecha_fin - self.fecha_apertura
        return delta.days

    @property
    def esta_activa(self):
        """Verifica si la medida está activa"""
        return self.estado_vigencia == 'VIGENTE'
```

---

### 2. TEtapaMedida (Modelo de Etapas)

```python
# infrastructure/models/medida/TEtapaMedida.py

from django.db import models
from simple_history.models import HistoricalRecords

class TEtapaMedida(models.Model):
    """
    Modelo para registrar las etapas de una medida.

    Estados posibles (Andarivel):
    1. Pendiente de registro de intervención (MED-01 → MED-02)
    2. Pendiente de aprobación de registro (MED-02 aprobación JZ)
    3. Pendiente de Nota de Aval (MED-03)
    4. Pendiente de Informe Jurídico (MED-04)
    5. Pendiente de ratificación judicial (MED-05)
    """

    ESTADO_CHOICES = [
        ('PENDIENTE_REGISTRO_INTERVENCION', '(1) Pendiente de registro de intervención'),
        ('PENDIENTE_APROBACION_REGISTRO', '(2) Pendiente de aprobación de registro'),
        ('PENDIENTE_NOTA_AVAL', '(3) Pendiente de Nota de Aval'),
        ('PENDIENTE_INFORME_JURIDICO', '(4) Pendiente de Informe Jurídico'),
        ('PENDIENTE_RATIFICACION_JUDICIAL', '(5) Pendiente de ratificación judicial'),
    ]

    # Relación con Medida
    medida = models.ForeignKey(
        'TMedida',
        on_delete=models.CASCADE,
        related_name='etapas',
        help_text="Medida a la que pertenece esta etapa"
    )

    # Etapa
    nombre = models.CharField(
        max_length=100,
        default='Apertura de la Medida',
        help_text="Nombre de la etapa"
    )

    estado = models.CharField(
        max_length=50,
        choices=ESTADO_CHOICES,
        default='PENDIENTE_REGISTRO_INTERVENCION',
        help_text="Estado actual de la etapa"
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

    # Observaciones
    observaciones = models.TextField(
        null=True,
        blank=True,
        help_text="Observaciones sobre el estado actual"
    )

    # Auditoría
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)

    # Historia
    history = HistoricalRecords()

    class Meta:
        db_table = 't_etapa_medida'
        verbose_name = 'Etapa de Medida'
        verbose_name_plural = 'Etapas de Medidas'
        ordering = ['-fecha_inicio_estado']
        indexes = [
            models.Index(fields=['medida', 'estado']),
        ]

    def __str__(self):
        return f"{self.medida.numero_medida} - {self.nombre} - {self.get_estado_display()}"

    @property
    def esta_activa(self):
        """Verifica si la etapa está activa (sin fecha de fin)"""
        return self.fecha_fin_estado is None
```

---

### 3. TJuzgado (Modelo Dropdown)

```python
# infrastructure/models/dropdown/TJuzgado.py

from django.db import models

class TJuzgado(models.Model):
    """Juzgados que intervienen en medidas de protección"""

    TIPO_CHOICES = [
        ('FAMILIA', 'Familia'),
        ('PENAL_JUVENIL', 'Penal Juvenil'),
        ('CIVIL', 'Civil'),
        ('OTRO', 'Otro'),
    ]

    JURISDICCION_CHOICES = [
        ('CAPITAL', 'Capital'),
        ('INTERIOR', 'Interior'),
    ]

    nombre = models.CharField(
        max_length=200,
        unique=True,
        help_text="Nombre completo del juzgado"
    )

    tipo = models.CharField(
        max_length=20,
        choices=TIPO_CHOICES,
        help_text="Tipo de juzgado"
    )

    jurisdiccion = models.CharField(
        max_length=10,
        choices=JURISDICCION_CHOICES,
        help_text="Jurisdicción del juzgado"
    )

    activo = models.BooleanField(default=True)

    class Meta:
        db_table = 't_juzgado'
        verbose_name = 'Juzgado'
        verbose_name_plural = 'Juzgados'
        ordering = ['nombre']

    def __str__(self):
        return f"{self.nombre} ({self.get_jurisdiccion_display()})"
```

---

## Estructura de Archivos

```
infrastructure/
├── models/
│   ├── medida/
│   │   ├── __init__.py          # Exportar TMedida, TEtapaMedida
│   │   ├── TMedida.py
│   │   └── TEtapaMedida.py
│   └── dropdown/
│       ├── __init__.py          # Agregar TJuzgado
│       └── TJuzgado.py
└── fixtures/
    └── juzgados.json
```

---

## Exports en __init__.py

### infrastructure/models/medida/__init__.py

```python
from .TMedida import TMedida
from .TEtapaMedida import TEtapaMedida

__all__ = ['TMedida', 'TEtapaMedida']
```

### infrastructure/models/dropdown/__init__.py (modificar)

```python
# ... imports existentes ...
from .TJuzgado import TJuzgado

__all__ = [
    # ... exports existentes ...
    'TJuzgado',
]
```

### infrastructure/models/__init__.py (modificar)

```python
# ... imports existentes ...
from .medida import TMedida, TEtapaMedida
from .dropdown import TJuzgado

__all__ = [
    # ... exports existentes ...
    'TMedida',
    'TEtapaMedida',
    'TJuzgado',
]
```

---

## Fixtures

### infrastructure/fixtures/juzgados.json

```json
[
  {
    "model": "infrastructure.tjuzgado",
    "pk": 1,
    "fields": {
      "nombre": "Juzgado de Familia 1ra Nominación",
      "tipo": "FAMILIA",
      "jurisdiccion": "CAPITAL",
      "activo": true
    }
  },
  {
    "model": "infrastructure.tjuzgado",
    "pk": 2,
    "fields": {
      "nombre": "Juzgado de Familia 2da Nominación",
      "tipo": "FAMILIA",
      "jurisdiccion": "CAPITAL",
      "activo": true
    }
  },
  {
    "model": "infrastructure.tjuzgado",
    "pk": 3,
    "fields": {
      "nombre": "Juzgado de Familia 3ra Nominación",
      "tipo": "FAMILIA",
      "jurisdiccion": "CAPITAL",
      "activo": true
    }
  },
  {
    "model": "infrastructure.tjuzgado",
    "pk": 4,
    "fields": {
      "nombre": "Juzgado Penal Juvenil 1ra Nominación",
      "tipo": "PENAL_JUVENIL",
      "jurisdiccion": "CAPITAL",
      "activo": true
    }
  },
  {
    "model": "infrastructure.tjuzgado",
    "pk": 5,
    "fields": {
      "nombre": "Juzgado Penal Juvenil 2da Nominación",
      "tipo": "PENAL_JUVENIL",
      "jurisdiccion": "CAPITAL",
      "activo": true
    }
  },
  {
    "model": "infrastructure.tjuzgado",
    "pk": 6,
    "fields": {
      "nombre": "Juzgado de Familia - Río Cuarto",
      "tipo": "FAMILIA",
      "jurisdiccion": "INTERIOR",
      "activo": true
    }
  },
  {
    "model": "infrastructure.tjuzgado",
    "pk": 7,
    "fields": {
      "nombre": "Juzgado de Familia - Villa María",
      "tipo": "FAMILIA",
      "jurisdiccion": "INTERIOR",
      "activo": true
    }
  },
  {
    "model": "infrastructure.tjuzgado",
    "pk": 8,
    "fields": {
      "nombre": "Juzgado de Familia - San Francisco",
      "tipo": "FAMILIA",
      "jurisdiccion": "INTERIOR",
      "activo": true
    }
  }
]
```

---

## Migraciones

### Comandos de Migración

```bash
# 1. Crear migraciones
python manage.py makemigrations infrastructure --name crear_modelos_medida

# 2. Aplicar migraciones
python manage.py migrate

# 3. Cargar fixtures
python manage.py loaddata juzgados.json
```

---

## Actualizar Management Commands

### 1. setup_project.py (modificar)

```python
# runna/infrastructure/management/commands/setup_project.py

# ... código existente ...

def handle(self, *args, **options):
    # ... migraciones existentes ...

    # MED-01a: Modelos de Medidas
    self.stdout.write("Aplicando migraciones de medidas...")
    call_command('makemigrations', 'infrastructure')
    call_command('migrate', 'infrastructure')

    # ... resto del código ...
```

### 2. populate_database.py (modificar)

```python
# runna/infrastructure/management/commands/populate_database.py

# ... código existente ...

def handle(self, *args, **options):
    # ... fixtures existentes ...

    # MED-01a: Juzgados
    self.stdout.write("Cargando juzgados...")
    call_command('loaddata', 'juzgados.json')

    # ... resto del código ...
```

---

## Tests Requeridos (5 tests)

### Suite: Tests de Modelos

```python
# runna/tests/test_medida_modelos.py

import pytest
from datetime import datetime, timedelta
from django.db import IntegrityError
from infrastructure.models import TMedida, TEtapaMedida, TJuzgado, TLegajo, TPersona

@pytest.mark.django_db
class TestTMedidaModelo:
    """Tests del modelo TMedida"""

    def test_crear_medida_genera_numero_automatico(self, legajo):
        """Al crear medida, numero_medida se genera automáticamente"""
        medida = TMedida.objects.create(
            legajo=legajo,
            tipo_medida='MPI'
        )

        assert medida.numero_medida is not None
        assert medida.numero_medida.startswith('MED-2025-')
        assert len(medida.numero_medida) == 12  # MED-2025-001

    def test_numero_medida_es_unico(self, legajo):
        """Números de medida son únicos"""
        medida1 = TMedida.objects.create(legajo=legajo, tipo_medida='MPI')
        medida2 = TMedida.objects.create(legajo=legajo, tipo_medida='MPE')

        assert medida1.numero_medida != medida2.numero_medida

    def test_duracion_dias_calcula_correctamente(self, legajo):
        """Propiedad duracion_dias calcula días transcurridos"""
        fecha_pasada = datetime.now() - timedelta(days=30)

        medida = TMedida.objects.create(
            legajo=legajo,
            tipo_medida='MPE'
        )
        # Simular fecha de apertura hace 30 días
        medida.fecha_apertura = fecha_pasada
        medida.save()

        assert medida.duracion_dias >= 30

    def test_esta_activa_devuelve_correcto(self, legajo):
        """Propiedad esta_activa verifica estado vigente"""
        medida_activa = TMedida.objects.create(
            legajo=legajo,
            tipo_medida='MPI',
            estado_vigencia='VIGENTE'
        )

        medida_cerrada = TMedida.objects.create(
            legajo=legajo,
            tipo_medida='MPE',
            estado_vigencia='CERRADA'
        )

        assert medida_activa.esta_activa is True
        assert medida_cerrada.esta_activa is False

    def test_simple_history_registra_cambios(self, legajo):
        """simple_history registra cambios en medida"""
        medida = TMedida.objects.create(
            legajo=legajo,
            tipo_medida='MPI'
        )

        # Modificar estado
        medida.estado_vigencia = 'CERRADA'
        medida.save()

        # Verificar historial
        assert medida.history.count() == 2  # CREATE + UPDATE
        ultimo = medida.history.first()
        assert ultimo.estado_vigencia == 'CERRADA'


@pytest.mark.django_db
class TestTEtapaMedidaModelo:
    """Tests del modelo TEtapaMedida"""

    def test_crear_etapa_inicial(self, medida):
        """Crear etapa inicial con estado 1"""
        etapa = TEtapaMedida.objects.create(
            medida=medida,
            nombre='Apertura de la Medida',
            estado='PENDIENTE_REGISTRO_INTERVENCION'
        )

        assert etapa.nombre == 'Apertura de la Medida'
        assert etapa.estado == 'PENDIENTE_REGISTRO_INTERVENCION'
        assert etapa.fecha_fin_estado is None

    def test_esta_activa_sin_fecha_fin(self, medida):
        """Etapa está activa si no tiene fecha_fin"""
        etapa = TEtapaMedida.objects.create(
            medida=medida,
            estado='PENDIENTE_REGISTRO_INTERVENCION'
        )

        assert etapa.esta_activa is True

        # Finalizar etapa
        etapa.fecha_fin_estado = datetime.now()
        etapa.save()

        assert etapa.esta_activa is False


@pytest.mark.django_db
class TestTJuzgadoModelo:
    """Tests del modelo TJuzgado"""

    def test_crear_juzgado(self):
        """Crear juzgado correctamente"""
        juzgado = TJuzgado.objects.create(
            nombre='Juzgado de Familia 1ra Nom.',
            tipo='FAMILIA',
            jurisdiccion='CAPITAL',
            activo=True
        )

        assert juzgado.nombre == 'Juzgado de Familia 1ra Nom.'
        assert juzgado.tipo == 'FAMILIA'
        assert juzgado.jurisdiccion == 'CAPITAL'

    def test_nombre_juzgado_es_unico(self):
        """Nombre de juzgado debe ser único"""
        TJuzgado.objects.create(
            nombre='Juzgado Test',
            tipo='FAMILIA',
            jurisdiccion='CAPITAL'
        )

        with pytest.raises(IntegrityError):
            TJuzgado.objects.create(
                nombre='Juzgado Test',  # Duplicado
                tipo='FAMILIA',
                jurisdiccion='INTERIOR'
            )
```

---

## Fixtures para Tests

```python
# runna/tests/conftest.py (agregar)

import pytest
from infrastructure.models import TMedida, TJuzgado, TLegajo, TPersona

@pytest.fixture
def juzgado():
    """Fixture de juzgado"""
    return TJuzgado.objects.create(
        nombre='Juzgado de Familia Test',
        tipo='FAMILIA',
        jurisdiccion='CAPITAL',
        activo=True
    )

@pytest.fixture
def medida(legajo):
    """Fixture de medida"""
    return TMedida.objects.create(
        legajo=legajo,
        tipo_medida='MPE',
        estado_vigencia='VIGENTE'
    )
```

---

## Criterios de Aceptación

### CA-1: Modelos Creados

- ✅ `TMedida` creado con todos los campos definidos
- ✅ `TEtapaMedida` creado con relación a TMedida
- ✅ `TJuzgado` creado como dropdown
- ✅ Relaciones FK configuradas correctamente
- ✅ simple_history habilitado en TMedida y TEtapaMedida

### CA-2: Generación de Número de Medida

- ✅ Número se genera automáticamente en formato `MED-{año}-{consecutivo:03d}`
- ✅ Consecutivo incrementa correctamente por año
- ✅ Número es único en toda la tabla
- ✅ No se permiten duplicados

### CA-3: Campos Calculados

- ✅ `duracion_dias` calcula días transcurridos correctamente
- ✅ `esta_activa` verifica estado vigente
- ✅ Propiedades funcionan en queries y serializers

### CA-4: Migraciones y Fixtures

- ✅ Migraciones se ejecutan sin errores
- ✅ Fixtures de juzgados se cargan correctamente
- ✅ `setup_project.py` incluye nuevas migraciones
- ✅ `populate_database.py` carga nuevos fixtures

### CA-5: Tests Unitarios

- ✅ 5 tests de modelos pasan correctamente
- ✅ Tests cubren generación de número, validaciones, propiedades
- ✅ simple_history funciona correctamente

---

## Ciclo de Validación en Base de Datos

```bash
# 1. Activar entorno
pipenv shell

# 2. Aplicar migraciones
python .\runna\manage.py setup_project

# 3. Cargar fixtures
python .\runna\manage.py populate_database

# 4. Ejecutar tests
python .\runna\manage.py test tests.test_medida_modelos -v 2

# 5. Verificar en consola Django
python .\runna\manage.py shell
>>> from infrastructure.models import TMedida, TJuzgado
>>> TJuzgado.objects.count()  # Debe ser 8
>>> medida = TMedida.objects.create(legajo_id=1, tipo_medida='MPI')
>>> medida.numero_medida  # Debe mostrar MED-2025-001
```

---

## Próximos Pasos

Después de completar MED-01a:

1. ✅ Modelos base creados y validados
2. ⏳ **MED-01b:** Implementar creación manual desde legajo (serializers + endpoints)
3. ⏳ **MED-01c:** Implementar creación automática desde demanda (signals)
4. ⏳ **MED-02:** Registro de intervención en medida

---

## Resumen Ejecutivo

**MED-01a** implementa la **estructura de datos base** para medidas de protección:
- **3 modelos:** TMedida (principal), TEtapaMedida (estados), TJuzgado (dropdown)
- **Generación automática:** numero_medida único por año
- **Auditoría completa:** simple_history en modelos principales
- **Fixtures:** 8 juzgados (Capital + Interior)
- **5 tests:** Validación de modelos, generación de número, propiedades calculadas

**Estimación:** 8 puntos (Mediano)
**Tiempo:** 2-3 días backend

**Listo para implementación con:**
```bash
/sc:implement --persona-backend "Implementar MED-01a según story documentada"
```
