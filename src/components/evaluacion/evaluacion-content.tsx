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
    CargoFuncion: Array.isArray(apiData.rol_usuario) ? apiData.rol_usuario.join(", ") : (apiData.rol_usuario || ""),
    NombreApellido: `${apiData.apellido_usuario || ""}, ${apiData.nombre_usuario || ""}`,
    NumerosDemanda: apiData.id ? `DEM-${apiData.id}/2025` : "",
    BloqueDatosRemitente: typeof apiData.bloque_datos_remitente === 'object' && apiData.bloque_datos_remitente?.nombre ? ` ${apiData.bloque_datos_remitente.nombre}` : "",
    TipoInstitucion: typeof apiData.tipo_institucion === 'object' && apiData.tipo_institucion?.nombre ? apiData.tipo_institucion.nombre : (apiData.tipo_institucion ? "Institución" : ""),
    Institucion: typeof apiData.institucion === 'object' && apiData.institucion?.nombre ? apiData.institucion.nombre : (apiData.institucion || ""),
    fecha_oficio_documento: apiData.fecha_oficio_documento || "",
    fecha_ingreso_senaf: apiData.fecha_ingreso_senaf || "",
    etiqueta: typeof apiData.etiqueta === 'object' && apiData.etiqueta?.nombre ? apiData.etiqueta.nombre : (apiData.etiqueta ? String(apiData.etiqueta) : ""),
    tipo_demanda: apiData.tipo_demanda || "",
    objetivo_de_demanda: apiData.objetivo_de_demanda || "",
    motivo_ingreso: typeof apiData.motivo_ingreso === 'object' && apiData.motivo_ingreso?.nombre ? apiData.motivo_ingreso.nombre : (apiData.motivo_ingreso || ""),
    submotivo_ingreso: typeof apiData.submotivo_ingreso === 'object' && apiData.submotivo_ingreso?.nombre ? apiData.submotivo_ingreso.nombre : (apiData.submotivo_ingreso || ""),
    ambito_vulneracion: typeof apiData.ambito_vulneracion === 'object' && apiData.ambito_vulneracion?.nombre ? apiData.ambito_vulneracion.nombre : (apiData.ambito_vulneracion || ""),
    observaciones: apiData.observaciones || "",
    // Pasar los códigos de demanda directamente como vienen del API
    codigos_demanda: Array.isArray(apiData.codigos_demanda) ? apiData.codigos_demanda.map((codigo: any) => ({
      ...codigo,
      codigo: typeof codigo.codigo === 'object' && codigo.codigo?.nombre ? codigo.codigo.nombre : (codigo.codigo || ""),
      tipo_codigo: typeof codigo.tipo_codigo === 'object' && codigo.tipo_codigo?.nombre ? codigo.tipo_codigo.nombre : (codigo.tipo_codigo || ""),
    })) : [],
    // Add missing fields that might be needed by tabs
    bloque_datos_remitente: typeof apiData.bloque_datos_remitente === 'object' && apiData.bloque_datos_remitente?.nombre ? apiData.bloque_datos_remitente.nombre : (apiData.bloque_datos_remitente || ""),
    tipo_institucion: typeof apiData.tipo_institucion === 'object' && apiData.tipo_institucion?.nombre ? apiData.tipo_institucion.nombre : (apiData.tipo_institucion || ""),
    registrado_por_user_zona: typeof apiData.registrado_por_user_zona === 'object' && apiData.registrado_por_user_zona?.nombre ? apiData.registrado_por_user_zona.nombre : (apiData.registrado_por_user_zona || ""),
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
      TipoActividad: typeof act.tipo === 'object' && act.tipo?.nombre ? act.tipo.nombre : (typeof act.tipo === 'string' ? act.tipo : "Visita"),
      Institucion: typeof act.institucion === 'object' && act.institucion?.nombre ? act.institucion.nombre : (typeof act.institucion === 'string' ? act.institucion : "SENAF"),
      Descripcion: act.descripcion || "",
      by_user: act.by_user || null,
      adjuntos: Array.isArray(act.adjuntos) ? act.adjuntos : [],
      fecha_y_hora_manual: act.fecha_y_hora_manual || "",
      // Add additional fields that might be needed
      id: act.id,
      demanda: act.demanda,
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
      // Inside transformApiData, within apiData.personas.forEach:
      const personaData = {
        ApellidoNombre: `${persona.persona.apellido || ""}, ${persona.persona.nombre || ""}`,
        FechaNacimiento: persona.persona.fecha_nacimiento || "",
        DNI: persona.persona.dni || "",
        VinculoConNNYAPrincipal: typeof persona.demanda_persona?.vinculo_demanda === 'object' && persona.demanda_persona?.vinculo_demanda?.nombre ? persona.demanda_persona.vinculo_demanda.nombre : (persona.demanda_persona?.vinculo_demanda || ""),
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
        // Ensure you are accessing the 'nombre' property if 'barrio' or 'localidad' are objects
        Barrio: persona.localizacion?.barrio?.nombre || (typeof persona.localizacion?.barrio === 'string' ? persona.localizacion.barrio : "") || "",
        Calle: persona.localizacion?.calle || "",
        NumeroCasa: persona.localizacion?.casa_nro || "",
        // Datos completos
        localizacion: persona.localizacion || null,
        educacion: persona.educacion ? {
          ...persona.educacion,
          institucion_educativa: typeof persona.educacion.institucion_educativa === 'object' && persona.educacion.institucion_educativa?.nombre ? persona.educacion.institucion_educativa.nombre : (persona.educacion.institucion_educativa || ""),
        } : null,
        cobertura_medica: persona.cobertura_medica ? {
          ...persona.cobertura_medica,
          institucion_sanitaria: typeof persona.cobertura_medica.institucion_sanitaria === 'object' && persona.cobertura_medica.institucion_sanitaria?.nombre ? persona.cobertura_medica.institucion_sanitaria.nombre : (persona.cobertura_medica.institucion_sanitaria || ""),
          medico_cabecera: typeof persona.cobertura_medica.medico_cabecera === 'object' && persona.cobertura_medica.medico_cabecera?.nombre ? persona.cobertura_medica.medico_cabecera.nombre : (persona.cobertura_medica.medico_cabecera || ""),
        } : null,
        persona_enfermedades: Array.isArray(persona.persona_enfermedades) ? persona.persona_enfermedades.map((enf: any) => ({
          ...enf,
          enfermedad: typeof enf.enfermedad === 'object' && enf.enfermedad?.nombre ? enf.enfermedad.nombre : (enf.enfermedad || ""),
        })) : [],
        demanda_persona: persona.demanda_persona || null,
        condicionesVulnerabilidad: Array.isArray(persona.condiciones_vulnerabilidad) ? persona.condiciones_vulnerabilidad.map((cond: any) => ({
          ...cond,
          condicion_vulnerabilidad: typeof cond.condicion_vulnerabilidad === 'object' && cond.condicion_vulnerabilidad?.nombre ? cond.condicion_vulnerabilidad.nombre : (cond.condicion_vulnerabilidad || ""),
        })) : [],
        vulneraciones: Array.isArray(persona.vulneraciones) ? persona.vulneraciones.map((vuln: any) => ({
          ...vuln,
          categoria_motivo: typeof vuln.categoria_motivo === 'object' && vuln.categoria_motivo?.nombre ? vuln.categoria_motivo.nombre : (vuln.categoria_motivo || ""),
          categoria_submotivo: typeof vuln.categoria_submotivo === 'object' && vuln.categoria_submotivo?.nombre ? vuln.categoria_submotivo.nombre : (vuln.categoria_submotivo || ""),
          gravedad_vulneracion: typeof vuln.gravedad_vulneracion === 'object' && vuln.gravedad_vulneracion?.nombre ? vuln.gravedad_vulneracion.nombre : (vuln.gravedad_vulneracion || ""),
          urgencia_vulneracion: typeof vuln.urgencia_vulneracion === 'object' && vuln.urgencia_vulneracion?.nombre ? vuln.urgencia_vulneracion.nombre : (vuln.urgencia_vulneracion || ""),
        })) : [],
        telefono: persona.persona.telefono || "",
        ocupacion: typeof persona.demanda_persona?.ocupacion === 'object' && persona.demanda_persona?.ocupacion?.nombre ? persona.demanda_persona.ocupacion.nombre : (persona.demanda_persona?.ocupacion || ""),
        legalmenteResponsable: persona.demanda_persona?.legalmente_responsable || false,
        supuesto_autordv: "",
        garantiza_proteccion: false,
        vinculacion: "",
        vinculo_con_nnya_principal: typeof persona.demanda_persona?.vinculo_con_nnya_principal === 'object' && persona.demanda_persona?.vinculo_con_nnya_principal?.nombre ? persona.demanda_persona.vinculo_con_nnya_principal.nombre : (persona.demanda_persona?.vinculo_con_nnya_principal || ""),
        vinculo_demanda: typeof persona.demanda_persona?.vinculo_demanda === 'object' && persona.demanda_persona?.vinculo_demanda?.nombre ? persona.demanda_persona.vinculo_demanda.nombre : (persona.demanda_persona?.vinculo_demanda || ""),
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
    motivo_ingreso: typeof apiData.motivo_ingreso === 'object' && apiData.motivo_ingreso?.nombre ? apiData.motivo_ingreso.nombre : (apiData.motivo_ingreso || ""),
    submotivo_ingreso: typeof apiData.submotivo_ingreso === 'object' && apiData.submotivo_ingreso?.nombre ? apiData.submotivo_ingreso.nombre : (apiData.submotivo_ingreso || ""),
  }

  // Extraer indicadores de valoración
  let indicadoresEvaluacion: any[] = []
  if (Array.isArray(apiData.indicadores_valoracion)) {
    indicadoresEvaluacion = apiData.indicadores_valoracion.map((ind: any) => ({
      NombreIndicador: ind.nombre || "Indicador",
      Descripcion: ind.descripcion || "",
      Peso: ind.peso >= 5 ? "Alto" : ind.peso >= 3 ? "Medio" : "Bajo",
      id: ind.id, // Agregar el ID del indicador
    }))
  }

  // Extraer valoraciones seleccionadas previas
  let valoracionesSeleccionadas: any[] = []
  if (Array.isArray(apiData.valoraciones_seleccionadas)) {
    valoracionesSeleccionadas = apiData.valoraciones_seleccionadas.map((val: any) => ({
      indicador: val.indicador,
      checked: val.checked,
    }))
  }

  // Extraer adjuntos
  const adjuntos = Array.isArray(apiData.adjuntos) ? apiData.adjuntos : []

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
    // Add missing fields that might be needed by tabs
    codigos_demanda: informacionGeneral.codigos_demanda,
    bloque_datos_remitente: informacionGeneral.bloque_datos_remitente,
    tipo_institucion: informacionGeneral.tipo_institucion,
    registrado_por_user_zona: informacionGeneral.registrado_por_user_zona,
    IndicadoresEvaluacion: indicadoresEvaluacion,
    DescripcionSituacion: descripcionSituacion,
    ValoracionProfesional: valoracionProfesional,
    adjuntos: adjuntos,
    // Add scores data from API
    scores: Array.isArray(apiData.scores) ? apiData.scores : [],
    // Add valoraciones seleccionadas data from API
    valoracionesSeleccionadas: valoracionesSeleccionadas,
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
  let transformedData = null
  try {
    transformedData = data ? transformApiData(data) : null
  } catch (error) {
    console.error("Error transforming API data:", error)
    return (
      <Box sx={{ maxWidth: "1200px", mx: "auto", p: 5 }}>
        <Alert severity="error">
          Error al procesar los datos de la API. Por favor, contacte al administrador.
        </Alert>
      </Box>
    )
  }

  // Debug: Log the transformed data to see what's being passed to tabs
  if (transformedData) {
    console.log("Transformed data for tabs:", transformedData)
    console.log("Valoraciones seleccionadas:", transformedData.valoracionesSeleccionadas)
  }

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
