"use client"

import { useParams } from "next/navigation"
import LegajoDetail from "../legajo-detail"

export default function LegajoDetailPage() {
  const params = useParams()
  const id = params.id as string

  return (
    <div className="container mx-auto py-6">
      <LegajoDetail params={{ id }} isFullPage={true} />
    </div>
  )
}
