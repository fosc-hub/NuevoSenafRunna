# Creación de Etapas Adicionales: INNOVACION y PRORROGA

**Fecha:** 2025-01-12
**Estado:** Documentación requerida
**Prioridad:** Media
**Estimación:** 3 puntos

---

## Problema Identificado

Usuario quiere crear una nueva etapa de tipo **INNOVACION** o **PRORROGA** cuando está trabajando en la etapa **APERTURA** de una medida, pero **no existe un endpoint** para hacer esto.

### Estado Actual

- ✅ Creación automática de etapa **APERTURA** en MED-01
- ✅ Modelo `TEtapaMedida` tiene campo `tipo_etapa` con choices: APERTURA, INNOVACION, PRORROGA, CESE, POST_CESE, PROCESO
- ❌ **NO hay endpoint** para crear manualmente etapas INNOVACION o PRORROGA
- ❌ **NO hay lógica de negocio** para decidir cuándo se puede crear una nueva etapa

---

## Solución Propuesta: Endpoint `crear_etapa`

### Opción 1: Action en TMedidaViewSet (Recomendada)

```python
# api/views/TMedidaView.py

@extend_schema(
    request=TEtapaMedidaCreateSerializer,
    responses=TEtapaMedidaSerializer,
    description="Crea una nueva etapa (INNOVACION, PRORROGA) para una medida existente"
)
@action(detail=True, methods=['post'], url_path='crear-etapa')
def crear_etapa(self, request, pk=None):
    """
    POST /api/medidas/{medida_id}/crear-etapa/
    
    Crea una nueva etapa (INNOVACION, PRORROGA) para una medida.
    
    Precondiciones:
    - Medida debe tener etapa APERTURA completada (estado finalizado)
    - Usuario debe ser responsable (Equipo Técnico, Jefe Zonal, Director)
    
    Request Body:
    {
        "tipo_etapa": "INNOVACION",  // o "PRORROGA"
        "observaciones": "Motivo de la innovación...",
        "etapa_actual_id": 123  // ID de la etapa actual a cerrar
    }
    """
    medida = self.get_object()
    
    # Validaciones
    tipo_etapa = request.data.get('tipo_etapa')
    if tipo_etapa not in ['INNOVACION', 'PRORROGA', 'CESE']:
        return Response(
            {"detail": f"tipo_etapa debe ser INNOVACION, PRORROGA o CESE"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Verificar que existe etapa actual
    etapa_actual = medida.etapa_actual
    if not etapa_actual:
        return Response(
            {"detail": "La medida no tiene etapa actual activa"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Verificar que etapa actual está completada (estado 5 final)
    if etapa_actual.estado_especifico and etapa_actual.estado_especifico.orden < 5:
        return Response(
            {"detail": "La etapa actual no está completada (faltan estados por avanzar)"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Verificar permisos
    if not self._puede_crear_etapa(request.user, medida):
        return Response(
            {"detail": "No tiene permisos para crear nuevas etapas en esta medida"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Cerrar etapa actual
    etapa_actual.fecha_fin_estado = timezone.now()
    etapa_actual.save()
    
    # Crear nueva etapa según tipo
    nueva_etapa = TEtapaMedida.objects.create(
        medida=medida,
        tipo_etapa=tipo_etapa,
        nombre=f"{tipo_etapa.title()} de la Medida",
        observaciones=request.data.get('observaciones', ''),
        estado_especifico=get_estado_inicial_etapa(medida.tipo_medida, tipo_etapa),
        creado_por=request.user
    )
    
    # Actualizar etapa_actual de la medida
    medida.etapa_actual = nueva_etapa
    medida.save()
    
    # Serializar y retornar
    serializer = TEtapaMedidaSerializer(nueva_etapa)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

def _puede_crear_etapa(self, user, medida):
    """Verifica si usuario puede crear nuevas etapas"""
    
    # Admin siempre puede
    if user.is_superuser:
        return True
    
    # Director puede
    if user.nivel == 3:
        user_zona = TCustomUserZona.objects.filter(
            user=user,
            director=True
        ).first()
        if user_zona:
            return True
    
    # Jefe Zonal de la zona del legajo
    user_zonas = TCustomUserZona.objects.filter(
        user=user,
        jefe=True
    ).values_list('zona_id', flat=True)
    
    if user_zonas:
        es_jefe_zona = TLegajoZona.objects.filter(
            legajo=medida.legajo,
            zona_id__in=user_zonas,
            esta_activo=True
        ).exists()
        if es_jefe_zona:
            return True
    
    # Responsable del legajo
    es_responsable = TLegajoZona.objects.filter(
        legajo=medida.legajo,
        user_responsable=user,
        esta_activo=True
    ).exists()
    
    return es_responsable
```

