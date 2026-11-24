
import { create } from 'zustand'

const useSession = create((set) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,

    setSession: (user, token) => {
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('token', token)

        set({
            user,
            token
        })
    },

    clearSession: () => {
        localStorage.removeItem('user')
        localStorage.removeItem('token')

        set({
            user: null,
            token: null
        })
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token')
    }
}))

export default useSession
