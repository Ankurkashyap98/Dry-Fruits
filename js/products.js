/* ==========================================================================
   NUTORIA — PRODUCTS CATALOG CONTROLLER (V2 ULTRA-ROBUST)
   Instant Rendering, Category Filtering, Live Search, Weight Steppers & Quick View
   ========================================================================== */

(function () {
  'use strict';

  let currentCategory = 'all';
  let searchQuery = '';
  let currentSort = 'featured';
  let productWeightState = {};

  function getProductDataset() {
    if (typeof window !== 'undefined' && Array.isArray(window.NUTORIA_PRODUCTS) && window.NUTORIA_PRODUCTS.length > 0) {
      return window.NUTORIA_PRODUCTS;
    }
    if (typeof NUTORIA_PRODUCTS !== 'undefined' && Array.isArray(NUTORIA_PRODUCTS) && NUTORIA_PRODUCTS.length > 0) {
      return NUTORIA_PRODUCTS;
    }
    return [];
  }

  function initCatalog() {
    // Check URL search parameters (e.g. ?cat=almonds)
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('cat');
    if (catParam) {
      currentCategory = catParam;
      const tab = document.querySelector(`.cat-tab-btn[data-category="${catParam}"]`);
      if (tab) {
        document.querySelectorAll('.cat-tab-btn').forEach(b => b.classList.remove('active'));
        tab.classList.add('active');
      }
    }

    renderCatalog();

    // Secondary safety re-check in case data was loaded asynchronously
    if (getProductDataset().length === 0) {
      let retries = 0;
      const interval = setInterval(() => {
        retries++;
        if (getProductDataset().length > 0 || retries > 15) {
          clearInterval(interval);
          renderCatalog();
        }
      }, 100);
    }
  }

  function bindFilterEvents() {
    // Category tabs
    const tabs = document.querySelectorAll('.cat-tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentCategory = tab.getAttribute('data-category');
        renderCatalog();
      });
    });

    // Search input
    const searchInput = document.getElementById('catalog-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        renderCatalog();
      });
    }

    // Sort menu
    const sortSelect = document.getElementById('catalog-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderCatalog();
      });
    }
  }

  function getFilteredProducts() {
    let list = [...getProductDataset()];

    if (currentCategory !== 'all') {
      list = list.filter(p => p.category === currentCategory);
    }

    if (searchQuery) {
      list = list.filter(p => 
        (p.name && p.name.toLowerCase().includes(searchQuery)) ||
        (p.categoryLabel && p.categoryLabel.toLowerCase().includes(searchQuery)) ||
        (p.origin && p.origin.toLowerCase().includes(searchQuery)) ||
        (p.desc && p.desc.toLowerCase().includes(searchQuery))
      );
    }

    if (currentSort === 'price-low') {
      list.sort((a, b) => a.basePrice - b.basePrice);
    } else if (currentSort === 'price-high') {
      list.sort((a, b) => b.basePrice - a.basePrice);
    } else if (currentSort === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else {
      list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return list;
  }

  function renderCatalog() {
    const grid = document.getElementById('catalog-products-grid');
    const countEl = document.getElementById('catalog-results-counter');
    if (!grid) return;

    const products = getFilteredProducts();

    if (countEl) {
      countEl.textContent = `Displaying ${products.length} Masterpiece ${products.length === 1 ? 'Selection' : 'Selections'}`;
    }

    if (products.length === 0) {
      grid.innerHTML = `
        <div class="catalog-empty-results">
          <h3>No Rare Harvest Matches Found</h3>
          <p style="color:var(--text-muted); margin-bottom:1.5rem">We could not locate any item matching your query. Adjust your search or filters.</p>
          <button type="button" class="btn btn-secondary" onclick="resetFilters()">Reset All Filters</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = products.map(prod => {
      const currentWeight = productWeightState[prod.id] || '250g';
      const mult = (window.NutoriaCart && window.NutoriaCart.WEIGHT_MULTIPLIERS[currentWeight]) || 1.0;
      const currentPrice = Math.round(prod.basePrice * mult);

      return `
        <article class="catalog-card reveal revealed" data-id="${prod.id}">
          <div class="catalog-card-media">
            <span class="catalog-badge-pill" style="color: ${prod.accent || 'var(--gold)'}">${prod.badge || 'Royal Grade'}</span>
            <img src="${prod.image}" alt="${prod.name}" class="catalog-card-img" loading="lazy">
          </div>

          <div class="catalog-card-body">
            <div class="catalog-meta-row">
              <span class="catalog-cat-name">${prod.categoryLabel}</span>
              <span class="catalog-origin-tag">📍 ${prod.origin}</span>
            </div>

            <h3 class="catalog-card-title">${prod.name}</h3>
            <p class="catalog-card-desc">${prod.desc}</p>

            <div class="card-weight-selector">
              <div class="card-weight-pills">
                ${['100g', '250g', '500g', '1kg'].map(w => `
                  <button type="button" 
                          class="card-weight-btn ${w === currentWeight ? 'selected' : ''}" 
                          onclick="NutoriaCatalog.selectWeight('${prod.id}', '${w}')">
                    ${w}
                  </button>
                `).join('')}
              </div>
            </div>

            <div class="catalog-card-footer">
              <div class="catalog-price-val" id="price-${prod.id}">
                ₹${currentPrice.toLocaleString('en-IN')}
              </div>
              <div class="catalog-action-group">
                <button type="button" 
                        class="catalog-shimmer-add-btn" 
                        onclick="NutoriaCatalog.handleCardAdd('${prod.id}')">
                  Add to Bag
                </button>
                <button type="button" 
                        class="catalog-card-qv-btn" 
                        onclick="NutoriaCart.openQuickView('${prod.id}')" 
                        title="Quick View Details">
                  ✦
                </button>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  function selectWeight(productId, weight) {
    productWeightState[productId] = weight;
    const prod = getProductDataset().find(p => p.id === productId);
    if (!prod) return;

    const mult = (window.NutoriaCart && window.NutoriaCart.WEIGHT_MULTIPLIERS[weight]) || 1.0;
    const priceDisplay = document.getElementById(`price-${productId}`);
    if (priceDisplay) {
      priceDisplay.textContent = `₹${Math.round(prod.basePrice * mult).toLocaleString('en-IN')}`;
    }

    const card = document.querySelector(`.catalog-card[data-id="${productId}"]`);
    if (card) {
      card.querySelectorAll('.card-weight-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.textContent.trim() === weight);
      });
    }
  }

  function handleCardAdd(productId) {
    const weight = productWeightState[productId] || '250g';
    if (window.NutoriaCart) {
      window.NutoriaCart.addItem(productId, weight, 1);
    }
  }

  window.resetFilters = function () {
    currentCategory = 'all';
    searchQuery = '';
    currentSort = 'featured';
    const searchInput = document.getElementById('catalog-search-input');
    if (searchInput) searchInput.value = '';
    const tabs = document.querySelectorAll('.cat-tab-btn');
    tabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-category') === 'all'));
    renderCatalog();
  };

  window.NutoriaCatalog = {
    selectWeight,
    handleCardAdd,
    renderCatalog
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initCatalog();
      bindFilterEvents();
    });
  } else {
    initCatalog();
    bindFilterEvents();
  }

  window.addEventListener('load', () => {
    if (document.querySelectorAll('.catalog-card').length === 0) {
      renderCatalog();
    }
  });

})();
