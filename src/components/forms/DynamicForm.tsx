import type React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Typography,
  Paper,
} from "@mui/material"

interface FieldConfig {
  type: "text" | "number" | "email" | "select" | "checkbox"
  label: string
  required?: boolean
  options?: string[] // For select fields
}

interface FieldGroup {
  title: string
  fields: Record<string, FieldConfig>
}

type FormStructure = Record<string, FieldConfig | FieldGroup>

interface DynamicFormProps {
  formStructure: FormStructure
  onSubmit: (data: any) => void
}

const DynamicForm: React.FC<DynamicFormProps> = ({ formStructure, onSubmit }) => {
  const createZodSchema = (fields: Record<string, FieldConfig>) => {
    return z.object(
      Object.entries(fields).reduce((acc, [key, config]) => {
        let fieldSchema
        switch (config.type) {
          case "number":
            fieldSchema = z.number()
            break
          case "email":
            fieldSchema = z.string().email()
            break
          case "checkbox":
            fieldSchema = z.boolean()
            break
          default:
            fieldSchema = z.string()
        }

        if (!config.required) {
          fieldSchema = fieldSchema.optional()
        }

        return { ...acc, [key]: fieldSchema }
      }, {}),
    )
  }

  const schema = z.object(
    Object.entries(formStructure).reduce((acc, [key, value]) => {
      if ("fields" in value) {
        return { ...acc, [key]: createZodSchema(value.fields) }
      } else {
        return { ...acc, [key]: createZodSchema({ [key]: value }) }
      }
    }, {}),
  )

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  })

  const renderField = (name: string, config: FieldConfig, groupName?: string) => {
    const fieldName = groupName ? `${groupName}.${name}` : name
    const error = groupName ? (errors[groupName] as any)?.[name] : errors[name]

    const commonProps = {
      label: config.label,
      required: config.required,
      error: !!error,
      helperText: error?.message as string,
    }

    switch (config.type) {
      case "select":
        return (
          <FormControl fullWidth key={fieldName} error={!!error}>
            <InputLabel required={config.required}>{config.label}</InputLabel>
            <Controller
              name={fieldName}
              control={control}
              defaultValue=""
              rules={{ required: config.required }}
              render={({ field }) => (
                <Select {...field} label={config.label}>
                  {config.options?.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {error && (
              <Typography variant="caption" color="error">
                {error.message as string}
              </Typography>
            )}
          </FormControl>
        )
      case "checkbox":
        return (
          <FormControlLabel
            key={fieldName}
            control={
              <Controller
                name={fieldName}
                control={control}
                defaultValue={false}
                rules={{ required: config.required }}
                render={({ field }) => <Checkbox {...field} />}
              />
            }
            label={
              <>
                {config.label}
                {config.required && <span style={{ color: "red" }}> *</span>}
              </>
            }
          />
        )
      default:
        return (
          <Controller
            key={fieldName}
            name={fieldName}
            control={control}
            defaultValue=""
            rules={{ required: config.required }}
            render={({ field }) => <TextField {...field} {...commonProps} type={config.type} fullWidth />}
          />
        )
    }
  }

  const renderGroup = (groupName: string, group: FieldGroup) => (
    <Paper key={groupName} elevation={2} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        {group.title}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {Object.entries(group.fields).map(([fieldName, fieldConfig]) => renderField(fieldName, fieldConfig, groupName))}
      </Box>
    </Paper>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {Object.entries(formStructure).map(([key, value]) =>
          "fields" in value ? renderGroup(key, value) : renderField(key, value),
        )}
        <Button type="submit" variant="contained" color="primary">
          Submit
        </Button>
      </Box>
    </form>
  )
}

export default DynamicForm

