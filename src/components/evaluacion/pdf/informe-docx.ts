/**
 * Word Document Generator for Evaluation Reports
 *
 * Generates DOCX files with the same structure as the PDF reports.
 * Uses the docx library for document generation.
 */

import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  Packer,
} from "docx"

interface InformeData {
  InformacionGeneral: {
    Localidad?: string
    Fecha?: string
    CargoFuncion?: string
    NombreApellido?: string
    BloqueDatosRemitente?: string
    TipoInstitucion?: string
    Institucion?: string
    NumerosDemanda?: string
    fecha_oficio_documento?: string
    fecha_ingreso_senaf?: string
    etiqueta?: string
    tipo_demanda?: string
    objetivo_de_demanda?: string
    motivo_ingreso?: string
    submotivo_ingreso?: string
    observaciones?: string
  }
  DatosLocalizacion: {
    TipoCalle?: string
    Calle?: string
    NumeroCasa?: string
    PisoDepto?: string
    Lote?: string
    Manzana?: string
    Barrio?: string
    Localidad?: string
    ReferenciaGeografica?: string
    CPC?: string
    geolocalizacion?: string
  }
  DescripcionSituacion?: string
  Actividades?: Array<{
    FechaHora?: string
    TipoActividad?: string
    Institucion?: string
    Descripcion?: string
  }>
  NNYAConvivientes?: any[]
  NNYANoConvivientes?: any[]
  AdultosConvivientes?: any[]
  AdultosNoConvivientes?: any[]
  AntecedentesDemanda?: any
  MotivosActuacion?: any
  IndicadoresEvaluacion?: any[]
  ValoracionProfesional?: string
  firmantes?: Array<{ nombre: string; cargo: string }>
}

// Helper function to create a section title
const createSectionTitle = (text: string): Paragraph => {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: 26,
      }),
    ],
    spacing: { before: 300, after: 150 },
  })
}

// Helper function to create a subsection title
const createSubsectionTitle = (text: string): Paragraph => {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: 24,
      }),
    ],
    spacing: { before: 200, after: 100 },
  })
}

// Helper function to create a text paragraph
const createText = (text: string, indent = false): Paragraph => {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        size: 22,
      }),
    ],
    indent: indent ? { left: 400 } : undefined,
    spacing: { after: 80 },
  })
}

// Helper function to create a bullet point
const createBullet = (text: string, level = 0): Paragraph => {
  return new Paragraph({
    children: [
      new TextRun({
        text: `• ${text}`,
        size: 22,
      }),
    ],
    indent: { left: 400 + level * 200 },
    spacing: { after: 60 },
  })
}

// Helper function to create person details
const createPersonDetail = (label: string, value: string): Paragraph => {
  return new Paragraph({
    children: [
      new TextRun({
        text: `${label}: `,
        bold: true,
        size: 20,
      }),
      new TextRun({
        text: value || "No especificado",
        size: 20,
      }),
    ],
    indent: { left: 600 },
    spacing: { after: 40 },
  })
}

