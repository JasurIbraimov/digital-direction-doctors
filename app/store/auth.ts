import { navigateTo, useCookie, useNuxtApp } from '#app'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useApi } from '~/composables/useApi'

interface LoginResponse {
  token: string
  user: UserResponse
}

interface UserResponse {
  id: string
  name: string
  email: string
  avatar?: string
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const user = ref<UserResponse | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const tokenCookie = useCookie<string | null>('auth_token', {
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })

  accessToken.value = tokenCookie.value

  const api = useApi()

  // ==== LOGIN ====
  async function signIn(email: string, password: string) {
    loading.value = true
    error.value = null

    try {
      const res = await api.post<LoginResponse>('/api/auth/login', {
        email,
        password,
      })

      const data = res.data

      accessToken.value = data.token
      tokenCookie.value = data.token

      user.value = data.user

    } catch (err: any) {
      error.value = err?.response?.data?.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ==== GET CURRENT USER ====
  async function getCurrentUser() {
    if (!accessToken.value) return

    try {
      const res = await api.get<UserResponse>('/api/auth/me')
      user.value = res.data
    } catch (err: any) {
      clearAuthState()

      const status = err?.response?.status
      const nuxtApp = useNuxtApp()

      if (status === 401 && !nuxtApp.ssrContext) {
        navigateTo('/login')
      }
    }
  }

  // ==== CLEAR AUTH ====
  function clearAuthState() {
    accessToken.value = null
    user.value = null
    tokenCookie.value = null
  }

  // ==== LOGOUT ====
  function signOut() {
    clearAuthState()
  }

  return {
    token: accessToken,
    user,
    loading,
    error,
    signIn,
    getCurrentUser,
    signOut,
  }
})
