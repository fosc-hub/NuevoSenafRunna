# Story LEG-03: Buscar y Filtrar Legajos en la Bandeja

## Descripción
**Como** Usuario encargado de la búsqueda de un Legajo
**Quiero** acceder a una barra de búsqueda general y filtrar sobre las columnas del listado de Legajos
**Para** informarme rápidamente sobre medidas activas, historial de medidas, intervenciones y datos personales de los NNyA

## Tipo
Backend API + Frontend (Búsqueda y Filtros sobre Listado BE-05)

## Prioridad
Alta (Complementa BE-05, facilita gestión eficiente de legajos)

## Dependencias Técnicas
- **Prerequisitos**:
  - BE-05 implementado (Listado de Legajos)
  - Modelo Legajo con todas sus relaciones
  - Sistema de permisos por roles/niveles
- **Referencia**: BE-02 (Filtros y Búsqueda de Demandas) - usar lógica similar
- **Habilita**: Gestión eficiente de legajos por todos los usuarios del sistema

---

## Funcionalidad Principal

### Componente 1: Barra de Búsqueda General

Búsqueda **flexible y multi-campo** similar a CONS-05 (Conexiones de Demanda):

#### Campos Searchables:
1. **ID de Legajo** (Number, exacto o parcial)
2. **Número de Legajo** (String, formato "YYYY-NNN")
3. **DNI del NNyA** (Number, exacto)
4. **Nombre del NNyA** (String, búsqueda flexible)
5. **Apellido del NNyA** (String, búsqueda flexible)
6. **Nombre completo** (String, "Nombre Apellido" o "Apellido Nombre")
7. **Zona/UDER** (String, nombre de zona)
8. **Número de Demanda PI vinculada** (String)
9. **Número de Medida** (String)
10. **Número de Oficio** (String)

#### Características de Búsqueda:
- **Búsqueda unificada**: Un solo campo de input busca en TODOS los campos mencionados
- **Insensible a mayúsculas/minúsculas**: "juan pérez" = "JUAN PÉREZ" = "Juan Pérez"
- **Búsqueda parcial**: "pere" encuentra "Pérez"
- **Búsqueda con espacios**: "juan lopez" busca en nombre + apellido
- **Priorización de resultados**:
  1. Coincidencias exactas en ID/DNI/Número de Legajo
  2. Coincidencias exactas en Nombre completo
  3. Coincidencias parciales en Nombre/Apellido
  4. Coincidencias en entidades relacionadas (Demanda, Medida, Oficio)

#### Ejemplo de Queries:
```
"123" → Encuentra:
  - Legajo ID=123
  - Legajo Número="2025-123"
  - NNyA con DNI=12345678 (parcial)
  - Demanda PI-123

"juan" → Encuentra:
  - NNyA con nombre "Juan"
  - NNyA con apellido "Juanes"

"2025-045" → Encuentra:
  - Legajo Número exacto "2025-045"

"zona norte" → Encuentra:
  - Legajos asignados a Zona "Norte"
```

---

### Componente 2: Filtros por Columna

Filtros **específicos sobre cada columna** del listado (BE-05):

#### Filtros Numéricos (ID, Prioridad, Contadores)
- **Contiene**: valor exacto
- **Mayor que**: > valor
- **Menor que**: < valor
- **Entre**: rango [min, max]
- **Ordenar**: ASC o DESC

**Ejemplo**:
```
Filtro en "ID de Legajo":
  - Mayor que: 1000
  - Ordenar: DESC
→ Legajos con ID > 1000, ordenados de mayor a menor
```

#### Filtros de Texto (Nombre, Zona, Equipos)
- **Contiene**: substring (case-insensitive)
- **Es exactamente**: match exacto
- **Comienza con**: prefix
- **Termina con**: suffix
- **Ordenar**: ASC o DESC (alfabético)

**Ejemplo**:
```
Filtro en "Zona/Equipo":
  - Contiene: "Norte"
→ Zonas: "Norte Capital", "Norte Interior", "Noroeste"
```

#### Filtros de Fecha (Apertura, Última Actualización)
- **En la fecha**: día específico
- **Antes de**: < fecha
- **Después de**: > fecha
- **Entre**: rango [fecha_inicio, fecha_fin]
- **Últimos N días**: fecha >= (hoy - N días)
- **Ordenar**: ASC o DESC

