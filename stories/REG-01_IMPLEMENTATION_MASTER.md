# REG-01 Implementation Master Document

**Fecha de Creación:** 2025-10-26
**Versión:** 1.0
**Story Base:** [REG-01_Registro_Demanda.md](.claude/stories/REG-01_Registro_Demanda.md)
**Auditorías:**
- [REG-01_AUDIT_REPORT.md](../claudedocs/REG-01_AUDIT_REPORT.md)
- [REG-01_AUDIT_REPORT_V2_EXTENDED.md](../claudedocs/REG-01_AUDIT_REPORT_V2_EXTENDED.md)

---

## 1. CONTEXTO Y OBJETIVOS

### 1.1 Resumen Ejecutivo

REG-01 (Registro de Demanda) es el **punto de entrada principal** del sistema SENAF-RUNNA. Las auditorías técnicas revelaron **gaps críticos** que requieren implementación inmediata:

**Situación Actual:**
- ✅ 2/3 objetivos implementados: `PROTECCION`, `PETICION_DE_INFORME`
- ✅ Creación automática de Medida desde demandas PROTECCION (signal implementado)
- ❌ 0% cobertura de tests específicos para REG-01
- ❌ 7/8 validaciones críticas desactivadas (comentadas)
- ❌ Objetivo `CARGA_OFICIOS` completamente ausente (30% funcionalidad)
- ❌ Auto-creación actividades PLTM desde PI/CO sin implementar

**Deuda Técnica Total:** 148 story points (18-24 semanas, 2 devs)

**Fase 1 (Crítica):** 32 story points (4 semanas) - IMPLEMENTAR AHORA

---

### 1.2 Objetivos de la Fase 1

**Meta:** Eliminar riesgos críticos inmediatos que afectan integridad de datos y funcionalidad core.

**Entregables:**
1. ✅ **Activar 7 validaciones críticas comentadas** (GAP-02) - 3 puntos
2. ✅ **Tests básicos de registro de demanda** (GAP-01) - 5 puntos
3. ✅ **Tests de validaciones críticas** (GAP-01) - 8 puntos
4. ✅ **Implementar objetivo CARGA_OFICIOS completo** (GAP-06) - 16 puntos

**Impacto Esperado:**
- 🎯 Cobertura de tests: 0% → 40%
- 🎯 Validaciones activas: 12.5% → 53%
- 🎯 Objetivos implementados: 66% → 100%
- 🎯 Riesgo operacional: CRÍTICO → MEDIO

---

## 2. ARQUITECTURA ACTUAL

### 2.1 Referencia a Documentación Base

**Story Principal:** [.claude/stories/REG-01_Registro_Demanda.md](.claude/stories/REG-01_Registro_Demanda.md)

**Componentes Implementados:**
- ✅ **10 modelos** principales (TDemanda, TDemandaPersona, TDemandaZona, etc.)
- ✅ **5 endpoints** RESTful funcionales
- ✅ **Workflow de 8 estados** para demandas
- ✅ **Integración con módulos** BE, CONS, EVAL, LEG, MED
- ✅ **Serializers complejos** (RegistroDemandaFormSerializer, MesaDeEntradaSerializer)

**Signals Implementados:**
```python
# runna/infrastructure/signals/medida_signals.py
@receiver(post_save, sender=TDemanda)
def crear_medida_automatica(...)  # ✅ PROTECCION → MEDIDA

# runna/infrastructure/signals/demanda_signals.py
@receiver(post_save, sender=TDemanda)
def crear_legajo_automatico(...)  # ✅ Validaciones de estado
```

---

### 2.2 Arquitectura de Referencia (MED-01)

El módulo MED-01 es el **patrón de referencia** para implementar REG-01, ya que sigue Clean Architecture y tiene cobertura completa de tests.

**Estructura MED-01 (copiar):**
```
infrastructure/
├── models/
│   ├── medida_models.py         # Modelos principales
│   └── dropdown/
│       └── TJuzgado.py          # Modelos catálogo
├── business_logic/
│   └── med01_validaciones.py    # Lógica de negocio pura
├── signals/
│   └── medida_signals.py        # Auto-creación y eventos
└── fixtures/
    └── juzgados.json            # Datos maestros

api/
├── serializers/
│   └── medida_serializers.py    # Serializers + validaciones
└── views/
    └── medida_views.py          # ViewSets + endpoints

tests/
├── test_medida_creacion_manual.py
├── test_medida_creacion_automatica.py
└── test_medida_validaciones.py
```

---

## 3. GAPS Y DEUDA TÉCNICA

### 3.1 Resumen de Gaps Críticos

Basado en [REG-01_AUDIT_REPORT_V2_EXTENDED.md](../claudedocs/REG-01_AUDIT_REPORT_V2_EXTENDED.md):

| Gap ID | Componente | Descripción | Severidad | Puntos | Fase |
|--------|-----------|-------------|-----------|--------|------|
| **GAP-01** | Tests Ausentes | 0% cobertura REG-01 | 🔴 CRÍTICA | 21 | 1 y 2 |
| **GAP-02** | Validaciones Comentadas | 7/8 validaciones desactivadas | 🔴 CRÍTICA | 3 | 1 |
| **GAP-03** | Validaciones Activas | Solo 1/8 validaciones activas | 🟡 MEDIA | 5 | 2 |
| **GAP-04** | Serializer Validation | Validaciones ausentes | 🟡 MEDIA | 5 | 2 |
| **GAP-05** | Códigos Demanda | Validación desactivada | 🟢 BAJA | 2 | 4 |
| **GAP-06** | CARGA_OFICIOS | Objetivo no implementado | 🔴 CRÍTICA | 16 | 1 |
| **GAP-07** | PI → PLTM | Auto-creación actividad ausente | 🔴 CRÍTICA | 8 | 2 |
| **GAP-08** | CO → PLTM | Auto-creación N actividades ausente | 🔴 CRÍTICA | 13 | 2 |
| **GAP-09** | Bloqueo Acciones | Validaciones por objetivo ausentes | 🟡 MEDIA | 5 | 2 |
| **GAP-10** | Recordatorios | Sistema N-3/N-1/N ausente | 🟡 MEDIA | 8 | 3 |
| **GAP-11** | Catálogo Oficios | TTipoOficio no existe | 🟡 ALTA | 3 | 3 |
| **GAP-12** | Deep-links | Campo demanda_origen ausente | 🟢 BAJA | 2 | 3 |

