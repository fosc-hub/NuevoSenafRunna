# Story BE-05: Listado de Legajos

## Descripción
Como usuario del sistema SENAF-RUNNA, necesito una bandeja/listado donde pueda visualizar todos los legajos existentes según mis permisos, para acceder rápidamente a la información de un legajo y poder leerla o modificarla.

**Nota de Implementación**: La ubicación de esta bandeja (pestaña en mesa de entrada de demandas o sección separada) queda a definir por los desarrolladores.

## Tipo
Backend API + Frontend (Listado con filtros y acciones)

## Prioridad
Alta (Habilita acceso a legajos para LEG-03/04 y módulos MED/PLTM)

## Dependencias Técnicas
- **Prerequisitos**:
  - Modelo Legajo existente
  - Sistema de permisos por roles/niveles
  - Relaciones con Demanda, Medidas, Actividades, Oficios
- **Habilita**: LEG-03 (Búsqueda y filtros), LEG-04 (Detalle de legajo), MED-01 a MED-05, PLTM-01 a PLTM-04

## Columnas del Listado

### Información Básica
- **ID de Legajo** (generado automáticamente)
- **N° de Legajo** (generado automáticamente, secuencial)
- **Nombre y Apellido del niño**
- **Prioridad**
- **Fecha de Última Actualización**
- **Fecha de Apertura**

### Ubicación y Responsables
- **Localidad**
- **Zona/Equipo**
- **Jefe Zonal a cargo**
- **Director a Cargo**
- **Equipo de Trabajo a cargo y su responsable**
- **Equipo de Centro de Vida a cargo y su responsable**

### Estado Operativo
- **Medidas Activas**: Con Etapa y Estado actual
- **Actividades Activas**: Con Estado actual
- **Oficios Adjuntos del Legajo**

### Indicadores Visuales (Chips y Contadores)
1. **Demanda (PI)**: Chip "PI" con contador
2. **Oficios**: Chips por tipo con semáforo de vencimiento
   - Ratificación
   - Pedido
   - Orden
   - Otros
3. **Medida**: Estado del andarivel (Intervención → Aval → Informe Jurídico → Ratificación)
4. **PT (Plan de Trabajo)**: Contadores de actividades
   - Pendientes
   - En progreso
   - Vencidas
   - Realizadas
5. **Alertas**: Notificaciones de próximos vencimientos (PT/Oficios)

### Color por Etapa
**PENDIENTE DEFINIR**: Colores según etapa del proceso (marcado como `***COMPLETAR***` en documentación)

### Acciones Disponibles
Columna con acciones rápidas (según permisos)

## Criterios de Aceptación

### CA-1: Visibilidad por Rol
**DADO** un usuario autenticado
**CUANDO** accede al listado de legajos
**ENTONCES** ve solo los legajos según su nivel/rol:

- **Jefe Zonal (Nivel 3)**: Todos los legajos de su zona
- **Equipo Técnico (Nivel 2)**: Solo legajos asignados, registrados por su equipo, o cuya demanda gestionaron
- **Director Provincial/Interior (Nivel 3+)**: Legajos con Medida en "Solicitud de Aval"
- **Equipo de Legales**: Legajos que requieren "Informe Jurídico" o tienen oficios asociados + todos los de su jurisdicción
- **Admin (Nivel 4)**: Todos los legajos sin restricciones

### CA-2: Restricción Datos Judiciales
**DADO** un usuario sin rol Legales/JZ/Dirección
**CUANDO** visualiza un legajo
**ENTONCES** NO puede ver información judicial

### CA-3: Permisos de Acciones
**DADO** un usuario Nivel 2 (Equipo Técnico)
**CUANDO** interactúa con el listado
**ENTONCES** puede ver todas las columnas EXCEPTO "Asignar"

**Y** usuarios Nivel 3 (Director) tienen acceso a legajos de equipos bajo su jurisdicción

### CA-4: Generación Automática
**DADO** la creación de un nuevo legajo
**CUANDO** se guarda en el sistema
**ENTONCES** se genera automáticamente:
- ID de Legajo (único)
- N° de Legajo (secuencial)

### CA-5: Personalización de Columnas
**DADO** un usuario autenticado
**CUANDO** configura qué columnas desea ver
**ENTONCES** el sistema guarda esa preferencia y la aplica en futuras sesiones

### CA-6: Acciones Rápidas Disponibles
**DADO** un legajo en el listado
**CUANDO** el usuario tiene permisos correspondientes
**ENTONCES** puede ejecutar las siguientes acciones:

