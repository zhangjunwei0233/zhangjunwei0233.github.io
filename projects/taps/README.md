# Project page template

使用 Python 3.9+，无第三方构建依赖。`template/` 是共享模板，`taps/` 是当前实例，根目录 `index.html` 是生成后的静态入口。

```text
projects/taps/
├── template/       # 页面骨架、基础样式、通用交互、字体
├── taps/           # 当前页面的配置、内容和使用中的素材
├── build.py        # 构建、校验与初始化
└── index.html      # 生成文件
```

## 编辑与预览

- `taps/page.json`：标题、作者、导航、资源按钮、配色和页脚。以 `_html` 结尾的字段支持 HTML。
- `taps/content.html`：banner 与各 section 的正文和布局。
- `taps/citation.bib`：引用。
- `taps/assets/`：图片与下载文件。
- `taps/chart.css`、`chart.js`、`curves.js`：实例的交互图。
- `template/style.css`：共享排版、字号与响应式样式。

在本目录运行：

```bash
python3 build.py
python3 build.py --check
python3 -m http.server 8765 --bind 127.0.0.1
```

打开 <http://127.0.0.1:8765/>。修改内容后重新构建；不直接编辑生成的 `index.html`。

## 创建实例

```bash
python3 build.py --init my-project
python3 build.py my-project
```

编辑新目录中的 `page.json` 和 `content.html`。构建只更新根目录入口，实例使用同一份模板资源。

正文可以使用 `{{ assets }}` 引用本实例的素材目录，以及 `{{ include:assets/figure.svg }}` 内嵌本实例文件。配置中的 `styles`、`scripts` 可加载实例专属样式与交互；省略这些字段即可使用普通静态页面。

`navigation` 中的 `id` 对应正文 section 的 `id`；`compact_hide: true` 会在窄屏隐藏该导航项。`resources` 支持 `book`、`poster`、`quote` 图标。`citation`、`footer`、`favicon` 均可省略。

构建会检查重复 ID、本地资源和页内链接。部署时保留 `index.html`、`template/` 与当前实例目录即可。来源与字体许可见 `template/NOTICE.md`。

主站部署时会先构建本页，再由 Jekyll 发布。论文条目的 `project` 字段控制主页上的入口按钮。
