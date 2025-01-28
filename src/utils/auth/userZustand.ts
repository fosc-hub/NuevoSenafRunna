import {create} from 'zustand'
import {persist} from 'zustand/middleware'



export const useUser = create(persist((set) => ({
    user: null,
    setUser: (user:any) => set({user}),
    logoutZustand: () => set({user: null})
}), {
    name: 'user-storage'
}))