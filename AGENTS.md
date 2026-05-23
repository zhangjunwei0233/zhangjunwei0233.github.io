# Repository Guidelines

## Project Structure & Module Organization

This repository is a Jekyll-based personal site derived from al-folio. Main configuration lives in `_config.yml`; update it for site metadata, navigation, analytics, and feature flags. Content collections are split by purpose: `_pages/` for top-level pages, `_posts/` for dated blog posts, `_projects/` for portfolio entries, `_news/` for announcements, `_books/` for book notes, and `_bibliography/papers.bib` for publications. Layout and rendering code lives in `_layouts/`, `_includes/`, `_plugins/`, `_sass/`, and `_scripts/`. Static files belong in `assets/`, grouped by type such as `assets/json/`, `assets/fonts/`, and `assets/audio/`.

## Build, Test, and Development Commands

- `bundle install`: install Ruby and Jekyll dependencies from `Gemfile`.
- `npm install`: install Prettier and the Liquid formatting plugin.
- `pip install jupyter`: required for notebook-backed Jekyll content.
- `bundle exec jekyll serve`: run the site locally at `http://localhost:4000`.
- `bundle exec jekyll build`: generate the production site in `_site/`.
- `npx prettier . --check`: verify formatting before committing.
- `npx prettier . --write`: apply formatting fixes.

Docker-based workflows are also available through `docker-compose.yml` and `docker-compose-slim.yml` when local Ruby setup is inconvenient.

## Coding Style & Naming Conventions

Use Prettier for Markdown, Liquid, YAML, JavaScript, and styles. The repo config uses `@shopify/prettier-plugin-liquid`, `printWidth: 150`, and ES5 trailing commas. Prefer two-space indentation in YAML and Liquid-style files unless the surrounding file clearly uses another convention. Name posts as `YYYY-MM-DD-title.md`; keep collection entries short, lowercase, and descriptive. Preserve existing front matter keys and Liquid include patterns when editing content.

## Testing Guidelines

There are no unit tests in this site. Validate changes by building locally with `bundle exec jekyll build`, checking formatting with `npx prettier . --check`, and reviewing affected pages in `bundle exec jekyll serve`. For link-heavy changes, run or mirror the GitHub Actions lychee broken-link check. For visible UI changes, inspect desktop and mobile layouts and consider the manual Axe workflow in `.github/workflows/axe.yml`.

## Commit & Pull Request Guidelines

Recent commits use short imperative summaries such as `Update CV` and `Fix typo`; follow that style. Keep commits focused on one content or behavior change. Pull requests should include a concise description, affected pages or files, validation commands run, linked issues when relevant, and screenshots for visual changes. Avoid committing generated `_site/` output or unrelated formatting churn.
