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
      text: Get Started
      link: guide/introduction
    - theme: alt
      text: Try Playground
      link: guide/playground
    - theme: alt
      text: GitHub
      link: "https://github.com/esorjs/esor"

features:
  - title: Native Web Components
    details: "Use Custom Elements and Declarative Shadow DOM to create encapsulated, modular, high-performance interfaces without relying on external libraries."
  - title: Reactivity with Signals
    details: "Fine-grained reactivity system based on signals (signal, effect, computed, memo) that optimizes DOM updates with minimal overhead."
  - title: Smart Template Engine
    details: "Powerful and flexible template system with automatic reactive interpolation, bidirectional bindings, automatic event management and efficient array reconciliation."
  - title: Ready-to-Use Templates
    details: "Jump-start your project with production-ready templates including Todo apps, Blogs, Dashboards, and common patterns like Auth and CRUD operations."
