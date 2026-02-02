"use client"

import { useState } from "react"
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  IconButton,
  Avatar,
  CircularProgress,
  Alert,
  Tooltip,
  Card,
  CardContent,
  Divider,
  Stack,
} from "@mui/material"
import {
  Add as AddIcon,
  Edit as EditIcon,
  LinkOff as LinkOffIcon,
  Person as PersonIcon,
  Star as StarIcon,
  Home as HomeIcon,
  Gavel as GavelIcon,
  FolderOpen as FolderOpenIcon,
  Shield as ShieldIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
} from "@mui/icons-material"
import { usePersonasRelacionadasManager } from "../../hooks/usePersonasRelacionadas"
import type { PersonaVinculo } from "../../types/personas-relacionadas-api"
import DesvincularPersonaModal from "./DesvincularPersonaModal"
import AgregarPersonaRelacionadaModal from "./AgregarPersonaRelacionadaModal"
import EditarPersonaRelacionadaModal from "./EditarPersonaRelacionadaModal"

interface PersonasRelacionadasSectionProps {
  legajoId: number
  nnyaId: number
  readOnly?: boolean
  canEdit?: boolean
}

// Helper to get avatar color based on name
const getAvatarColor = (nombre: string = ""): string => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E2",
  ]
  const index = nombre.charCodeAt(0) % colors.length
  return colors[index] || colors[0]
}

// Helper to get initials
const getInitials = (nombre: string = "", apellido: string = ""): string => {
  const n = nombre?.charAt(0) || ""
  const a = apellido?.charAt(0) || ""
  return `${n}${a}`.toUpperCase() || "??"
}

