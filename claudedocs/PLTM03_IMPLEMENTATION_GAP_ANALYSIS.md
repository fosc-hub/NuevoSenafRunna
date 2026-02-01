# PLTM-03 Fase 2: Implementation Gap Analysis

**Fecha de Analisis**: 2026-02-01
**Modulo**: Informes Mensuales de Seguimiento
**Estado**: GAP ANALYSIS - Pre-Implementation

---

## Executive Summary

Este documento analiza las brechas entre los endpoints disponibles en la API (RUNNA API v13) y la implementacion actual del frontend para el modulo de **Informes Mensuales de Seguimiento**.

### Estado General

| Categoria | API Disponible | Frontend Implementado | Gap |
|-----------|----------------|----------------------|-----|
| Endpoints | 12 endpoints | 0 integrados | 100% |
| Tipos/Interfaces | 4 schemas | 0 definidos | 100% |
| Componentes UI | N/A | 2 (mock data) | Parcial |
| API Service | N/A | 0 servicios | 100% |

---

## 1. API Endpoints Analysis

### 1.1 Plantillas de Informes (Global)

| Endpoint | Metodo | Estado Frontend | Prioridad |
|----------|--------|-----------------|-----------|
| `/api/plantillas-informe/` | GET | NO IMPLEMENTADO | Media |
| `/api/plantillas-informe/{id}/` | GET | NO IMPLEMENTADO | Baja |
| `/api/plantillas-informe/{id}/descargar/` | GET | NO IMPLEMENTADO | Alta |
| `/api/plantillas-informe/activa/` | GET | NO IMPLEMENTADO | Alta |

### 1.2 Informes de Seguimiento (Por Medida)

| Endpoint | Metodo | Estado Frontend | Prioridad |
|----------|--------|-----------------|-----------|
| `/api/medidas/{id}/informes-seguimiento/` | GET | MOCK DATA | Critica |
| `/api/medidas/{id}/informes-seguimiento/{id}/` | GET | NO IMPLEMENTADO | Alta |
| `/api/medidas/{id}/informes-seguimiento/{id}/completar/` | POST | MOCK MODAL | Critica |
| `/api/medidas/{id}/informes-seguimiento/{id}/subir-plantilla/` | POST | NO IMPLEMENTADO | Alta |
| `/api/medidas/{id}/informes-seguimiento/pendientes/` | GET | NO IMPLEMENTADO | Media |
| `/api/medidas/{id}/informes-seguimiento/vencidos/` | GET | NO IMPLEMENTADO | Alta |
| `/api/medidas/{id}/informes-seguimiento/plantilla/` | GET | NO IMPLEMENTADO | Alta |
| `/api/medidas/{id}/informes-seguimiento/plantilla-info/` | GET | NO IMPLEMENTADO | Media |

### 1.3 Adjuntos de Informes

| Endpoint | Metodo | Estado Frontend | Prioridad |
|----------|--------|-----------------|-----------|
| `/api/medidas/{id}/informes-seguimiento/{id}/adjuntos/` | GET | NO IMPLEMENTADO | Media |
| `/api/medidas/{id}/informes-seguimiento/{id}/adjuntos/` | POST | NO IMPLEMENTADO | Media |
| `/api/medidas/{id}/informes-seguimiento/{id}/adjuntos/{id}/` | GET | NO IMPLEMENTADO | Baja |
| `/api/medidas/{id}/informes-seguimiento/{id}/adjuntos/{id}/` | DELETE | NO IMPLEMENTADO | Baja |

---

## 2. Missing Type Definitions

### 2.1 Interfaces Requeridas

