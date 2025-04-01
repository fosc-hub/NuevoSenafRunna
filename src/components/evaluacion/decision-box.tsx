"use client"

import { Box, Paper, Typography, TableContainer, Table, TableBody, TableCell, TableRow } from "@mui/material"
import type { VulnerabilityIndicator } from "./evaluacion-tabs"

interface DecisionBoxProps {
  vulnerabilityIndicators: VulnerabilityIndicator[]
  handleIndicatorChange: (id: number, value: boolean) => void
}

export default function DecisionBox({ vulnerabilityIndicators, handleIndicatorChange }: DecisionBoxProps) {
  return (
    <Box sx={{ mt: 4, mb: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", color: "#0EA5E9" }}>
          DECISIÓN SUGERIDA
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", minWidth: 120 }}>
              Decisión:
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: "bold", color: "#0EA5E9" }}>
              APERTURA DE LEGAJO
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              Motivo:
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              Dado el alto score del nnya (433.0), y el alto score de la demanda (73.0), la decision sugerida es
              APERTURA DE LEGAJO.
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4, mt: 2 }}>
            {/* Vulnerability Indicators - Left Side */}
            <Box sx={{ flex: "1 1 55%", minWidth: 400 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2 }}>
                Indicadores de Vulneración:
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, maxHeight: "400px", overflow: "auto" }}>
                {vulnerabilityIndicators.map((indicator) => (
                  <Box key={indicator.id} sx={{ mb: 2, pb: 2, borderBottom: "1px solid #eee" }}>
                    <Box sx={{ display: "flex", mb: 1 }}>
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {indicator.nombre}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: "bold", ml: 2 }}>
                        Peso: {indicator.peso}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <input
                          type="radio"
                          id={`indicator-${indicator.id}-yes`}
                          name={`indicator-${indicator.id}`}
                          checked={indicator.selected === true}
                          onChange={() => handleIndicatorChange(indicator.id, true)}
                        />
                        <label htmlFor={`indicator-${indicator.id}-yes`} style={{ marginLeft: "4px" }}>
                          Sí
                        </label>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <input
                          type="radio"
                          id={`indicator-${indicator.id}-no`}
                          name={`indicator-${indicator.id}`}
                          checked={indicator.selected === false}
                          onChange={() => handleIndicatorChange(indicator.id, false)}
                        />
                        <label htmlFor={`indicator-${indicator.id}-no`} style={{ marginLeft: "4px" }}>
                          No
                        </label>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Paper>
            </Box>

            {/* Scores - Right Side */}
            <Box sx={{ flex: "1 1 40%", minWidth: 300 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2 }}>
                Scores:
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                    Demanda Scores:
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold" }}>Score</TableCell>
                          <TableCell align="right">73</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold" }}>Score condiciones vulnerabilidad</TableCell>
                          <TableCell align="right">0</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold" }}>Score vulneración</TableCell>
                          <TableCell align="right">67</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold" }}>Score motivos intervención</TableCell>
                          <TableCell align="right">0</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold" }}>Score indicadores valoración</TableCell>
                          <TableCell align="right">6</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                    NNyA Scores:
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold" }}>Score</TableCell>
                          <TableCell align="right">433</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold" }}>Score condiciones vulnerabilidad</TableCell>
                          <TableCell align="right">0</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold" }}>Score vulneración</TableCell>
                          <TableCell align="right">433</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold" }}>Score motivos intervención</TableCell>
                          <TableCell align="right">-</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

