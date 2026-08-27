<script setup lang="ts">
import { computed, ref } from "vue";

const props = withDefaults(
  defineProps<{
    id: string
    poster?: string
    title?: string
  }>(),
  {
    title: "Play video",
  },
);

const playing = ref(false);

const posterSrc = computed(
  () => props.poster || `https://i.ytimg.com/vi/${props.id}/maxresdefault.jpg`,
);

const embedSrc = computed(() => {
  const q = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    modestbranding: "1",
    iv_load_policy: "3",
    playsinline: "1",
    cc_load_policy: "0",
    controls: "1",
    fs: "1",
    disablekb: "0",
  });
  return `https://www.youtube-nocookie.com/embed/${props.id}?${q.toString()}`;
});

function play() {
  playing.value = true;
}
</script>

<template>
  <div class="aq-video">
    <iframe
      v-if="playing"
      class="aq-video__frame"
      :src="embedSrc"
      :title="title"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
    />
    <button
      v-else
      type="button"
      class="aq-video__poster"
      :aria-label="title"
      @click="play"
    >
      <img :src="posterSrc" alt="" />
      <span class="aq-video__play">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 6.75v10.5L18.75 12 9 6.75Z" />
        </svg>
      </span>
    </button>
  </div>
</template>

<style scoped>
.aq-video {
  position: absolute;
  inset: 0;
  background: #000;
}

.aq-video__frame,
.aq-video__poster,
.aq-video__poster img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
}

.aq-video__poster {
  padding: 0;
  margin: 0;
  background: #000;
  cursor: pointer;
  appearance: none;
}

.aq-video__poster img {
  object-fit: cover;
  filter: grayscale(0.35) contrast(1.04);
}

.aq-video__play {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 1;
  width: 4.25rem;
  height: 4.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(-50%, -50%);
  border: var(--hairline) solid rgba(247, 247, 247, 0.55);
  color: var(--ink-inverse, #f2f2f2);
  background: rgba(10, 10, 10, 0.28);
  transition: border-color var(--duration-fast) var(--ease),
    background var(--duration-fast) var(--ease),
    color var(--duration-fast) var(--ease);
}

.aq-video__poster:hover .aq-video__play,
.aq-video__poster:focus-visible .aq-video__play {
  border-color: #fff;
  background: rgba(10, 10, 10, 0.45);
  color: #fff;
}

.aq-video__play svg {
  width: 1.15rem;
  height: 1.15rem;
  margin-left: 0.12rem;
  fill: currentColor;
}

.aq-video__poster:focus-visible {
  outline: none;
}

.aq-video__poster:focus-visible .aq-video__play {
  border-color: #fff;
}
</style>
