# Registro de Cambio: Optimización de Flujo de Cierre MPI

## Fecha: 2026-02-25

## Descripción
Se han realizado mejoras críticas en el flujo de cierre para las Medidas de Protección Integral (MPI), asegurando la visibilidad y correcta gestión de los informes de cierre y la navegación del stepper.

## Cambios Realizados

### Frontend
- **Visibilidad del Informe de Cierre**:
    - Se ajustó el componente `InformeCierreSection` para que el botón **"Ver Informe Cargado"** aparezca correctamente cuando la medida está en estado `CERRADA`.
    - Se sincronizaron los nombres de los campos de archivos adjuntos con el backend (uso de `archivo_url` y `tipo_adjunto`).
- **Lógica de Stepper y Navegación**:
    - Se actualizó `UnifiedWorkflowTab.tsx` para permitir la navegación automática al Paso 3 (Cierre) cuando la medida se detecta como cerrada.
    - Se corrigieron las condiciones de completado (`isStep3Completed`) para que reflejen el 100% de progreso una vez validado el informe de cese.
- **Validación de Enums**:
    - Se aseguró que los filtros de documentos utilicen el enum correcto `INFORME_CIERRE` para diferenciarlo de los informes de proceso o apertura.

### Componentes Modificados
- `informe-cierre-section.tsx`: Lógica de visualización de adjuntos y estados de carga.
- `UnifiedWorkflowTab.tsx`: Gestión de pasos del stepper y flujo de navegación para MPI.
- `step-completion.ts`: Inclusión de estados de cierre en la lógica de progreso.

## Impacto
El personal técnico y directivo ahora puede visualizar y validar el cierre de una MPI de forma transparente, eliminando la confusión sobre si el informe fue cargado correctamente y permitiendo una auditoría más sencilla del legajo.