**Total Deuda:** 148 story points → **Fase 1:** 32 puntos (3+5+8+16)

---

### 3.2 Gaps de Fase 1 (Detalle)

#### GAP-02: Validaciones Comentadas (3 puntos)

**Ubicación:** `runna/infrastructure/models/Demanda.py:184-210`, `Intermedias.py:137-150`

**Validaciones a Activar:**

```python
# V1: Ambito de vulneración obligatorio (PROTECCION)
if self.objetivo_de_demanda == 'PROTECCION':
    if not self.ambito_vulneracion:
        raise ValidationError("...")

# V2: Consistencia bloque_remitente ↔ tipo_institucion
if self.tipo_institucion:
    if self.bloque_datos_remitente != self.tipo_institucion.bloque_datos_remitente:
        raise ValidationError("...")

# V3: Consistencia motivo ↔ submotivo
if self.submotivo_ingreso:
    if self.motivo_ingreso != self.submotivo_ingreso.motivo:
        raise ValidationError("...")

# V5: Un solo NNyA principal por demanda (Intermedias.py)
if self.vinculo_demanda == 'NNYA_PRINCIPAL':
    existing = TDemandaPersona.objects.filter(...).exists()
    if existing:
        raise ValidationError("...")

# V6: Un solo supuesto autor principal
# V7: Validación NNyA vs adulto según rol
```

---

#### GAP-01: Tests Ausentes (13 puntos en Fase 1)

**Archivos a crear:**
1. `runna/tests/test_registro_demanda_basico.py` (5 puntos)
2. `runna/tests/test_registro_demanda_validaciones.py` (8 puntos)

**Cobertura Objetivo:** 60% (casos básicos + validaciones críticas)

---

#### GAP-06: CARGA_OFICIOS No Implementado (16 puntos)

**Componentes a Crear:**

1. **Modelo Catálogo:** `infrastructure/models/dropdown/TTipoOficio.py`
2. **Campos TDemanda:** `tipo_oficio`, `numero_expediente`, `caratula`, `plazo_dias`, `fecha_vencimiento_oficio`
3. **Choice CARGA_OFICIOS:** Agregar a `OBJETIVO_DE_DEMANDA_CHOICES`
4. **Signal:** `crear_medida_mpj_desde_oficio()` en `medida_signals.py`
5. **Validaciones:** `validar_accion_permitida_por_objetivo()` en `business_logic/demanda_validaciones.py`
6. **Fixtures:** `infrastructure/fixtures/tipos_oficio.json`
7. **Tests:** `runna/tests/test_carga_oficios.py` (8 tests)

---

## 4. PLAN DE IMPLEMENTACIÓN FASE 1

### 4.1 Estrategia de Implementación

**Enfoque:** Iterativo incremental con validación continua.

**Orden de Ejecución:**
1. ✅ **Activar validaciones** (GAP-02) → Base de integridad de datos
2. ✅ **Tests básicos** (GAP-01.1) → Cobertura de funcionalidad actual
3. ✅ **Tests de validaciones** (GAP-01.2) → Verificar validaciones activadas
4. ✅ **Implementar CARGA_OFICIOS** (GAP-06) → Funcionalidad completa

**Validación Continua:**
```bash
# Después de cada tarea:
python runna/manage.py test tests.test_registro_demanda* -v 2
python runna/manage.py makemigrations
python runna/manage.py migrate
python runna/manage.py populate_database
```

---

### 4.2 Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Activar validaciones rompe datos existentes | ALTA | CRÍTICO | Auditoría previa + migración de datos inconsistentes |
| Tests fallan por fixtures faltantes | MEDIA | ALTO | Crear fixtures completos antes de tests |
| CARGA_OFICIOS requiere cambios DB | ALTA | MEDIO | Migración cuidadosa + rollback plan |
| Signal MPJ duplica medidas | MEDIA | ALTO | Validación de existencia antes de crear |

**Plan de Rollback:**
```bash
# Backup DB antes de comenzar
python runna/manage.py dumpdata > backup_pre_fase1.json

# Si falla:
python runna/manage.py migrate infrastructure [numero_migracion_anterior]
python runna/manage.py loaddata backup_pre_fase1.json
```

---

## 5. ESPECIFICACIONES TÉCNICAS

### 5.1 Estructura de Directorios

```
c:\Users\facun\Documents\SENAF-RUNNA-db-backend\
├── runna/
│   ├── infrastructure/
│   │   ├── models/
│   │   │   ├── Demanda.py                    # ✏️ MODIFICAR (GAP-02, GAP-06)
│   │   │   ├── Intermedias.py                # ✏️ MODIFICAR (GAP-02)
│   │   │   ├── dropdown/
│   │   │   │   └── TTipoOficio.py           # ✅ CREAR (GAP-06)
│   │   │   └── __init__.py                   # ✏️ MODIFICAR (export TTipoOficio)
│   │   ├── business_logic/
│   │   │   ├── __init__.py
│   │   │   ├── med01_validaciones.py         # ✅ EXISTENTE (referencia)
│   │   │   └── demanda_validaciones.py       # ✅ CREAR (GAP-06)
│   │   ├── signals/
│   │   │   ├── medida_signals.py             # ✏️ MODIFICAR (GAP-06 signal)
│   │   │   └── demanda_signals.py            # ✅ EXISTENTE
│   │   └── fixtures/
│   │       ├── juzgados.json                 # ✅ EXISTENTE
│   │       └── tipos_oficio.json             # ✅ CREAR (GAP-06)
│   ├── api/
│   │   ├── serializers/
│   │   │   ├── DemandaSerializer.py          # ✅ EXISTENTE
│   │   │   └── ComposedSerializer.py         # ✅ EXISTENTE
│   │   └── views/
│   │       ├── DemandaView.py                # ✅ EXISTENTE
│   │       └── ComposedView.py               # ✅ EXISTENTE
│   └── tests/
│       ├── __init__.py
│       ├── conftest.py                       # ✏️ MODIFICAR (fixtures)
│       ├── test_registro_demanda_basico.py   # ✅ CREAR (GAP-01)
│       ├── test_registro_demanda_validaciones.py  # ✅ CREAR (GAP-01)
│       └── test_carga_oficios.py             # ✅ CREAR (GAP-06)
└── pytest.ini                                 # ✅ CREAR (si no existe)
```

