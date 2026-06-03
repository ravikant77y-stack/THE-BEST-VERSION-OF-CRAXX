// Global Application State
let appCart = [];
let appAnalytics = null;
let currentReportType = 'today';
let selectedBulkProducts = new Set();
let editingProductSku = null;

// Audio context for barcode beep feedback (Premium Detail)
function playBeepSound() {
  try {
    let ctx = new (window.AudioContext || window.webkitAudioContext)();
    let osc = ctx.createOscillator();
    let gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = 950;
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    // Audio context block fallback
  }
}

// --------------------------------------------------------
// ROUTER & NAVIGATION
// --------------------------------------------------------
const ROUTER_VIEWS = [
  'dashboard', 'orders', 'products', 'product-manager',
  'scanner', 'inventory', 'customers', 'customer-profile',
  'analytics', 'reports', 'settings', 'profile'
];

function handleHashRoute() {
  let hash = window.location.hash.slice(1) || 'dashboard';
  
  // Extract query parameters if any (e.g. #customer-profile?name=Falak%20General%20Stores)
  let view = hash;
  let params = {};
  if (hash.includes('?')) {
    let parts = hash.split('?');
    view = parts[0];
    let query = parts[1];
    query.split('&').forEach(pair => {
      let [key, val] = pair.split('=');
      params[decodeURIComponent(key)] = decodeURIComponent(val || '');
    });
  }

  if (!ROUTER_VIEWS.includes(view)) {
    view = 'dashboard';
  }

  // Switch View Visibility
  ROUTER_VIEWS.forEach(v => {
    let el = document.getElementById(`${v}View`);
    if (el) el.hidden = (v !== view);
  });

  // Highlight Sidebar Nav Link
  document.querySelectorAll('#sidebarNav a').forEach(a => {
    let targetHash = a.getAttribute('href').split('?')[0];
    a.classList.toggle('active', targetHash === `#${view}`);
  });

  // Close mobile sidebar drawer if open
  let mobileSidebar = document.getElementById('enterpriseSidebar');
  let mobileBackdrop = document.getElementById('sidebarBackdrop');
  if (mobileSidebar && mobileSidebar.classList.contains('mobile-open')) {
    mobileSidebar.classList.remove('mobile-open');
    if (mobileBackdrop) mobileBackdrop.classList.remove('active');
  }

  // Dispatch Page Init calls
  initViewData(view, params);
  
  // Scroll main view to top
  let main = document.querySelector('.enterprise-main');
  if (main) main.scrollTop = 0;
}

window.addEventListener('hashchange', handleHashRoute);

// View Data Initializer
function initViewData(view, params) {
  buildCraxxAnalytics().then(analytics => {
    appAnalytics = analytics;
    
    // Update Notification Badge Count
    updateNotificationBadge();

    switch (view) {
      case 'dashboard':
        renderDashboardView();
        break;
      case 'orders':
        renderOrdersCatalog();
        renderOrderHistoryTable();
        updateCartDisplay();
        break;
      case 'products':
        renderProductsCatalogTable();
        break;
      case 'product-manager':
        renderManagerCatalogTable();
        break;
      case 'scanner':
        initScannerPage();
        break;
      case 'inventory':
        renderInventoryCards();
        renderInventorySavesHistory();
        break;
      case 'customers':
        renderCrmCustomerTable();
        break;
      case 'customer-profile':
        renderCustomerProfileDossier(params.name);
        break;
      case 'analytics':
        renderAnalyticsBI();
        break;
      case 'reports':
        renderReportsViewer();
        break;
      case 'settings':
        loadSettingsFields();
        break;
      case 'profile':
        loadProfileFields();
        break;
    }
  });
}

// --------------------------------------------------------
// SPLASH SCREEN & LOGIN SESSIONS
// --------------------------------------------------------
function runSplashLoader() {
  let progress = 0;
  let bar = document.getElementById('splashProgressBar');
  let status = document.getElementById('splashStatus');
  
  let messages = [
    "Loading Operations Center...",
    "Indexing Snack Catalog...",
    "Retrieving Warehouse Stocks...",
    "Connecting Local Database...",
    "Operations Ready."
  ];

  let interval = setInterval(() => {
    progress += Math.floor(Math.random() * 20) + 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      bar.style.width = '100%';
      status.textContent = messages[4];
      
      setTimeout(() => {
        let splash = document.getElementById('splashScreen');
        splash.classList.add('fade-out');
        checkLoginSession();
      }, 500);
    } else {
      bar.style.width = `${progress}%`;
      let msgIdx = Math.min(Math.floor(progress / 25), 3);
      status.textContent = messages[msgIdx];
    }
  }, 120);
}

function checkLoginSession() {
  let loggedIn = false;
  
  if (localStorage.getItem("craxxRememberMe") === "yes") {
    loggedIn = true;
  } else {
    let loginTimestamp = localStorage.getItem("craxxLoginTimestamp");
    if (loginTimestamp) {
      let elapsed = Date.now() - Number(loginTimestamp);
      if (elapsed < 24 * 60 * 60 * 1000) {
        loggedIn = true;
      }
    }
  }

  if (sessionStorage.getItem("craxxLoggedIn") === "yes") {
    loggedIn = true;
  }

  let overlay = document.getElementById('loginOverlay');
  
  if (loggedIn) {
    overlay.hidden = true;
    handleHashRoute();
  } else {
    overlay.hidden = false;
  }
}

function handleCraxxLogin(event) {
  event.preventDefault();
  let email = document.getElementById('loginEmail').value.trim();
  let remember = document.getElementById('loginRemember').checked;
  
  sessionStorage.setItem("craxxLoggedIn", "yes");
  localStorage.setItem("craxxLoginTimestamp", Date.now().toString());
  if (remember) {
    localStorage.setItem("craxxRememberMe", "yes");
  }

  // Record Activity
  recordActivity("User Signed In", email);
  
  let overlay = document.getElementById('loginOverlay');
  overlay.hidden = true;
  
  triggerNotification("system", "Operations login successful", `Welcome back. Session active for ${email}.`);
  handleHashRoute();
}

function logOutUser() {
  sessionStorage.removeItem("craxxLoggedIn");
  localStorage.removeItem("craxxRememberMe");
  localStorage.removeItem("craxxLoginTimestamp");
  document.getElementById('loginOverlay').hidden = false;
  recordActivity("User Logged Out", "ravi@craxx.in");
}

// --------------------------------------------------------
// EXECUTIVE DASHBOARD RENDERING
// --------------------------------------------------------
let dashboardPeriod = 'today';

