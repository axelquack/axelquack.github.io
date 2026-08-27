<template>
  <div class="slidev-layout aq-split-layout">
    <p v-if="kicker" class="aq-kicker">{{ kicker }}</p>
    <div v-if="$slots.default" class="aq-split-layout__title">
      <slot />
    </div>
    <div class="aq-split">
      <div>
        <slot name="left" />
      </div>
      <div>
        <slot name="right" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  kicker?: string
}>()
</script>

<style scoped>
.aq-split-layout {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.aq-split-layout__title {
  margin-bottom: 1.5rem;
}

.aq-split {
  flex: 1;
}
</style>
