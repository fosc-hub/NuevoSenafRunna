"use client"

import { useParams } from "next/navigation"
import MedidaDetail from "../medida-detail"

export default function MPEDetailPage() {
    const params = useParams()
    const id = params.id as string

    return (
        <div className="container mx-auto py-6">
            <MedidaDetail
                params={{ id, medidaId: 'mpe' }}
                isFullPage={true}
            />
        </div>
    )
} 