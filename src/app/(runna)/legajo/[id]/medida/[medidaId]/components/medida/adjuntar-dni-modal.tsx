"use client"

import type React from "react"
import DescriptionIcon from "@mui/icons-material/Description"
import DocumentUploadModal, { type DocumentItem } from "@/components/shared/DocumentUploadModal"

interface AdjuntarDNIModalProps {
    open: boolean
    onClose: () => void
    title?: string
}

const DNI_DOCUMENTS: DocumentItem[] = [
    { id: 1, nombre: "DNI del NNyA", descripcion: "Fotocopia frente y dorso" },
    { id: 2, nombre: "Documento alternativo", descripcion: "En caso de no contar con DNI" }
]

export default function AdjuntarDNIModal({
    open,
    onClose,
    title = "Adjuntar DNI"
}: AdjuntarDNIModalProps) {
    const handleSave = () => {
        console.log("Guardando documentos DNI...")
    }

    const handleUpload = (documentId: number) => {
        console.log(`Subiendo documento DNI ${documentId}...`)
    }

    return (
        <DocumentUploadModal
            open={open}
            onClose={onClose}
            title={title}
            question="¿El NNyA cuenta con DNI?"
            addButtonLabel="Agregar documento"
            documents={DNI_DOCUMENTS}
            instructions="Formatos aceptados: PDF, JPG, PNG (máximo 5MB). Asegúrese de que la imagen sea legible y contenga toda la información necesaria."
            defaultIcon={<DescriptionIcon />}
            onSave={handleSave}
            onUpload={handleUpload}
        />
    )
} 