<script setup>
const { auth } = useSupabaseAuth();
auth.logout();
onMounted(() => {
  window.location = "/login";
});
</script>
