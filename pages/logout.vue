<script setup>
const { auth } = useSupabaseAuth();
await auth.logout();
onMounted(() => {
  window.location = "/login";
});
</script>
