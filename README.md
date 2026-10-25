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
推荐使用浏览器支持的 WebP、PNG 或 JPEG 图片。封面按 16:9 居中裁剪，
只显示在新列表，不会自动从正文提取，也不会自动用于文章详情或分享元数据。


## Credits

- [antfu.me]( https://antfu.me/)
- [qbb.sh](https://www.qbb.sh/)
- [Vitepress](https://vitepress.vuejs.org/)
- [Computer Modern Sans](https://checkmyworking.com/cm-web-fonts/)
- [zxh.io](https://github.com/Renovamen/renovamen.github.io)

&nbsp;

## License

[MIT](LICENSE)
