<script setup>
const { initAuthWatcher } = useSupabaseAuth()
initAuthWatcher()
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
