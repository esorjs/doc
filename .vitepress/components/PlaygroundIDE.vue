<template>
  <div class="playground-wrapper">
    <div v-if="!loaded" class="loading">
      Loading playground...
    </div>
    <div :id="containerId" class="playground-container" v-show="loaded"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

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

const containerId = `playground-${props.id}`;
const loaded = ref(false);
let playgroundElement = null;

const loadPlaygroundElements = () => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (customElements.get('playground-ide')) {
      resolve();
      return;
    }

    // Check if script is already in the document
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

const createPlayground = () => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container ${containerId} not found`);
    return;
  }

  // Create playground-ide element
  const ide = document.createElement('playground-ide');
  ide.setAttribute('editable-file-system', '');
  ide.setAttribute('line-numbers', '');
  ide.setAttribute('resizable', '');

  // Add files
  Object.entries(props.files).forEach(([filename, content]) => {
    const script = document.createElement('script');
    const ext = filename.split('.').pop();
    script.setAttribute('type', `sample/${ext === 'js' ? 'js' : ext}`);
    script.setAttribute('filename', filename);
    script.textContent = content;
    ide.appendChild(script);
  });

  container.appendChild(ide);
  playgroundElement = ide;
  loaded.value = true;

  console.log(`Playground ${props.id} created successfully`);
};

onMounted(async () => {
  try {
    console.log(`Initializing playground ${props.id}`);
    await loadPlaygroundElements();
    console.log('playground-elements loaded');

    // Small delay to ensure DOM is ready
    setTimeout(() => {
      createPlayground();
    }, 100);
  } catch (error) {
    console.error('Failed to load playground:', error);
  }
});

onBeforeUnmount(() => {
  if (playgroundElement && playgroundElement.parentNode) {
    playgroundElement.parentNode.removeChild(playgroundElement);
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

.playground-container {
  min-height: 400px;
}
</style>
