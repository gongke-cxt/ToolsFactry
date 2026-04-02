export interface MarkdownTheme {
  id: string
  name: string
  description: string
  styles: string
}

export const themes: MarkdownTheme[] = [
  {
    id: 'github',
    name: 'GitHub',
    description: '简洁专业，代码友好',
    styles: `
.md-body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #24292f;
  background: #ffffff;
  padding: 32px 40px;
  max-width: 100%;
  word-wrap: break-word;
}
.md-body h1, .md-body h2, .md-body h3, .md-body h4, .md-body h5, .md-body h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}
.md-body h1 { font-size: 2em; padding-bottom: 0.3em; border-bottom: 1px solid #d8dee4; }
.md-body h2 { font-size: 1.5em; padding-bottom: 0.3em; border-bottom: 1px solid #d8dee4; }
.md-body h3 { font-size: 1.25em; }
.md-body h4 { font-size: 1em; }
.md-body h5 { font-size: 0.875em; }
.md-body h6 { font-size: 0.85em; color: #57606a; }
.md-body p { margin-top: 0; margin-bottom: 16px; }
.md-body a { color: #0969da; text-decoration: none; }
.md-body a:hover { text-decoration: underline; }
.md-body blockquote {
  margin: 0 0 16px;
  padding: 0 1em;
  color: #57606a;
  border-left: 4px solid #d8dee4;
}
.md-body blockquote > :first-child { margin-top: 0; }
.md-body blockquote > :last-child { margin-bottom: 0; }
.md-body ul, .md-body ol {
  margin-top: 0;
  margin-bottom: 16px;
  padding-left: 2em;
}
.md-body li { margin-top: 4px; }
.md-body li + li { margin-top: 4px; }
.md-body code {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background: #eff1f3;
  border-radius: 6px;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
}
.md-body pre {
  margin-top: 0;
  margin-bottom: 16px;
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background: #f6f8fa;
  border-radius: 6px;
}
.md-body pre code {
  padding: 0;
  margin: 0;
  font-size: 100%;
  background: transparent;
  border-radius: 0;
}
.md-body table {
  border-collapse: collapse;
  margin-top: 0;
  margin-bottom: 16px;
  width: 100%;
  overflow: auto;
}
.md-body table th, .md-body table td {
  padding: 6px 13px;
  border: 1px solid #d8dee4;
}
.md-body table th {
  font-weight: 600;
  background: #f6f8fa;
}
.md-body table tr { background: #fff; }
.md-body table tr:nth-child(2n) { background: #f6f8fa; }
.md-body img { max-width: 100%; box-sizing: content-box; border-radius: 6px; }
.md-body hr {
  height: 0.25em;
  padding: 0;
  margin: 24px 0;
  background: #d8dee4;
  border: 0;
}
.md-body .hljs { color: #24292e; background: #f6f8fa; }
.md-body .hljs-comment, .md-body .hljs-quote { color: #6a737d; }
.md-body .hljs-keyword, .md-body .hljs-selector-tag { color: #d73a49; }
.md-body .hljs-string, .md-body .hljs-addition { color: #032f62; }
.md-body .hljs-number, .md-body .hljs-literal { color: #005cc5; }
.md-body .hljs-built_in { color: #e36209; }
.md-body .hljs-title, .md-body .hljs-section { color: #6f42c1; }
.md-body .hljs-type, .md-body .hljs-class { color: #6f42c1; }
.md-body .hljs-function .hljs-title { color: #6f42c1; }
.md-body .hljs-attr, .md-body .hljs-attribute { color: #005cc5; }
.md-body .hljs-variable, .md-body .hljs-template-variable { color: #e36209; }
.md-body .hljs-deletion { color: #b31d28; background: #ffeef0; }
.md-body .hljs-addition { color: #22863a; background: #f0fff4; }
    `
  },
  {
    id: 'medium',
    name: 'Medium',
    description: '编辑风格，优雅衬线体',
    styles: `
.md-body {
  font-family: charter, "Bitstream Charter", "Sitka Text", Cambria, Georgia, serif;
  font-size: 18px;
  line-height: 1.7;
  color: #292929;
  background: #ffffff;
  padding: 40px 48px;
  max-width: 100%;
  word-wrap: break-word;
}
.md-body h1, .md-body h2, .md-body h3, .md-body h4, .md-body h5, .md-body h6 {
  font-family: sohne, "Helvetica Neue", Helvetica, Arial, sans-serif;
  margin-top: 32px;
  margin-bottom: 12px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
}
.md-body h1 { font-size: 2.2em; letter-spacing: -0.04em; }
.md-body h2 { font-size: 1.6em; }
.md-body h3 { font-size: 1.3em; }
.md-body h4 { font-size: 1.1em; }
.md-body p { margin-top: 0; margin-bottom: 20px; }
.md-body a { color: #1a8917; text-decoration: underline; text-underline-offset: 2px; }
.md-body blockquote {
  margin: 0 0 24px;
  padding: 4px 0 4px 24px;
  font-style: italic;
  color: #6b6b6b;
  border-left: 3px solid #292929;
}
.md-body ul, .md-body ol {
  margin-top: 0;
  margin-bottom: 20px;
  padding-left: 1.8em;
}
.md-body li { margin-bottom: 6px; }
.md-body code {
  padding: 2px 6px;
  font-size: 0.88em;
  background: #f2f2f2;
  border-radius: 3px;
  font-family: "Söhne Mono", "Monaco", "Andale Mono", monospace;
}
.md-body pre {
  margin: 0 0 24px;
  padding: 20px;
  overflow: auto;
  font-size: 0.88em;
  line-height: 1.5;
  background: #f7f7f7;
  border-radius: 4px;
  font-family: "Söhne Mono", "Monaco", "Andale Mono", monospace;
}
.md-body pre code {
  padding: 0;
  background: transparent;
  border-radius: 0;
  font-size: inherit;
}
.md-body table {
  border-collapse: collapse;
  margin: 0 0 24px;
  width: 100%;
}
.md-body table th, .md-body table td {
  padding: 10px 16px;
  border: 1px solid #e6e6e6;
}
.md-body table th {
  font-weight: 600;
  background: #fafafa;
}
.md-body img { max-width: 100%; border-radius: 4px; }
.md-body hr {
  border: none;
  text-align: center;
  font-size: 24px;
  letter-spacing: 1em;
  height: auto;
  margin: 32px 0;
  color: #6b6b6b;
  overflow: visible;
  background: none;
}
.md-body hr::after { content: "···"; }
.md-body .hljs { color: #383a42; background: #f7f7f7; }
.md-body .hljs-comment, .md-body .hljs-quote { color: #a0a1a7; font-style: italic; }
.md-body .hljs-keyword, .md-body .hljs-selector-tag { color: #a626a4; }
.md-body .hljs-string, .md-body .hljs-addition { color: #50a14f; }
.md-body .hljs-number, .md-body .hljs-literal { color: #986801; }
.md-body .hljs-built_in { color: #c18401; }
.md-body .hljs-title, .md-body .hljs-section { color: #4078f2; }
.md-body .hljs-type, .md-body .hljs-class { color: #c18401; }
.md-body .hljs-function .hljs-title { color: #4078f2; }
.md-body .hljs-attr { color: #986801; }
.md-body .hljs-variable { color: #e45649; }
    `
  },
  {
    id: 'newsprint',
    name: 'Newsprint',
    description: '报纸风格，古典排版',
    styles: `
.md-body {
  font-family: "Noto Serif SC", Georgia, "Times New Roman", serif;
  font-size: 16px;
  line-height: 1.8;
  color: #1a1a1a;
  background: #fafaf8;
  padding: 40px 48px;
  max-width: 100%;
  word-wrap: break-word;
}
.md-body h1, .md-body h2, .md-body h3, .md-body h4, .md-body h5, .md-body h6 {
  font-family: "Noto Serif SC", Georgia, serif;
  margin-top: 28px;
  margin-bottom: 14px;
  font-weight: 700;
  line-height: 1.3;
}
.md-body h1 {
  font-size: 2em;
  text-align: center;
  border-bottom: 2px solid #1a1a1a;
  padding-bottom: 12px;
  margin-bottom: 24px;
}
.md-body h2 {
  font-size: 1.5em;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #999;
  padding-bottom: 6px;
}
.md-body h3 { font-size: 1.25em; }
.md-body h4 { font-size: 1em; font-style: italic; }
.md-body p { margin-top: 0; margin-bottom: 18px; text-align: justify; }
.md-body a { color: #8b0000; text-decoration: underline; }
.md-body blockquote {
  margin: 0 0 18px;
  padding: 12px 20px;
  font-style: italic;
  color: #444;
  background: #f0efe8;
  border-left: 4px solid #8b0000;
}
.md-body ul, .md-body ol {
  margin-top: 0;
  margin-bottom: 18px;
  padding-left: 2em;
}
.md-body li { margin-bottom: 4px; }
.md-body code {
  padding: 2px 5px;
  font-size: 0.87em;
  background: #eae9e2;
  border: 1px solid #d5d4cd;
  border-radius: 3px;
  font-family: "Courier New", Courier, monospace;
}
.md-body pre {
  margin: 0 0 18px;
  padding: 16px;
  overflow: auto;
  font-size: 0.87em;
  line-height: 1.5;
  background: #eae9e2;
  border: 1px solid #d5d4cd;
  border-radius: 3px;
  font-family: "Courier New", Courier, monospace;
}
.md-body pre code {
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 0;
}
.md-body table {
  border-collapse: collapse;
  margin: 0 0 18px;
  width: 100%;
}
.md-body table th, .md-body table td {
  padding: 8px 14px;
  border: 1px solid #999;
}
.md-body table th {
  font-weight: 700;
  background: #eae9e2;
}
.md-body img { max-width: 100%; }
.md-body hr {
  border: none;
  border-top: 1px solid #999;
  margin: 28px auto;
  width: 60%;
}
.md-body .hljs { color: #1a1a1a; background: #eae9e2; }
.md-body .hljs-comment, .md-body .hljs-quote { color: #666; font-style: italic; }
.md-body .hljs-keyword, .md-body .hljs-selector-tag { color: #8b0000; }
.md-body .hljs-string, .md-body .hljs-addition { color: #2e5e00; }
.md-body .hljs-number, .md-body .hljs-literal { color: #4a4a8b; }
.md-body .hljs-title, .md-body .hljs-section { color: #003366; }
.md-body .hljs-type, .md-body .hljs-class { color: #4a4a8b; }
.md-body .hljs-variable { color: #8b6914; }
    `
  },
  {
    id: 'slate',
    name: 'Slate',
    description: '暗色现代，护眼舒适',
    styles: `
.md-body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.7;
  color: #c9d1d9;
  background: #161b22;
  padding: 32px 40px;
  max-width: 100%;
  word-wrap: break-word;
}
.md-body h1, .md-body h2, .md-body h3, .md-body h4, .md-body h5, .md-body h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
  color: #f0f6fc;
}
.md-body h1 { font-size: 2em; padding-bottom: 0.3em; border-bottom: 1px solid #30363d; }
.md-body h2 { font-size: 1.5em; padding-bottom: 0.3em; border-bottom: 1px solid #30363d; }
.md-body h3 { font-size: 1.25em; }
.md-body h4 { font-size: 1em; }
.md-body p { margin-top: 0; margin-bottom: 16px; }
.md-body a { color: #58a6ff; text-decoration: none; }
.md-body a:hover { text-decoration: underline; }
.md-body blockquote {
  margin: 0 0 16px;
  padding: 0 1em;
  color: #8b949e;
  border-left: 4px solid #30363d;
}
.md-body ul, .md-body ol {
  margin-top: 0;
  margin-bottom: 16px;
  padding-left: 2em;
}
.md-body li { margin-top: 4px; }
.md-body code {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background: #1c2128;
  border: 1px solid #30363d;
  border-radius: 6px;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  color: #f0f6fc;
}
.md-body pre {
  margin-top: 0;
  margin-bottom: 16px;
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
}
.md-body pre code {
  padding: 0;
  margin: 0;
  font-size: 100%;
  background: transparent;
  border: none;
  border-radius: 0;
}
.md-body table {
  border-collapse: collapse;
  margin: 0 0 16px;
  width: 100%;
}
.md-body table th, .md-body table td {
  padding: 6px 13px;
  border: 1px solid #30363d;
}
.md-body table th {
  font-weight: 600;
  background: #1c2128;
}
.md-body table tr { background: #161b22; }
.md-body table tr:nth-child(2n) { background: #1c2128; }
.md-body img { max-width: 100%; border-radius: 6px; }
.md-body hr {
  height: 0.25em;
  padding: 0;
  margin: 24px 0;
  background: #30363d;
  border: 0;
}
.md-body .hljs { color: #c9d1d9; background: #0d1117; }
.md-body .hljs-comment, .md-body .hljs-quote { color: #8b949e; }
.md-body .hljs-keyword, .md-body .hljs-selector-tag { color: #ff7b72; }
.md-body .hljs-string, .md-body .hljs-addition { color: #a5d6ff; }
.md-body .hljs-number, .md-body .hljs-literal { color: #79c0ff; }
.md-body .hljs-built_in { color: #ffa657; }
.md-body .hljs-title, .md-body .hljs-section { color: #d2a8ff; }
.md-body .hljs-type, .md-body .hljs-class { color: #ffa657; }
.md-body .hljs-function .hljs-title { color: #d2a8ff; }
.md-body .hljs-attr { color: #79c0ff; }
.md-body .hljs-variable, .md-body .hljs-template-variable { color: #ffa657; }
.md-body .hljs-deletion { color: #ffa198; background: #490202; }
.md-body .hljs-addition { color: #7ee787; background: #0f5323; }
    `
  },
  {
    id: 'elegant',
    name: 'Elegant',
    description: '精致现代，渐变点缀',
    styles: `
.md-body {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.75;
  color: #2d3748;
  background: #ffffff;
  padding: 40px 48px;
  max-width: 100%;
  word-wrap: break-word;
}
.md-body h1, .md-body h2, .md-body h3, .md-body h4, .md-body h5, .md-body h6 {
  margin-top: 28px;
  margin-bottom: 16px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.02em;
}
.md-body h1 {
  font-size: 2.2em;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.md-body h2 {
  font-size: 1.6em;
  padding-bottom: 8px;
  background: linear-gradient(90deg, #667eea, transparent) no-repeat bottom;
  background-size: 60px 3px;
}
.md-body h3 { font-size: 1.3em; color: #553c9a; }
.md-body h4 { font-size: 1.1em; }
.md-body p { margin-top: 0; margin-bottom: 18px; }
.md-body a {
  color: #667eea;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}
.md-body a:hover { border-bottom-color: #667eea; }
.md-body blockquote {
  margin: 0 0 18px;
  padding: 16px 20px;
  color: #4a5568;
  background: linear-gradient(135deg, #f6f8fb, #faf5ff);
  border-left: 4px solid #667eea;
  border-radius: 0 8px 8px 0;
}
.md-body blockquote > :first-child { margin-top: 0; }
.md-body blockquote > :last-child { margin-bottom: 0; }
.md-body ul, .md-body ol {
  margin-top: 0;
  margin-bottom: 18px;
  padding-left: 1.8em;
}
.md-body li { margin-bottom: 6px; }
.md-body li::marker { color: #667eea; }
.md-body code {
  padding: 2px 7px;
  font-size: 0.88em;
  background: #f0eef8;
  border-radius: 4px;
  font-family: "JetBrains Mono", "Fira Code", ui-monospace, monospace;
  color: #553c9a;
}
.md-body pre {
  margin: 0 0 18px;
  padding: 20px;
  overflow: auto;
  font-size: 0.88em;
  line-height: 1.5;
  background: #1e1e2e;
  border-radius: 12px;
  font-family: "JetBrains Mono", "Fira Code", ui-monospace, monospace;
}
.md-body pre code {
  padding: 0;
  background: transparent;
  border-radius: 0;
  color: #cdd6f4;
}
.md-body table {
  border-collapse: separate;
  border-spacing: 0;
  margin: 0 0 18px;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}
.md-body table th, .md-body table td {
  padding: 10px 16px;
}
.md-body table th {
  font-weight: 600;
  background: linear-gradient(135deg, #f0eef8, #e8e4f8);
  color: #553c9a;
}
.md-body table td { border-top: 1px solid #e2e8f0; }
.md-body table tr:hover td { background: #faf5ff; }
.md-body img { max-width: 100%; border-radius: 12px; box-shadow: 0 4px 20px rgba(102, 126, 234, 0.15); }
.md-body hr {
  border: none;
  height: 2px;
  background: linear-gradient(90deg, transparent, #667eea, #764ba2, transparent);
  margin: 32px 0;
}
.md-body .hljs { color: #cdd6f4; background: #1e1e2e; }
.md-body .hljs-comment, .md-body .hljs-quote { color: #6c7086; font-style: italic; }
.md-body .hljs-keyword, .md-body .hljs-selector-tag { color: #cba6f7; }
.md-body .hljs-string, .md-body .hljs-addition { color: #a6e3a1; }
.md-body .hljs-number, .md-body .hljs-literal { color: #fab387; }
.md-body .hljs-built_in { color: #f9e2af; }
.md-body .hljs-title, .md-body .hljs-section { color: #89b4fa; }
.md-body .hljs-type, .md-body .hljs-class { color: #f9e2af; }
.md-body .hljs-function .hljs-title { color: #89b4fa; }
.md-body .hljs-attr { color: #fab387; }
.md-body .hljs-variable { color: #f38ba8; }
.md-body .hljs-deletion { color: #f38ba8; }
    `
  }
]

export function getTheme(id: string): MarkdownTheme {
  return themes.find(t => t.id === id) || themes[0]
}
