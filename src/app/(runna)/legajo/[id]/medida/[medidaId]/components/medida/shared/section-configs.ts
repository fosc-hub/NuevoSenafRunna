import type { DocumentItem } from "./document-list"

export interface SectionConfig {
    id: string
    title: string
    chips: Array<{
        label: string
        color: "primary" | "secondary" | "success" | "error" | "warning" | "info"
        variant?: "filled" | "outlined"
    }>
    date: string
    additionalInfo?: string[]
    showMessageButton?: boolean
    showCheckIcon?: boolean
    documents: DocumentItem[]
    showActionButtons?: boolean
    actionButtonText?: string
    showApprovalButtons?: boolean
    customButtons?: Array<{
        text: string
        variant: "contained" | "outlined"
        color: "primary" | "secondary" | "success" | "error" | "warning" | "info"
        onClick: () => void
    }>
}

export const getInformeMedidaConfig = (handlers: {
    onMessageClick: () => void
    onCargarInformes: () => void
    onAdjuntarNotificacion: () => void
    onAdjuntarDNI: () => void
    onAdjuntarActas: () => void
    onCompletarNotas: () => void
    onDocumentChange: (field: string, checked: boolean) => void
    documentStates: Record<string, boolean>
}): SectionConfig => ({
    id: "informe-medida",
    title: "Informe de medida adoptada",
    chips: [
        { label: "En revisión", color: "secondary" },
        { label: "En proceso", color: "warning" },
        { label: "Aprobado", color: "success" }
    ],
    date: "12/12/2025",
    showMessageButton: true,
    documents: [
        {
            id: "informe-medida",
            label: "Informe de medida: 1",
            files: ["Nombrearchivo.docx"]
        },
        {
            id: "notificacion-adultos",
            label: "Notificaciones a adultos: 2",
            additionalText: "No es posible",
            checked: handlers.documentStates.notificacionAdultos,
            onCheckChange: (checked) => handlers.onDocumentChange('notificacionAdultos', checked),
            showAttachButton: true,
            attachButtonText: "Adjuntar Notificación",
            onAttachClick: handlers.onAdjuntarNotificacion,
            files: ["Nombrearchivo.docx"]
        },
        {
            id: "fotocopia-dni",
            label: "Fotocopia del DNI:",
            additionalText: "No es posible",
            checked: handlers.documentStates.fotocopiaDNI,
            onCheckChange: (checked) => handlers.onDocumentChange('fotocopiaDNI', checked),
            showAttachButton: true,
            attachButtonText: "AdjuntarDNI",
            onAttachClick: handlers.onAdjuntarDNI,
            files: ["Nombrearchivo.docx", "Nombrearchivo.docx"]
        },
        {
            id: "acta-resguardo",
            label: "Acta de resguardo:",
            checked: handlers.documentStates.actaResguardo,
            onCheckChange: (checked) => handlers.onDocumentChange('actaResguardo', checked),
            showAttachButton: true,
            attachButtonText: "Adjuntar Actas",
            onAttachClick: handlers.onAdjuntarActas,
            files: ["Nombrearchivo.docx", "Nombrearchivo.docx"]
        },
        {
            id: "acta-puesta-conocimiento",
            label: "Acta de puesta en conocimiento al NNyA:",
            checked: handlers.documentStates.actaPuestaConocimiento,
            onCheckChange: (checked) => handlers.onDocumentChange('actaPuestaConocimiento', checked)
        },
        {
            id: "nota-aprobacion",
            label: "Nota de aprobación:",
            checked: handlers.documentStates.notaAprobacion,
            onCheckChange: (checked) => handlers.onDocumentChange('notaAprobacion', checked),
            showAttachButton: true,
            attachButtonText: "Completar Y adjuntar notas",
            onAttachClick: handlers.onCompletarNotas
        }
    ],
    showActionButtons: true,
    actionButtonText: "Cargar informes",
    showApprovalButtons: false
})

export const getNotaAprobacionConfig = (handlers: {
    onCompletarNotas: () => void
}): SectionConfig => ({
    id: "nota-aprobacion",
    title: "Nota de aprobación de la medida adoptada",
    chips: [
        { label: "En revisión", color: "secondary" }
    ],
    date: "12/12/2025",
    additionalInfo: ["Aprobado: 1", "Hello World"],
    documents: [
        {
            id: "nota-aval",
            label: "Nota de abajo:",
            checked: true,
            showAttachButton: true,
            attachButtonText: "Completar Y adjuntar notas",
            onAttachClick: handlers.onCompletarNotas
        }
    ],
    showApprovalButtons: true
})

export const getInformeJuridicoConfig = (handlers: {
    onAgregarInforme: () => void
}): SectionConfig => ({
    id: "informe-juridico",
    title: "Informe jurídico",
    chips: [
        { label: "En revisión", color: "secondary" }
    ],
    date: "12/12/2025",
    additionalInfo: ["Juzgado: 1"],
    documents: [],
    customButtons: [
        {
            text: "Agregar informe jurídico",
            variant: "contained",
            color: "primary",
            onClick: handlers.onAgregarInforme
        },
        {
            text: "Enviar mail",
            variant: "contained",
            color: "primary",
            onClick: () => { }
        },
        {
            text: "Adjuntar acuse de recibo",
            variant: "contained",
            color: "primary",
            onClick: () => { }
        }
    ],
    showApprovalButtons: true
})

export const getRatificacionConfig = (handlers: {
    ratificacionStatus: string
    onRatificacionChange: (status: string) => void
}): SectionConfig => ({
    id: "ratificacion",
    title: "Ratificación de Medida por el poder judicial",
    chips: [
        { label: "En revisión", color: "secondary" }
    ],
    date: "12/12/2025",
    additionalInfo: ["texto: 1", "Acuse de recibo: Sí"],
    documents: [],
    customButtons: [
        {
            text: "Ratificado",
            variant: handlers.ratificacionStatus === "ratificada" ? "contained" : "outlined",
            color: "primary",
            onClick: () => handlers.onRatificacionChange("ratificada")
        },
        {
            text: "Sin ratificar",
            variant: handlers.ratificacionStatus === "sin-ratificar" ? "contained" : "outlined",
            color: "primary",
            onClick: () => handlers.onRatificacionChange("sin-ratificar")
        },
        {
            text: "Adjunta resolución",
            variant: "contained",
            color: "primary",
            onClick: () => { }
        }
    ]
}) 