"use client"

import type React from "react"
import { Grid, TextField } from "@mui/material"
import { Controller, type Control } from "react-hook-form"
import { Notes as NotesIcon } from "@mui/icons-material"
import FormSection from "../form-section"
import type { FormData } from "../../types/formTypes"

interface ObservationsSectionProps {
  index: number
  control: Control<FormData>
  readOnly: boolean
}

const ObservationsSection: React.FC<ObservationsSectionProps> = ({ index, control, readOnly }) => {
  return (
    <FormSection title="Observaciones" icon={<NotesIcon />}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Controller
            name={`adultosConvivientes.${index}.observaciones`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Observaciones"
                fullWidth
                multiline
                rows={4}
                error={!!error}
                helperText={error?.message}
                InputProps={{ readOnly }}
                size="small"
                placeholder="Ingrese cualquier información adicional relevante..."
                sx={{ mb: 2 }}
              />
            )}
          />
        </Grid>
      </Grid>
    </FormSection>
  )
}

export default ObservationsSection
