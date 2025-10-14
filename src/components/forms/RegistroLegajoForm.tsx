"use client"

import React, { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Box,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Checkbox,
    Typography,
    Paper,
    Grid,
    CircularProgress,
    Alert,
} from "@mui/material"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3"
import { es } from "date-fns/locale"
import { create } from "@/app/api/apiService"
import { toast } from "react-toastify"

// Define the schema based on the API endpoint structure
const registroLegajoSchema = z.object({
    deleted: z.boolean().optional().default(false),
    nombre: z.string().min(1, "El nombre es requerido"),
    nombre_autopercibido: z.string().optional(),
    apellido: z.string().min(1, "El apellido es requerido"),
    fecha_nacimiento: z.date().optional(),
    fecha_defuncion: z.date().optional(),
    edad_aproximada: z.number().min(0, "La edad debe ser mayor o igual a 0").optional(),
    nacionalidad: z.enum(["ARGENTINA", "EXTRANJERA"], {
        errorMap: () => ({ message: "Seleccione una nacionalidad válida" }),
    }),
    dni: z.number().min(1, "El DNI debe ser mayor a 0").optional(),
    situacion_dni: z.enum([
        "EN_TRAMITE",
        "VENCIDO",
        "EXTRAVIADO",
        "INEXISTENTE",
        "VALIDO",
        "OTRO",
    ]),
    genero: z.enum(["MASCULINO", "FEMENINO", "OTRO", "NO_ESPECIFICA"], {
        errorMap: () => ({ message: "Seleccione un género válido" }),
    }),
    observaciones: z.string().optional(),
    adulto: z.boolean().default(true),
    nnya: z.boolean().default(false),
    telefono: z.number().optional(),
})

type RegistroLegajoFormData = z.infer<typeof registroLegajoSchema>

interface RegistroLegajoFormProps {
    onSuccess?: (data: any) => void
    onCancel?: () => void
    initialData?: Partial<RegistroLegajoFormData>
    isEditing?: boolean
    legajoId?: number
}

