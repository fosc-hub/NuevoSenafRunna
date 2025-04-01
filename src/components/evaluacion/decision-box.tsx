"use client"

import { useEffect, useState } from "react"
import {
  Box,
  Paper,
  Typography,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Button,
  CircularProgress,
} from "@mui/material"
import { toast } from "react-toastify"
import { getIndicadores, createEvaluaciones, type Indicador } from "./indicadores-service"

interface DecisionBoxProps {
  vulnerabilityIndicators: any[]
  handleIndicatorChange: (id: number, value: boolean) => void
  demandaId?: number | null
}

export default function DecisionBox({ vulnerabilityIndicators, handleIndicatorChange, demandaId }: DecisionBoxProps) {
  const [indicators, setIndicators] = useState<Indicador[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showDecision, setShowDecision] = useState(false)

  // Fetch indicators from API
  useEffect(() => {
    const fetchIndicators = async () => {
      setLoading(true)
      try {
        const data = await getIndicadores()
        setIndicators(data.map((ind) => ({ ...ind, selected: false })))
      } catch (error) {
        console.error("Error fetching indicators:", error)
        toast.error("Error al cargar los indicadores")
      } finally {
        setLoading(false)
      }
    }

    fetchIndicators()
  }, [])

  const handleIndicatorSelectionChange = (id: number, value: boolean) => {
    setIndicators(indicators.map((indicator) => (indicator.id === id ? { ...indicator, selected: value } : indicator)))
  }

  const handleSubmitEvaluacion = async () => {
    if (!demandaId) {
      toast.error("No se ha especificado una demanda")
      return
    }

    setSubmitting(true)
    try {
      // Prepare data for submission
      const indicadoresData = indicators
        .filter((ind) => ind.selected !== undefined)
        .map((ind) => ({
          indicadorId: ind.id,
          selected: ind.selected || false,
        }))

      if (indicadoresData.length === 0) {
        toast.warning("No hay indicadores seleccionados para valorar")
        setSubmitting(false)
        return
      }

      // Submit evaluations - toast will be shown by the service
      await createEvaluaciones(demandaId, indicadoresData)

      // Show decision after successful submission
      setShowDecision(true)
    } catch (error) {
      console.error("Error submitting evaluations:", error)
      toast.error("Error al enviar la valoración")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Box sx={{ mt: 4, mb: 2 }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {/* Vulnerability Indicators - Left Side */}
            <Box sx={{ flex: "1 1 55%", minWidth: 400 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#0EA5E9" }}>
                  INDICADORES DE VULNERACIÓN
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmitEvaluacion}
                  disabled={submitting || !demandaId}
                >
                  {submitting ? <CircularProgress size={24} color="inherit" /> : "Valorar"}
                </Button>
              </Box>

              <Paper variant="outlined" sx={{ p: 2, maxHeight: "400px", overflow: "auto" }}>
                {loading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : indicators.length > 0 ? (
                  indicators.map((indicator) => (
                    <Box key={indicator.id} sx={{ mb: 2, pb: 2, borderBottom: "1px solid #eee" }}>
                      <Box sx={{ display: "flex", mb: 1 }}>
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          {indicator.nombre}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: "bold", ml: 2 }}>
                          Peso: {indicator.peso}
                        </Typography>
                      </Box>
                      {indicator.descripcion && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {indicator.descripcion}
                        </Typography>
                      )}
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <input
                            type="radio"
                            id={`indicator-${indicator.id}-yes`}
                            name={`indicator-${indicator.id}`}
                            checked={indicator.selected === true}
                            onChange={() => handleIndicatorSelectionChange(indicator.id, true)}
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
                            onChange={() => handleIndicatorSelectionChange(indicator.id, false)}
                          />
                          <label htmlFor={`indicator-${indicator.id}-no`} style={{ marginLeft: "4px" }}>
                            No
                          </label>
                        </Box>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ p: 2, textAlign: "center" }}>
                    No hay indicadores disponibles
                  </Typography>
                )}
              </Paper>
            </Box>

            {/* NNyA Scores - Right Side */}
            <Box sx={{ flex: "1 1 40%", minWidth: 300 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "#0EA5E9", mb: 2 }}>
                SCORES NNyA
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
        </Paper>
      </Box>

      {/* Decisión Sugerida - Only shown after clicking "Valorar" */}
      {showDecision && (
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
                  Dado el alto score del nnya (433.0), la decision sugerida es APERTURA DE LEGAJO.
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      )}
    </>
  )
}

