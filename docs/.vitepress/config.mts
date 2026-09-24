import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv, type ConfigEnv } from "vitepress";
import { vitepressMermaidPreview } from "vitepress-mermaid-preview";
import { readSiteEnv } from "./theme/settings/site-env.ts";
import { editLinkText, SITE_DESCRIPTION, SITE_TITLE, SOCIAL_LINKS } from "./theme/settings/site.ts";
import { countWords, markdownToPlainText } from "./theme/utils/format.ts";

const ENV_DIR = fileURLToPath(new URL("../..", import.meta.url));

const isWikiNote = (relativePath: string): boolean => {
  const parts = relativePath.split("/");
  return (
    parts.length === 3 && parts[0] === "wiki" && parts[2] !== "index.md" && parts[2].endsWith(".md")
  );
};

export default (env: ConfigEnv) => {
  const siteEnv = readSiteEnv(loadEnv(env.mode, ENV_DIR, "VITE_"));

  return defineConfig({
    lang: "zh-CN",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    base: siteEnv.VITE_AYO_BASE,
    appearance: true,
    lastUpdated: true,
    transformPageData(pageData, ctx) {
      if (!isWikiNote(pageData.relativePath) || pageData.frontmatter.words !== undefined) return;
      try {
        const file = join(ctx.siteConfig.srcDir, pageData.relativePath);
        pageData.frontmatter.words = countWords(markdownToPlainText(readFileSync(file, "utf8")));
      } catch {
        // 读不到文件就不注入：退回客户端 DOM 统计，与不注入时的表现一致
      }
    },
    vite: {
      envDir: ENV_DIR,
      resolve: {
        alias: {
          "@theme": fileURLToPath(new URL("./theme", import.meta.url)),
        },
      },
    },
    themeConfig: {
      logo: "/logo.webp",
      socialLinks: SOCIAL_LINKS,
      editLink: {
        pattern: siteEnv.VITE_AYO_EDIT_LINK_PATTERN,
        text: editLinkText(siteEnv.VITE_AYO_EDIT_LINK_TYPE),
      },
      lastUpdated: {
        text: "更新于",
        formatOptions: {
          dateStyle: "short",
          timeStyle: "short",
          hourCycle: "h24",
        },
      },
      docFooter: {
        prev: "上一篇",
        next: "下一篇",
      },
      externalLinkIcon: true,
      search: {
        provider: "local",
        options: {
          translations: {
            button: {
              buttonText: "搜索",
              buttonAriaLabel: "搜索",
            },
            modal: {
              displayDetails: "显示详细列表",
              resetButtonTitle: "重置搜索",
              backButtonTitle: "关闭搜索",
              noResultsText: "没有结果",
              footer: {
                selectText: "选择",
                selectKeyAriaLabel: "输入",
                navigateText: "导航",
                navigateUpKeyAriaLabel: "上箭头",
                navigateDownKeyAriaLabel: "下箭头",
                closeText: "关闭",
                closeKeyAriaLabel: "Esc",
              },
            },
          },
        },
      },
    },
    markdown: {
      image: {
        lazyLoad: true,
      },
      theme: "one-dark-pro",
      lineNumbers: true,
      codeCopyButton: {
        tooltipText: "复制代码",
        copiedText: "已复制",
      },
      config: (md) => {
        const fence = md.renderer.rules.fence;
        if (!fence) return;
        md.renderer.rules.fence = (tokens, idx, options, env, self) => {
          const title = tokens[idx].info.match(/\[(.*)]/);
          const html = fence(tokens, idx, options, env, self);
          if (!title) return html;
          return html.replace(/<\/div>$/, (close) => {
            const label = `<span class="vp-code-title">${md.utils.escapeHtml(title[1].trim())}</span>`;
            return label + close;
          });
        };
        vitepressMermaidPreview(md);
      },
    },
    sitemap: {
      hostname: siteEnv.VITE_AYO_SITE_URL,
    },
  });
};
