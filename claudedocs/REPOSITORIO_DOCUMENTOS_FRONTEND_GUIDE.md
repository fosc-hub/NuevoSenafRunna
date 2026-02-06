# Repositorio Unificado de Documentos - Guía de Integración Frontend

**Fecha**: 2026-02-01
**Versión**: 1.0
**Estado**: ✅ Backend Implementado - Listo para Integración Frontend

---

## 📋 Resumen Ejecutivo (Para PO)

### ¿Qué es?
Un nuevo endpoint que permite obtener **todos los documentos/archivos** relacionados a una Demanda, Legajo o Medida en una sola llamada, organizados por categoría y con metadata uniforme.

### ¿Por qué lo necesitamos?
- **Antes**: Para ver todos los documentos de un caso, el frontend debía hacer múltiples llamadas a diferentes endpoints (intervenciones, notas de aval, informes jurídicos, etc.)
- **Ahora**: Una sola llamada retorna todos los documentos con información estandarizada

### Beneficios
| Beneficio | Descripción |
|-----------|-------------|
| 🚀 **Rendimiento** | 1 llamada API vs 10+ llamadas anteriores |
| 📁 **Vista unificada** | Todos los documentos de un caso en un solo lugar |
| 🔍 **Filtrado flexible** | Por tipo de documento, categoría, etc. |
| 📊 **Estadísticas** | Total de documentos, tamaño total, conteo por categoría |

### Casos de Uso
1. **Pantalla de "Documentos del Caso"**: Mostrar todos los archivos de una demanda/legajo/medida
2. **Búsqueda de documentos**: Filtrar por tipo (actas, informes, resoluciones)
3. **Reportes**: Estadísticas de documentación por caso
4. **Auditoría**: Trazabilidad de quién subió qué documento y cuándo

---

## 🔧 Especificación Técnica (Para Dev Frontend)

### Endpoint

```
GET /api/repositorio-documentos/
```

### Autenticación
- **Requerida**: Sí (Token JWT)
- **Header**: `Authorization: Bearer {token}`

### Query Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `demanda_id` | integer | Condicional* | ID de la demanda |
| `legajo_id` | integer | Condicional* | ID del legajo (TVinculoLegajo) |
| `medida_id` | integer | Condicional* | ID de la medida |
| `tipo_modelo` | string | No | Filtrar por tipo de modelo específico |
| `categoria` | string | No | Filtrar por categoría (DEMANDA, EVALUACION, MEDIDA) |

> *Al menos uno de `demanda_id`, `legajo_id` o `medida_id` es requerido.

### Valores para `tipo_modelo`

```typescript
type TipoModelo =
  | 'TDemandaAdjunto'           // Adjuntos directos de demanda
  | 'TRespuestaAdjunto'         // Adjuntos de respuestas
  | 'TEvaluacionAdjunto'        // Adjuntos de evaluaciones
  | 'TActividadAdjunto'         // Adjuntos de actividades de evaluación
  | 'TIntervencionAdjunto'      // Adjuntos de intervenciones (MED-02)
  | 'TNotaAvalAdjunto'          // Adjuntos de notas de aval (MED-03)
  | 'TInformeJuridicoAdjunto'   // Adjuntos de informes jurídicos (MED-04)
  | 'TRatificacionAdjunto'      // Adjuntos de ratificaciones (MED-05)
  | 'TInformeCierreAdjunto'     // Adjuntos de informes de cierre
  | 'TInformeSeguimientoAdjunto'// Adjuntos de informes de seguimiento
  | 'TAdjuntoActividad';        // Adjuntos de actividades del plan de trabajo
```

### Valores para `categoria`

```typescript
type Categoria = 'DEMANDA' | 'EVALUACION' | 'MEDIDA';
```

---

## 📤 Response Schema

### TypeScript Interface

```typescript
interface RepositorioDocumentosResponse {
  demanda_id: number | null;
  legajo_id: number | null;
  medida_id: number | null;
  total_documentos: number;
  total_size_bytes: number;
  total_size_mb: number;
  categorias: {
    DEMANDA?: number;
    EVALUACION?: number;
    MEDIDA?: number;
  };
  documentos: Documento[];
}

interface Documento {
  id: number;
  tipo_modelo: string;
  tipo_modelo_display: string;
  categoria: 'DEMANDA' | 'EVALUACION' | 'MEDIDA';
  archivo_url: string | null;
  nombre_archivo: string | null;
  tamanio_bytes: number;
  tamanio_mb: number;
  extension: string | null;
  fecha_subida: string | null;  // ISO 8601
  usuario_subida: UsuarioSubida | null;
  tipo_documento: string | null;
  descripcion: string | null;
  metadata: Record<string, any>;
}

interface UsuarioSubida {
  id: number;
  username: string;
  nombre_completo: string;
}
```

