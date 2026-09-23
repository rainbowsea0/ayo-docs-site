export interface Author {
  /** 唯一标识（frontmatter 引用用） */
  key: string;
  /** 展示名 */
  name: string;
  /** 头像（选填；版权块用的是通用人像图标，这里留给别处用） */
  avatar?: string;
  /** 个人主页（填了名字可点） */
  url?: string;
  /** 联系邮箱 */
  email?: string;
}

export const AUTHORS: Author[] = [
  {
    key: "zhangheng",
    name: "咕咚",
    avatar: "/logo.webp",
    url: "https://github.com/rainbowsea0",
    email: "ayoblog@ayostack.cn",
  },
];

/** 按 key 查作者 */
export const getAuthor = (key: string): Author | undefined =>
  AUTHORS.find((author) => author.key === key);