1. **Ver detalle del Legajo** (LEG-04)
2. **Asignar Legajo** (BE-06) - Solo niveles 3+
3. **Enviar notificación Interna**
4. **Editar Legajo**
5. **Ir a Demanda (PI)** - Deep-link a demanda asociada
6. **Registrar/Ver Oficio**
7. **Ir a MED-05** - Deep-link a "Ratificación Judicial"
8. **Ver PLTM** - Plan de Trabajo
9. **Exportar**
10. **Adjuntar acuse** - Disponible en chips de Oficios

### CA-7: Deep-linking
**DADO** una acción rápida que referencia otra entidad
**CUANDO** el usuario hace clic
**ENTONCES** se redirige directamente al contexto correcto (demanda/medida/oficio/etc)

### CA-8: Indicadores Visuales Funcionales
**DADO** un legajo con oficios/medidas/actividades
**CUANDO** se muestra en el listado
**ENTONCES** los chips e indicadores reflejan:
- Cantidad correcta en contadores
- Semáforo de vencimiento correcto en oficios
- Estado actual del andarivel de medidas
- Distribución correcta de actividades PT

### CA-9: Integración con Búsqueda (LEG-03)
**DADO** el listado de legajos implementado
**CUANDO** se implemente LEG-03
**ENTONCES** debe soportar:
- Barra de búsqueda general
- Filtros por valores de columnas
- Lógica similar a bandeja de demandas (BE-02)

## Modelo de Datos Relacionado

### Entidades Principales
```python
Legajo (infrastructure/models/)
├── id (PK, auto)
├── numero_legajo (secuencial, auto)
├── nino (FK → Nino)
├── prioridad
├── fecha_apertura
├── fecha_ultima_actualizacion
├── zona (FK → Zona)
├── jefe_zonal (FK → Usuario)
├── director (FK → Usuario)
├── equipo_trabajo (FK → Equipo)
├── equipo_centro_vida (FK → Equipo)
└── estado

# Relaciones
Legajo ← Demanda (PI asociada)
Legajo ← Medida[] (múltiples medidas con estados)
Legajo ← Actividad[] (Plan de Trabajo)
Legajo ← Oficio[] (múltiples oficios)
```

## API Endpoints a Implementar

### GET /api/legajos/
**Descripción**: Listado de legajos con filtrado por permisos de usuario

**Query Params**:
- `zona` (opcional, para JZ)
- `equipo` (opcional, para ET)
- `con_medida_aval` (bool, para Directores)
- `con_oficios` (bool, para Legales)
- `page`, `page_size` (paginación)

**Response**:
```json
{
  "count": 150,
  "next": "...",
  "previous": null,
  "results": [
    {
      "id": 1,
      "numero_legajo": "2025-001",
      "nino": {
        "nombre": "Juan",
        "apellido": "Pérez"
      },
      "prioridad": "ALTA",
      "fecha_apertura": "2025-01-15",
      "fecha_ultima_actualizacion": "2025-10-05",
      "zona": {...},
      "jefe_zonal": {...},
      "director": {...},
      "equipo_trabajo": {...},
      "equipo_centro_vida": {...},
      "medidas_activas": [
        {
          "etapa": "Intervención",
          "estado": "En progreso"
        }
      ],
      "actividades_activas": [...],
      "oficios": [
        {
          "tipo": "Ratificación",
          "vencimiento": "2025-10-10",
          "semaforo": "verde"
        }
      ],
      "indicadores": {
        "demanda_pi_count": 1,
        "oficios_por_tipo": {...},
        "medida_andarivel": "Intervención",
        "pt_actividades": {
          "pendientes": 2,
          "en_progreso": 1,
          "vencidas": 0,
          "realizadas": 5
        },
        "alertas": [...]
      },
      "acciones_disponibles": [
        "ver_detalle",
        "asignar",
        "editar",
        "ir_a_demanda",
        "ver_pltm"
      ]
    }
  ]
}
```

### GET /api/legajos/{id}/acciones/
**Descripción**: Obtener acciones disponibles para un legajo según permisos del usuario actual

**Response**:
```json
{
  "legajo_id": 1,
  "acciones": [
    {
      "codigo": "ver_detalle",
      "nombre": "Ver detalle del Legajo",
      "deep_link": "/legajos/1/detalle"
    },
    {
      "codigo": "asignar",
      "nombre": "Asignar Legajo",
      "deep_link": "/legajos/1/asignar",
      "disponible": true
    }
  ]
}
```

## Serializers

### LegajoListSerializer
- Campos básicos del legajo
- Nested serializers para: nino, zona, jefe_zonal, director, equipos
- Método `get_medidas_activas()` → filtra medidas con estado activo
- Método `get_actividades_activas()` → filtra actividades PT activas
- Método `get_oficios()` → oficios con cálculo de semáforo
- Método `get_indicadores()` → calcula todos los contadores y chips
- Método `get_acciones_disponibles()` → según `request.user`

### LegajoIndicadoresSerializer
- Lógica de cálculo de chips y contadores
- Semáforo de oficios según vencimiento
- Estado del andarivel de medidas

