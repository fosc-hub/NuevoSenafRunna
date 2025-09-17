# Nested Fields Implementation Guide

## Overview

This implementation follows the guidelines from `nested-fields-prompt.md` to handle nested fields in the `RegistroDemandaForm` API structure. The solution ensures that:

1. **Unloaded nested fields are not sent to the API**
2. **Users can continue with the form flow** even when nested fields have no data
3. **Existing nested field data can be deleted** when needed

## Key Changes Made

### 1. Current Obligatory Fields Analysis (Step 3)

**Required fields identified in NNYA personal info tab:**
- `nombre` (required)
- `apellido` (required)
- `situacionDni` (required)
- `genero` (required)
- `nacionalidad` (required)
- `demanda_persona.vinculo_demanda` (required)

**Optional nested fields that are conditionally included:**
- `localizacion` (only if not using default localization)
- `educacion` (only if has meaningful educational data)
- `cobertura_medica` (only if has meaningful medical coverage data)
- `persona_enfermedades` (only if has health conditions)

### 2. New Clean Form Submission Logic

**Created:** `src/components/forms/utils/submitCleanFormData.ts`

This utility implements the conditional nested field inclusion strategy:

```typescript
// Only include educacion if it has meaningful data
const educacionData = createEducacionData(nnya.educacion, existingIds?.educacion?.id)
if (educacionData !== null) {
  cleanPersona.educacion = educacionData
}
```

**Key functions:**
- `submitCleanFormData()` - Main function for clean API submission
- `createEducacionData()` - Handles education data with deletion logic
- `createCoberturaMedicaData()` - Handles medical coverage with deletion logic
- `createPersonaEnfermedadesData()` - Handles health conditions array
- `isFieldLoaded()` - Helper to check if a field has meaningful data
- `markNestedFieldForDeletion()` - Marks existing records for deletion

### 3. Updated API Submission Logic

**Modified:** `src/components/forms/utils/api.ts`

The main `submitFormData` function now uses `submitCleanFormData` instead of the old `createFullFormData`:

```typescript
// For new records (POST), send clean data with conditional nested fields
const cleanData = submitCleanFormData(formData)
dataToSend = new FormData()
dataToSend.append("data", JSON.stringify(cleanData))
```

### 4. Deletion Strategy Implementation

**Created:** `src/components/forms/examples/NestedFieldDeletionExample.tsx`

This example component demonstrates how to delete existing nested field data:

```typescript
// Mark field for deletion
const deletionMarker = markNestedFieldForDeletion('educacion', existingEducacionId)
// Results in: { id: existingEducacionId, deleted: true }
```

## Implementation Details

### Conditional Inclusion Logic

#### Education Data (`educacion`)
Only included if any of these conditions are met:
- Has institution name
- Has education level
- Is currently enrolled (`esta_escolarizado: true`)
- Has last course attended
- Has school type
- Has educational comments

#### Medical Coverage (`cobertura_medica`)
Only included if any of these conditions are met:
- Has social security (`obra_social`)
- Has medical intervention
- Receives AUH (`auh: true`)
- Has observations
- Has health institution
- Has primary care doctor

#### Location (`localizacion`)
Only included if:
- Not using default location (`useDefaultLocalizacion: false`)
- Has all required fields: `calle`, `casa_nro`, `localidad`, `referencia_geo`

#### Health Conditions (`persona_enfermedades`)
Only included if:
- Array has items with meaningful health condition data
- Each condition has `situacion_salud` or disease name

### Deletion Strategy

When existing nested field data needs to be deleted:

1. **Check if record exists:** Verify the nested field has an existing ID
2. **Mark for deletion:** Use `{ id: existingId, deleted: true }`
3. **Include in submission:** Send the deletion marker to the API

```typescript
// Example: Delete existing education record
if (existingEducacionId && !hasEducationData) {
  return { id: existingEducacionId, deleted: true }
}
```

## Usage Examples

### 1. Basic Form Submission

```typescript
import { submitCleanFormData } from './utils/submitCleanFormData'

// In your form submission handler
const cleanData = submitCleanFormData(formData, existingData)
// cleanData will only include nested fields with meaningful data
```

### 2. Checking if Field is Loaded

```typescript
import { isFieldLoaded } from './utils/submitCleanFormData'

// Check if education field has been loaded/has data
const educationLoaded = isFieldLoaded(nnya.educacion, 'educacion')

// Allow user to continue even if education is not loaded
if (!educationLoaded) {
  console.log('Education data not loaded, but user can continue')
}
```

### 3. Deleting Existing Nested Data

```typescript
import { markNestedFieldForDeletion } from './utils/submitCleanFormData'

// Mark existing education record for deletion
const deletionMarker = markNestedFieldForDeletion('educacion', existingEducacionId)
setValue(`ninosAdolescentes.${index}.educacion`, deletionMarker)
```

## Benefits

### 1. **Reduced API Payload**
- Only sends meaningful data to the API
- Eliminates empty/null nested objects
- Improves performance and data integrity

### 2. **Flexible Form Flow**
- Users can proceed without filling all nested fields
- Optional sections remain truly optional
- Better user experience

### 3. **Proper Data Management**
- Handles deletion of existing nested records
- Maintains data consistency
- Follows API expectations for updates

### 4. **Maintainable Code**
- Clear separation of concerns
- Reusable utility functions
- Comprehensive documentation

## Migration Notes

### For Existing Forms

1. **Update imports:**
   ```typescript
   // Replace old direct API calls with:
   import { submitCleanFormData } from './utils/submitCleanFormData'
   ```

2. **Update submission logic:**
   ```typescript
   // Instead of raw form data:
   // const response = await create("endpoint", formData)

   // Use clean submission:
   const cleanData = submitCleanFormData(formData)
   const response = await create("endpoint", cleanData)
   ```

3. **Handle deletion scenarios:**
   ```typescript
   // For deleting existing nested data:
   if (userWantsToDelete && existingId) {
     const deletionMarker = markNestedFieldForDeletion(fieldType, existingId)
     setValue(fieldPath, deletionMarker)
   }
   ```

### Testing Considerations

1. **Test empty nested fields:** Verify that empty education/medical data is not sent
2. **Test deletion scenarios:** Ensure existing records are properly marked for deletion
3. **Test form flow:** Confirm users can proceed without loading all nested fields
4. **Test API responses:** Verify the backend correctly handles conditional nested fields

## Compatibility

- **Backward compatible:** Existing forms continue to work
- **Gradual migration:** Can be applied incrementally to different form sections
- **API compatible:** Follows existing API expectations for nested field handling

This implementation provides a robust solution for handling nested fields while maintaining form usability and data integrity.