<template>
	<div class="mb-4">
		<label v-if="label" class="block mb-1 font-medium">{{ label }}</label>

		<input
			:type="type"
			:placeholder="placeholder"
			v-model="model"
			class="input outline-none input-bordered w-full"
		/>

		<p v-if="error" class="text-red-500 text-sm mt-1">{{ error }}</p>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
	modelValue: string;
	label?: string;
	type?: string;
	placeholder?: string;
	error?: string;
}>();

const emits = defineEmits(["update:modelValue"]);

const model = computed({
	get: () => props.modelValue,
	set: (value) => emits("update:modelValue", value),
});
</script>