### Ejemplo de Response

```json
{
  "demanda_id": 123,
  "legajo_id": 456,
  "medida_id": 789,
  "total_documentos": 5,
  "total_size_bytes": 5242880,
  "total_size_mb": 5.0,
  "categorias": {
    "DEMANDA": 2,
    "MEDIDA": 3
  },
  "documentos": [
    {
      "id": 101,
      "tipo_modelo": "TIntervencionAdjunto",
      "tipo_modelo_display": "Adjunto de Intervención",
      "categoria": "MEDIDA",
      "archivo_url": "/media/intervenciones/2026/01/acta_compromiso.pdf",
      "nombre_archivo": "acta_compromiso.pdf",
      "tamanio_bytes": 1048576,
      "tamanio_mb": 1.0,
      "extension": "pdf",
      "fecha_subida": "2026-01-15T10:30:00Z",
      "usuario_subida": {
        "id": 7,
        "username": "maria.tecnico",
        "nombre_completo": "María González"
      },
      "tipo_documento": "Acta",
      "descripcion": "Acta de compromiso familiar",
      "metadata": {
        "medida_id": 789,
        "intervencion_id": 45,
        "tipo_adjunto": "ACTA"
      }
    },
    {
      "id": 102,
      "tipo_modelo": "TDemandaAdjunto",
      "tipo_modelo_display": "Adjunto de Demanda",
      "categoria": "DEMANDA",
      "archivo_url": "/media/TDemandaAdjunto/archivo_20260110_093045_a1b2c3d4/denuncia.pdf",
      "nombre_archivo": "denuncia.pdf",
      "tamanio_bytes": 524288,
      "tamanio_mb": 0.5,
      "extension": "pdf",
      "fecha_subida": "2026-01-10T09:30:45Z",
      "usuario_subida": null,
      "tipo_documento": null,
      "descripcion": null,
      "metadata": {
        "demanda_id": 123
      }
    },
    {
      "id": 103,
      "tipo_modelo": "TInformeJuridicoAdjunto",
      "tipo_modelo_display": "Adjunto de Informe Jurídico",
      "categoria": "MEDIDA",
      "archivo_url": "/media/informes_juridicos/2026/01/informe_legal.pdf",
      "nombre_archivo": "informe_legal.pdf",
      "tamanio_bytes": 2097152,
      "tamanio_mb": 2.0,
      "extension": "pdf",
      "fecha_subida": "2026-01-20T14:15:00Z",
      "usuario_subida": {
        "id": 12,
        "username": "juan.legal",
        "nombre_completo": "Juan Pérez"
      },
      "tipo_documento": "Informe Jurídico Oficial",
      "descripcion": "Informe para presentación judicial",
      "metadata": {
        "medida_id": 789,
        "informe_juridico_id": 23,
        "tipo_adjunto": "INFORME"
      }
    }
  ]
}
```

---

## 🎯 Ejemplos de Uso

### 1. Obtener todos los documentos de una demanda

```typescript
// Request
GET /api/repositorio-documentos/?demanda_id=123

// Uso con fetch
const response = await fetch('/api/repositorio-documentos/?demanda_id=123', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data: RepositorioDocumentosResponse = await response.json();
```

### 2. Obtener documentos de una medida filtrados por categoría

```typescript
// Solo documentos de categoría MEDIDA
GET /api/repositorio-documentos/?medida_id=789&categoria=MEDIDA
```

### 3. Obtener solo actas de intervención

```typescript
// Filtrar por tipo de modelo específico
GET /api/repositorio-documentos/?medida_id=789&tipo_modelo=TIntervencionAdjunto
```

### 4. Obtener documentos desde un legajo

```typescript
// El endpoint automáticamente obtiene la medida asociada al legajo
GET /api/repositorio-documentos/?legajo_id=456
```

### 5. Combinar filtros

```typescript
// Documentos de demanda, solo tipo evaluación
GET /api/repositorio-documentos/?demanda_id=123&categoria=EVALUACION
```

---

## 🖼️ Sugerencias de UI/UX

### Vista de Lista con Agrupación

