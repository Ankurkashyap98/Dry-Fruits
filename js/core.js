/* ==========================================================================
   NUTORIA — CORE CONTROLLER
   Loader, Sticky Glass Navbar, Mobile Drawer, Active Links, Reveal Observer & Toast Engine
   ========================================================================== */

(function () {
  'use strict';

  // 1. Splash Loader (fades out after 1.8s)
  window.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('global-loader');
    if (loader) {
      setTimeout(() => {
        loader.classList.add('loaded');
        setTimeout(() => {
          if (loader.parentNode) loader.parentNode.removeChild(loader);
        }, 700);
      }, 1600);
    }

    // Active Navigation Highlight based on location.pathname
    setupActiveNav();

    // Scroll Navbar Effect
    setupScrollNavbar();

    // Mobile Drawer Setup
    setupMobileNav();

    // Intersection Observer for Smooth Reveal Animations
    setupScrollReveal();

    // Global Image Error Fallback Handler
    setupImageFallbacks();

    // Newsletter Submissions
    setupNewsletterForms();
  });

  // Active Navigation detection
  function setupActiveNav() {
    const currentPath = window.location.pathname.replace(/\/index\.html$/, '/');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

    navLinks.forEach(link => {
      const linkPath = link.getAttribute('href');
      if (!linkPath) return;

      // Handle root vs inner path matching
      const isHome = (currentPath === '/' || currentPath === '' || currentPath.endsWith('/nutoria/')) && (linkPath === '/' || linkPath === './');
      const isMatch = currentPath.includes(linkPath) && linkPath !== '/';

      if (isHome || isMatch) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // Sticky Glass Navbar after 60px scroll
  function setupScrollNavbar() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const onScroll = () => {
      if (window.scrollY > 60) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Mobile Drawer Navigation
  function setupMobileNav() {
    const menuToggle = document.querySelector('.menu-toggle-btn');
    const drawer = document.querySelector('.mobile-nav-drawer');
    const backdrop = document.querySelector('.mobile-nav-backdrop');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    if (!menuToggle || !drawer || !backdrop) return;

    const toggleDrawer = (open) => {
      const isOpen = open !== undefined ? open : !drawer.classList.contains('open');
      drawer.classList.toggle('open', isOpen);
      backdrop.classList.toggle('open', isOpen);
      menuToggle.classList.toggle('is-active', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    menuToggle.addEventListener('click', () => toggleDrawer());
    backdrop.addEventListener('click', () => toggleDrawer(false));
    mobileLinks.forEach(l => l.addEventListener('click', () => toggleDrawer(false)));
  }

  // IntersectionObserver for Staggered Scroll Reveal
  function setupScrollReveal() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.12
    });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  // Image Fallback Handling to Luxury Gradient
  function setupImageFallbacks() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      img.addEventListener('error', function () {
        this.classList.add('img-fallback');
        this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%230A2417'/%3E%3Cstop offset='50%25' stop-color='%2314402A'/%3E%3Cstop offset='100%25' stop-color='%23B88E38'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3Ctext x='50%25' y='50%25' fill='%23FAF7F2' font-family='serif' font-size='20' text-anchor='middle' dy='.3em'%3ENUTORIA RESERVE%3C/text%3E%3C/svg%3E";
      });
    });
  }

  // Global Newsletter Handler
  function setupNewsletterForms() {
    const forms = document.querySelectorAll('.newsletter-form');
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('.newsletter-input');
        if (input && input.value.trim() && input.value.includes('@')) {
          showToast('VIP Privileges Unlocked', 'You are now enrolled in the Nutoria Private Harvest Gazette.', 'success');
          input.value = '';
        } else {
          showToast('Invalid Email', 'Please provide a valid email address.', 'error');
        }
      });
    });
  }

  // Toast Notification System (Global helper)
  window.showToast = function (title, message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    
    const iconSymbol = type === 'success' ? '✦' : (type === 'error' ? '!' : '★');
    
    toast.innerHTML = `
      <div class="toast-icon">${iconSymbol}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
    `;

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Auto dismiss after 3.8s
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 400);
    }, 3800);
  };

})();
