<script setup lang="ts">
import { useAsyncState } from '@vueuse/core';

const props = defineProps<{
  productId: string;
}>();

const { reviews } = useSupabaseAuth();
const alerts = useAlertsStore();

const supabase = useSupabaseAuth();
const loggedInUser = computed(() => supabase.loggedInUser);

const loadingForm = ref(false);
const showForm = ref(false);
const showReviews = ref(true);

const { state, isLoading, execute } = useAsyncState<any[] | null>(
  () => reviews.get(props.productId),
  null,
  { immediate: false }
)

const averageRating = computed(() => {
  if (!state.value) return 0;

  const count = state.value.length;
  const ratingSum = state.value.reduce((sum, review) => sum + review.rating, 0);

  return count > 0 ? (ratingSum / count) : 0;
});

onMounted(async () => {
  execute();
});

async function handleReviewSubmit(data: any) {
  loadingForm.value = true;
  try {
    await reviews.submit({
      text: data.text,
      rating: data.rating,
      title: data.title,
      product_id: props.productId,
    })
    showForm.value = false; // Hide form after submission
    alerts.success("Review submitted successfully");
    execute(); // Refresh reviews after submission
  } catch (err) {
    alerts.error("Error submitting review");
  } finally {
    loadingForm.value = false;
  }
}

const getRatingCount = (star: number): number => {
  if (!state.value) return 0;
  return state.value.filter((review) => review.rating === star).length;
};

const getRatingPercentage = (star: number): number => {
  const total = state.value?.length || 0;
  const count = getRatingCount(star);
  return total ? (count / total) * 100 : 0;
};
</script>

<template>
  <div class="mb-10">
    <hr class="my-10" />
    <h3 class="text-xl mb-5">Customer Reviews and Ratings</h3>
    
    <p v-if="isLoading || !state" class="text-2xl opacity-80 text-center p-6">Loading...</p>
    <template v-else>
      <div class="flex flex-wrap gap-x-6 items-start">
        <!-- Średnia ocena -->
        <div class="border-2 border-red-400 rounded-lg p-6 w-fit">
          <div>
            <span class="text-4xl font-bold">{{ averageRating.toFixed(1) }}</span>
            out of <span class="text-4xl font-bold">5</span>
          </div>
          <div class="text-sm opacity-80 mt-1">
            ({{ state.length }} reviews)
          </div>
        </div>

        <!-- Rozkład ocen -->
        <div class="flex flex-col gap-1">
          <div
            v-for="stars in [1, 2, 3, 4, 5]"
            :key="stars"
            class="flex items-center gap-1"
          >
            <span class="w-14 text-sm">{{ stars }} Star{{ stars > 1 ? 's' : '' }}</span>
            <progress
              class="progress w-56"
              :value="getRatingPercentage(stars)"
              max="100"
            ></progress>
            <span class="text-sm text-gray-500">
              ({{ getRatingCount(stars) }} Reviews)
            </span>
          </div>
        </div>
      </div>

      <!-- 🔘 Przyciski akcji -->
      <div class="flex flex-wrap my-5">
        <template v-if="loggedInUser">
          <button
            class="underline"
            @click="showForm = !showForm"
          >
            {{ showForm ? 'Hide Review Form' : 'Write a Review' }}
          </button>
          <div class="divider divider-horizontal mx-1"></div>
        </template>
        <button
          class="underline"
          @click="showReviews = !showReviews"
        >
          {{ showReviews ? 'Hide All Reviews' : 'Show All Reviews' }}
        </button>
      </div>

      <!-- Sekcja formularza -->
      <div v-if="showForm">
        <h4 class="text-xl mb-4">Post Review</h4>
        <ProductReviewForm :loading="loadingForm" @submit="handleReviewSubmit" />
      </div>

      <!-- Sekcja recenzji -->
      <div v-if="showReviews" class="mt-5">
        <ProductReviewCard
          v-for="review in state"
          :review="review"
          :key="review.id"
        />
      </div>
    </template>
  </div>
</template>
