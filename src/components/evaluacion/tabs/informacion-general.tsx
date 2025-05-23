"use client"

import { Paper, Typography, Box, TextField, Grid, Chip, List, ListItem, ListItemText } from "@mui/material"

interface InformacionGeneralProps {
  data: any
}

export default function InformacionGeneral({ data }: InformacionGeneralProps) {
  // Handle nested objects for various fields
  const localidad = typeof data.localidad === "object" && data.localidad ? data.localidad.nombre : data.Localidad || ""
  const institucion =
    typeof data.institucion === "object" && data.institucion ? data.institucion.nombre : data.Institucion || ""
  const tipoInstitucion =
    typeof data.tipo_institucion === "object" && data.tipo_institucion
      ? data.tipo_institucion.nombre
      : data.TipoInstitucion || ""

  // Handle etiqueta as object or string
  const etiquetaValue =
    typeof data.etiqueta === "object" && data.etiqueta
      ? data.etiqueta.nombre
      : typeof data.etiqueta === "string"
        ? data.etiqueta
        : ""

  // Handle motivo_ingreso as object or string
  const motivoIngreso =
    typeof data.motivo_ingreso === "object" && data.motivo_ingreso
      ? data.motivo_ingreso.nombre
      : data.motivo_ingreso || ""

  // Handle submotivo_ingreso as object or string
  const submotivoIngreso =
    typeof data.submotivo_ingreso === "object" && data.submotivo_ingreso
      ? data.submotivo_ingreso.nombre
      : data.submotivo_ingreso || ""

  // Handle tipo_demanda as object or string
  const tipoDemanda =
    typeof data.tipo_demanda === "object" && data.tipo_demanda ? data.tipo_demanda.nombre : data.tipo_demanda || ""

  // Handle objetivo_de_demanda as object or string
  const objetivoDemanda =
    typeof data.objetivo_de_demanda === "object" && data.objetivo_de_demanda
      ? data.objetivo_de_demanda.nombre
      : data.objetivo_de_demanda || ""

  // Handle remitente data
  const remitente =
    typeof data.remitente === "object" && data.remitente
      ? `${data.remitente.nombre || ""} ${data.remitente.apellido || ""}`.trim()
      : data.BloqueDatosRemitente || ""

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Información General
      </Typography>

      <Grid container spacing={3}>
        {/* Columna izquierda */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 2 }}>
            <TextField label="Localidad" name="Localidad" value={localidad} InputProps={{ readOnly: true }} fullWidth />
            <TextField
              label="Fecha"
              name="Fecha"
              value={data.fecha || data.Fecha || ""}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextField
              label="Cargo/Función"
              name="CargoFuncion"
              value={data.cargo_funcion || data.CargoFuncion || ""}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextField
              label="Nombre y Apellido"
              name="NombreApellido"
              value={data.nombre_apellido || data.NombreApellido || ""}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextField
              label="Número de Demanda"
              name="NumerosDemanda"
              value={data.numero_demanda || data.NumerosDemanda || data.id || ""}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextField
              label="Remitente"
              name="BloqueDatosRemitente"
              value={remitente}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextField
              label="Tipo Institución"
              name="TipoInstitucion"
              value={tipoInstitucion}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextField
              label="Institución"
              name="Institucion"
              value={institucion}
              InputProps={{ readOnly: true }}
              fullWidth
            />
          </Box>

          {/* Observaciones movidas a la columna izquierda */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Observaciones
            </Typography>
            <TextField
              value={data.observaciones || ""}
              fullWidth
              multiline
              rows={5}
              margin="dense"
              InputProps={{ readOnly: true }}
            />
          </Box>
        </Grid>

        {/* Columna derecha */}
        <Grid item xs={12} md={6}>
          {/* Fechas */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Fechas
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Fecha Oficio/Documento"
                  value={data.fecha_oficio_documento || ""}
                  fullWidth
                  margin="dense"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Fecha Ingreso SENAF"
                  value={data.fecha_ingreso_senaf || ""}
                  fullWidth
                  margin="dense"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Etiqueta */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Etiqueta
            </Typography>
            {etiquetaValue && (
              <Chip
                label={etiquetaValue.toUpperCase()}
                color={etiquetaValue.toLowerCase() === "urgente" ? "error" : "default"}
                size="small"
                sx={{ mt: 1 }}
              />
            )}
          </Box>

          {/* Códigos de Demanda */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Códigos de Demanda
            </Typography>
            {data.codigos_demanda && typeof data.codigos_demanda === "object" && data.codigos_demanda.length > 0 ? (
              <List dense>
                {data.codigos_demanda.map((codigo: any, index: number) => (
                  <ListItem key={index} disablePadding>
                    <ListItemText
                      primary={`Código: ${typeof codigo.codigo === "object" ? codigo.codigo.nombre : codigo.codigo}`}
                      secondary={`Tipo: ${typeof codigo.tipo_codigo === "object" ? codigo.tipo_codigo.nombre : codigo.tipo_codigo}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No hay códigos de demanda registrados
              </Typography>
            )}
          </Box>

          {/* Clasificación */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Clasificación
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Tipo de Demanda"
                  value={tipoDemanda}
                  fullWidth
                  margin="dense"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Objetivo de Demanda"
                  value={objetivoDemanda}
                  fullWidth
                  margin="dense"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Motivo Ingreso"
                  value={motivoIngreso}
                  fullWidth
                  margin="dense"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Submotivo Ingreso"
                  value={submotivoIngreso}
                  fullWidth
                  margin="dense"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  )
}
