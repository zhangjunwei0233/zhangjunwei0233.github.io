'use strict';
(() => {
  const data = window.PROJECT_CHART;
  const slider = document.getElementById('coverage');
  if (data && slider) {
    const x = c => 75 + c * 6.78;
    const y = r => 440 - r * 5.6;
    const baselines = data.points || [];
    const snapRange = .55; // Coverage percentage points, about two pixels on desktop.
    const baselineRisk = document.getElementById('abstention-risk');
    const highlight = document.getElementById('baseline-highlight');
    const nearestBaseline = coverage => {
      const nearest = baselines.reduce((best, point) => !best ||
        Math.abs(point.coverage - coverage) < Math.abs(best.coverage - coverage) ? point : best, null);
      return nearest && Math.abs(nearest.coverage - coverage) <= snapRange ? nearest : null;
    };
    const update = () => {
      const i = Math.max(0, Math.min(data.count - 1, Number(slider.value) - 1));
      const coverage = (i + 1) / data.count * 100;
      const pre = data.curves[0][i];
      const post = data.curves[1][i];
      const baseline = nearestBaseline(coverage);
      document.getElementById('coverage-value').textContent = `${coverage.toFixed(2)}%`;
      const baselineDescription = baseline ? `${baseline.label} risk ${baseline.risk.toFixed(1)} percent at ${baseline.coverage.toFixed(2)} percent coverage` : 'no abstention-training point nearby';
      slider.setAttribute('aria-valuetext', `${coverage.toFixed(2)} percent coverage; TAPS risk ${post.toFixed(1)} percent; selective answering risk ${pre.toFixed(1)} percent; ${baselineDescription}`);
      document.getElementById('selective-risk').innerHTML = `${pre.toFixed(1)}<small>%</small>`;
      document.getElementById('taps-risk').innerHTML = `${post.toFixed(1)}<small>%</small>`;
      baselineRisk.innerHTML = baseline ? `${baseline.risk.toFixed(1)}<small>%</small>` : '--';
      baselineRisk.title = baseline ? `${baseline.label} at ${baseline.coverage.toFixed(2)}% coverage` : 'No abstention-training point at this coverage';
      highlight.setAttribute('opacity', baseline ? '1' : '0');
      if (baseline) {
        highlight.setAttribute('cx', x(baseline.coverage));
        highlight.setAttribute('cy', y(baseline.risk));
      }
      const guide = document.getElementById('chart-guide');
      guide.setAttribute('x1', x(coverage)); guide.setAttribute('x2', x(coverage));
      for (const [id, risk] of [['selective', pre], ['taps', post]]) {
        const point = document.getElementById(`${id}-point`);
        point.setAttribute('cx', x(coverage)); point.setAttribute('cy', y(risk));
      }
      document.getElementById('chart-desc').textContent = `Risk versus coverage on Qwen3-8B / NQ. At ${coverage.toFixed(2)} percent coverage, selective answering has ${pre.toFixed(1)} percent risk and TAPS has ${post.toFixed(1)} percent risk; ${baselineDescription}. Purple squares are fixed abstention-trained models.`;
    };
    slider.max = data.count;
    slider.min = Math.ceil(data.count / 100);
    slider.value = data.initial;
    document.querySelector('.coverage-control').hidden = false;
    update();

    let userControlled = false;
    let keyboardStepping = false;
    let frame = 0;
    const stopPreview = () => {
      userControlled = true;
      cancelAnimationFrame(frame);
    };
    slider.addEventListener('pointerdown', () => {keyboardStepping = false; stopPreview();});
    slider.addEventListener('focus', stopPreview);
    slider.addEventListener('keydown', () => {keyboardStepping = true; stopPreview();});
    slider.addEventListener('keyup', () => {keyboardStepping = false;});
    slider.addEventListener('input', () => {
      stopPreview();
      const coverage = Number(slider.value) / data.count * 100;
      const baseline = nearestBaseline(coverage);

      if (baseline && !keyboardStepping) slider.value = baseline.count;
      update();
    });

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const previewBounds = document.querySelector('.hero-result').getBoundingClientRect();
    let inView = previewBounds.bottom > 0 && previewBounds.top < window.innerHeight;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {inView = entries[0].isIntersecting;}, {threshold: .01})
        .observe(document.querySelector('.hero-result'));
    } else inView = true;
    const startPhase = Math.asin((data.initial / data.count * 100 - 50) / 38);
    let elapsed = 0;
    let previousTime = 0;
    const animate = now => {
      if (userControlled) return;
      const delta = previousTime ? Math.min(now - previousTime, 64) : 0;
      previousTime = now;
      if (inView && !document.hidden && !motion.matches) {
        elapsed += delta;

        const phase = startPhase + elapsed / 12000 * Math.PI * 2;
        slider.value = Math.round((50 + 38 * Math.sin(phase)) / 100 * data.count);
        update();
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
  }

})();
