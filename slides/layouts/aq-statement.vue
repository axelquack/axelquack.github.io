<template>
  <div class="slidev-layout aq-statement">
    <p v-if="kicker" class="aq-kicker">{{ kicker }}</p>
    <div class="aq-statement__body">
      <slot />
    </div>
    <p v-if="foot" class="aq-note">{{ foot }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  kicker?: string
  foot?: string
}>()
</script>

<style scoped>
.aq-statement {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.aq-statement__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding-bottom: 0.5rem;
}

.aq-statement__body :deep(h1) {
  font-size: clamp(3.2rem, 8vw, 6.2rem);
  line-height: 0.98;
  max-width: 12ch;
  margin: 0;
}
</style>
