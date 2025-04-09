export const evaluacionData = {
  InformacionGeneral: {
    Localidad: "Córdoba",
    Fecha: "2025-03-31",
    CargoFuncion: "Trabajador Social",
    NombreApellido: "Sosa, María",
    NumerosDemanda: "DEM-1234/2025",
    BloqueDatosRemitente: "Remitente: Juzgado de Familia Nº2",
    TipoInstitucion: "Juzgado",
    Institucion: "Poder Judicial de la Provincia",
    // Campos adicionales del Step 1
    fecha_oficio_documento: "2025-03-25",
    fecha_ingreso_senaf: "2025-03-31",
    etiqueta: "urgente",
    envio_de_respuesta: "si",
    bloque_datos_remitente: 2,
    tipo_institucion: 4,
    codigosDemanda: [
      { tipo: 1, codigo: "DEM-1234/2025" },
      { tipo: 2, codigo: "EXP-JF2-456/25" }
    ],
    ambito_vulneracion: 1,
    tipo_demanda: "judicial",
    tipos_presuntos_delitos: 3,
    objetivo_de_demanda: "proteccion",
    motivo_ingreso: 2,
    submotivo_ingreso: 8,
    zona: 3,
    observaciones: "Caso derivado con carácter de urgente debido a la situación de riesgo detectada. Se requiere evaluación inmediata y plan de intervención."
  },
  DatosLocalizacion: {
    Calle: "Av. Principal",
    TipoCalle: "Avenida",
    PisoDepto: "2º B",
    Lote: "Lote 12",
    Manzana: "Manzana 4",
    NumeroCasa: "123",
    ReferenciaGeografica: "Frente a la plaza del barrio",
    Barrio: "Barrio Centro",
    Localidad: "Córdoba",
    CPC: "CPC Centro",
    // Campos adicionales de localización
    geolocalizacion: "-31.416668,-64.183334",
    barrio_id: 5,
    localidad_id: 1,
    cpc_id: 2
  },
  Actividades: [
    {
      FechaHora: "2025-03-31 10:00",
      TipoActividad: "Visita Domiciliaria",
      Institucion: "Secretaría de Niñez, Adolescencia y Familia",
      Descripcion: "Se realiza visita para evaluación primaria de la situación.",
    },
  ],
  NNYAConvivientes: [
    {
      ApellidoNombre: "González, Pedro",
      FechaNacimiento: "2014-05-12",
      DNI: "50123456",
      VinculoConNNYAPrincipal: "Hermano",
      LegajoRUNNA: "RUNNA-12345",
      // Campos adicionales del Step 3
      nombre: "Pedro",
      apellido: "González",
      fechaDefuncion: null,
      edadAproximada: "10",
      situacionDni: "regular",
      genero: "masculino",
      observaciones: "Niño principal de la demanda. Presenta signos de negligencia.",
      useDefaultLocalizacion: true,
      educacion: {
        institucion_educativa: { nombre: "Escuela Provincial N° 123" },
        nivel_alcanzado: "primario",
        esta_escolarizado: true,
        ultimo_cursado: "cuarto_grado",
        tipo_escuela: "publica",
        comentarios_educativos: "Buen rendimiento escolar a pesar de la situación familiar.",
        curso: "4to",
        nivel: "primario",
        turno: "mañana"
      },
      cobertura_medica: {
        obra_social: "publica",
        intervencion: "ambulatoria",
        auh: true,
        observaciones: "Recibe AUH. Controles médicos regulares.",
        institucion_sanitaria: 2,
        institucion_sanitaria_nombre: "Hospital Infantil Municipal",
        medico_cabecera: {
          nombre: "Dr. Juan Pérez",
          mail: "jperez@hospital.gob.ar",
          telefono: "351-4567890"
        }
      },
      persona_enfermedades: [
        {
          enfermedad: 2,
          enfermedad_nombre: "Asma",
          diagnostico: "2022-05-10",
          tratamiento: "Inhalador de rescate",
          observaciones: "Asma leve. Se agrava en épocas de frío."
        }
      ],
      demanda_persona: {
        conviviente: true,
        vinculo_demanda: "victima",
        vinculo_con_nnya_principal: "hermano"
      },
      condicionesVulnerabilidad: {
        condicion_vulnerabilidad: [2, 5]
      },
      vulneraciones: [
        {
          tipo_vulneracion: 4,
          tipo_vulneracion_nombre: "Negligencia",
          fecha_vulneracion: "2025-03-15",
          ambito_vulneracion: 1,
          ambito_vulneracion_nombre: "Familiar",
          observaciones: "Falta de cuidados básicos, higiene deficiente."
        }
      ],
      nacionalidad: "argentina"
    },
  ],
  NNYANoConvivientes: [
    {
      ApellidoNombre: "Pérez, Juan",
      FechaNacimiento: "2012-09-20",
      DNI: "50112233",
      VinculoConNNYAPrincipal: "Hermano",
      LegajoRUNNA: "RUNNA-67890",
      Barrio: "Barrio Norte",
      Calle: "Calle Falsa",
      NumeroCasa: "456",
      // Campos adicionales del Step 3
      nombre: "Juan",
      apellido: "Pérez",
      fechaDefuncion: null,
      edadAproximada: "12",
      situacionDni: "regular",
      genero: "masculino",
      observaciones: "Hermano que vive con el padre biológico.",
      useDefaultLocalizacion: false,
      localizacion: {
        calle: "Calle Falsa",
        tipo_calle: "calle",
        piso_depto: "",
        lote: "",
        mza: "",
        casa_nro: "456",
        referencia_geo: "Cerca de la escuela primaria",
        geolocalizacion: "-31.420000,-64.190000",
        barrio: 7,
        localidad: 1,
        cpc: 4
      },
      educacion: {
        institucion_educativa: { nombre: "Escuela Provincial N° 456" },
        nivel_alcanzado: "primario",
        esta_escolarizado: true,
        ultimo_cursado: "sexto_grado",
        tipo_escuela: "publica",
        comentarios_educativos: "Buen rendimiento académico.",
        curso: "6to",
        nivel: "primario",
        turno: "mañana"
      },
      cobertura_medica: {
        obra_social: "privada",
        intervencion: "ambulatoria",
        auh: false,
        observaciones: "Tiene obra social por el trabajo del padre.",
        institucion_sanitaria: 5,
        institucion_sanitaria_nombre: "Clínica Privada Norte",
        medico_cabecera: {
          nombre: "Dra. Laura Gómez",
          mail: "lgomez@clinica.com",
          telefono: "351-7890123"
        }
      },
      persona_enfermedades: [],
      demanda_persona: {
        conviviente: false,
        vinculo_demanda: "afectado_indirecto",
        vinculo_con_nnya_principal: "hermano"
      },
      condicionesVulnerabilidad: {
        condicion_vulnerabilidad: [1]
      },
      vulneraciones: [],
      nacionalidad: "argentina"
    },
  ],
  AdultosConvivientes: [
    {
      ApellidoNombre: "González, Marta",
      FechaNacimiento: "1980-01-10",
      DNI: "30123456",
      VinculoConNNYAPrincipal: "Madre",
      // Campos adicionales del Step 2
      nombre: "Marta",
      apellido: "González",
      fechaDefuncion: null,
      edadAproximada: "44",
      situacionDni: "regular",
      genero: "femenino",
      conviviente: true,
      legalmenteResponsable: true,
      ocupacion: "administrativo",
      supuesto_autordv: "no",
      garantiza_proteccion: true,
      observaciones: "Madre de los niños. Trabaja en horario comercial. Muestra preocupación por la situación familiar.",
      useDefaultLocalizacion: true,
      telefono: "351-7654321",
      vinculacion: "madre",
      vinculo_con_nnya_principal: 1,
      vinculo_demanda: "denunciante",
      condicionesVulnerabilidad: [4],
      nacionalidad: "argentina"
    },
  ],
  AdultosNoConvivientes: [
    {
      ApellidoNombre: "González, Carlos",
      FechaNacimiento: "1978-05-05",
      DNI: "30123457",
      VinculoConNNYAPrincipal: "Padre",
      Barrio: "Barrio Sur",
      Calle: "Av. Libertad",
      NumeroCasa: "789",
      // Campos adicionales del Step 2
      nombre: "Carlos",
      apellido: "González",
      fechaDefuncion: null,
      edadAproximada: "46",
      situacionDni: "regular",
      genero: "masculino",
      conviviente: false,
      legalmenteResponsable: true,
      ocupacion: "independiente",
      supuesto_autordv: "si",
      garantiza_proteccion: false,
      observaciones: "Padre biológico de Juan. Separado de la madre hace 5 años. Tiene problemas de consumo de alcohol.",
      useDefaultLocalizacion: false,
      localizacion: {
        calle: "Av. Libertad",
        tipo_calle: "avenida",
        piso_depto: "",
        lote: "",
        mza: "",
        casa_nro: "789",
        referencia_geo: "Frente a la estación de servicio",
        geolocalizacion: "-31.430000,-64.200000",
        barrio: 9,
        localidad: 1,
        cpc: 5
      },
      telefono: "351-9876543",
      vinculacion: "padre",
      vinculo_con_nnya_principal: 2,
      vinculo_demanda: "denunciado",
      condicionesVulnerabilidad: [3, 9],
      nacionalidad: "argentina"
    },
  ],
  AntecedentesDemanda: {
    IdDemandaVinculada: "DV-2025-001",
    NumerosDemanda: "DEM-9999/2025",
  },
  MotivosActuacion: {
    Motivos: "Se registra denuncia por presunta desprotección familiar y vulneración de derechos.",
  },
  IndicadoresEvaluacion: [
    {
      NombreIndicador: "Riesgo de vulnerabilidad social",
      Descripcion: "Falta de recursos y contención en el ámbito familiar.",
      Peso: "Alto",
    },
  ],
  DescripcionSituacion:
    "La situación involucra un conflicto familiar prolongado que afecta la convivencia y el desarrollo de la NNYA, requiriendo intervención institucional.",
  
  // Datos adicionales para completar la estructura con los tres steps
  adjuntos: [
    { archivo: "/documentos/oficio_judicial_456.pdf" },
    { archivo: "/documentos/informe_social.docx" }
  ]
}