import React from 'react';
import { toast } from 'react-toastify';
import { Box, Typography, IconButton } from '@mui/material';
import ContentCopy from '@mui/icons-material/ContentCopy'; // Icono para copiar texto
interface ErrorToastProps {
  message: string;
  details: string;
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.info('¡Texto copiado al portapapeles!', {
    position: 'top-center',
    autoClose: 2000,
    hideProgressBar: true,
    theme: 'light',
  });
};

const ErrorToast: React.FC<ErrorToastProps> = ({ message, details }) => {
 

  return (
    <div>
      <p>{message}</p>
      <button
         onClick={() => {
          // Expandir para mostrar detalles adicionales
          toast.info(
            <Box sx={{ whiteSpace: 'pre-wrap', bgcolor: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
              <Typography variant="body2" fontFamily="monospace" sx={{ color: 'black', marginBottom: '5px' }}>
                {details}
              </Typography>
              <IconButton
                onClick={() => copyToClipboard(details)}
                color="primary"
                size="small"
                aria-label="Copiar detalles"
              >
                <ContentCopy />
              </IconButton>
            </Box>,
            {
              position: 'top-center',
              autoClose: false,
              draggable: true,
              closeOnClick: true,
              hideProgressBar: true,
              theme: 'colored',
              style: {
                backgroundColor: '#e74c3c', // Fondo rojo
                color: 'white', // Texto blanco
              },
            }
          );
        }}
      >
        Ver detalles
      </button>
    </div>
  );
};

export default ErrorToast;
