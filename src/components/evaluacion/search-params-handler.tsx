"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

interface SearchParamsHandlerProps {
  onDemandaIdChange: (id: number | null) => void
}

export default function SearchParamsHandler({ onDemandaIdChange }: SearchParamsHandlerProps) {
  const searchParams = useSearchParams()

  useEffect(() => {
    const id = searchParams.get("id")
    if (id) {
      onDemandaIdChange(Number.parseInt(id))
    } else {
      onDemandaIdChange(null)
    }
  }, [searchParams, onDemandaIdChange])

  // This component doesn't render anything visible
  return null
}