**Ejemplo**:
```
Filtro en "Fecha de Apertura":
  - Últimos 30 días
→ Legajos abiertos en el último mes
```

#### Filtros de Selección Múltiple (Prioridad, Estados)
- **Uno o más valores**: checkboxes
- **Todos excepto**: exclusión de valores

**Ejemplo**:
```
Filtro en "Prioridad":
  - ☑ ALTA
  - ☑ URGENTE
  - ☐ MEDIA
→ Solo legajos ALTA o URGENTE
```

---

### Componente 3: Filtros Generales (Avanzados)

Filtros **no relacionados directamente con columnas visibles**:

#### 1. Estado de la Demanda (si tiene PI vinculada)
```
Opciones:
- SIN_ASIGNAR
- CONSTATACION
- EVALUACION
- PENDIENTE_AUTORIZACION
- ARCHIVADA
- ADMITIDA
- INFORME_SIN_ENVIAR
- INFORME_ENVIADO
```

#### 2. Tipo de Medida Activa
```
Opciones:
- MPI (Medida de Protección Integral)
- MPE (Medida de Protección Excepcional)
- MPJ (Medida de Protección Judicial)
- Sin medidas activas
```

#### 3. Etapa de Medida (Estado del Andarivel)
```
Opciones:
- (1) Pendiente de registro de intervención
- (2) Pendiente de aprobación de registro
- (3) Pendiente de Nota de Aval
- (4) Pendiente de Informe Jurídico
- (5) Pendiente de ratificación judicial
- Ratificada
- No ratificada
```

#### 4. Tipo de Oficios
```
Opciones:
- Tiene Oficio de Ratificación
- Tiene Pedido de Informe
- Tiene Orden de Medida
- Tiene Otros oficios
- Sin oficios
```

#### 5. Semáforo de Oficios (Vencimiento)
```
Opciones:
- 🔴 Vencidos (rojo)
- 🟡 Por vencer (≤ 3 días, amarillo)
- 🟢 A tiempo (verde)
```

#### 6. Estado de Actividades PT
```
Filtros:
- Tiene actividades Pendientes > 0
- Tiene actividades En Progreso > 0
- Tiene actividades Vencidas > 0
- Actividades Realizadas >= N
```

#### 7. Vencimientos Próximos
```
Opciones:
- Con vencimientos en los próximos 3 días
- Con vencimientos en los próximos 7 días
- Con vencimientos en los próximos 15 días
- Con vencimientos vencidos
```

#### 8. Chips y Puentes
```
Filtros:
- Tiene Demanda PI vinculada
- Tiene Medidas Activas
- Tiene Oficios
- Tiene Plan de Trabajo activo
- Tiene alertas activas
```

#### 9. Responsables
```
Filtros:
- Jefe Zonal específico
- Director específico
- Equipo de Trabajo específico
- Equipo de Centro de Vida específico
- Usuario responsable específico
```

#### 10. Localidad y Zona
```
Filtros:
- Localidad específica (dropdown)
- Zona/UDER específica (dropdown)
- Región (si aplica)
```

---

### Componente 4: Combinación de Filtros

#### Lógica de Combinación:
- **Barra de búsqueda + Filtros**: Se aplican ambos (intersección)
- **Filtros de columna + Filtros generales**: Se aplican todos (AND lógico)
- **Múltiples valores en mismo filtro**: OR lógico dentro del filtro
- **Diferentes filtros**: AND lógico entre filtros

#### Ejemplo de Combinación:
```
Barra de búsqueda: "juan"
+
Filtro columna "Prioridad": ALTA o URGENTE
+
Filtro general "Tipo Medida": MPE
+
Filtro general "Vencimientos": Próximos 7 días

Resultado:
Legajos donde:
  - NNyA se llama "Juan" (nombre o apellido)
  - Y tiene prioridad ALTA o URGENTE
  - Y tiene Medida MPE activa
  - Y tiene vencimientos en los próximos 7 días
```

---

## Criterios de Aceptación

### CA-1: Barra de Búsqueda Funcional
**DADO** un usuario autenticado en la bandeja de legajos
**CUANDO** ingresa un término en la barra de búsqueda
**ENTONCES**:
- Busca en TODOS los campos definidos (ID, Número, DNI, Nombre, Apellido, etc.)
- Muestra resultados ordenados por relevancia (exactos primero)
- La búsqueda es case-insensitive y acepta búsqueda parcial
- Los resultados respetan los permisos del usuario (según BE-05 CA-1)

