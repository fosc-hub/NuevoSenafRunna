export interface TUser {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    fecha_nacimiento: string;
    genero: string;
    telefono: number;
    localidad: number; // Related to TLocalidad
    is_staff: boolean;
    is_active: boolean;
    is_superuser: boolean;
    groups: [];
    user_permissions: [];
    all_permissions: [];
}