---

### 5.2 Convenciones de Código

#### 5.2.1 Imports (Orden y Estilo)

```python
# Orden de imports (seguir PEP 8 + Django best practices):

# 1. Standard library
from datetime import datetime, date, timedelta
import json

# 2. Django imports
from django.db import models
from django.db.models import Q, Count
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.db.models.signals import post_save
from django.dispatch import receiver

# 3. Third-party packages
from rest_framework import serializers, status
from rest_framework.decorators import action
from rest_framework.response import Response
from simple_history.models import HistoricalRecords

# 4. Local app imports
from infrastructure.models import TDemanda, TLegajo, TMedida
from customAuth.models import CustomUser, TZona
from api.serializers import TDemandaSerializer

# Usar nombres completos, NO hacer:
from infrastructure.models import *  # ❌ NUNCA
```

---

#### 5.2.2 Docstrings (Google Style)

```python
def validar_accion_permitida_por_objetivo(demanda, accion):
    """
    Valida si una acción está permitida según el objetivo de la demanda.

    Args:
        demanda (TDemanda): Instancia de demanda a validar.
        accion (str): Código de acción ('CONSTATACION', 'EVALUACION', etc.).

    Returns:
        tuple: (permitido: bool, mensaje_error: str | None)

    Raises:
        TypeError: Si demanda no es instancia de TDemanda.

    Examples:
        >>> demanda_pi = TDemanda(objetivo_de_demanda='PETICION_DE_INFORME')
        >>> permitido, error = validar_accion_permitida_por_objetivo(demanda_pi, 'CONSTATACION')
        >>> print(permitido)
        False
    """
    pass
```

---

#### 5.2.3 Naming Conventions

```python
# Modelos: PascalCase con prefijo T
class TDemanda(models.Model):
    pass

class TTipoOficio(models.Model):
    pass

# Funciones y métodos: snake_case
def crear_medida_automatica(sender, instance, **kwargs):
    pass

# Constantes: UPPER_SNAKE_CASE
OBJETIVO_DE_DEMANDA_CHOICES = [
    ('PROTECCION', 'Protección'),
]

# Variables: snake_case
demanda_pi = TDemanda.objects.filter(...)
tipo_oficio = instance.tipo_oficio

# Archivos: snake_case
# test_registro_demanda_basico.py
# demanda_validaciones.py
```

---

#### 5.2.4 Patrones de Código

**Validaciones en Model.save():**
```python
def save(self, *args, **kwargs):
    """Override save para validaciones pre-guardado."""
    if not self.pk:  # onCreate
        # Validaciones de creación
        if self.objetivo_de_demanda == 'PROTECCION':
            if not self.ambito_vulneracion:
                raise ValidationError(
                    "El ámbito de vulneración es obligatorio para demandas de protección"
                )
    else:  # onUpdate
        # Validaciones de actualización
        pass

    super().save(*args, **kwargs)
```

**Signals con Guards:**
```python
@receiver(post_save, sender=TDemanda)
def crear_medida_mpj_desde_oficio(sender, instance, created, **kwargs):
    """Signal con guards para evitar ejecuciones innecesarias."""
    # Guard 1: Solo onCreate
    if not created:
        return

    # Guard 2: Solo CARGA_OFICIOS
    if instance.objetivo_de_demanda != 'CARGA_OFICIOS':
        return

    # Guard 3: Solo si tiene tipo_oficio
    if not instance.tipo_oficio:
        return

    # Lógica principal
    ...
```

**Tests con Fixtures:**
```python
import pytest
from django.test import TestCase
from rest_framework.test import APIClient

@pytest.mark.django_db
class TestRegistroDemandaBasico(TestCase):
    """Tests básicos de registro de demanda."""

    fixtures = [
        'bloques_datos_remitente',
        'tipos_institucion',
        'zonas',
    ]

    def setUp(self):
        """Configuración común para todos los tests."""
        self.client = APIClient()
        self.user = CustomUser.objects.create_user(
            username='testuser',
            password='test123'
        )
        self.client.force_authenticate(user=self.user)

    def test_crear_demanda_minima(self):
        """Test: Crear demanda con datos mínimos requeridos."""
        data = {...}
        response = self.client.post('/api/registro-demanda-form/', data)
        self.assertEqual(response.status_code, 201)
```

---

### 5.3 Configuración de Tests

#### 5.3.1 pytest.ini (Crear si no existe)

```ini
[pytest]
DJANGO_SETTINGS_MODULE = runna.settings
python_files = test_*.py
python_classes = Test*
python_functions = test_*

# Directorio de tests
testpaths = runna/tests

# Opciones por defecto
addopts =
    --verbose
    --strict-markers
    --tb=short
    --nomigrations
    --reuse-db
    --cov=infrastructure
    --cov=api
    --cov-report=term-missing:skip-covered
    --cov-report=html:htmlcov
    --cov-fail-under=60

# Markers personalizados
markers =
    slow: marks tests as slow (deselect with '-m "not slow"')
    integration: marks tests as integration tests
    unit: marks tests as unit tests
    reg01: marks tests relacionados con REG-01

# Django database
django_find_project = false
```

---

#### 5.3.2 conftest.py (Modificar/Crear)