---

## Serializer Requerido

```python
# api/serializers/TEtapaMedidaSerializer.py

class TEtapaMedidaCreateSerializer(serializers.Serializer):
    """Serializer para crear una nueva etapa"""
    
    tipo_etapa = serializers.ChoiceField(
        choices=['INNOVACION', 'PRORROGA', 'CESE'],
        help_text="Tipo de etapa a crear"
    )
    
    observaciones = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Motivo o razón de la nueva etapa"
    )
    
    etapa_actual_id = serializers.IntegerField(
        required=False,
        help_text="ID de la etapa actual a cerrar (auto-detectado si no se especifica)"
    )
```

---

## Validaciones de Negocio

### Función Helper: `get_estado_inicial_etapa`

```python
# infrastructure/business_logic/med01_validaciones.py

def get_estado_inicial_etapa(tipo_medida, tipo_etapa):
    """
    Retorna el estado inicial según tipo de medida y etapa.
    
    Lógica:
    - MPI: Solo estados 1-2 para APERTURA, INNOVACION, PRORROGA
    - MPE: Estados 1-5 para APERTURA, INNOVACION, PRORROGA, CESE
    - MPJ: NO USA ESTADOS (estado_especifico = None)
    """
    from infrastructure.models.medida import TEstadoEtapaMedida
    
    # MPJ: Sin estados
    if tipo_medida == 'MPJ':
        return None
    
    # MPI: Solo estados 1-2
    if tipo_medida == 'MPI':
        if tipo_etapa in ['APERTURA', 'INNOVACION', 'PRORROGA']:
            return TEstadoEtapaMedida.objects.filter(
                orden=1,
                aplica_a_tipos_medida__contains=[tipo_medida],
                aplica_a_tipos_etapa__contains=[tipo_etapa]
            ).first()
        # MPI CESE: Sin estados
        return None
    
    # MPE: Todos los estados (1-5) para todas las etapas
    if tipo_medida == 'MPE':
        return TEstadoEtapaMedida.objects.filter(
            orden=1,
            aplica_a_tipos_medida__contains=[tipo_medida],
            aplica_a_tipos_etapa__contains=[tipo_etapa]
        ).first()
    
    return None
```

---

## Tests Requeridos (Mínimo 5)

```python
# runna/tests/test_crear_etapa.py

@pytest.mark.django_db
class TestCrearEtapa:
    """Tests para creación de etapas adicionales"""
    
    def test_crear_etapa_innovacion_desde_apertura_mpi(self, equipo_user, medida_mpi):
        """Puede crear etapa INNOVACION para MPI completada"""
        # Completar etapa APERTURA (estados 1-2)
        # ...
        
        # Crear etapa INNOVACION
        url = f"/api/medidas/{medida_mpi.id}/crear-etapa/"
        response = client.post(url, {
            'tipo_etapa': 'INNOVACION',
            'observaciones': 'Requiere innovación por cambio de situación'
        })
        
        assert response.status_code == 201
        assert response.data['tipo_etapa'] == 'INNOVACION'
        assert response.data['estado_especifico']['orden'] == 1  # Estado inicial
    
    def test_no_puede_crear_etapa_si_apertura_no_completa(self, equipo_user, medida_mpi):
        """No puede crear nueva etapa si APERTURA no está completa"""
        # APERTURA solo en estado 1 (no completada)
        # ...
        
        response = client.post(url, {'tipo_etapa': 'INNOVACION'})
        
        assert response.status_code == 400
        assert 'no está completada' in response.data['detail']
    
    def test_sin_permisos_devuelve_403(self, usuario_sin_permisos, medida_mpi):
        """Usuario sin permisos no puede crear etapa"""
        response = client.post(url, {'tipo_etapa': 'INNOVACION'})
        
        assert response.status_code == 403
    
    def test_mpj_etapas_sin_estados(self, equipo_user, medida_mpj):
        """MPJ crea etapas sin estados (estado_especifico = None)"""
        # ...
        response = client.post(url, {'tipo_etapa': 'PROCESO'})
        
        assert response.data['estado_especifico'] is None
    
    def test_cerrar_etapa_actual_al_crear_nueva(self, equipo_user, medida_mpi):
        """Al crear nueva etapa, se cierra la etapa actual"""
        # ...
        
        response = client.post(url, {'tipo_etapa': 'INNOVACION'})
        
        # Verificar que etapa APERTURA está cerrada
        etapa_anterior = TEtapaMedida.objects.get(id=etapa_apertura.id)
        assert etapa_anterior.fecha_fin_estado is not None
        
        # Verificar que nueva etapa es la actual
        medida_mpi.refresh_from_db()
        assert medida_mpi.etapa_actual.tipo_etapa == 'INNOVACION'
```

