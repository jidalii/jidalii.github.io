import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown'
import expressiveCode from "astro-expressive-code";
import remarkMermaid from 'remark-mermaidjs'
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import solid from '@astrojs/solid-js';
import { remarkModifiedTime } from "./src/remarkPlugin/remark-modified-time.mjs";
import { resetRemark } from "./src/remarkPlugin/reset-remark.js";
import remarkDirective from "remark-directive";
// remark-collapse removed (esbuild parse issue)
import remarkMath from 'remark-math';
import rehypeMathjax from 'rehype-mathjax';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers'
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections'
import { unified } from '@astrojs/markdown-remark';
import { visit } from 'unist-util-visit'

function customRehypeLazyLoadImage() {
  return function (tree) {
    visit(tree, function (node) {
      if (node.tagName === 'img') {
        node.properties['data-src'] = node.properties.src
        node.properties.src = '/spinner.gif'
        node.properties['data-alt'] = node.properties.alt
        node.properties.alt = 'default'
      }
    })
  }
}

export default defineConfig({
  site: 'https://jidalii.github.io',
  integrations: [sitemap(), solid(), partytown({ config: { forward: ["dataLayer.push"] } }), expressiveCode({
    plugins: [pluginLineNumbers(), pluginCollapsibleSections()],
    themes: ["github-dark", "github-light"],
    styleOverrides: {
      codeFontFamily: "jetbrains-mono",
      uiFontFamily: "jetbrains-mono",
    },
    themeCssSelector: (theme) => `[data-theme="${theme.type}"]`
  }), mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMermaid, remarkMath, remarkModifiedTime, resetRemark, remarkDirective],
      rehypePlugins: [rehypeMathjax],
    }),
  },
});