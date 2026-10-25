'use strict';
(() => {
  const nav = document.querySelector('.site-header nav');
  if (nav) {
    const entries = Array.from(nav.querySelectorAll('a[href^="#"]'))
      .map(link => ({link, section: document.getElementById(link.hash.slice(1))}))
      .filter(entry => entry.section);
    const indicator = document.createElement('span');
    indicator.className = 'nav-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    nav.appendChild(indicator);
    let queued = false;
    let destination = null;
    let settleTimer = null;

    const drawNavigation = current => {
      for (const entry of entries) {
        if (entry === current) entry.link.setAttribute('aria-current', 'location');
        else entry.link.removeAttribute('aria-current');
      }
      if (!current || !current.link.getClientRects().length) {
        indicator.style.opacity = '0';
        return;
      }
      const linkRect = current.link.getBoundingClientRect();
      const navRect = nav.getBoundingClientRect();
      const width = Math.max(14, linkRect.width * .7);
      const left = linkRect.left - navRect.left + (linkRect.width - width) / 2;
      indicator.style.width = `${width}px`;
      indicator.style.transform = `translateX(${left}px)`;
      indicator.style.opacity = '1';
    };
    const syncNavigation = () => {
      queued = false;


      if (destination) {
        drawNavigation(destination);
        return;
      }
      const threshold = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 78;
      let current = null;
      for (const entry of entries) {
        if (entry.section.getBoundingClientRect().top <= threshold + 2) current = entry;
      }
      if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        current = entries[entries.length - 1] || null;
      }
      drawNavigation(current);
    };
    const scheduleNavigation = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(syncNavigation);
    };
    const resumeTracking = () => {
      clearTimeout(settleTimer);
      settleTimer = null;
      destination = null;
      scheduleNavigation();
    };
    for (const entry of entries) {
      entry.link.addEventListener('click', event => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        clearTimeout(settleTimer);
        destination = entry;
        drawNavigation(entry);


        settleTimer = setTimeout(resumeTracking, 1600);
      });
    }
    window.addEventListener('scroll', () => {
      if (destination) {
        clearTimeout(settleTimer);
        settleTimer = setTimeout(resumeTracking, 150);
      }
      scheduleNavigation();
    }, {passive: true});

    window.addEventListener('wheel', resumeTracking, {passive: true});
    window.addEventListener('touchstart', resumeTracking, {passive: true});
    window.addEventListener('pointerdown', event => {
      if (event.target instanceof Element && !event.target.closest('.site-header nav')) resumeTracking();
    }, {passive: true});
    window.addEventListener('keydown', event => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) resumeTracking();
    });
    window.addEventListener('resize', scheduleNavigation);
    window.addEventListener('hashchange', () => {
      if (destination && location.hash !== destination.link.hash) resumeTracking();
      else scheduleNavigation();
    });
    window.addEventListener('pageshow', resumeTracking);
    window.addEventListener('load', scheduleNavigation);
    if (window.ResizeObserver) new ResizeObserver(scheduleNavigation).observe(nav);
    if (document.fonts) document.fonts.ready.then(scheduleNavigation);
    syncNavigation();
  }

  const copy = document.getElementById('copy-citation');
  if (copy) {
    copy.hidden = false;
    copy.addEventListener('click', async () => {
      const status = document.getElementById('copy-status');
      const code = document.getElementById('bibtex');
      status.textContent = '';
      try {
        await navigator.clipboard.writeText(code.textContent);
        copy.textContent = 'Copied ✓';
        status.textContent = '';
        window.setTimeout(() => {copy.textContent = 'Copy citation';}, 2000);
      } catch {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(code); selection.removeAllRanges(); selection.addRange(range);
        status.textContent = 'Citation selected. Press Ctrl+C or ⌘C to copy.';
      }
    });
  }
})();
