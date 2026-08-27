<template>
  <div class="slidev-layout aq-grid">
    <p v-if="kicker" class="aq-kicker">{{ kicker }}</p>
    <div class="aq-grid__head">
      <slot />
    </div>
    <div class="aq-grid__cells">
      <div><slot name="a" /></div>
      <div><slot name="b" /></div>
      <div><slot name="c" /></div>
      <div><slot name="d" /></div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  kicker?: string
}>()
</script>

<style scoped>
.aq-grid {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.aq-grid__head :deep(h1) {
  margin-bottom: 1rem;
}

.aq-grid__cells {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.aq-grid__cells > div {
  padding: 1.1rem 1.4rem 1.1rem 0;
  border-top: var(--hairline) solid var(--line);
}

.aq-grid__cells > div:nth-child(odd) {
  padding-right: 1.6rem;
  border-right: var(--hairline) solid var(--line);
}

.aq-grid__cells > div:nth-child(even) {
  padding-left: 1.6rem;
  padding-right: 0;
}

.aq-grid__cells :deep(h3) {
  font-family: var(--font-mono);
  font-size: var(--text-kicker);
  letter-spacing: var(--tracking-kicker);
  text-transform: uppercase;
  color: var(--muted);
  margin: 0 0 0.45rem;
}

.aq-grid__cells :deep(p) {
  margin: 0;
  font-size: var(--text-body);
}
</style>
