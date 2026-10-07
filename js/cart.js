/* ==========================================================================
   NUTORIA — CART CONTROLLER & QUICK VIEW MODAL (V2 ROBUST)
   State Management, LocalStorage Persistence, Weight Variations & Drawer Actions
   ========================================================================== */

var NutoriaCart = window.NutoriaCart || (function () {
  'use strict';

  const STORAGE_KEY = 'nutoria_cart_v1';
  const FREE_SHIPPING_THRESHOLD = 1499;

  const WEIGHT_MULTIPLIERS = {
    '100g': 0.45,
    '250g': 1.0,
    '500g': 1.9,
    '1kg': 3.6
  };

  let cart = [];

  function getProducts() {
    if (typeof window !== 'undefined' && Array.isArray(window.NUTORIA_PRODUCTS) && window.NUTORIA_PRODUCTS.length > 0) {
      return window.NUTORIA_PRODUCTS;
    }
    if (typeof NUTORIA_PRODUCTS !== 'undefined' && Array.isArray(NUTORIA_PRODUCTS) && NUTORIA_PRODUCTS.length > 0) {
      return NUTORIA_PRODUCTS;
    }
    return [];
  }

  function init() {
    loadCart();
    injectCartMarkup();
    injectQuickViewModalMarkup();
    bindEvents();
    renderCart();
  }

  function loadCart() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      cart = stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn('Could not read cart from localStorage', e);
      cart = [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
    renderCart();
  }

  function injectCartMarkup() {
    if (document.getElementById('cart-drawer')) return;

    const drawerHTML = `
      <div id="cart-backdrop" class="cart-backdrop"></div>
      <aside id="cart-drawer" class="cart-drawer" aria-label="Shopping Cart">
        <div class="cart-header">
          <div class="cart-header-title">
            <span>Your Royal Bag</span>
            <span class="cart-header-count" id="cart-item-count">0 items</span>
          </div>
          <button type="button" class="cart-close-btn" id="cart-close-btn" aria-label="Close cart">✕</button>
        </div>

        <div class="cart-shipping-meter">
          <div class="cart-shipping-text" id="cart-shipping-text">
            <span>Complimentary Express Shipping</span>
            <span id="shipping-remainder-amount">₹1,499 away</span>
          </div>
          <div class="cart-shipping-bar">
            <div class="cart-shipping-fill" id="cart-shipping-fill" style="width: 0%;"></div>
          </div>
        </div>

        <div class="cart-body" id="cart-items-container"></div>

        <div class="cart-footer" id="cart-footer">
          <div class="cart-subtotal-row">
            <span class="cart-subtotal-label">Subtotal</span>
            <span class="cart-subtotal-val" id="cart-subtotal-val">₹0</span>
          </div>
          <p class="cart-taxes-note">Inclusive of all taxes & temperature-controlled nitrogen seal guarantee.</p>
          <button type="button" class="btn btn-primary cart-checkout-btn" id="cart-checkout-btn">
            Proceed to Checkout →
          </button>
        </div>
      </aside>
    `;

    document.body.insertAdjacentHTML('beforeend', drawerHTML);
  }

  function injectQuickViewModalMarkup() {
    if (document.getElementById('quickview-modal')) return;

    const modalHTML = `
      <div id="quickview-backdrop" class="modal-backdrop">
        <div class="modal-container" id="quickview-modal">
          <button type="button" class="modal-close-btn" id="quickview-close-btn" aria-label="Close modal">✕</button>
          <div class="modal-content-grid" id="quickview-content"></div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  function bindEvents() {
    document.querySelectorAll('.cart-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => openCart());
    });

    const closeBtn = document.getElementById('cart-close-btn');
    const backdrop = document.getElementById('cart-backdrop');
    if (closeBtn) closeBtn.addEventListener('click', () => closeCart());
    if (backdrop) backdrop.addEventListener('click', () => closeCart());

    const qvClose = document.getElementById('quickview-close-btn');
    const qvBackdrop = document.getElementById('quickview-backdrop');
    if (qvClose) qvClose.addEventListener('click', () => closeQuickView());
    if (qvBackdrop) {
      qvBackdrop.addEventListener('click', (e) => {
        if (e.target === qvBackdrop) closeQuickView();
      });
    }

    const checkoutBtn = document.getElementById('cart-checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
          showToast('Bag is Empty', 'Please select a harvest item before proceeding.', 'error');
          return;
        }
        showToast('Directing to Concierge', 'Preparing your bespoke checkout session...', 'success');
        setTimeout(() => {
          alert('Thank you for choosing Nutoria. In a full production store, this redirects to the payment gateway.');
        }, 600);
      });
    }
  }

  function openCart() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-backdrop');
    if (drawer && backdrop) {
      drawer.classList.add('open');
      backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeCart() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-backdrop');
    if (drawer && backdrop) {
      drawer.classList.remove('open');
      backdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  function addItem(productId, weight = '250g', quantity = 1) {
    const product = getProducts().find(p => p.id === productId);
    if (!product) return;

    const mult = WEIGHT_MULTIPLIERS[weight] || 1.0;
    const unitPrice = Math.round(product.basePrice * mult);
    const cartItemId = `${productId}-${weight}`;

    const existingIndex = cart.findIndex(item => item.cartItemId === cartItemId);

    if (existingIndex > -1) {
      cart[existingIndex].qty += quantity;
    } else {
      cart.push({
        cartItemId,
        productId,
        name: product.name,
        category: product.categoryLabel,
        weight,
        unitPrice,
        image: product.image,
        qty: quantity
      });
    }

    saveCart();
    openCart();

    const badge = document.querySelector('.cart-badge');
    if (badge) {
      badge.classList.add('pulse');
      setTimeout(() => badge.classList.remove('pulse'), 400);
    }

    showToast('Added to Royal Bag', `${product.name} (${weight}) is reserved.`, 'success');
  }

  function updateQty(cartItemId, delta) {
    const item = cart.find(i => i.cartItemId === cartItemId);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter(i => i.cartItemId !== cartItemId);
    }
    saveCart();
  }

  function removeItem(cartItemId) {
    cart = cart.filter(i => i.cartItemId !== cartItemId);
    saveCart();
    showToast('Item Removed', 'Your bag has been updated.', 'info');
  }

  function renderCart() {
    const container = document.getElementById('cart-items-container');
    const countEl = document.getElementById('cart-item-count');
    const subtotalEl = document.getElementById('cart-subtotal-val');
    const badges = document.querySelectorAll('.cart-badge');
    const shippingRemainder = document.getElementById('shipping-remainder-amount');
    const shippingFill = document.getElementById('cart-shipping-fill');
    const cartFooter = document.getElementById('cart-footer');

    const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
    const subtotal = cart.reduce((acc, item) => acc + (item.unitPrice * item.qty), 0);

    badges.forEach(b => {
      b.textContent = totalQty;
      b.style.display = totalQty > 0 ? 'flex' : 'none';
    });

    if (countEl) countEl.textContent = `${totalQty} ${totalQty === 1 ? 'item' : 'items'}`;
    if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;

    if (shippingRemainder && shippingFill) {
      if (subtotal >= FREE_SHIPPING_THRESHOLD) {
        shippingRemainder.textContent = 'Unlocked! Free Express Shipping Applied';
        shippingFill.style.width = '100%';
      } else {
        const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
        shippingRemainder.textContent = `₹${remaining.toLocaleString('en-IN')} away from Free Delivery`;
        const pct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
        shippingFill.style.width = `${pct}%`;
      }
    }

    if (!container) return;

    if (cart.length === 0) {
      container.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">✦</div>
          <h3 class="cart-empty-title">Your Bag is Empty</h3>
          <p class="cart-empty-text">Experience the pinnacle of royal dry fruits, vacuum-sealed at peak freshness.</p>
          <a href="/products/" class="btn btn-secondary" onclick="NutoriaCart.closeCart()">Explore Collection</a>
        </div>
      `;
      if (cartFooter) cartFooter.style.display = 'none';
      return;
    }

    if (cartFooter) cartFooter.style.display = 'block';

    container.innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.cartItemId}">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img" loading="lazy">
        <div class="cart-item-details">
          <div>
            <h4 class="cart-item-name">${item.name}</h4>
            <div class="cart-item-variant">${item.weight} • ₹${item.unitPrice.toLocaleString('en-IN')}</div>
          </div>
          <div class="cart-item-bottom">
            <div class="cart-qty-ctrl">
              <button type="button" class="cart-qty-btn" onclick="NutoriaCart.updateQty('${item.cartItemId}', -1)">−</button>
              <span class="cart-qty-val">${item.qty}</span>
              <button type="button" class="cart-qty-btn" onclick="NutoriaCart.updateQty('${item.cartItemId}', 1)">+</button>
            </div>
            <div class="cart-item-price">₹${(item.unitPrice * item.qty).toLocaleString('en-IN')}</div>
            <button type="button" class="cart-item-remove" onclick="NutoriaCart.removeItem('${item.cartItemId}')" title="Remove item">✕</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function openQuickView(productId) {
    const product = getProducts().find(p => p.id === productId);
    if (!product) return;

    const modalBackdrop = document.getElementById('quickview-backdrop');
    const content = document.getElementById('quickview-content');
    if (!modalBackdrop || !content) return;

    let selectedWeight = '250g';
    const calcPrice = (w) => Math.round(product.basePrice * (WEIGHT_MULTIPLIERS[w] || 1.0));

    content.innerHTML = `
      <div class="modal-media-col">
        <img src="${product.image}" alt="${product.name}" class="modal-product-img">
      </div>
      <div class="modal-info-col">
        <span class="modal-category-tag" style="color: ${product.accent || 'var(--gold)'}">${product.categoryLabel} • ${product.badge}</span>
        <h2 class="modal-product-title">${product.name}</h2>
        <div class="modal-rating-row">
          <span class="modal-stars">★★★★★</span>
          <span>${product.rating} (${product.reviewsCount} Connoisseur Reviews)</span>
        </div>
        <div class="modal-price-row">
          <span class="modal-current-price" id="modal-price-display">₹${calcPrice('250g').toLocaleString('en-IN')}</span>
          <span class="modal-price-tax">incl. of all taxes</span>
        </div>
        <p class="modal-description">${product.desc}</p>
        
        <div class="modal-specs-grid">
          <div class="modal-spec-item">
            <span class="modal-spec-label">Origin:</span>
            <span class="modal-spec-value">${product.origin}</span>
          </div>
          <div class="modal-spec-item">
            <span class="modal-spec-label">Caliber:</span>
            <span class="modal-spec-value">${product.caliber}</span>
          </div>
          <div class="modal-spec-item">
            <span class="modal-spec-label">Quality Grade:</span>
            <span class="modal-spec-value">${product.grade}</span>
          </div>
          <div class="modal-spec-item">
            <span class="modal-spec-label">Preservation:</span>
            <span class="modal-spec-value">100% Nitrogen Flush</span>
          </div>
        </div>

        <div class="modal-weight-selector">
          <label class="modal-weight-label">Select Weight Caliber:</label>
          <div class="modal-weight-pills" id="modal-weight-pills">
            ${['100g', '250g', '500g', '1kg'].map(w => `
              <button type="button" class="weight-pill ${w === '250g' ? 'selected' : ''}" data-weight="${w}">
                ${w}
              </button>
            `).join('')}
          </div>
        </div>

        <button type="button" class="btn btn-primary" id="modal-add-btn">
          Reserve & Add to Bag
        </button>
      </div>
    `;

    const pills = content.querySelectorAll('.weight-pill');
    const priceDisplay = content.querySelector('#modal-price-display');

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('selected'));
        pill.classList.add('selected');
        selectedWeight = pill.getAttribute('data-weight');
        priceDisplay.textContent = `₹${calcPrice(selectedWeight).toLocaleString('en-IN')}`;
      });
    });

    const addBtn = content.querySelector('#modal-add-btn');
    addBtn.addEventListener('click', () => {
      addItem(product.id, selectedWeight, 1);
      closeQuickView();
    });

    modalBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeQuickView() {
    const modalBackdrop = document.getElementById('quickview-backdrop');
    if (modalBackdrop) {
      modalBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    openCart,
    closeCart,
    addItem,
    updateQty,
    removeItem,
    openQuickView,
    closeQuickView,
    WEIGHT_MULTIPLIERS
  };
})();

window.NutoriaCart = NutoriaCart;
