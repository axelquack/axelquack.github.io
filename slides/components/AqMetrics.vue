<script setup lang="ts">
defineProps<{
  rows: { label: string; value: string }[]
}>()
</script>

<template>
  <dl class="aq-metrics">
    <div v-for="row in rows" :key="row.label" class="aq-metrics__row">
      <dt>{{ row.label }}</dt>
      <dd>{{ row.value }}</dd>
    </div>
  </dl>
</template>

<style scoped>
.aq-metrics {
  margin: 0;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
}

.aq-metrics__row {
  display: grid;
  grid-template-columns: minmax(8rem, 0.42fr) 1fr;
  gap: 1.5rem;
  align-items: baseline;
  padding: 0.35rem 0;
  border-bottom: var(--hairline) solid var(--line);
}

.aq-metrics__row:last-child {
  border-bottom: none;
}

dt {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--text-kicker);
  letter-spacing: var(--tracking-kicker);
  text-transform: uppercase;
  color: var(--muted);
}

dd {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.35rem, 2.8vw, 2.1rem);
  letter-spacing: var(--tracking-display);
  line-height: 1.15;
  color: var(--ink);
}
</style>
