(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var frame = 0;
  var cleanupTimer = 0;

  function getTitle() {
    return document.querySelector('main h1');
  }

  function setState(value) {
    document.documentElement.dataset.titleRipple = value;
  }

  function removeRipple(title, svg) {
    if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    if (cleanupTimer) {
      clearTimeout(cleanupTimer);
      cleanupTimer = 0;
    }
    if (title) {
      title.style.removeProperty('filter');
      title.style.removeProperty('will-change');
    }
    if (svg && svg.parentNode) svg.remove();
  }

  function amplitudeFor(title) {
    var length = (title.textContent || '').trim().length;
    if (length > 48) return 7;
    if (length > 28) return 10;
    return 16;
  }

  function playRipple() {
    var title = getTitle();
    if (!title) {
      setState('unavailable');
      return;
    }

    // Projects owns the original, longer version of this same water effect.
    if (title.classList.contains('pool-title')) {
      setState(reduceMotion ? 'reduced' : 'project-native');
      return;
    }

    if (reduceMotion) {
      setState('reduced');
      return;
    }

    var previous = document.getElementById('page-title-ripple-defs');
    removeRipple(title, previous);

    var namespace = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(namespace, 'svg');
    var defs = document.createElementNS(namespace, 'defs');
    var filter = document.createElementNS(namespace, 'filter');
    var turbulence = document.createElementNS(namespace, 'feTurbulence');
    var displacement = document.createElementNS(namespace, 'feDisplacementMap');

    svg.id = 'page-title-ripple-defs';
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';

    filter.id = 'page-title-ripple-filter';
    filter.setAttribute('x', '-30%');
    filter.setAttribute('y', '-35%');
    filter.setAttribute('width', '160%');
    filter.setAttribute('height', '170%');

    turbulence.setAttribute('type', 'fractalNoise');
    turbulence.setAttribute('baseFrequency', '0.04 0.09');
    turbulence.setAttribute('numOctaves', '2');
    turbulence.setAttribute('seed', '7');
    turbulence.setAttribute('result', 'noise');

    displacement.setAttribute('in', 'SourceGraphic');
    displacement.setAttribute('in2', 'noise');
    displacement.setAttribute('scale', String(amplitudeFor(title)));
    displacement.setAttribute('xChannelSelector', 'R');
    displacement.setAttribute('yChannelSelector', 'G');

    filter.appendChild(turbulence);
    filter.appendChild(displacement);
    defs.appendChild(filter);
    svg.appendChild(defs);
    document.body.prepend(svg);

    title.style.willChange = 'filter';
    title.style.filter = 'url(#page-title-ripple-filter)';
    setState('active');

    var duration = 820;
    var start = performance.now();
    var amplitude = amplitudeFor(title);

    function settle(now) {
      var progress = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var remaining = 1 - eased;
      var frequencyX = 0.012 + 0.028 * remaining;
      var frequencyY = 0.03 + 0.06 * remaining;

      turbulence.setAttribute(
        'baseFrequency',
        frequencyX.toFixed(4) + ' ' + frequencyY.toFixed(4)
      );
      displacement.setAttribute('scale', (amplitude * remaining).toFixed(2));

      if (progress < 1) {
        frame = requestAnimationFrame(settle);
        return;
      }

      frame = 0;
      removeRipple(title, svg);
      setState('settled');
    }

    frame = requestAnimationFrame(settle);
    cleanupTimer = window.setTimeout(function () {
      removeRipple(title, svg);
      setState('settled');
    }, duration + 180);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', playRipple, { once: true });
  } else {
    playRipple();
  }

  window.addEventListener('pageshow', function (event) {
    if (event.persisted) playRipple();
  });
})();
