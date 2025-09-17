/**
 * Debug utility to trace form data structure issues
 */

export function debugFormDataStructure(data: any, label: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🐛 [DEBUG] ${label}`)

    if (data?.institucion) {
      console.log('📋 Institucion structure:', {
        type: typeof data.institucion,
        value: data.institucion,
        isString: typeof data.institucion === 'string',
        isObject: typeof data.institucion === 'object',
        hasNombre: data.institucion?.nombre,
        hasTipoInstitucion: data.institucion?.tipo_institucion
      })
    }

    if (data?.tipo_institucion) {
      console.log('🏢 Tipo Institucion:', {
        type: typeof data.tipo_institucion,
        value: data.tipo_institucion
      })
    }

    // Check for nested structure issues
    if (data?.institucion?.nombre?.nombre) {
      console.error('🚨 DOUBLE NESTING DETECTED in institucion.nombre.nombre!')
      console.log('🔍 Full structure:', JSON.stringify(data.institucion, null, 2))
    }

    console.groupEnd()
  }
}

export function debugPatchData(originalData: any, formData: any, patchData: any): void {
  if (process.env.NODE_ENV === 'development') {
    console.group('🔧 [PATCH DEBUG] Data Transformation')

    console.log('📥 Original Data (from API):', {
      institucion: originalData?.institucion,
      tipo_institucion: originalData?.tipo_institucion
    })

    console.log('📝 Form Data (from form):', {
      institucion: formData?.institucion,
      tipo_institucion: formData?.tipo_institucion
    })

    console.log('📤 Patch Data (to API):', {
      institucion: patchData?.institucion,
      tipo_institucion: patchData?.tipo_institucion
    })

    // Check for double nesting in patch data
    if (patchData?.institucion?.nombre?.nombre) {
      console.error('🚨 DOUBLE NESTING IN PATCH DATA!')
      console.log('🔍 Problematic patch structure:', JSON.stringify(patchData.institucion, null, 2))
    }

    console.groupEnd()
  }
}

export function logApiSubmission(data: any, isUpdate: boolean = false): void {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚀 [API SUBMISSION] ${isUpdate ? 'UPDATE' : 'CREATE'}`)

    // Log the actual data being sent
    let dataToLog: any
    if (data instanceof FormData) {
      try {
        const jsonData = data.get('data')
        dataToLog = jsonData ? JSON.parse(jsonData as string) : {}
      } catch (e) {
        dataToLog = { error: 'Could not parse FormData' }
      }
    } else {
      dataToLog = data
    }

    if (dataToLog?.institucion) {
      console.log('🏢 Institution data being sent:', {
        structure: dataToLog.institucion,
        hasDoubleNesting: !!(dataToLog.institucion?.nombre?.nombre)
      })
    }

    // Log full payload (truncated for readability)
    console.log('📦 Full payload structure:', {
      keys: Object.keys(dataToLog),
      institucion: dataToLog.institucion,
      tipo_institucion: dataToLog.tipo_institucion
    })

    console.groupEnd()
  }
}

export function validateFormDataStructure(formData: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check institucion field
  if (formData?.institucion) {
    if (typeof formData.institucion === 'object') {
      if (formData.institucion.nombre?.nombre) {
        errors.push('Double nesting detected in institucion.nombre.nombre')
      }
      if (!formData.institucion.nombre) {
        errors.push('Missing nombre in institucion object')
      }
    }
  }

  // Check for other potential issues
  if (formData?.personas) {
    formData.personas.forEach((persona: any, index: number) => {
      if (persona?.educacion?.institucion_educativa?.nombre?.nombre) {
        errors.push(`Double nesting in personas[${index}].educacion.institucion_educativa.nombre.nombre`)
      }
    })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}