### CA-2: Filtros por Columna Disponibles
**DADO** un usuario viendo el listado de legajos
**CUANDO** hace clic en una columna para filtrar
**ENTONCES**:
- Se despliegan opciones de filtro según tipo de dato:
  - Numéricos: Contiene, Mayor que, Menor que, Entre, Ordenar
  - Texto: Contiene, Exacto, Comienza con, Termina con, Ordenar
  - Fecha: En fecha, Antes, Después, Entre, Últimos N días, Ordenar
  - Selección: Checkboxes para valores múltiples
- Los filtros se aplican inmediatamente (o con botón "Aplicar")

### CA-3: Filtros Generales Accesibles
**DADO** un usuario en la bandeja de legajos
**CUANDO** hace clic en botón "Filtros Avanzados" o similar
**ENTONCES**:
- Se abre un panel/modal con todos los filtros generales
- Puede seleccionar múltiples filtros simultáneamente
- Los filtros incluyen: Estado Demanda, Tipo Medida, Etapa Medida, Oficios, PT, Vencimientos, Chips, Responsables, Localidad
- Al aplicar, el listado se actualiza mostrando solo legajos que cumplen todos los criterios

### CA-4: Combinación de Búsqueda y Filtros
**DADO** un usuario que ha aplicado búsqueda y/o filtros
**CUANDO** combina múltiples criterios
**ENTONCES**:
- La búsqueda general Y filtros de columna Y filtros generales se aplican conjuntamente (AND)
- Dentro de cada filtro, múltiples valores son OR (ej: Prioridad ALTA o URGENTE)
- Los resultados respetan todos los criterios simultáneamente

### CA-5: Indicadores Visuales de Filtros Activos
**DADO** un usuario con filtros aplicados
**CUANDO** visualiza el listado
**ENTONCES**:
- Se muestra una barra de "Filtros activos" con chips/tags
- Cada chip indica qué filtro está aplicado (ej: "Prioridad: ALTA", "Zona: Norte")
- Puede remover filtros individualmente haciendo clic en la X del chip
- Puede limpiar todos los filtros con botón "Limpiar todo"
- El contador de resultados muestra "N legajos encontrados (de M totales)"

### CA-6: Persistencia de Filtros
**DADO** un usuario que ha aplicado filtros
**CUANDO** navega a otra sección y regresa al listado
**ENTONCES**:
- Los filtros aplicados se mantienen activos (persistencia en sesión)
- Opcionalmente, puede guardar combinaciones de filtros como "Vistas guardadas" (ej: "Legajos urgentes con MPE")

### CA-7: Respeto de Permisos en Búsqueda
**DADO** un usuario con permisos limitados (Nivel 2, Jefe Zonal, etc.)
**CUANDO** realiza búsquedas o aplica filtros
**ENTONCES**:
- Solo busca/filtra dentro de los legajos que tiene permiso de ver (según BE-05 CA-1)
- No puede buscar legajos fuera de su zona/equipo/jurisdicción
- Los resultados siempre respetan las restricciones de visibilidad

### CA-8: Performance en Búsqueda
**DADO** una búsqueda o filtro complejo
**CUANDO** se ejecuta la consulta
**ENTONCES**:
- El tiempo de respuesta es ≤ 2 segundos para hasta 10,000 legajos
- Si la búsqueda tarda más, se muestra un indicador de carga
- Los resultados están paginados (25-50 por página por defecto)

### CA-9: Exportación de Resultados Filtrados
**DADO** un usuario con resultados filtrados
**CUANDO** hace clic en "Exportar"
**ENTONCES**:
- Exporta solo los legajos visibles según los filtros aplicados
- Incluye todas las columnas visibles del usuario
- Formato Excel con filtros y búsqueda aplicados como referencia en una hoja adicional

### CA-10: Accesibilidad de Usuarios por Nivel
**DADO** cualquier nivel de usuario autenticado
**CUANDO** accede al listado de legajos
**ENTONCES**:
- Todos pueden usar la barra de búsqueda y todos los filtros
- Los resultados dependen de los criterios de visibilidad de BE-01 (equivalente para legajos)
- Usuarios Nivel 2 (Equipo Técnico): Solo legajos asignados/registrados por ellos
- Usuarios Nivel 3 (JZ/Director): Legajos de su zona/jurisdicción
- Usuarios Nivel 4 (Admin): Todos los legajos

