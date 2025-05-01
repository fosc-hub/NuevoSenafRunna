"use client"

import type React from "react"
import { Grid, TextField, Paper, FormControlLabel, Switch, Box, Typography } from "@mui/material"
import { Controller, type Control } from "react-hook-form"
import { Phone as PhoneIcon, Home as HomeIcon } from "@mui/icons-material"
import FormSection from "../form-section"
import LocalizacionFields from "../../LocalizacionFields"
import type { DropdownData, FormData } from "../../types/formTypes"

interface ContactSectionProps {
  index: number
  control: Control<FormData>
  dropdownData: DropdownData
  readOnly: boolean
  watchedField: any
}

const ContactSection: React.FC<ContactSectionProps> = ({ index, control, dropdownData, readOnly, watchedField }) => {
  return (
    <FormSection title="Datos de Contacto" icon={<PhoneIcon />}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Controller
            name={`adultosConvivientes.${index}.telefono`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Número de Teléfono"
                fullWidth
                error={!!error}
                helperText={error?.message}
                InputProps={{ readOnly }}
                size="small"
                type="number"
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                sx={{ mb: 2 }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              borderRadius: 1,
              mb: 2,
            }}
          >
            <FormControlLabel
              control={
                <Controller
                  name={`adultosConvivientes.${index}.useDefaultLocalizacion`}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Switch
                      checked={value}
                      onChange={(e) => onChange(e.target.checked)}
                      disabled={readOnly}
                      size="small"
                    />
                  )}
                />
              }
              label="Usar localización de la demanda"
            />
          </Paper>
        </Grid>

        {!watchedField.useDefaultLocalizacion && (
          <Grid item xs={12}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 1,
                mb: 2,
                borderColor: "primary.light",
                borderStyle: "dashed",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <HomeIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle2">Localización específica</Typography>
              </Box>
              <LocalizacionFields
                control={control}
                prefix={`adultosConvivientes.${index}.localizacion`}
                dropdownData={dropdownData}
                readOnly={readOnly}
              />
            </Paper>
          </Grid>
        )}
      </Grid>
    </FormSection>
  )
}

export default ContactSection
