"use client"

import type React from "react"
import { Box, Chip, Grid, Typography, Button, Paper, useTheme, Dialog, DialogTitle, DialogContent, IconButton, FormControl, InputLabel, Select, MenuItem } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import CancelIcon from "@mui/icons-material/Cancel"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import BusinessIcon from "@mui/icons-material/Business"
import AssignmentLateIcon from "@mui/icons-material/AssignmentLate"
import GroupIcon from "@mui/icons-material/Group"
import EngineeringIcon from "@mui/icons-material/Engineering"
import HubIcon from "@mui/icons-material/Hub"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import HomeIcon from "@mui/icons-material/Home"
import GavelIcon from "@mui/icons-material/Gavel"
import AccountBalanceIcon from "@mui/icons-material/AccountBalance"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"
import PersonIcon from "@mui/icons-material/Person"
import AssignmentIcon from "@mui/icons-material/Assignment"
import WarningIcon from "@mui/icons-material/Warning"
import { ResidenciasTab } from "./mpe-tabs/residencias-tab"
import { useState } from "react"
import { useUser } from "@/utils/auth/userZustand"
import { useCeseMedida } from "../../hooks/useCeseMedida"
import { CeseMedidaModal } from "./cese-medida-modal"
import { Divider, Stack } from "@mui/material"

interface MPEHeaderProps {
    medidaData: {
        numero: string
        fecha: string
        fecha_apertura?: string
        fecha_creacion_raw?: string
        tipo_display?: string
        juzgado: string
        fecha_resguardo: string
        lugar_resguardo: string
        origen_demanda: string
        zona_trabajo: string
        zona_centro_vida: string
        articulacion_local: boolean
        persona: {
            nombre: string
            id?: number
        }
        ubicacion: string
        numero_sac: string
        equipos: string
        articulacion_area_local: boolean
        urgencia?: string
        estado_actual?: string
        tipo_dispositivo_mpe?: string
        subtipo_dispositivo_mpe?: string
    }
    /** Medida ID for API calls */
    medidaId?: number
    /** Estado de vigencia (VIGENTE, CERRADA, etc.) */
    estadoVigencia?: string
    /** Etapa actual de la medida */
    etapaActual?: {
        tipo_etapa?: string
        estado?: string
    }
    demandaData?: any // Full demanda data from the full-detail endpoint
    estados: {
        inicial: boolean
        apertura: boolean
        innovacion: number
        prorroga: number
        cambio_lugar: number
        seguimiento_intervencion: boolean
        cese: boolean
        post_cese: boolean
    }
    progreso: {
        iniciada: number
        en_seguimiento: number
        cierre: number
        total: number
    }
    onFieldChange?: (field: string, value: string) => void
    /** Callback to refresh medida data after cese */
    onMedidaRefetch?: () => void
}

