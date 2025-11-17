<template>
    <button class="btn btn-primary w-full flex items-center justify-center gap-2" :disabled="disabled || loading">
        <span v-if="loading" class="loading loading-spinner"></span>
        <span>
            <slot />
        </span>
    </button>
</template>

<script setup lang="ts">
defineProps<{
    loading?: boolean;
    disabled?: boolean;
}>();
</script>
