export interface DropdownOption {
    key: string
    value: string
  }
  export interface FormData
  {
    presuntos_delitos: null
    motivo_ingreso: any
    submotivo_ingreso: any
    envio_de_respuesta: any
    codigosDemanda: never[]
    zona: any
    observaciones: string
    ninosAdolescentes: any
    adultosConvivientes: any
    id: number
    nombre: string
    fecha_oficio_documento: string | null;
    fecha_ingreso_senaf: string | null;
    bloque_datos_remitente: string | null;
    tipo_demanda: string | null;
    tipo_institucion: string | null;
    institucion: string;
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
    localizacion: string | null;
    
  }
  export interface DropdownData {
    vinculo_demanda_choices: any
    vinculo_con_nnya_principal_choices: any
    obra_social_choices: any
    instituciones_educativas: any
    instituciones_sanitarias: any
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
      nnya: any; id: string; nombre: string; descripcion: string; adulto: boolean 
}[]
    origenes: { id: string; nombre: string }[]
    // Add other dropdown fields as needed
  }
  
  