// Импортируем нужные функции из Nuxt, Pinia и Vue
import { navigateTo, useCookie, useNuxtApp, useRuntimeConfig } from '#app'
import { defineStore } from 'pinia'
import { ref } from 'vue'

// Интерфейсы для ответа бэкенда при логине
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

// Создаем Pinia store "auth"
export const useAuthStore = defineStore('auth', () => {

	// Основные реактивные состояния
	const accessToken = ref<string | null>(null)  // токен
	const user = ref<UserResponse | null>(null)   // текущий пользователь
	const loading = ref(false)                    // индикатор загрузки
	const error = ref<string | null>(null)        // текст ошибки

	// Cookie для хранения токена
	const tokenCookie = useCookie<string | null>('auth_token', {
		sameSite: 'lax',
		path: '/',
		maxAge: 60 * 60 * 24 * 365, // срок — 1 год
	})

	// При запуске store пробуем восстановить токен из cookies
	accessToken.value = tokenCookie.value

	// ==== LOGIN ====
	async function signIn(email: string, password: string) {
		loading.value = true
		error.value = null

		try {
			const config = useRuntimeConfig()

			// Запрос на backend /login
			const res = await $fetch<LoginResponse>('/api/auth/login', {
				baseURL: config.public.apiBase as string,
				method: 'POST',
				body: { email, password },
			})

			// Сохраняем токен
			accessToken.value = res.token
			tokenCookie.value = res.token

			// Сохраняем пользователя
			user.value = res.user

		} catch (e: any) {
			// Ошибка логина
			error.value = e?.data?.message || 'Login failed'
			throw e
		} finally {
			loading.value = false
		}
	}

	// ==== ПОЛУЧЕНИЕ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ ====
	async function getCurrentUser() {
		// Если токена нет — не запрашиваем
		if (!accessToken.value) return

		try {
			const config = useRuntimeConfig()

			const me = await $fetch<UserResponse>('/api/auth/me', {
				baseURL: config.public.apiBase as string,
				headers: {
					Authorization: `Bearer ${accessToken.value}`,
				},
			})

			// Успешно получили user
			user.value = me

		} catch (e: any) {

			// Если ошибка — очищаем авторизацию (токен недействителен)
			clearAuthState()

			const nuxtApp = useNuxtApp()

			// Проверяем, что код выполняется НЕ на сервере
			// nuxtApp.ssrContext существует ТОЛЬКО в SSR
			const runningOnClient = !nuxtApp.ssrContext

			// Если 401 и мы на клиенте — отправляем на логин
			if (runningOnClient && (e?.status === 401 || e?.data?.statusCode === 401)) {
				navigateTo('/login')
			}
		}
	}

	// ==== ОЧИСТКА СОСТОЯНИЯ ====
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