```typescript
// src/features/legajo/types/informe-seguimiento.types.ts

// Estado del informe
export type EstadoInformeSeguimiento =
  | 'PENDIENTE'
  | 'VENCIDO'
  | 'COMPLETADO'
  | 'COMPLETADO_TARDIO';

// Tipo de plantilla
export type TipoPlantilla =
  | 'INFORME_SEGUIMIENTO'
  | 'INFORME_CIERRE';

// Tipo de etapa
export type TipoEtapa =
  | 'APERTURA'
  | 'PRORROGA'
  | 'INNOVACION';

// Interface principal - Informe de Seguimiento
export interface InformeSeguimiento {
  id: number;
  medida: number;
  medida_numero: string;
  etapa: number;
  etapa_nombre: string;
  tipo_etapa: TipoEtapa;
  numero_informe: number;
  fecha_vencimiento: string; // YYYY-MM-DD
  fecha_creacion: string; // ISO datetime
  fecha_completado: string | null;
  estado: EstadoInformeSeguimiento;
  estado_display: string;
  contenido: string | null;
  autor: number | null;
  autor_nombre: string;
  adjuntos: InformeSeguimientoAdjunto[];
  esta_vencido: boolean;
  dias_para_vencimiento: number;
  plantilla_archivo: string | null;
  url_plantilla_archivo: string | null;
  entrega_tardia: boolean;
  tiene_plantilla: boolean;
}

// Interface para listado (reducida)
export interface InformeSeguimientoListItem {
  id: number;
  numero_informe: number;
  fecha_vencimiento: string;
  estado: EstadoInformeSeguimiento;
  estado_display: string;
  esta_vencido: boolean;
  dias_para_vencimiento: number;
  entrega_tardia: boolean;
  tiene_plantilla: boolean;
}

// Interface para completar informe
export interface CompletarInformePayload {
  contenido: string;
  plantilla_archivo?: File;
}

// Interface para subir plantilla
export interface SubirPlantillaPayload {
  plantilla_archivo: File;
}

// Interface para adjuntos
export interface InformeSeguimientoAdjunto {
  id: number;
  archivo: string | null;
  url_archivo: string;
  nombre_archivo: string;
  mime_type: string | null;
  tamanio: number | null;
  fecha: string;
  usuario: number | null;
  usuario_nombre: string;
}

// Interface para plantillas globales
export interface PlantillaInforme {
  id: number;
  nombre: string;
  descripcion: string | null;
  tipo_plantilla: TipoPlantilla;
  tipo_plantilla_display: string;
  archivo: string;
  url_archivo: string;
  version: string;
  activa: boolean;
  fecha_creacion: string;
  fecha_modificacion: string;
  creado_por: number | null;
  creado_por_nombre: string;
}
```

---

## 3. Missing API Service

### 3.1 Archivo Requerido

**Ruta**: `src/features/legajo/api/informe-seguimiento-api-service.ts`

