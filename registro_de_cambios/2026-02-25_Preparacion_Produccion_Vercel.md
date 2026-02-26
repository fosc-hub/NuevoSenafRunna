# Registro de Cambio: Preparación para Despliegue en Producción (Vercel/Railway)

## Fecha: 2026-02-25

## Descripción
Se ha auditado y preparado el proyecto para ser desplegado en Vercel, conectándolo directamente con el backend de Railway y la base de datos PostgreSQL existente.

## Cambios Realizados

### Frontend (Next.js)
- **Centralización de API**: Se eliminaron las referencias locales (`localhost:8000`) en componentes críticos como `Actividades` y `Adjuntos`.
- **Configuración de URL Base**: 
    - Se actualizó la lógica para que las URLs de archivos adjuntos se construyan dinámicamente usando `process.env.NEXT_PUBLIC_API_URL` o el fallback de Railway.
    - Se garantizó que el `axiosInstance.ts` priorice la variable de entorno para todas las peticiones a la API.
- **Soporte para Ambientes**: El sistema ahora detecta automáticamente si debe usar el backend de desarrollo local o el de producción en Railway.

### Archivos Modificados
- `src/app/api/utils/axiosInstance.ts`: Verificado para priorizar `NEXT_PUBLIC_API_URL`.
- `src/components/evaluacion/tabs/actividades.tsx`: Actualizado para previsualización de archivos en la nube.
- `src/components/evaluacion/tabs/adjuntos.tsx`: Corregida la construcción de URLs de descarga.

## Instrucciones de Despliegue

1.  **En GitHub**: Subir el contenido de la carpeta `NuevoSenafRunna-main` a un repositorio nuevo.
2.  **En Vercel**:
    - Importar el repositorio.
    - En la sección **Environment Variables**, agregar:
        `NEXT_PUBLIC_API_URL` = `https://web-runna-v2legajos.up.railway.app/api`
3.  **CORS**: Asegurarse de que el backend en Railway tenga permitido el dominio de Vercel en `django-cors-headers`.

## Impacto
El proyecto ahora es "Cloud-Ready", permitiendo transicionar de un entorno de pruebas local a uno de producción real con un solo clic de despliegue.
