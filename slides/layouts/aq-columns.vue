<template>
  <div class="slidev-layout aq-columns">
    <p v-if="kicker" class="aq-kicker">{{ kicker }}</p>
    <div class="aq-columns__head">
      <slot />
    </div>
    <div class="aq-columns__grid">
      <div><slot name="a" /></div>
      <div><slot name="b" /></div>
      <div><slot name="c" /></div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  kicker?: string
}>()
</script>

<style scoped>
.aq-columns {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.aq-columns__head :deep(h1) {
  margin-bottom: 1.5rem;
}

.aq-columns__grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0;
}

.aq-columns__grid > div {
  padding: 0 clamp(1.25rem, 2.5vw, 2rem);
  border-left: var(--hairline) solid var(--line);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.aq-columns__grid > div:first-child {
  padding-left: 0;
  border-left: 0;
}

.aq-columns__grid > div:last-child {
  padding-right: 0;
}

.aq-columns__grid :deep(h2),
.aq-columns__grid :deep(h3) {
  font-family: var(--font-display);
  font-size: clamp(1.35rem, 2.4vw, 1.85rem);
  margin: 0 0 0.75rem;
}

.aq-columns__grid :deep(p),
.aq-columns__grid :deep(li) {
  font-size: var(--text-body);
  color: var(--ink);
}

.aq-columns__grid :deep(ul) {
  margin-top: auto;
}
</style>
