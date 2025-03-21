"use client"

import { useParams } from "next/navigation"
import DemandaDetail from "../DemandaDetail"

export default function DemandaDetailPage() {
  const params = useParams()
  const id = params.id as string

  return (
    <div className="container mx-auto py-6">
      <DemandaDetail params={{ id }} isFullPage={true} />
    </div>
  )
}

