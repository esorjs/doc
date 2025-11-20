import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Esor",
  description: "Documentation for the Esor JavaScript framework",
  lang: "en-US",
  base: "/doc/",
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
      { text: "Playground", link: "/guide/playground" },
    ],

    sidebar: [
      {
        text: "Getting Started",
        items: [
          { text: "Introduction", link: "/guide/introduction" },
          { text: "Quick Start", link: "/guide/getting-started" },
          { text: "Playground", link: "/guide/playground" },
        ],
      },
      {
        text: "Core Concepts",
        items: [
          { text: "Tutorial", link: "/guide/tutorial" },
          { text: "Components", link: "/guide/components" },
        ],
      },
      {
        text: "API Reference",
        items: [
          { text: "API", link: "/guide/api" },
          { text: "Reactivity", link: "/guide/hooks" },
        ],
      },
      {
        text: "Resources",
        items: [
          { text: "Templates & Starter Kits", link: "/guide/templates" },
          { text: "Practical Examples", link: "/guide/examples" },
        ],
      },
    ],

    search: {
      provider: "local",
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/esorjs/esor" },
      { icon: "x", link: "https://x.com/esor_js" },
    ],

    footer: {
      message:
        'Released under the <a href="https://github.com/esorjs/esor/blob/main/LICENSE">MIT License</a>.',
      copyright:
        'Copyright © 2024-present <a href="https://github.com/juancristobalgd1">Juan Cristobal</a>',
    },
  },
});
