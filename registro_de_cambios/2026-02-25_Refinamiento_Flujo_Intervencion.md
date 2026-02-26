# Registro de Cambio: Refinamiento de Flujo de Intervención

Este cambio consolida las acciones de intervención en la sección de Apertura y clarifica el flujo de aprobación multinivel.

## Cambios Realizados

### 1. Consolidación de Botones (Frontend)
- **Archivo**: `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/apertura-section.tsx`
- **Descripción**: Se eliminó el sistema de dos botones ("Ver Última" y "Nueva") y se reemplazó por un único botón dinámico.
- **Lógica**:
    - Si no hay intervención: **"Nueva Intervención de Apertura"** (Contained).
    - Si ya existe una: **"Editar Intervención de Apertura"** (Outlined).

### 2. Lógica de Completado de Pasos
- **Archivo**: `src/app/(runna)/legajo/[id]/medida/[medidaId]/utils/step-completion.ts`
- **Descripción**: Se ajustó la función `isIntervencionCompleted` para incluir el estado `APROBADO`.
- **Efecto**: El Paso 1 solo se marcará como completado (verde) cuando el Jefe Zonal (JZ) apruebe la intervención, reflejando el flujo: Técnico (Carga) -> JZ (Aprobación Paso 1) -> Director (Aprobación Paso 2).

### 3. Orientación al Usuario en UI
- **Archivo**: `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/workflow-step-content.tsx`
- **Descripción**: Se actualizaron los textos de ayuda en el Stepper para clarificar las responsabilidades de cada rol (Técnico, JZ y Director).

## Verificación
- [x] Botón único dinámico funcionando.
- [x] Stepper bloqueado en Paso 1 hasta aprobación de JZ.
- [x] Textos de guía actualizados y claros.

> [!NOTE]
> Estos cambios son 100% frontend y reutilizan los servicios y estados existentes del backend.
