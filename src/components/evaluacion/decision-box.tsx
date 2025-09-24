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
  Divider,
  Chip,
} from "@mui/material"
import { toast } from "react-toastify"
import { getIndicadores, submitValoracion, type Indicador, type ValoracionItem } from "./api/indicadores-service"

interface NNyA {
  id: number
  nombre: string
  apellido: string
  dni: number | string
}

interface Score {
  id: number
  score: number
  score_condiciones_vulnerabilidad: number
  score_vulneracion: number
  score_valoracion: number
  nnya: NNyA
  nnya_id: number
  decision: string
  reason: string
}

interface ValoracionResponse {
  valoraciones: ValoracionItem[]
  scores: Score[]
}

interface DecisionBoxProps {
  vulnerabilityIndicators: any[]
  handleIndicatorChange: (id: number, value: boolean) => void
  demandaId?: number | null
  initialScores?: Score[]
}

export default function DecisionBox({ vulnerabilityIndicators, handleIndicatorChange, demandaId, initialScores }: DecisionBoxProps) {
  const [indicators, setIndicators] = useState<Indicador[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showDecision, setShowDecision] = useState(false)
  const [scores, setScores] = useState<Score[]>([])

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

  // Initialize scores from props when available
  useEffect(() => {
    if (Array.isArray(initialScores) && initialScores.length > 0) {
      setScores(initialScores as any)
      const hasDecision = (initialScores as any[]).some((s) => s && (s as any).decision)
      if (hasDecision) setShowDecision(true)
    }
  }, [initialScores])

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
      // Prepare data for submission in the format expected by the new endpoint
      const valoracionData: ValoracionItem[] = indicators
        .filter((ind) => ind.selected !== undefined)
        .map((ind) => ({
          indicador: ind.id,
          checked: ind.selected || false,
        }))

      if (valoracionData.length === 0) {
        toast.warning("No hay indicadores seleccionados para valorar")
        setSubmitting(false)
        return
      }

      // Submit evaluations using the new endpoint
      const response = await submitValoracion(demandaId, valoracionData)

      // Update scores with the response data
      if (response && response.scores) {
        setScores(response.scores)
      }

      // Show decision after successful submission
      setShowDecision(true)
    } catch (error) {
      console.error("Error submitting evaluations:", error)
      // No need to show toast here as it's handled by the service
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
                  INDICADORES DE VALORACIÓN
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

              {scores.length > 0 ? (
                scores.map((scoreItem, index) => (
                  <Box key={scoreItem.id} sx={{ mb: 3 }}>
                    {index > 0 && <Divider sx={{ my: 2 }} />}

                    {/* NNyA Information */}
                    <Box sx={{ mb: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                      {(() => {
                        const nnyObj: any = (scoreItem as any).nnya
                        const isObject = nnyObj && typeof nnyObj === 'object'
                        const displayName = isObject
                          ? `${nnyObj.apellido || ''}, ${nnyObj.nombre || ''}`.trim()
                          : `NNyA ID: ${(scoreItem as any).nnya || (scoreItem as any).nnya_id || '-'}`
                        const displayDni = isObject ? (nnyObj.dni || 'No especificado') : 'No especificado'
                        return (
                          <>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                              {displayName}
                            </Typography>
                            <Typography variant="body2">DNI: {displayDni}</Typography>
                          </>
                        )
                      })()}
                      <Chip label="NNyA Principal" size="small" color="primary" sx={{ mt: 1, fontSize: "0.7rem" }} />
                    </Box>

                    {/* Score Table */}
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell sx={{ fontWeight: "bold" }}>Score Total</TableCell>
                            <TableCell align="right">{scoreItem.score}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: "bold" }}>Score condiciones vulnerabilidad</TableCell>
                            <TableCell align="right">{scoreItem.score_condiciones_vulnerabilidad}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: "bold" }}>Score vulneración</TableCell>
                            <TableCell align="right">{scoreItem.score_vulneracion}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: "bold" }}>Score valoración</TableCell>
                            <TableCell align="right">{scoreItem.score_valoracion}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                ))
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold" }}>Score</TableCell>
                        <TableCell align="right">-</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold" }}>Score condiciones vulnerabilidad</TableCell>
                        <TableCell align="right">-</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold" }}>Score vulneración</TableCell>
                        <TableCell align="right">-</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold" }}>Score valoración</TableCell>
                        <TableCell align="right">-</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Decisión Sugerida - Only shown after clicking "Valorar" */}
      {showDecision && scores.length > 0 && (
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
                  {scores[0].decision}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  Motivo:
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {scores[0].reason}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      )}
    </>
  )
}
