<template>
  <div class="container mx-auto p-4 mt-4">
    <h1 class="text-2xl font-bold mb-6">Список врачей</h1>

    <!-- Фильтры -->
    <div class="flex flex-col md:flex-row gap-4 mb-6">
      <select v-model="store.filters.specialty" class="select select-bordered w-full md:w-1/3"
        @change="onSpecialtyChange">
        <option value="all">Все специальности</option>
        <option v-for="(name, id) in specialtiesMap" :key="id" :value="id">{{ name }}</option>
      </select>

      <div class="flex items-center gap-2 w-full md:w-1/3">
        <label class="w-1/3">Рейтинг:</label>
        <input type="range" min="0" max="5" step="0.1" v-model.number="store.filters.minRating"
          @change="onMinRatingChange" class="range w-2/3" />
        <span>{{ store.filters.minRating.toFixed(1) }}</span>
      </div>

      <input v-model="searchQuery" @input="debouncedFetch" type="text" placeholder="Поиск по имени"
        class="input input-bordered w-full md:w-1/3" />
    </div>

    <!-- Сортировка -->
    <div class="flex gap-4 mb-4 flex-col md:flex-row items-center">
      <label>Сортировать по:</label>
      <select v-model="store.sort.field" class="select select-bordered" @change="onSortChange">
        <option value="rating">Рейтинг</option>
        <option value="experience">Стаж</option>
        <option value="price">Цена</option>
        <option value="name">Имя</option>
      </select>
      <button class="btn btn-sm btn-accent" @click="toggleSortDirection">
        {{ store.sort.direction !== 'asc' ? 'По возрастанию' : 'По убыванию' }}
      </button>
    </div>

    <!-- Loader -->
    <div v-if="loadingAll" class="flex justify-center items-center h-64">
      <div class="border-t-blue-400 border-4 border-t-4 border-gray-300 rounded-full w-12 h-12 animate-spin"></div>
    </div>

    <!-- Список врачей -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="doctor in store.doctors" :key="doctor.id" class="card shadow-md p-4 bg-base-100 rounded-lg">
        <div class="flex items-center gap-4 mb-2">
          <img :src="doctor.avatar || '/default-avatar.png'" @error="onAvatarError($event)" alt="avatar"
            class="w-16 h-16 rounded-full object-cover" />
          <div>
            <h2 class="font-bold">{{ doctor.name }}</h2>
            <p class="text-sm text-gray-500">{{ specialtiesMap[doctor.specialty] }}</p>
          </div>
        </div>
        <div class="mb-2">Рейтинг: {{ doctor.rating }} ({{ doctor.reviewCount }} отзывов)</div>
        <div class="mb-2">Стаж: {{ doctor.experience }} лет</div>
        <div class="mb-2">Цена: {{ doctor.price }} ₽</div>
        <NuxtLink :to="`/doctors/${doctor.id}`" class="btn btn-sm btn-primary w-full mt-2">Подробнее</NuxtLink>
      </div>
    </div>

    <p v-if="!loadingAll && store.doctors.length === 0" class="text-center text-gray-500 mt-4">Врачи не найдены</p>

    <!-- Пагинация -->
    <div class="flex justify-center gap-2 mt-6">
      <button class="btn btn-sm" :disabled="store.pagination.page === 1" @click="prevPage">Назад</button>
      <span>Страница {{ store.pagination.page }} из {{ totalPages }}</span>
      <button class="btn btn-sm" :disabled="store.pagination.page >= totalPages" @click="nextPage">Вперед</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn } from "@vueuse/core";
import { computed, onMounted, ref } from "vue";
import { useApi } from "~/composables/useApi";
import { useDoctorsStore } from "~/store/doctors";

const store = useDoctorsStore();
const api = useApi();

const specialtiesMap = ref<Record<string, string>>({});
const searchQuery = ref("");
const loadingAll = ref(true);

// Загрузка данных и список специальностей
async function loadAllData() {
  loadingAll.value = true;
  try {
    await store.fetchDoctors();
    const res = await api.get("/api/specialties");
    specialtiesMap.value = res.data.reduce((acc: any, spec: any) => {
      acc[spec.id] = spec.name;
      return acc;
    }, {});
  } finally {
    loadingAll.value = false;
  }
}

onMounted(() => loadAllData());

// Фильтры
function onSpecialtyChange() {
  store.pagination.page = 1;
  fetchWithLoader();
}
function onMinRatingChange() {
  store.pagination.page = 1;
  fetchWithLoader();
}

function onAvatarError(event: Event) {
  const target = event.target as HTMLImageElement;
  target.src = '/default-avatar.png';
}

// Поиск с debounce
const debouncedFetch = useDebounceFn(() => {
  store.pagination.page = 1;
  store.filters.search = searchQuery.value;
  fetchWithLoader();
}, 300);

// Сортировка
function onSortChange() { fetchWithLoader(); }
function toggleSortDirection() {
  store.sort.direction = store.sort.direction === "asc" ? "desc" : "asc";
  fetchWithLoader();
}

// Пагинация
const totalPages = computed(() => Math.ceil(store.pagination.total / store.pagination.perPage));
function prevPage() {
  if (store.pagination.page > 1) {
    store.pagination.page--;
    fetchWithLoader();
  }
}
function nextPage() {
  if (store.pagination.page < totalPages.value) {
    store.pagination.page++;
    fetchWithLoader();
  }
}

// Универсальный метод с Loader
async function fetchWithLoader() {
  loadingAll.value = true;
  await store.fetchDoctors();
  loadingAll.value = false;
}
</script>
