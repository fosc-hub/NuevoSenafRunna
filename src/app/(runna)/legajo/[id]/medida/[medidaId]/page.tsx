"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import MedidaDetail from "../medida-detail"
import NotificationModal from "../notification-modal"

export default function MedidaDetailPage() {
  const params = useParams()
  const id = params.id as string
  const medidaId = params.medidaId as string
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    // Show notification modal when the page loads
    setShowNotification(true)
  }, [])

  const handleCloseNotification = () => {
    setShowNotification(false)
  }

  return (
    <div className="container mx-auto py-6">
      <MedidaDetail params={{ id, medidaId }} isFullPage={true} />

      <NotificationModal open={showNotification} onClose={handleCloseNotification} medidaId={medidaId} />
    </div>
  )
}
