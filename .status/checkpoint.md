# ToolsFactry Status

## p1 - Active
- AI绘图：后端代理三层引擎（Midjourney/Doubao/NanoBanana），密钥不暴露前端
- AI绘图：图片预览弹窗（点击放大），参考图拖拽上传

## p1 - Known Issues
- **本地开发必须用 `npm run dev:all`**：`npm run dev` 只启动前端(Vite:5173)，`/api` 代理到 `localhost:3001` 若后端未启动则返回 HTML 错误页（"Unexpected token '<'"）

## p2 - Resolved
- ~~`PayloadTooLargeError`：express.json limit 默认 100KB，参考图 base64 超限。已改为 50mb + Nginx `client_max_body_size 50m`~~
- ~~SVG 参考图不识别：`parseDataUrl` 正则 `image\/\w+` 不匹配 `image/svg+xml`，已改为 `image\/[^;]+`~~

## p1 - Engine Capabilities
| 引擎 | 文生图 | 参考图(图生图) | 图生文(Describe) |
|------|--------|---------------|-----------------|
| Nano Banana 2 | ✓ | ✓ 多张支持 | - |
| Midjourney | ✓ | - | ✓ 单张 |
| 豆包 Seedream | ✓ | ✓ 多张支持 | - |

## Completed
- 后端代理迁移：所有API Key移至server/image-proxy.ts，前端只调/api/image/*
- Midjourney环境变量通过PM2 ecosystem.config.cjs持久化
- 服务器部署：PM2 toolsfactry进程稳定运行，Nginx反向代理/api/
- PDF转图片功能
- 文本差异对比工具
- 批量重命名工具
- 参考图多张支持：Nano Banana + 豆包均支持多张参考图，PromptPanel 统一拖拽上传UI
- 图片预览弹窗：最大化改为弹窗预览
- 豆包参考图：关键是用 `images`（复数数组）传 data URL，而非 `image`（单数）传 base64
- JSON表格视图工具：JSON→二维表格，关键词定位数组，嵌套字段展开/折叠，CSV导出，多数组可折叠列表
- QR 二维码识别：图片拖拽上传/Ctrl+V粘贴，Canvas+jsQR解码，支持URL/vCard/WiFi/纯文本识别，集成在 /qr 页面"识别"子标签中
