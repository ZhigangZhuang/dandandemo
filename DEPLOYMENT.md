# 部署说明

## Cloudflare Pages

这个项目是纯前端 Vite 应用，适合部署到 Cloudflare Pages。

构建配置：

- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: 留空

部署前本地检查：

```bash
npm run build
```

如果用的是 Cloudflare Pages 的 Vite / Wrangler 自动配置，单页应用回退通常会由 Cloudflare 配置处理，不需要额外添加 `public/_redirects`。否则可能出现回退规则冲突。
