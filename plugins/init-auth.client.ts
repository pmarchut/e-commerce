export default defineNuxtPlugin(() => {
  const { initAuthWatcher } = useSupabaseAuth()
  initAuthWatcher()
})