// Format DNI with dots
const formatDNI = (dni: number | null): string => {
  if (!dni) return "Sin DNI"
  return dni.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

/**
 * PersonaRelacionadaCard - Individual card for each persona relacionada
 */
interface PersonaRelacionadaCardProps {
  persona: PersonaVinculo
  onEdit: () => void
  onDesvincular: () => void
  readOnly: boolean
}

function PersonaRelacionadaCard({
  persona,
  onEdit,
  onDesvincular,
  readOnly,
}: PersonaRelacionadaCardProps) {
  const { persona_destino_info: info } = persona

  return (
    <Card
      variant="outlined"
      sx={{
        position: "relative",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: 1,
        },
      }}
    >
      <CardContent sx={{ pb: 2 }}>
        {/* Header with avatar and main info */}
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: getAvatarColor(info.nombre),
              width: 48,
              height: 48,
            }}
          >
            {getInitials(info.nombre, info.apellido)}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Name and relationship type */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              {persona.es_referente_principal && (
                <Tooltip title="Referente Principal">
                  <StarIcon sx={{ color: "warning.main", fontSize: 20 }} />
                </Tooltip>
              )}
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {info.nombre} {info.apellido}
              </Typography>
              <Chip
                label={persona.tipo_vinculo_nombre}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>

            {/* DNI */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
              <BadgeIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                DNI: {formatDNI(info.dni)}
              </Typography>
            </Box>

            {/* Age */}
            {info.edad_calculada && (
              <Typography variant="body2" color="text.secondary">
                {info.edad_calculada} años
              </Typography>
            )}
          </Box>

          {/* Action buttons */}
          {!readOnly && (
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <Tooltip title="Editar">
                <IconButton size="small" onClick={onEdit}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Desvincular">
                <IconButton size="small" onClick={onDesvincular} color="error">
                  <LinkOffIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>

        {/* Status chips */}
        <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
          {persona.conviviente && (
            <Chip
              icon={<HomeIcon />}
              label="Conviviente"
              size="small"
              color="success"
              variant="outlined"
            />
          )}
          {persona.legalmente_responsable && (
            <Chip
              icon={<GavelIcon />}
              label="Legalmente Responsable"
              size="small"
              color="info"
              variant="outlined"
            />
          )}
          {persona.ocupacion && (
            <Chip label={persona.ocupacion} size="small" variant="outlined" />
          )}
        </Stack>

        {/* Legajo info if available */}
        {info.legajo && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              bgcolor: "grey.50",
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <FolderOpenIcon sx={{ color: "primary.main", fontSize: 20 }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Legajo: {info.legajo.numero}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Apertura: {new Date(info.legajo.fecha_apertura).toLocaleDateString("es-AR")}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Active measures */}
        {info.medidas_activas && info.medidas_activas.length > 0 && (
          <Box sx={{ mt: 1.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
              Medidas Activas:
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {info.medidas_activas.map((medida) => (
                <Chip
                  key={medida.id}
                  icon={<ShieldIcon />}
                  label={`${medida.tipo_medida} - ${medida.estado}`}
                  size="small"
                  color="warning"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* Phone if available */}
        {info.telefono && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
            <PhoneIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              {info.telefono}
            </Typography>
          </Box>
        )}

        {/* Observations */}
        {persona.observaciones && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, fontStyle: "italic" }}>
            {persona.observaciones}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * PersonasRelacionadasSection - Main component
 */
export default function PersonasRelacionadasSection({
  legajoId,
  nnyaId,
  readOnly = false,
  canEdit = true,
}: PersonasRelacionadasSectionProps) {
  // Debug log
  console.log(`[PersonasRelacionadasSection] legajoId: ${legajoId}, nnyaId: ${nnyaId}`)

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [desvincularModalOpen, setDesvincularModalOpen] = useState(false)
  const [selectedPersona, setSelectedPersona] = useState<PersonaVinculo | null>(null)

  const {
    personasRelacionadasActivas,
    referentePrincipal,
    isLoading,
    error,
    refetch,
  } = usePersonasRelacionadasManager(legajoId)

  const handleEdit = (persona: PersonaVinculo) => {
    setSelectedPersona(persona)
    setEditModalOpen(true)
  }

  const handleDesvincular = (persona: PersonaVinculo) => {
    setSelectedPersona(persona)
    setDesvincularModalOpen(true)
  }

  const handleCloseModals = () => {
    setAddModalOpen(false)
    setEditModalOpen(false)
    setDesvincularModalOpen(false)
    setSelectedPersona(null)
  }

  const handleSuccess = () => {
    handleCloseModals()
    refetch()
  }

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error">
        Error al cargar personas relacionadas. Por favor, intente nuevamente.
      </Alert>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Personas Relacionadas
        </Typography>
        {!readOnly && canEdit && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddModalOpen(true)}
            size="small"
          >
            Agregar
          </Button>
        )}
      </Box>

      {/* Referente Principal alert */}
      {referentePrincipal && (
        <Alert
          severity="info"
          icon={<StarIcon />}
          sx={{ mb: 2 }}
        >
          Referente Principal: {referentePrincipal.persona_destino_info.nombre}{" "}
          {referentePrincipal.persona_destino_info.apellido} ({referentePrincipal.tipo_vinculo_nombre})
        </Alert>
      )}

      {/* Content */}
      {personasRelacionadasActivas.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
          <PersonIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            No hay personas relacionadas registradas.
          </Typography>
          {!readOnly && canEdit && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setAddModalOpen(true)}
              sx={{ mt: 2 }}
            >
              Agregar Primera Persona
            </Button>
          )}
        </Paper>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              lg: "1fr 1fr 1fr",
            },
            gap: 2,
          }}
        >
          {personasRelacionadasActivas.map((persona) => (
            <PersonaRelacionadaCard
              key={persona.id}
              persona={persona}
              onEdit={() => handleEdit(persona)}
              onDesvincular={() => handleDesvincular(persona)}
              readOnly={readOnly || !canEdit}
            />
          ))}
        </Box>
      )}

      {/* Modals */}
      <AgregarPersonaRelacionadaModal
        open={addModalOpen}
        onClose={handleCloseModals}
        onSuccess={handleSuccess}
        legajoId={legajoId}
        nnyaId={nnyaId}
        existingRelaciones={personasRelacionadasActivas}
      />

      {selectedPersona && (
        <>
          <EditarPersonaRelacionadaModal
            open={editModalOpen}
            onClose={handleCloseModals}
            onSuccess={handleSuccess}
            legajoId={legajoId}
            persona={selectedPersona}
          />

          <DesvincularPersonaModal
            open={desvincularModalOpen}
            onClose={handleCloseModals}
            onSuccess={handleSuccess}
            legajoId={legajoId}
            persona={selectedPersona}
          />
        </>
      )}
    </Box>
  )
}
