import axios, { type AxiosInstance } from "axios";
import { useAuthStore } from "~/store/auth";

let api: AxiosInstance | null = null;

export function useApi() {
    const config = useRuntimeConfig();
    const auth = useAuthStore();

    if (!api) {
        api = axios.create({
            baseURL: config.public.apiBase as string,
            withCredentials: false
        });

        // Добавляем токен
        api.interceptors.request.use((req) => {
            if (auth.token) {
                req.headers.Authorization = `Bearer ${auth.token}`;
            }
            return req;
        });

        // Обработка ошибок
        api.interceptors.response.use(
            (res) => res,
            (err) => {
                const status = err?.response?.status;
                const nuxtApp = useNuxtApp();

                // Токен истёк → logout + redirect
                if (status === 401) {
                    auth.signOut();

                    if (!nuxtApp.ssrContext) navigateTo("/login");
                }

                return Promise.reject(err);
            }
        );
    }

    return api;
}