---

## API Endpoints

### GET /api/legajos/
**Descripción**: Listado de legajos con búsqueda y filtros (extiende BE-05)

**Query Parameters Nuevos**:

#### Búsqueda General:
- `search` (string): Término de búsqueda multi-campo

#### Filtros por Columna:
- `id` (number): ID exacto
- `id__gt`, `id__lt`, `id__gte`, `id__lte` (number): Comparaciones
- `numero_legajo` (string): Número de legajo
- `numero_legajo__icontains` (string): Búsqueda parcial
- `prioridad` (string[]): Array de prioridades (ej: `prioridad=ALTA&prioridad=URGENTE`)
- `fecha_apertura__gte`, `fecha_apertura__lte` (date): Rango de fechas
- `fecha_ultima_actualizacion__gte`, `fecha_ultima_actualizacion__lte` (date): Rango
- `zona` (number): ID de zona
- `zona__nombre__icontains` (string): Nombre de zona (parcial)
- `jefe_zonal` (number): ID de jefe zonal
- `director` (number): ID de director
- `equipo_trabajo` (number): ID de equipo
- `equipo_centro_vida` (number): ID de equipo
- `localidad` (number): ID de localidad

#### Filtros Generales:
- `demanda_estado` (string[]): Estados de demanda PI vinculada
- `tipo_medida` (string[]): MPI, MPE, MPJ
- `etapa_medida` (string[]): Estados del andarivel de medida
- `tiene_oficios` (boolean): true/false
- `tipo_oficios` (string[]): Ratificacion, Pedido, Orden, Otros
- `semaforo_oficios` (string[]): rojo, amarillo, verde
- `actividades_pendientes__gt` (number): Actividades pendientes > N
- `actividades_en_progreso__gt` (number): Actividades en progreso > N
- `actividades_vencidas__gt` (number): Actividades vencidas > N
- `vencimientos_proximos_dias` (number): Vencimientos en próximos N días
- `tiene_demanda_pi` (boolean): true/false
- `tiene_medidas_activas` (boolean): true/false
- `tiene_plan_trabajo` (boolean): true/false
- `tiene_alertas` (boolean): true/false

#### Ordenamiento:
- `ordering` (string): Campo por el cual ordenar (ej: `ordering=-fecha_apertura`)
  - Soporta múltiples campos: `ordering=-prioridad,fecha_apertura`

#### Paginación:
- `page` (number): Número de página
- `page_size` (number): Cantidad de resultados por página (default: 25, max: 100)

**Ejemplo Request**:
```
GET /api/legajos/?search=juan&prioridad=ALTA&prioridad=URGENTE&tipo_medida=MPE&vencimientos_proximos_dias=7&ordering=-fecha_ultima_actualizacion&page=1&page_size=25
```

**Response** (extiende BE-05):
```json
{
  "count": 45,
  "next": "/api/legajos/?page=2&...",
  "previous": null,
  "filters_applied": {
    "search": "juan",
    "prioridad": ["ALTA", "URGENTE"],
    "tipo_medida": ["MPE"],
    "vencimientos_proximos_dias": 7,
    "ordering": "-fecha_ultima_actualizacion"
  },
  "results": [
    {
      "id": 123,
      "numero_legajo": "2025-045",
      "nino": {
        "nombre": "Juan",
        "apellido": "López",
        "dni": "45678901"
      },
      "prioridad": "ALTA",
      "fecha_apertura": "2025-01-15",
      "fecha_ultima_actualizacion": "2025-10-06",
      "zona": {...},
      "medidas_activas": [
        {
          "tipo": "MPE",
          "etapa": "Pendiente de Informe Jurídico",
          "estado": "En progreso"
        }
      ],
      "oficios": [
        {
          "tipo": "Ratificación",
          "vencimiento": "2025-10-10",
          "semaforo": "amarillo"
        }
      ],
      "indicadores": {
        "pt_actividades": {
          "pendientes": 2,
          "en_progreso": 1,
          "vencidas": 0,
          "realizadas": 5
        },
        "alertas": [
          "Oficio Ratificación vence en 4 días"
        ]
      },
      "_search_score": 0.95
    }
  ]
}
```

