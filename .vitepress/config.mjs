import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Esor",
  description: "Documentation for the Esor JavaScript framework",
  lang: "en-US",
  head: [["link", { rel: "icon", type: "image/png", href: "/logo.png" }]],
  locales: {
    root: {
      label: "English",
      lang: "en",
    },
    es: {
      label: "Spanish",
      lang: "es",
      link: "/es/guide",
    },
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/logo.png",
    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/guide/introduction" },
    ],

    sidebar: [
      {
        text: "Examples",
        items: [
          { text: "Markdown Examples", link: "/markdown-examples" },
          { text: "Runtime API Examples", link: "/api-examples" },
        ],
      },
    ],

    search: {
      provider: "local",
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/vuejs/vitepress" },
      { icon: "x", link: "https://x.com/esor_js" },
    ],

    footer: {
      message:
        'Released under the <a href="https://github.com/vuejs/vitepress/blob/main/LICENSE">MIT License</a>.',
      copyright:
        'Copyright © 2024-present <a href="https://github.com/juancristobalgd1">Juan Cristobal</a>',
    },
  },
});
