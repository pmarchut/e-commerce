<script setup lang="ts">
import { useTimeAgo } from '@vueuse/core';

const props = defineProps<{
  review: any;
}>();

const timeago = useTimeAgo(() => props.review.created_at)
</script>

<template>
  <div class="border shadow p-4">
    <div>{{ '⭐'.repeat(props.review.rating) }}</div>
    <h4 class="font-bold">{{ props.review.title }}</h4>
    <div>{{ props.review.text }}</div>
    <div class="text-sm opacity-80">{{ timeago }}</div>
  </div>
</template>
