"use client"

import { useEffect, useState } from 'react'
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  FormHelperText,
  OutlinedInput
} from '@mui/material'
import { get } from '@/app/api/apiService'

interface User {
  id: number
  username: string
  first_name: string
  last_name: string
  full_name: string
}

interface ResponsableSelectProps {
  value: number | number[]
  onChange: (value: number | number[]) => void
  label: string
  multiple?: boolean
  error?: boolean
  helperText?: string
  disabled?: boolean
  sx?: any
}

export const ResponsableSelect: React.FC<ResponsableSelectProps> = ({
  value,
  onChange,
  label,
  multiple = false,
  error,
  helperText,
  disabled,
  sx
}) => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await get<User[]>('users/?is_active=true')
      // Add full_name property by combining first_name and last_name
      const usersWithFullName = data.map(user => ({
        ...user,
        full_name: user.first_name || user.last_name
          ? `${user.first_name} ${user.last_name}`.trim()
          : user.username
      }))
      setUsers(usersWithFullName)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormControl fullWidth error={error} disabled={disabled} sx={sx}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as any)}
        label={label}
        multiple={multiple}
        input={<OutlinedInput label={label} />}
        renderValue={(selected) => {
          if (multiple && Array.isArray(selected)) {
            return (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((id) => {
                  const user = users.find(u => u.id === id)
                  return user ? (
                    <Chip
                      key={id}
                      label={user.full_name}
                      size="small"
                    />
                  ) : null
                })}
              </Box>
            )
          } else {
            const user = users.find(u => u.id === selected)
            return user ? user.full_name : ''
          }
        }}
      >
        {loading ? (
          <MenuItem disabled>Cargando usuarios...</MenuItem>
        ) : users.length === 0 ? (
          <MenuItem disabled>No hay usuarios disponibles</MenuItem>
        ) : (
          users.map((user) => (
            <MenuItem key={user.id} value={user.id}>
              {user.full_name} ({user.username})
            </MenuItem>
          ))
        )}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}
