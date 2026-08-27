<template>
  <div class="slidev-layout aq-fill">
    <p v-if="kicker" class="aq-kicker">{{ kicker }}</p>
    <div class="aq-fill__body">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  kicker?: string
}>()
</script>

<style scoped>
.aq-fill {
  height: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.aq-fill__body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.aq-fill__body :deep(h1) {
  flex: 0 0 auto;
  margin-bottom: 0.75rem;
}

.aq-fill__body :deep(p) {
  flex: 0 0 auto;
}

/* Lists occupy leftover height */
.aq-fill__body :deep(ul) {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  margin: 0.5rem 0 0;
}

.aq-fill__body :deep(li) {
  flex: 1 1 0;
  display: flex;
  align-items: center;
  padding: 0;
  font-size: clamp(1.15rem, 2.1vw, 1.5rem);
  line-height: 1.3;
}

/* Code / Monaco occupy leftover height */
.aq-fill__body :deep(.slidev-code-wrapper),
.aq-fill__body :deep(.slidev-monaco-container) {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  margin-top: 0.5rem;
}

.aq-fill__body :deep(.slidev-monaco-container-inner) {
  flex: 1 1 auto !important;
  height: auto !important;
  min-height: 0 !important;
}

.aq-fill__body :deep(pre) {
  flex: 1 1 auto;
  min-height: 0;
  height: 100%;
  margin: 0;
  display: flex;
  align-items: stretch;
}

.aq-fill__body :deep(pre code),
.aq-fill__body :deep(.shiki) {
  flex: 1;
  font-size: clamp(0.95rem, 1.6vw, 1.2rem) !important;
  line-height: 1.55 !important;
}

.aq-fill__body :deep(.monaco-editor),
.aq-fill__body :deep(.overflow-guard) {
  height: 100% !important;
}

.aq-fill__body :deep([class*="monaco-run"]),
.aq-fill__body :deep(.slidev-monaco-run) {
  flex: 0 0 auto;
}
</style>