---

## Modelo de Datos Actual

```python
# infrastructure/models/medida/TEtapaMedida.py (YA EXISTE)

class TEtapaMedida(models.Model):
    # ...
    TIPO_ETAPA_CHOICES = [
        ('APERTURA', 'Apertura'),
        ('INNOVACION', 'Innovación'),
        ('PRORROGA', 'Prórroga'),
        ('CESE', 'Cese'),
        ('POST_CESE', 'Post-cese'),
        ('PROCESO', 'Proceso'),
    ]
    
    tipo_etapa = models.CharField(
        max_length=20,
        choices=TIPO_ETAPA_CHOICES,
        default='APERTURA',
        null=True,
        blank=True,
        help_text="Tipo de etapa de la medida (V2)"
    )
```

El campo ya existe, solo falta la lógica de creación.

---

## Endpoints a Crear

```
POST /api/medidas/{medida_id}/crear-etapa/
```

**Request:**
```json
{
  "tipo_etapa": "INNOVACION",  // o "PRORROGA", "CESE"
  "observaciones": "Motivo de la innovación...",
  "etapa_actual_id": 123  // Opcional
}
```

**Response 201:**
```json
{
  "id": 456,
  "medida": 23,
  "tipo_etapa": "INNOVACION",
  "nombre": "Innovación de la Medida",
  "estado_especifico": {
    "id": 1,
    "codigo": "PENDIENTE_REGISTRO_INTERVENCION",
    "nombre_display": "(1) Pendiente de registro de intervención",
    "orden": 1
  },
  "fecha_inicio_estado": "2025-01-12T10:00:00Z",
  "observaciones": "Motivo de la innovación...",
  "estado_anterior": {
    "id": 123,
    "tipo_etapa": "APERTURA",
    "fecha_cierre": "2025-01-12T09:58:00Z"
  }
}
```

---

## Casos de Uso

### CU-1: Equipo Técnico crea INNOVACION

1. Usuario completa etapa APERTURA (estados 1-5 finalizados)
2. Usuario identifica necesidad de innovación (situación cambiada)
3. Usuario accede a detalle de medida
4. Usuario presiona botón **"+ Crear Innovación"**
5. Sistema muestra modal con campo `observaciones`
6. Usuario completa motivo de innovación
7. Usuario confirma
8. Sistema:
   - Cierra etapa APERTURA actual
   - Crea nueva etapa INNOVACION con estado inicial (1)
   - Actualiza `medida.etapa_actual`
9. Usuario puede comenzar workflow de INNOVACION (MED-02)

---

## Resumen de Implementación

### Pasos Necesarios:

1. ✅ Modelo `TEtapaMedida` ya existe con campo `tipo_etapa`
2. ⏳ Crear `TEtapaMedidaCreateSerializer`
3. ⏳ Agregar action `crear_etapa` a `TMedidaViewSet`
4. ⏳ Implementar función `get_estado_inicial_etapa(tipo_medida, tipo_etapa)`
5. ⏳ Implementar función `_puede_crear_etapa(user, medida)`
6. ⏳ Escribir 5 tests mínimos
7. ⏳ Agregar documentación OpenAPI

**Estimación Total:** 3 puntos (~4 horas)

---

## Comparación con Documentación

Según las historias **MED-01** y **MED-01 V2**:

- **APERTURA**: Se crea automáticamente en MED-01 ✅
- **INNOVACION**: Debe crearse manualmente tras completar APERTURA ❌ **FALTA**
- **PRORROGA**: Debe crearse manualmente tras completar APERTURA/INNOVACION ❌ **FALTA**
- **CESE**: Debe crearse manualmente tras completar etapas anteriores ❌ **FALTA**

Este documento propone implementar lo que falta.

