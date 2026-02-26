# Registro de Cambio: Mejora de Acción "Evaluación"

**Fecha:** 25/02/2026
**Tipo:** Frontend / UX

## Archivos Modificados
- `src/app/(runna)/mesadeentrada/ui/dataGrid.tsx`

## Descripción del Cambio
Se ha implementado una mejora visual en la tabla de la Mesa de Entradas para facilitar al usuario la acción de evaluación de demandas:

1.  **Transformación de Acción**: Se reemplazó el ícono de edición (lápiz) por un botón visible de Material UI con la etiqueta **"Evaluar"**.
    - Estilo: Variante `contained`, color verde (`success`), bordes redondeados.
2.  **Interactividad de Estado**: El chip (badge) de estado que indica "Evaluación" ahora es interactivo. Al hacer clic sobre él, el usuario es redirigido a la pantalla de evaluación.
3.  **Control de Propagación**: Se añadió `e.stopPropagation()` a los nuevos elementos de clic para evitar que se abra el modal de detalles de la fila al intentar evaluar una demanda.

## Objetivo
Optimizar la navegación y evitar confusiones al usuario, haciendo que el camino hacia la evaluación sea más directo y visible.
