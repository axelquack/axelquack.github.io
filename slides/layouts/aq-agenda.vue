<template>
  <div class="slidev-layout aq-agenda">
    <p v-if="kicker" class="aq-kicker">{{ kicker }}</p>
    <div class="aq-agenda__head">
      <slot />
    </div>
    <div class="aq-agenda__cols">
      <div><slot name="left" /></div>
      <div><slot name="right" /></div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  kicker?: string
}>()
</script>

<style scoped>
.aq-agenda {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.aq-agenda__head :deep(h1) {
  margin-bottom: 1.25rem;
}

.aq-agenda__cols {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(2rem, 6vw, 5rem);
}

.aq-agenda__cols :deep(ol) {
  list-style: none;
  margin: 0;
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  counter-reset: aq;
}

.aq-agenda__cols > div:last-child :deep(ol) {
  counter-reset: aq 4;
}

.aq-agenda__cols :deep(li) {
  counter-increment: aq;
  display: grid;
  grid-template-columns: 2.4rem 1fr;
  gap: 0.85rem;
  align-items: baseline;
  padding: 0.4rem 0;
  border-bottom: var(--hairline) solid var(--line);
  font-size: clamp(1.05rem, 1.8vw, 1.3rem);
}

.aq-agenda__cols :deep(li)::before {
  content: counter(aq, decimal-leading-zero);
  font-family: var(--font-mono);
  font-size: var(--text-kicker);
  letter-spacing: var(--tracking-kicker);
  color: var(--muted);
}
</style>
