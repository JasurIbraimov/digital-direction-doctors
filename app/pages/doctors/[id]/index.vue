<template>
    <div class="container mx-auto p-4 mt-4">
        <!-- Loader -->
        <div v-if="loadingDoctor" class="flex justify-center items-center h-64">
            <div class="border-t-blue-400 border-4 border-t-4 border-gray-300 rounded-full w-12 h-12 animate-spin">
            </div>
        </div>

        <!-- Ошибка -->
        <div v-else-if="errorDoctor" class="text-center text-red-500">{{ errorDoctor }}</div>

        <!-- Контент -->
        <div v-else>
            <!-- Блок врача -->
            <div class="flex gap-4 mb-6 flex-col md:flex-row justify-center">
                <img :src="doctor.avatar || '/default-avatar.png'" @error="onAvatarError"
                    class="w-32 h-32 rounded-full object-cover" />
                <div>
                    <h1 class="text-2xl font-bold">{{ doctor.name }}</h1>
                    <p class="text-gray-500">{{ specialtiesMap[doctor.specialty] }}</p>
                    <p>Рейтинг: {{ doctor.rating }} ({{ doctor.reviewCount }} отзывов)</p>
                    <p>Стаж: {{ doctor.experience }} лет</p>
                    <p>Цена: {{ doctor.price }} ₽</p>
                </div>
            </div>

            <!-- Образование и описание -->
            <div class="mb-6">
                <h2 class="font-semibold text-lg mb-2">Образование</h2>
                <p>{{ doctor.education }}</p>
                <h2 class="font-semibold text-lg mt-4 mb-2">Описание</h2>
                <p>{{ doctor.description }}</p>
                <h2 class="font-semibold text-lg mt-4 mb-2">Достижения</h2>
                <ul class="list-disc list-inside">
                    <li v-for="(ach, idx) in doctor.achievements" :key="idx">{{ ach }}</li>
                </ul>
            </div>

            <!-- Расписание -->
            <div class="mb-6">
                <h2 class="font-semibold text-lg mb-2">Доступные даты и слоты</h2>

                <div v-if="loadingSchedule">Загрузка расписания...</div>

                <div v-else>
                    <!-- Календарь текущей недели -->
                    <div class="grid grid-cols-4 gap-1 mb-4">
                        <button v-for="day in weekDates" :key="day.date" @click="selectDate(day.date)" :class="[
                            'p-1 rounded-lg text-center bg-base-100',
                            selectedDate === day.date ? ' text-white' : 'opacity-20',
                            day.slots.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        ]" :disabled="day.slots.length === 0">
                            <div class="text-sm font-semibold">{{ day.dayName }}</div>
                            <div class="text-xs">{{ formatDate(day.date) }}</div>
                        </button>
                    </div>

                    <!-- Слоты выбранного дня -->
                    <div v-if="selectedSlots.length" class="flex flex-wrap gap-2">
                        <button v-for="slot in selectedSlots" :key="slot.id" class="btn btn-xs btn-accent">
                            {{ slot.startTime }} - {{ slot.endTime }}
                        </button>
                    </div>

                    <div v-else>Нет доступных слотов</div>
                </div>
            </div>

            <!-- Отзывы -->
            <div>
                <h2 class="font-semibold text-lg mb-2">Отзывы</h2>
                <div class="flex gap-2 mb-2">
                    <select v-model="reviewsSort" @change="fetchReviews"
                        class="select outline-none select-bordered w-40">
                        <option value="date_desc">Сначала свежие</option>
                        <option value="date_asc">Сначала старые</option>
                        <option value="rating_desc">По рейтингу (убыв.)</option>
                        <option value="rating_asc">По рейтингу (возр.)</option>
                    </select>
                </div>
                <div v-if="loadingReviews" class="flex justify-center items-center">
                    <div
                        class="border-t-blue-400 border-4 border-t-4 border-gray-300 rounded-full w-12 h-12 animate-spin">
                    </div>
                </div>
                <div v-else-if="reviews.length === 0">Нет отзывов</div>
                <div v-else class="space-y-4">
                    <div v-for="review in reviews" :key="review.id" class="bg-base-100 p-4 rounded-lg">
                        <p class="font-semibold">{{ review.patientName }} - {{ review.rating }}/5</p>
                        <p class="text-gray-500 text-sm">{{ formatDate(review.date) }}</p>
                        <p>{{ review.text }}</p>
                    </div>
                </div>

                <!-- Пагинация -->
                <div class="flex justify-center gap-2 mt-4">
                    <button class="btn btn-sm" :disabled="reviewsPage === 1"
                        @click="reviewsPage--; fetchReviews()">Назад</button>
                    <span>Страница {{ reviewsPage }} из {{ reviewsTotalPages }}</span>
                    <button class="btn btn-sm" :disabled="reviewsPage >= reviewsTotalPages"
                        @click="reviewsPage++; fetchReviews()">Вперед</button>
                </div>
            </div>
        </div>
    </div>
