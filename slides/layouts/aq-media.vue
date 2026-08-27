<template>
  <div class="slidev-layout aq-media">
    <div class="aq-media__frame">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.aq-media {
  position: relative;
  height: 100%;
  min-height: 100%;
  padding: 0 !important;
  background: #000 !important;
}

.aq-media__frame {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.aq-media__frame :deep(iframe),
.aq-media__frame :deep(video) {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  aspect-ratio: auto;
}
</style>
