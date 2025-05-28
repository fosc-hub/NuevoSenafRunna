import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserPermissions {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    fecha_nacimiento: string | null;
    genero: string;
    telefono: string | null;
    is_staff: boolean;
    is_active: boolean;
    is_superuser: boolean;
    groups: Array<{
        id: number;
        name: string;
    }>;
    user_permissions: string[];
    zonas: Array<{
        id: number;
        director: boolean;
        jefe: boolean;
        user: number;
        zona: number;
        localidad: number | null;
    }>;
    zonas_ids: number[];
    all_permissions: string[];
}

interface UserState {
    user: UserPermissions | null;
    setUser: (user: UserPermissions) => void;
    logoutZustand: () => void;
}

export const useUser = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
            logoutZustand: () => set({ user: null })
        }),
        {
            name: 'user-storage'
        }
    )
)