```
┌─────────────────────────────────────────────────────────────┐
│  📁 Repositorio de Documentos                               │
│  Demanda #123 | Legajo #456 | Medida #789                   │
│                                                             │
│  Total: 5 documentos (5.0 MB)                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Filtros: [Todos ▼] [Categoría ▼] [Tipo ▼]           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ▼ MEDIDA (3)                                               │
│  ├── 📄 acta_compromiso.pdf                                 │
│  │   Acta de Intervención • 1.0 MB • 15/01/2026            │
│  │   Subido por: María González                             │
│  │   [Descargar] [Ver]                                      │
│  │                                                          │
│  ├── 📄 informe_legal.pdf                                   │
│  │   Informe Jurídico Oficial • 2.0 MB • 20/01/2026        │
│  │   Subido por: Juan Pérez                                 │
│  │   [Descargar] [Ver]                                      │
│  │                                                          │
│  └── 📄 resolucion_judicial.pdf                             │
│      Resolución Judicial • 1.5 MB • 25/01/2026             │
│      Subido por: Ana Legal                                  │
│      [Descargar] [Ver]                                      │
│                                                             │
│  ▼ DEMANDA (2)                                              │
│  ├── 📄 denuncia.pdf                                        │
│  │   Adjunto de Demanda • 0.5 MB • 10/01/2026              │
│  │   [Descargar] [Ver]                                      │
│  │                                                          │
│  └── 📄 anexo_pruebas.pdf                                   │
│      Adjunto de Demanda • 0.3 MB • 10/01/2026              │
│      [Descargar] [Ver]                                      │
└─────────────────────────────────────────────────────────────┘
```

### Componente React Sugerido

```tsx
// hooks/useRepositorioDocumentos.ts
import { useQuery } from '@tanstack/react-query';

interface UseRepositorioParams {
  demandaId?: number;
  legajoId?: number;
  medidaId?: number;
  tipoModelo?: string;
  categoria?: string;
}

export function useRepositorioDocumentos(params: UseRepositorioParams) {
  const queryParams = new URLSearchParams();

  if (params.demandaId) queryParams.append('demanda_id', String(params.demandaId));
  if (params.legajoId) queryParams.append('legajo_id', String(params.legajoId));
  if (params.medidaId) queryParams.append('medida_id', String(params.medidaId));
  if (params.tipoModelo) queryParams.append('tipo_modelo', params.tipoModelo);
  if (params.categoria) queryParams.append('categoria', params.categoria);

  return useQuery({
    queryKey: ['repositorio-documentos', params],
    queryFn: async () => {
      const response = await fetch(
        `/api/repositorio-documentos/?${queryParams.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
          },
        }
      );
      if (!response.ok) throw new Error('Error fetching documents');
      return response.json() as Promise<RepositorioDocumentosResponse>;
    },
    enabled: !!(params.demandaId || params.legajoId || params.medidaId),
  });
}
```

```tsx
// components/RepositorioDocumentos.tsx
import { useRepositorioDocumentos } from '../hooks/useRepositorioDocumentos';

interface Props {
  demandaId?: number;
  legajoId?: number;
  medidaId?: number;
}

