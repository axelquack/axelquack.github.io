<template>
  <div class="slidev-layout aq-end aq-inverse">
    <AqField inverse />
    <div class="aq-end__content">
      <p v-if="kicker" class="aq-kicker">{{ kicker }}</p>
      <div class="aq-end__body">
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
.aq-end {
  position: relative;
  height: 100%;
  min-height: 100%;
  overflow: hidden;
  background: var(--bg-inverse) !important;
}

.aq-end__content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
}

.aq-end__content :deep(a) {
  pointer-events: auto;
}

.aq-end__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 28rem;
}

.aq-end__body :deep(h1),
.aq-end__body :deep(p) {
  text-shadow: 0 0 28px #000, 0 0 56px #000;
}
</style>
