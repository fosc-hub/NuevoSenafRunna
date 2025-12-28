"use client"

import type React from "react"
import AssignmentIcon from "@mui/icons-material/Assignment"
import DocumentUploadModal, { type DocumentItem } from "@/components/shared/DocumentUploadModal"

interface AdjuntarActasModalProps {
    open: boolean
    onClose: () => void
    title?: string
}

const ACTAS_DOCUMENTS: DocumentItem[] = [
    { id: 1, nombre: "Acta de resguardo del NNyA", descripcion: "Documento principal requerido" },
    { id: 2, nombre: "Acta de puesta en conocimiento", descripcion: "Notificación al NNyA" },
    { id: 3, nombre: "Documentación adicional", descripcion: "Otros documentos relevantes" }
]

export default function AdjuntarActasModal({
    open,
    onClose,
    title = "Adjuntar Actas"
}: AdjuntarActasModalProps) {
    const handleSave = () => {
        console.log("Guardando actas...")
    }

    const handleUpload = (documentId: number) => {
        console.log(`Subiendo acta ${documentId}...`)
    }

    return (
        <DocumentUploadModal
            open={open}
            onClose={onClose}
            title={title}
            question="¿Se cuenta con las actas requeridas?"
            addButtonLabel="Agregar acta"
            documents={ACTAS_DOCUMENTS}
            instructions="Puede adjuntar múltiples documentos. Formatos aceptados: PDF, DOC, DOCX (máximo 10MB cada uno). Asegúrese de incluir todas las actas requeridas."
            defaultIcon={<AssignmentIcon />}
            onSave={handleSave}
            onUpload={handleUpload}
        />
    )
} 