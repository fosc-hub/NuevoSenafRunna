"use client"

import { useState } from "react"
import { Button } from "@mui/material"
import { Description as DocIcon } from "@mui/icons-material"
import { saveAs } from "file-saver"
import { generateInformeDocx, generateDocxFileName } from "./informe-docx"

interface DownloadDocxButtonProps {
  data: any
  label?: string
  onGenerate?: (blob: Blob, fileName: string) => void
}

export default function DownloadDocxButton({
  data,
  label = "Generar Word",
  onGenerate,
}: DownloadDocxButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  // Preparar los datos para el documento (misma lógica que PDF)
  const prepareDataForDocx = () => {
    const preparedData = {
      ...data,
      NNYAConvivientes: (data.NNYAConvivientes || []).map((nnya: any) => ({
        ...nnya,
        educacion: nnya.educacion
          ? {
              ...nnya.educacion,
              institucion_educativa:
                typeof nnya.educacion.institucion_educativa === "object"
                  ? nnya.educacion.institucion_educativa.nombre || ""
                  : String(nnya.educacion.institucion_educativa || ""),
              nivel: String(nnya.educacion.nivel || ""),
              curso: String(nnya.educacion.curso || ""),
              turno: String(nnya.educacion.turno || ""),
              tipo_escuela: String(nnya.educacion.tipo_escuela || ""),
            }
          : null,
        cobertura_medica: nnya.cobertura_medica
          ? {
              ...nnya.cobertura_medica,
              obra_social: String(nnya.cobertura_medica.obra_social || ""),
              institucion_sanitaria_nombre: String(nnya.cobertura_medica.institucion_sanitaria_nombre || ""),
              medico_cabecera:
                typeof nnya.cobertura_medica.medico_cabecera === "object"
                  ? nnya.cobertura_medica.medico_cabecera.nombre || ""
                  : String(nnya.cobertura_medica.medico_cabecera || ""),
            }
          : null,
        persona_enfermedades: (nnya.persona_enfermedades || []).map((enfermedad: any) => ({
          ...enfermedad,
          enfermedad:
            typeof enfermedad.enfermedad === "object"
              ? enfermedad.enfermedad.nombre || ""
              : String(enfermedad.enfermedad_nombre || ""),
          diagnostico: String(enfermedad.diagnostico || ""),
          tratamiento: String(enfermedad.tratamiento || ""),
        })),
        vulneraciones: (nnya.vulneraciones || []).map((vulneracion: any) => ({
          ...vulneracion,
          tipo_vulneracion_nombre: String(vulneracion.tipo_vulneracion_nombre || ""),
          fecha_vulneracion: String(vulneracion.fecha_vulneracion || ""),
          ambito_vulneracion_nombre: String(vulneracion.ambito_vulneracion_nombre || ""),
        })),
      })),
      NNYANoConvivientes: (data.NNYANoConvivientes || []).map((nnya: any) => ({
        ...nnya,
        educacion: nnya.educacion
          ? {
              ...nnya.educacion,
              institucion_educativa:
                typeof nnya.educacion.institucion_educativa === "object"
                  ? nnya.educacion.institucion_educativa.nombre || ""
                  : String(nnya.educacion.institucion_educativa || ""),
              nivel: String(nnya.educacion.nivel || ""),
              curso: String(nnya.educacion.curso || ""),
              turno: String(nnya.educacion.turno || ""),
              tipo_escuela: String(nnya.educacion.tipo_escuela || ""),
            }
          : null,
        cobertura_medica: nnya.cobertura_medica
          ? {
              ...nnya.cobertura_medica,
              obra_social: String(nnya.cobertura_medica.obra_social || ""),
              institucion_sanitaria_nombre: String(nnya.cobertura_medica.institucion_sanitaria_nombre || ""),
              medico_cabecera:
                typeof nnya.cobertura_medica.medico_cabecera === "object"
                  ? nnya.cobertura_medica.medico_cabecera.nombre || ""
                  : String(nnya.cobertura_medica.medico_cabecera || ""),
            }
          : null,
        persona_enfermedades: (nnya.persona_enfermedades || []).map((enfermedad: any) => ({
          ...enfermedad,
          enfermedad:
            typeof enfermedad.enfermedad === "object"
              ? enfermedad.enfermedad.nombre || ""
              : String(enfermedad.enfermedad_nombre || ""),
          diagnostico: String(enfermedad.diagnostico || ""),
          tratamiento: String(enfermedad.tratamiento || ""),
        })),
        vulneraciones: (nnya.vulneraciones || []).map((vulneracion: any) => ({
          ...vulneracion,
          tipo_vulneracion_nombre: String(vulneracion.tipo_vulneracion_nombre || ""),
          fecha_vulneracion: String(vulneracion.fecha_vulneracion || ""),
          ambito_vulneracion_nombre: String(vulneracion.ambito_vulneracion_nombre || ""),
        })),
      })),
      AdultosConvivientes: (data.AdultosConvivientes || []).map((adulto: any) => ({
        ...adulto,
        condicionesVulnerabilidad: (adulto.condicionesVulnerabilidad || []).map((condicion: any) => {
          if (typeof condicion === "string") {
            return condicion
          } else if (typeof condicion === "object" && condicion !== null) {
            if (condicion.condicion_vulnerabilidad) {
              if (typeof condicion.condicion_vulnerabilidad === "string") {
                return condicion.condicion_vulnerabilidad
              } else if (
                typeof condicion.condicion_vulnerabilidad === "object" &&
                condicion.condicion_vulnerabilidad.nombre
              ) {
                return condicion.condicion_vulnerabilidad.nombre
              }
            } else if (condicion.nombre) {
              return condicion.nombre
            } else if (condicion.descripcion) {
              return condicion.descripcion
            }
          }
          return "Condición no especificada"
        }),
      })),
      AdultosNoConvivientes: (data.AdultosNoConvivientes || []).map((adulto: any) => ({
        ...adulto,
        condicionesVulnerabilidad: (adulto.condicionesVulnerabilidad || []).map((condicion: any) => {
          if (typeof condicion === "string") {
            return condicion
          } else if (typeof condicion === "object" && condicion !== null) {
            if (condicion.condicion_vulnerabilidad) {
              if (typeof condicion.condicion_vulnerabilidad === "string") {
                return condicion.condicion_vulnerabilidad
              } else if (
                typeof condicion.condicion_vulnerabilidad === "object" &&
                condicion.condicion_vulnerabilidad.nombre
              ) {
                return condicion.condicion_vulnerabilidad.nombre
              }
            } else if (condicion.nombre) {
              return condicion.nombre
            } else if (condicion.descripcion) {
              return condicion.descripcion
            }
          }
          return "Condición no especificada"
        }),
      })),
      Actividades: data.Actividades || [],
      IndicadoresEvaluacion: (data.IndicadoresEvaluacion || []).map((ind: any) => ({
        ...ind,
        NombreIndicador: String(ind.NombreIndicador || ""),
        Descripcion: String(ind.Descripcion || ""),
        Peso: String(ind.Peso || ""),
      })),
      adjuntos: data.adjuntos || [],
      InformacionGeneral: {
        ...data.InformacionGeneral,
        NumerosDemanda: String(data.InformacionGeneral?.NumerosDemanda || ""),
        Localidad: String(data.InformacionGeneral?.Localidad || ""),
        Fecha: String(data.InformacionGeneral?.Fecha || ""),
        CargoFuncion: String(data.InformacionGeneral?.CargoFuncion || ""),
        NombreApellido: String(data.InformacionGeneral?.NombreApellido || ""),
        BloqueDatosRemitente: String(data.InformacionGeneral?.BloqueDatosRemitente || ""),
        TipoInstitucion: String(data.InformacionGeneral?.TipoInstitucion || ""),
        Institucion: String(data.InformacionGeneral?.Institucion || ""),
        fecha_oficio_documento: String(data.InformacionGeneral?.fecha_oficio_documento || ""),
        fecha_ingreso_senaf: String(data.InformacionGeneral?.fecha_ingreso_senaf || ""),
        etiqueta: String(data.InformacionGeneral?.etiqueta || ""),
        tipo_demanda: String(data.InformacionGeneral?.tipo_demanda || ""),
        objetivo_de_demanda: String(data.InformacionGeneral?.objetivo_de_demanda || ""),
        motivo_ingreso: String(data.InformacionGeneral?.motivo_ingreso || ""),
        submotivo_ingreso: String(data.InformacionGeneral?.submotivo_ingreso || ""),
        observaciones: String(data.InformacionGeneral?.observaciones || ""),
      },
      DatosLocalizacion: {
        ...data.DatosLocalizacion,
        TipoCalle: String(data.DatosLocalizacion?.TipoCalle || ""),
        Calle: String(data.DatosLocalizacion?.Calle || ""),
        NumeroCasa: String(data.DatosLocalizacion?.NumeroCasa || ""),
        PisoDepto: String(data.DatosLocalizacion?.PisoDepto || ""),
        Lote: String(data.DatosLocalizacion?.Lote || ""),
        Manzana: String(data.DatosLocalizacion?.Manzana || ""),
        Barrio: String(data.DatosLocalizacion?.Barrio || ""),
        Localidad: String(data.DatosLocalizacion?.Localidad || ""),
        ReferenciaGeografica: String(data.DatosLocalizacion?.ReferenciaGeografica || ""),
        CPC: String(data.DatosLocalizacion?.CPC || ""),
        geolocalizacion: String(data.DatosLocalizacion?.geolocalizacion || ""),
      },
      DescripcionSituacion: String(data.DescripcionSituacion || ""),
      AntecedentesDemanda: Array.isArray(data.AntecedentesDemanda)
        ? data.AntecedentesDemanda.map((antecedente: any) => ({
            ...antecedente,
            IdDemandaVinculada: String(antecedente.IdDemandaVinculada || ""),
            NumerosDemanda: String(antecedente.NumerosDemanda || ""),
          }))
        : data.AntecedentesDemanda
          ? {
              IdDemandaVinculada: String(data.AntecedentesDemanda.IdDemandaVinculada || ""),
              NumerosDemanda: String(data.AntecedentesDemanda.NumerosDemanda || ""),
            }
          : null,
      MotivosActuacion: Array.isArray(data.MotivosActuacion)
        ? data.MotivosActuacion.map((motivo: any) => ({
            ...motivo,
            Motivos: String(motivo.Motivos || ""),
          }))
        : data.MotivosActuacion
          ? {
              Motivos: String(data.MotivosActuacion.Motivos || ""),
            }
          : null,
      ValoracionProfesional: String(data.ValoracionProfesional || ""),
    }

    return preparedData
  }

  const handleGenerateDocx = async () => {
    try {
      setIsGenerating(true)

      const preparedData = prepareDataForDocx()
      const blob = await generateInformeDocx(preparedData)
      const fileName = generateDocxFileName(preparedData)

      // Download the file
      saveAs(blob, fileName)

      // Call callback if provided
      if (onGenerate) {
        onGenerate(blob, fileName)
      }
    } catch (error) {
      console.error("Error generating Word document:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      variant="outlined"
      color="primary"
      startIcon={<DocIcon />}
      onClick={handleGenerateDocx}
      disabled={isGenerating}
    >
      {isGenerating ? "Generando Word..." : label}
    </Button>
  )
}
