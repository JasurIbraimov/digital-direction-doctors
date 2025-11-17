<template>
    <form @submit.prevent="submitForm" class="space-y-4">
        <div>
            <label class="font-semibold">Жалобы *</label>
            <textarea v-model="form.complaints" required
                class="input outline-none input-bordered w-full p-2"></textarea>
        </div>

        <div>
            <label>Хронические заболевания</label>
            <textarea v-model="form.chronic" class="input  outline-none input-bordered w-full p-2"></textarea>
        </div>

        <div class="flex gap-2">
            <AppInput v-model="form.height" label="Рост (см) *" type="number" :error="heightError"
                placeholder="50-250" />
            <AppInput v-model="form.weight" label="Вес (кг) *" type="number" :error="weightError"
                placeholder="20-300" />
        </div>

        <div>
            <label>Результаты анализов</label>
            <input type="file" @change="onFileChange" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                class="file-input w-full outline-none" />
        </div>

        <div class="flex gap-2 justify-between items-center">
            <button type="button" class="btn btn-error" @click="$emit('cancel')">Отмена</button>
            <AppButton :loading="loading" :disabled="loading">Записаться</AppButton>
        </div>
    </form>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useApi } from "~/composables/useApi";
import { useToast } from '~/composables/useToast';
import { useAuthStore } from '~/store/auth';


const props = defineProps({
    slotId: { type: String, required: true },
});

const emit = defineEmits(["success", "cancel"]);

const api = useApi();

const loading = ref(false);

const form = reactive({
    complaints: "",
    chronic: "",
    height: "" as string, // строка для Input
    weight: "" as string, // строка для Input
    file: null as File | null,
});
const auth = useAuthStore();

const { addToast } = useToast();
// Валидация для Input
const heightError = computed(() => {
    const value = Number(form.height);
    return value < 50 || value > 250 ? "Рост должен быть от 50 до 250 см" : "";
});

const weightError = computed(() => {
    const value = Number(form.weight);
    return value < 20 || value > 300 ? "Вес должен быть от 20 до 300 кг" : "";
});

function onFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files?.[0]) form.file = target.files[0];
}



async function submitForm() {
    if (!auth.token) {
        navigateTo("/login");
        return;
    }

    loading.value = true;
    try {
        const formData = new FormData();
        formData.append("scheduleSlotId", props.slotId);
        formData.append("complaints", form.complaints);
        formData.append("chronicDiseases", form.chronic || "");
        formData.append("height", form.height ? String(Number(form.height)) : "0");
        formData.append("weight", form.weight ? String(Number(form.weight)) : "0");
        if (form.file) formData.append("testResults", form.file);

        await api.post("/api/appointments", formData, {
            headers: { Authorization: `Bearer ${auth.token}` },
        });

        emit("success");
        addToast("Запись успешно создана!");
    } catch (err: any) {
        addToast(err?.message || "Ошибка при записи");
    } finally {
        loading.value = false;
    }
}


</script>
