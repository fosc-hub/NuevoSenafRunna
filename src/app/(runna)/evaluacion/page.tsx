import { Suspense } from "react"
import EvaluacionContent from "./evaluacion-content"

export default function EvaluacionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EvaluacionContent />
    </Suspense>
  )
}
