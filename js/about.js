/* ==========================================================================
   NUTORIA — ABOUT PAGE CONTROLLER
   Interactive Sourcing Map Hotspots, Region Focus & Timeline Highlights
   ========================================================================== */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initSourcingMapInteractivity();
  });

  function initSourcingMapInteractivity() {
    const pins = document.querySelectorAll('.map-pin');
    const cards = document.querySelectorAll('.sourcing-card');

    pins.forEach(pin => {
      pin.addEventListener('mouseenter', () => {
        const region = pin.getAttribute('data-region');
        highlightRegion(region);
      });

      pin.addEventListener('click', () => {
        const region = pin.getAttribute('data-region');
        highlightRegion(region);
        showToast('Terroir Sourcing Note', `Inspected origin: ${region}. Guaranteed 100% single-estate provenance.`, 'info');
      });
    });

    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        const region = card.getAttribute('data-region');
        highlightRegion(region);
      });
    });

    function highlightRegion(region) {
      cards.forEach(c => {
        if (c.getAttribute('data-region') === region) {
          c.style.borderColor = 'var(--gold-light)';
          c.style.transform = 'translateY(-6px)';
          c.style.background = 'rgba(255, 255, 255, 0.18)';
        } else {
          c.style.borderColor = 'rgba(184, 142, 56, 0.3)';
          c.style.transform = '';
          c.style.background = 'rgba(255, 255, 255, 0.06)';
        }
      });
    }
  }

})();
