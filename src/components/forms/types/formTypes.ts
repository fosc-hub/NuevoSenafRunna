export interface DropdownOption {
  key: string
  value: string
}

// Interface for adult person data
export interface AdultoData {
  nombre: string
  apellido: string
  fechaNacimiento: string | null
  fechaDefuncion: string | null
  edadAproximada: string
  dni: string
  situacionDni: string
  genero: string
  conviviente: boolean
  legalmenteResponsable: boolean
  ocupacion: string
  supuesto_autordv: string
  garantiza_proteccion: boolean
  observaciones: string
  useDefaultLocalizacion: boolean
  telefono: string
  vinculacion: string
  vinculo_con_nnya_principal: number
  vinculo_demanda: string
  condicionesVulnerabilidad: string[]
  nacionalidad: string
  localizacion?: {
    calle: string
    localidad: string
    tipo_calle?: string
    casa_nro?: string
    piso_depto?: string
    lote?: string
    mza?: string
    referencia_geo?: string
    barrio?: string
    cpc?: string
    geolocalizacion?: string
  } | null
}

// Interface for child/adolescent data
export interface NnyaData {
  personaId?: number
  demandaPersonaId?: number
  nombre: string
  apellido: string
  fechaNacimiento: string | null
  fechaDefuncion: string | null
  edadAproximada: string
  dni: string
  situacionDni: string
  genero: string
  observaciones: string
  useDefaultLocalizacion: boolean
  localizacion: {
    calle: string
    tipo_calle: string
    piso_depto: string
    lote: string
    mza: string
    casa_nro: string
    referencia_geo: string
    geolocalizacion: string
    barrio: string | null
    localidad: string | null
    cpc: string | null
  }
  educacion: {
    institucion_educativa: { id?: number; nombre: string } | string
    nivel_alcanzado: string
    esta_escolarizado: boolean
    ultimo_cursado: string
    tipo_escuela: string
    comentarios_educativos: string
    curso: string
    nivel: string
    turno: string
    comentarios: string
  }
  cobertura_medica: {
    id?: number
    obra_social: string
    intervencion: string
    auh: boolean
    observaciones: string
    institucion_sanitaria: { id?: number; nombre: string } | null
    medico_cabecera: { id?: number; nombre: string; mail?: string; telefono?: string } | null
    deleted?: boolean
  }
  persona_enfermedades: string[]
  demanda_persona: {
    id?: number
    conviviente: boolean
    vinculo_demanda: string
    vinculo_con_nnya_principal: string
  }
  condicionesVulnerabilidad: string[]
  vulneraciones: string[]
  // LEG-01: Duplicate detection and legajo linking
  legajo_existente_vinculado?: {
    legajo_id: number
    legajo_numero: string
    fue_vinculado: boolean
  } | null
  skip_duplicate_check?: boolean
}

// Interface for vinculo data during demanda registration
export interface VinculoFormData {
  legajo: number | null;           // ID del legajo
  medida: number | null;           // ID de la medida (opcional)
  tipo_vinculo: number | null;     // ID del tipo de vínculo
  justificacion: string;           // Justificación (min 20 chars)
  // UI helper fields
  legajo_info?: {
    id: number;
    numero: string;
    nnya_nombre: string;
    medidas_activas: Array<{
      id: number;
      numero_medida: string;
      tipo_medida: string;
      estado_vigencia: string;
    }>;
  };
}

export interface FormData {
  presuntos_delitos: null
  motivo_ingreso: any
  submotivo_ingreso: any
  envio_de_respuesta: any
  codigosDemanda: Array<{ tipo: string; codigo: string }>
  zona: any
  observaciones: string
  ninosAdolescentes: NnyaData[]
  adultosConvivientes: AdultoData[]
  id: number
  nombre: string
  fecha_oficio_documento: string | null;
  fecha_ingreso_senaf: string | null;
  bloque_datos_remitente: string | null;
  tipo_demanda: string | null;
  tipo_institucion: string | null;
  institucion: string | { nombre: string; tipo_institucion?: string | number };
  nro_notificacion_102: string | null;
  nro_sac: string | null;
  nro_suac: string | null;
  nro_historia_clinica: string | null;
  nro_oficio_web: string | null;
  autos_caratulados: string;
  ambito_vulneracion: string;
  descripcion: string;
  presuntaVulneracion: {
    motivos: string | null;
  };
  localizacion: {
    calle: string;
    localidad: string;
    tipo_calle?: string;
    casa_nro?: string;
    piso_depto?: string;
    lote?: string;
    mza?: string;
    referencia_geo?: string;
    barrio?: string;
    cpc?: string;
    geolocalizacion?: string;
  } | null;
  etiqueta: string | null;
  objetivo_de_demanda: string | null;
  estado_demanda: string | null;
  adjuntos: Array<File | { archivo: string }>;
  createNewUsuarioExterno: boolean;
  // CARGA_OFICIOS fields (REG-01 GAP-06)
  tipo_oficio?: number | string;              // FK to TTipoOficio
  tipo_medida?: string;                        // MPI | MPE | MPJ
  numero_expediente?: string;                  // Número de expediente judicial
  caratula?: string;                           // Carátula del expediente
  plazo_dias?: number;                         // Plazo en días para responder
  fecha_vencimiento_oficio?: string | null;    // Fecha vencimiento (YYYY-MM-DD)
  // REG-01: Vínculos para crear junto con la demanda
  vinculos?: VinculoFormData[];
}

export interface DropdownData {
  vinculo_demanda_choices: any
  vinculo_con_nnya_principal_choices: any
  obra_social_choices: any
  intervencion_choices: any
  instituciones_educativas: any
  // Some payloads provide singular key name; keep as optional for compatibility
  institucion_educativa?: any
  instituciones_sanitarias: any
  // Some payloads provide singular key name; keep as optional for compatibility
  institucion_sanitaria?: any
  categoria_motivos: any
  categoria_submotivos: any
  gravedades_vulneracion: any
  urgencias_vulneracion: any
  nacionalidad_choices: any
  bloques_datos_remitente: any
  tipo_institucion_demanda: any
  tipo_codigo_demanda: any
  ambito_vulneracion: any
  categoria_motivo: any
  categoria_submotivo: any
  tipo_calle_choices: any
  localidad: any
  cpc: any
  barrio: any
  situacion_dni_choices: DropdownOption[]
  genero_choices: DropdownOption[]
  vinculos: { id: string; nombre: string }[]
  condiciones_vulnerabilidad: {
    nnya: any; id: string; nombre: string; descripcion: string; adulto: boolean; peso: number
  }[]
  origenes: { id: string; nombre: string }[]
  etiqueta: any
  envio_de_respuesta_choices: any
  objetivo_de_demanda_choices: any
  zonas: any
  // Education dropdown fields
  // Some payloads provide nivel_alcanzado_choices instead; keep both
  nivel_alcanzado_choices?: any
  nivel_educativo_choices: any
  ultimo_cursado_choices: any
  tipo_escuela_choices: any
  // CARGA_OFICIOS dropdown fields (REG-01 GAP-06)
  tipo_oficio?: Array<{ id: number; nombre: string; descripcion?: string; activo?: boolean; orden?: number }>;
  tipo_medida_choices?: DropdownOption[];  // MPI, MPE, MPJ
  // REG-01: Tipos de vínculo para dropdown
  tipos_vinculo?: Array<{
    id: number;
    codigo: string;
    nombre: string;
    descripcion: string;
    activo: boolean;
  }>;
  // Add other dropdown fields as needed
}