```typescript
// Template de implementacion basado en informe-juridico-api-service.ts

import { get, create, patch } from '@/app/api/apiService';
import axiosInstance from '@/app/api/utils/axiosInstance';
import {
  InformeSeguimiento,
  InformeSeguimientoListItem,
  InformeSeguimientoAdjunto,
  PlantillaInforme,
  CompletarInformePayload,
  SubirPlantillaPayload
} from '../types/informe-seguimiento.types';

const BASE_URL = 'medidas';

// === INFORMES DE SEGUIMIENTO ===

export const getInformesSeguimiento = async (
  medidaId: number,
  params?: { estado?: string; tipo_etapa?: string }
): Promise<InformeSeguimientoListItem[]> => {
  const queryParams = new URLSearchParams();
  if (params?.estado) queryParams.append('estado', params.estado);
  if (params?.tipo_etapa) queryParams.append('tipo_etapa', params.tipo_etapa);

  const url = `${BASE_URL}/${medidaId}/informes-seguimiento/${queryParams.toString() ? `?${queryParams}` : ''}`;
  return get<InformeSeguimientoListItem[]>(url);
};

export const getInformeSeguimiento = async (
  medidaId: number,
  informeId: number
): Promise<InformeSeguimiento> => {
  return get<InformeSeguimiento>(`${BASE_URL}/${medidaId}/informes-seguimiento/${informeId}/`);
};

export const getInformesPendientes = async (medidaId: number): Promise<InformeSeguimientoListItem[]> => {
  return get<InformeSeguimientoListItem[]>(`${BASE_URL}/${medidaId}/informes-seguimiento/pendientes/`);
};

export const getInformesVencidos = async (medidaId: number): Promise<InformeSeguimientoListItem[]> => {
  return get<InformeSeguimientoListItem[]>(`${BASE_URL}/${medidaId}/informes-seguimiento/vencidos/`);
};

export const completarInforme = async (
  medidaId: number,
  informeId: number,
  payload: CompletarInformePayload
): Promise<InformeSeguimiento> => {
  const formData = new FormData();
  formData.append('contenido', payload.contenido);
  if (payload.plantilla_archivo) {
    formData.append('plantilla_archivo', payload.plantilla_archivo);
  }

  const response = await axiosInstance.post(
    `/api/${BASE_URL}/${medidaId}/informes-seguimiento/${informeId}/completar/`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
};

export const subirPlantilla = async (
  medidaId: number,
  informeId: number,
  file: File
): Promise<InformeSeguimiento> => {
  const formData = new FormData();
  formData.append('plantilla_archivo', file);

  const response = await axiosInstance.post(
    `/api/${BASE_URL}/${medidaId}/informes-seguimiento/${informeId}/subir-plantilla/`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
};

// === PLANTILLA TEMPLATE ===

export const getPlantillaInfo = async (medidaId: number): Promise<PlantillaInforme> => {
  return get<PlantillaInforme>(`${BASE_URL}/${medidaId}/informes-seguimiento/plantilla-info/`);
};

export const descargarPlantilla = async (medidaId: number): Promise<Blob> => {
  const response = await axiosInstance.get(
    `/api/${BASE_URL}/${medidaId}/informes-seguimiento/plantilla/`,
    { responseType: 'blob' }
  );
  return response.data;
};

// === ADJUNTOS ===

export const getAdjuntos = async (
  medidaId: number,
  informeId: number
): Promise<InformeSeguimientoAdjunto[]> => {
  return get<InformeSeguimientoAdjunto[]>(
    `${BASE_URL}/${medidaId}/informes-seguimiento/${informeId}/adjuntos/`
  );
};

export const uploadAdjunto = async (
  medidaId: number,
  informeId: number,
  file: File,
  nombreArchivo?: string
): Promise<InformeSeguimientoAdjunto> => {
  const formData = new FormData();
  formData.append('archivo', file);
  formData.append('nombre_archivo', nombreArchivo || file.name);

  const response = await axiosInstance.post(
    `/api/${BASE_URL}/${medidaId}/informes-seguimiento/${informeId}/adjuntos/`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
};

export const deleteAdjunto = async (
  medidaId: number,
  informeId: number,
  adjuntoId: number
): Promise<void> => {
  await axiosInstance.delete(
    `/api/${BASE_URL}/${medidaId}/informes-seguimiento/${informeId}/adjuntos/${adjuntoId}/`
  );
};

// === PLANTILLAS GLOBALES ===

export const getPlantillasInforme = async (): Promise<PlantillaInforme[]> => {
  return get<PlantillaInforme[]>('plantillas-informe/');
};

export const getPlantillaActiva = async (
  tipo: 'INFORME_SEGUIMIENTO' | 'INFORME_CIERRE' = 'INFORME_SEGUIMIENTO'
): Promise<PlantillaInforme> => {
  return get<PlantillaInforme>(`plantillas-informe/activa/?tipo=${tipo}`);
};

export const descargarPlantillaGlobal = async (plantillaId: number): Promise<Blob> => {
  const response = await axiosInstance.get(
    `/api/plantillas-informe/${plantillaId}/descargar/`,
    { responseType: 'blob' }
  );
  return response.data;
};
```

---

## 4. UI Components Gap Analysis

### 4.1 Componentes Existentes (Con Mock Data)

| Archivo | Estado | Accion Requerida |
|---------|--------|------------------|
| `informes-mensuales-table.tsx` | MOCK | Integrar con API real |
| `completar-informe-modal.tsx` | MOCK | Integrar con API real |

### 4.2 Componentes a Actualizar

#### `informes-mensuales-table.tsx`

**Cambios Necesarios:**
1. Reemplazar `mockData` con llamada a `getInformesSeguimiento(medidaId)`
2. Agregar columnas nuevas: `tiene_plantilla`, `entrega_tardia`
3. Implementar badge de estado con colores correctos:
   - PENDIENTE: amarillo
   - VENCIDO: rojo
   - COMPLETADO: verde
   - COMPLETADO_TARDIO: naranja
4. Agregar boton "Descargar Plantilla"
5. Agregar filtros por estado y tipo_etapa

#### `completar-informe-modal.tsx`

**Cambios Necesarios:**
1. Integrar con `completarInforme()` API call
2. Agregar campo de upload para plantilla completada
3. Agregar validacion de contenido requerido
4. Mostrar mensaje de entrega tardia si aplica
5. Manejar estados de loading y error

