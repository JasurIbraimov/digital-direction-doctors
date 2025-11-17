<template>
	<form @submit.prevent="handleLogin" class="bg-base-100 p-8 rounded-lg shadow-md md:w-96 w-full">

		<h1 class="text-2xl mb-6 font-bold">Войти</h1>

		<AppInput v-model="email" label="Почта" type="email" placeholder="you@example.com" :error="errors.email" />

		<AppInput v-model="password" label="Пароль" type="password" placeholder="Введите пароль"
			:error="errors.password" />

		<AppButton :loading="loading">
			Войти
		</AppButton>

		<p v-if="error" class="text-red-500 text-sm mt-4">{{ error }}</p>

	</form>
</template>


<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "~/store/auth";

const auth = useAuthStore();
const router = useRouter();

const email = ref("");
const password = ref("");

const loading = ref(false);
const error = ref("");

const errors = reactive<Partial<{ email: string; password: string }>>({})

function validateForm() {
	errors.email = !email.value
		? "Email is required"
		: !/^\S+@\S+\.\S+$/.test(email.value)
			? "Invalid email"
			: "";
	errors.password = !password.value ? "Password is required" : "";
	return !errors.email && !errors.password;
}

// Form submit handler
async function handleLogin() {
	if (!validateForm()) return;

	loading.value = true;
	error.value = "";

	try {
		await auth.signIn(email.value, password.value);
		// Redirect after login (to previous page or dashboard)
		router.push({ path: "/" });
	} catch (err: any) {
		error.value = err?.response?.data?.message || "Login failed";
	} finally {
		loading.value = false;
	}
}
</script>
