<template>
  <div class="slidev-layout aq-section">
    <p v-if="kicker" class="aq-kicker">{{ kicker }}</p>
    <div class="aq-section__body">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  kicker?: string
}>()
</script>

<style scoped>
.aq-section {
  height: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.aq-section__body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.aq-section__body :deep(h1) {
  flex: 0 0 auto;
  margin-bottom: 1.5rem;
}

.aq-section__body :deep(.aq-metrics),
.aq-section__body :deep(.aq-chart) {
  flex: 1 1 auto;
  min-height: 0;
}
</style>