## Lógica de Permisos

### ViewSet Permissions
```python
class LegajoViewSet:
    def get_queryset(self):
        user = self.request.user

        if user.nivel == 4:  # Admin
            return Legajo.objects.all()

        elif user.rol == 'JZ':  # Jefe Zonal
            return Legajo.objects.filter(zona=user.zona)

        elif user.nivel == 2:  # Equipo Técnico
            return Legajo.objects.filter(
                Q(equipo_trabajo__miembros=user) |
                Q(demanda__registrado_por=user) |
                Q(demanda__equipo_gestor__miembros=user)
            )

        elif user.rol in ['Director_Provincial', 'Director_Interior']:
            return Legajo.objects.filter(
                medidas__estado='Solicitud_Aval',
                zona__jurisdiccion=user.jurisdiccion
            )

        elif user.rol == 'Legales':
            return Legajo.objects.filter(
                Q(medidas__estado='Informe_Juridico') |
                Q(oficios__isnull=False)
            ).filter(zona__jurisdiccion=user.jurisdiccion)

        return Legajo.objects.none()
```

### Field-level Permissions
```python
def to_representation(self, instance):
    data = super().to_representation(instance)
    user = self.context['request'].user

    # Ocultar datos judiciales
    if user.rol not in ['Legales', 'JZ', 'Director']:
        data.pop('informacion_judicial', None)

    # Ocultar columna "Asignar" para Nivel 2
    if user.nivel == 2:
        acciones = data.get('acciones_disponibles', [])
        data['acciones_disponibles'] = [
            a for a in acciones if a != 'asignar'
        ]

    return data
```

## Tests Requeridos

### Tests de Permisos
- `test_admin_ve_todos_legajos`
- `test_jefe_zonal_solo_ve_su_zona`
- `test_equipo_tecnico_solo_ve_asignados`
- `test_director_ve_medidas_aval`
- `test_legales_ve_oficios_e_informes`
- `test_datos_judiciales_ocultos_sin_permiso`
- `test_nivel_2_no_ve_accion_asignar`

### Tests de Lógica de Negocio
- `test_generacion_automatica_id_legajo`
- `test_generacion_automatica_numero_legajo_secuencial`
- `test_indicadores_chips_correctos`
- `test_semaforo_oficios_segun_vencimiento`
- `test_andarivel_medidas_refleja_estado_actual`
- `test_contadores_pt_actividades_correctos`

### Tests de Acciones
- `test_acciones_disponibles_segun_permisos`
- `test_deep_link_ir_a_demanda`
- `test_deep_link_ir_a_med05`
- `test_exportar_legajos`

### Tests de Configuración
- `test_guardar_preferencias_columnas_usuario`
- `test_aplicar_preferencias_guardadas`

## Notas de Implementación

### Generación de Número de Legajo
```python
# Usar atomic transaction con select_for_update
from django.db import transaction

@transaction.atomic
def generar_numero_legajo():
    anio_actual = timezone.now().year
    ultimo = Legajo.objects.select_for_update().filter(
        numero_legajo__startswith=f"{anio_actual}-"
    ).order_by('-numero_legajo').first()

    if ultimo:
        ultimo_num = int(ultimo.numero_legajo.split('-')[1])
        nuevo_num = ultimo_num + 1
    else:
        nuevo_num = 1

    return f"{anio_actual}-{nuevo_num:03d}"
```

### Cálculo de Semáforo Oficios
```python
def calcular_semaforo_oficio(fecha_vencimiento):
    hoy = timezone.now().date()
    dias_restantes = (fecha_vencimiento - hoy).days

    if dias_restantes < 0:
        return 'rojo'  # Vencido
    elif dias_restantes <= 3:
        return 'amarillo'  # Por vencer
    else:
        return 'verde'  # A tiempo
```

### Optimización de Queries
- Usar `select_related()` para: nino, zona, jefe_zonal, director, equipos
- Usar `prefetch_related()` para: medidas, actividades, oficios
- Implementar paginación (page_size default: 25)
- Considerar cache de indicadores si el cálculo es costoso

## Pendientes de Definición
- **Colores por Etapa**: La lógica de colores según etapa del legajo está marcada como `***COMPLETAR***` en documentación original
- **Ubicación de Bandeja**: Definir si va como pestaña en mesa de entrada o sección separada

## Referencias
- **Documentación**: `Documentacion RUNNA.md` sección BE-05
- **Story Relacionada**: BE-06 (Asignar Legajo)
- **Búsqueda**: LEG-03 (debe implementar filtros sobre este listado)
- **Detalle**: LEG-04 (destino del deep-link "Ver detalle")
- **Patrón de Referencia**: BE-02 (Listado de Demandas) - lógica similar
