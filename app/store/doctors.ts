// store/doctors.ts
import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { useApi } from "~/composables/useApi";

export const useDoctorsStore = defineStore("doctors", () => {
  const doctors = ref<any[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const filters = reactive({
    specialty: "all",
    minRating: 0,
    search: "",
  });

  const sort = reactive({
    field: "rating",
    direction: "desc",
  });

  const pagination = reactive({
    page: 1,
    perPage: 6,
    total: 0,
  });

  const api = useApi();

  async function fetchDoctors() {
    loading.value = true;
    error.value = null;

    try {
      const res = await api.get("/api/doctors", {
        params: {
          page: pagination.page,
          limit: pagination.perPage,
          specialty: filters.specialty !== "all" ? filters.specialty : undefined,
          minRating: filters.minRating,
          search: filters.search || undefined,
          sortBy: sort.field,
          sortOrder: sort.direction,
        },
      });

      doctors.value = res.data.doctors;
      pagination.total = res.data.pagination.total;
    } catch (err: any) {
      error.value = err?.message || "Ошибка при загрузке врачей";
    } finally {
      loading.value = false;
    }
  }

  return {
    doctors,
    loading,
    error,
    filters,
    sort,
    pagination,
    fetchDoctors,
  };
});
