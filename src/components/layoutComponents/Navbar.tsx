"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState, useMemo } from "react"
import { Bell, LogOut, ChevronDown } from "lucide-react"
import UserAvatar from "./UserAvatar"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { getSession, logout } from "@/utils/auth"
import { useUser } from "@/utils/auth/userZustand"
import { UserPermissions } from "@/utils/auth/userZustand"
import { useQuery } from "@tanstack/react-query"
import { globalActividadService } from "@/app/(runna)/legajo/actividades/services/globalActividadService"
import { getAllMedidas } from "@/app/(runna)/legajo-mesa/api/medidas-api-service"
import { extractArray } from "@/hooks/useApiQuery"
import type { TActividadPlanTrabajo } from "@/app/(runna)/legajo/[id]/medida/[medidaId]/types/actividades"
import {
  shouldNotifyActivity,
  shouldNotifyMedida,
  UserPermissions as NotificationUserPerms
} from "@/utils/notification-utils"

export default function Header() {
  const [showMenu, setShowMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [loadingUser, setLoadingUser] = useState(true)
  const [isClient, setIsClient] = useState(false)

  const user = useUser((state) => state.user) as UserPermissions | null

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    async function fetchUser() {
      if (!user || Object.keys(user).length === 0) {
        const userData = await getSession(true)
        if (userData && typeof userData === 'object') {
          useUser.setState({ user: userData as UserPermissions })
        }
      }
      setLoadingUser(false)
    }

    fetchUser()
  }, [user])

  // Determine user roles for notifications
  const roles = useMemo(() => {
    if (!user) return { isET: false, isJZ: false, isLegal: false, user_id: null }
    const groups = user.groups || []
    const groupNames = groups.map((g) => g.name.toLowerCase())

    const isJZ =
      groupNames.some((n) => n.includes("jefe zonal")) ||
      groupNames.some((n) => n.includes("jz")) ||
      groupNames.some((n) => n.includes("jefes zonales"))

    const isDirector =
      groupNames.some((n) => n.includes("director provincial")) ||
      groupNames.some((n) => n.includes("director interior")) ||
      groupNames.some((n) => n.includes("director")) ||
      groupNames.some((n) => n.includes("directores"))

    const isLegal =
      groupNames.some((n) => n.includes("legales")) ||
      groupNames.some((n) => n.includes("legal")) ||
      groupNames.some((n) => n.includes("equipo legal")) ||
      user.zonas?.some((z) => z.legal === true)

    const isET =
      groupNames.some((n) => n.includes("equipo técnico")) ||
      groupNames.some((n) => n.includes("equipo tecnico")) ||
      groupNames.some((n) => n.includes("et")) ||
      (!isJZ && !isDirector && !isLegal)

    return {
      isET,
      isJZ: isJZ || isDirector,
      isLegal,
      user_id: user.id
    }
  }, [user])

  // Fetch pending activities for the badge
  const { data: actData } = useQuery({
    queryKey: ['navbar-notifications-count'],
    queryFn: () => globalActividadService.list({
      page_size: 100,
      ordering: '-fecha_creacion'
    }),
    enabled: !!user?.id,
    refetchInterval: 60 * 1000, // Refresh every 60 seconds
    staleTime: 30 * 1000
  })

  // Fetch active measures for "Virtual Activities" (pending legal reports, etc.)
  const { data: medData } = useQuery({
    queryKey: ['navbar-measures-active'],
    queryFn: () => getAllMedidas({
      estado_vigencia: 'VIGENTE',
      limit: 100
    }),
    enabled: !!user?.id && (roles.isLegal || roles.isJZ),
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000
  })

  // Calculate pending activities based on the same logic as the tray highlighting
  const pendingActivities = useMemo(() => {
    if (!roles.user_id) return []

    const userPerms: NotificationUserPerms = {
      isDirector: !!user?.groups?.some(g => g.name.toLowerCase().includes("director")),
      isLegales: roles.isLegal,
      isEquipoTecnico: roles.isET,
      isJefeZonal: roles.isJZ,
      isAdmin: !!user?.is_superuser,
      userId: roles.user_id,
    }

    // 1. Process standard activities
    const activities = extractArray<TActividadPlanTrabajo>(actData as any)
    const filteredActivities = activities.filter(act => shouldNotifyActivity(act, userPerms))

    // 2. Process measures as "Virtual Activities"
    const measures = extractArray<any>(medData as any)
    const virtualActivitiesFromMeasures = measures
      .filter(med => shouldNotifyMedida(med, userPerms))
      .map(med => {
        // Defensive extraction of legajo ID
        const legajoId = med.legajo?.id || med.legajo_id || (typeof med.legajo === 'number' ? med.legajo : 0)

        // Defensive extraction of NNYA info
        const nnyaNombre = med.legajo?.nnya?.nombre || med.nnya_nombre || `Medida ${med.numero_medida}`
        const nnyaApellido = med.legajo?.nnya?.apellido || med.nnya_apellido || ""

        return {
          id: `med-${med.id}`,
          isVirtual: true,
          legajo_info: {
            id: legajoId,
            numero: med.numero_medida,
            nnya_nombre: nnyaNombre,
            nnya_apellido: nnyaApellido,
          },
          medida_info: { id: med.id },
          tipo_actividad_info: {
            nombre: med.etapa_actual?.estado === "PENDIENTE_INFORME_JURIDICO"
              ? "Pendiente Informe Jurídico"
              : med.etapa_actual?.estado === "PENDIENTE_NOTA_AVAL"
                ? "Pendiente Nota de Aval"
                : "Intervención Pendiente"
          },
          estado_display: "PENDIENTE",
          fecha_creacion: med.fecha_modificacion || med.fecha_creacion || new Date().toISOString()
        }
      })

    // Combine both lists
    const combined = [...filteredActivities, ...virtualActivitiesFromMeasures]

    if (process.env.NODE_ENV === "development") {
      console.log("[Navbar Notifications Sync]:", {
        userPerms,
        activities: filteredActivities.length,
        measures: virtualActivitiesFromMeasures.length,
        total: combined.length
      })
    }

    return combined
  }, [actData, medData, roles, user])

  const pendingCount = pendingActivities.length

  const handleLogout = async () => {
    try {
      // Intentar el logout oficial
      await logout();

      // Limpieza manual de "seguridad" para el modo Supabase/Local
      if (typeof window !== 'undefined') {
        const Cookies = (await import('js-cookie')).default;
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        Cookies.remove('mock_username');
        useUser.setState({ user: null });
      }

      toast.success("Sesión cerrada con éxito");
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    } catch (error) {
      console.error("Logout falló, aplicando limpieza forzada:", error);
      // Limpieza forzada si falla el server action
      if (typeof window !== 'undefined') {
        const Cookies = (await import('js-cookie')).default;
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        Cookies.remove('mock_username');
        useUser.setState({ user: null });
        window.location.href = "/login";
      }
    }
  }

  if (!isClient || loadingUser) {
    return (
      <header
        className="text-white p-4 flex justify-between items-center h-[72px] shadow-md"
        style={{ background: 'linear-gradient(90deg, #00508C 0%, #006BA6 100%)' }}
      >
        <div className="flex items-center space-x-4">
          <div className="w-32 h-10 bg-white/20 rounded animate-pulse"></div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-36 h-9 bg-white/20 rounded-md animate-pulse"></div>
          <div className="w-36 h-9 bg-white/20 rounded-md animate-pulse"></div>
          <div className="w-6 h-6 bg-white/20 rounded-full animate-pulse"></div>
          <div className="w-10 h-10 bg-white/20 rounded-full animate-pulse"></div>
        </div>
      </header>
    )
  }

  return (
    <header
      className="text-white px-6 py-3 flex justify-between items-center shadow-md"
      style={{ background: 'linear-gradient(90deg, #00508C 0%, #006BA6 100%)' }}
    >
      {/* Logo RUNNA - Lado Izquierdo (Branding) */}
      <Link href="/mesadeentrada" className="flex-shrink-0 transition-opacity hover:opacity-90">
        <div className="relative h-12 w-44">
          <Image
            src="/img/PNG STICKER.png"
            alt="Logo RUNNA"
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
      </Link>

      {/* Navegación y Usuario - Lado Derecho */}
      <div className="flex items-center gap-3">
        {/* Botones de Navegación */}
        <div className="flex gap-2">
          <a
            href="/mesadeentrada"
            className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105 hover:bg-[rgba(0,188,212,0.25)] cursor-pointer no-underline text-white"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
            }}
          >
            Mesa de Entradas
          </a>
          <a
            href="/legajo-mesa"
            className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105 hover:bg-[rgba(0,188,212,0.25)] cursor-pointer no-underline text-white"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
            }}
          >
            Bandeja de legajos
          </a>
        </div>

        {/* Notificaciones */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications)
              setShowMenu(false)
            }}
            className="p-2 rounded-full transition-all duration-200 hover:scale-110 relative"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
            }}
            onMouseEnter={(e) => {
              if (!showNotifications) e.currentTarget.style.backgroundColor = 'rgba(0, 188, 212, 0.25)'
            }}
            onMouseLeave={(e) => {
              if (!showNotifications) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'
            }}
          >
            <Bell size={20} />
            {pendingCount > 0 && (
              <span
                className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-md border-2 border-[#00508C]"
                title={`${pendingCount} tareas pendientes que requieren tu acción`}
              >
                {pendingCount > 99 ? '99+' : pendingCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div
              className="absolute right-0 mt-3 w-80 bg-white rounded-lg shadow-2xl z-50 overflow-hidden text-gray-800 border border-cyan-100"
            >
              <div className="p-3 border-bottom border-gray-100 bg-gray-50 flex justify-between items-center">
                <span className="font-bold text-sm text-gray-700">Notificaciones</span>
                <span className="text-[10px] px-2 py-0.5 bg-cyan-100 text-cyan-800 rounded-full font-bold">
                  {pendingCount} PENDIENTES
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {pendingActivities.length > 0 ? (
                  pendingActivities.map((act) => (
                    <Link
                      key={act.id}
                      href={act.isVirtual
                        ? `/legajo/${act.legajo_info?.id}?tab=intervenciones` // Virtual activities link to legajo detail with interventions tab
                        : `/legajo/${act.legajo_info?.id}/medida/${act.medida_info?.id}`
                      }
                      className="block p-3 hover:bg-cyan-50 transition-colors border-b border-gray-50 last:border-0"
                      onClick={() => setShowNotifications(false)}
                    >
                      <div className="flex gap-2">
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-cyan-500 shrink-0"></div>
                        <div>
                          <p className="text-xs font-bold leading-tight line-clamp-2">
                            {act.tipo_actividad_info?.nombre || 'Nueva Actividad'}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">
                            {act.legajo_info?.numero} - {act.legajo_info?.nnya_apellido}, {act.legajo_info?.nnya_nombre}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-[9px] uppercase font-bold text-cyan-600">
                              {act.estado_display || act.estado}
                            </span>
                            <span className="text-[9px] text-gray-400">
                              {act.fecha_planificacion ? new Date(act.fecha_planificacion).toLocaleDateString() : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Bell size={20} className="text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-500">No tienes tareas pendientes</p>
                  </div>
                )}
              </div>

              {pendingActivities.length > 0 && (
                <Link
                  href="/legajo-mesa"
                  className="block p-3 text-center text-xs font-bold text-cyan-600 hover:bg-gray-50 border-t border-gray-100 bg-gray-50/50"
                  onClick={() => setShowNotifications(false)}
                >
                  Ver todas las actividades
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Avatar y Menú de Usuario */}
        <div className="relative">
          <button
            onClick={() => {
              setShowMenu(!showMenu)
              setShowNotifications(false)
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 188, 212, 0.25)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'
            }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                {user?.first_name && user?.last_name
                  ? `${user.first_name[0]}${user.last_name[0]}`
                  : "?"}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-sm font-medium">
                  {user?.first_name && user?.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : "Invitado"}
                </div>
                <div className="text-xs opacity-80">
                  {user?.groups?.[0]?.name || "Sin rol"}
                </div>
              </div>
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`}
              />
            </div>
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 overflow-hidden"
              style={{
                border: '1px solid rgba(0, 188, 212, 0.2)',
              }}
            >
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-200"
              >
                <LogOut size={18} className="text-red-600" />
                <span className="font-medium">Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
