<script setup lang="ts">
/**
 * Graphite bar chart — ink/muted only (no accent hues).
 * Fills remaining slide height; bars are hairline tracks with ink fills.
 */
withDefaults(
  defineProps<{
    title?: string
    labels: string[]
    values: number[]
    unit?: string
  }>(),
  {
    title: "",
    unit: "",
  },
)
</script>

<template>
  <figure class="aq-chart">
    <figcaption v-if="title" class="aq-kicker">{{ title }}</figcaption>
    <div class="aq-chart__rows">
      <div v-for="(label, i) in labels" :key="label" class="aq-chart__row">
        <span class="aq-chart__label">{{ label }}</span>
        <div class="aq-chart__track">
          <div
            class="aq-chart__bar"
            :style="{ width: `${Math.max(0, Math.min(100, values[i] ?? 0))}%` }"
          />
        </div>
        <span class="aq-chart__value">{{ values[i] }}{{ unit }}</span>
      </div>
    </div>
  </figure>
</template>

<style scoped>
.aq-chart {
  margin: 0;
  width: 100%;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.aq-chart__rows {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  margin-top: 0.5rem;
  min-height: 0;
}

.aq-chart__row {
  display: grid;
  grid-template-columns: 8.5rem 1fr 4rem;
  gap: 1rem;
  align-items: center;
  flex: 1 1 0;
  min-height: 3.2rem;
}

.aq-chart__label {
  font-family: var(--font-mono);
  font-size: var(--text-mono);
  color: var(--muted);
}

.aq-chart__track {
  height: 2px;
  background: var(--line);
  position: relative;
}

.aq-chart__bar {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 18px;
  background: var(--ink);
  transition: width var(--duration-slow) var(--ease);
}

.aq-chart__value {
  font-family: var(--font-mono);
  font-size: clamp(0.85rem, 1.4vw, 1.05rem);
  text-align: right;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

@media (max-width: 720px) {
  .aq-chart__row {
    grid-template-columns: 5.5rem 1fr 3rem;
  }
}
</style>
