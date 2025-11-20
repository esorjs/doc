import DefaultTheme from 'vitepress/theme';
import './custom.css';
import PlaygroundIDE from '../components/PlaygroundIDE.vue';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('PlaygroundIDE', PlaygroundIDE);
  }
};