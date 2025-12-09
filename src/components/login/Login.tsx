"use client"

import { useState } from "react"
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  InputAdornment,
} from "@mui/material"
import { Visibility, VisibilityOff } from "@mui/icons-material"
import { useRouter } from "next/navigation"
import { decodeToken, login } from "@/utils/auth"
import { useUser } from "@/utils/auth/userZustand"
import { errorMessages } from "@/utils/errorMessages"
import axiosInstance from "@/app/api/utils/axiosInstance"
import type { UserPermissions } from "@/utils/auth/userZustand"
import Image from "next/image"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const loginFormSchema = z.object({
  username: z.string().nonempty("El nombre de usuario es requerido"),
  password: z.string().nonempty("La contraseña es requerida"),
})

type LoginFormInputs = z.infer<typeof loginFormSchema>

export default function Login() {
  const router = useRouter()
  const setUser = useUser((state: any) => state.setUser)
  const [errorDetails, setErrorDetails] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      // First get the token
      const result = await login(data.username, data.password);

      // Check if login was successful
      if (!result.success) {
        const details = `Credenciales Inválidas\nCódigo: ${result.error?.status || 'Desconocido'}\nRespuesta del servidor: ${JSON.stringify(result.error?.details || result.error?.message)}`;
        setErrorDetails(details);
        setError("username", {
          type: "manual",
          message: result.error?.message || "Nombre de usuario o contraseña incorrectos.",
        });
        return;
      }

      // Use axiosInstance with the token for this specific request
      const userResponse = await axiosInstance.get<UserPermissions>('/user/me/', {
        headers: {
          Authorization: `Bearer ${result.accessToken}`
        }
      });

      if (!userResponse.data) {
        throw new Error('No user data received from API');
      }

      setUser(userResponse.data);
      router.push("/mesadeentrada");
    } catch (error: any) {
      console.error("Error during login:", error);
      const statusCode = error?.response?.status || "Desconocido";
      const message = errorMessages[statusCode] || "Ocurrió un error";
      const errorCode = error?.response?.status || "Desconocido";
      const errorMessage = error?.response?.data?.message || "Sin detalles adicionales.";
      const details = `Error de conexión\nCódigo: ${errorCode}\nRespuesta del servidor: ${JSON.stringify(error?.response?.data)}`;
      setErrorDetails(details);
      setError("username", {
        type: "manual",
        message: "Error al conectar con el servidor.",
      });
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #00508C 0%, #00BCD4 100%)",
      }}
    >
      {/* Logo RUNNA flotante */}
      <Box
        component="header"
        sx={{
          width: "100%",
          pt: 4,
          pb: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            position: "relative",
            height: 95,
            width: 340,
            filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2))"
          }}
        >
          <Image
            src="/img/Logo RUNNA nuevo.png"
            alt="Logo Runna"
            fill
            style={{ objectFit: "contain" }}
            priority
          />
        </Box>
      </Box>
      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          py: 3,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Imagen de fondo */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
            opacity: 0.12,
          }}
        >
          <Image
            src="/img/Fondo. Mesa de Legajos.png"
            alt="Fondo"
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        </Box>
        <Card
          sx={{
            width: "100%",
            maxWidth: 440,
            boxShadow: "0px 12px 40px rgba(0, 0, 0, 0.2), 0px 0px 0px 1px rgba(0, 188, 212, 0.1) inset",
            position: "relative",
            zIndex: 1,
            borderRadius: 3,
            backgroundColor: "rgba(248, 252, 255, 0.94)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.6)",
            overflow: "hidden",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0px 16px 48px rgba(0, 0, 0, 0.25), 0px 0px 0px 1px rgba(0, 188, 212, 0.15) inset",
            }
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 6,
              background: "linear-gradient(90deg, #00508C 0%, #00BCD4 50%, #009688 100%)",
            }}
          />
          <CardHeader
            title="Iniciar sesión"
            titleTypographyProps={{
              align: "center",
              variant: "h4",
              fontWeight: 700,
              color: "#00508C",
              sx: {
                background: "linear-gradient(135deg, #00508C 0%, #00BCD4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.5px"
              }
            }}
            sx={{ pt: 4, pb: 2 }}
          />
          <CardContent sx={{ px: 4, pb: 4 }}>
            <Box component="form" noValidate sx={{ mt: 1 }} onSubmit={handleSubmit(onSubmit)}>
              <TextField
                margin="normal"
                fullWidth
                id="username"
                label="Nombre de usuario"
                autoFocus
                {...register("username")}
                error={Boolean(errors.username)}
                helperText={errors.username?.message}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "rgba(0, 188, 212, 0.02)",
                    },
                    "&.Mui-focused": {
                      backgroundColor: "rgba(0, 188, 212, 0.05)",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#00BCD4",
                        borderWidth: 2,
                      }
                    }
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#00508C",
                    fontWeight: 600,
                  }
                }}
              />
              <TextField
                margin="normal"
                fullWidth
                type={showPassword ? "text" : "password"}
                label="Contraseña"
                id="password"
                {...register("password")}
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "rgba(0, 188, 212, 0.02)",
                    },
                    "&.Mui-focused": {
                      backgroundColor: "rgba(0, 188, 212, 0.05)",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#00BCD4",
                        borderWidth: 2,
                      }
                    }
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#00508C",
                    fontWeight: 600,
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                        sx={{
                          color: "#00508C",
                          "&:hover": {
                            backgroundColor: "rgba(0, 188, 212, 0.1)",
                          }
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 4,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: "1rem",
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  background: "linear-gradient(135deg, #00508C 0%, #00BCD4 100%)",
                  boxShadow: "0 4px 14px rgba(0, 188, 212, 0.4)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "linear-gradient(135deg, #003D6E 0%, #009AAC 100%)",
                    boxShadow: "0 6px 20px rgba(0, 188, 212, 0.5)",
                    transform: "translateY(-2px)",
                  },
                  "&:active": {
                    transform: "translateY(0px)",
                  },
                  "&:disabled": {
                    background: "linear-gradient(135deg, #90A4AE 0%, #B0BEC5 100%)",
                    boxShadow: "none",
                  }
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "INGRESANDO..." : "INGRESAR"}
              </Button>
            </Box>

            {errorDetails && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "rgba(211, 47, 47, 0.08)",
                  border: "1px solid rgba(211, 47, 47, 0.2)"
                }}
              >
                <Typography variant="body2" color="error" sx={{ fontWeight: 500 }}>
                  {errorDetails}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

      </Box>

      {/* Footer con barra oscura para logos institucionales */}
      <Box
        component="footer"
        sx={{
          width: "100%",
          bgcolor: "rgba(0, 35, 66, 0.92)",
          backdropFilter: "blur(8px)",
          py: 2.5,
          px: 2,
          borderTop: "1px solid rgba(0, 188, 212, 0.2)",
          boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.15)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            position: "relative",
            height: 70,
            width: "100%",
            maxWidth: 750,
          }}
        >
          <Image
            src="/img/Logos - Blanco.png"
            alt="Logos institucionales"
            fill
            style={{ objectFit: "contain" }}
          />
        </Box>
      </Box>
    </Box>
  )
}

