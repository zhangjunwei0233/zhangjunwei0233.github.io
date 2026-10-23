# Junwei Zhang's personal website

Jekyll 个人主页：<https://zhangjunwei0233.github.io/>。

## 目录

```text
_pages/                     主页、Publications、Projects、CV 等页面
_bibliography/papers.bib    论文信息
_news/                      新闻与公告
projects/<slug>/            每个项目的配置、正文与素材
  page.json                 标题、作者、资源链接和项目卡片信息
  content.html              正文的唯一来源
  assets/                   项目专用素材
  ...                       可选的项目专用 CSS、JS、引用文件
templates/project-page/     共用渲染器、布局、CSS、JS、字体
  starter/                  新项目的可复制起点
_plugins/project-pages.rb   Jekyll 集成入口
_site/                      构建产物，Git 忽略，部署时发布
```

源码目录不存放生成的项目 `index.html`。页面和 Projects 卡片都从项目配置自动生成。

## 本地运行

需要 Ruby/Bundler、Python 3.9+ 和 Node.js；Node.js 用于格式检查和前端资源工具。

```bash
bundle install
npm ci
bundle exec jekyll serve
```

打开 <http://localhost:4000/>。修改项目配置、正文或共享模板后，Jekyll 会自动重新构建。

修改 Jekyll 集成的 Ruby 代码或 `_config.yml` 后，需要重启本地服务。

## 新增项目

```bash
cp -R templates/project-page/starter projects/my-project
```

修改 `projects/my-project/page.json`、`content.html` 和素材即可。项目地址自动成为 `/projects/my-project/`，并自动加入 Projects 页面。

详细字段和模板约定见 [项目模板说明](templates/project-page/README.md)。

## 验证与部署

```bash
bundle exec jekyll build
npx prettier . --check
python3 templates/project-page/build.py projects/taps --check
```

GitHub Actions 使用相同的 Jekyll 构建流程，只发布 `_site/`。无需另外运行项目生成脚本，也无需提交生成的 HTML。

基于 [al-folio](https://github.com/alshedivat/al-folio)。项目模板的来源和字体许可见 [NOTICE](templates/project-page/NOTICE.md)。
