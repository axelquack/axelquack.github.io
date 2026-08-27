<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { createField } from "../lib/field.js";

const props = withDefaults(
  defineProps<{
    inverse?: boolean
  }>(),
  { inverse: false },
);

const canvas = ref<HTMLCanvasElement | null>(null);
const root = ref<HTMLElement | null>(null);
let api: { setPointer: (x: number, y: number) => void; destroy: () => void } | null =
  null;

function onMove(e: PointerEvent) {
  if (!api || !root.value) return;
  const r = root.value.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width) * 2 - 1;
  const y = -(((e.clientY - r.top) / r.height) * 2 - 1);
  api.setPointer(x, y);
}

onMounted(async () => {
  if (!canvas.value) return;
  try {
    api = createField(canvas.value, {
      count: 9000,
      form: props.inverse ? "knot" : "gyroid",
      color: props.inverse ? "#f0f0f0" : "#121212",
      opacity: props.inverse ? 0.52 : 0.58,
    });
  } catch {
    api = null;
  }
});

onBeforeUnmount(() => {
  api?.destroy();
  api = null;
});
</script>

<template>
  <div ref="root" class="aq-field" aria-hidden="true" @pointermove="onMove">
    <canvas ref="canvas" class="aq-field__canvas" />
  </div>
</template>

<style scoped>
.aq-field {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: auto;
  overflow: hidden;
}

.aq-field__canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
