# Registro de Cambio: Reestructuración de Layout en Formulario de Oficios

**Fecha:** 25/02/2026
**Tipo:** Frontend / UI Layout

## Archivos Modificados
- `src/components/forms/carga-oficios/CargaOficiosForm.tsx`

## Descripción del Cambio
Se ha reorganizado la sección de **Clasificación de la Medida** para mejorar la legibilidad y la alineación de los campos:

1.  **Alineación de Fechas**: Se agruparon los campos **"Fecha del Oficio"** y **"Fecha Ingreso SENAF"** en una única fila horizontal (`md={6}` cada uno).
2.  **Organización de Circuitos**: El selector de circuito ahora ocupa el ancho completo de la sección, sirviendo como encabezado visual antes de los datos específicos.
3.  **Agrupación de Categorías**: Los campos de **Categoría** y **Tipo de Oficio** se alinearon en la fila subsiguiente para mantener la simetría con las fechas.

## Objetivo
Lograr una interfaz más limpia ("prolija") y equilibrada, facilitando la carga de datos al mantener campos relacionados al mismo nivel visual.
