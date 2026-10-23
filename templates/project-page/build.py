#!/usr/bin/env python3
"""Build a static page using the shared template. Python standard library only."""
import argparse
import html
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import sys
from urllib.parse import quote, unquote, urlsplit

TEMPLATE = Path(__file__).resolve().parent
TOKEN = re.compile(r'{{\s*([^{}]+?)\s*}}')
ICONS = {'book', 'poster', 'quote'}


def local_file(project, name):
    path = (project / name).resolve()
    if not path.is_relative_to(project.resolve()) or not path.is_file():
        raise ValueError(f'Missing project file: {name}')
    return path


def project_url(project, value):
    if urlsplit(value).scheme or value.startswith(('#', '/')):
        if urlsplit(value).scheme not in ('', 'http', 'https', 'mailto'):
            raise ValueError(f'Unsupported URL: {value}')
        return value
    local_file(project, unquote(urlsplit(value).path))
    return value


def expand_content(project, source, stack=()):
    def replace(match):
        key = match[1]
        if key == 'assets':
            return 'assets'
        if key.startswith('include:'):
            name = key.split(':', 1)[1].strip()
            if name in stack:
                raise ValueError(f'Circular include: {name}')
            return expand_content(project, local_file(project, name).read_text(), stack + (name,))
        raise ValueError(f'Unknown content token: {key}')
    return TOKEN.sub(replace, source)


class PageCheck(HTMLParser):
    def __init__(self, project):
        super().__init__()
        self.project = project
        self.ids = set()
        self.references = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            if attrs['id'] in self.ids:
                raise ValueError(f'Duplicate ID: {attrs["id"]}')
            self.ids.add(attrs['id'])
        for key in ('src', 'href'):
            if attrs.get(key):
                self.references.append(attrs[key])

    def verify(self, source):
        self.feed(source)
        for reference in self.references:
            url = urlsplit(reference)
            if url.scheme or url.netloc or url.path.startswith('/'):
                continue
            if url.path and not (self.project / unquote(url.path)).is_file():
                raise ValueError(f'Missing asset: {reference}')
            if not url.path and url.fragment and url.fragment not in self.ids:
                raise ValueError(f'Missing section: {reference}')


