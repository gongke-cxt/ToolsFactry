import { getTheme } from './themes'

export function generateStandaloneHTML(html: string, themeId: string, tocHtml: string): string {
  const theme = getTheme(themeId)

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Document</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      display: flex;
      min-height: 100vh;
      justify-content: center;
      background: #f5f5f5;
    }
    .container {
      display: flex;
      max-width: 1100px;
      width: 100%;
      margin: 0 auto;
    }
    .toc-sidebar {
      width: 220px;
      flex-shrink: 0;
      padding: 40px 16px 40px 24px;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
    }
    .toc-sidebar h2 {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 12px;
      color: #888;
    }
    .toc-sidebar ul {
      list-style: none;
      padding: 0;
    }
    .toc-sidebar li {
      margin-bottom: 6px;
    }
    .toc-sidebar a {
      text-decoration: none;
      color: #666;
      font-size: 13px;
      line-height: 1.4;
      display: block;
      transition: color 0.2s;
    }
    .toc-sidebar a:hover { color: #333; }
    .toc-sidebar .toc-h3 { padding-left: 14px; }
    .toc-sidebar .toc-h4 { padding-left: 28px; }
    .content-wrapper {
      flex: 1;
      max-width: 780px;
      margin: 32px auto;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
      border-radius: 8px;
      overflow: hidden;
    }
    ${theme.styles}
    @media (max-width: 768px) {
      .toc-sidebar { display: none; }
      .container { display: block; }
      .content-wrapper { margin: 0; border-radius: 0; }
      .md-body { padding: 24px 20px; }
    }
  </style>
</head>
<body>
  <div class="container">
    ${tocHtml ? `<nav class="toc-sidebar">${tocHtml}</nav>` : ''}
    <div class="content-wrapper">
      <div class="md-body">
        ${html}
      </div>
    </div>
  </div>
</body>
</html>`
}
