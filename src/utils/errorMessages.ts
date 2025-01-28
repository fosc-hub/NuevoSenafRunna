export const errorMessages: Record<number | string, string> = {
    400: 'Solicitud inválida. Por favor, verifica los datos enviados.',
    401: 'No autorizado. Por favor, verifica tus credenciales.',
    403: 'Acceso denegado. No tienes permisos para realizar esta acción.',
    404: 'Recurso no encontrado.',
    408: 'La solicitud ha tardado demasiado. Por favor, inténtalo nuevamente.',
    429: 'Demasiadas solicitudes. Por favor, espera antes de intentarlo de nuevo.',
    500: 'Error interno del servidor. Por favor, inténtalo más tarde.',
    502: 'Puerta de enlace no válida. Por favor, verifica tu conexión.',
    503: 'Servicio no disponible. Por favor, inténtalo más tarde.',
    504: 'Tiempo de espera agotado. Por favor, verifica tu conexión a Internet.',
    "default": 'Ocurrió un error inesperado. Por favor intenta nuevamente.', // Comillas aquí
  };
  
  export const getErrorMessage = (status: number): string =>
    errorMessages[status] || errorMessages["default"]; // Comillas aquí también
  