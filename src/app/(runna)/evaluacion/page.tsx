"use client"
import { evaluacionData } from "@/components/evaluacion/data/evaluacion-data"
import EvaluacionTabs from "@/components/evaluacion/evaluacion-tabs"
import Header from "../../../components/Header"

export default function EvaluacionPage() {
  return (
    <><Header /><main className="max-w-[1200px] mx-auto p-5">

      <EvaluacionTabs data={evaluacionData} />
    </main></>
  )
}

