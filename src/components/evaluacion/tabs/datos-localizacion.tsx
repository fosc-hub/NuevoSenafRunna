import { Paper, Typography, Box, TextField } from "@mui/material"

interface DatosLocalizacionProps {
  data: any
}

export default function DatosLocalizacion({ data }: DatosLocalizacionProps) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Datos de Localización
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
        <TextField label="Calle" name="Calle" value={data.Calle || ""} InputProps={{ readOnly: true }} fullWidth />
        <TextField
          label="Tipo de Calle"
          name="TipoCalle"
          value={data.TipoCalle || ""}
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
          label="Número de Casa"
          name="NumeroCasa"
          value={data.NumeroCasa || ""}
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
        <TextField label="Barrio" name="Barrio" value={data.Barrio || ""} InputProps={{ readOnly: true }} fullWidth />
        <TextField
          label="Localidad"
          name="Localidad"
          value={data.Localidad || ""}
          InputProps={{ readOnly: true }}
          fullWidth
        />
        <TextField label="CPC" name="CPC" value={data.CPC || ""} InputProps={{ readOnly: true }} fullWidth />
      </Box>
    </Paper>
  )
}

