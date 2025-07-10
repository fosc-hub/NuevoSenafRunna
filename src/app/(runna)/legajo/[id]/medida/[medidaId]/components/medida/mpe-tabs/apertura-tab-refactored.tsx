"use client"

import type React from "react"
import { useState } from "react"
import { Box } from "@mui/material"
import { RegistroIntervencionModal } from "../registro-intervencion-modal"
import { NotificacionesModal } from "../notificaciones-modal"
import { AdjuntarNotaModal } from "../adjuntar-nota-modal"
import AdjuntarDNIModal from "../adjuntar-dni-modal"
import AdjuntarActasModal from "../adjuntar-actas-modal"
import { AgregarIntervencionModal } from "../agregar-intervencion-modal"
import { CarouselStepper } from "../carousel-stepper"
import { MensajesModal } from "../mensajes-modal"
import { FormularioDocumentoModal } from "../formulario-documento-modal"
import { SectionRenderer } from "../shared/section-renderer"
import {
    getInformeMedidaConfig,
    getNotaAprobacionConfig,
    getInformeJuridicoConfig,
    getRatificacionConfig
} from "../shared/section-configs"
import { OtrasIntervencionesSection } from "../shared/otras-intervenciones-section"

interface AperturaTabProps {
    medidaData: any
}

export const AperturaTabRefactored: React.FC<AperturaTabProps> = ({ medidaData }) => {
    // Modal states
    const [registroModalOpen, setRegistroModalOpen] = useState<boolean>(false)
    const [notificationModalOpen, setNotificationModalOpen] = useState<boolean>(false)
    const [dniModalOpen, setDniModalOpen] = useState<boolean>(false)
    const [actasModalOpen, setActasModalOpen] = useState<boolean>(false)
    const [notaAprobacionModalOpen, setNotaAprobacionModalOpen] = useState<boolean>(false)
    const [notaAvalModalOpen, setNotaAvalModalOpen] = useState<boolean>(false)
    const [agregarIntervencionModalOpen, setAgregarIntervencionModalOpen] = useState<boolean>(false)
    const [mensajesModalOpen, setMensajesModalOpen] = useState<boolean>(false)
    const [formularioDocumentoModalOpen, setFormularioDocumentoModalOpen] = useState<boolean>(false)

    // Document states
    const [documentStates, setDocumentStates] = useState({
        notificacionAdultos: true,
        fotocopiaDNI: true,
        actaResguardo: true,
        actaPuestaConocimiento: false,
        notaAprobacion: true,
    })

    // Other states
    const [ratificacionStatus, setRatificacionStatus] = useState<string>("ratificada")

    const handleDocumentChange = (field: string, checked: boolean) => {
        setDocumentStates(prev => ({
            ...prev,
            [field]: checked
        }))
    }

    const handleRatificacionChange = (status: string) => {
        setRatificacionStatus(status)
    }

    // Step configurations
    const step1Config = getInformeMedidaConfig({
        onMessageClick: () => setMensajesModalOpen(true),
        onCargarInformes: () => setRegistroModalOpen(true),
        onAdjuntarNotificacion: () => setNotificationModalOpen(true),
        onAdjuntarDNI: () => setDniModalOpen(true),
        onAdjuntarActas: () => setActasModalOpen(true),
        onCompletarNotas: () => setNotaAprobacionModalOpen(true),
        onDocumentChange: handleDocumentChange,
        documentStates
    })

    const step2Config = getNotaAprobacionConfig({
        onCompletarNotas: () => setNotaAvalModalOpen(true)
    })

    const step3Config = getInformeJuridicoConfig({
        onAgregarInforme: () => setFormularioDocumentoModalOpen(true)
    })

    const step4Config = getRatificacionConfig({
        ratificacionStatus,
        onRatificacionChange: handleRatificacionChange
    })

    const carouselSteps = [
        {
            id: "step1",
            title: "Informe de medida adoptada",
            content: (
                <SectionRenderer
                    config={step1Config}
                    onActionClick={() => setRegistroModalOpen(true)}
                    onMessageClick={() => setMensajesModalOpen(true)}
                />
            )
        },
        {
            id: "step2",
            title: "Nota de aprobación",
            content: (
                <SectionRenderer
                    config={step2Config}
                />
            )
        },
        {
            id: "step3",
            title: "Informe jurídico",
            content: (
                <SectionRenderer
                    config={step3Config}
                />
            )
        },
        {
            id: "step4",
            title: "Ratificación judicial",
            content: (
                <SectionRenderer
                    config={step4Config}
                />
            )
        },
        {
            id: "step5",
            title: "Otras intervenciones",
            content: (
                <OtrasIntervencionesSection
                    onAgregarIntervencion={() => setAgregarIntervencionModalOpen(true)}
                />
            )
        }
    ]

    return (
        <Box sx={{ width: "100%" }}>
            <CarouselStepper steps={carouselSteps} />

            {/* All Modals */}
            <RegistroIntervencionModal
                open={registroModalOpen}
                onClose={() => setRegistroModalOpen(false)}
            />

            <NotificacionesModal
                open={notificationModalOpen}
                onClose={() => setNotificationModalOpen(false)}
                title="Adjuntar Notificación"
            />

            <AdjuntarDNIModal
                open={dniModalOpen}
                onClose={() => setDniModalOpen(false)}
                title="Adjuntar DNI"
            />

            <AdjuntarActasModal
                open={actasModalOpen}
                onClose={() => setActasModalOpen(false)}
                title="Adjuntar Actas"
            />

            <AdjuntarNotaModal
                open={notaAprobacionModalOpen}
                onClose={() => setNotaAprobacionModalOpen(false)}
                title="Adjuntar nota aprobación"
                modeloTexto="Descargar modelo de nota"
                sectionNumber="1"
                sectionTitle="Nota de Aprobación"
            />

            <AdjuntarNotaModal
                open={notaAvalModalOpen}
                onClose={() => setNotaAvalModalOpen(false)}
                title="Adjuntar nota de aval"
                modeloTexto="Descargar modelo de nota"
                sectionNumber="2"
                sectionTitle="Nota de Aval"
            />

            <AgregarIntervencionModal
                open={agregarIntervencionModalOpen}
                onClose={() => setAgregarIntervencionModalOpen(false)}
            />

            <MensajesModal
                open={mensajesModalOpen}
                onClose={() => setMensajesModalOpen(false)}
                title="Mensajes - Informe de medida adoptada"
            />

            <FormularioDocumentoModal
                open={formularioDocumentoModalOpen}
                onClose={() => setFormularioDocumentoModalOpen(false)}
            />
        </Box>
    )
} 