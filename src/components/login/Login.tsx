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
import { get } from "@/app/api/apiService"
import type { UserPermissions } from "@/utils/auth/userZustand"

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
      await login(data.username, data.password)
      const response = await get<UserPermissions>('/user/me/')
      const userData = Array.isArray(response) ? response[0] : response

      console.log('API Response:', response)
      console.log('User data from API:', userData)
      console.log('User permissions:', userData?.all_permissions)

      if (!userData) {
        throw new Error('No user data received from API')
      }

      setUser(userData)
      console.log('User data after setting in Zustand:', useUser.getState().user)
      router.push("/mesadeentrada")
    } catch (error: any) {
      console.error("Error during login:", error)
      const statusCode = error?.response?.status || "Desconocido"
      const message = errorMessages[statusCode] || "Ocurrió un error"
      const errorCode = error?.response?.status || "Desconocido"
      const errorMessage = error?.response?.data?.message || "Sin detalles adicionales."
      const details = `Credenciales Inválidas${errorCode}\nRespuesta del servidor: ${JSON.stringify(error?.response?.data)}`
      setErrorDetails(details)
      setError("username", {
        type: "manual",
        message: "Nombre de usuario o contraseña incorrectos.",
      })
    }
  }

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      <Box component="header" sx={{ width: "100%", py: 2, bgcolor: "#0EA5E9" }}>
        <Typography
          variant="h4"
          component="h1"
          fontWeight="bold"
          sx={{
            textAlign: "center",
            color: "white",
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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          bgcolor: "#E5E5E5",
        }}
      >
        <Card
          sx={{
            width: "100%",
            maxWidth: 400,
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.15)",
          }}
        >
          <CardHeader title="Iniciar sesión" titleTypographyProps={{ align: "center", variant: "h5" }} />
          <CardContent>
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
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
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
                sx={{ mt: 3, mb: 2, bgcolor: "primary.main" }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "INGRESANDO..." : "INGRESAR"}
              </Button>
            </Box>

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
  )
}

