"use client"

import { useParams } from "next/navigation"
import MedidaDetail from "../medida-detail"

export default function MedidaDetailPage() {
  const params = useParams()
  const id = params.id as string
  const medidaId = params.medidaId as string

  return (
    <div className="container mx-auto py-6">
      <MedidaDetail params={{ id, medidaId }} isFullPage={true} />
    </div>
  )
}
