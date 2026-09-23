declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

interface ImportMetaEnv {
  readonly VITE_AYO_SITE_URL: string | undefined;
  readonly VITE_AYO_EDIT_LINK_PATTERN: string | undefined;
  readonly VITE_AYO_EDIT_LINK_TYPE: string | undefined;
  readonly VITE_AYO_LOCK_UNLOCK_CODE: string | undefined;
  readonly VITE_AYO_BASE: string | undefined;
}
