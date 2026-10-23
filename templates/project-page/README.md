# 独立项目页模板

可复用的静态项目页模板，包含响应式排版、磨砂导航栏、章节定位、图片放大和引用复制。使用 Python 3.9+，无第三方构建依赖。

本目录可以整体复制到其他仓库或模板集合。构建器从自身目录读取模板，通过命令参数接收项目路径，不依赖特定项目、站点域名或仓库结构。

## 目录

```text
templates/project-page/
├── build.py        # 初始化、构建与校验
├── page.html       # 页面骨架
├── style.css       # 共享样式与响应式规则
├── site.js         # 通用交互
├── fonts/          # 字体与图标
├── glass-grain.svg # 导航纹理
├── LICENSE
└── NOTICE.md

projects/my-project/
├── page.json       # 页面配置
├── content.html    # 页面正文
├── assets/         # 项目素材
└── index.html      # 构建结果
```

模板资源由多个项目共享；每个项目生成自己的 `index.html`。

## 创建与构建

在站点根目录运行：

```bash
python3 templates/project-page/build.py --init projects/my-project
python3 templates/project-page/build.py projects/my-project
python3 templates/project-page/build.py projects/my-project --check
python3 -m http.server 8000 --bind 127.0.0.1
```

打开 <http://127.0.0.1:8000/projects/my-project/>。修改源文件后重新构建。

模板与项目也可以位于其他目录：

```bash
python3 /path/to/collection/project-page/build.py /path/to/site/projects/my-project
```

构建器自动计算共享样式和脚本的相对路径。移动模板或项目后重新构建；部署时保留两者的相对位置，并发布共享字体、样式和脚本资源。

`--init` 创建空白实例，不覆盖现有目录；`--check` 验证生成结果是否最新，并检查相对资源引用、重复 ID 和页内锚点。

## 页面配置

`page.json` 的最小配置：

```json
{
  "name": "Project",
  "title": "Project title",
  "description": "A short summary.",
  "navigation": [{ "id": "overview", "label": "Overview" }]
}
```

可选字段：

| 字段                                                     | 用途                                                                         |
| -------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `heading_html`                                           | 页面主标题，默认使用 `title`                                                 |
| `authors_html`、`affiliations_html`、`author_notes_html` | 作者与附注                                                                   |
| `social_title`、`social_description`                     | 分享信息，默认沿用标题与摘要                                                 |
| `navigation_action`                                     | 导航栏右侧的主题色链接，包含 `label` 和 `href`，例如返回项目列表               |
| `favicon`                                                | 项目内的图标文件                                                             |
| `navigation`                                             | 章节导航；`id` 对应正文锚点，`compact_hide: true` 在窄屏隐藏该项             |
| `resources`                                              | 资源按钮；每项含 `label`、`href`，可选 `icon` 为 `book`、`code`、`poster` 或 `quote` |
| `theme`                                                  | CSS 变量名到十六进制颜色的映射                                               |
| `styles`、`scripts`                                      | 项目内的附加 CSS、JavaScript 文件列表                                        |
| `citation`                                               | 项目内的引用文本文件                                                         |
| `footer`                                                 | `note`、`label` 和 `url` 组成的页脚                                          |

普通文本字段会自动转义；以 `_html` 结尾的字段保留 HTML。资源文件路径相对于项目目录，也支持外部链接和页内锚点。

尚未开放的资源可设置 `disabled: true`，省略 `href`，并使用 `status: "coming soon"` 显示附注。开放后添加 `href` 并移除 `disabled` 和 `status`。

## 正文与素材

`content.html` 使用普通 HTML。基本章节示例：

```html
<section class="story-section" id="overview" aria-labelledby="overview-title">
  <div class="prose container blog">
    <p class="section-index">01 / OVERVIEW</p>
    <h2 id="overview-title">Introduce the project.</h2>
    <p class="text">Write the section content here.</p>
  </div>
</section>
```

可组合使用 `.hero-banner`、`.hero-inner`、`.hero-copy`、`.hero-title`、`.hero-summary` 构建首屏；`.figure` 保持图文同宽，`.table-scroll` 容纳宽表，`.takeaway-heading` 与 `.takeaway-tag` 提供带标签的标题。

正文中的两个占位符：

- `{{ assets }}`：本项目的素材目录。
- `{{ include:assets/figure.svg }}`：内嵌本项目文件，支持递归引用并检查循环。

用链接包裹图片可启用居中放大：

```html
<figure class="figure">
  <a href="{{ assets }}/figure.svg"><img src="{{ assets }}/figure.svg" alt="Figure description" /></a>
  <figcaption>Figure caption.</figcaption>
</figure>
```

专用图表和交互通过实例的 `styles`、`scripts` 接入；共享模板不包含项目数据。

## 部署与许可

发布生成的页面、项目素材以及共享模板的运行时资源。源码配置和构建器无需对外发布。若使用额外的 CSS 压缩步骤，应确保其支持 CSS 变量与 `calc()`，或排除这些独立样式。

模板来源与字体许可见 [NOTICE.md](NOTICE.md)。
