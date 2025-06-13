<script setup>
defineProps({
  heatLevel: Number,
});
const heatMap = {
  3: "🔥🔥🔥",
  2: "🔥🔥",
  1: "🔥",
};
</script>
<template>
  <span>
    {{ heatLevel ? heatMap[heatLevel] : "" }}
  </span>
</template>