```python
"""
Configuración global de fixtures para tests de SENAF-RUNNA.

Fixtures disponibles:
- admin_user, equipo_user, jefe_user: Usuarios por nivel
- zona: Zona de prueba
- legajo: Legajo de prueba
- demanda_proteccion, demanda_pi, demanda_co: Demandas por objetivo
- tipo_oficio_mpj: Tipo de oficio MPJ
"""
import pytest
from django.contrib.auth import get_user_model
from infrastructure.models import (
    TZona, TLegajo, TPersona, TDemanda, TTipoOficio,
    TUrgenciaVulneracion, TBloqueDatosRemitente,
    TAmbitoVulneracion, TLocalizacion
)
from services.legajo_codes import generate_legajo_number

CustomUser = get_user_model()


# ================== FIXTURES DE USUARIOS ==================

@pytest.fixture
def admin_user(db):
    """Usuario administrador (nivel 4)."""
    return CustomUser.objects.create_user(
        username='admin_test',
        password='password123',
        nivel=4,
        is_superuser=True,
        genero='MASCULINO'
    )


@pytest.fixture
def equipo_user(db):
    """Usuario equipo técnico (nivel 2)."""
    return CustomUser.objects.create_user(
        username='equipo_test',
        password='password123',
        nivel=2,
        genero='FEMENINO'
    )


@pytest.fixture
def jefe_user(db):
    """Usuario jefe zonal (nivel 3)."""
    return CustomUser.objects.create_user(
        username='jefe_test',
        password='password123',
        nivel=3,
        genero='MASCULINO'
    )


# ================== FIXTURES DE MODELOS BASE ==================

@pytest.fixture
def zona(db):
    """Zona de prueba."""
    return TZona.objects.create(nombre='Zona Test')


@pytest.fixture
def urgencia(db):
    """Urgencia de prueba."""
    return TUrgenciaVulneracion.objects.create(
        nombre='Urgencia Test',
        peso=1
    )


@pytest.fixture
def bloque_remitente(db):
    """Bloque de datos remitente de prueba."""
    return TBloqueDatosRemitente.objects.create(
        nombre='Organismo Test'
    )


@pytest.fixture
def ambito_vulneracion(db):
    """Ámbito de vulneración de prueba."""
    return TAmbitoVulneracion.objects.create(
        nombre='Violencia Familiar'
    )


@pytest.fixture
def localizacion(db):
    """Localización de prueba."""
    from infrastructure.models import TLocalidad
    localidad = TLocalidad.objects.first() or TLocalidad.objects.create(
        nombre='Córdoba Capital'
    )
    return TLocalizacion.objects.create(
        tipo_calle='CALLE',
        nombre_calle='Test',
        numero_puerta='123',
        localidad=localidad
    )


# ================== FIXTURES DE PERSONAS Y LEGAJOS ==================

@pytest.fixture
def nnya(db):
    """NNyA de prueba."""
    return TPersona.objects.create(
        nombre='Juan',
        apellido='Pérez',
        dni='12345678',
        fecha_nacimiento=date(2010, 1, 1),
        genero='MASCULINO',
        nnya=True,
        adulto=False
    )


@pytest.fixture
def legajo(db, nnya, urgencia):
    """Legajo de prueba."""
    return TLegajo.objects.create(
        nnya=nnya,
        numero=generate_legajo_number(),
        urgencia=urgencia
    )


# ================== FIXTURES DE DEMANDAS ==================

@pytest.fixture
def demanda_proteccion(db, bloque_remitente, ambito_vulneracion, localizacion, equipo_user, zona):
    """Demanda con objetivo PROTECCION."""
    return TDemanda.objects.create(
        fecha_ingreso_senaf=date.today(),
        fecha_oficio_documento=date.today(),
        descripcion='Demanda de protección test',
        objetivo_de_demanda='PROTECCION',
        estado_demanda='SIN_ASIGNAR',
        bloque_datos_remitente=bloque_remitente,
        ambito_vulneracion=ambito_vulneracion,
        localizacion=localizacion,
        registrado_por_user=equipo_user,
        registrado_por_user_zona=zona
    )


@pytest.fixture
def demanda_pi(db, bloque_remitente, localizacion, equipo_user, zona):
    """Demanda con objetivo PETICION_DE_INFORME."""
    return TDemanda.objects.create(
        fecha_ingreso_senaf=date.today(),
        fecha_oficio_documento=date.today(),
        descripcion='Petición de informe test',
        objetivo_de_demanda='PETICION_DE_INFORME',
        estado_demanda='SIN_ASIGNAR',
        bloque_datos_remitente=bloque_remitente,
        localizacion=localizacion,
        registrado_por_user=equipo_user,
        registrado_por_user_zona=zona
    )


@pytest.fixture
def tipo_oficio_mpj(db):
    """Tipo de oficio MPJ de prueba."""
    return TTipoOficio.objects.create(
        nombre='Oficio MPJ - Apertura de Medida',
        categoria='MPJ',
        crea_medida_automatica=True,
        tipo_medida_asociada='MPJ',
        plazo_default_dias=10,
        activo=True
    )


@pytest.fixture
def demanda_co(db, bloque_remitente, localizacion, equipo_user, zona, tipo_oficio_mpj):
    """Demanda con objetivo CARGA_OFICIOS."""
    return TDemanda.objects.create(
        fecha_ingreso_senaf=date.today(),
        fecha_oficio_documento=date.today(),
        descripcion='Carga de oficio MPJ test',
        objetivo_de_demanda='CARGA_OFICIOS',
        estado_demanda='SIN_ASIGNAR',
        tipo_oficio=tipo_oficio_mpj,
        numero_expediente='EXP-2025-TEST',
        caratula='NNyA Test s/ MPJ',
        plazo_dias=10,
        bloque_datos_remitente=bloque_remitente,
        localizacion=localizacion,
        registrado_por_user=equipo_user,
        registrado_por_user_zona=zona
    )


# ================== FIXTURES DE HELPERS ==================

@pytest.fixture
def api_client():
    """Cliente API autenticado."""
    from rest_framework.test import APIClient
    return APIClient()
```

---

### 5.4 Fixtures y Datos Maestros

#### 5.4.1 Fixtures Existentes (Referencia)

```json
// infrastructure/fixtures/juzgados.json (EXISTENTE - Patrón a seguir)
[
  {
    "model": "infrastructure.tjuzgado",
    "pk": 1,
    "fields": {
      "nombre": "Juzgado de Familia 1ra Nominación",
      "tipo": "Familia",
      "jurisdiccion": "Capital",
      "activo": true
    }
  }
]
```

---

#### 5.4.2 Fixture Nuevo: tipos_oficio.json (CREAR)

