import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer"

// Crear los estilos
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 12,
    marginBottom: 8,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 13,
    marginTop: 10,
    marginBottom: 6,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 15,
  },
  text: {
    marginBottom: 6,
  },
  header: {
    marginBottom: 20,
  },
  addressSection: {
    marginBottom: 15,
    marginLeft: 10,
  },
  listItem: {
    marginLeft: 15,
    marginBottom: 4,
  },
  activityItem: {
    marginBottom: 8,
  },
  personItem: {
    marginBottom: 8,
    marginLeft: 10,
  },
  personDetail: {
    marginLeft: 20,
    marginBottom: 4,
    fontSize: 11,
  },
  signature: {
    marginTop: 40,
    textAlign: "center",
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    width: "33%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    backgroundColor: "#f0f0f0",
    padding: 5,
    fontWeight: "bold",
  },
  tableCol: {
    width: "33%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    padding: 5,
  },
  tableColWide: {
    width: "50%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    padding: 5,
  },
  tableColNarrow: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    padding: 5,
  },
  pageNumber: {
    position: "absolute",
    fontSize: 10,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "grey",
  },
  infoBox: {
    padding: 8,
    marginBottom: 10,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    backgroundColor: "#f9f9f9",
  },
  subDetail: {
    marginLeft: 30,
    marginBottom: 3,
    fontSize: 10,
  },
})

interface InformePDFProps {
  data: any
}

