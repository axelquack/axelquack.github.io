<template>
  <div class="slidev-layout aq-quote">
    <p v-if="kicker" class="aq-kicker">{{ kicker }}</p>
    <blockquote class="aq-lede">
      <slot />
    </blockquote>
    <p v-if="attribution" class="aq-note aq-quote__attr">{{ attribution }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  kicker?: string
  attribution?: string
}>()
</script>

<style scoped>
.aq-quote {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.aq-lede {
  border: none;
  margin: 0;
  padding: 0;
}

.aq-quote__attr {
  margin-top: 2rem;
}
</style>
