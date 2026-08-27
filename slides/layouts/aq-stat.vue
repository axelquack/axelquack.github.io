<template>
  <div class="slidev-layout aq-stat">
    <div class="aq-stat__top">
      <p v-if="kicker" class="aq-kicker">{{ kicker }}</p>
      <p v-if="note" class="aq-note">{{ note }}</p>
    </div>
    <div class="aq-stat__figure">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  kicker?: string
  note?: string
}>()
</script>

<style scoped>
.aq-stat {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.aq-stat__top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1.5rem;
}

.aq-stat__figure :deep(h1),
.aq-stat__figure :deep(p) {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(4.2rem, 14vw, 8.5rem);
  letter-spacing: var(--tracking-display-xl);
  line-height: 0.92;
  margin: 0;
}

.aq-stat__figure :deep(small),
.aq-stat__figure :deep(.aq-note) {
  display: block;
  margin-top: 0.75rem;
  font-family: var(--font-mono);
  font-size: var(--text-mono);
  letter-spacing: 0.02em;
  color: var(--muted);
}
</style>
