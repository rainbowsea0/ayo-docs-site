import { readSiteEnv, type SiteEnv } from "./site-env";

export const siteEnv: SiteEnv = readSiteEnv({
  VITE_AYO_SITE_URL: import.meta.env.VITE_AYO_SITE_URL,
  VITE_AYO_EDIT_LINK_PATTERN: import.meta.env.VITE_AYO_EDIT_LINK_PATTERN,
  VITE_AYO_EDIT_LINK_TYPE: import.meta.env.VITE_AYO_EDIT_LINK_TYPE,
  VITE_AYO_LOCK_UNLOCK_CODE: import.meta.env.VITE_AYO_LOCK_UNLOCK_CODE,
  VITE_AYO_BASE: import.meta.env.VITE_AYO_BASE,
});