const InformePDF = ({ data }: InformePDFProps) => (
  <Document>
    <Page style={styles.page}>
      {/* Título */}
      <Text style={styles.title}>Informe de valoración de demanda ingresada</Text>

      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.text}>
          {data.InformacionGeneral.Localidad}, {data.InformacionGeneral.Fecha}
        </Text>
        <Text style={styles.text}>Sr./a.</Text>
        <Text style={styles.text}>{data.InformacionGeneral.CargoFuncion}</Text>
        <Text style={styles.text}>{data.InformacionGeneral.NombreApellido}</Text>
        <Text style={styles.text}>S / D</Text>
      </View>

      {/* Información general del caso */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Información general del caso</Text>
        <Text style={styles.text}>{data.InformacionGeneral.BloqueDatosRemitente}</Text>
        <Text style={styles.text}>
          {data.InformacionGeneral.TipoInstitucion} - {data.InformacionGeneral.Institucion}
        </Text>
        <Text style={styles.text}>Ref. N° de Sticker SUAC:</Text>
        <Text style={styles.listItem}>- Demanda: {data.InformacionGeneral.NumerosDemanda}</Text>

        {/* Información adicional si está disponible */}
        {data.InformacionGeneral.fecha_oficio_documento && (
          <Text style={styles.listItem}>
            - Fecha Oficio/Documento: {data.InformacionGeneral.fecha_oficio_documento}
          </Text>
        )}
        {data.InformacionGeneral.fecha_ingreso_senaf && (
          <Text style={styles.listItem}>- Fecha Ingreso SENAF: {data.InformacionGeneral.fecha_ingreso_senaf}</Text>
        )}
        {data.InformacionGeneral.etiqueta && (
          <Text style={styles.listItem}>- Etiqueta: {data.InformacionGeneral.etiqueta.toUpperCase()}</Text>
        )}
        {data.InformacionGeneral.tipo_demanda && (
          <Text style={styles.listItem}>- Tipo de Demanda: {data.InformacionGeneral.tipo_demanda}</Text>
        )}
        {data.InformacionGeneral.objetivo_de_demanda && (
          <Text style={styles.listItem}>- Objetivo de Demanda: {data.InformacionGeneral.objetivo_de_demanda}</Text>
        )}
        {data.InformacionGeneral.motivo_ingreso && (
          <Text style={styles.listItem}>- Motivo de Ingreso: {data.InformacionGeneral.motivo_ingreso}</Text>
        )}
        {data.InformacionGeneral.submotivo_ingreso && (
          <Text style={styles.listItem}>- Submotivo de Ingreso: {data.InformacionGeneral.submotivo_ingreso}</Text>
        )}
        {data.InformacionGeneral.observaciones && (
          <Text style={styles.listItem}>- Observaciones: {data.InformacionGeneral.observaciones}</Text>
        )}
      </View>

      {/* Domicilio */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Domicilio grupo familiar conviviente:</Text>
        <View style={styles.addressSection}>
          <Text style={styles.text}>
            - {data.DatosLocalizacion.TipoCalle || "Calle"} {data.DatosLocalizacion.Calle} N°{" "}
            {data.DatosLocalizacion.NumeroCasa}
          </Text>
          {data.DatosLocalizacion.PisoDepto && (
            <Text style={styles.text}>- Piso/Depto: {data.DatosLocalizacion.PisoDepto}</Text>
          )}
          {data.DatosLocalizacion.Lote && <Text style={styles.text}>- Lote: {data.DatosLocalizacion.Lote}</Text>}
          {data.DatosLocalizacion.Manzana && (
            <Text style={styles.text}>- Manzana: {data.DatosLocalizacion.Manzana}</Text>
          )}
          <Text style={styles.text}>
            - {data.DatosLocalizacion.Barrio}, {data.DatosLocalizacion.Localidad}
          </Text>
          {data.DatosLocalizacion.ReferenciaGeografica && (
            <Text style={styles.text}>- Referencia: {data.DatosLocalizacion.ReferenciaGeografica}</Text>
          )}
          <Text style={styles.text}>- CPC: {data.DatosLocalizacion.CPC}</Text>

          {/* Información adicional de localización si está disponible */}
          {data.DatosLocalizacion.geolocalizacion && (
            <Text style={styles.text}>- Geolocalización: {data.DatosLocalizacion.geolocalizacion}</Text>
          )}
          {data.DatosLocalizacion.barrio_id && (
            <Text style={styles.text}>- Barrio ID: {data.DatosLocalizacion.barrio_id}</Text>
          )}
          {data.DatosLocalizacion.localidad_id && (
            <Text style={styles.text}>- Localidad ID: {data.DatosLocalizacion.localidad_id}</Text>
          )}
          {data.DatosLocalizacion.cpc_id && <Text style={styles.text}>- CPC ID: {data.DatosLocalizacion.cpc_id}</Text>}
        </View>
      </View>

      {/* Introducción */}
      <View style={styles.section}>
        <Text style={styles.text}>
          Me dirijo a Ud. a fin de informar sobre lo actuado en relación al/los niños/as/adolescentes de referencia. Se
          recibe puesta en conocimiento por parte del organismo/persona informante referenciada en la cual se comunica
          posible situación de amenaza/vulneración de derechos:
        </Text>
        <Text style={styles.text}>{data.DescripcionSituacion}</Text>
      </View>

      {/* Actividades realizadas */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Actividades realizadas</Text>
        <Text style={styles.text}>Del relevamiento realizado (con las técnica/instrumentos de:</Text>
        {data.Actividades && data.Actividades.length > 0 ? (
          data.Actividades.map((act: any, index: number) => (
            <View key={index} style={styles.activityItem}>
              <Text style={styles.text}>
                ● {act.FechaHora} Actividad: {act.TipoActividad} ({act.Institucion}). Observación: {act.Descripcion}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.text}>No se registraron actividades</Text>
        )}
        <Text style={styles.text}>, surgen los siguientes datos y consideraciones:</Text>
      </View>

      {/* Descripción del grupo familiar */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Descripción del grupo familiar</Text>

        {/* NNyA convivientes */}
        <Text style={styles.sectionTitle}>NNyA convivientes</Text>
        {data.NNYAConvivientes && data.NNYAConvivientes.length > 0 ? (
          data.NNYAConvivientes.map((nnya: any, index: number) => (
            <View key={index} style={styles.personItem}>
              <Text style={styles.text}>
                {index + 1}. {nnya.ApellidoNombre}, DNI: {nnya.DNI}, Vínculo: {nnya.VinculoConNNYAPrincipal}
                {nnya.LegajoRUNNA ? `, Legajo RUNNA: ${nnya.LegajoRUNNA}` : ""}
              </Text>

              {/* Información adicional si está disponible */}
              {nnya.genero && <Text style={styles.personDetail}>Género: {nnya.genero}</Text>}
              {nnya.nacionalidad && <Text style={styles.personDetail}>Nacionalidad: {nnya.nacionalidad}</Text>}
              {nnya.situacionDni && <Text style={styles.personDetail}>Situación DNI: {nnya.situacionDni}</Text>}
              {nnya.edadAproximada && <Text style={styles.personDetail}>Edad aproximada: {nnya.edadAproximada}</Text>}

              {/* Educación */}
              {nnya.educacion && (
                <View>
                  <Text style={styles.personDetail}>Educación:</Text>
                  {nnya.educacion.institucion_educativa && (
                    <Text style={styles.subDetail}>
                      Institución: {typeof nnya.educacion.institucion_educativa === 'object' ?
                        nnya.educacion.institucion_educativa.nombre || '' :
                        String(nnya.educacion.institucion_educativa || '')}
                    </Text>
                  )}
                  {nnya.educacion.nivel && <Text style={styles.subDetail}>Nivel: {String(nnya.educacion.nivel)}</Text>}
                  {nnya.educacion.curso && <Text style={styles.subDetail}>Curso: {String(nnya.educacion.curso)}</Text>}
                  {nnya.educacion.turno && <Text style={styles.subDetail}>Turno: {String(nnya.educacion.turno)}</Text>}
                  <Text style={styles.subDetail}>Escolarizado: {nnya.educacion.esta_escolarizado ? "Sí" : "No"}</Text>
                  {nnya.educacion.tipo_escuela && (
                    <Text style={styles.subDetail}>Tipo de escuela: {String(nnya.educacion.tipo_escuela)}</Text>
                  )}
                </View>
              )}

              {/* Cobertura médica */}
              {nnya.cobertura_medica && (
                <View>
                  <Text style={styles.personDetail}>Cobertura médica:</Text>
                  {nnya.cobertura_medica.obra_social && (
                    <Text style={styles.subDetail}>Obra social: {String(nnya.cobertura_medica.obra_social)}</Text>
                  )}
                  {nnya.cobertura_medica.institucion_sanitaria_nombre && (
                    <Text style={styles.subDetail}>
                      Institución sanitaria: {String(nnya.cobertura_medica.institucion_sanitaria_nombre)}
                    </Text>
                  )}
                  {nnya.cobertura_medica.intervencion && (
                    <Text style={styles.subDetail}>Intervención: {nnya.cobertura_medica.intervencion}</Text>
                  )}
                  <Text style={styles.subDetail}>AUH: {nnya.cobertura_medica.auh ? "Sí" : "No"}</Text>
                  {nnya.cobertura_medica.medico_cabecera && (
                    <Text style={styles.subDetail}>
                      Médico de cabecera: {typeof nnya.cobertura_medica.medico_cabecera === 'object' ?
                        nnya.cobertura_medica.medico_cabecera.nombre || '' :
                        String(nnya.cobertura_medica.medico_cabecera || '')}
                    </Text>
                  )}
                </View>
              )}

              {/* Enfermedades */}
              {nnya.persona_enfermedades && nnya.persona_enfermedades.length > 0 && (
                <View>
                  <Text style={styles.personDetail}>Enfermedades:</Text>
                  {nnya.persona_enfermedades.map((enfermedad: any, idx: number) => (
                    <Text key={idx} style={styles.subDetail}>
                      - {typeof enfermedad.enfermedad === 'object' ?
                        enfermedad.enfermedad.nombre || '' :
                        String(enfermedad.enfermedad_nombre || '')}: {String(enfermedad.diagnostico || "Sin diagnóstico")}, Tratamiento:{" "}
                      {String(enfermedad.tratamiento || "Sin tratamiento")}
                    </Text>
                  ))}
                </View>
              )}

              {/* Vulneraciones */}
              {nnya.vulneraciones && nnya.vulneraciones.length > 0 && (
                <View>
                  <Text style={styles.personDetail}>Vulneraciones:</Text>
                  {nnya.vulneraciones.map((vulneracion: any, idx: number) => (
                    <Text key={idx} style={styles.subDetail}>
                      - {String(vulneracion.tipo_vulneracion_nombre || '')}, Fecha: {String(vulneracion.fecha_vulneracion || "No especificada")}
                      , Ámbito: {String(vulneracion.ambito_vulneracion_nombre || "No especificado")}
                    </Text>
                  ))}
                </View>
              )}

              {nnya.observaciones && <Text style={styles.personDetail}>Observaciones: {nnya.observaciones}</Text>}
            </View>
          ))
        ) : (
          <View style={styles.personItem}>
            <Text style={styles.text}>No hay NNyA convivientes registrados</Text>
          </View>
        )}
      </View>
    </Page>

    <Page style={styles.page}>
      {/* NNyA no convivientes */}
      <Text style={styles.subtitle}>NNyA no convivientes</Text>
      {data.NNYANoConvivientes && data.NNYANoConvivientes.length > 0 ? (
        data.NNYANoConvivientes.map((nnya: any, index: number) => (
          <View key={index} style={styles.personItem}>
            <Text style={styles.text}>
              {index + 1}. {nnya.ApellidoNombre}, DNI: {nnya.DNI}, Vínculo: {nnya.VinculoConNNYAPrincipal}
              {nnya.LegajoRUNNA ? `, Legajo RUNNA: ${nnya.LegajoRUNNA}` : ""}
            </Text>
            <Text style={styles.personDetail}>
              Domicilio: {nnya.Calle} {nnya.NumeroCasa}, {nnya.Barrio}
            </Text>

            {/* Información adicional si está disponible */}
            {nnya.genero && <Text style={styles.personDetail}>Género: {nnya.genero}</Text>}
            {nnya.nacionalidad && <Text style={styles.personDetail}>Nacionalidad: {nnya.nacionalidad}</Text>}
            {nnya.situacionDni && <Text style={styles.personDetail}>Situación DNI: {nnya.situacionDni}</Text>}
            {nnya.edadAproximada && <Text style={styles.personDetail}>Edad aproximada: {nnya.edadAproximada}</Text>}

            {/* Localización detallada */}
            {nnya.localizacion && (
              <View>
                <Text style={styles.personDetail}>Localización detallada:</Text>
                {nnya.localizacion.tipo_calle && (
                  <Text style={styles.subDetail}>Tipo de calle: {nnya.localizacion.tipo_calle}</Text>
                )}
                {nnya.localizacion.piso_depto && (
                  <Text style={styles.subDetail}>Piso/Depto: {nnya.localizacion.piso_depto}</Text>
                )}
                {nnya.localizacion.referencia_geo && (
                  <Text style={styles.subDetail}>Referencia geográfica: {nnya.localizacion.referencia_geo}</Text>
                )}
                {nnya.localizacion.geolocalizacion && (
                  <Text style={styles.subDetail}>Geolocalización: {nnya.localizacion.geolocalizacion}</Text>
                )}
              </View>
            )}

            {/* Educación */}
            {nnya.educacion && (
              <View>
                <Text style={styles.personDetail}>Educación:</Text>
                {nnya.educacion.institucion_educativa && (
                  <Text style={styles.subDetail}>
                    Institución: {typeof nnya.educacion.institucion_educativa === 'object' ?
                      nnya.educacion.institucion_educativa.nombre || '' :
                      String(nnya.educacion.institucion_educativa || '')}
                  </Text>
                )}
                {nnya.educacion.nivel && <Text style={styles.subDetail}>Nivel: {String(nnya.educacion.nivel)}</Text>}
                {nnya.educacion.curso && <Text style={styles.subDetail}>Curso: {String(nnya.educacion.curso)}</Text>}
                {nnya.educacion.turno && <Text style={styles.subDetail}>Turno: {String(nnya.educacion.turno)}</Text>}
                <Text style={styles.subDetail}>Escolarizado: {nnya.educacion.esta_escolarizado ? "Sí" : "No"}</Text>
                {nnya.educacion.tipo_escuela && (
                  <Text style={styles.subDetail}>Tipo de escuela: {String(nnya.educacion.tipo_escuela)}</Text>
                )}
              </View>
            )}

            {/* Cobertura médica */}
            {nnya.cobertura_medica && (
              <View>
                <Text style={styles.personDetail}>Cobertura médica:</Text>
                {nnya.cobertura_medica.obra_social && (
                  <Text style={styles.subDetail}>Obra social: {String(nnya.cobertura_medica.obra_social)}</Text>
                )}
                {nnya.cobertura_medica.institucion_sanitaria_nombre && (
                  <Text style={styles.subDetail}>
                    Institución sanitaria: {String(nnya.cobertura_medica.institucion_sanitaria_nombre)}
                  </Text>
                )}
                <Text style={styles.subDetail}>AUH: {nnya.cobertura_medica.auh ? "Sí" : "No"}</Text>
              </View>
            )}

            {/* Enfermedades */}
            {nnya.persona_enfermedades && nnya.persona_enfermedades.length > 0 && (
              <View>
                <Text style={styles.personDetail}>Enfermedades:</Text>
                {nnya.persona_enfermedades.map((enfermedad: any, idx: number) => (
                  <Text key={idx} style={styles.subDetail}>
                    - {typeof enfermedad.enfermedad === 'object' ?
                      enfermedad.enfermedad.nombre || '' :
                      String(enfermedad.enfermedad_nombre || '')}: {String(enfermedad.diagnostico || "Sin diagnóstico")}, Tratamiento:{" "}
                    {String(enfermedad.tratamiento || "Sin tratamiento")}
                  </Text>
                ))}
              </View>
            )}

            {/* Vulneraciones */}
            {nnya.vulneraciones && nnya.vulneraciones.length > 0 && (
              <View>
                <Text style={styles.personDetail}>Vulneraciones:</Text>
                {nnya.vulneraciones.map((vulneracion: any, idx: number) => (
                  <Text key={idx} style={styles.subDetail}>
                    - {String(vulneracion.tipo_vulneracion_nombre || '')}, Fecha: {String(vulneracion.fecha_vulneracion || "No especificada")}
                    , Ámbito: {String(vulneracion.ambito_vulneracion_nombre || "No especificado")}
                  </Text>
                ))}
              </View>
            )}

            {nnya.observaciones && <Text style={styles.personDetail}>Observaciones: {nnya.observaciones}</Text>}
          </View>
        ))
      ) : (
        <View style={styles.personItem}>
          <Text style={styles.text}>No hay NNyA no convivientes registrados</Text>
        </View>
      )}

      {/* Adultos convivientes */}
      <Text style={styles.subtitle}>Adultos convivientes</Text>
      {data.AdultosConvivientes && data.AdultosConvivientes.length > 0 ? (
        data.AdultosConvivientes.map((adulto: any, index: number) => (
          <View key={index} style={styles.personItem}>
            <Text style={styles.text}>
              {index + 1}. {adulto.ApellidoNombre}, DNI: {adulto.DNI}, Vínculo: {adulto.VinculoConNNYAPrincipal}
            </Text>

            {/* Información adicional si está disponible */}
            {adulto.genero && <Text style={styles.personDetail}>Género: {adulto.genero}</Text>}
            {adulto.nacionalidad && <Text style={styles.personDetail}>Nacionalidad: {adulto.nacionalidad}</Text>}
            {adulto.situacionDni && <Text style={styles.personDetail}>Situación DNI: {adulto.situacionDni}</Text>}
            {adulto.edadAproximada && <Text style={styles.personDetail}>Edad aproximada: {adulto.edadAproximada}</Text>}
            {adulto.ocupacion && <Text style={styles.personDetail}>Ocupación: {adulto.ocupacion}</Text>}
            {adulto.telefono && <Text style={styles.personDetail}>Teléfono: {adulto.telefono}</Text>}

            {/* Información adicional */}
            {adulto.vinculacion && <Text style={styles.personDetail}>Vinculación: {adulto.vinculacion}</Text>}
            {adulto.vinculo_demanda && (
              <Text style={styles.personDetail}>Vínculo con demanda: {adulto.vinculo_demanda}</Text>
            )}
            {adulto.legalmenteResponsable !== undefined && (
              <Text style={styles.personDetail}>
                Legalmente responsable: {adulto.legalmenteResponsable ? "Sí" : "No"}
              </Text>
            )}
            {adulto.supuesto_autordv && (
              <Text style={styles.personDetail}>Supuesto autor DV: {adulto.supuesto_autordv}</Text>
            )}
            {adulto.garantiza_proteccion !== undefined && (
              <Text style={styles.personDetail}>Garantiza protección: {adulto.garantiza_proteccion ? "Sí" : "No"}</Text>
            )}

            {/* Condiciones de vulnerabilidad */}
            {adulto.condicionesVulnerabilidad && adulto.condicionesVulnerabilidad.length > 0 && (
              <View>
                <Text style={styles.personDetail}>Condiciones de vulnerabilidad:</Text>
                {adulto.condicionesVulnerabilidad.map((condicion: any, idx: number) => (
                  <Text key={idx} style={styles.subDetail}>
                    - {typeof condicion === 'object' ?
                      (condicion.condicion_vulnerabilidad || JSON.stringify(condicion)) :
                      String(condicion)}
                  </Text>
                ))}
              </View>
            )}

            {adulto.observaciones && <Text style={styles.personDetail}>Observaciones: {adulto.observaciones}</Text>}
          </View>
        ))
      ) : (
        <View style={styles.personItem}>
          <Text style={styles.text}>No hay adultos convivientes registrados</Text>
        </View>
      )}
    </Page>

    <Page style={styles.page}>
      {/* Adultos no convivientes */}
      <Text style={styles.subtitle}>Adultos no convivientes</Text>
      {data.AdultosNoConvivientes && data.AdultosNoConvivientes.length > 0 ? (
        data.AdultosNoConvivientes.map((adulto: any, index: number) => (
          <View key={index} style={styles.personItem}>
            <Text style={styles.text}>
              {index + 1}. {adulto.ApellidoNombre}, DNI: {adulto.DNI}, Vínculo: {adulto.VinculoConNNYAPrincipal}
            </Text>
            <Text style={styles.personDetail}>
              Domicilio: {adulto.Calle} {adulto.NumeroCasa}, {adulto.Barrio}
            </Text>

            {/* Información adicional si está disponible */}
            {adulto.genero && <Text style={styles.personDetail}>Género: {adulto.genero}</Text>}
            {adulto.nacionalidad && <Text style={styles.personDetail}>Nacionalidad: {adulto.nacionalidad}</Text>}
            {adulto.situacionDni && <Text style={styles.personDetail}>Situación DNI: {adulto.situacionDni}</Text>}
            {adulto.edadAproximada && <Text style={styles.personDetail}>Edad aproximada: {adulto.edadAproximada}</Text>}
            {adulto.ocupacion && <Text style={styles.personDetail}>Ocupación: {adulto.ocupacion}</Text>}
            {adulto.telefono && <Text style={styles.personDetail}>Teléfono: {adulto.telefono}</Text>}

            {/* Localización detallada */}
            {adulto.localizacion && (
              <View>
                <Text style={styles.personDetail}>Localización detallada:</Text>
                {adulto.localizacion.tipo_calle && (
                  <Text style={styles.subDetail}>Tipo de calle: {adulto.localizacion.tipo_calle}</Text>
                )}
                {adulto.localizacion.piso_depto && (
                  <Text style={styles.subDetail}>Piso/Depto: {adulto.localizacion.piso_depto}</Text>
                )}
                {adulto.localizacion.referencia_geo && (
                  <Text style={styles.subDetail}>Referencia geográfica: {adulto.localizacion.referencia_geo}</Text>
                )}
                {adulto.localizacion.geolocalizacion && (
                  <Text style={styles.subDetail}>Geolocalización: {adulto.localizacion.geolocalizacion}</Text>
                )}
              </View>
            )}

            {/* Información adicional */}
            {adulto.vinculacion && <Text style={styles.personDetail}>Vinculación: {adulto.vinculacion}</Text>}
            {adulto.vinculo_demanda && (
              <Text style={styles.personDetail}>Vínculo con demanda: {adulto.vinculo_demanda}</Text>
            )}
            {adulto.legalmenteResponsable !== undefined && (
              <Text style={styles.personDetail}>
                Legalmente responsable: {adulto.legalmenteResponsable ? "Sí" : "No"}
              </Text>
            )}
            {adulto.supuesto_autordv && (
              <Text style={styles.personDetail}>Supuesto autor DV: {adulto.supuesto_autordv}</Text>
            )}
            {adulto.garantiza_proteccion !== undefined && (
              <Text style={styles.personDetail}>Garantiza protección: {adulto.garantiza_proteccion ? "Sí" : "No"}</Text>
            )}

            {/* Condiciones de vulnerabilidad */}
            {adulto.condicionesVulnerabilidad && adulto.condicionesVulnerabilidad.length > 0 && (
              <View>
                <Text style={styles.personDetail}>Condiciones de vulnerabilidad:</Text>
                {adulto.condicionesVulnerabilidad.map((condicion: any, idx: number) => (
                  <Text key={idx} style={styles.subDetail}>
                    - {typeof condicion === 'object' ?
                      (condicion.condicion_vulnerabilidad || JSON.stringify(condicion)) :
                      String(condicion)}
                  </Text>
                ))}
              </View>
            )}

            {adulto.observaciones && <Text style={styles.personDetail}>Observaciones: {adulto.observaciones}</Text>}
          </View>
        ))
      ) : (
        <View style={styles.personItem}>
          <Text style={styles.text}>No hay adultos no convivientes registrados</Text>
        </View>
      )}

      {/* Antecedentes */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Antecedentes de actuación</Text>
        {Array.isArray(data.AntecedentesDemanda) && data.AntecedentesDemanda.length > 0 ? (
          data.AntecedentesDemanda.map((antecedente: any, index: number) => (
            <Text key={index} style={styles.text}>
              {index + 1}. ID: {String(antecedente.IdDemandaVinculada || '')}, Número: {String(antecedente.NumerosDemanda || '')}
            </Text>
          ))
        ) : data.AntecedentesDemanda && data.AntecedentesDemanda.IdDemandaVinculada ? (
          <Text style={styles.text}>
            ID: {String(data.AntecedentesDemanda.IdDemandaVinculada)}, Número: {String(data.AntecedentesDemanda.NumerosDemanda)}
          </Text>
        ) : (
          <Text style={styles.text}>No hay antecedentes registrados</Text>
        )}
      </View>

      {/* Motivo de las actuaciones */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Motivo de las actuaciones</Text>
        {Array.isArray(data.MotivosActuacion) && data.MotivosActuacion.length > 0 ? (
          data.MotivosActuacion.map((motivo: any, index: number) => (
            <Text key={index} style={styles.text}>
              - {String(motivo.Motivos || '')}
            </Text>
          ))
        ) : (
          <Text style={styles.text}>
            - {data.MotivosActuacion && data.MotivosActuacion.Motivos ?
              String(data.MotivosActuacion.Motivos) :
              "No hay motivos registrados"}
          </Text>
        )}
      </View>

      {/* Indicadores de evaluación */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Indicadores de vulneración de la evaluación</Text>
        {data.IndicadoresEvaluacion && data.IndicadoresEvaluacion.length > 0 ? (
          data.IndicadoresEvaluacion.map((ind: any, index: number) => (
            <View key={index}>
              <Text style={styles.text}>
                {index + 1}. {String(ind.NombreIndicador || '')} - {String(ind.Descripcion || '')} - Peso: {String(ind.Peso || '')}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.text}>No hay indicadores registrados</Text>
        )}
      </View>

      {/* Valoración Profesional */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Valoración Profesional / Conclusiones</Text>
        <View style={styles.infoBox}>
          <Text style={styles.text}>
            {data.ValoracionProfesional ?
              String(data.ValoracionProfesional) :
              "Dado el análisis de la situación y los indicadores de vulneración identificados, se recomienda APERTURA DE LEGAJO para realizar un seguimiento adecuado del caso y garantizar la protección de los derechos de los NNyA involucrados."}
          </Text>
        </View>
      </View>


      {/* Firma */}
      <View style={styles.signature}>
        <Text style={styles.text}>Sin más que informar, saludamos muy atte.</Text>
        <Text style={styles.text}>Firma Profesionales de Equipo Técnico.</Text>
      </View>

      {/* Número de página */}
      <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
    </Page>
  </Document>
)

export default InformePDF