// Generate NNYA section
const generateNNYASection = (nnyaList: any[], title: string): Paragraph[] => {
  const paragraphs: Paragraph[] = [createSubsectionTitle(title)]

  if (!nnyaList || nnyaList.length === 0) {
    paragraphs.push(createText(`No hay ${title.toLowerCase()} registrados`, true))
    return paragraphs
  }

  nnyaList.forEach((nnya, index) => {
    // Main info
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${index + 1}. ${nnya.ApellidoNombre || "Sin nombre"}`,
            bold: true,
            size: 22,
          }),
          new TextRun({
            text: `, DNI: ${nnya.DNI || "No especificado"}, Vínculo: ${nnya.VinculoConNNYAPrincipal || "No especificado"}`,
            size: 22,
          }),
          nnya.LegajoRUNNA
            ? new TextRun({
                text: `, Legajo RUNNA: ${nnya.LegajoRUNNA}`,
                size: 22,
              })
            : new TextRun({ text: "" }),
        ],
        indent: { left: 400 },
        spacing: { before: 100, after: 60 },
      })
    )

    // Additional details
    if (nnya.genero) paragraphs.push(createPersonDetail("Género", nnya.genero))
    if (nnya.nacionalidad) paragraphs.push(createPersonDetail("Nacionalidad", nnya.nacionalidad))
    if (nnya.situacionDni) paragraphs.push(createPersonDetail("Situación DNI", nnya.situacionDni))
    if (nnya.edadAproximada) paragraphs.push(createPersonDetail("Edad aproximada", nnya.edadAproximada))

    // Education
    if (nnya.educacion) {
      paragraphs.push(createPersonDetail("Educación", ""))
      if (nnya.educacion.institucion_educativa) {
        const institucion =
          typeof nnya.educacion.institucion_educativa === "object"
            ? nnya.educacion.institucion_educativa.nombre
            : nnya.educacion.institucion_educativa
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: `  - Institución: ${institucion}`, size: 18 })],
            indent: { left: 800 },
          })
        )
      }
      if (nnya.educacion.nivel)
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: `  - Nivel: ${nnya.educacion.nivel}`, size: 18 })],
            indent: { left: 800 },
          })
        )
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `  - Escolarizado: ${nnya.educacion.esta_escolarizado ? "Sí" : "No"}`,
              size: 18,
            }),
          ],
          indent: { left: 800 },
        })
      )
    }

    // Medical coverage
    if (nnya.cobertura_medica) {
      paragraphs.push(createPersonDetail("Cobertura médica", ""))
      if (nnya.cobertura_medica.obra_social)
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: `  - Obra social: ${nnya.cobertura_medica.obra_social}`, size: 18 })],
            indent: { left: 800 },
          })
        )
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: `  - AUH: ${nnya.cobertura_medica.auh ? "Sí" : "No"}`, size: 18 })],
          indent: { left: 800 },
        })
      )
    }

    // Vulnerations
    if (nnya.vulneraciones && nnya.vulneraciones.length > 0) {
      paragraphs.push(createPersonDetail("Vulneraciones", ""))
      nnya.vulneraciones.forEach((v: any) => {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `  - ${v.tipo_vulneracion_nombre || "Sin tipo"}, Fecha: ${v.fecha_vulneracion || "No especificada"}, Ámbito: ${v.ambito_vulneracion_nombre || "No especificado"}`,
                size: 18,
              }),
            ],
            indent: { left: 800 },
          })
        )
      })
    }

    if (nnya.observaciones) paragraphs.push(createPersonDetail("Observaciones", nnya.observaciones))
  })

  return paragraphs
}

// Generate Adults section
const generateAdultosSection = (adultosList: any[], title: string): Paragraph[] => {
  const paragraphs: Paragraph[] = [createSubsectionTitle(title)]

  if (!adultosList || adultosList.length === 0) {
    paragraphs.push(createText(`No hay ${title.toLowerCase()} registrados`, true))
    return paragraphs
  }

  adultosList.forEach((adulto, index) => {
    // Main info
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${index + 1}. ${adulto.ApellidoNombre || "Sin nombre"}`,
            bold: true,
            size: 22,
          }),
          new TextRun({
            text: `, DNI: ${adulto.DNI || "No especificado"}, Vínculo: ${adulto.VinculoConNNYAPrincipal || "No especificado"}`,
            size: 22,
          }),
        ],
        indent: { left: 400 },
        spacing: { before: 100, after: 60 },
      })
    )

    // Additional details
    if (adulto.genero) paragraphs.push(createPersonDetail("Género", adulto.genero))
    if (adulto.nacionalidad) paragraphs.push(createPersonDetail("Nacionalidad", adulto.nacionalidad))
    if (adulto.ocupacion) paragraphs.push(createPersonDetail("Ocupación", adulto.ocupacion))
    if (adulto.telefono) paragraphs.push(createPersonDetail("Teléfono", adulto.telefono))

    // Address for non-cohabitants
    if (adulto.Calle) {
      paragraphs.push(
        createPersonDetail("Domicilio", `${adulto.Calle} ${adulto.NumeroCasa || ""}, ${adulto.Barrio || ""}`)
      )
    }

    // Vulnerability conditions
    if (adulto.condicionesVulnerabilidad && adulto.condicionesVulnerabilidad.length > 0) {
      paragraphs.push(createPersonDetail("Condiciones de vulnerabilidad", ""))
      adulto.condicionesVulnerabilidad.forEach((condicion: any) => {
        let label = "Condición no especificada"
        if (typeof condicion === "string") {
          label = condicion
        } else if (condicion?.condicion_vulnerabilidad?.nombre) {
          label = condicion.condicion_vulnerabilidad.nombre
        } else if (condicion?.nombre) {
          label = condicion.nombre
        }
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: `  - ${label}`, size: 18 })],
            indent: { left: 800 },
          })
        )
      })
    }

    if (adulto.observaciones) paragraphs.push(createPersonDetail("Observaciones", adulto.observaciones))
  })

  return paragraphs
}

/**
 * Generate a Word document from evaluation data
 * @param data - The evaluation data
 * @returns Promise<Blob> - The generated document as a Blob
 */