function setDashboardPeriod(period, btn) {
  dashboardPeriod = period;
  if (btn) {
    document.querySelectorAll('.view-header .chart-tabs button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  renderDashboardView();
}

function renderDashboardView() {
  if (!appAnalytics) return;
  
  // Apply Business Header Info
  let identity = readJson("craxxIdentity", { name: "CRAXX Enterprise ERP" });
  document.getElementById('sidebarBrandName').textContent = identity.name.split(' ')[0] || "CRAXX";
  document.getElementById('sidebarBrandSub').textContent = identity.name.split(' ').slice(1).join(' ') || "FMCG ERP";
  
  let source = appAnalytics[dashboardPeriod] || appAnalytics.today;
  
  // KPI counts and animation
  animateNumber(document.getElementById('kpiRevenue'), source.revenue, "₹");
  animateNumber(document.getElementById('kpiPcs7_5'), source.pcs7_5 || 0, "");
  animateNumber(document.getElementById('kpiPcs15'), source.pcs15 || 0, "");
  animateNumber(document.getElementById('kpiPcsTotal'), source.pcsTotal || 0, "");
  animateNumber(document.getElementById('kpiOrders'), source.orders, "");

  // Growth rates labels
  let growthLabel = document.getElementById('kpiRevenueGrowth');
  if (growthLabel) {
    if (dashboardPeriod === 'weekly') {
      let growth = Math.round(appAnalytics.weekly.growth || 0);
      growthLabel.textContent = `${growth >= 0 ? '↑' : '↓'} ${Math.abs(growth)}% vs previous week`;
      growthLabel.className = growth >= 0 ? 'growth-up' : 'growth-down';
    } else {
      growthLabel.textContent = "↑ active routing cycles";
      growthLabel.className = 'neutral';
    }
  }

  // Draw Line Chart based on period
  if (dashboardPeriod === 'today' || dashboardPeriod === 'weekly') {
    drawLineChart(document.getElementById('dashboardRevenueChart'), appAnalytics.weekly.series, 'revenue', '#6366f1');
    document.getElementById('dashboardChartSubtitle').textContent = "Weekly Outflow Distribution Trend";
  } else {
    drawLineChart(document.getElementById('dashboardRevenueChart'), appAnalytics.monthly.series, 'revenue', '#10b981');
    document.getElementById('dashboardChartSubtitle').textContent = "30-Day Total Outflow Performance";
  }

  // Draw Stock Doughnut Chart values
  let inv = appAnalytics.inventory;
  document.getElementById('pieHealthyCount').textContent = inv.healthy;
  document.getElementById('pieLowCount').textContent = inv.low;
  document.getElementById('pieOutCount').textContent = inv.out;
  
  let total = Math.max(inv.total, 1);
  let healthyPercent = (inv.healthy / total) * 100;
  let lowPercent = (inv.low / total) * 100;
  document.getElementById('dashboardStockPie').style.background = `conic-gradient(var(--color-success) 0 ${healthyPercent}%, var(--color-warning) ${healthyPercent}% ${healthyPercent + lowPercent}%, var(--color-danger) ${healthyPercent + lowPercent}% 100%)`;

  // Render Top product table
  let topRows = appAnalytics.productRows.slice(0, 5);
  document.getElementById('dashboardProductRanking').innerHTML = topRows.map((p, idx) => {
    let statusClass = p.currentStock <= 0 ? 'out-of-stock' : (p.currentStock <= p.reorderLevel ? 'low-stock' : 'healthy');
    let statusText = p.currentStock <= 0 ? 'Out of stock' : (p.currentStock <= p.reorderLevel ? 'Low stock' : 'In stock');
    return `
      <tr>
        <td>${idx + 1}</td>
        <td><strong>${p.name}</strong></td>
        <td>${p.units} units</td>
        <td>${formatMoney(p.revenue)}</td>
        <td><span class="status-pill ${statusClass}">${statusText}</span></td>
      </tr>
    `;
  }).join('');

  // Render Recent Activity Logs
  let logs = appAnalytics.activity.slice(0, 6);
  document.getElementById('dashboardActivityLog').innerHTML = logs.map(l => `
    <div class="activity-item">
      <strong>${l.action}</strong>
      <span>${l.detail || ""}</span>
      <time>${new Date(l.time).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })} • ${new Date(l.time).toLocaleDateString()}</time>
    </div>
  `).join('') || `<div style="color:var(--text-muted); font-size:0.85rem; padding: 12px 0;">No activities logged today.</div>`;
}

function animateNumber(element, value, prefix) {
  if (!element) return;
  let start = 0;
  let end = Number(value || 0);
  let duration = 650;
  let began = performance.now();
  
  function tick(now) {
    let progress = Math.min((now - began) / duration, 1);
    let current = Math.round(start + (end - start) * progress);
    element.textContent = `${prefix || ""}${current.toLocaleString("en-IN")}`;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// --------------------------------------------------------
// CREATE ORDERS & CATALOG
// --------------------------------------------------------
let activeCatalogFilter = 'all';

function filterOrderCatalog(category, btn) {
  activeCatalogFilter = category;
  if (btn) {
    document.querySelectorAll('#ordersCategoryFilters button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  renderOrdersCatalog();
}

function getProductVariantLastOrderQty(customerName, productName, gram, unit) {
  if (!customerName) return 0;
  let localOrders = readJson("customerOrders", {});
  let order = localOrders[customerName];
  if (!order) return 0;
  let matched = order.find(item => item.productName === productName && item.gram === gram && item.unit === unit);
  return matched ? matched.qty : 0;
}

function renderOrdersCatalog() {
  if (!appAnalytics) return;
  
  let catalog = getProductCatalog();
  let stock = getStoredStock();
  let query = document.getElementById('globalSearchInput').value.trim().toLowerCase();

  let customerInput = document.getElementById('orderCustomerName');
  let customerName = customerInput ? customerInput.value.trim() : "";

  let filtered = Object.values(catalog).filter(p => {
    if (activeCatalogFilter !== 'all' && p.category !== activeCatalogFilter) return false;
    if (query && !p.name.toLowerCase().includes(query) && !p.sku.toLowerCase().includes(query)) return false;
    return true;
  });

  document.getElementById('ordersCatalogGrid').innerHTML = filtered.map(p => {
    let stockValue = Number(stock[p.name]?.original ?? stock[p.name] ?? 0);
    let pcsStockValue = Number(stock[p.name]?.["52gm__pcs"] ?? 0);
    
    let isLow = stockValue <= p.reorderLevel;
    let isOut = stockValue <= 0;
    
    let stockClass = isOut ? 'out-stock' : (isLow ? 'low-stock' : 'in-stock');
    let stockText = isOut ? 'Out of stock' : (isLow ? `Low stock: ${stockValue} Patti` : `Stock: ${stockValue} Patti`);

    // Sizes Select Option builder
    let pcsPrice = Number(p.pcsPrice ?? 15);
    let safeName = p.name.replaceAll("'", "\\'");

    let lastQty = getProductVariantLastOrderQty(customerName, p.name, p.weight, "");
    let lastOrderText = lastQty > 0 ? `Last Ordered: ${lastQty} Patti` : "";

    return `
      <div class="product-card" id="card-${p.sku}">
        <div class="product-image-container">
          <img src="${p.image || 'assets/images/WhatsApp.svg'}" alt="${p.name}" loading="lazy">
        </div>
        <div class="product-card-body">
          <h3>${p.name}</h3>
          <p class="info">${p.weight || '33gm'} • ${p.description || p.name}</p>
          
          <p class="out-of-stock-badge" id="out-of-stock-badge-${p.sku}" ${isOut ? '' : 'style="display:none;"'}>Out of stock</p>
          
          <select class="size-select" onchange="handleProductSizeSelect(this, '${p.sku}')" aria-label="Select size for ${p.name}">
            <option data-gram="${p.weight}" data-price="${p.price}" data-unit="" data-stock="${stockValue}">${p.weight || 'Original'} - ₹${p.price}</option>
            <option data-gram="52gm" data-price="${pcsPrice}" data-unit="pcs" data-stock="${pcsStockValue}">52gm - ₹${pcsPrice}</option>
          </select>
          
          <p class="last-order-label" id="last-order-label-${p.sku}" style="font-size:0.75rem; color:var(--color-primary); font-weight:600; margin-bottom: 6px; min-height:14px;">${lastOrderText}</p>
          
          <div class="price-row">
            <span class="price-val" id="price-label-${p.sku}">₹${p.price}</span>
          </div>
          
          <button class="add-btn-full ${isOut ? 'out-of-stock-btn' : ''}" id="add-btn-${p.sku}" onclick="executeAddToCart('${safeName}', '${p.sku}')" ${isOut ? 'disabled' : ''}>
            ${isOut ? 'OUT OF STOCK' : (getCartQtyForCard(p.name) ? `ADD (${getCartQtyForCard(p.name)})` : 'ADD')}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function getCartQtyForCard(name) {
  let matched = appCart.filter(item => item.productName === name);
  if (!matched.length) return 0;
  return matched.reduce((sum, item) => sum + item.qty, 0);
}

function handleProductSizeSelect(select, sku) {
  let option = select.options[select.selectedIndex];
  let price = Number(option.dataset.price);
  let stock = Number(option.dataset.stock);
  let unit = option.dataset.unit || '';

  document.getElementById(`price-label-${sku}`).textContent = `₹${price}`;
  
  let badge = document.getElementById(`out-of-stock-badge-${sku}`);
  let btn = document.getElementById(`add-btn-${sku}`);
  
  let productName = select.closest('.product-card').querySelector('h3').textContent;
  let cartQty = getCartQtyForCard(productName);
  
  if (stock <= 0) {
    if (badge) badge.style.display = 'block';
    if (btn) {
      btn.disabled = true;
      btn.textContent = "OUT OF STOCK";
      btn.classList.add('out-of-stock-btn');
    }
  } else {
    if (badge) badge.style.display = 'none';
    if (btn) {
      btn.disabled = false;
      btn.textContent = cartQty ? `ADD (${cartQty})` : "ADD";
      btn.classList.remove('out-of-stock-btn');
    }
  }

  // Update Last Ordered label
  let gram = option.dataset.gram || "";
  let customerInput = document.getElementById('orderCustomerName');
  let customerName = customerInput ? customerInput.value.trim() : "";
  let lastQty = getProductVariantLastOrderQty(customerName, productName, gram, unit);
  let lastOrderLabel = document.getElementById(`last-order-label-${sku}`);
  if (lastOrderLabel) {
    lastOrderLabel.textContent = lastQty > 0 ? `Last Ordered: ${lastQty} ${unit || 'Patti'}` : "";
  }
}

// --------------------------------------------------------
// CART OPERATIONS
// --------------------------------------------------------
function executeAddToCart(name, sku) {
  let card = document.getElementById(`card-${sku}`);
  if (!card) return;
  
  let select = card.querySelector('.size-select');
  let option = select.options[select.selectedIndex];
  
  let gram = option.dataset.gram || "";
  let unit = option.dataset.unit || "";
  let price = Number(option.dataset.price);
  let stockValue = Number(option.dataset.stock);
  
  let cartKey = [name, gram, unit].join("__");
  let item = appCart.find(x => x.key === cartKey);
  let currentQty = item ? item.qty : 0;

  if (currentQty >= stockValue) {
    alert("Out of reserves for selected variant");
    return;
  }

  currentQty++;
  if (item) {
    item.qty = currentQty;
  } else {
    appCart.push({
      key: cartKey,
      productName: name,
      name,
      gram,
      unit,
      price,
      qty: 1
    });
  }

  playBeepSound();
  updateCartDisplay();
  renderOrdersCatalog();
}

function executeRemoveFromCart(key) {
  let item = appCart.find(x => x.key === key);
  if (!item) return;
  
  item.qty--;
  if (item.qty <= 0) {
    appCart = appCart.filter(x => x.key !== key);
  }
  
  updateCartDisplay();
  renderOrdersCatalog();
}

function updateCartDisplay() {
  let list = document.getElementById('orderCartItems');
  let totalLabel = document.getElementById('orderCartTotal');
  if (!list || !totalLabel) return;
  
  if (appCart.length === 0) {
    list.innerHTML = `<div style="color:var(--text-muted); font-size:0.85rem; text-align:center; padding:20px 0;">Cart is empty. Select products above.</div>`;
    totalLabel.textContent = "Total: ₹0";
    updateCartFloatingBubbles();
    return;
  }

  let total = 0;
  list.innerHTML = appCart.map(item => {
    let subtotal = item.price * item.qty;
    total += subtotal;
    let displayName = item.gram ? `${item.name} (${item.gram})` : item.name;
    return `
      <div class="cart-row">
        <div class="cart-row-info">
          <b>${displayName}</b>
          <span>${item.qty} ${item.unit || 'Patti'} × ₹${item.price}</span>
        </div>
        <div class="cart-row-actions">
          <b>₹${subtotal}</b>
          <button type="button" class="cart-remove-btn" onclick="executeRemoveFromCart('${item.key}')">Remove</button>
        </div>
      </div>
    `;
  }).join('');

  totalLabel.textContent = `Total: ${formatMoney(total)}`;
  updateCartFloatingBubbles();
}

function updateCartFloatingBubbles() {
  let pattiCount = 0;
  let pcsCount = 0;
  
  appCart.forEach(item => {
    if (item.unit === 'pcs') {
      pcsCount += item.qty;
    } else {
      pattiCount += item.qty;
    }
  });

  // Ensure bubbles containers exist in DOM
  let container = document.getElementById('cartBubbles');
  if (!container) {
    container = document.createElement('div');
    container.id = 'cartBubbles';
    container.className = 'cart-bubbles';
    document.body.appendChild(container);
  }

  container.innerHTML = "";
  if (pattiCount > 0) {
    container.innerHTML += `
      <div class="cart-bubble" onclick="scrollToCartViewport()">
        <span>🛒</span>
        <strong>${pattiCount}</strong>
        <small>Patti</small>
      </div>
    `;
  }
  if (pcsCount > 0) {
    container.innerHTML += `
      <div class="cart-bubble cart-bubble-pcs" onclick="scrollToCartViewport()">
        <span>▣</span>
        <strong>${pcsCount}</strong>
        <small>PCS</small>
      </div>
    `;
  }
}

function scrollToCartViewport() {
  let el = document.getElementById('orderCartItems');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Store suggestions lookup autofill
function suggestOrderCustomers() {
  let input = document.getElementById('orderCustomerName').value.trim().toLowerCase();
  let suggestions = document.getElementById('customerSuggestions');
  suggestions.innerHTML = "";
  
  if (!input) {
    showLastOrder("");
    renderOrdersCatalog();
    return;
  }
  
  if (!appAnalytics) return;
  
  let mergedList = mergeCustomerLists(appAnalytics.records);
  let matched = mergedList.filter(c => c.name.toLowerCase().includes(input)).slice(0, 6);
  
  suggestions.innerHTML = matched.map(c => `
    <div class="customer-suggestion" onclick="selectOrderCustomer('${encodeURIComponent(JSON.stringify(c))}')">
      ${c.name}
    </div>
  `).join('');
}

function selectOrderCustomer(encoded) {
  let c = JSON.parse(decodeURIComponent(encoded));
  document.getElementById('orderCustomerName').value = c.name;
  document.getElementById('orderCustomerPhone').value = c.phone || "";
  document.getElementById('orderCustomerAddress').value = c.address || "";
  document.getElementById('customerSuggestions').innerHTML = "";
  
  showLastOrder(c.name);
  renderOrdersCatalog();
}

function showLastOrder(customerName) {
  let box = document.getElementById("lastOrderBox");
  let content = document.getElementById("lastOrderContent");
  if (!box || !content) return;

  if (!customerName) {
    box.hidden = true;
    return;
  }

  let localOrders = readJson("customerOrders", {});
  let order = localOrders[customerName];

  if (!order || !order.length) {
    content.innerHTML = "No previous order found";
    box.hidden = false;
    return;
  }

  content.innerHTML = order.map(item => {
    let displayName = item.gram ? `${item.name} (${item.gram})` : item.name;
    let unitText = item.unit ? ` ${item.unit}` : " Patti";
    return `<div style="display:flex; justify-content:space-between;"><span>${displayName}</span><b>→ ${item.qty}${unitText}</b></div>`;
  }).join('');
  
  box.hidden = false;
}

function fetchLastOrderToCart() {
  let customerName = document.getElementById('orderCustomerName').value.trim();
  if (!customerName) {
    alert("Select customer first");
    return;
  }

  let localOrders = readJson("customerOrders", {});
  let order = localOrders[customerName];

  if (!order || !order.length) {
    alert("No last order found");
    return;
  }

  appCart = [];
  let stock = getStoredStock();
  let skippedItems = [];

  order.forEach(item => {
    let name = item.productName || item.name;
    let gram = item.gram || "";
    let unit = item.unit || "";
    let price = item.price || 75;
    
    let key = gram === "52gm" ? "52gm__pcs" : "original";
    let stockValue = stock[name] ? (typeof stock[name] === "object" ? Number(stock[name][key] || 0) : Number(stock[name])) : 0;

    if (stockValue <= 0) {
      skippedItems.push(name);
      return;
    }

    let qty = Math.min(item.qty, stockValue);
    
    appCart.push({
      key: [name, gram, unit].join("__"),
      productName: name,
      name,
      gram,
      unit,
      price,
      qty
    });
  });

  updateCartDisplay();
  renderOrdersCatalog();

  if (skippedItems.length) {
    alert(`Some items were out of stock and skipped: ${skippedItems.join(", ")}`);
  }
}

function mergeCustomerLists(orders) {
  let baseCustomers = [
    { name:"Falak General Stores", phone:"9368890158", address:"Jogeshwari" },
    { name:"Omair Medical", phone:"Not Available", address:"Near Salman Medical, Jogeshwari" },
    { name:"Gurukripa Pan Bidi Shop", phone:"Not Available", address:"Jogeshwari" },
    { name:"Alete Sweet Stores", phone:"9870203313", address:"Near Usha Pan Bidi Shop" }
  ];
  let saved = readJson("savedCustomers", []);
  let map = {};
  
  baseCustomers.forEach(x => map[x.name.trim().toLowerCase()] = x);
  saved.forEach(x => map[x.name.trim().toLowerCase()] = x);
  orders.forEach(o => {
    let k = o.customer.trim().toLowerCase();
    if (!map[k]) {
      map[k] = { name: o.customer, phone: "Not Available", address: "Local dispatch route" };
    }
  });
  return Object.values(map).sort((a,b) => a.name.localeCompare(b.name));
}

// --------------------------------------------------------
// ORDER PROCESSING & WHATSAPP FORWARDING
// --------------------------------------------------------
function executeSaveOrder() {
  let name = document.getElementById('orderCustomerName').value.trim();
  let phone = document.getElementById('orderCustomerPhone').value.trim();
  let address = document.getElementById('orderCustomerAddress').value.trim();
  let note = document.getElementById('orderCustomerNote').value.trim();

  if (!name || !phone || !address) {
    alert("Please fill customer details first");
    return;
  }
  
  if (appCart.length === 0) {
    alert("Distribution cart is empty!");
    return;
  }

  // Deduct reserves stock
  let stock = getStoredStock();
  appCart.forEach(item => {
    let key = item.gram === "52gm" ? "52gm__pcs" : "original";
    if (stock[item.productName]) {
      if (typeof stock[item.productName] === "object") {
        stock[item.productName][key] = Math.max(0, Number(stock[item.productName][key] || 0) - item.qty);
      } else if (item.gram === "52gm") {
        stock[item.productName] = { original: Number(stock[item.productName]), "52gm__pcs": 0 };
      } else {
        stock[item.productName] = Math.max(0, Number(stock[item.productName]) - item.qty);
      }
    } else {
      stock[item.productName] = 0;
    }
  });

  writeJson("stock", stock);

  // Save customer profile CRM
  let savedC = readJson("savedCustomers", []);
  if (!savedC.some(x => x.name.toLowerCase() === name.toLowerCase())) {
    savedC.push({ name, phone, address });
    writeJson("savedCustomers", savedC);
  }

  // Build WhatsApp dispatch message url
  let message = `*CRAXX ORDER*%0A%0A`;
  message += `*Customer Name:* ${name}%0A`;
  message += `*Phone:* ${phone}%0A`;
  message += `*Address:* ${address}%0A`;
  message += `*Note:* ${note}%0A%0A`;
  message += `*Order Details:*%0A`;

  let wsFormat = localStorage.getItem("craxxWhatsappFormat") || "enterprise";
  let totalBill = 0;

  if (wsFormat === "classic") {
    appCart.forEach(item => {
      let subtotal = item.price * item.qty;
      totalBill += subtotal;
      let sizeText = item.gram || 'Original';
      let unitText = item.unit || 'Patti';
      message += `• ${item.name} (${sizeText}) × ${item.qty} ${unitText} - ₹${subtotal}%0A`;
    });
    message += `%0A*Total Bill:* ₹${totalBill}%0A`;
  } else {
    let pattiItems = appCart.filter(item => item.unit !== "pcs");
    let pcsItems = appCart.filter(item => item.unit === "pcs");
    let totalPatti = 0;
    let totalPcs = 0;
    let pattiAmount = 0;
    let pcsAmount = 0;

    pattiItems.forEach(item => {
      let subtotal = item.price * item.qty;
      totalBill += subtotal;
      pattiAmount += subtotal;
      totalPatti += item.qty;
      message += `• ${item.name} × ${item.qty}%0A`;
    });

    if (pattiItems.length) {
      message += `%0A*Total Patti:* ${totalPatti}`;
      message += `%0A*Net:* ₹7.5`;
      message += `%0A*Patti Amount:* ₹${pattiAmount}%0A`;
    }

    if (pattiItems.length && pcsItems.length) {
      message += `%0A`;
    }

    if (pcsItems.length) {
      let pcsGroups = {};
      pcsItems.forEach(item => {
        let key = Number(item.price || 0);
        if (!pcsGroups[key]) {
          pcsGroups[key] = [];
        }
        pcsGroups[key].push(item);
      });

      Object.keys(pcsGroups).forEach(price => {
        message += `%0A*PCS Products - Net ₹${price}*%0A`;
        pcsGroups[price].forEach(item => {
          let subtotal = item.price * item.qty;
          totalBill += subtotal;
          pcsAmount += subtotal;
          totalPcs += item.qty;
          message += `• ${item.name} × ${item.qty} pcs%0A`;
        });
      });

      message += `%0A*Total PCS:* ${totalPcs}`;
      message += `%0A*PCS Amount:* ₹${pcsAmount}`;
    }

    message += `%0A%0A*Total Amount:* ₹${totalBill}`;
  }

  // WhatsApp link generator API
  let dispatchNum = "7304895165";
  let url = `whatsapp://send?phone=${dispatchNum}&text=${message}`;

  // Log order in historical database snapshot
  recordOrderSnapshot(name, appCart, totalBill);
  
  // Save customer orders last state reference
  let lastOrders = readJson("customerOrders", {});
  lastOrders[name] = JSON.parse(JSON.stringify(appCart));
  writeJson("customerOrders", lastOrders);

  // Clear Cart
  appCart = [];
  
  // Clear inputs
  document.getElementById('orderCustomerName').value = "";
  document.getElementById('orderCustomerPhone').value = "";
  document.getElementById('orderCustomerAddress').value = "";
  document.getElementById('orderCustomerNote').value = "";

  updateCartDisplay();
  
  // Re-build dashboard analytics
  buildCraxxAnalytics().then(analytics => {
    appAnalytics = analytics;
    renderOrdersCatalog();
    renderOrderHistoryTable();
    
    // Redirect to WhatsApp after brief delay
    setTimeout(() => {
      window.location.href = url;
    }, 250);
  });
}

// --------------------------------------------------------
// ORDER HISTORY TAB
// --------------------------------------------------------
let activeOrderTab = 'create';

function switchOrderTab(tab, btn) {
  activeOrderTab = tab;
  if (btn) {
    document.querySelectorAll('.view-header .chart-tabs button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  document.getElementById('orderTabCreate').hidden = (tab !== 'create');
  document.getElementById('orderTabHistory').hidden = (tab !== 'history');
}

function renderOrderHistoryTable() {
  if (!appAnalytics) return;
  
  let tbody = document.getElementById('orderHistoryTableBody');
  let query = document.getElementById('historySearchInput').value.trim().toLowerCase();
  let statusFilter = document.getElementById('historyFilterStatus').value;

  let filtered = appAnalytics.records.filter(o => {
    if (statusFilter !== 'all' && o.status.toLowerCase() !== statusFilter) return false;
    if (query && !o.customer.toLowerCase().includes(query) && !o.id.toLowerCase().includes(query)) return false;
    return true;
  });

  tbody.innerHTML = filtered.map(o => {
    let itemsText = o.items.map(item => `${item.name} x${item.qty}`).join(', ');
    return `
      <tr>
        <td><strong>#${o.id.slice(-6)}</strong></td>
        <td>${o.customer}</td>
        <td>${new Date(o.createdAt).toLocaleDateString()} ${new Date(o.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
        <td><b>${formatMoney(o.total)}</b></td>
        <td><div style="max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${itemsText}</div></td>
        <td><span class="status-pill ${o.status.toLowerCase()}">${o.status}</span></td>
        <td><button class="add-btn" onclick="openInvoiceModal('${o.id}')">View Invoice</button></td>
      </tr>
    `;
  }).join('') || `<tr><td colspan="7" style="text-align:center; color:var(--text-secondary);">No historical dispatches found matching filters.</td></tr>`;
}

function filterOrderHistory() {
  renderOrderHistoryTable();
}

// --------------------------------------------------------
// INVOICE PREVIEW MODAL
// --------------------------------------------------------
let activeInvoiceOrder = null;

function openInvoiceModal(orderId) {
  if (!appAnalytics) return;
  let order = appAnalytics.records.find(x => x.id === orderId);
  if (!order) return;
  
  activeInvoiceOrder = order;
  let printArea = document.getElementById('invoicePrintArea');
  
  let rowsHtml = order.items.map((item, idx) => {
    let subtotal = item.price * item.qty;
    return `
<tr>
  <td style="padding:4px 0;">${idx + 1}. ${item.name} (${item.gram || 'Original'})</td>
  <td style="text-align:center; padding:4px 0;">${item.qty}</td>
  <td style="text-align:right; padding:4px 0;">₹${item.price}</td>
  <td style="text-align:right; padding:4px 0;">₹${subtotal}</td>
</tr>
    `;
  }).join('');

  printArea.innerHTML = `
    <div style="text-align:center; border-bottom:1px dashed #000; padding-bottom:12px; margin-bottom:12px;">
      <h2 style="margin:0; font-size:1.2rem; font-weight:bold; letter-spacing:1px;">CRAXX DISTRIBUTORS</h2>
      <p style="margin:4px 0; font-size:0.75rem; color:#555;">FMCG Snack Routing Outlet Terminal</p>
      <p style="margin:2px 0; font-size:0.7rem; color:#777;">Dispatch Location: Jogeshwari, Mumbai</p>
    </div>
    
    <div style="display:flex; justify-content:space-between; margin-bottom:12px; font-size:0.75rem;">
      <div>
        <strong>Invoice Code:</strong> #${order.id.slice(-8)}<br>
        <strong>Dispatch Date:</strong> ${new Date(order.createdAt).toLocaleString()}<br>
        <strong>Status:</strong> ${order.status}
      </div>
      <div style="text-align:right;">
        <strong>Customer:</strong> ${order.customer}<br>
        <strong>Route:</strong> local outlet dispatch
      </div>
    </div>
    
    <table style="width:100%; border-collapse:collapse; font-size:0.75rem; margin-bottom:12px; border-bottom:1px dashed #000;">
      <thead>
        <tr style="border-bottom:1px dashed #000;">
          <th style="text-align:left; padding-bottom:4px;">Item Description</th>
          <th style="text-align:center; padding-bottom:4px;">Qty</th>
          <th style="text-align:right; padding-bottom:4px;">Rate</th>
          <th style="text-align:right; padding-bottom:4px;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
    
    <div style="text-align:right; font-size:0.9rem; font-weight:bold; margin-bottom:12px;">
      Net Payable: ₹${order.total.toLocaleString("en-IN")}
    </div>
    
    <div style="text-align:center; font-size:0.7rem; color:#777; border-top:1px dashed #000; padding-top:8px;">
      Thank you for your business. Auto-recorded locally.
    </div>
  `;

  document.getElementById('invoiceModal').hidden = false;
}

function closeInvoiceModal() {
  document.getElementById('invoiceModal').hidden = true;
  activeInvoiceOrder = null;
}

function printInvoiceContents() {
  let w = window.open("", "_blank");
  w.document.write(`<html><head><title>Print Invoice</title></head><body onload="window.print();window.close();">`);
  w.document.write(document.getElementById('invoicePrintArea').innerHTML);
  w.document.write(`</body></html>`);
  w.document.close();
}

function exportInvoiceData(format) {
  if (!activeInvoiceOrder) return;
  let rows = activeInvoiceOrder.items.map(item => ({
    "Product Name": item.name,
    "Size": item.gram,
    "Quantity": item.qty,
    "Price": item.price,
    "Subtotal": item.qty * item.price
  }));
  exportRows(`invoice-${activeInvoiceOrder.id}`, rows, format);
}

// --------------------------------------------------------
// READ-ONLY PRODUCTS CATALOG TABLE
// --------------------------------------------------------
function renderProductsCatalogTable() {
  if (!appAnalytics) return;
  
  let tbody = document.getElementById('catalogListTableBody');
  let query = document.getElementById('catalogSearchInput').value.trim().toLowerCase();
  let categoryFilter = document.getElementById('catalogFilterCategory').value;

  let filtered = appAnalytics.productRows.filter(p => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (query && !p.name.toLowerCase().includes(query) && !p.sku.toLowerCase().includes(query)) return false;
    return true;
  });

  tbody.innerHTML = filtered.map(p => {
    let status = p.currentStock <= 0 ? 'Out of Stock' : (p.currentStock <= p.reorderLevel ? 'Low Stock' : 'In Stock');
    let pillClass = status.toLowerCase().replaceAll(" ", "-");
    
    // Sparkline visual trend placeholder (Premium Detail)
    let sparkSvg = `<svg class="mini-trend" viewBox="0 0 100 30" width="80" height="24" style="overflow:visible;">
      <polyline points="0,15 20,20 40,5 60,25 80,10 100,15" fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round"/>
    </svg>`;

    return `
      <tr>
        <td><strong>${p.sku}</strong></td>
        <td><img src="${p.image || 'assets/images/WhatsApp.svg'}" alt="${p.name}" style="width:36px; height:36px; border-radius:4px; object-fit:cover; border:1px solid var(--glass-border);"></td>
        <td><strong>${p.name}</strong><br><small style="color:var(--text-secondary);">${p.weight || '33gm'}</small></td>
        <td>${p.category}</td>
        <td>${formatMoney(p.price || 75)}</td>
        <td>${formatMoney(p.price || 75)}</td>
        <td><b>${p.currentStock} Patti</b></td>
        <td><span class="status-pill ${pillClass}">${status}</span></td>
        <td>${p.units} patti</td>
      </tr>
    `;
  }).join('') || `<tr><td colspan="10" style="text-align:center; color:var(--text-secondary);">No products matching catalog query.</td></tr>`;
}

function filterCatalogList() {
  renderProductsCatalogTable();
}

// --------------------------------------------------------
// PRODUCT MANAGER (ADMINISTRATOR PANEL)
// --------------------------------------------------------
function renderManagerCatalogTable() {
  if (!appAnalytics) return;
  
  let tbody = document.getElementById('managerCatalogTableBody');
  let query = document.getElementById('managerSearchInput').value.trim().toLowerCase();
  let categoryFilter = document.getElementById('managerFilterCategory').value;
  let stockFilter = document.getElementById('managerFilterStock').value;

  let filtered = appAnalytics.productRows.filter(p => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    
    let status = p.currentStock <= 0 ? 'out' : (p.currentStock <= p.reorderLevel ? 'low' : 'in');
    if (stockFilter !== 'all' && status !== stockFilter) return false;
    
    if (query && !p.name.toLowerCase().includes(query) && !p.sku.toLowerCase().includes(query)) return false;
    return true;
  });

  tbody.innerHTML = filtered.map(p => {
    let status = p.currentStock <= 0 ? 'Out of Stock' : (p.currentStock <= p.reorderLevel ? 'Low Stock' : 'In Stock');
    let pillClass = status.toLowerCase().replaceAll(" ", "-");
    let isChecked = selectedBulkProducts.has(p.name);

    return `
      <tr>
        <td><input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleManagerCheckbox('${p.name.replaceAll("'", "\\'")}', this.checked)" aria-label="Select ${p.name}"></td>
        <td><img src="${p.image || 'assets/images/WhatsApp.svg'}" alt="${p.name}" style="width:36px; height:36px; border-radius:4px; object-fit:cover; border:1px solid var(--glass-border);"></td>
        <td><strong>${p.name}</strong><br><small style="color:var(--text-secondary);">${p.weight || '33gm'}</small></td>
        <td>${p.category}</td>
        <td>${formatMoney(p.price)}</td>
        <td><b>${p.currentStock} Patti</b></td>
        <td><span class="status-pill ${pillClass}">${status}</span></td>
        <td><code>${p.barcode || '---'}</code></td>
        <td><button class="add-btn" style="background:var(--bg-tertiary);" onclick="openProductFormModal('${p.name.replaceAll("'", "\\'")}')">Edit</button></td>
      </tr>
    `;
  }).join('') || `<tr><td colspan="10" style="text-align:center; color:var(--text-secondary);">No products loaded in editor list.</td></tr>`;

  renderManagerLowStockAlerts();
  renderManagerHistory();
}

function renderManagerLowStockAlerts() {
  if (!appAnalytics) return;
  let alertsDiv = document.getElementById('managerLowStockAlerts');
  let lowItems = appAnalytics.productRows.filter(p => p.currentStock <= p.reorderLevel);
  
  if (lowItems.length === 0) {
    alertsDiv.innerHTML = `<div style="grid-column: span 3; text-align:center; font-size:0.85rem; color:var(--color-success); padding:10px 0;">All warehouse catalog stock scales verified healthy.</div>`;
    return;
  }

  alertsDiv.innerHTML = lowItems.slice(0, 3).map(p => `
    <article style="background:rgba(245,158,11,0.03); border:1px solid rgba(245,158,11,0.15); border-radius:var(--radius-sm); padding:16px; display:flex; align-items:center; justify-content:space-between; width:100%;">
      <div>
        <strong style="color:var(--color-warning); font-size:0.9rem; font-weight:600; display:block; margin-bottom:4px;">${p.name}</strong>
        <span style="font-size:0.8rem; color:var(--text-secondary);">${p.currentStock} Patti remaining (reorder limit ${p.reorderLevel})</span>
      </div>
      <button class="add-btn" onclick="openProductFormModal('${p.name.replaceAll("'", "\\'")}')">Restock</button>
    </article>
  `).join('');
}

function renderManagerHistory() {
  let hist = readJson(CRAXX_PRODUCT_HISTORY_KEY, []);
  let tbody = document.getElementById('managerModificationHistory');
  
  tbody.innerHTML = hist.slice(0, 5).map(x => `
    <tr>
      <td>${new Date(x.date).toLocaleDateString()} ${new Date(x.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
      <td><strong>${x.user || 'System Manager'}</strong></td>
      <td>${x.action}</td>
    </tr>
  `).join('') || `<tr><td colspan="3" style="text-align:center; color:var(--text-secondary);">No catalog changes recorded yet.</td></tr>`;
}

function filterManagerCatalog() {
  renderManagerCatalogTable();
}

function toggleManagerCheckbox(name, checked) {
  if (checked) {
    selectedBulkProducts.add(name);
  } else {
    selectedBulkProducts.delete(name);
  }
  document.getElementById('bulkSelectedText').textContent = `${selectedBulkProducts.size} products selected`;
}

function toggleAllBulkCheckboxes(checked) {
  if (!appAnalytics) return;
  if (checked) {
    appAnalytics.productRows.forEach(p => selectedBulkProducts.add(p.name));
  } else {
    selectedBulkProducts.clear();
  }
  document.getElementById('bulkSelectedText').textContent = `${selectedBulkProducts.size} products selected`;
  renderManagerCatalogTable();
}

// Bulk adjustments
function executeBulkAction() {
  if (selectedBulkProducts.size === 0) {
    alert("Please select target check-boxes first");
    return;
  }

  let type = document.getElementById('bulkActionType').value;
  let val = document.getElementById('bulkActionValue').value.trim();
  
  if (!val && type !== 'delete') {
    alert("Please enter adjustment value parameter");
    return;
  }

  let catalog = getProductCatalog();
  let stock = getStoredStock();

  selectedBulkProducts.forEach(name => {
    if (type === 'delete') {
      delete catalog[name];
      delete stock[name];
    } else if (type === 'price') {
      if (catalog[name]) catalog[name].price = Number(val);
    } else if (type === 'stock') {
      stock[name] = Number(val);
    } else if (type === 'category') {
      if (catalog[name]) catalog[name].category = val;
    }
  });

  saveProductCatalogMap(catalog);
  writeJson("stock", stock);

  // Add modify logging
  let logList = readJson(CRAXX_PRODUCT_HISTORY_KEY, []);
  logList.unshift({
    date: new Date().toISOString(),
    user: "Ravi Yadav",
    action: `Bulk Action [${type.toUpperCase()}] applied to ${selectedBulkProducts.size} snack items`
  });
  writeJson(CRAXX_PRODUCT_HISTORY_KEY, logList.slice(0, 100));

  recordActivity("Bulk catalog update", `${selectedBulkProducts.size} items modified`);
  localStorage.removeItem(CRAXX_ANALYTICS_KEY);
  selectedBulkProducts.clear();
  document.getElementById('bulkSelectedText').textContent = "0 products selected";
  document.getElementById('bulkSelectAllToggle').checked = false;

  initViewData('product-manager');
  alert("Bulk adjustments saved successfully");
}

// Add/Edit Product Modal Dialog Form
let selectedFormImageBase64 = null;

function openProductFormModal(name) {
  editingProductSku = name || null;
  let catalog = getProductCatalog();
  let stock = getStoredStock();
  
  let p = catalog[name] || {
    name: "", category: "savouries", sku: "", barcode: "", price: 75, cost: 48, weight: "33gm", currentStock: 100, reorderLevel: 12, description: "", image: ""
  };
  
  let isEditing = !!name;
  document.getElementById('productModalTitle').textContent = isEditing ? `Modify Snack Parameters` : `Create New Snack Item`;
  
  document.getElementById('modalProductName').value = p.name || "";
  document.getElementById('modalProductCategory').value = p.category || "savouries";
  document.getElementById('modalProductSku').value = p.sku || "";
  document.getElementById('modalProductBarcode').value = p.barcode || "";
  document.getElementById('modalProductMrp').value = p.mrp || p.price || 75;
  document.getElementById('modalProductPrice').value = p.price || 75;
  document.getElementById('modalProductCost').value = p.cost || p.costPrice || 48;
  document.getElementById('modalProductWeight').value = p.weight || p.gram || "33gm";
  let originalStock = 0;
  let pcsStock = 0;
  if (isEditing && stock[name]) {
    if (typeof stock[name] === "object") {
      originalStock = Number(stock[name].original ?? 0);
      pcsStock = Number(stock[name]["52gm__pcs"] ?? 0);
    } else {
      originalStock = Number(stock[name] ?? 0);
    }
  } else if (!isEditing) {
    originalStock = 100;
    pcsStock = 0;
  }
  document.getElementById('modalProductStock').value = originalStock;
  document.getElementById('modalProductStockPcs').value = pcsStock;
  document.getElementById('modalProductReorder').value = p.reorderLevel || 12;
  document.getElementById('modalProductDescription').value = p.description || "";
  document.getElementById('modalProductImageUrl').value = p.image || "";
  
  let preview = document.getElementById('modalProductImagePreview');
  let span = document.getElementById('modalProductImageSpan');
  if (p.image) {
    preview.src = p.image;
    preview.style.display = "block";
    span.style.display = "none";
  } else {
    preview.style.display = "none";
    span.style.display = "block";
  }

  selectedFormImageBase64 = p.image || null;
  document.getElementById('productEditModal').hidden = false;
}

function closeProductFormModal() {
  document.getElementById('productEditModal').hidden = true;
  editingProductSku = null;
  selectedFormImageBase64 = null;
}

function handleModalImageUpload(file) {
  if (!file) return;
  let reader = new FileReader();
  reader.onload = event => {
    selectedFormImageBase64 = event.target.result;
    let preview = document.getElementById('modalProductImagePreview');
    let span = document.getElementById('modalProductImageSpan');
    preview.src = selectedFormImageBase64;
    preview.style.display = "block";
    span.style.display = "none";
    document.getElementById('modalProductImageUrl').value = ""; // Clear url if file uploaded
  };
  reader.readAsDataURL(file);
}

function removeModalProductImage() {
  selectedFormImageBase64 = null;
  document.getElementById('modalProductImagePreview').style.display = "none";
  document.getElementById('modalProductImageSpan').style.display = "block";
  document.getElementById('modalProductImageUrl').value = "";
}

function saveProductEditorModal(event) {
  event.preventDefault();
  
  let name = document.getElementById('modalProductName').value.trim();
  let category = document.getElementById('modalProductCategory').value;
  let sku = document.getElementById('modalProductSku').value.trim();
  let barcode = document.getElementById('modalProductBarcode').value.trim();
  let mrp = Number(document.getElementById('modalProductMrp').value || 0);
  let price = Number(document.getElementById('modalProductPrice').value || 0);
  let cost = Number(document.getElementById('modalProductCost').value || 0);
  let weight = document.getElementById('modalProductWeight').value.trim();
  let stockValue = Number(document.getElementById('modalProductStock').value || 0);
  let stockValuePcs = Number(document.getElementById('modalProductStockPcs').value || 0);
  let reorder = Number(document.getElementById('modalProductReorder').value || 0);
  let desc = document.getElementById('modalProductDescription').value.trim();
  let imageUrl = document.getElementById('modalProductImageUrl').value.trim();
  
  let img = imageUrl || selectedFormImageBase64 || "";

  let catalog = getProductCatalog();
  let stock = getStoredStock();

  // If renaming product
  if (editingProductSku && editingProductSku !== name) {
    delete catalog[editingProductSku];
    stock[name] = stock[editingProductSku] || { original: 0, "52gm__pcs": 0 };
    delete stock[editingProductSku];
  }

  catalog[name] = {
    name,
    category,
    sku,
    barcode,
    mrp,
    price,
    cost,
    weight,
    reorderLevel: reorder,
    description: desc,
    image: img
  };

  if (typeof stock[name] !== "object" || stock[name] === null) {
    stock[name] = { original: 0, "52gm__pcs": 0 };
  }
  stock[name].original = stockValue;
  stock[name]["52gm__pcs"] = stockValuePcs;

  saveProductCatalogMap(catalog);
  writeJson("stock", stock);

  // Modification history logs
  let hist = readJson(CRAXX_PRODUCT_HISTORY_KEY, []);
  hist.unshift({
    date: new Date().toISOString(),
    user: "Ravi Yadav",
    action: editingProductSku ? `Modified parameters of snack: ${name}` : `Registered new snack item: ${name}`
  });
  writeJson(CRAXX_PRODUCT_HISTORY_KEY, hist.slice(0, 100));

  recordActivity(editingProductSku ? "Product details modified" : "Product catalog created", name);
  localStorage.removeItem(CRAXX_ANALYTICS_KEY);
  
  closeProductFormModal();
  initViewData('product-manager');
  
  alert("Snack parameters saved successfully");
}

// Drag & drop handlers
function setupFormImageDragAndDrop() {
  let dropzone = document.getElementById('modalProductImageDrop');
  if (!dropzone) return;

  dropzone.addEventListener('dragover', e => {
    e.preventDefault();
    dropzone.classList.add('dragging');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragging');
  });

  dropzone.addEventListener('drop', e => {
    e.preventDefault();
    dropzone.classList.remove('dragging');
    if (e.dataTransfer.files.length) {
      handleModalImageUpload(e.dataTransfer.files[0]);
    }
  });
}

// --------------------------------------------------------
// PRODUCT SCANNER (QR/BARCODE RECOGNITION)
// --------------------------------------------------------
let scannerHtml5Qrcode = null;
let isScannerActive = false;

function initScannerPage() {
  let select = document.getElementById('mockScannerSelect');
  let catalog = getProductCatalog();
  
  select.innerHTML = Object.values(catalog).map(p => `
    <option value="${p.barcode || p.sku}">${p.name} (${p.barcode || p.sku})</option>
  `).join('');
  
  // Clean last scan preview
  document.getElementById('scannerResultContainer').hidden = true;
  setupScannerCameraSelector();
}

function setupScannerCameraSelector() {
  let select = document.getElementById('scannerDeviceSelect');
  select.innerHTML = "";
  
  if (typeof Html5Qrcode === "undefined") {
    select.innerHTML = `<option value="">System Camera (Library Offline)</option>`;
    return;
  }

  Html5Qrcode.getCameras().then(devices => {
    if (devices && devices.length) {
      devices.forEach(device => {
        select.innerHTML += `<option value="${device.id}">${device.label || 'Camera ' + device.id}</option>`;
      });
    } else {
      select.innerHTML = `<option value="">No cameras detected</option>`;
    }
  }).catch(() => {
    select.innerHTML = `<option value="">No permissions / camera error</option>`;
  });
}

function toggleScannerCameraStream() {
  if (isScannerActive) {
    stopScannerCamera();
  } else {
    startScannerCamera();
  }
}

function startScannerCamera() {
  if (typeof Html5Qrcode === "undefined") {
    alert("Camera scanning engine unavailable. Please upload files or use the mock scanner tools.");
    return;
  }

  let deviceId = document.getElementById('scannerDeviceSelect').value;
  let btn = document.getElementById('scannerToggleCameraBtn');
  
  scannerHtml5Qrcode = new Html5Qrcode("scannerCameraViewport");
  
  let config = { fps: 10, qrbox: { width: 250, height: 250 } };
  
  btn.textContent = "Connecting Camera...";
  
  scannerHtml5Qrcode.start(
    deviceId ? { exact: deviceId } : { facingMode: "environment" },
    config,
    (decodedText) => {
      // Success scan
      handleScanSuccess(decodedText);
      stopScannerCamera();
    },
    () => {
      // scan fail (keep trying)
    }
  ).then(() => {
    isScannerActive = true;
    btn.textContent = "Stop Camera Scanner";
  }).catch(err => {
    btn.textContent = "Start Camera Scanner";
    alert(`Could not access camera feed: ${err}`);
  });
}

function stopScannerCamera() {
  let btn = document.getElementById('scannerToggleCameraBtn');
  if (scannerHtml5Qrcode && isScannerActive) {
    scannerHtml5Qrcode.stop().then(() => {
      isScannerActive = false;
      btn.textContent = "Start Camera Scanner";
    });
  }
}

async function handleScannerImageUpload(file) {
  if (!file) return;
  
  if (typeof Html5Qrcode === "undefined") {
    alert("Scanner engine offline. Cannot parse image barcode.");
    return;
  }

  try {
    let resizedFile = await compressAndResizeImage(file);
    let reader = new Html5Qrcode("scannerCameraViewport");
    reader.scanFile(resizedFile, true)
      .then(decodedText => {
        handleScanSuccess(decodedText);
      })
      .catch(() => {
        alert("No barcode or QR code recognized in the selected image. Try a mock scanner simulation.");
      });
  } catch (err) {
    alert("Error resizing image: " + err);
  }
}

let activeScannedProduct = null;

function handleScanSuccess(code) {
  playBeepSound();
  let catalog = getProductCatalog();
  let stock = getStoredStock();

  // Find product by barcode or SKU
  let product = Object.values(catalog).find(p => p.barcode === code || p.sku === code || p.name.toLowerCase() === code.toLowerCase());
  
  let container = document.getElementById('scannerResultContainer');
  
  if (!product) {
    alert(`Product not registered. Code matched: ${code}`);
    container.hidden = true;
    return;
  }

  activeScannedProduct = product;
  
  let stockVal = stock[product.name]?.original ?? stock[product.name] ?? 0;
  
  document.getElementById('scannerLookupImage').src = product.image || 'assets/images/WhatsApp.svg';
  document.getElementById('scannerLookupName').textContent = product.name;
  document.getElementById('scannerLookupSku').textContent = `SKU: ${product.sku} • Barcode: ${product.barcode || 'N/A'}`;
  document.getElementById('scannerLookupPrice').textContent = `Price: ₹${product.price}`;
  document.getElementById('scannerLookupStock').textContent = `Warehouse reserves: ${stockVal} Patti left`;
  
  let statusBadge = document.getElementById('scannerLookupStatus');
  statusBadge.className = "status-pill";
  if (stockVal <= 0) {
    statusBadge.classList.add('out-stock');
    statusBadge.textContent = "Out of Stock";
  } else if (stockVal <= product.reorderLevel) {
    statusBadge.classList.add('low-stock');
    statusBadge.textContent = "Low Stock";
  } else {
    statusBadge.classList.add('healthy');
    statusBadge.textContent = "Healthy Reserves";
  }

  container.hidden = false;
  container.scrollIntoView({ behavior: "smooth", block: "center" });
}

function executeMockBarcodeScan() {
  let code = document.getElementById('mockScannerSelect').value;
  handleScanSuccess(code);
}

function addScannedItemToCart() {
  if (!activeScannedProduct) return;
  
  let price = activeScannedProduct.price;
  let name = activeScannedProduct.name;
  let sku = activeScannedProduct.sku;
  let gram = activeScannedProduct.weight || "";
  
  let cartKey = [name, gram, ""].join("__");
  let item = appCart.find(x => x.key === cartKey);
  
  if (item) {
    item.qty++;
  } else {
    appCart.push({
      key: cartKey,
      productName: name,
      name,
      gram,
      unit: "",
      price,
      qty: 1
    });
  }

  updateCartDisplay();
  alert(`${name} added to cart. View Orders page to compile WhatsApp dispatch.`);
}

// --------------------------------------------------------
// INVENTORY: RESERVES ADJUSTMENT & TESSERACT OCR
// --------------------------------------------------------
function renderInventoryCards() {
  if (!appAnalytics) return;
  
  let grid = document.getElementById('inventoryCardsGrid');
  let query = document.getElementById('inventorySearchInput').value.trim().toLowerCase();
  let stock = getStoredStock();

  let filtered = appAnalytics.productRows.filter(p => {
    if (query && !p.name.toLowerCase().includes(query) && !p.sku.toLowerCase().includes(query)) return false;
    return true;
  });

  grid.innerHTML = filtered.map(p => {
    let originalStock = Number(stock[p.name]?.original ?? stock[p.name] ?? 0);
    let pcsStock = Number(stock[p.name]?.["52gm__pcs"] ?? 0);
    let safeName = p.name.replaceAll("'", "\\'");

    return `
      <div class="stock-card" id="stock-card-${p.sku}">
        <img class="stock-thumb" src="${p.image || 'assets/images/WhatsApp.svg'}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>${p.weight || 'Original'} • SKU: ${p.sku}</p>
        
        <!-- Original weight variant -->
        <div class="stock-variant">
          <h2>Original Patti (${p.weight || 'Original'})</h2>
          <label class="stock-input-label">
            In-Stock Patti
            <input type="number" min="0" value="${originalStock}" onchange="updateInventoryInput('${safeName}', '', '', this.value)">
          </label>
          <div class="stock-buttons">
            <button onclick="changeInventoryValue('${safeName}', '', '', 10)">+10</button>
            <button onclick="changeInventoryValue('${safeName}', '', '', 1)">+1</button>
            <button onclick="changeInventoryValue('${safeName}', '', '', -1)">-1</button>
            <button onclick="changeInventoryValue('${safeName}', '', '', -10)">-10</button>
          </div>
        </div>

        <!-- 52gm pcs variant -->
        <div class="stock-variant">
          <h2>Large variant (52gm pcs)</h2>
          <label class="stock-input-label">
            In-Stock PCS
            <input type="number" min="0" value="${pcsStock}" onchange="updateInventoryInput('${safeName}', '52gm', 'pcs', this.value)">
          </label>
          <div class="stock-buttons">
            <button onclick="changeInventoryValue('${safeName}', '52gm', 'pcs', 10)">+10</button>
            <button onclick="changeInventoryValue('${safeName}', '52gm', 'pcs', 1)">+1</button>
            <button onclick="changeInventoryValue('${safeName}', '52gm', 'pcs', -1)">-1</button>
            <button onclick="changeInventoryValue('${safeName}', '52gm', 'pcs', -10)">-10</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function updateInventoryInput(name, gram, unit, value) {
  let stock = getStoredStock();
  let next = Math.max(0, Number(value || 0));
  let key = gram === "52gm" ? "52gm__pcs" : "original";
  
  if (typeof stock[name] !== "object" || stock[name] === null) {
    stock[name] = { original: Number(stock[name] || 0) };
  }
  stock[name][key] = next;

  writeJson("stock", stock);
  
  // Notification check for stock levels
  checkInventoryReorderLevel(name, gram, unit, next);

  localStorage.removeItem(CRAXX_ANALYTICS_KEY);
  buildCraxxAnalytics().then(analytics => {
    appAnalytics = analytics;
  });
}

function changeInventoryValue(name, gram, unit, delta) {
  let stock = getStoredStock();
  let key = gram === "52gm" ? "52gm__pcs" : "original";
  
  if (typeof stock[name] !== "object" || stock[name] === null) {
    stock[name] = { original: Number(stock[name] || 0) };
  }
  
  let current = Number(stock[name][key] || 0);
  let next = Math.max(0, current + delta);
  stock[name][key] = next;

  writeJson("stock", stock);
  checkInventoryReorderLevel(name, gram, unit, next);

  localStorage.removeItem(CRAXX_ANALYTICS_KEY);
  buildCraxxAnalytics().then(analytics => {
    appAnalytics = analytics;
    renderInventoryCards();
  });
}

function checkInventoryReorderLevel(name, gram, unit, val) {
  let catalog = getProductCatalog();
  let limit = catalog[name]?.reorderLevel || 12;
  
  if (val <= 0) {
    triggerNotification("out-stock", `Out of Stock: ${name}`, `Warehouse reserves for ${name} ${gram ? '(' + gram + ')' : ''} depleted to 0.`);
  } else if (val <= limit) {
    triggerNotification("low-stock", `Low Stock Alert: ${name}`, `Only ${val} ${unit || 'Patti'} remaining in reserves for ${name}.`);
  }
}

function filterInventoryList() {
  renderInventoryCards();
}

function saveInventoryReserves() {
  let stock = getStoredStock();
  let hist = readJson("stockHistory", []);
  
  hist.unshift({
    time: new Date().toLocaleString(),
    stock: JSON.parse(JSON.stringify(stock))
  });
  writeJson("stockHistory", hist.slice(0, 10));
  
  recordActivity("Warehouse reserves saved", "Manual inventory write");
  
  renderInventorySavesHistory();
  alert("Warehouse reserves logged successfully");
}

function renderInventorySavesHistory() {
  let hist = readJson("stockHistory", []);
  let list = document.getElementById('inventoryHistoricalSaves');
  if (!list) return;
  
  list.innerHTML = hist.map(x => `
    <div class="activity-item" style="padding-bottom:12px;">
      <strong>Inventory snapshot recorded</strong>
      <span>${Object.keys(x.stock).length} snack items synced.</span>
      <time>${x.time}</time>
    </div>
  `).join('') || `<div style="color:var(--text-muted); font-size:0.85rem; padding: 10px 0;">No manual reserves logged yet.</div>`;
}

// OCR Stock Sheet Upload Parser (Tesseract.js integration)
let currentOcrStockResult = [];

function handleStockScanImageFile(file) {
  if (!file) return;
  document.getElementById('stockScanStatusText').textContent = "Status: Image uploaded. Click 'Run OCR Engine'.";
}

async function executeStockSheetOCR() {
  let input = document.getElementById('stockScanFileInput');
  let textBox = document.getElementById('stockScanOcrText');
  let status = document.getElementById('stockScanStatusText');
  
  if (!input.files || !input.files[0]) {
    alert("Please select or capture a stock sheet photo first");
    return;
  }

  if (typeof Tesseract === "undefined") {
    alert("OCR engine offline. Connect online to load parsing engines.");
    return;
  }

  status.textContent = "Status: Resizing image...";
  
  try {
    let resizedFile = await compressAndResizeImage(input.files[0]);
    status.textContent = "Status: Initiating OCR Engine...";
    
    let result = await Tesseract.recognize(
      resizedFile,
      "eng",
      {
        logger: m => {
          if (m.status === "recognizing text") {
            status.textContent = `Status: Parsing Text... ${Math.round(m.progress * 100)}%`;
          }
        }
      }
    );

    textBox.value = result.data.text;
    
    // Parse recognized text using exact stock.js matching engine
    currentOcrStockResult = parseStockText(result.data.text);
    
    renderOcrPreviewTable();
    
    status.textContent = `Status: Parsing complete. ${currentOcrStockResult.length} items parsed.`;
  } catch (err) {
    status.textContent = "Status: Parsing error.";
    alert(`OCR Failure: ${err}`);
  }
}

function renderOcrPreviewTable() {
  let wrap = document.getElementById('stockScanPreviewWrapper');
  let tbody = document.getElementById('stockScanPreviewBody');
  
  if (currentOcrStockResult.length === 0) {
    wrap.hidden = true;
    return;
  }

  tbody.innerHTML = currentOcrStockResult.map(item => `
    <tr>
      <td><strong>${item.product}</strong></td>
      <td>${item.unit === "pcs" ? "52gm pcs" : "Original Patti"}</td>
      <td><b>${item.qty} units</b></td>
    </tr>
  `).join('');
  
  wrap.hidden = false;
}

function applyOcrDetectedStock() {
  if (currentOcrStockResult.length === 0) {
    alert("No OCR items detected to replace stock values. Scan or type first.");
    return;
  }

  let stock = getStoredStock();
  currentOcrStockResult.forEach(item => {
    let key = item.gram === "52gm" ? "52gm__pcs" : "original";
    if (typeof stock[item.product] !== "object" || stock[item.product] === null) {
      stock[item.product] = { original: Number(stock[item.product] || 0) };
    }
    stock[item.product][key] = item.qty;
  });

  writeJson("stock", stock);
  localStorage.removeItem(CRAXX_ANALYTICS_KEY);
  
  buildCraxxAnalytics().then(analytics => {
    appAnalytics = analytics;
    renderInventoryCards();
    currentOcrStockResult = [];
    document.getElementById('stockScanPreviewWrapper').hidden = true;
    document.getElementById('stockScanStatusText').textContent = "Status: Replaced stocks successfully.";
    alert("Stock sheets values written to warehouse reserves.");
  });
}

// --------------------------------------------------------
// CUSTOMERS CRM & DOSSIER PROFILE
// --------------------------------------------------------
function renderCrmCustomerTable() {
  if (!appAnalytics) return;
  
  let tbody = document.getElementById('crmCustomerTableBody');
  let query = document.getElementById('crmSearchInput').value.trim().toLowerCase();
  
  let merged = mergeCustomerLists(appAnalytics.records);
  
  let filtered = merged.filter(c => {
    if (query && !c.name.toLowerCase().includes(query) && !c.address.toLowerCase().includes(query)) return false;
    return true;
  });

  tbody.innerHTML = filtered.map(c => {
    let stats = getCustomerLifetimeStats(c.name, appAnalytics.records);
    let rank = getCrmRankingTag(stats.revenue);
    let lastOrderDate = stats.lastOrder ? new Date(stats.lastOrder).toLocaleDateString() : 'Never';

    return `
      <tr>
        <td><strong>${c.name}</strong><br><small style="color:var(--text-secondary);">${c.address}</small></td>
        <td>${c.phone || '---'}</td>
        <td>${c.address}</td>
        <td><b>${stats.orders} dispatches</b></td>
        <td><b>${formatMoney(stats.revenue)}</b></td>
        <td><span class="status-pill ${rank.toLowerCase().replaceAll(" ", "-")}">${rank}</span></td>
        <td>${lastOrderDate}</td>
        <td><button class="add-btn" onclick="openCustomerProfileDossier('${encodeURIComponent(c.name)}')">View Profile</button></td>
      </tr>
    `;
  }).join('') || `<tr><td colspan="8" style="text-align:center; color:var(--text-secondary);">No customer CRM entries matched filters.</td></tr>`;
}

function getCustomerLifetimeStats(name, records) {
  let filtered = records.filter(o => o.customer.trim().toLowerCase() === name.trim().toLowerCase());
  let revenue = filtered.reduce((sum, o) => sum + o.total, 0);
  let units = filtered.reduce((sum, o) => sum + o.items.reduce((itemSum, item) => itemSum + item.qty, 0), 0);
  let lastOrder = filtered.length ? filtered[0].createdAt : null;
  
  // Category splits
  let categories = {};
  filtered.forEach(o => {
    o.items.forEach(item => {
      let catalog = getProductCatalog();
      let cat = catalog[item.name]?.category || 'savouries';
      categories[cat] = (categories[cat] || 0) + item.qty;
    });
  });

  return {
    orders: filtered.length,
    revenue,
    units,
    lastOrder,
    categories,
    records: filtered
  };
}

function getCrmRankingTag(revenue) {
  if (revenue >= 50000) return "Platinum Client";
  if (revenue >= 15000) return "Gold Client";
  if (revenue >= 5000) return "Silver Client";
  return "Bronze Client";
}

function filterCrmList() {
  renderCrmCustomerTable();
}

function openCustomerProfileDossier(encodedName) {
  window.location.hash = `#customer-profile?name=${encodedName}`;
}

function renderCustomerProfileDossier(name) {
  if (!name || !appAnalytics) return;
  
  let merged = mergeCustomerLists(appAnalytics.records);
  let client = merged.find(c => c.name.toLowerCase() === name.toLowerCase());
  if (!client) return;

  let stats = getCustomerLifetimeStats(client.name, appAnalytics.records);
  let rank = getCrmRankingTag(stats.revenue);
  
  document.getElementById('clientProfileTitle').textContent = client.name;
  document.getElementById('clientProfileName').textContent = client.name;
  document.getElementById('clientProfileInitials').textContent = client.name.slice(0,2).toUpperCase();
  document.getElementById('clientProfilePhone').textContent = client.phone || 'N/A';
  document.getElementById('clientProfileAddress').textContent = client.address;
  
  let rankBadge = document.getElementById('clientProfileRank');
  rankBadge.textContent = rank;
  rankBadge.className = `status-pill ${rank.toLowerCase().replaceAll(" ", "-")}`;

  document.getElementById('clientDossierSpent').textContent = formatMoney(stats.revenue);
  document.getElementById('clientDossierOrders').textContent = stats.orders;
  document.getElementById('clientDossierUnits').textContent = stats.units;

  // New Shop Details calculations
  let firstOrderDate = stats.records.length ? new Date(stats.records[stats.records.length - 1].createdAt).toLocaleDateString() : 'Never';
  document.getElementById('clientProfileFirstOrder').textContent = firstOrderDate;

  let lastOrderDate = stats.lastOrder ? new Date(stats.lastOrder).toLocaleDateString() : 'Never';
  document.getElementById('clientProfileLastOrder').textContent = lastOrderDate;

  let aovVal = stats.orders > 0 ? stats.revenue / stats.orders : 0;
  document.getElementById('clientProfileAov').textContent = formatMoney(aovVal);

  let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let dayCounts = {};
  stats.records.forEach(o => {
    let d = new Date(o.createdAt).getDay();
    dayCounts[d] = (dayCounts[d] || 0) + 1;
  });
  let maxCount = -1;
  let preferredDayIdx = -1;
  Object.keys(dayCounts).forEach(d => {
    if (dayCounts[d] > maxCount) {
      maxCount = dayCounts[d];
      preferredDayIdx = Number(d);
    }
  });
  let preferredDay = preferredDayIdx !== -1 ? days[preferredDayIdx] : "None";
  document.getElementById('clientProfilePreferredDay').textContent = preferredDay;

  // Calculate Weekly and Monthly reports
  let now = new Date();
  
  let weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  let dayOfWeek = weekStart.getDay();
  let diffToMonday = weekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  weekStart.setDate(diffToMonday);
  
  let monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  
  let weeklyPatti = 0;
  let weeklyPcs = 0;
  let weeklyCost = 0;
  
  let monthlyPatti = 0;
  let monthlyPcs = 0;
  let monthlyCost = 0;
  
  stats.records.forEach(order => {
    let orderDate = new Date(order.createdAt);
    let isThisWeek = orderDate >= weekStart;
    let isThisMonth = orderDate >= monthStart;
    
    let orderPatti = 0;
    let orderPcs = 0;
    let orderCost = Number(order.total || 0);
    
    let orderItems = Array.isArray(order.items) ? order.items : [];
    orderItems.forEach(item => {
      let qty = Number(item.qty || 0);
      if (item.unit === "pcs") {
        orderPcs += qty;
      } else {
        orderPatti += qty;
      }
    });
    
    if (isThisWeek) {
      weeklyPatti += orderPatti;
      weeklyPcs += orderPcs;
      weeklyCost += orderCost;
    }
    if (isThisMonth) {
      monthlyPatti += orderPatti;
      monthlyPcs += orderPcs;
      monthlyCost += orderCost;
    }
  });
  
  document.getElementById('clientWeeklyPatti').textContent = `${weeklyPatti} Patti`;
  document.getElementById('clientWeeklyPcs').textContent = `${weeklyPcs} PCS`;
  document.getElementById('clientWeeklyCost').textContent = formatMoney(weeklyCost);
  
  document.getElementById('clientMonthlyPatti').textContent = `${monthlyPatti} Patti`;
  document.getElementById('clientMonthlyPcs').textContent = `${monthlyPcs} PCS`;
  document.getElementById('clientMonthlyCost').textContent = formatMoney(monthlyCost);

  // Draw Customer Order Trend Chart
  let recentOrders = [...stats.records].reverse().slice(-10);
  let chartData = recentOrders.map(o => ({
    label: new Date(o.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    revenue: o.total
  }));
  let chartSvg = document.getElementById('clientDossierChart');
  if (chartSvg) {
    if (chartData.length === 0) {
      chartSvg.innerHTML = `<text x="50%" y="50%" fill="var(--text-muted)" text-anchor="middle" font-size="12">No transactions recorded</text>`;
    } else {
      drawLineChart(chartSvg, chartData, 'revenue', '#6366f1');
    }
  }

  // CRM Automated Behavior Analysis (Pros & Cons)
  let pros = [];
  let cons = [];
  
  if (stats.revenue >= 30000) {
    pros.push("High Lifetime Outflow (Premium Tier client)");
  } else if (stats.revenue >= 10000) {
    pros.push("Consistent contribution to route sales volume");
  } else if (stats.revenue > 0) {
    cons.push("Low lifetime spend; early stage or low-priority outlet");
  }
  
  if (stats.orders >= 8) {
    pros.push("High Order Frequency (active recurring outlet)");
  } else if (stats.orders >= 3) {
    pros.push("Regular dispatch cycles established");
  } else if (stats.orders > 0) {
    cons.push("Sporadic purchase frequency (unstable outlet cycles)");
  }
  
  if (aovVal >= 1500) {
    pros.push("High Average Order Value (AOV > ₹1,500 per dispatch)");
  } else if (aovVal >= 800) {
    pros.push("Healthy Average Order Value (AOV > ₹800)");
  } else if (aovVal > 0) {
    cons.push("Low Average Order Value (AOV < ₹800; expensive delivery logistics)");
  }
  
  if (stats.lastOrder) {
    let lastDate = new Date(stats.lastOrder);
    let daysSinceLast = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLast <= 5) {
      pros.push("Active customer: ordered within the last 5 days");
    } else if (daysSinceLast > 15) {
      cons.push(`Churn Risk: No dispatches in the last ${Math.round(daysSinceLast)} days!`);
    }
  } else {
    cons.push("Inactive: No recorded historical dispatches!");
  }
  
  let pattiBought = false;
  let pcsBought = false;
  stats.records.forEach(o => {
    o.items.forEach(item => {
      if (item.unit === "pcs") pcsBought = true;
      else pattiBought = true;
    });
  });
  if (pattiBought && pcsBought) {
    pros.push("Diverse buyer: purchases both bulk Patti and PCS items");
  } else if (pattiBought) {
    pros.push("Bulk focus: buys standard Patti cases");
  } else if (pcsBought) {
    cons.push("Limited buyer: purchases single pieces only (no bulk Patti)");
  }

  if (pros.length === 0) pros.push("No specific strengths recorded.");
  if (cons.length === 0) cons.push("No specific risks recorded.");
  
  document.getElementById('clientProsList').innerHTML = pros.map(p => `<li style="margin-bottom:6px;">${p}</li>`).join('');
  document.getElementById('clientConsList').innerHTML = cons.map(c => `<li style="margin-bottom:6px;">${c}</li>`).join('');

  // Render Category Favorites
  let totalCatUnits = Object.values(stats.categories).reduce((a,b)=>a+b, 0) || 1;
  let barsHtml = Object.keys(stats.categories).map(cat => {
    let units = stats.categories[cat];
    let percent = Math.round((units / totalCatUnits) * 100);
    return `
      <div class="bar-row">
        <span style="text-transform:capitalize;">${cat}</span>
        <div><i style="width:${percent}%"></i></div>
        <b>${units} items</b>
      </div>
    `;
  }).join('') || `<div style="color:var(--text-muted); font-size:0.85rem; padding: 10px 0;">No category history cataloged.</div>`;
  
  document.getElementById('clientFavoriteProducts').innerHTML = barsHtml;

  // Render Timeline Node Dispatch Records
  let timeline = document.getElementById('clientPurchaseTimeline');
  timeline.innerHTML = stats.records.slice(0, 6).map(o => {
    let itemsText = o.items.map(item => `${item.name} x${item.qty}`).join(', ');
    return `
      <div class="timeline-node">
        <div class="timeline-icon">🛒</div>
        <div class="timeline-content">
          <header>
            <h4>Dispatch #${o.id.slice(-6)}</h4>
            <time>${new Date(o.createdAt).toLocaleDateString()} ${new Date(o.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</time>
          </header>
          <p>Total Invoice Bill: <strong>${formatMoney(o.total)}</strong>. Items: ${itemsText}</p>
        </div>
      </div>
    `;
  }).join('') || `<div style="color:var(--text-muted); font-size:0.85rem; padding: 10px 0;">No dispatch timelines recorded.</div>`;
}

// --------------------------------------------------------
// ANALYTICS BI VIEW
// --------------------------------------------------------
let activeAnalyticsTab = 'revenue';

function switchAnalyticsTab(tab, btn) {
  activeAnalyticsTab = tab;
  if (btn) {
    document.querySelectorAll('.view-header .chart-tabs button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  document.getElementById('analyticsTabRevenue').hidden = (tab !== 'revenue');
  document.getElementById('analyticsTabProfit').hidden = (tab !== 'profit');
  renderAnalyticsBI();
}

function renderAnalyticsBI() {
  if (!appAnalytics) return;
  
  if (activeAnalyticsTab === 'revenue') {
    drawLineChart(document.getElementById('analyticsRevenueChartLine'), appAnalytics.monthly.series, 'revenue', '#6366f1');
  } else {
    drawBarChart(document.getElementById('analyticsProfitChartBar'), appAnalytics.monthly.series, 'profit', '#10b981');
  }

  // Draw category pie share breakdown
  let catTotals = { savouries: 0, chips: 0, namkeen: 0 };
  appAnalytics.records.forEach(o => {
    o.items.forEach(item => {
      let catalog = getProductCatalog();
      let cat = catalog[item.name]?.category || 'savouries';
      if (catTotals.hasOwnProperty(cat)) {
        catTotals[cat] += item.qty;
      }
    });
  });

  let totalCat = Math.max(Object.values(catTotals).reduce((a,b)=>a+b, 0), 1);
  let savP = (catTotals.savouries / totalCat) * 100;
  let chpP = (catTotals.chips / totalCat) * 100;

  document.getElementById('analyticsCategoryPie').style.background = `conic-gradient(#6366f1 0 ${savP}%, #10b981 ${savP}% ${savP + chpP}%, #f59e0b ${savP + chpP}% 100%)`;
  
  document.getElementById('analyticsCategoryLegend').innerHTML = `
    <span><i style="background:#6366f1;"></i>Savouries: ${Math.round(savP)}% (${catTotals.savouries} items)</span>
    <span><i style="background:#10b981;"></i>Chips: ${Math.round(chpP)}% (${catTotals.chips} items)</span>
    <span><i style="background:#f59e0b;"></i>Namkeen: ${Math.round(100 - savP - chpP)}% (${catTotals.namkeen} items)</span>
  `;

  // Draw rank details list
  let tbody = document.getElementById('analyticsRevenueRankingBody');
  let topRows = appAnalytics.productRows.slice(0, 8);
  
  tbody.innerHTML = topRows.map(p => {
    let totalUnits = appAnalytics.monthly.units || 1;
    let sharePercent = Math.round((p.units / totalUnits) * 100);
    return `
      <tr>
        <td><strong>${p.name}</strong></td>
        <td><b>${sharePercent}% Share</b></td>
        <td>${p.pcsTotal || (p.units * 10)} pcs</td>
        <td>${p.units} units</td>
      </tr>
    `;
  }).join('');
}

// --------------------------------------------------------
// REPORTS SECTION
// --------------------------------------------------------
function selectReportTemplate(type, btn) {
  currentReportType = type;
  if (btn) {
    document.querySelectorAll('.reports-menu button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  renderReportsViewer();
}

function renderReportsViewer() {
  if (!appAnalytics) return;
  let box = document.getElementById('reportPreviewContainer');
  
  let content = compileReportText(currentReportType === 'inventory' || currentReportType === 'customer' ? 'monthly' : currentReportType, appAnalytics);
  box.innerHTML = `<pre style="margin:0; overflow-x:auto;">${content}</pre>`;
}

function executeReportExport(format) {
  if (!appAnalytics) return;
  
  let filename = `craxx-${currentReportType}-report`;
  let rows = [];
  
  if (currentReportType === 'inventory') {
    let stock = getStoredStock();
    rows = appAnalytics.productRows.map(p => ({
      "Product SKU": p.sku,
      "Snack Item": p.name,
      "Unit Size": p.weight,
      "Current Stock (Patti)": Number(stock[p.name]?.original ?? stock[p.name] ?? 0),
      "Current Stock (PCS)": Number(stock[p.name]?.["52gm__pcs"] ?? 0),
      "Reorder Limit": p.reorderLevel
    }));
  } else if (currentReportType === 'customer') {
    let list = mergeCustomerLists(appAnalytics.records);
    rows = list.map(c => {
      let stats = getCustomerLifetimeStats(c.name, appAnalytics.records);
      return {
        "Store Name": c.name,
        "Outflow Contact": c.phone,
        "Dispatch Route": c.address,
        "Total Orders": stats.orders,
        "Total Bill": formatMoney(stats.revenue),
        "Outflow Units": stats.units
      };
    });
  } else {
    // Sales reports daily, weekly, monthly
    let period = currentReportType;
    let source = appAnalytics[period] || appAnalytics.monthly;
    rows = [
      { Metric: "Total Revenue Outflow", Value: formatMoney(source.revenue) },
      { Metric: "Total ₹7.5 Patti Sold", Value: source.pcs7_5 || 0 },
      { Metric: "Total ₹15 PCS Sold", Value: source.pcs15 || 0 },
      { Metric: "Total PCS Sold", Value: source.pcsTotal || 0 },
      { Metric: "Completed Dispatches", Value: source.orders },
      { Metric: "Total Units Sold", Value: source.units },
      { Metric: "Fastest Snack", Value: appAnalytics.monthly.best },
      { Metric: "Slowest Snack", Value: appAnalytics.monthly.lowest },
      ...appAnalytics.productRows.slice(0, 15).map((p, idx) => ({
        Metric: `Rank ${idx+1}: ${p.name}`,
        Value: `${p.units} units sold, Total: ${formatMoney(p.revenue)}, Pieces: ${p.pcsTotal || (p.units * 10)}`
      }))
    ];
  }

  exportRows(filename, rows, format);
}

// --------------------------------------------------------
// NOTIFICATION DRAWER CENTER
// --------------------------------------------------------
function toggleNotificationsPanel() {
  let panel = document.getElementById('notificationsPanel');
  panel.hidden = !panel.hidden;
  
  if (!panel.hidden) {
    renderNotificationsList();
    markAllNotificationsRead();
  }
}

function renderNotificationsList() {
  let list = readJson("systemNotifications", []);
  let container = document.getElementById('notificationsListContainer');
  
  if (list.length === 0) {
    container.innerHTML = `<div style="padding:40px 20px; text-align:center; color:var(--text-secondary); font-size:0.85rem;">No alerts or notifications recorded.</div>`;
    return;
  }

  container.innerHTML = list.map(x => {
    let unreadClass = x.unread ? 'unread' : '';
    let timeText = new Date(x.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    
    return `
      <div class="notification-item ${unreadClass} ${x.type}" onclick="handleNotificationClick('${x.id}')">
        <div class="notification-icon">⚠️</div>
        <div class="notification-details">
          <p><strong>${x.title}</strong><br>${x.description}</p>
          <time>${timeText} • ${new Date(x.time).toLocaleDateString()}</time>
        </div>
      </div>
    `;
  }).join('');
}

function markAllNotificationsRead() {
  let list = readJson("systemNotifications", []);
  list.forEach(x => x.unread = false);
  writeJson("systemNotifications", list);
  updateNotificationBadge();
}

function clearAllNotifications() {
  writeJson("systemNotifications", []);
  renderNotificationsList();
  updateNotificationBadge();
}

function updateNotificationBadge() {
  let list = readJson("systemNotifications", []);
  let unread = list.filter(x => x.unread).length;
  let badge = document.getElementById('notificationCountBadge');
  
  if (badge) {
    badge.textContent = unread;
    badge.hidden = (unread === 0);
  }
}

function handleNotificationClick(id) {
  let list = readJson("systemNotifications", []);
  let item = list.find(x => x.id === id);
  if (!item) return;
  
  if (item.type.includes('stock')) {
    window.location.hash = "#inventory";
  } else if (item.type.includes('order')) {
    window.location.hash = "#orders";
  }
  document.getElementById('notificationsPanel').hidden = true;
}

// --------------------------------------------------------
// SETTINGS CONFIGURATIONS & BACKUP DRIVES
// --------------------------------------------------------
function loadSettingsFields() {
  let identity = readJson("craxxIdentity", {
    name: "CRAXX Enterprise ERP",
    address: "Jogeshwari, Mumbai, Maharashtra",
    contact: "+91 73048 95165",
    logo: ""
  });

  document.getElementById('settingsCompanyName').value = identity.name;
  document.getElementById('settingsCompanyAddress').value = identity.address;
  document.getElementById('settingsCompanyContact').value = identity.contact;
  document.getElementById('settingsCompanyLogo').value = identity.logo || "";

  // Set dropdown value for WhatsApp format preference
  let wsFormat = localStorage.getItem("craxxWhatsappFormat") || "classic";
  let dropdown = document.getElementById('settingsWhatsappFormat');
  if (dropdown) {
    dropdown.value = wsFormat;
  }
}

function saveSystemSettings() {
  let name = document.getElementById('settingsCompanyName').value.trim();
  let address = document.getElementById('settingsCompanyAddress').value.trim();
  let contact = document.getElementById('settingsCompanyContact').value.trim();
  let logo = document.getElementById('settingsCompanyLogo').value.trim();

  if (!name || !address || !contact) {
    alert("Please fill in company settings details");
    return;
  }

  writeJson("craxxIdentity", { name, address, contact, logo });
  
  // Sync Sidebar Headers
  document.getElementById('sidebarBrandName').textContent = name.split(' ')[0] || "CRAXX";
  document.getElementById('sidebarBrandSub').textContent = name.split(' ').slice(1).join(' ') || "FMCG ERP";
  
  recordActivity("System Settings Saved", "Admin settings rewrite");
  
  alert("System configurations written successfully");
}

function toggleCraxxDarkMode() {
  document.body.classList.toggle('dark-mode');
  let active = document.body.classList.contains('dark-mode') ? "dark" : "light";
  localStorage.setItem("craxxUiTheme", active);
}

// Complete SQLite-like JSON Export Database Drive
function executeDatabaseBackup() {
  let keys = [
    "stock", "productCatalog", "customerOrders", "orderHistory",
    "activityFeed", "savedCustomers", "stockHistory", "productHistory",
    "systemNotifications", "craxxIdentity", "adminProfile"
  ];
  
  let dbBackup = {};
  keys.forEach(k => {
    dbBackup[k] = localStorage.getItem(k);
  });

  let dateString = new Date().toISOString().slice(0, 10);
  downloadBlob(`craxx-database-backup-${dateString}.json`, JSON.stringify(dbBackup, null, 2), "application/json");
  
  recordActivity("Database Backup Exported", "System parameters dump completed");
}

function executeDatabaseRestore(file) {
  if (!file) return;
  
  let reader = new FileReader();
  reader.onload = event => {
    try {
      let dbBackup = JSON.parse(event.target.result);
      Object.keys(dbBackup).forEach(k => {
        if (dbBackup[k] !== null) {
          localStorage.setItem(k, dbBackup[k]);
        }
      });
      
      localStorage.removeItem(CRAXX_ANALYTICS_KEY);
      
      recordActivity("Database Backup Restored", "Offline local cache re-aligned");
      alert("ERP Database backup parameters loaded successfully. Reloading viewports.");
      window.location.reload();
    } catch (e) {
      alert("Invalid backup JSON format. Parsing failed.");
    }
  };
  reader.readAsText(file);
}

function executeDatabaseWipe() {
  if (confirm("Are you sure you want to completely clear the CRAXX database? This deletes orders, custom products, and resets the ERP cache.")) {
    localStorage.clear();
    sessionStorage.clear();
    alert("ERP Database wiped successfully. Re-seeding application parameters.");
    window.location.reload();
  }
}

// --------------------------------------------------------
// USER PROFILE CONTROLLER
// --------------------------------------------------------
function loadProfileFields() {
  let p = readJson("adminProfile", {
    name: "Ravi Yadav",
    email: "ravi@craxx.in"
  });

  document.getElementById('adminNameInput').value = p.name;
  document.getElementById('adminEmailInput').value = p.email;
  document.getElementById('adminProfileName').textContent = p.name;
  document.getElementById('adminProfileInitials').textContent = p.name.slice(0,2).toUpperCase();
  document.getElementById('avatarInitials').textContent = p.name.slice(0,2).toUpperCase();
}

function saveAdminProfile() {
  let name = document.getElementById('adminNameInput').value.trim();
  let email = document.getElementById('adminEmailInput').value.trim();
  let pw = document.getElementById('adminPasswordInput').value;
  let confirmPw = document.getElementById('adminPasswordConfirm').value;

  if (!name || !email) {
    alert("Full name and email address required");
    return;
  }

  if (pw || confirmPw) {
    if (pw !== confirmPw) {
      alert("Passwords do not match");
      return;
    }
  }

  writeJson("adminProfile", { name, email });
  
  document.getElementById('adminProfileName').textContent = name;
  document.getElementById('adminProfileInitials').textContent = name.slice(0,2).toUpperCase();
  document.getElementById('avatarInitials').textContent = name.slice(0,2).toUpperCase();
  document.getElementById('welcomeUserHeader').textContent = `Good Morning, ${name.split(' ')[0]}`;

  document.getElementById('adminPasswordInput').value = "";
  document.getElementById('adminPasswordConfirm').value = "";

  recordActivity("Admin Profile Updated", name);
  alert("Administrator profile written successfully");
}

// --------------------------------------------------------
// COLLAPSIBLE SIDEBAR CONTROLS
// --------------------------------------------------------
function toggleCraxxSidebar() {
  let sidebar = document.getElementById('enterpriseSidebar');
  sidebar.classList.toggle('collapsed');
  let collapsed = sidebar.classList.contains('collapsed') ? "yes" : "no";
  localStorage.setItem("craxxSidebarCollapsed", collapsed);
}

function toggleMobileSidebar() {
  let sidebar = document.getElementById('enterpriseSidebar');
  let backdrop = document.getElementById('sidebarBackdrop');
  if (sidebar && backdrop) {
    sidebar.classList.toggle('mobile-open');
    backdrop.classList.toggle('active');
  }
}

function checkSidebarStateOnLoad() {
  let collapsed = localStorage.getItem("craxxSidebarCollapsed") === "yes";
  let sidebar = document.getElementById('enterpriseSidebar');
  if (sidebar && collapsed) {
    sidebar.classList.add('collapsed');
  }
}

// --------------------------------------------------------
// GLOBAL MULTI-MODE SEARCH CONTROLLER
// --------------------------------------------------------
function handleGlobalSearch() {
  let hash = window.location.hash.slice(1) || 'dashboard';
  let view = hash.split('?')[0];

  if (view === 'orders') {
    if (activeOrderTab === 'create') {
      renderOrdersCatalog();
    } else {
      renderOrderHistoryTable();
    }
  } else if (view === 'products') {
    renderProductsCatalogTable();
  } else if (view === 'product-manager') {
    renderManagerCatalogTable();
  } else if (view === 'inventory') {
    renderInventoryCards();
  } else if (view === 'customers') {
    renderCrmCustomerTable();
  }
}

function compressAndResizeImage(file, maxWidth = 1000) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject("No file provided");
      return;
    }
    if (!file.type.startsWith("image/")) {
      resolve(file);
      return;
    }
    let img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      } else {
        resolve(file);
        return;
      }
      let canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      let ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => {
        if (blob) {
          let resizedFile = new File([blob], file.name, { type: "image/jpeg", lastModified: Date.now() });
          resolve(resizedFile);
        } else {
          resolve(file);
        }
      }, "image/jpeg", 0.85);
    };
    img.onerror = err => reject(err);
  });
}

function levenshtein(s1, s2) {
  if (s1.length < s2.length) return levenshtein(s2, s1);
  if (s2.length === 0) return s1.length;
  let prevRow = Array.from({length: s2.length + 1}, (_, i) => i);
  for (let i = 0; i < s1.length; i++) {
    let currRow = [i + 1];
    for (let j = 0; j < s2.length; j++) {
      let ins = prevRow[j + 1] + 1;
      let del = currRow[j] + 1;
      let sub = prevRow[j] + (s1[i] === s2[j] ? 0 : 1);
      currRow.push(Math.min(ins, del, sub));
    }
    prevRow = currRow;
  }
  return prevRow[s2.length];
}

function normalizeOcrWord(word) {
  let w = word.toLowerCase().trim();
  w = w.replace(/0/g, 'o');
  w = w.replace(/1/g, 'i');
  w = w.replace(/5/g, 's');
  w = w.replace(/8/g, 'b');
  return w.replace(/[^a-z]/g, "");
}

// Sync aliases maps
const PRODUCT_ALIASES = {
  "Cheese Ball": ["cheese balls big 20", "cheese balls big", "cheese balls crax", "cheese ball", "ommseonismoa", "omms eonismoa"],
  "Cream Onion Chips": ["crax chips cream onion 20", "crax chips cream onion", "crax chips cream & onion", "cream onion chips", "tonaonwscromwononz", "craxcuescreamaonon", "craumecmmon two"],
  "Masala Chips": ["crax chips masala punch 20", "crax chips masala punch", "masala chips", "craxchipsmasalapunch"],
  "Salted Chips": ["crax chips simply salted", "chips simply salted", "salted chips", "cnaxcrpssweiy sare", "craxompssimpvsaed"],
  "Masala Curls": ["curls chatpat masala 20", "curls chatpat masala", "masala curls", "comscuamatmasaiazos", "urlschatpatmasala"],
  "Cheese Curls": ["curls cheesy delight", "cheese curls", "comscnmesvomien"],
  "Fritts Cream Onion": ["fritts cream onion big 20", "fritts cream & onion crax", "fritts cream & onion", "fritts cream onion", "craxcmaneeainl"],
  "Fritts Peri Peri": ["fritts peri peri big 20", "fritts peri peri 10", "fritts peri peri", "mmseerpenpo20", "frittsperiperit0"],
  "Masala Natkhat": ["natkhat masala 20 crax", "natkhat masala", "masala natkhat", "watkhatmasalazo crax", "watkhatmasalazo"],
  "Masala Rings": ["rings masala mania 20", "rings masala mania crax", "rings masala mania", "masala rings", "nvcswasmananazo"],
  "Tangy Tomato Rings": ["rings tangy tomato 20", "rings tangy tomato", "rings tangy tomatoo", "tangy tomato rings", "amos mworrountors", "mwesmveviowsoo"],
  "Aloo Bhujia": ["crax aloo bhujiya", "crax aloo bhujia", "aloo bhujia", "craxaomwwna"],
  "Moong Dal": ["crax moogdal", "crax moong dal", "moong dal", "lommwoosa"],
  "Bikaneri Bhujia": ["crax bhujiya sev 10", "crax bhujiya sev", "bikaneri bhujia", "cemxewumasevio"],
  "Khatta Meetha": ["crax khatta meetha", "khatta meetha"],
  "Navratan Mixture": ["crax navratan", "navratan mixture"],
  "Mast Moongfali": ["crax mast moongfali tasty", "crax mast moongfali", "mast moongfali", "craxwastwoonsmu sy"],
  "Punjabi Tadka": ["crax punjabi tadka", "punjabi tadka"],
  "Lite Chivda": ["crax lite chiwda", "lite chivda"],
  "Hara Mutter": ["crax mast mattar green pea", "mast mattar green pea", "hara mutter", "crmwst wears pa"],
  "Noodles": ["crunchy noodles crax", "noodles", "cruncwv noobies cakes"],
  "Pipes": ["pipes simply salted", "pipes", "pipessimplysalteds"],
  "Choco Rings": ["choco rings 10", "choco rings"],
  "Double Mazza": ["crax double mazza", "double mazza", "craxpousiewazza", "cRaxpousiewazza"],
  "Biggies": ["biggies swiss cheese", "biggies", "boowsswescese"]
};

const KNOWN_GRAMS = [18, 24, 26, 31, 33, 34, 35, 38, 39, 41, 43, 52, 58, 59];

function scoreProduct(productName, lineWords) {
  let searchTerms = [productName];
  if (PRODUCT_ALIASES[productName]) {
    searchTerms = searchTerms.concat(PRODUCT_ALIASES[productName]);
  }
  let bestTermScore = 0;
  for (let term of searchTerms) {
    let tokens = term.toLowerCase().split(/\s+/).filter(Boolean);
    let matched = 0;
    let scoreSum = 0;
    for (let token of tokens) {
      let cleanT = normalizeOcrWord(token);
      if (!cleanT) continue;
      let bestWScore = 0;
      for (let word of lineWords) {
        let cleanW = normalizeOcrWord(word);
        if (!cleanW) continue;
        if (cleanW === cleanT) {
          bestWScore = 2;
          break;
        } else {
          let dist = levenshtein(cleanW, cleanT);
          let limit = cleanT.length > 6 ? 2 : (cleanT.length >= 4 ? 1 : 0);
          if (dist <= limit) {
            let s = 1 - (dist / cleanT.length);
            if (s > bestWScore) bestWScore = s;
          }
        }
      }
      if (bestWScore > 0) {
        matched++;
        scoreSum += bestWScore;
      }
    }
    if (tokens.length > 0) {
      let coverage = matched / tokens.length;
      let minCov = tokens.length <= 2 ? 0.9 : 0.5;
      if (coverage >= minCov) {
        let s = scoreSum / tokens.length;
        if (s > bestTermScore) bestTermScore = s;
      }
    }
  }
  return bestTermScore;
}

function findProductInLine(line) {
  let words = line.split(/\s+/).filter(Boolean);
  let best = null;
  let bestS = 0;
  let names = Array.from(new Set([
    ...Object.keys(CRAXX_PRODUCTS),
    ...Object.keys(getProductCatalog())
  ]));
  names.forEach(name => {
    let s = scoreProduct(name, words);
    if (s > bestS) {
      bestS = s;
      best = name;
    }
  });
  return best;
}

function parseStockLine(line) {
  let product = findProductInLine(line);
  if (!product) return null;
  
  let normalized = line.toLowerCase();
  let isPcs = normalized.includes("largepcs") || (!normalized.includes("originalpcs") && (
    normalized.includes("52g") || normalized.includes("58g") || normalized.includes("59g") ||
    normalized.includes("20/-") || normalized.includes("20/") || normalized.includes("big") ||
    normalized.includes("15 rs") || normalized.includes("15rs") || (/\b15\b/.test(normalized)) ||
    normalized.includes("52gm") || normalized.includes("52 gm")
  ));

  let corrected = line
    .replace(/\b([1-9])([oO])\b/g, '$10')
    .replace(/\b([oO])\b/g, '0')
    .replace(/\b([lIi])([0-9])\b/g, '1$2')
    .replace(/\b([1-9])([lIi])\b/g, '$11');

  let nums = [];
  let regex = /\d+(\.\d+)?/g;
  let match;
  while ((match = regex.exec(corrected)) !== null) {
    let val = Number(match[0]);
    if (val === Math.floor(val)) {
      nums.push({ value: val, index: match.index, text: match[0] });
    }
  }

  if (nums.length === 0) return null;

  let filtered = nums.filter(num => {
    if (num.index < 5 && num.value <= 30) return false;
    let idx = num.index;
    let endIdx = idx + num.text.length;
    let postChar = corrected.substring(endIdx, endIdx + 2);
    if (/^\s*(\/|-)/.test(postChar)) return false;
    let postWeight = corrected.substring(endIdx, endIdx + 4).toLowerCase();
    if (/^\s*(g|gm|gms|grams|m)\b/.test(postWeight)) return false;
    if (KNOWN_GRAMS.includes(num.value)) return false;
    return true;
  });

  if (filtered.length === 0) filtered = nums;

  let catalog = getProductCatalog();
  let expectedPrice = isPcs ? (catalog[product]?.pcsPrice || 15) : (catalog[product]?.price || 75);
  
  let finalNums = filtered;
  if (filtered.length > 1) {
    finalNums = filtered.filter(num => {
      let val = num.value;
      if (val === expectedPrice) return false;
      if (!isPcs && (val === 7.5 || val === 75 || val === 7)) return false;
      if (isPcs && val === 15) return false;
      return true;
    });
    if (finalNums.length === 0) finalNums = filtered;
  }

  let qty = 0;
  if (finalNums.length > 0) {
    qty = finalNums[finalNums.length - 1].value;
  } else {
    return null;
  }

  if (!isPcs) {
    let multiplier = (product === "Pipes" || product === "Noodles") ? 8 : 10;
    qty = Math.round((qty / multiplier) * 10) / 10;
  }

  return {
    product,
    gram: isPcs ? "52gm" : "",
    unit: isPcs ? "pcs" : "",
    qty
  };
}

function parseQtyFromSegments(segs, isPcs) {
  if (segs.length < 3) return 0;
  let lastSeg = segs[segs.length - 1].toLowerCase();
  let hasPrice = lastSeg.includes("rs") || lastSeg.includes("₹") || lastSeg.includes(".") || 
                 lastSeg.includes("es") || lastSeg.includes("ws") || lastSeg.includes("ts") || 
                 /\b(15|7\.5|75|7|5)\b/.test(lastSeg);
  
  let qtySeg = lastSeg;
  if (hasPrice && segs.length >= 3) {
    qtySeg = segs[segs.length - 2];
  }

  let clean = qtySeg.trim().toLowerCase();
  clean = clean.replace(/o/g, '0');
  clean = clean.replace(/q/g, '0');
  clean = clean.replace(/s/g, '5');
  clean = clean.replace(/l/g, '1');
  clean = clean.replace(/i/g, '1');
  clean = clean.replace(/t/g, '7');
  clean = clean.replace(/b/g, '8');
  clean = clean.replace(/g/g, '9');
  clean = clean.replace(/z/g, '2');

  let match = clean.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function parseStockText(text) {
  let merged = {};
  text.split(/\r?\n/).forEach(line => {
    line = line.trim();
    if (!line) return;
    
    if (line.includes("|") && line.split("|").length >= 4) {
      let segments = line.split("|").map(s => s.trim()).filter(Boolean);
      let splitIdx = -1;
      for (let i = 2; i < segments.length - 1; i++) {
        let seg = segments[i];
        if (/^\d+$/.test(seg) && Number(seg) <= 30) {
          splitIdx = i;
          break;
        }
      }
      if (splitIdx === -1 && segments.length >= 6) {
        splitIdx = Math.floor(segments.length / 2);
      }

      if (splitIdx !== -1) {
        let leftSegs = segments.slice(0, splitIdx);
        let rightSegs = segments.slice(splitIdx);
        
        let leftLine = leftSegs.join(" ") + " largepcs";
        let rightLine = rightSegs.join(" ") + " originalpcs";
        
        let leftQty = parseQtyFromSegments(leftSegs, true);
        let rightQty = parseQtyFromSegments(rightSegs, false);
        
        let leftItem = parseStockLine(leftLine);
        if (leftItem) {
          leftItem.qty = leftQty;
          addOcrMergedItem(merged, leftItem);
        }
        
        let rightItem = parseStockLine(rightLine);
        if (rightItem) {
          rightItem.qty = rightQty;
          addOcrMergedItem(merged, rightItem);
        }
      } else {
        let item = parseStockLine(line);
        if (item) {
          item.qty = parseQtyFromSegments(segments, item.gram === "52gm");
          addOcrMergedItem(merged, item);
        }
      }
    } else {
      let item = parseStockLine(line);
      if (item) {
        addOcrMergedItem(merged, item);
      }
    }
  });
  return Object.values(merged);
}

function addOcrMergedItem(mergedMap, item) {
  let key = `${item.product}__${item.gram === "52gm" ? "52gm__pcs" : "original"}`;
  if (!mergedMap[key]) {
    mergedMap[key] = item;
  } else {
    mergedMap[key].qty += item.qty;
  }
}

// --------------------------------------------------------
// THEME & CORE SYSTEM SEED INITIALIZATIONS ON START
// --------------------------------------------------------
window.addEventListener('load', () => {
  // Theme load
  let theme = localStorage.getItem("craxxUiTheme") || "light";
  if (theme === "dark") {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }

  // Sidebar state load
  checkSidebarStateOnLoad();
  
  // Drag and drop upload setup
  setupFormImageDragAndDrop();

  // Run Splash Loader Animation
  runSplashLoader();
});

// Global Tap Sound implementation (soft click feedback on elements)
function playTapSound() {
  try {
    let ctx = new (window.AudioContext || window.webkitAudioContext)();
    let osc = ctx.createOscillator();
    let gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = 650; // Soft click pitch
    gain.gain.setValueAtTime(0.02, ctx.currentTime);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {
    // Audio Context blocked or not supported
  }
}

// Global click event listener to trigger playTapSound on buttons/links
document.addEventListener('click', (e) => {
  let target = e.target;
  if (target.closest('button') || target.closest('a') || target.closest('.clickable') || target.closest('.customer-suggestion') || target.closest('.product-card') || target.closest('input[type="checkbox"]')) {
    playTapSound();
  }
});

// Setting handler for WhatsApp Message Format preference
function changeWhatsappFormatSetting(val) {
  localStorage.setItem("craxxWhatsappFormat", val);
  triggerNotification("system", "WhatsApp format updated", `Formatting set to ${val === "classic" ? "Standard List" : "Grouped Enterprise"}`);
}

// Backward compatibility layer for legacy functions
function addToCart(btn, name, price) {
  let catalog = getProductCatalog();
  let product = Object.values(catalog).find(p => p.name === name);
  if (!product) return;
  executeAddToCart(name, product.sku);
}

function removeItem(key) {
  executeRemoveFromCart(key);
}

// Re-expose legacy naming conventions
function applyProductCatalog() {
  renderOrdersCatalog();
}

function updateCart() {
  updateCartDisplay();
}

function getCartSummary() {
  let pattiQty = 0;
  let pcsQty = 0;
  let totalQty = 0;
  let pattiAmount = 0;
  let pcsAmount = 0;
  let totalAmount = 0;

  appCart.forEach(item => {
    let qty = Number(item.qty || 0);
    let amount = Number(item.price || 0) * qty;
    if (item.unit === "pcs") {
      pcsQty += qty;
      pcsAmount += amount;
    } else {
      pattiQty += qty;
      pattiAmount += amount;
    }
    totalQty += qty;
    totalAmount += amount;
  });

  return {
    pattiQty,
    pcsQty,
    totalQty,
    pattiAmount,
    pcsAmount,
    totalAmount
  };
}

function ensureCartBubbles() {
  let container = document.getElementById('cartBubbles');
  if (!container) {
    container = document.createElement('div');
    container.id = 'cartBubbles';
    container.className = 'cart-bubbles';
    document.body.appendChild(container);
  }
  return container;
}

function updateCartBubbles() {
  updateCartFloatingBubbles();
}

function searchProducts() {
  renderOrdersCatalog();
}

function getCategorySection(category) {
  return document.querySelector(
    `.category-section.${category || "savouries"} .products`
  ) || document.querySelector(".category-section.savouries .products");
}

function createProductCard(product) {
  let safeName = product.name.replaceAll("'", "\\'");
  return `
    <div class="product" data-custom-product="true">
      <img loading="lazy" decoding="async" src="${product.image || ""}">
      <div class="product-content">
        <h3>${product.name}</h3>
        <p class="info">${product.gram || ""} • Custom product</p>
        <p id="last-${product.name.replaceAll(" ", "-")}" class="last-product-order"></p>
        <div class="product-bottom">
          <p class="price">₹${product.price || 0}</p>
          <button class="add-btn" onclick="addToCart(this,'${safeName}',${product.price || 0})">ADD</button>
        </div>
      </div>
    </div>
  `;
}
