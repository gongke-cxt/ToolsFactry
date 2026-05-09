# ToolsFactry Status

## p1 - Active
- AI绘图：后端代理三层引擎（Midjourney/Doubao/NanoBanana），密钥不暴露前端
- AI绘图：图片预览弹窗（点击放大），参考图拖拽上传（nanobanana/doubao）

## Completed
- 后端代理迁移：所有API Key移至server/image-proxy.ts，前端只调/api/image/*
- Midjourney环境变量通过PM2 ecosystem.config.cjs持久化
- 服务器部署：PM2 toolsfactry进程稳定运行，Nginx反向代理/api/
- PDF转图片功能（/pdf -> "转图片" tab）
- 文本差异对比工具（/diff）
- 批量重命名工具（/batch-rename）
