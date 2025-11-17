<template>
  <div class="fixed top-4 right-4 space-y-2 z-50">
    <div v-for="toast in toasts" :key="toast.id" class="alert alert-success shadow-lg">
      <div>
        <span>{{ toast.message }}</span>
      </div>
      <button class="btn btn-sm btn-ghost" @click="removeToast(toast.id)">✕</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast';

const { toasts, removeToast } = useToast();
</script>
