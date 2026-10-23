# TAPS project page

正式地址：<https://zhangjunwei0233.github.io/projects/taps/>。`/taps/` 保留自动跳转。

- `page.json`：标题、作者、导航、资源链接和配色。
- `content.html`：页面内容。
- `citation.bib`：引用。
- `assets/`、`chart.css`、`chart.js`、`curves.js`：页面素材与专用交互。
- `index.html`：生成结果。

在站点根目录运行：

```bash
python3 templates/project-page/build.py projects/taps
python3 templates/project-page/build.py projects/taps --check
```

共享模板与复用说明见 [项目页模板](../../templates/project-page/README.md)。主站部署时自动构建 `projects/` 下包含 `page.json` 的实例。
