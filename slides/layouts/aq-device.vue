<template>
  <div class="slidev-layout aq-device">
    <figure class="aq-device__frame">
      <img :src="image" :alt="alt" />
    </figure>
    <div class="aq-device__copy">
      <p v-if="kicker" class="aq-kicker">{{ kicker }}</p>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    kicker?: string
    image: string
    alt?: string
  }>(),
  { alt: "" },
)
</script>

<style scoped>
.aq-device {
  height: 100%;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: clamp(1.5rem, 4vw, 3rem);
  align-items: center;
}

.aq-device__frame {
  margin: 0;
  height: 100%;
  max-height: 100%;
  border: var(--hairline) solid var(--ink);
  overflow: hidden;
  background: var(--wash);
}

.aq-device__frame img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.aq-device__copy :deep(h1) {
  margin-bottom: 0.75rem;
}

.aq-device__copy :deep(p) {
  max-width: 22em;
}
</style>
