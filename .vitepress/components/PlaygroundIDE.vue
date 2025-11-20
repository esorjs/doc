<template>
  <div class="playground-wrapper">
    <div v-if="!loaded" class="loading">Loading playground...</div>
    <div v-show="loaded" v-html="playgroundHTML"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  files: {
    type: Object,
    required: true
  }
});

const loaded = ref(false);

const playgroundHTML = computed(() => {
  let html = '<playground-ide editable-file-system line-numbers resizable>';

  Object.entries(props.files).forEach(([filename, content]) => {
    const ext = filename.split('.').pop();
    const type = ext === 'js' ? 'js' : ext;
    html += `<script type="sample/${type}" filename="${filename}">${content}</scr` + `ipt>`;
  });

  html += '</playground-ide>';
  return html;
});

const loadPlaygroundElements = () => {
  return new Promise((resolve, reject) => {
    if (customElements.get('playground-ide')) {
      resolve();
      return;
    }

    const existingScript = document.querySelector('script[src*="playground-elements"]');
    if (existingScript) {
      customElements.whenDefined('playground-ide').then(resolve);
      return;
    }

    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://unpkg.com/playground-elements@0.18.1/playground-ide.js';

    script.onload = () => {
      customElements.whenDefined('playground-ide').then(resolve);
    };

    script.onerror = reject;
    document.head.appendChild(script);
  });
};

onMounted(async () => {
  try {
    await loadPlaygroundElements();
    loaded.value = true;
  } catch (error) {
    console.error('Failed to load playground:', error);
  }
});
</script>

<style scoped>
.playground-wrapper {
  margin: 20px 0;
  min-height: 400px;
}

.loading {
  padding: 40px;
  text-align: center;
  color: var(--vp-c-text-2);
  font-size: 16px;
}
</style>
