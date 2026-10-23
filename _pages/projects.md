---
layout: page
title: projects
permalink: /projects/
description: Research projects and the ideas behind them.
nav: true
nav_order: 3
---

<div class="projects">
  {% assign sorted_projects = site.projects | sort: "importance" %}
  <div class="row row-cols-1 row-cols-md-2">
    {% for project in sorted_projects %}
      {% include projects.liquid %}
    {% endfor %}
  </div>
</div>
