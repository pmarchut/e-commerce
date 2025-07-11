<script setup>
useHead({
  title: 'Awesome Sauce',
})
</script>

<template>
  <div>
    <NuxtLoadingIndicator color="#f04f43" />
    <TheNavbar />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <TheAlerts />
  </div>
</template>
