<template>
    <nav class="navbar bg-base-100 shadow-sm fixed w-full top-0 left-0 px-4 flex justify-between gap-4">
        <NuxtLink to="/" class="btn btn-ghost text-sm">Digital Direction</NuxtLink>

        <div class="flex items-center gap-2">
            <!-- Если идёт загрузка данных пользователя -->
            <template v-if="auth.loading">
                <div class="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
            </template>

            <!-- Если пользователь залогинен -->
            <template v-else-if="auth.user">
                <div class="dropdown dropdown-end">
                    <button tabindex="0" class="btn btn-ghost btn-circle avatar">
                        <div class="w-10 rounded-full">
                            <img :src="auth.user.avatar || '/default-avatar.png'" :alt="auth.user.name || 'User'" />
                        </div>
                    </button>
                    <ul tabindex="-1"
                        class="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-52 p-2 shadow">
                        <li>
                            <NuxtLink to="/profile" class="btn btn-ghost w-full text-left">Профиль</NuxtLink>
                        </li>
                        <li>
                            <button class="btn btn-ghost w-full text-left" @click="auth.signOut">Выйти</button>
                        </li>
                    </ul>
                </div>
            </template>

            <!-- Если пользователь не залогинен -->
            <template v-else>
                <NuxtLink to="/login" class="btn btn-sm btn-primary">Войти</NuxtLink>
            </template>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useAuthStore } from "~/store/auth";

const auth = useAuthStore();

onMounted(() => {
    auth.getCurrentUser();
});
</script>