### GET /api/legajos/filtros-disponibles/
**Descripción**: Obtener valores únicos para filtros dinámicos

**Response**:
```json
{
  "prioridades": ["BAJA", "MEDIA", "ALTA", "URGENTE"],
  "zonas": [
    {"id": 1, "nombre": "Norte Capital"},
    {"id": 2, "nombre": "Sur Interior"}
  ],
  "jefes_zonales": [
    {"id": 10, "nombre": "María González", "zona": "Norte Capital"}
  ],
  "directores": [...],
  "localidades": [...],
  "estados_demanda": ["CONSTATACION", "EVALUACION", "ADMITIDA", ...],
  "tipos_medida": ["MPI", "MPE", "MPJ"],
  "etapas_medida": [
    "(1) Pendiente de registro de intervención",
    "(2) Pendiente de aprobación de registro",
    ...
  ],
  "tipos_oficios": ["Ratificacion", "Pedido", "Orden", "Otros"]
}
```

---

## Serializers

### LegajoSearchSerializer (nuevo)
Extiende `LegajoListSerializer` de BE-05 añadiendo:
- `_search_score` (float): Relevancia del resultado (0.0 - 1.0)
- `_matched_fields` (list): Campos donde se encontró el término de búsqueda

### FiltrosDisponiblesSerializer (nuevo)
- Extrae valores únicos para cada campo filtrable
- Respeta permisos del usuario (solo valores visibles según su rol)

---

## Lógica de Búsqueda

### Implementación de Búsqueda Multi-campo

```python
from django.db.models import Q, Value, CharField, F
from django.db.models.functions import Concat
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank

class LegajoViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        queryset = super().get_queryset()  # Respeta permisos de BE-05

        search_term = self.request.query_params.get('search', None)

        if search_term:
            # Búsqueda con PostgreSQL Full-Text Search (recomendado)
            search_vector = (
                SearchVector('id', weight='A') +
                SearchVector('numero_legajo', weight='A') +
                SearchVector('nino__dni', weight='A') +
                SearchVector('nino__nombre', weight='B') +
                SearchVector('nino__apellido', weight='B') +
                SearchVector('zona__nombre', weight='C') +
                SearchVector('demanda__numero', weight='C') +
                SearchVector('medidas__numero', weight='C') +
                SearchVector('oficios__numero', weight='C')
            )
            search_query = SearchQuery(search_term, config='spanish')

            queryset = queryset.annotate(
                search=search_vector,
                rank=SearchRank(search_vector, search_query)
            ).filter(search=search_query).order_by('-rank')

        # Alternativamente, búsqueda con Q objects (si no hay PostgreSQL)
        if search_term:
            queryset = queryset.annotate(
                nombre_completo=Concat(
                    'nino__nombre', Value(' '), 'nino__apellido',
                    output_field=CharField()
                )
            ).filter(
                Q(id__icontains=search_term) |
                Q(numero_legajo__icontains=search_term) |
                Q(nino__dni__icontains=search_term) |
                Q(nino__nombre__icontains=search_term) |
                Q(nino__apellido__icontains=search_term) |
                Q(nombre_completo__icontains=search_term) |
                Q(zona__nombre__icontains=search_term) |
                Q(demanda__numero__icontains=search_term) |
                Q(medidas__numero__icontains=search_term) |
                Q(oficios__numero__icontains=search_term)
            ).distinct()

        return queryset
```

### Aplicación de Filtros

```python
def get_queryset(self):
    queryset = super().get_queryset()

    # Filtros por columna
    if self.request.query_params.get('prioridad'):
        prioridades = self.request.query_params.getlist('prioridad')
        queryset = queryset.filter(prioridad__in=prioridades)

    if self.request.query_params.get('fecha_apertura__gte'):
        fecha_inicio = self.request.query_params.get('fecha_apertura__gte')
        queryset = queryset.filter(fecha_apertura__gte=fecha_inicio)

    # Filtros generales
    if self.request.query_params.get('tipo_medida'):
        tipos = self.request.query_params.getlist('tipo_medida')
        queryset = queryset.filter(
            medidas__tipo__in=tipos,
            medidas__activa=True
        ).distinct()

    if self.request.query_params.get('vencimientos_proximos_dias'):
        dias = int(self.request.query_params.get('vencimientos_proximos_dias'))
        fecha_limite = timezone.now().date() + timedelta(days=dias)
        queryset = queryset.filter(
            Q(oficios__fecha_vencimiento__lte=fecha_limite, oficios__fecha_vencimiento__gte=timezone.now().date()) |
            Q(actividades__fecha_plazo__lte=fecha_limite, actividades__fecha_plazo__gte=timezone.now().date())
        ).distinct()

    # Ordenamiento
    ordering = self.request.query_params.get('ordering', '-fecha_ultima_actualizacion')
    queryset = queryset.order_by(ordering)

    return queryset
```

