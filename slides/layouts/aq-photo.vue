<template>
  <div class="slidev-layout aq-photo" :class="side === 'left' ? 'aq-photo--left' : 'aq-photo--right'">
    <div class="aq-photo__copy">
      <p v-if="kicker" class="aq-kicker">{{ kicker }}</p>
      <slot />
    </div>
    <figure class="aq-photo__media">
      <img :src="image" :alt="alt" />
    </figure>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    kicker?: string
    image: string
    alt?: string
    side?: "left" | "right"
  }>(),
  {
    alt: "",
    side: "right",
  },
)
</script>

<style scoped>
.aq-photo {
  height: 100%;
  min-height: 100%;
  padding: 0 !important;
  display: grid;
  grid-template-columns: 1fr 42%;
}

.aq-photo--left {
  grid-template-columns: 42% 1fr;
}

.aq-photo--left .aq-photo__copy {
  order: 2;
}

.aq-photo--left .aq-photo__media {
  order: 1;
}

.aq-photo__copy {
  padding: var(--pad-y) var(--pad-x);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.aq-photo__copy :deep(ul) {
  margin-top: 1.25rem;
}

.aq-photo__media {
  margin: 0;
  height: 100%;
  overflow: hidden;
  border-left: var(--hairline) solid var(--line);
  background: var(--wash);
}

.aq-photo--left .aq-photo__media {
  border-left: 0;
  border-right: var(--hairline) solid var(--line);
}

.aq-photo__media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