```json
[
  {
    "model": "infrastructure.ttipooficio",
    "pk": 1,
    "fields": {
      "nombre": "Oficio MPJ - Apertura de Medida",
      "categoria": "MPJ",
      "crea_medida_automatica": true,
      "tipo_medida_asociada": "MPJ",
      "plazo_default_dias": 10,
      "activo": true
    }
  },
  {
    "model": "infrastructure.ttipooficio",
    "pk": 2,
    "fields": {
      "nombre": "Ratificación Judicial MPE",
      "categoria": "RATIFICACION",
      "crea_medida_automatica": false,
      "tipo_medida_asociada": null,
      "plazo_default_dias": 5,
      "activo": true
    }
  },
  {
    "model": "infrastructure.ttipooficio",
    "pk": 3,
    "fields": {
      "nombre": "Solicitud de Informe Judicial",
      "categoria": "INFORME",
      "crea_medida_automatica": false,
      "tipo_medida_asociada": null,
      "plazo_default_dias": 15,
      "activo": true
    }
  },
  {
    "model": "infrastructure.ttipooficio",
    "pk": 4,
    "fields": {
      "nombre": "Oficio MPI - Seguimiento",
      "categoria": "MPI",
      "crea_medida_automatica": false,
      "tipo_medida_asociada": null,
      "plazo_default_dias": 7,
      "activo": true
    }
  }
]
```

---

#### 5.4.3 Carga de Fixtures (Management Commands)

**Actualizar:** `runna/infrastructure/management/commands/populate_database.py`

```python
# Agregar al final del archivo:

# Cargar tipos de oficio
self.stdout.write('Cargando tipos de oficio...')
call_command('loaddata', 'tipos_oficio.json')
self.stdout.write(self.style.SUCCESS('✅ Tipos de oficio cargados'))
```

---

## 6. CHECKLIST DE IMPLEMENTACIÓN FASE 1

### 6.1 Tarea 1: Activar Validaciones Críticas (3 puntos)

**Responsable:** Backend Team
**Duración:** 1 día
**Prioridad:** 🔴 CRÍTICA

