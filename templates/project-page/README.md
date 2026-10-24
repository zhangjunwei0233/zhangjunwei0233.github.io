# 项目页模板

所有项目共用本目录的渲染器、布局、CSS、JS 和字体。个人主页与项目页共用 `fonts.css` 中的字体声明和 `fonts/` 中的文件：Athletics 用于正文与标题，Tiempos Text 用于衬线文字，Maple Mono 用于代码。项目只保存自己的配置、正文和素材；生成的 HTML 只存在于 `_site/`。

## 新建项目

在仓库根目录运行：

```bash
cp -R templates/project-page/starter projects/my-project
bundle exec jekyll serve
```

修改 `projects/my-project/page.json`、`theme.json`、`content.html` 和 `assets/`。页面地址为 `/projects/my-project/`，Projects 卡片自动生成。

不要复制本目录的共用文件，也不要创建项目 `index.html` 或另一份卡片配置。

## 分工

| 位置                                                             | 职责                                         |
| ---------------------------------------------------------------- | -------------------------------------------- |
| `starter/`                                                       | 只含项目专用配置、正文、示例图；复制这一部分 |
| `starter/theme.json`                                             | 可复制的主题设置；目前只包含颜色             |
| `build.py`                                                       | 校验并渲染项目，输出到标准输出，不写源码     |
| `jekyll.rb`                                                      | 调用渲染器、生成卡片数据、阻止源码发布       |
| `page.html`                                                      | 共享页面骨架                                 |
| `fonts.css`、`style.css`、`site.js`、`fonts/`、`glass-grain.svg` | 共享运行时资源                               |
| `projects/<slug>/`                                               | 实际项目源码                                 |
| `_site/projects/<slug>/index.html`                               | Jekyll 生成的页面                            |

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
| `footer`                                                                 | 页脚的 `note`、`label`、`url`                                            |
| `social_title`、`social_description`                                     | 可选的分享标题与描述                                                     |

`card.image` 可以使用项目相对路径、站点绝对路径或外部 URL。普通文本自动转义，`_html` 字段保留 HTML。

尚未开放的资源使用 `disabled: true` 和 `status: "coming soon"`，省略 `href`。开放时添加链接并移除这两个字段。

## 主题风格

每个项目的 `theme.json` 是风格配置入口，与内容配置 `page.json` 分开。渲染器自动读取，不需要添加文件路径。

```json
{
  "colors": {
    "primary": "#2a709e",
    "accent": "#ac522d",
    "hero_background": "#102d44"
  }
}
```

| 字段                     | 默认值    | 用途                               |
| ------------------------ | --------- | ---------------------------------- |
| `colors.primary`         | `#2a709e` | 主色文字、导航强调、链接与键盘焦点 |
| `colors.accent`          | `#ac522d` | 重点文字、品牌点缀和辅助悬停强调   |
| `colors.hero_background` | `#102d44` | Hero/Banner 背景、浏览器主题色     |

正文或 `heading_html` 使用 `<span class="text-primary">主色文字</span>`、`<span class="text-accent">强调文字</span>`。项目专用 CSS 中对应变量为 `--primary`、`--accent`、`--hero-background`，不使用颜色名称作为主题字段或类名。

可以只填写需要覆盖的颜色；省略 `theme.json`、使用 `{}` 或省略部分颜色都会采用模板默认值。颜色接受 `#RGB` 或 `#RRGGBB`。错误的 JSON、未知字段或非法颜色会阻止构建，并给出文件名和具体字段，避免拼写错误被忽略。

主题设置不再放在 `page.json.theme` 中；旧字段会报错，避免两份配置并存。图表曲线、图例、图片和内嵌 SVG 的配色不随页面主题自动变化。TAPS 的三种图表颜色在其 `style.css` 中独立维护。

修改 `theme.json` 后，本地 Jekyll 会自动重新构建。配置文件只作为源码使用，发布目录中只包含渲染后的页面和运行时资源。

当前只支持 `colors`。未来可在 `theme.json` 中按需增加 `typography`、`spacing`、`radius` 等分组，并同步扩展渲染器校验；当前无需预留空字段。

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
