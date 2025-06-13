<script setup>
import { ref, watchEffect } from 'vue'
import { useProductStore } from '~/stores/ProductStore'

const productStore = useProductStore()

const showSpinner = ref(false)
let timeoutId

// Obserwuj loading i zarządzaj opóźnionym spinnerem
watchEffect(() => {
  if (productStore.loading) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      // tylko jeśli nadal trwa ładowanie
      if (productStore.loading) {
        showSpinner.value = true
      }
    }, 500)
  } else {
    clearTimeout(timeoutId)
    showSpinner.value = false
  }
})

// SSR-friendly fetch danych
await useAsyncData("products", () => productStore.fetchProducts())

onUnmounted(() => clearTimeout(timeoutId))
</script>
<template>
  <div>
    <HomeHero />

    <div class="flex justify-end mt-10 px-10">
      <ProductFilters />
    </div>

    <div v-if="showSpinner" class="flex justify-center py-20">
      <AppSpinner size="lg" color="orange" />
    </div>

    <div
      v-else
      class="gap-7 p-10 sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-wrap justify-items-stretch items-stretch"
    >
      <TransitionGroup name="products">
        <ProductCard
          v-for="product in productStore.products"
          :product="product"
          :key="product.sys.id"
          class="mb-5"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<style>
.product-card {
  transition: all 0.5s ease-in-out;
}
.products-enter-from {
  transform: scale(0.5) translateY(-80px);
  opacity: 0;
}
.products-leave-to {
  transform: translateY(30px);
  opacity: 0;
}
.products-leave-active {
  position: absolute;
  z-index: -1;
}
</style>
