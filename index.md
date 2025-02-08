---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Esor"
  text: "A framework based on native web components"
  tagline: Fast, intuitive and powerful
  image:
    src: /logo.png
    alt: Logo de Asor

  actions:
    - theme: brand
      text: Start
      link: guide/introduction
    - theme: alt
      text: View on GitHub
      link: "https://github.com/esorjs/esor"

features:
  - title: Native Web Components
    details: "Use Custom Elements and Declarative Shadow DOM to create encapsulated, modular, high-performance interfaces without relying on external libraries.."
  - title: Reactivity and Hooks
    details: "It has a fine-grained reactivity system based on signals and hooks (useSignal, useEffect, useMemo) that optimises DOM updating.."
  - title: Smart Template Engine
    details: "Powerful and flexible template system with automatic reactive interpolation, bidirectional bindings, automatic event management and efficient array reconciliation.."
