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
  signature: {
    marginTop: 40,
    textAlign: "center",
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
      </View>

      {/* Domicilio */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Domicilio grupo familiar conviviente:</Text>
        <View style={styles.addressSection}>
          <Text style={styles.text}>
            - {data.DatosLocalizacion.TipoCalle} {data.DatosLocalizacion.Calle} N° {data.DatosLocalizacion.NumeroCasa}
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
        <Text style={styles.text}>Del relevamiento realizado (con las técnica/instrumentos de:</Text>
        {data.Actividades.map((act: any, index: number) => (
          <View key={index} style={styles.activityItem}>
            <Text style={styles.text}>
              ● {act.FechaHora} Actividad: {act.TipoActividad} ({act.Institucion}). Observación: {act.Descripcion}
            </Text>
          </View>
        ))}
        <Text style={styles.text}>, surgen los siguientes datos y consideraciones:</Text>
      </View>

      {/* NNyA convivientes */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Descripción del grupo familiar</Text>

        <Text style={styles.text}>NNyA convivientes</Text>
        {data.NNYAConvivientes && data.NNYAConvivientes.length > 0 ? (
          data.NNYAConvivientes.map((nnya: any, index: number) => (
            <View key={index} style={styles.personItem}>
              <Text style={styles.text}>
                {index + 1}. Apellido y Nombre: {nnya.ApellidoNombre}, DNI: {nnya.DNI}, Vínculo:{" "}
                {nnya.VinculoConNNYAPrincipal}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.personItem}>
            <Text style={styles.text}>No hay NNyA convivientes registrados</Text>
          </View>
        )}

        {/* NNyA no convivientes */}
        <Text style={styles.text}>NNyA no convivientes</Text>
        {data.NNYANoConvivientes && data.NNYANoConvivientes.length > 0 ? (
          data.NNYANoConvivientes.map((nnya: any, index: number) => (
            <View key={index} style={styles.personItem}>
              <Text style={styles.text}>
                {index + 1}. Apellido y Nombre: {nnya.ApellidoNombre}, DNI: {nnya.DNI}, Vínculo:{" "}
                {nnya.VinculoConNNYAPrincipal}
              </Text>
              <Text style={styles.text}>
                Domicilio: {nnya.Calle} {nnya.NumeroCasa}, {nnya.Barrio}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.personItem}>
            <Text style={styles.text}>No hay NNyA no convivientes registrados</Text>
          </View>
        )}

        {/* Adultos convivientes */}
        <Text style={styles.text}>Adultos convivientes</Text>
        {data.AdultosConvivientes && data.AdultosConvivientes.length > 0 ? (
          data.AdultosConvivientes.map((adulto: any, index: number) => (
            <View key={index} style={styles.personItem}>
              <Text style={styles.text}>
                {index + 1}. Apellido y Nombre: {adulto.ApellidoNombre}, DNI: {adulto.DNI}, Vínculo:{" "}
                {adulto.VinculoConNNYAPrincipal}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.personItem}>
            <Text style={styles.text}>No hay adultos convivientes registrados</Text>
          </View>
        )}

        {/* Adultos no convivientes */}
        <Text style={styles.text}>Adultos no convivientes</Text>
        {data.AdultosNoConvivientes && data.AdultosNoConvivientes.length > 0 ? (
          data.AdultosNoConvivientes.map((adulto: any, index: number) => (
            <View key={index} style={styles.personItem}>
              <Text style={styles.text}>
                {index + 1}. Apellido y Nombre: {adulto.ApellidoNombre}, DNI: {adulto.DNI}, Vínculo:{" "}
                {adulto.VinculoConNNYAPrincipal}
              </Text>
              <Text style={styles.text}>
                Domicilio: {adulto.Calle} {adulto.NumeroCasa}, {adulto.Barrio}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.personItem}>
            <Text style={styles.text}>No hay adultos no convivientes registrados</Text>
          </View>
        )}
      </View>

      {/* Antecedentes */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>C. Antecedentes de actuación:</Text>
        {Array.isArray(data.AntecedentesDemanda) && data.AntecedentesDemanda.length > 0 ? (
          data.AntecedentesDemanda.map((antecedente: any, index: number) => (
            <Text key={index} style={styles.text}>
              {index + 1}. ID: {antecedente.IdDemandaVinculada}, Número: {antecedente.NumerosDemanda}
            </Text>
          ))
        ) : (
          <Text style={styles.text}>No hay antecedentes registrados</Text>
        )}
      </View>

      {/* Motivo de las actuaciones */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>B. Motivo de las actuaciones:</Text>
        {Array.isArray(data.MotivosActuacion) && data.MotivosActuacion.length > 0 ? (
          data.MotivosActuacion.map((motivo: any, index: number) => (
            <Text key={index} style={styles.text}>
              - {motivo.Motivos}
            </Text>
          ))
        ) : (
          <Text style={styles.text}>
            -{" "}
            {data.MotivosActuacion && data.MotivosActuacion.Motivos
              ? data.MotivosActuacion.Motivos
              : "No hay motivos registrados"}
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
                {index + 1}. {ind.NombreIndicador} - {ind.Descripcion} - Peso: {ind.Peso}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.text}>No hay indicadores registrados</Text>
        )}
      </View>

      {/* Valoración Profesional */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>F. Valoración Profesional/ Conclusiones.</Text>
        <Text style={styles.text}>
          {data.ValoracionProfesional ||
            null}
        </Text>
      </View>

      {/* Firma */}
      <View style={styles.signature}>
        <Text style={styles.text}>Sin más que informar, saludamos muy atte.</Text>
        <Text style={styles.text}>Firma Profesionales de Equipo Técnico.</Text>
      </View>
    </Page>
  </Document>
)

export default InformePDF