export const MPEHeader: React.FC<MPEHeaderProps> = ({
    medidaData,
    medidaId,
    estadoVigencia,
    etapaActual,
    demandaData,
    estados,
    progreso,
    onFieldChange,
    onMedidaRefetch,
}) => {
    const theme = useTheme();
    const [residenciasModalOpen, setResidenciasModalOpen] = useState(false);
    const [ceseModalOpen, setCeseModalOpen] = useState(false);
    const [tipoDispositivoMPE, setTipoDispositivoMPE] = useState(medidaData.tipo_dispositivo_mpe || '');
    const [subtipoDispositivoMPE, setSubtipoDispositivoMPE] = useState(medidaData.subtipo_dispositivo_mpe || '');

    // Get user data for permission check
    const { user } = useUser();
    const isSuperuser = user?.is_superuser || false;
    const isJZ = user?.zonas?.some(z => z.jefe) || false;
    const canCesarMedida = isSuperuser || isJZ;

    // Determine if medida is in CESE etapa (for Flow B)
    const esEtapaCese = etapaActual?.tipo_etapa === 'CESE';

    // Determine if cese button should be visible
    const showCeseButton = estadoVigencia === 'VIGENTE' && canCesarMedida && medidaId;

    // Cese medida hook
    const { solicitarCese, isSolicitandoCese } = useCeseMedida({
        medidaId: medidaId || 0,
        onSuccess: () => {
            setCeseModalOpen(false);
            onMedidaRefetch?.();
        },
    });

    // Handle cese confirmation
    const handleCeseConfirm = async (observaciones: string, cancelarActividades: boolean) => {
        await solicitarCese(observaciones, cancelarActividades);
    };

    const handleTipoDispositivoMPEChange = (value: string) => {
        console.log('MPE Tipo changed to:', value);
        setTipoDispositivoMPE(value);
        setSubtipoDispositivoMPE(''); // Reset subtipo when tipo changes
        onFieldChange?.('tipo_dispositivo_mpe', value);
    };

    const handleSubtipoDispositivoMPEChange = (value: string) => {
        console.log('MPE Subtipo changed to:', value);
        setSubtipoDispositivoMPE(value);
        onFieldChange?.('subtipo_dispositivo_mpe', value);
    };

    // Log current state for debugging
    console.log('MPEHeader render - tipoDispositivoMPE:', tipoDispositivoMPE, 'subtipoDispositivoMPE:', subtipoDispositivoMPE);

    // Generate subtipo options based on tipo
    const getSubtipoOptions = () => {
        const options: JSX.Element[] = [];

        if (tipoDispositivoMPE === 'CENTRO_RESIDENCIAL') {
            options.push(
                <MenuItem key="ACHÁVAL_RODRIGUEZ" value="ACHÁVAL_RODRIGUEZ">Achával Rodriguez</MenuItem>,
                <MenuItem key="ALFONORNI" value="ALFONORNI">Alfonsina Storni</MenuItem>,
                <MenuItem key="ANTONIO_VISO" value="ANTONIO_VISO">Antonio Del Viso</MenuItem>,
                <MenuItem key="ARGÜELLO_INFANCIA" value="ARGÜELLO_INFANCIA">Argüello Infancia</MenuItem>,
                <MenuItem key="ARGÜELLO_MUJERES" value="ARGÜELLO_MUJERES">Argüello Mujeres</MenuItem>,
                <MenuItem key="BAIGORRI" value="BAIGORRI">Baigorri</MenuItem>,
                <MenuItem key="CASA_SUQUÍA" value="CASA_SUQUÍA">Casa Suquía</MenuItem>,
                <MenuItem key="CHE_GUEVARA" value="CHE_GUEVARA">Che Guevara</MenuItem>,
                <MenuItem key="EVA_PERÓN" value="EVA_PERÓN">Eva Perón</MenuItem>,
                <MenuItem key="INFANTOJUVENIL_SF" value="INFANTOJUVENIL_SF">Infanto Juvenil San Francisco</MenuItem>,
                <MenuItem key="LONIOS" value="LONIOS">Lonios</MenuItem>,
                <MenuItem key="RÍO_BAMBA" value="RÍO_BAMBA">Río Bamba</MenuItem>,
                <MenuItem key="INFANTOJUVENIL_RC" value="INFANTOJUVENIL_RC">Infanto Juvenil Río Cuarto</MenuItem>,
                <MenuItem key="SANTA_CRUZ" value="SANTA_CRUZ">Santa Cruz</MenuItem>,
                <MenuItem key="FELISA_SOAJE" value="FELISA_SOAJE">Felisa Soaje</MenuItem>,
                <MenuItem key="WENCESLAO_ESCALANTE" value="WENCESLAO_ESCALANTE">Wenceslao Escalante</MenuItem>
            );
        } else if (tipoDispositivoMPE === 'OGA') {
            options.push(
                <MenuItem key="SIERRA_DORADA" value="SIERRA_DORADA">Fundación Sierra Dorada San Marcos Sierras</MenuItem>,
                <MenuItem key="DESDE_CORAZON" value="DESDE_CORAZON">Asociación Civil Hogar De Niños Desde El Corazón</MenuItem>,
                <MenuItem key="ANGELES_CUSTODIOS" value="ANGELES_CUSTODIOS">Asociación Civil De Los Santos Ángeles Custodios</MenuItem>,
                <MenuItem key="CIUDAD_NIÑOS" value="CIUDAD_NIÑOS">Fundación San Martín De Porres - Hogar Ciudad De Los Niños</MenuItem>,
                <MenuItem key="GRANJA_SIQUEM" value="GRANJA_SIQUEM">Asociación Civil Granja Siquem</MenuItem>,
                <MenuItem key="ANGEL_GUARDA" value="ANGEL_GUARDA">Asociación Civil Nuestra Señora - Hogar De Niños Ángel De La Guarda</MenuItem>,
                <MenuItem key="BETHEL" value="BETHEL">Asociación Civil Bethel Casas De Dios</MenuItem>,
                <MenuItem key="MADRE_TERESA" value="MADRE_TERESA">Asociación Civil Hogar De María Madre Teresa De Calcuta</MenuItem>,
                <MenuItem key="ALDEAS_SOS" value="ALDEAS_SOS">Asociación Civil Aldeas Infantiles S.O.S Argentina</MenuItem>,
                <MenuItem key="BETHEL_EVANG" value="BETHEL_EVANG">Fundación Evangélica Hogar De Niños Bethel</MenuItem>,
                <MenuItem key="JOSE_BAINOTTI" value="JOSE_BAINOTTI">Fundación Manos Abiertas Hogar De Niños Jose Bainotti</MenuItem>,
                <MenuItem key="SAN_JOSE_MALDONADO" value="SAN_JOSE_MALDONADO">Fundación Moviendo Montañas. Casa San José Maldonado</MenuItem>,
                <MenuItem key="BROCHERO" value="BROCHERO">Fundación Moviendo Montañas. Casa Brochero</MenuItem>,
                <MenuItem key="NAZARETH" value="NAZARETH">Fundación Moviendo Montañas. Casa Nazareth El Diquecito</MenuItem>,
                <MenuItem key="CASA_SAN_JOSE" value="CASA_SAN_JOSE">Asociación Civil Dando Se Recibe &quot;Casa San Jose&quot;</MenuItem>,
                <MenuItem key="CASA_SAN_FRANCISCO" value="CASA_SAN_FRANCISCO">Asociación Civil Dando Se Recibe &quot;Casa San Francisco&quot;</MenuItem>,
                <MenuItem key="BERTI" value="BERTI">Hogar De Candelaria Berti - Dependencia Municipalidad De Rio III</MenuItem>,
                <MenuItem key="REMAR" value="REMAR">Asociación Civil Remar Argentina</MenuItem>,
                <MenuItem key="SAN_ALBERTO" value="SAN_ALBERTO">Instituto De Vida Consagrada Hogar San Alberto</MenuItem>,
                <MenuItem key="FUSANA" value="FUSANA">Fusana</MenuItem>
            );
        }

        console.log('getSubtipoOptions called - tipo:', tipoDispositivoMPE, 'options count:', options.length);
        return options;
    };

    // Calculate progress based on fecha_creacion_raw and 90-day limit
    const calculateMPEProgress = () => {
        const MAX_DAYS = 90;

        // Use raw ISO date if available, otherwise fall back to formatted dates
        const fechaCreacion = medidaData.fecha_creacion_raw || medidaData.fecha_apertura || medidaData.fecha;

        console.log('MPE Progress Debug:', {
            fecha_creacion_raw: medidaData.fecha_creacion_raw,
            fecha_apertura: medidaData.fecha_apertura,
            fecha: medidaData.fecha,
            fechaCreacion,
        });

        if (!fechaCreacion) {
            console.warn('No creation date available for MPE progress calculation');
            return { percentage: 0, daysElapsed: 0, daysRemaining: MAX_DAYS, status: 'pending' as const };
        }

        const creationDate = new Date(fechaCreacion);

        // Check if date is valid
        if (isNaN(creationDate.getTime())) {
            console.error('Invalid date:', fechaCreacion);
            return { percentage: 0, daysElapsed: 0, daysRemaining: MAX_DAYS, status: 'pending' as const };
        }

        const today = new Date();

        // Reset time parts to get accurate day difference
        creationDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        const diffTime = today.getTime() - creationDate.getTime();
        const daysElapsed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const daysRemaining = Math.max(MAX_DAYS - daysElapsed, 0);
        const percentage = Math.min((daysElapsed / MAX_DAYS) * 100, 100);

        console.log('MPE Progress Calculated:', {
            daysElapsed,
            daysRemaining,
            percentage: Math.round(percentage)
        });

        // Determine status based on days remaining
        let status: 'normal' | 'warning' | 'critical' | 'exceeded';
        if (percentage >= 100) {
            status = 'exceeded';
        } else if (daysRemaining <= 15) {
            status = 'critical';
        } else if (daysRemaining <= 30) {
            status = 'warning';
        } else {
            status = 'normal';
        }

        return { percentage, daysElapsed, daysRemaining, status };
    };

    const progress = calculateMPEProgress();

    const getProgressColor = () => {
        switch (progress.status) {
            case 'exceeded':
                return theme.palette.error.main;
            case 'critical':
                return theme.palette.error.main;
            case 'warning':
                return theme.palette.warning.main;
            case 'normal':
            default:
                return theme.palette.success.main;
        }
    };

    const getProgressBackgroundColor = () => {
        switch (progress.status) {
            case 'exceeded':
                return 'rgba(211, 47, 47, 0.1)';
            case 'critical':
                return 'rgba(211, 47, 47, 0.1)';
            case 'warning':
                return 'rgba(237, 108, 2, 0.1)';
            case 'normal':
            default:
                return 'rgba(46, 125, 50, 0.1)';
        }
    };

    const getChipColor = (active: boolean, count?: number) => {
        if (count !== undefined) {
            return count > 0 ? "primary" : "default"
        }
        return active ? "primary" : "default"
    }

    const getChipVariant = (active: boolean, count?: number) => {
        if (count !== undefined) {
            return count > 0 ? "filled" : "outlined"
        }
        return active ? "filled" : "outlined"
    }

    // Helper for info items
    const InfoItem = ({ icon: Icon, label, value }: any) => (
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 1.5 }}>
            <Icon sx={{ color: "primary.main", fontSize: "1.1rem", mt: 0.2 }} />
            <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500, display: "block", lineHeight: 1.2 }}>
                    {label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: value ? "text.primary" : "text.disabled" }}>
                    {value || "No especificado"}
                </Typography>
            </Box>
        </Box>
    )

    return (
        <Paper
            elevation={3}
            sx={{
                width: "100%",
                mb: 4,
                borderRadius: 3,
                position: "relative",
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                "&::before": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: "6px",
                    backgroundColor: estadoVigencia === 'VIGENTE' ? "primary.main" : "text.disabled",
                    background: estadoVigencia === 'VIGENTE' ? "linear-gradient(to bottom, #2196f3, #1565c0)" : "linear-gradient(to bottom, #9e9e9e, #616161)",
                },
            }}
        >
            {/* Header section with title and badges */}
            <Box sx={{ p: 2.5, pb: 2, bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "grey.100" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
                    <Box>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
                            <AssignmentIcon color="primary" sx={{ fontSize: "1.5rem" }} />
                            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.01em" }}>
                                {medidaData.tipo_display || "MPE"} {medidaData.numero}
                            </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                            <Chip
                                label={estadoVigencia === 'VIGENTE' ? "ACTIVA" : "CERRADA"}
                                color={estadoVigencia === 'VIGENTE' ? "primary" : "default"}
                                size="small"
                                variant={estadoVigencia === 'VIGENTE' ? "filled" : "outlined"}
                                sx={{ fontWeight: 700, fontSize: "0.65rem", height: 20 }}
                            />
                            {medidaData.urgencia && (
                                <Chip
                                    icon={<WarningIcon style={{ fontSize: '0.8rem', color: 'inherit' }} />}
                                    label={`Urgencia: ${medidaData.urgencia.toUpperCase()}`}
                                    color={medidaData.urgencia.toLowerCase().includes('alta') ? "error" : "warning"}
                                    size="small"
                                    sx={{ fontWeight: 700, fontSize: "0.65rem", height: 20 }}
                                />
                            )}
                            {medidaData.estado_actual && (
                                <Chip
                                    label={medidaData.estado_actual}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontWeight: 600, fontSize: "0.65rem", height: 20, color: "text.secondary" }}
                                />
                            )}
                        </Stack>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => setResidenciasModalOpen(true)}
                            sx={{
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: "0.75rem",
                                boxShadow: "none",
                                "&:hover": { boxShadow: "0 2px 8px rgba(33, 150, 243, 0.3)" }
                            }}
                        >
                            Seguimiento Dispositivo
                        </Button>
                        {showCeseButton && (
                            <Button
                                variant="contained"
                                color={esEtapaCese ? "error" : "warning"}
                                size="small"
                                startIcon={esEtapaCese ? <CheckCircleIcon /> : <CancelIcon />}
                                onClick={() => setCeseModalOpen(true)}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: "none",
                                    fontWeight: 600,
                                    fontSize: "0.75rem",
                                    boxShadow: "none",
                                }}
                            >
                                {esEtapaCese ? "Confirmar Cese" : "Solicitar Cese"}
                            </Button>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* Main Content */}
            <Box sx={{ p: 2.5, pt: 3 }}>
                {/* Child Name Section - More Prominent */}
                <Box sx={{ mb: 3.5, pl: 1 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: "12px",
                                bgcolor: "primary.light",
                                color: "primary.main",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: 0.15
                            }}
                        >
                            <PersonIcon sx={{ fontSize: "2rem" }} />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary", mb: 0.2 }}>
                                {medidaData.persona.nombre}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, letterSpacing: "0.02em" }}>
                                Legajo Asociado: <Typography component="span" variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>#{medidaData.persona.id || 'N/A'}</Typography>
                            </Typography>
                        </Box>
                    </Stack>
                </Box>

                {/* Status Chips Row */}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3.5, pl: 1 }}>
                    <Chip label="Inicial" color={getChipColor(estados.inicial)} variant={getChipVariant(estados.inicial)} size="small" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
                    <Chip label="Apertura" color={getChipColor(estados.apertura)} variant={getChipVariant(estados.apertura)} size="small" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
                    <Chip label={`Innovación ${estados.innovacion}`} color={estados.innovacion > 0 ? "secondary" : "default"} variant={estados.innovacion > 0 ? "filled" : "outlined"} size="small" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
                    <Chip label={`Prórroga ${estados.prorroga}`} color={estados.prorroga > 0 ? "secondary" : "default"} variant={estados.prorroga > 0 ? "filled" : "outlined"} size="small" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
                    <Chip label={`Resguardo ${estados.cambio_lugar}`} color={estados.cambio_lugar > 0 ? "secondary" : "default"} variant={estados.cambio_lugar > 0 ? "filled" : "outlined"} size="small" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
                    <Chip label="Seguimiento" color="success" variant={estados.seguimiento_intervencion ? "filled" : "outlined"} size="small" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
                    <Chip label="Cese" color={getChipColor(estados.cese)} variant={getChipVariant(estados.cese)} size="small" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
                    <Chip label="Post Cese" color={getChipColor(estados.post_cese)} variant={getChipVariant(estados.post_cese)} size="small" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
                </Box>

                <Divider sx={{ mb: 3.5, opacity: 0.6 }} />

                <Grid container spacing={4} sx={{ px: 1, mb: 4 }}>
                    {/* Column 1: Record Info */}
                    <Grid item xs={12} md={4}>
                        <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 800, mb: 2, display: "block", opacity: 0.8 }}>
                            Detalles de la Medida
                        </Typography>
                        <InfoItem icon={CalendarTodayIcon} label="Fecha de Apertura" value={medidaData.fecha_apertura || medidaData.fecha} />
                        <InfoItem icon={BusinessIcon} label="Origen de la Demanda" value={medidaData.origen_demanda} />
                        <InfoItem icon={AssignmentLateIcon} label="Zona de Trabajo" value={medidaData.zona_trabajo} />
                    </Grid>

                    {/* Column 2: Intervention/Teams */}
                    <Grid item xs={12} md={4}>
                        <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 800, mb: 2, display: "block", opacity: 0.8 }}>
                            Equipos e Intervención
                        </Typography>
                        <InfoItem icon={EngineeringIcon} label="Equipo Responsable" value={medidaData.equipos} />
                        <InfoItem icon={HubIcon} label="Zona Centro de Vida" value={medidaData.zona_centro_vida} />
                        <InfoItem icon={HubIcon} label="Articulación Local" value={medidaData.articulacion_local ? "Sí" : "No"} />
                    </Grid>

                    {/* Column 3: Location/Legal */}
                    <Grid item xs={12} md={4}>
                        <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 800, mb: 2, display: "block", opacity: 0.8 }}>
                            Ubicación y Resguardo
                        </Typography>
                        <InfoItem icon={LocationOnIcon} label="Ubicación del NNyA" value={medidaData.ubicacion} />
                        <InfoItem icon={HomeIcon} label="Lugar de Resguardo" value={medidaData.lugar_resguardo} />
                        <InfoItem icon={AccountBalanceIcon} label="Expediente (Nro. SAC)" value={medidaData.numero_sac} />
                    </Grid>
                </Grid>

                {/* Progress Section - 90 Day Timeline */}
                <Box sx={{ mb: 4, px: 1 }}>
                    <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 800, mb: 2, display: "block", opacity: 0.8 }}>
                        Cronograma de Plazos (90 Días)
                    </Typography>

                    <Box sx={{
                        position: 'relative',
                        backgroundColor: getProgressBackgroundColor(),
                        borderRadius: 3,
                        p: 2.5,
                        border: `1px solid ${getProgressColor()}`,
                        boxShadow: `0 4px 12px ${getProgressColor()}15`
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Box>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Días Transcurridos</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: getProgressColor() }}>{progress.daysElapsed} <Typography component="span" variant="body2" sx={{ opacity: 0.7 }}>/ 90</Typography></Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Estado del Plazo</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: getProgressColor() }}>
                                    {progress.status === 'exceeded' ? 'EXCEDIDO' : `${progress.daysRemaining} DÍAS RESTANTES`}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ height: 12, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 6, overflow: 'hidden', mb: 2 }}>
                            <Box sx={{
                                width: `${progress.percentage}%`,
                                height: '100%',
                                backgroundColor: getProgressColor(),
                                borderRadius: 6,
                                transition: 'width 1s ease-in-out'
                            }} />
                        </Box>

                        <Typography variant="body2" sx={{ color: getProgressColor(), fontWeight: 700, fontSize: '0.85rem', textAlign: 'center' }}>
                            {progress.status === 'exceeded' && '⚠️ El plazo legal de 90 días ha sido superado.'}
                            {progress.status === 'critical' && '🚨 ALERTA: Plazo crítico para la medida.'}
                            {progress.status === 'warning' && '⏰ Atención: El plazo está próximo a vencer.'}
                            {progress.status === 'normal' && '✓ La medida se encuentra dentro de los plazos legales.'}
                        </Typography>
                    </Box>
                </Box>

                {/* MPE Device Selection Section */}
                <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: "grey.50", border: "1px solid", borderColor: "grey.200" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2.5, color: 'primary.dark', display: "flex", alignItems: "center", gap: 1 }}>
                        <HomeIcon sx={{ fontSize: "1.2rem" }} /> Configuración de Dispositivo MPE
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth size="small" sx={{ bgcolor: "background.paper" }}>
                                <InputLabel>Tipo de Dispositivo</InputLabel>
                                <Select
                                    value={tipoDispositivoMPE}
                                    onChange={(e) => handleTipoDispositivoMPEChange(e.target.value)}
                                    label="Tipo de Dispositivo"
                                    sx={{ borderRadius: 2 }}
                                >
                                    <MenuItem value="">Sin especificar</MenuItem>
                                    <MenuItem value="CENTRO_RESIDENCIAL">Centro Cuidado Residencial</MenuItem>
                                    <MenuItem value="OGA">OGA</MenuItem>
                                    <MenuItem value="FAMILIA_EXTENSA">Familia Extensa</MenuItem>
                                    <MenuItem value="FAMILIA_COMUNITARIA">Familia Comunitaria</MenuItem>
                                    <MenuItem value="FAMILIA_ACOGIMIENTO">Familia de Acogimiento</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth size="small" sx={{ bgcolor: "background.paper" }}>
                                <InputLabel>Institución / Familia (Subtipo)</InputLabel>
                                <Select
                                    value={subtipoDispositivoMPE}
                                    onChange={(e) => handleSubtipoDispositivoMPEChange(e.target.value)}
                                    label="Institución / Familia (Subtipo)"
                                    disabled={!tipoDispositivoMPE}
                                    sx={{ borderRadius: 2 }}
                                >
                                    <MenuItem key="empty" value="">Sin especificar</MenuItem>
                                    {getSubtipoOptions()}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Box>
            </Box>

            {/* Residencias Modal */}
            <Dialog
                open={residenciasModalOpen}
                onClose={() => setResidenciasModalOpen(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        maxHeight: '90vh'
                    }
                }}
            >
                <DialogTitle sx={{
                    textAlign: 'center',
                    fontWeight: 600,
                    fontSize: '1.5rem',
                    position: 'relative',
                    pb: 1,
                    borderBottom: '1px solid #e0e0e0'
                }}>
                    SEGUIMIENTO EN DISPOSITIVO
                    <IconButton
                        onClick={() => setResidenciasModalOpen(false)}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: 'grey.500',
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0, overflow: 'auto' }}>
                    <ResidenciasTab
                        demandaData={demandaData}
                        personaId={medidaData.persona?.id}
                    />
                </DialogContent>
            </Dialog>

            {/* Cese Medida Modal */}
            {medidaId && (
                <CeseMedidaModal
                    open={ceseModalOpen}
                    onClose={() => setCeseModalOpen(false)}
                    tipoMedida="MPE"
                    esEtapaCese={esEtapaCese}
                    onConfirm={handleCeseConfirm}
                    isLoading={isSolicitandoCese}
                />
            )}
        </Paper>
    )
} 