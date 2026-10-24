---
layout: page
permalink: /publications/
title: Publications
description: Preprints and published papers.
nav: true
nav_order: 2
---

<!-- _pages/publications.md -->

<!-- Bibsearch Feature -->

{% include bib_search.liquid %}

<div class="publications publication-groups">

<h2 class="bibliography">Preprints</h2>

{% bibliography --group_by none --query @*[abbr=arXiv]* %}

{% bibliography --query @*[abbr!=arXiv]* %}

</div>
