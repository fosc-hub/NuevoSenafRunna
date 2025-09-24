# Corrección del Problema de Valoraciones Seleccionadas

## Problema Identificado

Los datos de `valoraciones_seleccionadas` se estaban recibiendo correctamente desde el endpoint `full-detail`, pero no se mostraban en la UI porque:

1. **El componente `DecisionBox` estaba ignorando las valoraciones del prop**: Tenía su propio `useEffect` que realizaba una llamada a la API para obtener indicadores, sobrescribiendo los datos que venían con las valoraciones aplicadas.

2. **Doble estado inconsistente**: El componente mantenía su propio estado `indicators` separado del estado del padre `vulnerabilityIndicators`.

## Solución Implementada

### 1. Modificación del `DecisionBox` (`decision-box.tsx`)

**Cambio Principal**: Eliminé la llamada a la API y modifiqué el componente para usar los indicadores que vienen del prop.

```typescript
// ANTES: Cargaba indicadores desde API (perdía valoraciones)
useEffect(() => {
  const fetchIndicators = async () => {
    setLoading(true)
    try {
      const data = await getIndicadores()
      setIndicators(data.map((ind) => ({ ...ind, selected: false }))) // ❌ Perdía valoraciones
    } catch (error) {
      console.error("Error fetching indicators:", error)
    } finally {
      setLoading(false)
    }
  }
  fetchIndicators()
}, [])

// DESPUÉS: Usa indicadores del prop (conserva valoraciones)
useEffect(() => {
  if (Array.isArray(vulnerabilityIndicators) && vulnerabilityIndicators.length > 0) {
    console.log("Setting indicators from props:", vulnerabilityIndicators)
    setIndicators(vulnerabilityIndicators) // ✅ Conserva valoraciones
    setLoading(false)
  } else {
    console.log("No vulnerability indicators received:", vulnerabilityIndicators)
  }
}, [vulnerabilityIndicators])
```

### 2. Sincronización de Estados

**Problema**: El manejo de cambios solo actualizaba el estado local.

```typescript
// ANTES: Solo actualizaba estado local
const handleIndicatorSelectionChange = (id: number, value: boolean) => {
  setIndicators(indicators.map((indicator) => (indicator.id === id ? { ...indicator, selected: value } : indicator)))
}

// DESPUÉS: Sincroniza con el estado del padre
const handleIndicatorSelectionChange = (id: number, value: boolean) => {
  // Update local state
  setIndicators(indicators.map((indicator) => (indicator.id === id ? { ...indicator, selected: value } : indicator)))
  // Also call the parent handler to keep the parent state in sync
  handleIndicatorChange(id, value) // ✅ Mantiene sincronización
}
```

### 3. Debug Mejorado

Agregué logs de debug para facilitar la verificación:

```typescript
// En evaluacion-tabs.tsx
{console.log("Passing indicators to DecisionBox:", vulnerabilityIndicators)}

// En decision-box.tsx
console.log("Setting indicators from props:", vulnerabilityIndicators)
```

## Flujo de Datos Corregido

```
API Response (full-detail)
    ↓
transformApiData() → extrae valoraciones_seleccionadas
    ↓
EvaluacionTabs → aplica valoraciones a vulnerabilityIndicators
    ↓
DecisionBox → usa vulnerabilityIndicators del prop (en lugar de API)
    ↓
UI → muestra checkboxes con valoraciones correctas ✅
```

## Verificación

Para confirmar que la corrección funciona, verificar en la consola del navegador:

1. **"Transformed data for tabs:"** - Datos transformados correctos
2. **"Valoraciones seleccionadas:"** - Array de valoraciones extraídas
3. **"Updating vulnerability indicators with valoraciones:"** - Aplicación de valoraciones
4. **"Applied valoracion for indicator X: true/false"** - Valoraciones específicas aplicadas
5. **"Passing indicators to DecisionBox:"** - Indicadores enviados al componente
6. **"Setting indicators from props:"** - Indicadores recibidos en DecisionBox

## Resultado Esperado

Con los datos del ejemplo proporcionado:
- **Indicador 11**: Debe aparecer marcado como "Sí" (`checked: true`)
- **Indicador 12**: Debe aparecer marcado como "Sí" (`checked: true`)
- **Todos los demás**: Deben aparecer marcados como "No" (`checked: false`)

## Archivos Modificados

1. **`src/components/evaluacion/decision-box.tsx`**:
   - Líneas 58-67: Cambió lógica de carga de indicadores
   - Líneas 69-73: Agregó sincronización de estados

2. **`src/components/evaluacion/evaluacion-tabs.tsx`**:
   - Línea 314: Agregó debug log

## Notas Técnicas

- ✅ **Backwards compatible**: Funciona con datos sin valoraciones previas
- ✅ **Sin cambios de API**: Solo modificaciones en frontend
- ✅ **Tipado seguro**: Mantiene interfaces TypeScript existentes
- ✅ **Performance**: Elimina llamada innecesaria a API en DecisionBox
