import { Paper, Typography, Box, TextField, Grid } from "@mui/material"

interface DatosLocalizacionProps {
  data: any
}

export default function DatosLocalizacion({ data }: DatosLocalizacionProps) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Datos de Localización
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
            <TextField label="Calle" name="Calle" value={data.Calle || ""} InputProps={{ readOnly: true }} fullWidth />
            <TextField
              label="Tipo de Calle"
              name="TipoCalle"
              value={data.TipoCalle || ""}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextField
              label="Número de Casa"
              name="NumeroCasa"
              value={data.NumeroCasa || ""}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextField
              label="Piso/Depto"
              name="PisoDepto"
              value={data.PisoDepto || ""}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextField label="Lote" name="Lote" value={data.Lote || ""} InputProps={{ readOnly: true }} fullWidth />
            <TextField
              label="Manzana"
              name="Manzana"
              value={data.Manzana || ""}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextField
              label="Referencia Geográfica"
              name="ReferenciaGeografica"
              value={data.ReferenciaGeografica || ""}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextField
              label="Barrio"
              name="Barrio"
              value={data.Barrio || ""}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextField
              label="Localidad"
              name="Localidad"
              value={data.Localidad || ""}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextField label="CPC" name="CPC" value={data.CPC || ""} InputProps={{ readOnly: true }} fullWidth />
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle2" gutterBottom>
              Información adicional
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Geolocalización:
              </Typography>
              <Typography variant="body1">{data.geolocalizacion || "No disponible"}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                IDs de referencia:
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 1, mt: 1 }}>
                <Typography variant="body2">Barrio ID:</Typography>
                <Typography variant="body2" fontWeight="medium">
                  {data.barrio_id || "N/A"}
                </Typography>

                <Typography variant="body2">Localidad ID:</Typography>
                <Typography variant="body2" fontWeight="medium">
                  {data.localidad_id || "N/A"}
                </Typography>

                <Typography variant="body2">CPC ID:</Typography>
                <Typography variant="body2" fontWeight="medium">
                  {data.cpc_id || "N/A"}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  )
}
