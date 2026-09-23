declare module "@theme/data/posts.data" {
  import type { PostItem } from "./data/posts.data";
  export const data: PostItem[];
}

declare module "@theme/data/wiki.data" {
  import type { WikiTopic } from "./data/wiki.data";
  export const data: WikiTopic[];
}

declare module "@theme/data/announcements.data" {
  import type { AnnouncementItem } from "./data/announcements.data";
  export const data: AnnouncementItem[];
}

declare module "@theme/data/projects.data" {
  import type { ProjectItem } from "./data/projects.data";
  export const data: ProjectItem[];
}

export {};
