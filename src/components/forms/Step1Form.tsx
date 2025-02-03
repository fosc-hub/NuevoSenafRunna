import type React from "react"
import { TextField, Box } from "@mui/material"
import { Controller, type Control } from "react-hook-form"
import type { FormData } from "./MultiStepForm"

interface Step1FormProps {
  control: Control<FormData>
  readOnly?: boolean
}

const Step1Form: React.FC<Step1FormProps> = ({ control, readOnly = false }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Controller
        name="name"
        control={control}
        defaultValue=""
        rules={{ required: "Name is required" }}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            label="Name"
            error={!!error}
            helperText={error?.message}
            fullWidth
            InputProps={{
              readOnly: readOnly,
            }}
          />
        )}
      />
      <Controller
        name="email"
        control={control}
        defaultValue=""
        rules={{ required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" } }}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            label="Email"
            type="email"
            error={!!error}
            helperText={error?.message}
            fullWidth
            InputProps={{
              readOnly: readOnly,
            }}
          />
        )}
      />
    </Box>
  )
}

export default Step1Form

