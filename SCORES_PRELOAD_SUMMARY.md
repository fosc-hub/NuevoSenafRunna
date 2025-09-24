# Precarga de Scores NNyA - Resumen de Implementación

## Objetivo
Precargar los scores de NNyA desde el endpoint `full-detail` para mostrarlos inmediatamente al cargar la evaluación, similar a como se hizo con las valoraciones de indicadores.

## Estructura de Datos del API

```json
"scores": [
    {
        "id": 42,
        "ultima_actualizacion": "2025-09-24T15:33:43.471982Z",
        "score": -23.0,
        "score_condiciones_vulnerabilidad": 0.0,
        "score_vulneracion": 0.0,
        "score_valoracion": -23.0,
        "nnya": 42
    }
]
```

## Cambios Implementados

### 1. Verificación de Extracción Existente (`evaluacion-content.tsx`)

✅ **Ya estaba implementado**: Los scores se extraían correctamente en línea 258:
```typescript
scores: Array.isArray(apiData.scores) ? apiData.scores : [],
```

### 2. Modificación de la Interfaz `DecisionBox` (`decision-box.tsx`)

**Líneas 45-50**: Agregué el prop `preloadedScores` opcional:
```typescript
interface DecisionBoxProps {
  vulnerabilityIndicators: any[]
  handleIndicatorChange: (id: number, value: boolean) => void
  demandaId?: number | null
  preloadedScores?: Score[]  // ✅ Nuevo prop agregado
}
```

**Línea 52**: Actualicé la función para recibir el nuevo prop:
```typescript
export default function DecisionBox({ 
  vulnerabilityIndicators, 
  handleIndicatorChange, 
  demandaId, 
  preloadedScores  // ✅ Nuevo prop
}: DecisionBoxProps)
```

### 3. Implementación de Precarga de Scores (`decision-box.tsx`)

**Líneas 70-79**: Agregué useEffect para cargar scores precargados:
```typescript
// Use preloaded scores from props
useEffect(() => {
  if (Array.isArray(preloadedScores) && preloadedScores.length > 0) {
    console.log("Setting preloaded scores from props:", preloadedScores)
    setScores(preloadedScores)
    setShowDecision(true) // Show decision section if there are preloaded scores
  } else {
    console.log("No preloaded scores received:", preloadedScores)
  }
}, [preloadedScores])
```

### 4. Actualización del Componente Padre (`evaluacion-tabs.tsx`)

**Líneas 317-322**: Actualicé la llamada al `DecisionBox` para pasar los scores:
```typescript
<DecisionBox
  vulnerabilityIndicators={vulnerabilityIndicators}
  handleIndicatorChange={handleIndicatorChange}
  demandaId={demandaId}
  preloadedScores={data.scores}  // ✅ Nuevo prop agregado
/>
```

**Líneas 314-315**: Agregué logs de debug:
```typescript
{console.log("Passing indicators to DecisionBox:", vulnerabilityIndicators)}
{console.log("Passing scores to DecisionBox:", data.scores)}
```

## Flujo de Datos Completo

```
API Response (full-detail)
    ↓ 
transformApiData() → extrae scores y valoraciones_seleccionadas
    ↓
EvaluacionTabs → recibe data.scores y data.valoracionesSeleccionadas
    ↓
DecisionBox → recibe preloadedScores y vulnerabilityIndicators
    ↓
useEffect → aplica scores y valoraciones precargados
    ↓
UI → muestra scores y valoraciones inmediatamente ✅
```

## Comportamiento Esperado

### Al Cargar la Evaluación:
1. **Indicadores**: Se marcan según `valoraciones_seleccionadas`
2. **Scores**: Se muestran inmediatamente en el panel lateral
3. **Sección de Decisión**: Se muestra automáticamente si hay scores precargados

### Al Hacer "VALORAR":
1. **Los scores se actualizan** con nuevos cálculos
2. **Se mantiene la funcionalidad existente** de recalcular scores

## Logs de Debug para Verificación

Para confirmar que funciona, verificar en la consola:

1. **"Transformed data for tabs:"** - Datos transformados con scores
2. **"Passing scores to DecisionBox:"** - Scores enviados al componente
3. **"Setting preloaded scores from props:"** - Scores recibidos y aplicados
4. **"No preloaded scores received:"** - Si no hay scores (caso normal para evaluaciones nuevas)

## Ejemplo con Datos del Payload

Con el payload de ejemplo:
- **Score Total**: -23.0
- **Score Condiciones Vulnerabilidad**: 0.0  
- **Score Vulneración**: 0.0
- **Score Valoración**: -23.0
- **NNyA ID**: 42

Estos valores deben aparecer inmediatamente en el panel "SCORES NNyA" al cargar la evaluación.

## Compatibilidad

✅ **Backwards Compatible**: Funciona con evaluaciones sin scores previos  
✅ **Sin Cambios de API**: Solo modificaciones en frontend  
✅ **Tipado Seguro**: Mantiene interfaces TypeScript existentes  
✅ **Funcionalidad Existente**: No interfiere con el cálculo de nuevos scores
