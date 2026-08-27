<template>
  <div class="slidev-layout aq-cover">
    <AqField />
    <div class="aq-cover__content">
      <p v-if="kicker" class="aq-kicker">{{ kicker }}</p>
      <div class="aq-cover__body">
        <slot />
      </div>
      <p v-if="foot" class="aq-note">{{ foot }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  kicker?: string
  foot?: string
}>()
</script>

<style scoped>
.aq-cover {
  position: relative;
  height: 100%;
  min-height: 100%;
  background: transparent !important;
  overflow: hidden;
}

.aq-cover__content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
}

.aq-cover__content :deep(a) {
  pointer-events: auto;
}

.aq-cover__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 22rem;
}

.aq-cover__body :deep(h1),
.aq-cover__body :deep(.aq-lede) {
  text-shadow: 0 0 24px var(--bg), 0 0 48px var(--bg);
}
</style>
