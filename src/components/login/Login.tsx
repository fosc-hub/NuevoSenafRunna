'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardHeader,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { decodeToken, login } from '@/utils/auth';
import { useUser } from '@/utils/auth/userZustand';
import { errorMessages } from '@/utils/errorMessages';

// Importamos React Hook Form y Zod
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// 1. Definimos un schema de Zod para el formulario
const loginFormSchema = z.object({
  username: z.string().nonempty('El nombre de usuario es requerido'),
  password: z.string().nonempty('La contraseña es requerida'),
});

// 2. Inferimos el tipo a partir del schema
type LoginFormInputs = z.infer<typeof loginFormSchema>;

export default function Login() {
  const router = useRouter();
  const setUser = useUser((state: any) => state.setUser);

  // Estado local para mostrar detalles de error de servidor (opcional)
  const [errorDetails, setErrorDetails] = useState('');

  // 3. useForm con zodResolver
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // 4. Función onSubmit que maneja la lógica de login y errores
  const onSubmit = async (data: LoginFormInputs) => {
    try {
      await login(data.username, data.password);



      const user = await decodeToken();
      setUser(user);
      router.push('/mesadeentrada');

    } catch (error: any) {
      console.error('Error during login:', error);

      // Manejamos el error proveniente del servidor
      const statusCode = error?.response?.status || 'Desconocido';
      const message = errorMessages[statusCode] || 'Ocurrió un error';

      // Guardamos detalles de error para debug (opcional)
      const errorCode = error?.response?.status || 'Desconocido';
      const errorMessage = error?.response?.data?.message || 'Sin detalles adicionales.';
      const details = `Credenciales Inválidas${errorCode}\nRespuesta del servidor: ${JSON.stringify(error?.response?.data)}`;
      setErrorDetails(details);

      // Mostramos notificación de error


      // Podemos establecer manualmente un error en un campo o en "root"
      setError('username', {
        type: 'manual',
        message: 'Nombre de usuario o contraseña incorrectos.',
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      <Box component="header" sx={{ width: '100%', py: 2, bgcolor: '#0EA5E9' }}>
        <Typography
          variant="h4"
          component="h1"
          fontWeight="bold"
          sx={{
            textAlign: 'center',
            color: 'white',
            paddingBottom: 2,
          }}
        >
          Runna
        </Typography>
      </Box>
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          bgcolor: '#E5E5E5',
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 400,
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
          }}
        >
          <CardHeader
            title="Iniciar sesión"
            titleTypographyProps={{ align: 'center', variant: 'h5' }}
          />
          <CardContent>
            <Box
              component="form"
              noValidate
              sx={{ mt: 1 }}
              // handleSubmit validará el formulario con Zod antes de llamar a onSubmit
              onSubmit={handleSubmit(onSubmit)}
            >
              <TextField
                margin="normal"
                fullWidth
                id="username"
                label="Nombre de usuario"
                autoFocus
                // El register se encarga de conectar el input con react-hook-form
                {...register('username')}
                // errors.[campo] contendrá el mensaje de error de Zod si no pasa la validación
                error={Boolean(errors.username)}
                helperText={errors.username?.message}
              />
              <TextField
                margin="normal"
                fullWidth
                type="password"
                label="Contraseña"
                id="password"
                {...register('password')}
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, bgcolor: 'primary.main' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'INGRESANDO...' : 'INGRESAR'}
              </Button>
            </Box>

            {/* Mostrar detalles adicionales del error de servidor si existen */}
            {errorDetails && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="error">
                  {errorDetails}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
