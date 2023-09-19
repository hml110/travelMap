import { resolve } from "node:path";
import fs from "fs";
import matter from "gray-matter";
import { defineConfig } from "vite";
import Pages from "vite-plugin-pages";
import Components from "unplugin-vue-components/vite";
import Vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import { bundledLanguages, getHighlighter } from "shikiji";
import LinkAttributes from "markdown-it-link-attributes";
import Markdown from "unplugin-vue-markdown/vite";
import UnoCSS from "unocss/vite";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import { presetIcons, presetUno } from "unocss";
import SVG from "vite-svg-loader";
import Inspect from "vite-plugin-inspect";
import anchor from "markdown-it-anchor";
import { slugify } from "./scripts/slugify";

export default defineConfig({
  server: {
    port: 4000,
  },
  build: {
    sourcemap: true,
  },
  resolve: {
    alias: [{ find: "~/", replacement: `${resolve(__dirname, "src")}/` }],
  },
  plugins: [
    UnoCSS({
      shortcuts: [
        {
          "bg-base": "bg-white dark:bg-black",
          "border-base": "border-[#8884]",
        },
      ],
      presets: [
        presetIcons({
          extraProperties: {
            display: "inline-block",
            height: "1.2em",
            width: "1.2em",
            "vertical-align": "text-bottom",
          },
        }),
        presetUno(),
      ],
    }),
    Vue({
      include: [/\.vue$/, /\.md$/],
      reactivityTransform: true,
      script: {
        defineModel: true,
      },
    }),

    /**
     * 这里就配置了vite-plugin-pages插件的路由基本信息
     * Pages 是在 vite.config.ts 文件中注册的一个 Vite 插件。
     * 它用于自动生成 Vue Router 的路由配置，可以使得页面文件的创建和管理更加简单。
     * 其中 extensions 属性指定了需要被识别的页面文件的扩展名，包括 .vue 和 .md 文件。
     * dirs 属性指定了页面文件所在的目录，这里是 pages 目录。
     * extendRoute 方法用于扩展每一个生成的路由配置对象，对其进行个性化的定制。
     * 此处逻辑是当路由组件是 .md 文件时，从该文件中读取元数据（frontmatter），
     * 并将其转换为路由配置对象的 meta 属性。其中，matter 是一个第三方库，用于解析 .md 文件的元数据。
     * 最后返回被扩展后的路由配置对象。
     *
     * 总体来说，这段代码的作用是自动生成路由配置，
     * 将 .vue 和 .md 文件转换为 Vue Router 的路由配置，
     * 并通过 extendRoute 方法对路由对象进行定制。
     * 这样就可以更加方便地管理页面，并且可以为每个页面定义个性化的元数据。
     */
    Pages({
      extensions: ["vue", "md"],
      dirs: "pages",
      extendRoute(route) {
        const path = resolve(__dirname, route.component.slice(1));
        if (path.endsWith(".md")) {
          const md = fs.readFileSync(path, "utf-8");
          const { data } = matter(md);
          route.meta = Object.assign(route.meta || {}, { frontmatter: data });
        }
        return route;
      },
    }),

    Markdown({
      wrapperClasses: (id, code) => {
        return code.includes("@layout-map")
          ? "map_container"
          : code.includes("@layout-full-width")
          ? ""
          : "prose m-auto slide-enter-content";
      },
      exportFrontmatter: false,
      exposeFrontmatter: false,
      exposeExcerpt: false,
      async markdownItSetup(md) {
        const shiki = await getHighlighter({
          themes: ["vitesse-dark", "vitesse-light"],
          langs: Object.keys(bundledLanguages) as any,
        });

        md.use((markdown) => {
          markdown.options.highlight = (code, lang) => {
            return shiki.codeToHtml(code, {
              lang,
              themes: {
                light: "vitesse-light",
                dark: "vitesse-dark",
              },
              cssVariablePrefix: "--s-",
            });
          };
        });

        md.use(anchor, {
          slugify,
          permalink: anchor.permalink.linkInsideHeader({
            symbol: "#",
            renderAttrs: () => ({ "aria-hidden": "true" }),
          }),
        });

        md.use(LinkAttributes, {
          matcher: (link: string) => /^https?:\/\//.test(link),
          attrs: {
            target: "_blank",
            rel: "noopener",
          },
        });
      },
    }),

    AutoImport({
      imports: ["vue","vue-router","@vueuse/core"],
    }),

    Components({
      extensions: ["vue", "md"],
      dts: true,
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      resolvers: [
        IconsResolver({
          componentPrefix: "",
        }),
      ],
    }),

    Icons({
      autoInstall: true,
      defaultClass: "inline",
      defaultStyle: "vertical-align: sub;",
    }),

    SVG({
      svgo: false,
      defaultImport: "url",
    }),

    Inspect(),
  ],
});
