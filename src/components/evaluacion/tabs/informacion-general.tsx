import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, TextField } from "@mui/material"

interface InformacionGeneralProps {
  data: any
}

export default function InformacionGeneral({ data }: InformacionGeneralProps) {
  return (
    <TableContainer component={Paper} sx={{ mt: 0, borderRadius: 0 }}>
      <Table sx={{ minWidth: 650 }} aria-label="información general table">
        <TableHead>
          <TableRow>
            <TableCell>Localidad</TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell>Cargo/Función</TableCell>
            <TableCell>Nombre y Apellido</TableCell>
            <TableCell>Número de Demanda</TableCell>
            <TableCell>Remitente</TableCell>
            <TableCell>Tipo Institución</TableCell>
            <TableCell>Institución</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>
              <TextField
                name="Localidad"
                value={data.Localidad || ""}
                variant="standard"
                InputProps={{ readOnly: true }}
              />
            </TableCell>
            <TableCell>
              <TextField name="Fecha" value={data.Fecha || ""} variant="standard" InputProps={{ readOnly: true }} />
            </TableCell>
            <TableCell>
              <TextField
                name="CargoFuncion"
                value={data.CargoFuncion || ""}
                variant="standard"
                InputProps={{ readOnly: true }}
              />
            </TableCell>
            <TableCell>
              <TextField
                name="NombreApellido"
                value={data.NombreApellido || ""}
                variant="standard"
                InputProps={{ readOnly: true }}
              />
            </TableCell>
            <TableCell>
              <TextField
                name="NumerosDemanda"
                value={data.NumerosDemanda || ""}
                variant="standard"
                InputProps={{ readOnly: true }}
              />
            </TableCell>
            <TableCell>
              <TextField
                name="BloqueDatosRemitente"
                value={data.BloqueDatosRemitente || ""}
                variant="standard"
                InputProps={{ readOnly: true }}
              />
            </TableCell>
            <TableCell>
              <TextField
                name="TipoInstitucion"
                value={data.TipoInstitucion || ""}
                variant="standard"
                InputProps={{ readOnly: true }}
              />
            </TableCell>
            <TableCell>
              <TextField
                name="Institucion"
                value={data.Institucion || ""}
                variant="standard"
                InputProps={{ readOnly: true }}
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}