const RegistroLegajoForm: React.FC<RegistroLegajoFormProps> = ({
    onSuccess,
    onCancel,
    initialData,
    isEditing = false,
    legajoId,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    const {
        control,
        handleSubmit,
        formState: { errors, isDirty, isValid },
        reset,
        watch,
    } = useForm<RegistroLegajoFormData>({
        resolver: zodResolver(registroLegajoSchema),
        defaultValues: {
            deleted: false,
            nombre: "",
            nombre_autopercibido: "",
            apellido: "",
            fecha_nacimiento: undefined,
            fecha_defuncion: undefined,
            edad_aproximada: undefined,
            nacionalidad: "ARGENTINA",
            dni: undefined,
            situacion_dni: "VALIDO",
            genero: "NO_ESPECIFICA",
            observaciones: "",
            adulto: true,
            nnya: false,
            telefono: undefined,
            ...initialData,
        },
        mode: "onChange",
    })

    // Watch adulto and nnya to show/hide relevant fields
    const adultoValue = watch("adulto")
    const nnyaValue = watch("nnya")

    const onSubmit = async (data: RegistroLegajoFormData) => {
        setIsSubmitting(true)
        setSubmitError(null)

        try {
            // Transform the data to match API expectations
            const apiData = {
                ...data,
                fecha_nacimiento: data.fecha_nacimiento?.toISOString().split("T")[0],
                fecha_defuncion: data.fecha_defuncion?.toISOString().split("T")[0],
                // Convert undefined values to null for API compatibility
                edad_aproximada: data.edad_aproximada || null,
                dni: data.dni || null,
                telefono: data.telefono || null,
                nombre_autopercibido: data.nombre_autopercibido || null,
                observaciones: data.observaciones || null,
            }

            console.log("Enviando datos al API:", apiData)

            const response = await create("registro-legajo", apiData, true, "Legajo creado con éxito")

            toast.success("Legajo registrado exitosamente", {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "colored",
            })

            reset()
            onSuccess?.(response)
        } catch (error: any) {
            console.error("Error al crear legajo:", error)
            setSubmitError(
                error.response?.data?.message ||
                error.message ||
                "Error al registrar el legajo. Por favor, intente nuevamente."
            )
            toast.error("Error al registrar el legajo", {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "colored",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <Paper elevation={2} sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
                <Typography variant="h5" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
                    {isEditing ? "Editar Legajo" : "Registrar Nuevo Legajo"}
                </Typography>

                {submitError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {submitError}
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={3}>
                        {/* Información Personal */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom color="primary">
                                Información Personal
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="nombre"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Nombre *"
                                        fullWidth
                                        error={!!errors.nombre}
                                        helperText={errors.nombre?.message}
                                        variant="outlined"
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="apellido"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Apellido *"
                                        fullWidth
                                        error={!!errors.apellido}
                                        helperText={errors.apellido?.message}
                                        variant="outlined"
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="nombre_autopercibido"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Nombre Autopercibido"
                                        fullWidth
                                        error={!!errors.nombre_autopercibido}
                                        helperText={errors.nombre_autopercibido?.message}
                                        variant="outlined"
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="genero"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.genero}>
                                        <InputLabel>Género *</InputLabel>
                                        <Select {...field} label="Género *">
                                            <MenuItem value="MASCULINO">Masculino</MenuItem>
                                            <MenuItem value="FEMENINO">Femenino</MenuItem>
                                            <MenuItem value="OTRO">Otro</MenuItem>
                                            <MenuItem value="NO_ESPECIFICA">No Especifica</MenuItem>
                                        </Select>
                                        {errors.genero && (
                                            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                                                {errors.genero.message}
                                            </Typography>
                                        )}
                                    </FormControl>
                                )}
                            />
                        </Grid>

                        {/* Fechas */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                                Fechas
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="fecha_nacimiento"
                                control={control}
                                render={({ field }) => (
                                    <DatePicker
                                        {...field}
                                        label="Fecha de Nacimiento"
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                error: !!errors.fecha_nacimiento,
                                                helperText: errors.fecha_nacimiento?.message,
                                            },
                                        }}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="fecha_defuncion"
                                control={control}
                                render={({ field }) => (
                                    <DatePicker
                                        {...field}
                                        label="Fecha de Defunción"
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                error: !!errors.fecha_defuncion,
                                                helperText: errors.fecha_defuncion?.message,
                                            },
                                        }}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="edad_aproximada"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Edad Aproximada"
                                        type="number"
                                        fullWidth
                                        error={!!errors.edad_aproximada}
                                        helperText={errors.edad_aproximada?.message}
                                        variant="outlined"
                                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Documentación */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                                Documentación
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="dni"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="DNI"
                                        type="number"
                                        fullWidth
                                        error={!!errors.dni}
                                        helperText={errors.dni?.message}
                                        variant="outlined"
                                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="situacion_dni"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.situacion_dni}>
                                        <InputLabel>Situación DNI *</InputLabel>
                                        <Select {...field} label="Situación DNI *">
                                            <MenuItem value="EN_TRAMITE">En Trámite</MenuItem>
                                            <MenuItem value="VENCIDO">Vencido</MenuItem>
                                            <MenuItem value="EXTRAVIADO">Extraviado</MenuItem>
                                            <MenuItem value="INEXISTENTE">Inexistente</MenuItem>
                                            <MenuItem value="VALIDO">Válido</MenuItem>
                                            <MenuItem value="OTRO">Otro</MenuItem>
                                        </Select>
                                        {errors.situacion_dni && (
                                            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                                                {errors.situacion_dni.message}
                                            </Typography>
                                        )}
                                    </FormControl>
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="nacionalidad"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.nacionalidad}>
                                        <InputLabel>Nacionalidad *</InputLabel>
                                        <Select {...field} label="Nacionalidad *">
                                            <MenuItem value="ARGENTINA">Argentina</MenuItem>
                                            <MenuItem value="EXTRANJERA">Extranjera</MenuItem>
                                        </Select>
                                        {errors.nacionalidad && (
                                            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                                                {errors.nacionalidad.message}
                                            </Typography>
                                        )}
                                    </FormControl>
                                )}
                            />
                        </Grid>

                        {/* Contacto */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                                Contacto
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="telefono"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Teléfono"
                                        type="number"
                                        fullWidth
                                        error={!!errors.telefono}
                                        helperText={errors.telefono?.message}
                                        variant="outlined"
                                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Clasificación */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                                Clasificación
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="adulto"
                                control={control}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={field.value}
                                                onChange={field.onChange}
                                                color="primary"
                                            />
                                        }
                                        label="Adulto"
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="nnya"
                                control={control}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={field.value}
                                                onChange={field.onChange}
                                                color="primary"
                                            />
                                        }
                                        label="Niño, Niña o Adolescente"
                                    />
                                )}
                            />
                        </Grid>

                        {/* Observaciones */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                                Observaciones
                            </Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <Controller
                                name="observaciones"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Observaciones"
                                        multiline
                                        rows={4}
                                        fullWidth
                                        error={!!errors.observaciones}
                                        helperText={errors.observaciones?.message}
                                        variant="outlined"
                                    />
                                )}
                            />
                        </Grid>

                        {/* Botones */}
                        <Grid item xs={12}>
                            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 3 }}>
                                {onCancel && (
                                    <Button
                                        variant="outlined"
                                        onClick={onCancel}
                                        disabled={isSubmitting}
                                        sx={{ minWidth: 120 }}
                                    >
                                        Cancelar
                                    </Button>
                                )}
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={isSubmitting || !isValid}
                                    sx={{ minWidth: 120 }}
                                    startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                                >
                                    {isSubmitting ? "Guardando..." : isEditing ? "Actualizar" : "Registrar"}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </LocalizationProvider>
    )
}

export default RegistroLegajoForm