export async function generateInformeDocx(data: InformeData): Promise<Blob> {
  const sections: Paragraph[] = []

  // Title
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Informe de valoración de demanda ingresada",
          bold: true,
          size: 32,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  )

  // Header
  sections.push(
    createText(`${data.InformacionGeneral?.Localidad || ""}, ${data.InformacionGeneral?.Fecha || ""}`)
  )
  sections.push(createText("Sr./a."))
  sections.push(createText(data.InformacionGeneral?.CargoFuncion || ""))
  sections.push(createText(data.InformacionGeneral?.NombreApellido || ""))
  sections.push(createText("S / D"))
  sections.push(new Paragraph({ spacing: { after: 200 } }))

  // General Information
  sections.push(createSectionTitle("Información general del caso"))
  sections.push(createText(data.InformacionGeneral?.BloqueDatosRemitente || ""))
  sections.push(
    createText(
      `${data.InformacionGeneral?.TipoInstitucion || ""} - ${data.InformacionGeneral?.Institucion || ""}`
    )
  )
  sections.push(createText("Ref. N° de Sticker SUAC:"))
  sections.push(createBullet(`Demanda: ${data.InformacionGeneral?.NumerosDemanda || "No especificado"}`))

  if (data.InformacionGeneral?.fecha_oficio_documento) {
    sections.push(createBullet(`Fecha Oficio/Documento: ${data.InformacionGeneral.fecha_oficio_documento}`))
  }
  if (data.InformacionGeneral?.fecha_ingreso_senaf) {
    sections.push(createBullet(`Fecha Ingreso SENAF: ${data.InformacionGeneral.fecha_ingreso_senaf}`))
  }
  if (data.InformacionGeneral?.etiqueta) {
    sections.push(createBullet(`Etiqueta: ${data.InformacionGeneral.etiqueta.toUpperCase()}`))
  }
  if (data.InformacionGeneral?.tipo_demanda) {
    sections.push(createBullet(`Tipo de Demanda: ${data.InformacionGeneral.tipo_demanda}`))
  }
  if (data.InformacionGeneral?.objetivo_de_demanda) {
    sections.push(createBullet(`Objetivo de Demanda: ${data.InformacionGeneral.objetivo_de_demanda}`))
  }
  if (data.InformacionGeneral?.motivo_ingreso) {
    sections.push(createBullet(`Motivo de Ingreso: ${data.InformacionGeneral.motivo_ingreso}`))
  }
  if (data.InformacionGeneral?.submotivo_ingreso) {
    sections.push(createBullet(`Submotivo de Ingreso: ${data.InformacionGeneral.submotivo_ingreso}`))
  }
  if (data.InformacionGeneral?.observaciones) {
    sections.push(createBullet(`Observaciones: ${data.InformacionGeneral.observaciones}`))
  }

  // Location
  sections.push(createSectionTitle("Domicilio grupo familiar conviviente"))
  sections.push(
    createBullet(
      `${data.DatosLocalizacion?.TipoCalle || "Calle"} ${data.DatosLocalizacion?.Calle || ""} N° ${data.DatosLocalizacion?.NumeroCasa || ""}`
    )
  )
  if (data.DatosLocalizacion?.PisoDepto) {
    sections.push(createBullet(`Piso/Depto: ${data.DatosLocalizacion.PisoDepto}`))
  }
  if (data.DatosLocalizacion?.Lote) {
    sections.push(createBullet(`Lote: ${data.DatosLocalizacion.Lote}`))
  }
  if (data.DatosLocalizacion?.Manzana) {
    sections.push(createBullet(`Manzana: ${data.DatosLocalizacion.Manzana}`))
  }
  sections.push(
    createBullet(`${data.DatosLocalizacion?.Barrio || ""}, ${data.DatosLocalizacion?.Localidad || ""}`)
  )
  if (data.DatosLocalizacion?.ReferenciaGeografica) {
    sections.push(createBullet(`Referencia: ${data.DatosLocalizacion.ReferenciaGeografica}`))
  }
  if (data.DatosLocalizacion?.CPC) {
    sections.push(createBullet(`CPC: ${data.DatosLocalizacion.CPC}`))
  }

  // Situation Description
  sections.push(createSectionTitle("Descripción de la situación"))
  sections.push(
    createText(
      "Me dirijo a Ud. a fin de informar sobre lo actuado en relación al/los niños/as/adolescentes de referencia. Se recibe puesta en conocimiento por parte del organismo/persona informante referenciada en la cual se comunica posible situación de amenaza/vulneración de derechos:"
    )
  )
  sections.push(createText(data.DescripcionSituacion || "No especificada", true))

  // Activities
  sections.push(createSectionTitle("Actividades realizadas"))
  sections.push(createText("Del relevamiento realizado (con las técnica/instrumentos de:"))
  if (data.Actividades && data.Actividades.length > 0) {
    data.Actividades.forEach((act) => {
      sections.push(
        createBullet(
          `${act.FechaHora || ""} Actividad: ${act.TipoActividad || ""} (${act.Institucion || ""}). Observación: ${act.Descripcion || ""}`
        )
      )
    })
  } else {
    sections.push(createText("No se registraron actividades", true))
  }
  sections.push(createText(", surgen los siguientes datos y consideraciones:"))

  // Family Description
  sections.push(createSectionTitle("Descripción del grupo familiar"))

  // NNYA sections
  sections.push(...generateNNYASection(data.NNYAConvivientes || [], "NNyA convivientes"))
  sections.push(...generateNNYASection(data.NNYANoConvivientes || [], "NNyA no convivientes"))

  // Adults sections
  sections.push(...generateAdultosSection(data.AdultosConvivientes || [], "Adultos convivientes"))
  sections.push(...generateAdultosSection(data.AdultosNoConvivientes || [], "Adultos no convivientes"))

  // Antecedents
  sections.push(createSectionTitle("Antecedentes de actuación"))
  if (Array.isArray(data.AntecedentesDemanda) && data.AntecedentesDemanda.length > 0) {
    data.AntecedentesDemanda.forEach((ant: any, index: number) => {
      sections.push(
        createBullet(`${index + 1}. ID: ${ant.IdDemandaVinculada || ""}, Número: ${ant.NumerosDemanda || ""}`)
      )
    })
  } else if (data.AntecedentesDemanda?.IdDemandaVinculada) {
    sections.push(
      createBullet(
        `ID: ${data.AntecedentesDemanda.IdDemandaVinculada}, Número: ${data.AntecedentesDemanda.NumerosDemanda || ""}`
      )
    )
  } else {
    sections.push(createText("No hay antecedentes registrados", true))
  }

  // Reasons
  sections.push(createSectionTitle("Motivo de las actuaciones"))
  if (Array.isArray(data.MotivosActuacion) && data.MotivosActuacion.length > 0) {
    data.MotivosActuacion.forEach((motivo: any) => {
      sections.push(createBullet(motivo.Motivos || ""))
    })
  } else if (data.MotivosActuacion?.Motivos) {
    sections.push(createBullet(data.MotivosActuacion.Motivos))
  } else {
    sections.push(createText("No hay motivos registrados", true))
  }

  // Evaluation Indicators
  sections.push(createSectionTitle("Indicadores de vulneración de la evaluación"))
  if (data.IndicadoresEvaluacion && data.IndicadoresEvaluacion.length > 0) {
    data.IndicadoresEvaluacion.forEach((ind: any, index: number) => {
      sections.push(
        createBullet(
          `${index + 1}. ${ind.NombreIndicador || ""} - ${ind.Descripcion || ""} - Peso: ${ind.Peso || ""}`
        )
      )
    })
  } else {
    sections.push(createText("No hay indicadores registrados", true))
  }

  // Professional Assessment
  sections.push(createSectionTitle("Valoración Profesional / Conclusiones"))
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text:
            data.ValoracionProfesional ||
            "Dado el análisis de la situación y los indicadores de vulneración identificados, se recomienda APERTURA DE LEGAJO para realizar un seguimiento adecuado del caso y garantizar la protección de los derechos de los NNyA involucrados.",
          size: 22,
        }),
      ],
      border: {
        top: { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF" },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF" },
        left: { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF" },
        right: { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF" },
      },
      shading: { fill: "F9F9F9" },
      spacing: { before: 100, after: 100 },
    })
  )

  // Signature
  sections.push(new Paragraph({ spacing: { before: 600 } }))
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: "Sin más que informar, saludamos muy atte.", size: 22 })],
      alignment: AlignmentType.CENTER,
    })
  )
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: "Firma Profesionales de Equipo Técnico.", size: 22 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  )

  // Firmantes if available
  if (data.firmantes && data.firmantes.length > 0) {
    sections.push(new Paragraph({ spacing: { before: 400 } }))
    data.firmantes.forEach((firmante) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: "________________________", size: 22 }),
          ],
          alignment: AlignmentType.CENTER,
        })
      )
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: firmante.nombre, bold: true, size: 22 }),
          ],
          alignment: AlignmentType.CENTER,
        })
      )
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: firmante.cargo, size: 20 }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      )
    })
  }

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: sections,
      },
    ],
  })

  // Generate blob
  return await Packer.toBlob(doc)
}

/**
 * Generate filename for the Word document
 * @param data - The evaluation data
 * @returns string - The filename
 */
export function generateDocxFileName(data: InformeData): string {
  const demandaNum = data.InformacionGeneral?.NumerosDemanda?.replace(/\//g, "-") || "nuevo"
  const date = new Date().toISOString().slice(0, 10)
  return `informe_valoracion_${demandaNum}_${date}.docx`
}
