"use client"

import type React from "react"
import { Grid, FormControl, Autocomplete, TextField } from "@mui/material"
import { Controller, type Control } from "react-hook-form"
import { Link as LinkIcon } from "@mui/icons-material"
import FormSection from "../form-section"
import RequiredLabel from "../required-label"
import type { DropdownData, FormData } from "../../types/formTypes"

interface LinksSectionProps {
  index: number
  control: Control<FormData>
  dropdownData: DropdownData
  readOnly: boolean
}

const LinksSection: React.FC<LinksSectionProps> = ({ index, control, dropdownData, readOnly }) => {
  return (
    <FormSection title="Vínculos" icon={<LinkIcon />}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Controller
            name={`adultosConvivientes.${index}.vinculacion`}
            rules={{ required: "Este campo es obligatorio" }}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error} sx={{ mb: 2 }}>
                <Autocomplete
                  disabled={readOnly}
                  options={dropdownData.vinculo_demanda_choices || []}
                  getOptionLabel={(option) => option.value || ""}
                  value={dropdownData.vinculo_demanda_choices?.find((item) => item.key === field.value) || null}
                  onChange={(_, newValue) => field.onChange(newValue ? newValue.key : null)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={<RequiredLabel label="Vinculación" />}
                      error={!!error}
                      helperText={error?.message}
                      size="small"
                    />
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
          <Controller
            name={`adultosConvivientes.${index}.vinculo_con_nnya_principal`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error} sx={{ mb: 2 }}>
                <Autocomplete
                  disabled={readOnly}
                  options={dropdownData.vinculo_con_nnya_principal_choices || []}
                  getOptionLabel={(option) => option.nombre || ""}
                  value={
                    dropdownData.vinculo_con_nnya_principal_choices?.find((item) => item.id === field.value) || null
                  }
                  onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Vínculo con NNYA Principal"
                      error={!!error}
                      helperText={error?.message}
                      size="small"
                    />
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
      </Grid>
    </FormSection>
  )
}

export default LinksSection
