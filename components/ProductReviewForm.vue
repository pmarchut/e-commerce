<script setup lang="ts">
defineProps<{ loading?: boolean }>()

const emit = defineEmits<{
  (event: "submit", data: any): void
}>()

const title = ref("")
const text = ref("")
const rating = ref("5")

const formRef = ref<any>(null)

function handleSubmit() {
  emit("submit", {
    title: title.value,
    text: text.value,
    rating: Number(rating.value),
  })
}
</script>

<template>
  <FormKit
    ref="formRef"
    type="form"
    :config="{ validationVisibility: 'submit' }"
    @submit="handleSubmit"
    :actions="false"
  >
    <FormKit
      type="text"
      label="Title"
      name="title"
      validation="required"
      v-model="title"
    />

    <FormKit
      type="textarea"
      label="Text"
      name="text"
      validation="required"
      v-model="text"
    />

    <FormKit
      type="range"
      :label="`Rating (${rating})`"
      name="rating"
      min="1"
      max="5"
      validation="required"
      v-model="rating"
    />

    <AppButton class="btn-primary" :loading="loading">Submit</AppButton>
  </FormKit>
</template>
