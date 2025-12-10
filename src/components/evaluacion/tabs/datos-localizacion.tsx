"use client"

import { Paper, Typography, Box, TextField, Grid } from "@mui/material"

interface DatosLocalizacionProps {
  data: any
}

export default function DatosLocalizacion({ data }: DatosLocalizacionProps) {
  // Extract data from the nested structure as shown in the example
  const barrioNombre = data.barrio && typeof data.barrio === "object" ? data.barrio.nombre : data.Barrio || ""
  const localidadNombre =
    data.localidad && typeof data.localidad === "object" ? data.localidad.nombre : data.Localidad || ""
  const cpcNombre = data.cpc && typeof data.cpc === "object" ? data.cpc.nombre : data.CPC || ""

  // Handle both camelCase and PascalCase properties
  const calle = data.calle || data.Calle || ""
  const tipoCalle = data.tipo_calle || data.TipoCalle || ""
  const numeroCasa = data.numero_casa || data.NumeroCasa || ""
  const pisoDepto = data.piso_depto || data.PisoDepto || ""
  const lote = data.lote || data.Lote || ""
  const manzana = data.manzana || data.Manzana || ""
  const referenciaGeografica = data.referencia_geografica || data.ReferenciaGeografica || ""
  const geolocalizacion = data.geolocalizacion || ""

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Datos de Localización
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
              gap: 2,
            }}
          >
            <TextField label="Calle" name="Calle" value={calle} InputProps={{ readOnly: true }} fullWidth />
            <TextField
              label="Tipo de Calle"
              name="TipoCalle"
              value={tipoCalle}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextField
              label="Altura"
              name="NumeroCasa"
              value={numeroCasa}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextField
              label="Piso/Depto"
              name="PisoDepto"
              value={pisoDepto}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextField label="Lote" name="Lote" value={lote} InputProps={{ readOnly: true }} fullWidth />
            <TextField label="Manzana" name="Manzana" value={manzana} InputProps={{ readOnly: true }} fullWidth />
            <TextField
              label="Referencia Geográfica"
              name="ReferenciaGeografica"
              value={referenciaGeografica}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextField label="Barrio" name="Barrio" value={barrioNombre} InputProps={{ readOnly: true }} fullWidth />
            <TextField
              label="Localidad"
              name="Localidad"
              value={localidadNombre}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextField label="CPC" name="CPC" value={cpcNombre} InputProps={{ readOnly: true }} fullWidth />
            <TextField
              label="Geolocalización"
              name="geolocalizacion"
              value={geolocalizacion}
              InputProps={{ readOnly: true }}
              fullWidth
            />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  )
}