---

## Tests Requeridos

### Tests de Búsqueda General
1. `test_busqueda_por_id_legajo_exacto`
2. `test_busqueda_por_numero_legajo`
3. `test_busqueda_por_dni_nnya`
4. `test_busqueda_por_nombre_nnya`
5. `test_busqueda_por_apellido_nnya`
6. `test_busqueda_por_nombre_completo_nnya`
7. `test_busqueda_por_zona`
8. `test_busqueda_por_numero_demanda`
9. `test_busqueda_por_numero_medida`
10. `test_busqueda_por_numero_oficio`
11. `test_busqueda_case_insensitive`
12. `test_busqueda_parcial_funciona`
13. `test_busqueda_con_espacios`
14. `test_busqueda_sin_resultados`
15. `test_busqueda_respeta_permisos_usuario`

### Tests de Filtros por Columna
16. `test_filtro_columna_numerico_mayor_que`
17. `test_filtro_columna_numerico_menor_que`
18. `test_filtro_columna_numerico_entre`
19. `test_filtro_columna_texto_contiene`
20. `test_filtro_columna_texto_exacto`
21. `test_filtro_columna_fecha_rango`
22. `test_filtro_columna_fecha_ultimos_n_dias`
23. `test_filtro_columna_seleccion_multiple`
24. `test_ordenamiento_por_columna_asc`
25. `test_ordenamiento_por_columna_desc`

### Tests de Filtros Generales
26. `test_filtro_estado_demanda`
27. `test_filtro_tipo_medida`
28. `test_filtro_etapa_medida`
29. `test_filtro_tiene_oficios`
30. `test_filtro_tipo_oficios`
31. `test_filtro_semaforo_oficios`
32. `test_filtro_actividades_pendientes`
33. `test_filtro_actividades_vencidas`
34. `test_filtro_vencimientos_proximos_dias`
35. `test_filtro_tiene_demanda_pi`
36. `test_filtro_tiene_medidas_activas`
37. `test_filtro_responsables`

### Tests de Combinación
38. `test_combinacion_busqueda_y_filtro_columna`
39. `test_combinacion_busqueda_y_filtro_general`
40. `test_combinacion_multiples_filtros_and_logico`
41. `test_combinacion_valores_multiples_or_logico`
42. `test_combinacion_compleja_todos_filtros`

### Tests de Permisos
43. `test_equipo_tecnico_busca_solo_asignados`
44. `test_jefe_zonal_busca_solo_su_zona`
45. `test_director_busca_medidas_aval_jurisdiccion`
46. `test_legales_busca_oficios_jurisdiccion`
47. `test_admin_busca_todos_legajos`

### Tests de Performance
48. `test_busqueda_rapida_con_10000_legajos`
49. `test_filtros_complejos_performance`
50. `test_paginacion_resultados_filtrados`

### Tests de UI/UX
51. `test_filtros_activos_se_muestran_en_chips`
52. `test_remover_filtro_individual`
53. `test_limpiar_todos_filtros`
54. `test_contador_resultados_correcto`
55. `test_persistencia_filtros_en_sesion`
56. `test_exportar_resultados_filtrados`

---

## Casos de Uso con Ejemplos

### Caso de Uso 1: Búsqueda Rápida por Nombre
**Actor**: Equipo Técnico
**Escenario**: Necesita encontrar el legajo de "Juan Pérez"

**Request**:
```
GET /api/legajos/?search=juan perez
```

**Response**: Legajos donde NNyA se llama Juan Pérez, ordenados por relevancia

---

### Caso de Uso 2: Filtrar Legajos Urgentes con MPE
**Actor**: Jefe Zonal
**Escenario**: Ver legajos urgentes con Medidas MPE en su zona

**Request**:
```
GET /api/legajos/?prioridad=ALTA&prioridad=URGENTE&tipo_medida=MPE&zona=5
```

