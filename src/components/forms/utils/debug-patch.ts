/**
 * Utility function to log the patch data for debugging
 */
export function logPatchData(originalData: any, updatedData: any, patchData: any): void {
    console.group("Patch Data Debug")
    console.log("Original Data:", JSON.stringify(originalData, null, 2))
    console.log("Updated Data:", JSON.stringify(updatedData, null, 2))
    console.log("Patch Data:", JSON.stringify(patchData, null, 2))
    console.groupEnd()
  }
  