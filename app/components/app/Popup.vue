<template>
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="bg-base-100 rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <slot></slot>
            <button @click="close" class="absolute cursor-pointer btn btn-error w-8 h-8 top-2 right-2 hover:text-gray-800">✕</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps } from 'vue';

const props = defineProps({
    show: { type: Boolean, default: false }
});

const emit = defineEmits(['update:show']);

function close() {
    emit('update:show', false);
}
</script>