**Response**: Legajos de Zona 5 con prioridad ALTA o URGENTE que tienen MPE activa

---

### Caso de Uso 3: Identificar Oficios por Vencer
**Actor**: Legales
**Escenario**: Encontrar legajos con oficios que vencen en 3 días

**Request**:
```
GET /api/legajos/?tiene_oficios=true&semaforo_oficios=amarillo&vencimientos_proximos_dias=3&ordering=oficios__fecha_vencimiento
```

**Response**: Legajos con oficios en semáforo amarillo (≤3 días), ordenados por fecha de vencimiento

---

### Caso de Uso 4: Auditar Legajos con Actividades Vencidas
**Actor**: Director
**Escenario**: Ver legajos de su jurisdicción con actividades PT vencidas

**Request**:
```
GET /api/legajos/?actividades_vencidas__gt=0&zona__jurisdiccion=2&ordering=-actividades_vencidas
```

**Response**: Legajos de jurisdicción 2 con actividades vencidas, ordenados por cantidad de vencidas

---

### Caso de Uso 5: Búsqueda Compleja Combinada
**Actor**: Admin
**Escenario**: Legajos abiertos en últimos 30 días, con MPE en etapa de Aval, de Zona Norte, ordenados por última actualización

**Request**:
```
GET /api/legajos/?fecha_apertura__gte=2025-09-06&tipo_medida=MPE&etapa_medida=Pendiente de Nota de Aval&zona__nombre__icontains=norte&ordering=-fecha_ultima_actualizacion
```

**Response**: Legajos que cumplen todos los criterios combinados

---

## Notas de Implementación

### Optimización de Queries
```python
# Usar select_related y prefetch_related para evitar N+1 queries
queryset = Legajo.objects.select_related(
    'nino', 'zona', 'jefe_zonal', 'director',
    'equipo_trabajo', 'equipo_centro_vida', 'localidad'
).prefetch_related(
    'medidas', 'actividades', 'oficios', 'demanda'
)
```

### Índices de Base de Datos
```sql
-- Índices para búsqueda rápida
CREATE INDEX idx_legajo_numero ON legajo(numero_legajo);
CREATE INDEX idx_nino_dni ON nino(dni);
CREATE INDEX idx_nino_nombre ON nino(nombre);
CREATE INDEX idx_nino_apellido ON nino(apellido);

-- Índice de texto completo (PostgreSQL)
CREATE INDEX idx_legajo_search ON legajo USING GIN (to_tsvector('spanish', numero_legajo));
```

### Cache de Filtros Disponibles
```python
from django.core.cache import cache

@action(detail=False, methods=['get'])
def filtros_disponibles(self, request):
    cache_key = f'filtros_disponibles_{request.user.id}'
    filtros = cache.get(cache_key)

    if not filtros:
        filtros = {
            'prioridades': Legajo.objects.values_list('prioridad', flat=True).distinct(),
            'zonas': Zona.objects.filter(visible_para=request.user).values('id', 'nombre'),
            # ... otros filtros
        }
        cache.set(cache_key, filtros, timeout=3600)  # 1 hora

    return Response(filtros)
```

### Manejo de Búsqueda Vacía
```python
if search_term and not queryset.exists():
    # Sugerir búsquedas relacionadas o legajos similares
    sugerencias = Legajo.objects.filter(
        Q(nino__nombre__icontains=search_term[:3]) |
        Q(nino__apellido__icontains=search_term[:3])
    )[:5]

    return Response({
        'count': 0,
        'results': [],
        'sugerencias': LegajoListSerializer(sugerencias, many=True).data
    })
```

---

## Pendientes de Definición
- **Guardado de Vistas**: ¿Permitir guardar combinaciones de filtros como "vistas favoritas" del usuario?
- **Búsqueda por Similitud**: ¿Implementar búsqueda fonética para nombres con errores ortográficos?
- **Filtros Personalizados**: ¿Permitir crear filtros custom por usuario/rol?

---

## Referencias
- **Documentación**: `Documentacion RUNNA.md` secciones LEG-03, BE-02, BE-05
- **Story Base**: BE-05 (Listado de Legajos)
- **Patrón de Referencia**: BE-02 (Filtros y Búsqueda de Demandas)
- **Búsqueda Similar**: CONS-05 (Conexiones de Demanda con búsqueda flexible)
