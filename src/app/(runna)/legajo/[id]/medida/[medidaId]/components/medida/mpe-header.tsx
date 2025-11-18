"use client"

import type React from "react"
import { Box, Chip, Grid, Typography, Button, Paper, useTheme, Dialog, DialogTitle, DialogContent, IconButton, FormControl, InputLabel, Select, MenuItem } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import { ResidenciasTab } from "./mpe-tabs/residencias-tab"
import { useState } from "react"

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
}

export const MPEHeader: React.FC<MPEHeaderProps> = ({ medidaData, demandaData, estados, progreso, onFieldChange }) => {
    const theme = useTheme();
    const [residenciasModalOpen, setResidenciasModalOpen] = useState(false);
    const [tipoDispositivoMPE, setTipoDispositivoMPE] = useState(medidaData.tipo_dispositivo_mpe || '');
    const [subtipoDispositivoMPE, setSubtipoDispositivoMPE] = useState(medidaData.subtipo_dispositivo_mpe || '');

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
        } else if (tipoDispositivoMPE === 'ONG') {
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

    return (
        <Paper
            elevation={2}
            sx={{
                width: "100%",
                mb: 4,
                p: 3,
                borderRadius: 2,
            }}
        >
            {/* MPE Title */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {medidaData.tipo_display || "MPE"}: {medidaData.numero}
                </Typography>
            </Box>

            {/* Estado de Medida Section */}
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main" }}>
                        Estado de Medida
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {medidaData.urgencia && (
                            <Chip
                                label={`Urgencia: ${medidaData.urgencia}`}
                                color="error"
                                size="small"
                                sx={{ fontWeight: 500 }}
                            />
                        )}
                        {medidaData.estado_actual && (
                            <Chip
                                label={medidaData.estado_actual}
                                color="info"
                                size="small"
                                variant="outlined"
                                sx={{ fontWeight: 500 }}
                            />
                        )}
                    </Box>
                </Box>

                {/* Status Chips */}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                    <Chip
                        label="Inicial"
                        color={getChipColor(estados.inicial)}
                        variant={getChipVariant(estados.inicial)}
                        size="small"
                        sx={{ fontWeight: 500 }}
                    />
                    <Chip
                        label="Apertura"
                        color={getChipColor(estados.apertura)}
                        variant={getChipVariant(estados.apertura)}
                        size="small"
                        sx={{ fontWeight: 500 }}
                    />
                    <Chip
                        label={`Innovación ${estados.innovacion}`}
                        color={estados.innovacion > 0 ? "secondary" : "default"}
                        variant={estados.innovacion > 0 ? "filled" : "outlined"}
                        size="small"
                        sx={{ fontWeight: 500 }}
                    />
                    <Chip
                        label={`Prórroga ${estados.prorroga}`}
                        color={estados.prorroga > 0 ? "secondary" : "default"}
                        variant={estados.prorroga > 0 ? "filled" : "outlined"}
                        size="small"
                        sx={{ fontWeight: 500 }}
                    />
                    <Chip
                        label={`Cambio de lugar de resguardo ${estados.cambio_lugar}`}
                        color={estados.cambio_lugar > 0 ? "secondary" : "default"}
                        variant={estados.cambio_lugar > 0 ? "filled" : "outlined"}
                        size="small"
                        sx={{ fontWeight: 500 }}
                    />
                    <Chip
                        label="Seguimiento Intervención"
                        color="success"
                        variant={estados.seguimiento_intervencion ? "filled" : "outlined"}
                        size="small"
                        sx={{ fontWeight: 500 }}
                    />
                    <Chip
                        label="Cese"
                        color={getChipColor(estados.cese)}
                        variant={getChipVariant(estados.cese)}
                        size="small"
                        sx={{ fontWeight: 500 }}
                    />
                    <Chip
                        label="Post Cese"
                        color={getChipColor(estados.post_cese)}
                        variant={getChipVariant(estados.post_cese)}
                        size="small"
                        sx={{ fontWeight: 500 }}
                    />
                </Box>

                {/* Information Grid */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 1 }}>
                            <Typography variant="body2" sx={{ color: "primary.main", fontWeight: "bold" }}>
                                Fecha: {medidaData.fecha}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: "bold", color: "secondary.main" }}>
                                Juzgado: {medidaData.juzgado}
                            </Typography>
                        </Box>

                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>Fecha:</strong> {medidaData.fecha_resguardo}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>Lugar de resguardo:</strong> {medidaData.lugar_resguardo}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>Origen de la demanda:</strong> {medidaData.origen_demanda}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>Zona Uder de Trabajo:</strong> {medidaData.zona_trabajo}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>Zona Uder centro de vida:</strong> {medidaData.zona_centro_vida}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>Articulación con área local:</strong> {medidaData.articulacion_local ? "Sí" : "No"}
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Box sx={{ textAlign: { md: "right" } }}>
                            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: "primary.main" }}>
                                {medidaData.persona.nombre}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                <strong>Ubicación del NNyA:</strong> {medidaData.ubicacion}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                <strong>Número de Sac:</strong> {medidaData.numero_sac}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                <strong>Equipos:</strong> {medidaData.equipos}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                <strong>Articulación con área local:</strong> {medidaData.articulacion_area_local ? "Sí" : "No"}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                {/* MPE Specific Fields */}
                <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2, mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                        Información específica MPE
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Tipo de Dispositivo (MPE)</InputLabel>
                                <Select
                                    value={tipoDispositivoMPE}
                                    onChange={(e) => handleTipoDispositivoMPEChange(e.target.value)}
                                    label="Tipo de Dispositivo (MPE)"
                                >
                                    <MenuItem value="">Sin especificar</MenuItem>
                                    <MenuItem value="CENTRO_RESIDENCIAL">Centro Cuidado Residencial</MenuItem>
                                    <MenuItem value="ONG">ONG</MenuItem>
                                    <MenuItem value="FAMILIA_EXTENSA">Familia Extensa</MenuItem>
                                    <MenuItem value="FAMILIA_COMUNITARIA">Familia Comunitaria</MenuItem>
                                    <MenuItem value="FAMILIA_ACOGIMIENTO">Familia de Acogimiento</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Subtipo (MPE)</InputLabel>
                                <Select
                                    value={subtipoDispositivoMPE}
                                    onChange={(e) => {
                                        console.log('Subtipo onChange fired! Event value:', e.target.value);
                                        handleSubtipoDispositivoMPEChange(e.target.value);
                                    }}
                                    onOpen={() => console.log('Subtipo dropdown opened. tipoDispositivoMPE:', tipoDispositivoMPE, 'disabled:', !tipoDispositivoMPE)}
                                    label="Subtipo (MPE)"
                                    disabled={!tipoDispositivoMPE}
                                >
                                    <MenuItem key="empty" value="">Sin especificar</MenuItem>
                                    {getSubtipoOptions()}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Box>

                {/* Progress Section - 90 Day Timeline */}
                <Box sx={{ mb: 3 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            mb: 2,
                            color: getProgressColor(),
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}
                    >
                        Progreso de la Medida MPE
                        <Chip
                            label={progress.status === 'exceeded' ? 'EXCEDIDO' : progress.status === 'critical' ? 'CRÍTICO' : progress.status === 'warning' ? 'ATENCIÓN' : 'NORMAL'}
                            size="small"
                            sx={{
                                backgroundColor: getProgressColor(),
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                            }}
                        />
                    </Typography>

                    {/* Progress Information */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                        flexWrap: 'wrap',
                        gap: 2
                    }}>
                        <Box>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                Días transcurridos
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: getProgressColor() }}>
                                {progress.daysElapsed} <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>de 90</Typography>
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                Días restantes
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: getProgressColor() }}>
                                {progress.daysRemaining}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Modern Progress Bar */}
                    <Box sx={{
                        position: 'relative',
                        backgroundColor: getProgressBackgroundColor(),
                        borderRadius: 3,
                        p: 2,
                        border: `2px solid ${getProgressColor()}`,
                    }}>
                        <Box sx={{
                            position: 'relative',
                            height: 32,
                            backgroundColor: 'rgba(0, 0, 0, 0.05)',
                            borderRadius: 2,
                            overflow: 'hidden',
                            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
                        }}>
                            {/* Progress Fill */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    bottom: 0,
                                    width: `${progress.percentage}%`,
                                    backgroundColor: getProgressColor(),
                                    transition: 'width 0.5s ease-in-out',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                    paddingRight: 2,
                                    background: `linear-gradient(90deg, ${getProgressColor()} 0%, ${getProgressColor()}dd 100%)`,
                                    boxShadow: `0 0 10px ${getProgressColor()}44`,
                                }}
                            >
                                {progress.percentage > 10 && (
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            fontWeight: 700,
                                            color: 'white',
                                            fontSize: '0.9rem',
                                            textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                        }}
                                    >
                                        {Math.round(progress.percentage)}%
                                    </Typography>
                                )}
                            </Box>

                            {/* Percentage outside bar if too small */}
                            {progress.percentage <= 10 && (
                                <Typography
                                    variant="caption"
                                    sx={{
                                        position: 'absolute',
                                        right: 8,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        fontWeight: 700,
                                        color: getProgressColor(),
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    {Math.round(progress.percentage)}%
                                </Typography>
                            )}
                        </Box>

                        {/* Status Message */}
                        <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'center' }}>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: getProgressColor(),
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    textAlign: 'center'
                                }}
                            >
                                {progress.status === 'exceeded' && '⚠️ El plazo de 90 días ha sido excedido'}
                                {progress.status === 'critical' && '🚨 Quedan menos de 15 días para completar la medida'}
                                {progress.status === 'warning' && '⏰ Quedan menos de 30 días - Acción requerida pronto'}
                                {progress.status === 'normal' && '✓ La medida se encuentra dentro del plazo establecido'}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Action Button */}
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => setResidenciasModalOpen(true)}
                    sx={{
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
                        fontSize: "1rem"
                    }}
                >
                    SEGUIMIENTO EN DISPOSITIVO
                </Button>
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
        </Paper>
    )
} 