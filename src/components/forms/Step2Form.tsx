import type React from "react"
import { TextField, Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material"
import { Controller, type Control } from "react-hook-form"
import type { FormData } from "./MultiStepForm"

interface Step2FormProps {
  control: Control<FormData>
  readOnly?: boolean
}

const Step2Form: React.FC<Step2FormProps> = ({ control, readOnly = false }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Controller
        name="street"
        control={control}
        defaultValue=""
        rules={{ required: "Street is required" }}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            label="Street"
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
        name="city"
        control={control}
        defaultValue=""
        rules={{ required: "City is required" }}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            label="City"
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
        name="country"
        control={control}
        defaultValue=""
        rules={{ required: "Country is required" }}
        render={({ field, fieldState: { error } }) => (
          <FormControl fullWidth error={!!error}>
            <InputLabel>Country</InputLabel>
            <Select {...field} label="Country" inputProps={{ readOnly: readOnly }}>
              <MenuItem value="USA">USA</MenuItem>
              <MenuItem value="Canada">Canada</MenuItem>
              <MenuItem value="UK">UK</MenuItem>
              <MenuItem value="Australia">Australia</MenuItem>
            </Select>
          </FormControl>
        )}
      />
    </Box>
  )
}

export default Step2Form

