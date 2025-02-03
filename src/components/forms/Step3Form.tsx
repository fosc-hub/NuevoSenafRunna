import type React from "react"
import { TextField, Box, Checkbox, FormControlLabel } from "@mui/material"
import { Controller, type Control } from "react-hook-form"
import type { FormData } from "./MultiStepForm"

interface Step3FormProps {
  control: Control<FormData>
  readOnly?: boolean
}

const Step3Form: React.FC<Step3FormProps> = ({ control, readOnly = false }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Controller
        name="subscribe"
        control={control}
        defaultValue={false}
        render={({ field }) => (
          <FormControlLabel control={<Checkbox {...field} disabled={readOnly} />} label="Subscribe to newsletter" />
        )}
      />
      <Controller
        name="comments"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <TextField
            {...field}
            label="Additional Comments"
            multiline
            rows={4}
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

export default Step3Form

