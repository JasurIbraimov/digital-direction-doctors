import { reactive } from 'vue';

interface Toast {
  id: number;
  message: string;
}

const toasts = reactive<Toast[]>([]);

export function useToast() {
  function addToast(message: string, duration = 3000) {
    const id = Date.now() + Math.random();
    toasts.push({ id, message });

    setTimeout(() => {
      const index = toasts.findIndex(t => t.id === id);
      if (index !== -1) toasts.splice(index, 1);
    }, duration);
  }

  function removeToast(id: number) {
    const index = toasts.findIndex(t => t.id === id);
    if (index !== -1) toasts.splice(index, 1);
  }

  return { toasts, addToast, removeToast };
}
