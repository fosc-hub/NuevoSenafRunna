import type { FormData } from "../types/formTypes"
import { create, update } from "@/app/api/apiService"
import { fetchCaseData } from "./fetch-case-data"
import { createPatchFromChanges } from "./compareAndPatch"
import { logPatchData } from "./debug-patch"
import { submitCleanFormData } from "./submitCleanFormData"
import { debugFormDataStructure, debugPatchData, logApiSubmission, validateFormDataStructure } from "./debugFormData"

// Track if a submission is in progress to prevent duplicates
let isSubmissionInProgress = false

/**
 * Create or update the Demanda (form data)
 */
export const submitFormData = async (formData: FormData, id?: string): Promise<any> => {
  console.log("Original form data:", JSON.stringify(formData, null, 2))

  // Debug the incoming form data structure
  debugFormDataStructure(formData, "Incoming Form Data")

  // Validate form data structure
  const validation = validateFormDataStructure(formData)
  if (!validation.isValid) {
    console.error("⚠️ Form data structure issues detected:", validation.errors)
  }

  // Prevent duplicate submissions
  if (isSubmissionInProgress) {
    console.log("Submission already in progress, preventing duplicate")
    return Promise.reject(new Error("Submission already in progress"))
  }

  isSubmissionInProgress = true

  try {
    let dataToSend: FormData | any

    if (id) {
      // For updates (PATCH), only send changed fields
      try {
        // Fetch the original data
        const originalData = await fetchCaseData(id)

        // Create clean form data with conditional nested fields
        const cleanData = submitCleanFormData(formData, originalData)
        debugFormDataStructure(cleanData, "Clean Form Data")

        // Create a patch object with only the changed fields
        const patchData = createPatchFromChanges(originalData, cleanData)
        debugFormDataStructure(patchData, "Patch Data")

        // Debug the transformation process
        debugPatchData(originalData, formData, patchData)

        // Log detailed debug information
        logPatchData(originalData, cleanData, patchData)

        // Create FormData object for the patch
        dataToSend = new FormData()
        dataToSend.append("data", JSON.stringify(patchData))
      } catch (error) {
        console.error("Error creating patch data:", error)
        // Fallback to clean full update if patch creation fails
        const cleanData = submitCleanFormData(formData)
        dataToSend = new FormData()
        dataToSend.append("data", JSON.stringify(cleanData))
      }
    } else {
      // For new records (POST), send clean data with conditional nested fields
      const cleanData = submitCleanFormData(formData)
      dataToSend = new FormData()
      dataToSend.append("data", JSON.stringify(cleanData))
    }

    // Add files to FormData
    addFilesToFormData(dataToSend, formData)

    // Debug the final API submission
    logApiSubmission(dataToSend, !!id)

    // Log the data being sent
    console.log("Data being sent to API:")
    const dataJson = JSON.parse(dataToSend.get("data") as string)
    console.log(JSON.stringify(dataJson, null, 2))

    let response: any
    if (id) {
      // Update (PATCH) the existing Demanda
      response = await update("registro-demanda-form", Number(id), dataToSend, true, "Demanda actualizada con éxito")
    } else {
      // Create (POST) a new Demanda
      response = await create("registro-demanda-form", dataToSend, true, "Demanda creada con éxito")
    }

    console.log("Server response:", response)
    isSubmissionInProgress = false
    return response
  } catch (error: any) {
    console.error("Error al enviar los datos del formulario:", error)
    if (error.response) {
      console.error("Server error response:", error.response.data)
    }
    if (error.response && error.response.status === 201) {
      console.log("Form submitted successfully with status 201")
      isSubmissionInProgress = false
      return error.response.data
    }
    isSubmissionInProgress = false
    throw error
  }
}

// The createFullFormData function has been replaced by submitCleanFormData
// which provides better handling of nested fields with conditional inclusion

/**
 * Adds files to the FormData object
 */
function addFilesToFormData(formDataObj: FormData, formData: FormData): void {
  // Add general attachments
  if (formData.adjuntos && formData.adjuntos.length > 0) {
    formData.adjuntos.forEach((file: File, index: number) => {
      formDataObj.append(`adjuntos[${index}][archivo]`, file)
    })
  }
  // Add medical certificate files
  ; (formData.ninosAdolescentes || []).forEach((nnya: any, nnyaIndex: number) => {
    ; (nnya.persona_enfermedades || []).forEach((enfermedad: any, enfIndex: number) => {
      if (enfermedad.certificado_adjunto) {
        if (Array.isArray(enfermedad.certificado_adjunto)) {
          enfermedad.certificado_adjunto.forEach((file: string | Blob, fileIndex: number) => {
            formDataObj.append(
              `personas[${nnyaIndex}]persona_enfermedades[${enfIndex}]certificado_adjunto[${fileIndex}]archivo`,
              file,
            )
          })
        } else if (enfermedad.certificado_adjunto instanceof File) {
          formDataObj.append(
            `personas[${nnyaIndex}]persona_enfermedades[${enfIndex}]certificado_adjunto[0]archivo`,
            enfermedad.certificado_adjunto,
          )
        }
      }
    })
  })
}