### 4.3 Componentes Nuevos Requeridos

| Componente | Prioridad | Descripcion |
|------------|-----------|-------------|
| `descargar-plantilla-button.tsx` | Alta | Boton para descargar plantilla desde medida |
| `upload-plantilla-modal.tsx` | Alta | Modal para subir plantilla completada |
| `informe-seguimiento-detail.tsx` | Media | Vista detalle de informe individual |
| `estado-informe-badge.tsx` | Alta | Badge especifico para estados de informe |
| `adjuntos-informe-section.tsx` | Media | Seccion de gestion de adjuntos |
| `alertas-vencimiento.tsx` | Alta | Alertas de informes proximos a vencer |

---

## 5. Estado Badge Configuration

### 5.1 Mapeo de Estados

```typescript
// Configuracion para estado-informe-badge.tsx

export const ESTADO_INFORME_CONFIG: Record<EstadoInformeSeguimiento, {
  color: 'warning' | 'error' | 'success' | 'info';
  bgColor: string;
  textColor: string;
  icon: string;
  label: string;
}> = {
  PENDIENTE: {
    color: 'warning',
    bgColor: '#FFF3CD',
    textColor: '#856404',
    icon: 'schedule',
    label: 'Pendiente'
  },
  VENCIDO: {
    color: 'error',
    bgColor: '#F8D7DA',
    textColor: '#721C24',
    icon: 'error_outline',
    label: 'Vencido'
  },
  COMPLETADO: {
    color: 'success',
    bgColor: '#D4EDDA',
    textColor: '#155724',
    icon: 'check_circle',
    label: 'Completado'
  },
  COMPLETADO_TARDIO: {
    color: 'warning',
    bgColor: '#FFE5D0',
    textColor: '#C35600',
    icon: 'warning',
    label: 'Completado Tardio'
  }
};
```

---

## 6. Implementation Roadmap

### Fase 1: Foundation (Prioridad Critica)

1. **Crear archivo de tipos** `informe-seguimiento.types.ts`
2. **Crear API service** `informe-seguimiento-api-service.ts`
3. **Actualizar** `informes-mensuales-table.tsx` con API real
4. **Actualizar** `completar-informe-modal.tsx` con API real

### Fase 2: Core Features (Prioridad Alta)

5. **Crear** `estado-informe-badge.tsx`
6. **Crear** `descargar-plantilla-button.tsx`
7. **Crear** `upload-plantilla-modal.tsx`
8. **Implementar** filtros de estado en tabla

### Fase 3: Enhanced Features (Prioridad Media)

9. **Crear** `informe-seguimiento-detail.tsx`
10. **Crear** `adjuntos-informe-section.tsx`
11. **Crear** `alertas-vencimiento.tsx`
12. **Agregar** indicadores de vencimiento proximo

### Fase 4: Polish (Prioridad Baja)

13. **Integrar** plantillas globales view
14. **Agregar** estadisticas de cumplimiento
15. **Implementar** notificaciones de vencimiento
16. **Testing** y optimizacion

---

## 7. Files to Create/Modify

### 7.1 Nuevos Archivos

```
src/features/legajo/
  types/
    informe-seguimiento.types.ts          [CREAR]
  api/
    informe-seguimiento-api-service.ts    [CREAR]
  components/
    informe-seguimiento/
      estado-informe-badge.tsx            [CREAR]
      descargar-plantilla-button.tsx      [CREAR]
      upload-plantilla-modal.tsx          [CREAR]
      informe-seguimiento-detail.tsx      [CREAR]
      adjuntos-informe-section.tsx        [CREAR]
      alertas-vencimiento.tsx             [CREAR]
  hooks/
    useInformesSeguimiento.ts             [CREAR]
    usePlantillaInforme.ts                [CREAR]
```

### 7.2 Archivos a Modificar

```
src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/
  informes-mensuales-table.tsx            [MODIFICAR]
  completar-informe-modal.tsx             [MODIFICAR]
```

---

## 8. Testing Checklist

### 8.1 API Integration Tests