</template>


<script setup lang="ts">
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useApi } from '~/composables/useApi';
dayjs.locale('ru');

const api = useApi();
const route = useRoute();
const doctorId = route.params.id as string;

const doctor = ref<any>(null);
const loadingDoctor = ref(true);
const errorDoctor = ref<string | null>(null);

const specialtiesMap = ref<Record<string, string>>({}); // Можно заполнить глобально или через API

// Расписание
const schedule = ref<any[]>([]);
const loadingSchedule = ref(false);
const selectedDate = ref('');
const selectedSlots = ref<any[]>([]);
const weekDates = ref<any[]>([]);

// Отзывы
const reviews = ref<any[]>([]);
const reviewsPage = ref(1);
const reviewsLimit = 6;
const reviewsTotal = ref(0);
const reviewsSort = ref('date_desc');
const loadingReviews = ref(false);

const reviewsTotalPages = computed(() => Math.ceil(reviewsTotal.value / reviewsLimit));

function onAvatarError(event: Event) {
    (event.target as HTMLImageElement).src = '/default-avatar.png';
}


function formatDate(dateStr: string) {
    const date = dayjs(dateStr);
    // Проверяем, есть ли ненулевое время
    if (date.hour() === 0 && date.minute() === 0 && date.second() === 0) {
        return date.format('DD MMM YYYY'); // только дата
    } else {
        return date.format('DD MMM YYYY, HH:mm'); // дата + время
    }
}

// Загрузка данных доктора
async function fetchDoctor() {
    loadingDoctor.value = true;
    try {
        const res = await api.get(`/api/doctors/${doctorId}`);
        doctor.value = res.data;
    } catch (err: any) {
        errorDoctor.value = err?.message || 'Ошибка при загрузке';
    } finally {
        loadingDoctor.value = false;
    }
}

// Группировка слотов по дате
function groupSlotsByDate(slots: any[]) {
    const grouped: Record<string, any[]> = {};
    slots.forEach(slot => {
        const date = dayjs(slot.startTime).format('YYYY-MM-DD');
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push({
            id: slot.id,
            startTime: dayjs(slot.startTime).format('HH:mm'),
            endTime: dayjs(slot.endTime).format('HH:mm')
        });
    });
    return grouped;
}

// Формируем календарь на неделю (сегодня + 6 дней)
function buildWeekDates() {
    const today = dayjs();
    const week: any[] = [];
    for (let i = 0; i < 7; i++) {
        const dateObj = today.add(i, 'day');
        const dateStr = dateObj.format('YYYY-MM-DD');
        week.push({
            date: dateStr,
            dayName: dateObj.format('ddd'),
            slots: schedule.value.find(d => d.date === dateStr)?.slots || []
        });
    }
    weekDates.value = week;
}

// Загрузка расписания
async function fetchSchedule() {
    loadingSchedule.value = true;
    try {
        const res = await api.get(`/api/doctors/${doctorId}/schedule`);
        const slots = res.data; // массив слотов
        const grouped = groupSlotsByDate(slots);
        schedule.value = Object.keys(grouped).map(date => ({ date, slots: grouped[date] }));
        if (schedule.value.length) selectedDate.value = schedule.value[0].date;
        updateSelectedSlots();
        buildWeekDates();
    } finally {
        loadingSchedule.value = false;
    }
}

function selectDate(date: string) {
    selectedDate.value = date;
    updateSelectedSlots();
}

function updateSelectedSlots() {
    const day = schedule.value.find(d => d.date === selectedDate.value);
    selectedSlots.value = day?.slots || [];
}

// Загрузка отзывов
async function fetchReviews() {
    loadingReviews.value = true;
    try {
        const [sortBy, sortOrder] = reviewsSort.value.split('_');
        const res = await api.get(`/api/doctors/${doctorId}/reviews`, {
            params: {
                page: reviewsPage.value,
                limit: reviewsLimit,
                sortBy,
                sortOrder
            }
        });
        reviews.value = res.data.reviews;
        reviewsTotal.value = res.data.pagination.total;
    } finally {
        loadingReviews.value = false;
    }
}

onMounted(async () => {
    await fetchDoctor();
    await fetchSchedule();
    await fetchReviews();
});
</script>