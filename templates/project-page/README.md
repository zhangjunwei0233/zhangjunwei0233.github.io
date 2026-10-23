# 项目页模板

所有项目共用本目录的渲染器、布局、CSS、JS 和字体。项目只保存自己的配置、正文和素材；生成的 HTML 只存在于 `_site/`。

## 新建项目

在仓库根目录运行：

```bash
cp -R templates/project-page/starter projects/my-project
bundle exec jekyll serve
```

修改 `projects/my-project/page.json`、`content.html` 和 `assets/`。页面地址为 `/projects/my-project/`，Projects 卡片自动生成。

不要复制本目录的共用文件，也不要创建项目 `index.html` 或另一份卡片配置。

## 分工

| 位置                                                | 职责                                         |
| --------------------------------------------------- | -------------------------------------------- |
| `starter/`                                          | 只含项目专用配置、正文、示例图；复制这一部分 |
| `build.py`                                          | 校验并渲染项目，输出到标准输出，不写源码     |
| `jekyll.rb`                                         | 调用渲染器、生成卡片数据、阻止源码发布       |
| `page.html`                                         | 共享页面骨架                                 |
| `style.css`、`site.js`、`fonts/`、`glass-grain.svg` | 共享运行时资源                               |
| `projects/<slug>/`                                  | 实际项目源码                                 |
| `_site/projects/<slug>/index.html`                  | Jekyll 生成的页面                            |

`_plugins/project-pages.rb` 只负责加载这里的 Jekyll 集成。构建、预览和 CI 都使用 `bundle exec jekyll build/serve`，没有第二套预生成流程。

## 配置

| 字段                                                                     | 用途                                                                     |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `name`、`title`、`description`                                           | 项目简称、页面标题与描述                                                 |
| `card`                                                                   | `image` 封面路径、`order` 排序；可选 `description` 覆盖卡片简介          |
| `heading_html`、`authors_html`、`affiliations_html`、`author_notes_html` | 主标题、作者、单位与附注                                                 |
| `navigation`                                                             | 章节的 `id`、`label`；`compact_hide: true` 在窄屏隐藏                    |
| `navigation_action`                                                      | 离开项目页的导航链接：`label`、`href`                                    |
| `resources`                                                              | 资源的 `label`、`href`；可选 `icon` 为 `book`、`code`、`poster`、`quote` |
| `citation`                                                               | 项目目录内的 BibTeX 文件，渲染进引用区                                   |
| `styles`、`scripts`                                                      | 项目专用 CSS、JS 的相对路径                                              |
| `favicon`                                                                | 项目图标的相对路径                                                       |
| `theme`                                                                  | CSS 变量名与十六进制颜色                                                 |
| `footer`                                                                 | 页脚的 `note`、`label`、`url`                                            |
| `social_title`、`social_description`                                     | 可选的分享标题与描述                                                     |

`card.image` 可以使用项目相对路径、站点绝对路径或外部 URL。普通文本自动转义，`_html` 字段保留 HTML。

尚未开放的资源使用 `disabled: true` 和 `status: "coming soon"`，省略 `href`。开放时添加链接并移除这两个字段。

## 正文与素材

`content.html` 是正文唯一来源。共用布局和页头不放在这里。

- `{{ assets }}` 展开为项目自己的 `assets` 目录。
- `{{ include:assets/figure.svg }}` 内嵌项目文件，用于 SVG 等素材。
- 用链接包裹图片可启用放大，参照 `starter/content.html`。
- TAPS 的图表数据、交互和专用排版放在 `projects/taps/`；共享模板不包含研究数据或 TAPS 专用布局。

## 校验

```bash
python3 templates/project-page/build.py projects/my-project --check
bundle exec jekyll build
```

渲染器检查缺失素材、重复 ID、章节锚点与循环引用。Jekyll 将配置、正文、构建脚本和 starter 留在源码中，只发布页面与运行时素材。源码变化会触发本地预览重新构建。

布局和字体许可见 [NOTICE.md](NOTICE.md) 与各字体目录中的许可文件。