- [ ] Listar informes de seguimiento por medida
- [ ] Obtener detalle de informe individual
- [ ] Completar informe con contenido
- [ ] Completar informe con plantilla adjunta
- [ ] Subir plantilla a informe pendiente
- [ ] Descargar plantilla desde medida
- [ ] Obtener info de plantilla activa
- [ ] Listar adjuntos de informe
- [ ] Subir adjunto a informe
- [ ] Eliminar adjunto de informe

### 8.2 UI Tests

- [ ] Tabla muestra datos reales de API
- [ ] Badge muestra estado correcto con color
- [ ] Modal de completar envia datos correctamente
- [ ] Descarga de plantilla funciona
- [ ] Upload de plantilla funciona
- [ ] Validaciones de formulario funcionan
- [ ] Estados de loading se muestran
- [ ] Errores se manejan correctamente

### 8.3 Business Logic Tests

- [ ] Informe VENCIDO no permite ciertas acciones
- [ ] Informe COMPLETADO es solo lectura
- [ ] Entrega tardia se calcula correctamente
- [ ] Dias para vencimiento se muestran
- [ ] Alertas de vencimiento aparecen

---

## 9. Reference Implementations

Los siguientes archivos existentes pueden usarse como referencia:

| Archivo | Patron a Reusar |
|---------|-----------------|
| `informe-juridico-api-service.ts` | API service structure |
| `informe-cierre-section.tsx` | Workflow con estados |
| `adjuntos-informe-juridico.tsx` | Gestion de adjuntos |
| `estado-badge.tsx` | Badge con colores |
| `file-upload-section.tsx` | Upload drag-and-drop |

---

## 10. Estimated Effort

| Fase | Archivos | Complejidad | Dependencias |
|------|----------|-------------|--------------|
| Fase 1 | 4 archivos | Media | Ninguna |
| Fase 2 | 4 archivos | Media | Fase 1 |
| Fase 3 | 4 archivos | Alta | Fase 2 |
| Fase 4 | 3 archivos | Baja | Fase 3 |

---

## Appendix A: API Response Examples

### A.1 Lista de Informes

```json
[
  {
    "id": 1,
    "numero_informe": 1,
    "fecha_vencimiento": "2026-03-01",
    "estado": "PENDIENTE",
    "estado_display": "Pendiente",
    "esta_vencido": false,
    "dias_para_vencimiento": 28,
    "entrega_tardia": false,
    "tiene_plantilla": false
  },
  {
    "id": 2,
    "numero_informe": 2,
    "fecha_vencimiento": "2026-01-15",
    "estado": "VENCIDO",
    "estado_display": "Vencido",
    "esta_vencido": true,
    "dias_para_vencimiento": -17,
    "entrega_tardia": false,
    "tiene_plantilla": false
  }
]
```

### A.2 Detalle de Informe

```json
{
  "id": 1,
  "medida": 123,
  "medida_numero": "MED-2026-00123",
  "etapa": 1,
  "etapa_nombre": "Apertura",
  "tipo_etapa": "APERTURA",
  "numero_informe": 1,
  "fecha_vencimiento": "2026-03-01",
  "fecha_creacion": "2026-02-01T10:00:00Z",
  "fecha_completado": null,
  "estado": "PENDIENTE",
  "estado_display": "Pendiente",
  "contenido": null,
  "autor": null,
  "autor_nombre": "",
  "adjuntos": [],
  "esta_vencido": false,
  "dias_para_vencimiento": 28,
  "plantilla_archivo": null,
  "url_plantilla_archivo": null,
  "entrega_tardia": false,
  "tiene_plantilla": false
}
```

### A.3 Plantilla Info

```json
{
  "id": 1,
  "nombre": "Plantilla Informe Seguimiento v1",
  "descripcion": "Plantilla oficial para informes mensuales",
  "tipo_plantilla": "INFORME_SEGUIMIENTO",
  "tipo_plantilla_display": "Informe de Seguimiento Mensual",
  "archivo": "/media/plantillas/informes/2026/02/plantilla.pdf",
  "url_archivo": "https://api.runna.gob.ar/media/plantillas/informes/2026/02/plantilla.pdf",
  "version": "1.0",
  "activa": true,
  "fecha_creacion": "2026-02-01T10:00:00Z",
  "fecha_modificacion": "2026-02-01T10:00:00Z",
  "creado_por": 1,
  "creado_por_nombre": "Admin SENAF"
}
```

---

**Documento generado automaticamente por analisis de gap entre API y Frontend**