def render(project):
    project = project.resolve()
    config = json.loads(local_file(project, 'page.json').read_text())
    escape = lambda value: html.escape(str(value), quote=True)
    navigation = config.get('navigation', [])
    nav_html = ''.join(f'<a href="#{escape(item["id"])}"' +
                       (' class="compact-hide"' if item.get('compact_hide') else '') +
                       f'>{escape(item["label"])}</a>' for item in navigation)
    navigation_action = config.get('navigation_action')
    action_html = ''
    if navigation_action:
        action_html = (f'<a class="nav-action" href="{escape(project_url(project, navigation_action["href"]))}">'
                       f'{escape(navigation_action["label"])}</a>')
    links = []
    for item in config.get('resources', []):
        icon = item.get('icon', '')
        if icon and icon not in ICONS:
            raise ValueError(f'Unknown resource icon: {icon}')
        glyph = f'<i class="resource-glyph glyph-{icon}" aria-hidden="true"></i> ' if icon else ''
        links.append(f'<a class="button" href="{escape(project_url(project, item["href"]))}">{glyph}'
                     f'<span class="resource-label">{escape(item["label"])}</span></a>')
    theme = config.get('theme', {})
    if any(not re.fullmatch(r'[a-z][a-z0-9-]*', key) or not re.fullmatch(r'#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?', value)
           for key, value in theme.items()):
        raise ValueError('Theme entries must be CSS variable names and hex colors')
    citation = ''
    if config.get('citation'):
        bibtex = escape(local_file(project, config['citation']).read_text())
        citation = ('  <div class="citation-block prose" id="citation" aria-label="Citation and resources">\n'
                    '    <div class="citation-toolbar"><p class="section-index">BIBTEX</p>'
                    '<button id="copy-citation" type="button" aria-live="polite" hidden>Copy citation</button></div>\n'
                    f'    <pre><code id="bibtex">{bibtex}</code></pre>\n'
                    '    <p id="copy-status" role="status" aria-live="polite"></p>\n  </div>')
    footer = config.get('footer', {})
    footer_html = ''
    if footer:
        note = f'<span class="site-note">{escape(footer.get("note", ""))}</span>'
        credit = f'<a href="{escape(project_url(project, footer["url"]))}">{escape(footer["label"])}</a>'
        footer_html = f'  <div class="site-credit">{note}{credit}</div>'
    template_url = quote(Path(os.path.relpath(TEMPLATE, project)).as_posix(), safe='/.')
    values = {
        'template': escape(template_url),
        'title': escape(config['title']), 'description': escape(config.get('description', '')),
        'social_title': escape(config.get('social_title', config['title'])),
        'social_description': escape(config.get('social_description', config.get('description', ''))),
        'name': escape(config['name']), 'theme_color': escape(theme.get('navy', '#102d44')),
        'first_section': '#' + escape(navigation[0]['id']) if navigation else '#top',
        'navigation': nav_html, 'navigation_action': action_html,
        'heading': config.get('heading_html', escape(config['title'])),
        'authors': '', 'affiliations': '', 'author_notes': '',
        'resources': '<div class="resource-links">' + ''.join(links) + '</div>' if links else '',
        'favicon': f'<link rel="icon" type="image/svg+xml" href="{escape(project_url(project, config["favicon"]))}">' if config.get('favicon') else '',
        'theme': '<style>:root {' + ''.join(f'--{key}:{value};' for key, value in theme.items()) + '}</style>' if theme else '',
        'styles': '\n  '.join(f'<link rel="stylesheet" href="{escape(project_url(project, value))}">' for value in config.get('styles', [])),
        'scripts': '\n  '.join(f'<script defer src="{escape(project_url(project, value))}"></script>' for value in config.get('scripts', [])),
        'content': expand_content(project, local_file(project, 'content.html').read_text()),
        'citation': citation, 'footer': footer_html,
    }
    for key, cls in [('authors', 'authors'), ('affiliations', 'affiliations'), ('author_notes', 'author-notes')]:
        if config.get(key + '_html'):
            values[key] = f'<p class="{cls}">{config[key + "_html"]}</p>'
    source = TOKEN.sub(lambda match: values[match[1]], (TEMPLATE / 'page.html').read_text())
    PageCheck(project).verify(source)
    return source


def initialize(project):
    project.mkdir(parents=True, exist_ok=False)
    (project / 'assets').mkdir()
    config = {'name': 'Project', 'title': 'Project title', 'description': 'A short project summary.',
              'heading_html': 'Project title', 'authors_html': 'Author name',
              'navigation': [{'id': 'overview', 'label': 'Overview'}], 'resources': []}
    (project / 'page.json').write_text(json.dumps(config, indent=2) + '\n')
    (project / 'content.html').write_text('''  <section class="story-section" id="overview" aria-labelledby="overview-title">
    <div class="prose container blog">
      <p class="section-index">01 / OVERVIEW</p>
      <h2 id="overview-title">Introduce the project.</h2>
      <p class="text">Replace this paragraph with your content.</p>
    </div>
  </section>
''')
    print(f'Created {project}')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('project', nargs='?', type=Path, help='Project source directory')
    parser.add_argument('--init', metavar='DIRECTORY', type=Path, help='Create a minimal project')
    parser.add_argument('--check', action='store_true', help='Validate and check the generated entry page')
    args = parser.parse_args()
    if args.init:
        initialize(args.init.resolve())
        return
    if args.project is None:
        parser.error('provide a project directory, or use --init DIRECTORY')
    project = args.project.resolve()
    source = render(project)
    output = project / 'index.html'
    if args.check:
        if not output.exists() or output.read_text() != source:
            raise ValueError('index.html is out of date; run the build command')
        print(f'{project.name}: page and asset references verified')
    else:
        output.write_text(source)
        print(f'Built {output}')


if __name__ == '__main__':
    try:
        main()
    except (ValueError, KeyError, OSError) as error:
        sys.exit(str(error))
