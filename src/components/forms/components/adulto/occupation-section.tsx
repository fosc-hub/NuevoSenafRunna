"use client"

import type React from "react"
import { Grid, FormControl, Autocomplete, TextField, Paper, FormControlLabel, Checkbox } from "@mui/material"
import { Controller, type Control } from "react-hook-form"
import { Work as WorkIcon } from "@mui/icons-material"
import FormSection from "../form-section"
import type { DropdownData, FormData } from "../../types/formTypes"

interface OccupationSectionProps {
  index: number
  control: Control<FormData>
  dropdownData: DropdownData
  readOnly: boolean
}

const OccupationSection: React.FC<OccupationSectionProps> = ({ index, control, dropdownData, readOnly }) => {
  return (
    <FormSection title="Ocupación y Responsabilidad" icon={<WorkIcon />}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Controller
            name={`adultosConvivientes.${index}.ocupacion`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error} sx={{ mb: 2 }}>
                <Autocomplete
                  disabled={readOnly}
                  options={dropdownData.ocupacion_choices || []}
                  getOptionLabel={(option) => option.value || ""}
                  value={dropdownData.ocupacion_choices?.find((item) => item.key === field.value) || null}
                  onChange={(_, newValue) => field.onChange(newValue ? newValue.key : null)}
                  renderInput={(params) => (
                    <TextField {...params} label="Ocupación" error={!!error} helperText={error?.message} size="small" />
                  )}
                  PopperProps={{
                    style: { width: "auto", maxWidth: "300px" },
                  }}
                  size="small"
                />
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              borderRadius: 1,
              mb: 2,
            }}
          >
            <FormControlLabel
              control={
                <Controller
                  name={`adultosConvivientes.${index}.legalmenteResponsable`}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Checkbox
                      checked={value}
                      onChange={(e) => onChange(e.target.checked)}
                      disabled={readOnly}
                      size="small"
                    />
                  )}
                />
              }
              label="Legalmente Responsable"
            />

            <FormControlLabel
              control={
                <Controller
                  name={`adultosConvivientes.${index}.conviviente`}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Checkbox
                      checked={value}
                      onChange={(e) => onChange(e.target.checked)}
                      disabled={readOnly}
                      size="small"
                    />
                  )}
                />
              }
              label="Conviviente con el NNYA"
            />
          </Paper>
        </Grid>
      </Grid>
    </FormSection>
  )
}

export default OccupationSection
