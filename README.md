# Hi!😊

This is my personal website, fork on [zxh.io](https://github.com/Renovamen/renovamen.github.io/tree/vitesse).

Any way, just have fun: [zhengshugan-me.vercel.app](https://zhengshugan-me.vercel.app/)

&nbsp;

## Usage

Clone the repo and install dependencies:

```bash
pnpm i
```

Start developing the site:

```bash
pnpm dev
```

Build for production with minification:

```bash
pnpm build
```

&nbsp;

## 文章列表封面

首页 `/` 展示中文文章及可选封面；`/blog`、`/posts`、`/posts/zh` 使用原有的紧凑纯文字列表。
个人介绍移至 `/about`，可通过导航栏 About 访问。
在文章 frontmatter 中显式填写：

```yaml
title: 为什么还在使用 iPhone？
cover:
  src: ./Attachments/apple-intelligence.png
  alt: Apple Intelligence 展示图
```

`cover` 可省略；填写时 `src` 必须非空，`alt` 可省略。附件路径以 Markdown
文件所在目录为基准，支持 `Attachments/图片.webp` 或 `./Attachments/图片.webp`
（文件名中的中文和空格直接填写，无需 URL 编码）。也可以使用
`/images/cover.webp`（对应 `public/images/cover.webp`）或完整 HTTPS 图片地址。
推荐使用浏览器支持的 WebP、PNG 或 JPEG 图片。首页按标题、日期、封面大图、
正文预览和「阅读全文」纵向展示；封面占满内容宽度，保持原始比例，不裁剪。
封面不会自动从正文提取，也不会自动用于文章详情或分享元数据。
未填写封面或图片加载失败时，仅显示文字内容。

正文预览自动提取普通段落，跳过标题、目录、图片、代码块、表格和 HTML 块，
保留链接文字与强调内容，最多展示 200 个字符，超出时添加省略号。
无可提取文字时省略预览段落。无需新增摘要字段；Blog 仍使用原有紧凑纯文字列表。


## Credits

- [antfu.me]( https://antfu.me/)
- [qbb.sh](https://www.qbb.sh/)
- [Vitepress](https://vitepress.vuejs.org/)
- [Computer Modern Sans](https://checkmyworking.com/cm-web-fonts/)
- [zxh.io](https://github.com/Renovamen/renovamen.github.io)

&nbsp;

## License

[MIT](LICENSE)
