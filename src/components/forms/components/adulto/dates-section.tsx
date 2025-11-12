"use client"

import type React from "react"
import { Grid, TextField } from "@mui/material"
import { Controller, type Control } from "react-hook-form"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { CalendarMonth as CalendarIcon } from "@mui/icons-material"
import FormSection from "../form-section"
import type { FormData } from "../../types/formTypes"
import { parseDateSafely, formatDateSafely } from "../../utils/dateUtils"

interface DatesSectionProps {
  index: number
  control: Control<FormData>
  readOnly: boolean
}

const DatesSection: React.FC<DatesSectionProps> = ({ index, control, readOnly }) => {
  return (
    <FormSection title="Fechas" icon={<CalendarIcon />}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Controller
            name={`adultosConvivientes.${index}.fechaNacimiento`}
            control={control}
            render={({ field }) => (
              <DatePicker
                label="Fecha de Nacimiento"
                disabled={readOnly}
                value={parseDateSafely(field.value)}
                onChange={(date) => field.onChange(formatDateSafely(date))}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    sx: { mb: 2 },
                  },
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Controller
            name={`adultosConvivientes.${index}.fechaDefuncion`}
            control={control}
            render={({ field }) => (
              <DatePicker
                label="Fecha de Defunción"
                disabled={readOnly}
                value={parseDateSafely(field.value)}
                onChange={(date) => field.onChange(formatDateSafely(date))}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    sx: { mb: 2 },
                  },
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Controller
            name={`adultosConvivientes.${index}.edadAproximada`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Edad Aproximada"
                fullWidth
                type="number"
                error={!!error}
                helperText={error?.message}
                InputProps={{ readOnly }}
                size="small"
                sx={{ mb: 2 }}
              />
            )}
          />
        </Grid>
      </Grid>
    </FormSection>
  )
}

export default DatesSection