- [ ] **1.1** Leer archivo [Demanda.py:184-210](../../runna/infrastructure/models/Demanda.py#L184-L210)
- [ ] **1.2** Descomentar y ajustar validación V1 (ambito_vulneracion obligatorio)
- [ ] **1.3** Descomentar y ajustar validación V2 (consistencia bloque_remitente)
- [ ] **1.4** Descomentar y ajustar validación V3 (consistencia motivo_submotivo)
- [ ] **1.5** Leer archivo [Intermedias.py:137-150](../../runna/infrastructure/models/Intermedias.py#L137-L150)
- [ ] **1.6** Descomentar y ajustar validación V5 (un solo NNyA principal)
- [ ] **1.7** Descomentar y ajustar validación V6 (un solo autor principal)
- [ ] **1.8** Descomentar y ajustar validación V7 (NNyA vs adulto según rol)
- [ ] **1.9** Ejecutar `python runna/manage.py makemigrations` (no debería crear migraciones)
- [ ] **1.10** Verificar que código funciona sin errores de sintaxis
- [ ] **1.11** Documentar cambios en commit message: "REG-01 GAP-02: Activar 7 validaciones críticas comentadas"
- [ ] **1.12** Crear PR con título "🔴 CRÍTICO: Activar validaciones REG-01 (GAP-02)"

**Comandos de Validación:**
```bash
# Verificar sintaxis
python runna/manage.py check

# Auditar demandas existentes (antes de activar en prod)
python runna/manage.py shell
>>> from infrastructure.models import TDemanda, TDemandaPersona
>>> from django.db.models import Count
>>> # Buscar demandas con múltiples NNyA principales
>>> demandas_duplicadas = TDemanda.objects.annotate(
...     nnya_count=Count('tdemandapersona', filter=Q(tdemandapersona__vinculo_demanda='NNYA_PRINCIPAL'))
... ).filter(nnya_count__gt=1)
>>> print(f"Demandas con múltiples NNyA: {demandas_duplicadas.count()}")
```

---

### 6.2 Tarea 2: Tests Básicos de Registro (5 puntos)

**Responsable:** QA Team
**Duración:** 2 días
**Prioridad:** 🔴 CRÍTICA

- [ ] **2.1** Crear archivo `runna/tests/test_registro_demanda_basico.py`
- [ ] **2.2** Implementar clase `TestRegistroDemandaBasico(TestCase)`
- [ ] **2.3** Configurar fixtures necesarios en clase (bloques, tipos, zonas)
- [ ] **2.4** Implementar `setUp()` con cliente API y usuario de prueba
- [ ] **2.5** Implementar `test_crear_demanda_minima()` - demanda PROTECCION básica
- [ ] **2.6** Implementar `test_demanda_proteccion_sin_ambito_falla()` - validación V1
- [ ] **2.7** Implementar `test_crear_demanda_con_multiples_personas()` - NNyA + adultos
- [ ] **2.8** Implementar `test_demanda_genera_id_unico()` - verifica auto-increment
- [ ] **2.9** Implementar `test_demanda_asigna_estado_inicial_sin_asignar()` - workflow
- [ ] **2.10** Implementar `test_crear_demanda_pi_basica()` - objetivo PI
- [ ] **2.11** Implementar `test_demanda_pi_sin_ambito_ok()` - PI no requiere ámbito
- [ ] **2.12** Implementar `test_endpoint_registro_demanda_multipart()` - upload files
- [ ] **2.13** Implementar `test_demanda_crea_adjuntos()` - relación con adjuntos
- [ ] **2.14** Implementar `test_demanda_asigna_zona_correcta()` - asignación zona
- [ ] **2.15** Ejecutar tests: `pytest runna/tests/test_registro_demanda_basico.py -v`
- [ ] **2.16** Verificar cobertura mínima 60% del módulo
- [ ] **2.17** Documentar tests en commit: "REG-01 GAP-01: Tests básicos de registro (10 tests)"
- [ ] **2.18** Crear PR con título "🧪 Tests REG-01: Casos básicos de registro (GAP-01)"

**Comando de Validación:**
```bash
# Ejecutar tests con cobertura
pytest runna/tests/test_registro_demanda_basico.py -v --cov=infrastructure.models.Demanda --cov-report=term-missing

# Objetivo: 10 tests passing, coverage > 60%
```

---

### 6.3 Tarea 3: Tests de Validaciones (8 puntos)

**Responsable:** QA Team
**Duración:** 3 días
**Prioridad:** 🔴 CRÍTICA

- [ ] **3.1** Crear archivo `runna/tests/test_registro_demanda_validaciones.py`
- [ ] **3.2** Implementar clase `TestRegistroDemandaValidaciones(TestCase)`
- [ ] **3.3** Configurar fixtures (bloques, tipos, zonas, personas)
- [ ] **3.4** Implementar `test_multiples_nnya_principales_falla()` - validación V5
- [ ] **3.5** Implementar `test_adulto_como_nnya_principal_falla()` - validación V7
- [ ] **3.6** Implementar `test_nnya_como_supuesto_autor_falla()` - validación V7
- [ ] **3.7** Implementar `test_inconsistencia_motivo_submotivo_falla()` - validación V3
- [ ] **3.8** Implementar `test_inconsistencia_bloque_tipo_institucion_falla()` - validación V2
- [ ] **3.9** Implementar `test_multiple_supuesto_autor_principal_falla()` - validación V6
- [ ] **3.10** Implementar `test_proteccion_sin_ambito_vulneracion_falla()` - validación V1
- [ ] **3.11** Implementar `test_pi_sin_ambito_vulneracion_ok()` - PI no requiere
- [ ] **3.12** Implementar `test_modificar_demanda_calificada_falla()` - inmutabilidad
- [ ] **3.13** Implementar `test_nnya_principal_unico_por_persona_falla()` - unicidad
- [ ] **3.14** Implementar `test_validaciones_solo_on_create()` - no valida en update
- [ ] **3.15** Implementar `test_actualizar_descripcion_ok()` - campos mutables
- [ ] **3.16** Implementar `test_crear_demanda_con_validaciones_ok()` - caso happy path
- [ ] **3.17** Ejecutar tests: `pytest runna/tests/test_registro_demanda_validaciones.py -v`
- [ ] **3.18** Verificar 100% de tests passing (13 tests)
- [ ] **3.19** Verificar que validaciones comentadas ahora están activas
- [ ] **3.20** Documentar tests en commit: "REG-01 GAP-01: Tests de validaciones críticas (13 tests)"
- [ ] **3.21** Crear PR con título "🧪 Tests REG-01: Validaciones de integridad (GAP-01)"

**Comando de Validación:**
```bash
# Ejecutar tests con verbose
pytest runna/tests/test_registro_demanda_validaciones.py -v

# Ejecutar TODOS los tests de REG-01
pytest runna/tests/test_registro_demanda*.py -v

# Objetivo: 23 tests passing (10 básicos + 13 validaciones)
```

---

### 6.4 Tarea 4: Implementar CARGA_OFICIOS (16 puntos)

**Responsable:** Backend Team + QA Team
**Duración:** 5 días
**Prioridad:** 🔴 CRÍTICA

#### Subtarea 4.1: Modelo TTipoOficio (3 puntos)

- [ ] **4.1.1** Crear archivo `runna/infrastructure/models/dropdown/TTipoOficio.py`
- [ ] **4.1.2** Implementar modelo `TTipoOficio` con campos especificados
- [ ] **4.1.3** Agregar export en `runna/infrastructure/models/__init__.py`
- [ ] **4.1.4** Crear fixture `runna/infrastructure/fixtures/tipos_oficio.json` (4 tipos)
- [ ] **4.1.5** Actualizar `populate_database.py` para cargar fixture
- [ ] **4.1.6** Ejecutar `python runna/manage.py makemigrations`
- [ ] **4.1.7** Ejecutar `python runna/manage.py migrate`
- [ ] **4.1.8** Ejecutar `python runna/manage.py populate_database`
- [ ] **4.1.9** Verificar en shell: `TTipoOficio.objects.count() == 4`

#### Subtarea 4.2: Campos TDemanda (2 puntos)

- [ ] **4.2.1** Modificar `runna/infrastructure/models/Demanda.py`
- [ ] **4.2.2** Agregar choice `('CARGA_OFICIOS', 'Carga de Oficios')` a `OBJETIVO_DE_DEMANDA_CHOICES`
- [ ] **4.2.3** Agregar campo `tipo_oficio` FK a TTipoOficio (null=True, blank=True)
- [ ] **4.2.4** Agregar campo `numero_expediente` CharField (max_length=100, null=True)
- [ ] **4.2.5** Agregar campo `caratula` TextField (null=True, blank=True)
- [ ] **4.2.6** Agregar campo `plazo_dias` IntegerField (null=True, blank=True)
- [ ] **4.2.7** Agregar campo `fecha_vencimiento_oficio` DateField (null=True, blank=True)
- [ ] **4.2.8** Ejecutar `python runna/manage.py makemigrations`
- [ ] **4.2.9** Ejecutar `python runna/manage.py migrate`
- [ ] **4.2.10** Verificar migración exitosa

#### Subtarea 4.3: Signal Crear Medida MPJ (3 puntos)

- [ ] **4.3.1** Modificar `runna/infrastructure/signals/medida_signals.py`
- [ ] **4.3.2** Implementar signal `crear_medida_mpj_desde_oficio()` con guards
- [ ] **4.3.3** Implementar lógica de verificación de medida MPJ existente
- [ ] **4.3.4** Implementar creación de medida MPJ con campos heredados
- [ ] **4.3.5** Implementar creación de etapa inicial (sin estados para MPJ)
- [ ] **4.3.6** Verificar que signal se registra correctamente
- [ ] **4.3.7** Probar creación manual de demanda CO en shell

#### Subtarea 4.4: Validaciones de Bloqueo (2 puntos)

- [ ] **4.4.1** Crear archivo `runna/infrastructure/business_logic/demanda_validaciones.py`
- [ ] **4.4.2** Implementar función `validar_accion_permitida_por_objetivo()`
- [ ] **4.4.3** Definir diccionario de acciones bloqueadas por objetivo
- [ ] **4.4.4** Implementar lógica de validación con returns (bool, str)
- [ ] **4.4.5** Documentar uso en docstring con ejemplos
- [ ] **4.4.6** Agregar export en `business_logic/__init__.py`

#### Subtarea 4.5: Integración en ViewSets (3 puntos)

- [ ] **4.5.1** Modificar `runna/api/views/DemandaView.py` (si tiene actions)
- [ ] **4.5.2** Importar `validar_accion_permitida_por_objetivo`
- [ ] **4.5.3** Agregar validación en action `enviar_a_constatacion()` (si existe)
- [ ] **4.5.4** Agregar validación en action `enviar_a_evaluacion()` (si existe)
- [ ] **4.5.5** Verificar que serializer acepta nuevo objetivo
- [ ] **4.5.6** Verificar que frontend puede seleccionar CARGA_OFICIOS

#### Subtarea 4.6: Tests CARGA_OFICIOS (3 puntos)

- [ ] **4.6.1** Crear archivo `runna/tests/test_carga_oficios.py`
- [ ] **4.6.2** Implementar `test_crear_demanda_carga_oficios_basica()`
- [ ] **4.6.3** Implementar `test_carga_oficios_crea_medida_mpj_automatica()`
- [ ] **4.6.4** Implementar `test_carga_oficios_no_duplica_medida_mpj()`
- [ ] **4.6.5** Implementar `test_carga_oficios_bloquea_constatacion()`
- [ ] **4.6.6** Implementar `test_carga_oficios_permite_enviar_respuesta()`
- [ ] **4.6.7** Implementar `test_tipo_oficio_crea_medida_segun_config()`
- [ ] **4.6.8** Implementar `test_numero_expediente_se_guarda_en_nro_sac()`
- [ ] **4.6.9** Implementar `test_caratula_se_guarda_correctamente()`
- [ ] **4.6.10** Ejecutar tests: `pytest runna/tests/test_carga_oficios.py -v`
- [ ] **4.6.11** Verificar 8 tests passing

**Comandos de Validación Final:**
```bash
# Verificar migración
python runna/manage.py showmigrations infrastructure

# Cargar datos
python runna/manage.py populate_database

# Tests completos
pytest runna/tests/test_carga_oficios.py -v

# Verificar en shell
python runna/manage.py shell
>>> from infrastructure.models import TDemanda, TTipoOficio
>>> TDemanda.OBJETIVO_DE_DEMANDA_CHOICES
# Debe incluir ('CARGA_OFICIOS', 'Carga de Oficios')
>>> TTipoOficio.objects.count()
# Debe retornar 4
```

**Documentar en commit:**
```
REG-01 GAP-06: Implementar objetivo CARGA_OFICIOS completo

- Modelo TTipoOficio con fixture 4 tipos
- 7 campos nuevos en TDemanda (tipo_oficio, numero_expediente, etc.)
- Signal crear_medida_mpj_desde_oficio con guards
- Validaciones de bloqueo de acciones por objetivo
- 8 tests cobertura completa
```

**Crear PR:**
```
🔴 CRÍTICO: Implementar CARGA_OFICIOS (GAP-06)

Completa funcionalidad core ausente (30% de demandas)

Componentes:
- Modelo catálogo TTipoOficio
- 7 campos adicionales TDemanda
- Signal auto-creación medida MPJ
- Validaciones bloqueo acciones
- 8 tests + fixtures

Story Points: 16
Estimación: 5 días
```

---

### 6.5 Checklist de Validación Final Fase 1

**Ejecutar ANTES de mergear PR final:**

- [ ] **V1** Todas las migraciones aplicadas sin errores
- [ ] **V2** Base de datos se puede poblar con `populate_database`
- [ ] **V3** Todos los tests passing (31 tests: 10+13+8)
- [ ] **V4** Cobertura de tests >= 40%
- [ ] **V5** Validaciones activas (7/8 = 87.5%)
- [ ] **V6** Objetivo CARGA_OFICIOS disponible en dropdown
- [ ] **V7** Signal crea medida MPJ automáticamente
- [ ] **V8** No hay regresiones en tests de MED-01, LEG-01, PLTM-01
- [ ] **V9** Documentación actualizada en stories/
- [ ] **V10** Changelog actualizado

**Comandos Finales:**
```bash
# Tests completos REG-01
pytest runna/tests/test_registro_demanda*.py runna/tests/test_carga_oficios.py -v --cov=infrastructure.models.Demanda --cov=infrastructure.models.Intermedias

# Regresión completa
pytest runna/tests/test_medida*.py runna/tests/test_legajo*.py runna/tests/test_pltm*.py -v

# Setup completo desde cero
python runna/manage.py migrate
python runna/manage.py populate_database
python runna/manage.py test tests -v 2
```

---

## 7. VALIDACIÓN Y TESTING

### 7.1 Comandos de Verificación por Gap

#### GAP-02: Validaciones Activas

```bash
# Verificar sintaxis
python runna/manage.py check

# Verificar que validaciones funcionan
python runna/manage.py shell
>>> from infrastructure.models import TDemanda, TDemandaPersona
>>> from django.core.exceptions import ValidationError

# Test V1: ambito_vulneracion requerido para PROTECCION
>>> try:
...     d = TDemanda(objetivo_de_demanda='PROTECCION')
...     d.save()
... except ValidationError as e:
...     print("✅ Validación V1 activa:", e)

# Test V5: Un solo NNyA principal
>>> # Crear demanda con 2 NNyA principales debería fallar
```

---

#### GAP-01: Tests Básicos

```bash
# Ejecutar tests básicos
pytest runna/tests/test_registro_demanda_basico.py -v

# Esperado: 10 tests passing
# Cobertura: > 60% Demanda.py

# Ejecutar tests de validaciones
pytest runna/tests/test_registro_demanda_validaciones.py -v

# Esperado: 13 tests passing
```

---

#### GAP-06: CARGA_OFICIOS

```bash
# Verificar modelo TTipoOficio
python runna/manage.py shell
>>> from infrastructure.models import TTipoOficio
>>> TTipoOficio.objects.count()
# Debe retornar 4

>>> TTipoOficio.objects.filter(categoria='MPJ').first()
# Debe retornar oficio MPJ

# Verificar campo tipo_oficio en TDemanda
>>> from infrastructure.models import TDemanda
>>> TDemanda._meta.get_field('tipo_oficio')
# Debe existir

# Verificar objetivo CARGA_OFICIOS
>>> TDemanda.OBJETIVO_DE_DEMANDA_CHOICES
# Debe incluir ('CARGA_OFICIOS', 'Carga de Oficios')

# Verificar signal
>>> from infrastructure.signals.medida_signals import crear_medida_mpj_desde_oficio
>>> print(crear_medida_mpj_desde_oficio)
# Debe mostrar función

# Tests
pytest runna/tests/test_carga_oficios.py -v
# Esperado: 8 tests passing
```

---

### 7.2 Comandos de Setup Completo

```bash
# 1. Activar entorno virtual
pipenv shell

# 2. Aplicar migraciones
python runna/manage.py makemigrations
python runna/manage.py migrate

# 3. Poblar base de datos
python runna/manage.py populate_database

# 4. Ejecutar tests de REG-01
python runna/manage.py test tests.test_registro_demanda_basico -v 2
python runna/manage.py test tests.test_registro_demanda_validaciones -v 2
python runna/manage.py test tests.test_carga_oficios -v 2

# 5. Regresión completa (verificar que no rompimos nada)
python runna/manage.py test tests.test_medida* -v 2
python runna/manage.py test tests.test_legajo* -v 2
python runna/manage.py test tests.test_pltm* -v 2

# 6. Cobertura de tests
pytest runna/tests/test_registro_demanda*.py runna/tests/test_carga_oficios.py --cov=infrastructure --cov-report=html

# Abrir reporte HTML: htmlcov/index.html
```

---

### 7.3 Métricas de Éxito Fase 1

**Antes de Fase 1:**
```
Tests REG-01:          0 / 50 esperados (0%)
Validaciones activas:  1 / 8 (12.5%)
Objetivos:             2 / 3 (66%)
Cobertura código:      0% (Demanda.py)
```

**Después de Fase 1:**
```
Tests REG-01:          31 / 50 esperados (62%)
Validaciones activas:  7 / 8 (87.5%)
Objetivos:             3 / 3 (100%)
Cobertura código:      40-60% (Demanda.py, Intermedias.py)
```

**Criterios de Aprobación:**
- ✅ 31 tests passing sin fallos
- ✅ Cobertura mínima 40%
- ✅ 0 regresiones en módulos MED/LEG/PLTM
- ✅ Migrations aplicables sin errores
- ✅ Fixtures cargan correctamente

---

## 8. PRÓXIMOS PASOS (POST FASE 1)

### Fase 2: ALTA - Sprint 3-4 (36 puntos)

**Tareas:**
1. Auto-creación actividades PI → PLTM (GAP-07) - 8 puntos
2. Auto-creación actividades CO → PLTM (GAP-08) - 13 puntos
3. Validaciones de bloqueo por objetivo (GAP-09) - 5 puntos
4. Validaciones en serializer (GAP-03, GAP-04) - 10 puntos

**Preparación:**
- Revisar módulo PLTM-01 implementado
- Analizar relación TActividadPlanTrabajo ↔ TDemanda
- Diseñar campo `demanda_origen` FK

---

### Fase 3: MEDIA - Sprint 5-6 (21 puntos)

**Tareas:**
1. Sistema de recordatorios N-3/N-1/N (GAP-10) - 8 puntos
2. Catálogo TTipoOficio + fixtures (GAP-11) - 3 puntos
3. Deep-links en actividades (GAP-12) - 2 puntos
4. Tests de mesa de entrada (GAP-01) - 5 puntos
5. Tests de integración legajo (GAP-01) - 3 puntos

---

### Fase 4: BAJA - Sprint 7-8 (18 puntos)

**Tareas:**
1. Tests de adjuntos - 3 puntos
2. Tests de serializers complejos - 5 puntos
3. Validación de archivos - 2 puntos
4. Cache de dropdowns - 1 punto
5. Validación flexible códigos (GAP-05) - 2 puntos
6. Tests de performance - 3 puntos
7. Documentación OpenAPI - 2 puntos

---

## 9. REFERENCIAS

### 9.1 Documentos de Referencia

- **Story Base:** [.claude/stories/REG-01_Registro_Demanda.md](.claude/stories/REG-01_Registro_Demanda.md)
- **Auditoría V1:** [claudedocs/REG-01_AUDIT_REPORT.md](../claudedocs/REG-01_AUDIT_REPORT.md)
- **Auditoría V2 Extended:** [claudedocs/REG-01_AUDIT_REPORT_V2_EXTENDED.md](../claudedocs/REG-01_AUDIT_REPORT_V2_EXTENDED.md)
- **Arquitectura Referencia:** [.claude/stories/MED-01_Registro_Medida.md](.claude/stories/MED-01_Registro_Medida.md)

### 9.2 Código de Referencia

**Modelos:**
- [Demanda.py](../../runna/infrastructure/models/Demanda.py) - Modelo principal
- [Intermedias.py](../../runna/infrastructure/models/Intermedias.py) - Relaciones
- [medida_models.py](../../runna/infrastructure/models/medida_models.py) - Patrón MED-01

**Serializers:**
- [DemandaSerializer.py](../../runna/api/serializers/DemandaSerializer.py)
- [ComposedSerializer.py](../../runna/api/serializers/ComposedSerializer.py)

**Signals:**
- [medida_signals.py](../../runna/infrastructure/signals/medida_signals.py)
- [demanda_signals.py](../../runna/infrastructure/signals/demanda_signals.py)

**Tests Existentes (Patrón):**
- [test_medida_creacion_manual.py](../../runna/tests/test_medida_creacion_manual.py)
- [test_legajo_validaciones.py](../../runna/tests/test_legajo_validaciones.py)

---

## 10. NOTAS FINALES

### 10.1 Advertencias Importantes

⚠️ **CRÍTICO:**
- Activar validaciones puede romper demandas existentes con datos inconsistentes
- **OBLIGATORIO:** Auditoría de datos ANTES de activar validaciones en producción
- **OBLIGATORIO:** Backup completo de DB antes de comenzar Fase 1

⚠️ **IMPORTANTE:**
- Tests deben ejecutarse en entorno aislado (usar `--reuse-db` con precaución)
- Fixtures de tipos_oficio deben cargarse ANTES de crear demandas CO
- Signal de creación de medida MPJ debe verificar existencia previa

⚠️ **RECOMENDADO:**
- Ejecutar regresión completa después de cada subtarea
- Documentar TODOS los cambios en commit messages
- Revisar PRs en equipo antes de mergear

---

### 10.2 Contactos y Escalación

**Tech Lead:** [Contacto]
**QA Lead:** [Contacto]
**Product Owner:** [Contacto]

**Escalación de Bloqueos:**
1. Bloqueos técnicos → Tech Lead (mismo día)
2. Bloqueos de fixtures/datos → QA Lead (1 día)
3. Cambios de alcance → Product Owner (2 días)

---

**Documento generado:** 2025-10-26
**Autor:** Sistema SuperClaude
**Versión:** 1.0
**Estado:** LISTO PARA IMPLEMENTACIÓN FASE 1

---

**FIN DEL DOCUMENTO**
