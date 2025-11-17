<template>
  <div class="hero bg-base-200 max-w-full md:max-w-1/2 p-5">
    <div class="hero-content text-center">
      <div class="max-w-md">
        <h1 class="text-2xl font-bold">Digital Direction</h1>
        <p class="py-6">
          Найдите своего врача и запишитесь на приём онлайн — быстро, удобно и безопасно
        </p>

        <!-- Кнопка зависит от состояния авторизации -->
        <NuxtLink
          tabindex="2"
          class="btn btn-primary"
          :class="{loading: auth.loading}"
          :to="auth.user ? '/dashboard' : '/login'"
        >
          {{ auth.user ? "Приступить" : "Войти" }}
        </NuxtLink>

       
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useAuthStore } from "~/store/auth";

const auth = useAuthStore();

// Получаем текущего пользователя при монтировании
onMounted(() => {
  auth.getCurrentUser();
});
</script>
