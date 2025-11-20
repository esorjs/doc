<template>
  <div class="example-section">
    <slot name="description"></slot>

    <button class="share-button" @click="shareCode">
      <span>📋</span>
      <span>Share Code</span>
    </button>

    <div ref="playgroundContainer" class="playground-wrapper"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  files: {
    type: Object,
    required: true
  }
});

const playgroundContainer = ref(null);

onMounted(() => {
  if (playgroundContainer.value) {
    // Create playground-ide element
    const ide = document.createElement('playground-ide');
    ide.setAttribute('editable-file-system', '');
    ide.setAttribute('line-numbers', '');
    ide.setAttribute('resizable', '');

    // Add theme class
    const theme = localStorage.getItem('playground-theme') || 'light';
    ide.classList.add(`${theme}-theme`);

    // Add files
    Object.entries(props.files).forEach(([filename, content]) => {
      const script = document.createElement('script');
      const ext = filename.split('.').pop();
      script.setAttribute('type', `sample/${ext}`);
      script.setAttribute('filename', filename);
      script.textContent = content;
      ide.appendChild(script);
    });

    playgroundContainer.value.appendChild(ide);
  }
});

async function shareCode() {
  try {
    const shareText = JSON.stringify(props.files, null, 2);
    await navigator.clipboard.writeText(shareText);
    showNotification('Code copied to clipboard! 📋');
  } catch (err) {
    console.error('Failed to copy:', err);
    showNotification('Failed to copy code ❌');
  }
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => notification.classList.add('show'), 10);

  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}
</script>

<style scoped>
.example-section {
  margin: 40px 0;
}

.share-button {
  padding: 8px 16px;
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}

.share-button:hover {
  background: var(--vp-c-brand-2);
  transform: translateY(-1px);
}

.share-button:active {
  transform: translateY(0);
}

.playground-wrapper :deep(playground-ide) {
  height: 500px;
  margin: 0 0 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  transition: border-color 0.3s;
}
</style>
