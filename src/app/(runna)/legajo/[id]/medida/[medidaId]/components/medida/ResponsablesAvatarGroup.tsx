"use client"

import React from 'react'
import { Box, Avatar, AvatarGroup, Tooltip, Typography, Chip } from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import type { TUsuarioInfo } from '../../types/actividades'

interface ResponsablesAvatarGroupProps {
  responsablePrincipal: TUsuarioInfo
  responsablesSecundarios?: TUsuarioInfo[]
  maxDisplay?: number
}

function stringToColor(string: string): string {
  let hash = 0
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash)
  }
  let color = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    color += `00${value.toString(16)}`.slice(-2)
  }
  return color
}

function getInitials(fullName: string): string {
  const names = fullName.trim().split(' ')
  if (names.length === 0) return '?'
  if (names.length === 1) return names[0].charAt(0).toUpperCase()
  return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase()
}

export const ResponsablesAvatarGroup: React.FC<ResponsablesAvatarGroupProps> = ({
  responsablePrincipal,
  responsablesSecundarios = [],
  maxDisplay = 3
}) => {
  const totalResponsables = 1 + responsablesSecundarios.length
  const hasSecundarios = responsablesSecundarios.length > 0

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {/* Responsable Principal */}
      <Tooltip
        title={
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
              Responsable Principal
            </Typography>
            <Typography variant="caption">{responsablePrincipal.full_name}</Typography>
          </Box>
        }
        arrow
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              fontSize: '0.875rem',
              fontWeight: 600,
              bgcolor: stringToColor(responsablePrincipal.full_name),
              border: '2px solid #fff',
              boxShadow: 1
            }}
          >
            {getInitials(responsablePrincipal.full_name)}
          </Avatar>
        </Box>
      </Tooltip>

      {/* Responsables Secundarios */}
      {hasSecundarios && (
        <Tooltip
          title={
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                Responsables Secundarios ({responsablesSecundarios.length})
              </Typography>
              {responsablesSecundarios.map((resp) => (
                <Typography key={resp.id} variant="caption" sx={{ display: 'block' }}>
                  • {resp.full_name}
                </Typography>
              ))}
            </Box>
          }
          arrow
        >
          <AvatarGroup
            max={maxDisplay}
            sx={{
              '& .MuiAvatar-root': {
                width: 28,
                height: 28,
                fontSize: '0.75rem',
                fontWeight: 600,
                border: '2px solid #fff'
              }
            }}
          >
            {responsablesSecundarios.map((resp) => (
              <Avatar
                key={resp.id}
                sx={{
                  bgcolor: stringToColor(resp.full_name)
                }}
              >
                {getInitials(resp.full_name)}
              </Avatar>
            ))}
          </AvatarGroup>
        </Tooltip>
      )}

      {/* Total Count Badge */}
      {totalResponsables > 1 && (
        <Chip
          label={`+${responsablesSecundarios.length}`}
          size="small"
          sx={{
            height: 20,
            fontSize: '0.7rem',
            fontWeight: 600,
            bgcolor: 'rgba(156, 39, 176, 0.1)',
            color: 'primary.main'
          }}
        />
      )}
    </Box>
  )
}