export function RepositorioDocumentos({ demandaId, legajoId, medidaId }: Props) {
  const [categoria, setCategoria] = useState<string | undefined>();
  const [tipoModelo, setTipoModelo] = useState<string | undefined>();

  const { data, isLoading, error } = useRepositorioDocumentos({
    demandaId,
    legajoId,
    medidaId,
    categoria,
    tipoModelo,
  });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return null;

  // Agrupar documentos por categoría
  const documentosPorCategoria = data.documentos.reduce((acc, doc) => {
    if (!acc[doc.categoria]) acc[doc.categoria] = [];
    acc[doc.categoria].push(doc);
    return acc;
  }, {} as Record<string, Documento[]>);

  return (
    <div className="repositorio-documentos">
      <header>
        <h2>📁 Repositorio de Documentos</h2>
        <p>Total: {data.total_documentos} documentos ({data.total_size_mb} MB)</p>
      </header>

      <Filtros
        categoria={categoria}
        onCategoriaChange={setCategoria}
        tipoModelo={tipoModelo}
        onTipoModeloChange={setTipoModelo}
        categorias={Object.keys(data.categorias)}
      />

      {Object.entries(documentosPorCategoria).map(([cat, docs]) => (
        <CategoriaSection key={cat} categoria={cat} documentos={docs} />
      ))}
    </div>
  );
}
```

---

## ⚠️ Consideraciones Importantes

### 1. Descarga de Archivos

Los `archivo_url` retornados son paths relativos. Para descargar:

```typescript
const downloadUrl = `${API_BASE_URL}${documento.archivo_url}`;
// Ejemplo: https://api.runna.senaf.gob.ar/media/intervenciones/2026/01/acta.pdf
```

### 2. Manejo de Archivos Null

Algunos documentos pueden tener `archivo_url: null` si el archivo fue eliminado o hay un error. Manejar este caso:

```typescript
{documento.archivo_url ? (
  <a href={downloadUrl}>Descargar</a>
) : (
  <span className="text-muted">Archivo no disponible</span>
)}
```

### 3. Extensiones Soportadas

Los archivos pueden tener las siguientes extensiones:
- **Documentos**: pdf, doc, docx
- **Imágenes**: jpg, jpeg, png

Mostrar iconos apropiados según extensión:

```typescript
const getIconForExtension = (ext: string | null) => {
  switch (ext?.toLowerCase()) {
    case 'pdf': return '📕';
    case 'doc':
    case 'docx': return '📘';
    case 'jpg':
    case 'jpeg':
    case 'png': return '🖼️';
    default: return '📄';
  }
};
```

### 4. Formato de Fechas

Las fechas vienen en formato ISO 8601. Formatear para mostrar:

```typescript
const formatDate = (isoDate: string | null) => {
  if (!isoDate) return 'Fecha desconocida';
  return new Date(isoDate).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
```

### 5. Metadata Específica por Tipo

El campo `metadata` contiene información específica según el tipo de documento:

```typescript
// Para TIntervencionAdjunto
metadata: {
  medida_id: number,
  intervencion_id: number,
  tipo_adjunto: 'MODELO' | 'ACTA' | 'RESPALDO' | 'INFORME'
}

// Para TInformeJuridicoAdjunto
metadata: {
  medida_id: number,
  informe_juridico_id: number,
  tipo_adjunto: 'INFORME' | 'ACUSE'
}

// Para TAdjuntoActividad
metadata: {
  medida_id: number,
  plan_trabajo_id: number,
  actividad_id: number,
  tipo_adjunto: string,
  version: number,
  activo: boolean
}
```

---

## 🔄 Migración desde Endpoints Anteriores

### Antes (múltiples llamadas)

```typescript
// Para obtener todos los documentos de una medida, había que llamar:
const intervenciones = await fetch(`/api/medidas/${medidaId}/intervenciones/`);
const notasAval = await fetch(`/api/medidas/${medidaId}/nota-aval/adjuntos-list/`);
const informesJuridicos = await fetch(`/api/medidas/${medidaId}/informe-juridico/adjuntos-list/`);
// ... más llamadas para cada tipo
```

### Ahora (una sola llamada)

```typescript
// Una sola llamada obtiene todo
const repositorio = await fetch(`/api/repositorio-documentos/?medida_id=${medidaId}`);
```

### Compatibilidad

Los endpoints anteriores **siguen funcionando** y no se han modificado. El nuevo endpoint es **adicional** y no reemplaza la funcionalidad existente.

---

## 📊 Códigos de Error

| Código | Mensaje | Descripción |
|--------|---------|-------------|
| 400 | `Debe proporcionar al menos uno de: demanda_id, legajo_id, medida_id` | No se especificó ningún filtro |
| 401 | `Authentication credentials were not provided` | Token no enviado |
| 403 | `You do not have permission...` | Sin permisos para ver este recurso |
| 404 | `Recurso no encontrado: {detalle}` | El ID especificado no existe |

---

## ✅ Checklist de Implementación Frontend

- [ ] Crear interfaz TypeScript para la respuesta
- [ ] Implementar hook/servicio para llamar al endpoint
- [ ] Crear componente de lista de documentos
- [ ] Implementar filtros por categoría y tipo
- [ ] Agregar funcionalidad de descarga
- [ ] Manejar estados de loading y error
- [ ] Formatear fechas y tamaños
- [ ] Mostrar iconos según extensión
- [ ] Agrupar por categoría
- [ ] Tests unitarios del componente
- [ ] Tests de integración con el endpoint

---

## 📞 Contacto

Para dudas técnicas sobre este endpoint:
- **Backend**: Equipo de desarrollo backend RUNNA
- **Documentación**: Ver `claudedocs/ANALISIS_SISTEMA_ARCHIVOS_DOCUMENTOS.md`

---

**Última actualización**: 2026-02-01