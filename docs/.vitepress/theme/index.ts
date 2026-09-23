import { inBrowser } from "vitepress";
import { NProgress } from "nprogress-v2/dist/index.js";
import "nprogress-v2/dist/index.css";
import Layout from "./Layout.vue";
import "./style/index.css";
import { initComponent as mermaidInitComponent } from 'vitepress-mermaid-preview/component';
import 'vitepress-mermaid-preview/dist/index.css';
import type { EnhanceAppContext, Theme } from "vitepress";
import { layouts } from "@theme/layout";
import { AyoWikiNoteList, AyoWikiTopicCards } from "@theme/components/wiki";
import { AyoAnnouncementList } from "@theme/components/portal";
import { AyoTerminal } from "@theme/components/common";

export default {
  Layout,
  enhanceApp({ app, router }: EnhanceAppContext) {

    mermaidInitComponent(app);

    Object.entries(layouts).forEach(([name, component]) => {
      app.component(name, component);
    });

    app.component("AnnouncementList", AyoAnnouncementList);
    app.component("WikiTopicCards", AyoWikiTopicCards);
    app.component("WikiNoteList", AyoWikiNoteList);
    app.component("RTerminal", AyoTerminal);

    if (inBrowser) {
      NProgress.configure({ showSpinner: false });
      router.onBeforeRouteChange = () => {
        NProgress.start();
      };
      router.onAfterRouteChange = () => {
        NProgress.done();
      };
    }
  },
} satisfies Theme;
