"use client"
import { useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import EvaluacionTabs from "@/components/evaluacion/evaluacion-tabs"
import { Box, CircularProgress, Alert } from "@mui/material"
import axiosInstance from "@/app/api/utils/axiosInstance"

// Función para obtener los datos de la demanda
const fetchDemandaData = async (id: string) => {
  const response = await axiosInstance.get(`/registro-demanda-form/${id}/full-detail/`)
  return response.data
}

// Modificar la función transformApiData para manejar correctamente los datos JSON
const transformApiData = (apiData: any) => {
  // Extraer información general
  const informacionGeneral = {
    Localidad: apiData.localidad_usuario || "",
    Fecha: apiData.fecha_ingreso_senaf || new Date().toISOString().split("T")[0],
    CargoFuncion: apiData.rol_usuario || "",
    NombreApellido: `${apiData.apellido_usuario || ""}, ${apiData.nombre_usuario || ""}`,
    NumerosDemanda: apiData.id ? `DEM-${apiData.id}/2025` : "",
    BloqueDatosRemitente: apiData.bloque_datos_remitente.nombre ? ` ${apiData.bloque_datos_remitente.nombre}` : "",
    TipoInstitucion: apiData.tipo_institucion ? "Institución" : "",
    Institucion: apiData.institucion?.nombre || "",
    fecha_oficio_documento: apiData.fecha_oficio_documento || "",
    fecha_ingreso_senaf: apiData.fecha_ingreso_senaf || "",
    etiqueta: apiData.etiqueta ? String(apiData.etiqueta) : "",
    tipo_demanda: apiData.tipo_demanda || "",
    objetivo_de_demanda: apiData.objetivo_de_demanda || "",
    motivo_ingreso: apiData.motivo_ingreso || "",
    submotivo_ingreso: apiData.submotivo_ingreso || "",
    observaciones: apiData.observaciones || "",
    // Pasar los códigos de demanda directamente como vienen del API
    codigos_demanda: apiData.codigos_demanda || [],
  }

  // Extraer datos de localización
  const datosLocalizacion = apiData.localizacion
    ? {
        Calle: apiData.localizacion?.calle || "",
        TipoCalle: apiData.localizacion?.tipo_calle || "",
        PisoDepto: apiData.localizacion?.piso_depto || "",
        Lote: apiData.localizacion?.lote || "",
        Manzana: apiData.localizacion?.mza || "",
        NumeroCasa: apiData.localizacion?.casa_nro || "",
        ReferenciaGeografica: apiData.localizacion?.referencia_geo || "",
        Barrio: apiData.localizacion?.barrio?.nombre || "",
        Localidad: apiData.localizacion?.localidad?.nombre || "",
        CPC: apiData.localizacion?.cpc?.nombre || "",
        geolocalizacion: apiData.localizacion?.geolocalizacion || "",
        barrio_id: apiData.localizacion?.barrio || "",
        localidad_id: apiData.localizacion?.localidad || "",
        cpc_id: apiData.localizacion?.cpc || "",
        deleted: apiData.localizacion?.deleted,
        id: apiData.localizacion?.id || null,
      }
    : {}

  // Extraer actividades
  const actividades = Array.isArray(apiData.actividades)
    ? apiData.actividades.map((act: any) => ({
        FechaHora: act.fecha_y_hora_manual || act.fecha_y_hora || "",
        TipoActividad: act.tipo || "Visita",
        Institucion: act.institucion || "SENAF",
        Descripcion: act.descripcion || "",
        by_user: act.by_user || null,
        adjuntos: act.adjuntos || [],
        fecha_y_hora_manual: act.fecha_y_hora_manual || "",
      }))
    : []

  // Procesar personas para extraer NNyA y adultos
  const nnyaConvivientes: any[] = []
  const nnyaNoConvivientes: any[] = []
  const adultosConvivientes: any[] = []
  const adultosNoConvivientes: any[] = []

  // ID de localización de la demanda para comparar
  const demandaLocalizacionId = apiData.localizacion?.id

  if (Array.isArray(apiData.personas)) {
    apiData.personas.forEach((persona: any) => {
      const personaData = {
        ApellidoNombre: `${persona.persona.apellido || ""}, ${persona.persona.nombre || ""}`,
        FechaNacimiento: persona.persona.fecha_nacimiento || "",
        DNI: persona.persona.dni || "",
        VinculoConNNYAPrincipal: persona.demanda_persona?.vinculo_demanda || "",
        LegajoRUNNA: "",
        // Datos adicionales
        nombre: persona.persona.nombre || "",
        apellido: persona.persona.apellido || "",
        fechaDefuncion: persona.persona.fecha_defuncion || null,
        edadAproximada: persona.persona.edad_aproximada || "",
        situacionDni: persona.persona.situacion_dni || "",
        genero: persona.persona.genero || "",
        observaciones: persona.persona.observaciones || "",
        nacionalidad: persona.persona.nacionalidad || "",
        // Datos de localización
        Barrio: persona.localizacion?.barrio || "",
        Calle: persona.localizacion?.calle || "",
        NumeroCasa: persona.localizacion?.casa_nro || "",
        // Datos completos
        localizacion: persona.localizacion || null,
        educacion: persona.educacion || null,
        cobertura_medica: persona.cobertura_medica || null,
        persona_enfermedades: persona.persona_enfermedades || [],
        demanda_persona: persona.demanda_persona || null,
        condicionesVulnerabilidad: persona.condiciones_vulnerabilidad || [],
        vulneraciones: persona.vulneraciones || [],
        telefono: persona.persona.telefono || "",
        ocupacion: persona.demanda_persona?.ocupacion || "",
        legalmenteResponsable: persona.demanda_persona?.legalmente_responsable || false,
        supuesto_autordv: "",
        garantiza_proteccion: false,
        vinculacion: "",
        vinculo_con_nnya_principal: persona.demanda_persona?.vinculo_con_nnya_principal || "",
        vinculo_demanda: persona.demanda_persona?.vinculo_demanda || "",
        persona: persona.persona || null,
      }

      // Determinar si es NNyA o adulto
      const esNNYA = persona.persona.nnya === true

      // Determinar si es conviviente basado en la localización
      // Una persona es conviviente si su ID de localización coincide con el de la demanda
      const esConviviente = persona.localizacion?.id === demandaLocalizacionId

      if (esNNYA) {
        if (esConviviente) {
          nnyaConvivientes.push(personaData)
        } else {
          nnyaNoConvivientes.push(personaData)
        }
      } else {
        if (esConviviente) {
          adultosConvivientes.push(personaData)
        } else {
          adultosNoConvivientes.push(personaData)
        }
      }
    })
  }

  // Extraer antecedentes - simplificado para mostrar solo el ID
  const antecedentes = apiData.demandas_vinculadas
    ? [
        {
          IdDemandaVinculada: apiData.demandas_vinculadas || "",
        },
      ]
    : []

  // Datos para motivos de actuación
  const motivosActuacion = {
    motivo_ingreso: apiData.motivo_ingreso || "",
    submotivo_ingreso: apiData.submotivo_ingreso || "",
  }

  // Extraer indicadores - verificar si es string o ya es un objeto
  let indicadoresEvaluacion = []
  if (apiData.indicadores_valoracion) {
    try {
      // Verificar si ya es un objeto o necesita ser parseado
      const indicadoresData =
        typeof apiData.indicadores_valoracion === "string"
          ? JSON.parse(apiData.indicadores_valoracion)
          : apiData.indicadores_valoracion

      if (Array.isArray(indicadoresData)) {
        indicadoresEvaluacion = indicadoresData.map((ind: any) => ({
          NombreIndicador: ind.nombre || "Indicador",
          Descripcion: ind.descripcion || "",
          Peso: ind.peso >= 5 ? "Alto" : ind.peso >= 3 ? "Medio" : "Bajo",
        }))
      }
    } catch (error) {
      console.error("Error parsing indicadores_valoracion:", error)
      indicadoresEvaluacion = []
    }
  }

  // Extraer adjuntos
  const adjuntos = apiData.adjuntos || []

  // Extraer valoración profesional y descripción de la situación
  let valoracionProfesional = ""
  let descripcionSituacion = apiData.descripcion || ""

  if (apiData.latest_evaluacion) {
    try {
      // Verificar si ya es un objeto o necesita ser parseado
      const evaluacionData =
        typeof apiData.latest_evaluacion === "string"
          ? JSON.parse(apiData.latest_evaluacion)
          : apiData.latest_evaluacion

      valoracionProfesional = evaluacionData.valoracion_profesional_final || ""

      // Solo sobrescribir descripcionSituacion si hay un valor en la evaluación
      if (evaluacionData.descripcion_de_la_situacion) {
        descripcionSituacion = evaluacionData.descripcion_de_la_situacion
      }
    } catch (error) {
      console.error("Error parsing latest_evaluacion:", error)
    }
  }

  return {
    InformacionGeneral: informacionGeneral,
    DatosLocalizacion: datosLocalizacion,
    Actividades: actividades,
    NNYAConvivientes: nnyaConvivientes,
    NNYANoConvivientes: nnyaNoConvivientes,
    AdultosConvivientes: adultosConvivientes,
    AdultosNoConvivientes: adultosNoConvivientes,
    AntecedentesDemanda: antecedentes,
    MotivosActuacion: motivosActuacion, // Ahora es un objeto con motivo_ingreso y submotivo_ingreso
    IndicadoresEvaluacion: indicadoresEvaluacion,
    DescripcionSituacion: descripcionSituacion,
    ValoracionProfesional: valoracionProfesional,
    adjuntos: adjuntos,
  }
}

export default function EvaluacionContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get("id") || ""

  // Obtener datos de la API
  const { data, isLoading, error } = useQuery({
    queryKey: ["demanda", id],
    queryFn: () => fetchDemandaData(id),
    enabled: !!id, // Solo ejecutar si hay un ID
    staleTime: 1000 * 60 * 5, // 5 minutos
  })

  // Transformar los datos si están disponibles
  const transformedData = data ? transformApiData(data) : null

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: "1200px", mx: "auto", p: 5 }}>
        <Alert severity="error">
          Error al cargar los datos. Por favor, intente nuevamente o contacte al administrador.
        </Alert>
      </Box>
    )
  }

  if (!data) {
    return (
      <Box sx={{ maxWidth: "1200px", mx: "auto", p: 5 }}>
        <Alert severity="warning">
          No se encontraron datos para la demanda solicitada. Verifique el ID proporcionado.
        </Alert>
      </Box>
    )
  }

  return (
    <main className="max-w-[1200px] mx-auto p-5">
      <EvaluacionTabs data={transformedData} />
    </main>
  )
}
