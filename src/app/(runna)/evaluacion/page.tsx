import { Suspense } from "react"
import EvaluacionContent from "@/components/evaluacion/evaluacion-content"

export default function EvaluacionPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-[80vh]">Cargando...</div>}>
      <EvaluacionContent />
    </Suspense>
  )
}
