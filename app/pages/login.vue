<template>
	<form @submit.prevent="handleLogin" class="bg-base-100 p-8 rounded-lg shadow-md w-96">
		<h1 class="text-2xl mb-6 font-bold">Login</h1>

		<!-- Email -->
		<div class="mb-4">
			<label class="block mb-1 font-medium">Email</label>
			<input v-model="email" type="email" class="input outline-none input-bordered w-full"
				placeholder="you@example.com" />
			<p v-if="errors.email" class="text-red-500 text-sm mt-1">{{ errors.email }}</p>
		</div>

		<!-- Password -->
		<div class="mb-4">
			<label class="block mb-1 font-medium">Password</label>
			<input v-model="password" type="password" class="input outline-none input-bordered w-full"
				placeholder="Enter your password" />
			<p v-if="errors.password" class="text-red-500 text-sm mt-1">
				{{ errors.password }}
			</p>
		</div>

		<!-- Submit button -->
		<button type="submit" class="btn btn-primary w-full flex items-center justify-center gap-2" :disabled="loading">
			<span v-if="loading" class="loading loading-spinner"></span>
			<span>Login</span>
		</button>


		<!-- General error message -->
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
