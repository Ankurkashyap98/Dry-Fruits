/* ==========================================================================
   NUTORIA — HOME PAGE CONTROLLER (V2 ULTRA-ROBUST & INTERACTIVE)
   Arch Parallax, Flowing Photo Stream, 3D Card Hover Tilt & Featured Showcase
   ========================================================================== */

(function () {
  'use strict';

  function getProducts() {
    if (typeof window !== 'undefined' && Array.isArray(window.NUTORIA_PRODUCTS) && window.NUTORIA_PRODUCTS.length > 0) {
      return window.NUTORIA_PRODUCTS;
    }
    if (typeof NUTORIA_PRODUCTS !== 'undefined' && Array.isArray(NUTORIA_PRODUCTS) && NUTORIA_PRODUCTS.length > 0) {
      return NUTORIA_PRODUCTS;
    }
    return [];
  }

  function getTestimonials() {
    if (typeof window !== 'undefined' && Array.isArray(window.NUTORIA_TESTIMONIALS) && window.NUTORIA_TESTIMONIALS.length > 0) {
      return window.NUTORIA_TESTIMONIALS;
    }
    if (typeof NUTORIA_TESTIMONIALS !== 'undefined' && Array.isArray(NUTORIA_TESTIMONIALS) && NUTORIA_TESTIMONIALS.length > 0) {
      return NUTORIA_TESTIMONIALS;
    }
    return [];
  }

  document.addEventListener('DOMContentLoaded', () => {
    initHeroParallax();
    initMagneticButtons();
    initCounterObserver();
    renderFeaturedProducts();
    initCard3DTilt();
    initTestimonialsSlider();

    // Polling retry for products
    if (getProducts().length === 0) {
      let tries = 0;
      const t = setInterval(() => {
        tries++;
        if (getProducts().length > 0 || tries > 15) {
          clearInterval(t);
          renderFeaturedProducts();
          initCard3DTilt();
        }
      }, 100);
    }
  });

  // 1. Mouse Parallax on Full-Bleed Background Image (±12px, lerp 0.08)
  function initHeroParallax() {
    const hero = document.querySelector('.home-hero');
    const bgImage = document.querySelector('.hero-bg-image');
    const goldGlow = document.querySelector('.hero-layer-gold-glow');

    if (!hero || !bgImage || window.innerWidth < 992) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      targetX = (e.clientX - rect.left) / rect.width - 0.5;
      targetY = (e.clientY - rect.top) / rect.height - 0.5;
    });

    hero.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
    });

    function loop() {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      if (bgImage) {
        bgImage.style.setProperty('--px', `${(currentX * -12).toFixed(2)}px`);
        bgImage.style.setProperty('--py', `${(currentY * -12).toFixed(2)}px`);
      }
      if (goldGlow) {
        goldGlow.style.transform = `translate(${(currentX * 20).toFixed(2)}px, ${(currentY * 20).toFixed(2)}px)`;
      }

      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  }

  // 2. Magnetic CTA (25% pull on mouse)
  function initMagneticButtons() {
    const magneticBtns = document.querySelectorAll('#hero-explore-btn, #hero-story-btn');
    if (window.innerWidth < 992) return;

    magneticBtns.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0px, 0px)';
      });
    });
  }

  // 3. Stats Counter Animation
  function initCounterObserver() {
    const statItems = document.querySelectorAll('.stat-num');
    if (!statItems.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-target'), 10) || 0;
          const suffix = el.getAttribute('data-suffix') || '';
          animateCounter(el, target, suffix);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.4 });

    statItems.forEach(item => observer.observe(item));
  }

  function animateCounter(el, target, suffix) {
    let start = 0;
    const duration = 1800;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(ease * target);

      el.innerHTML = `${current}<span>${suffix}</span>`;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.innerHTML = `${target}<span>${suffix}</span>`;
      }
    }

    requestAnimationFrame(update);
  }

  // 4. Render 6 Signature Featured Products
  function renderFeaturedProducts() {
    const container = document.getElementById('home-featured-grid');
    if (!container) return;

    const products = getProducts();
    if (!products.length) return;

    const featured = products.filter(p => p.isFeatured).slice(0, 6);

    container.innerHTML = featured.map(prod => `
      <article class="product-card reveal revealed" data-id="${prod.id}">
        <div class="product-media-wrap">
          <span class="product-badge-pill" style="color:${prod.accent || 'var(--gold)'}">${prod.badge || 'Royal Grade'}</span>
          <img src="${prod.image}" alt="${prod.name}" class="product-card-img" loading="lazy">
          <button type="button" class="product-quickview-trigger" onclick="NutoriaCart.openQuickView('${prod.id}')">
            ✦ Quick View
          </button>
        </div>
        <div class="product-content">
          <span class="product-category">${prod.categoryLabel}</span>
          <h3 class="product-title">${prod.name}</h3>
          <div class="product-rating">
            <span class="stars">★★★★★</span>
            <span>${prod.rating}</span>
          </div>
          <div class="product-footer">
            <div class="product-price">₹${prod.basePrice.toLocaleString('en-IN')}<span style="font-size:0.75rem; font-weight:500; color:var(--text-muted)"> /250g</span></div>
            <button type="button" class="product-add-btn" onclick="NutoriaCart.addItem('${prod.id}', '250g', 1)">
              Add to Bag
            </button>
          </div>
        </div>
      </article>
    `).join('');
  }

  // 5. 3D Card Hover Tilt Interaction
  function initCard3DTilt() {
    if (window.innerWidth < 992) return;
    const cards = document.querySelectorAll('.product-card, .pillar-card, .category-card');

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const deltaX = (x - centerX) / centerX;
        const deltaY = (y - centerY) / centerY;

        card.style.transform = `perspective(800px) rotateY(${deltaX * 6}deg) rotateX(${-deltaY * 6}deg) translateY(-6px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // 6. Testimonials Slider
  function initTestimonialsSlider() {
    const container = document.getElementById('testimonials-container');
    const dotsContainer = document.getElementById('testimonials-dots');
    const prevBtn = document.getElementById('test-prev-btn');
    const nextBtn = document.getElementById('test-next-btn');

    const items = getTestimonials();
    if (!container || !items.length) return;

    let currentIndex = 0;
    let timer = null;

    container.innerHTML = items.map((t, idx) => `
      <div class="testimonial-card ${idx === 0 ? 'active' : ''}" data-index="${idx}">
        <div class="test-stars">★★★★★</div>
        <blockquote class="test-quote">"${t.quote}"</blockquote>
        <div class="test-author-row">
          <img src="${t.avatar}" alt="${t.name}" class="test-avatar" loading="lazy">
          <div class="test-author-info">
            <h4 class="test-author-name">${t.name}</h4>
            <div class="test-author-title">${t.title}</div>
            <span class="test-verified-badge">✦ ${t.verified}</span>
          </div>
        </div>
      </div>
    `).join('');

    if (dotsContainer) {
      dotsContainer.innerHTML = items.map((_, idx) => `
        <button type="button" class="slider-dot ${idx === 0 ? 'active' : ''}" data-index="${idx}" aria-label="Review ${idx + 1}"></button>
      `).join('');

      dotsContainer.querySelectorAll('.slider-dot').forEach(dot => {
        dot.addEventListener('click', () => {
          goToSlide(parseInt(dot.getAttribute('data-index'), 10));
        });
      });
    }

    function goToSlide(index) {
      const cards = container.querySelectorAll('.testimonial-card');
      const dots = dotsContainer ? dotsContainer.querySelectorAll('.slider-dot') : [];

      cards.forEach(c => c.classList.remove('active'));
      dots.forEach(d => d.classList.remove('active'));

      currentIndex = (index + items.length) % items.length;

      if (cards[currentIndex]) cards[currentIndex].classList.add('active');
      if (dots[currentIndex]) dots[currentIndex].classList.add('active');
    }

    if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));

    function startAutoPlay() {
      stopAutoPlay();
      timer = setInterval(() => goToSlide(currentIndex + 1), 5000);
    }

    function stopAutoPlay() {
      if (timer) clearInterval(timer);
    }

    container.addEventListener('mouseenter', stopAutoPlay);
    container.addEventListener('mouseleave', startAutoPlay);

    startAutoPlay();
  }

})();
