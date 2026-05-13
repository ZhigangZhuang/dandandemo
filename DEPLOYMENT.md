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

如果以后加入前端路由，`public/_redirects` 会让刷新页面时仍然回到 `index.html`，避免 Cloudflare Pages 返回 404。
