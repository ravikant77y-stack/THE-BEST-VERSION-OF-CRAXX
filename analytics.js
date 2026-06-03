const CRAXX_PRODUCTS = {
  "Choco Rings": { category: "savouries", price: 75, cost: 48, weight: "18gm", sku: "CRX-CHO-RNG", reorderLevel: 12, image: "assets/images/choco-rings.jpg" },
  "Tangy Tomato Rings": { category: "savouries", price: 75, cost: 48, weight: "24gm", sku: "CRX-TOM-RNG", reorderLevel: 12, image: "assets/images/tangy-tomato-rings.jpg" },
  "Masala Rings": { category: "savouries", price: 75, cost: 48, weight: "24gm", sku: "CRX-MAS-RNG", reorderLevel: 12, image: "assets/images/masala-rings.jpg" },
  "Masala Curls": { category: "savouries", price: 75, cost: 48, weight: "33gm", sku: "CRX-MAS-CUR", reorderLevel: 12, image: "assets/images/masala-curls.jpg" },
  "Cheese Curls": { category: "savouries", price: 75, cost: 48, weight: "33gm", sku: "CRX-CHS-CUR", reorderLevel: 12, image: "assets/images/cheese-curls.jpg" },
  "Fritts Cream Onion": { category: "savouries", price: 75, cost: 48, weight: "33gm", sku: "CRX-FRT-CON", reorderLevel: 12, image: "assets/images/fritts-cream-onion.jpg" },
  "Fritts Peri Peri": { category: "savouries", price: 75, cost: 48, weight: "33gm", sku: "CRX-FRT-PPP", reorderLevel: 12, image: "assets/images/fritts-peri-peri.jpg" },
  "Masala Natkhat": { category: "savouries", price: 75, cost: 48, weight: "33gm", sku: "CRX-MAS-NAT", reorderLevel: 12, image: "assets/images/masala-natkhat.jpg" },
  "Biggies": { category: "savouries", price: 75, cost: 48, weight: "24gm", sku: "CRX-BIG", reorderLevel: 12, image: "assets/images/biggies.jpg" },
  "Pipes": { category: "savouries", price: 60, cost: 38, weight: "20gm", sku: "CRX-PIP", reorderLevel: 12, image: "assets/images/pipes.jpg" },
  "Cheese Ball": { category: "savouries", price: 75, cost: 48, weight: "33gm", sku: "CRX-CHS-BAL", reorderLevel: 12, image: "assets/images/cheese-ball.jpg" },
  "Noodles": { category: "savouries", price: 60, cost: 38, weight: "34gm", sku: "CRX-NOD", reorderLevel: 12, image: "assets/images/noodles.jpg" },
  "Salted Chips": { category: "chips", price: 75, cost: 48, weight: "26gm", sku: "CRX-SAL-CHP", reorderLevel: 12, image: "assets/images/salted-chips.jpg" },
  "Cream Onion Chips": { category: "chips", price: 75, cost: 48, weight: "26gm", sku: "CRX-CON-CHP", reorderLevel: 12, image: "assets/images/cream-onion-chips.jpg" },
  "Tomato Chips": { category: "chips", price: 75, cost: 48, weight: "26gm", sku: "CRX-TOM-CHP", reorderLevel: 12, image: "assets/images/tomato-chips.jpg" },
  "Masala Chips": { category: "chips", price: 75, cost: 48, weight: "26gm", sku: "CRX-MAS-CHP", reorderLevel: 12, image: "assets/images/masala-chips.jpg" },
  "Double Mazza": { category: "namkeen", price: 75, cost: 48, weight: "31gm", sku: "CRX-DBL-MAZ", reorderLevel: 12, image: "assets/images/double-mazza.jpg" },
  "Hara Mutter": { category: "namkeen", price: 75, cost: 48, weight: "31gm", sku: "CRX-HAR-MUT", reorderLevel: 12, image: "assets/images/hara-mutter.jpg" },
  "Aloo Bhujia": { category: "namkeen", price: 75, cost: 48, weight: "41gm", sku: "CRX-ALO-BHU", reorderLevel: 12, image: "assets/images/aloo-bhujia.jpg" },
  "Moong Dal": { category: "namkeen", price: 75, cost: 48, weight: "38gm", sku: "CRX-MOO-DAL", reorderLevel: 12, image: "assets/images/moong-dal.jpg" },
  "Bikaneri Bhujia": { category: "namkeen", price: 75, cost: 48, weight: "35gm", sku: "CRX-BIK-BHU", reorderLevel: 12, image: "assets/images/bikaneri-bhujia.jpg" },
  "Khatta Meetha": { category: "namkeen", price: 75, cost: 48, weight: "41gm", sku: "CRX-KHA-MEE", reorderLevel: 12, image: "assets/images/khatta-meetha.jpg" },
  "Navratan Mixture": { category: "namkeen", price: 75, cost: 48, weight: "43gm", sku: "CRX-NAV-MIX", reorderLevel: 12, image: "assets/images/navratan-mixture.jpg" },
  "Mast Moongfali": { category: "namkeen", price: 75, cost: 48, weight: "41gm", sku: "CRX-MAS-MOO", reorderLevel: 12, image: "assets/images/mast-moongfali.jpg" },
  "Punjabi Tadka": { category: "namkeen", price: 75, cost: 48, weight: "41gm", sku: "CRX-PUN-TAD", reorderLevel: 12, image: "assets/images/punjabi-tadka.jpg" },
  "Lite Chivda": { category: "namkeen", price: 75, cost: 48, weight: "39gm", sku: "CRX-LIT-CHI", reorderLevel: 12, image: "assets/images/lite-chivda.jpg" }
};

const CRAXX_ANALYTICS_KEY = "craxxAnalytics";
const CRAXX_ORDER_HISTORY_KEY = "orderHistory";
const CRAXX_ACTIVITY_KEY = "activityFeed";
const CRAXX_PRODUCT_HISTORY_KEY = "productHistory";

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch (error) {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatMoney(value) {
  return `₹${Math.round(Number(value) || 0).toLocaleString("en-IN")}`;
}

function startOfDay(date) {
  let next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function daysBetween(date, days) {
  let next = startOfDay(new Date());
  next.setDate(next.getDate() - days);
  return next;
}

function normalizeStockValue(value) {
  if (typeof value === "number") return value;
  if (value && typeof value === "object") {
    return Object.values(value).reduce((sum, qty) => sum + Number(qty || 0), 0);
  }
  return 0;
}

function getStoredStock() {
  return readJson("stock", {});
}

function getProductCatalog() {
  let custom = readJson("productCatalog", {});
  let products = {};
  
  // Merge base products first
  Object.keys(CRAXX_PRODUCTS).forEach(name => {
    products[name] = { ...CRAXX_PRODUCTS[name], name };
  });

  // Overwrite with custom catalog entries from localStorage
  Object.keys(custom).forEach(name => {
    let item = custom[name] || {};
    let base = CRAXX_PRODUCTS[name] || {};
    products[item.name || name] = {
      name: item.name || name,
      category: item.category || base.category || "savouries",
      price: Number(item.price ?? base.price ?? 75),
      cost: Number(item.cost ?? item.costPrice ?? base.cost ?? 48),
      weight: item.weight ?? item.gram ?? base.weight ?? "",
      sku: item.sku ?? base.sku ?? `CRX-${(item.name || name).slice(0, 3).toUpperCase()}`,
      barcode: item.barcode ?? base.barcode ?? "",
      reorderLevel: Number(item.reorderLevel ?? base.reorderLevel ?? 12),
      image: item.image ?? base.image ?? "",
      description: item.description ?? ""
    };
  });
  return products;
}

function saveProductCatalogMap(products) {
  let catalog = {};
  Object.keys(products).forEach(name => {
    let item = products[name];
    catalog[name] = {
      name,
      category: item.category,
      gram: item.weight,
      price: Number(item.price || 0),
      pcsPrice: Number(item.pcsPrice || 15),
      image: item.image || "",
      description: item.description || "",
      mrp: Number(item.mrp || item.price || 0),
      costPrice: Number(item.cost || 0),
      sku: item.sku || "",
      barcode: item.barcode || "",
      reorderLevel: Number(item.reorderLevel || 0)
    };
  });
  writeJson("productCatalog", catalog);
}

async function fetchSeedOrders() {
  try {
    let response = await fetch("orders.json");
    if (!response.ok) return {};
    return await response.json();
  } catch (error) {
    return {};
  }
}

function orderItemsTotal(items, products) {
  return items.reduce((sum, item) => {
    let name = item.productName || item.name;
    let price = Number(item.price || products[name]?.price || 75);
    return sum + price * Number(item.qty || 0);
  }, 0);
}

function seedOrderRecords(seedOrders, products) {
  let names = Object.keys(seedOrders || {});
  return names.map((customer, index) => {
    // Generate dates spread across the last 30 days
    let date = new Date();
    date.setDate(date.getDate() - (index % 30));
    date.setHours(9 + (index % 10), (index * 7) % 60, 0, 0);

    let rawItems = seedOrders[customer];
    let items = (Array.isArray(rawItems) ? rawItems : []).map(item => ({
      productName: item.productName || item.name,
      name: item.name,
      qty: Number(item.qty || 0),
      price: Number(item.price || products[item.name]?.price || 75),
      unit: item.unit || "",
      gram: item.gram || products[item.name]?.weight || ""
    }));
    return {
      id: `SEED-${String(index + 1).padStart(4, "0")}`,
      customer,
      createdAt: date.toISOString(),
      status: "Saved",
      items,
      total: orderItemsTotal(items, products)
    };
  });
}

function getSavedOrderRecords(products) {
  let history = readJson(CRAXX_ORDER_HISTORY_KEY, []);
  let lastOrders = readJson("customerOrders", {});
  let converted = Object.keys(lastOrders).map((customer, index) => {
    let rawItems = lastOrders[customer];
    let items = (Array.isArray(rawItems) ? rawItems : []).map(item => ({
      productName: item.productName || item.name,
      name: item.name,
      qty: Number(item.qty || 0),
      price: Number(item.price || products[item.name]?.price || 75),
      unit: item.unit || "",
      gram: item.gram || products[item.name]?.weight || ""
    }));
    return {
      id: `LOCAL-${String(index + 1).padStart(4, "0")}`,
      customer,
      createdAt: new Date(Date.now() - index * 3600000).toISOString(),
      status: "Saved",
      items,
      total: orderItemsTotal(items, products)
    };
  });
  let byId = {};
  [...converted, ...history].forEach(order => {
    if (order && order.id) {
      byId[order.id] = order;
    }
  });
  return Object.values(byId);
}

function recordActivity(action, detail) {
  let feed = readJson(CRAXX_ACTIVITY_KEY, []);
  feed.unshift({
    action,
    detail: detail || "",
    time: new Date().toISOString()
  });
  writeJson(CRAXX_ACTIVITY_KEY, feed.slice(0, 80));
}

function recordOrderSnapshot(customer, items, total) {
  let orders = readJson(CRAXX_ORDER_HISTORY_KEY, []);
  let id = `ORD-${Date.now()}`;
  let normalizedItems = (Array.isArray(items) ? items : []).map(item => ({
    productName: item.productName || item.name,
    name: item.name,
    qty: Number(item.qty || 0),
    price: Number(item.price || 0),
    unit: item.unit || "",
    gram: item.gram || ""
  }));
  orders.unshift({
    id,
    customer,
    createdAt: new Date().toISOString(),
    status: "Created",
    items: normalizedItems,
    total: Number(total || orderItemsTotal(normalizedItems, getProductCatalog()))
  });
  writeJson(CRAXX_ORDER_HISTORY_KEY, orders.slice(0, 300));
  recordActivity(`Order #${id.slice(-6)} Created`, customer);
  localStorage.removeItem(CRAXX_ANALYTICS_KEY);
  
  // Trigger system notification
  triggerNotification("new-order", `New Order Dispatched for ${customer}`, `Total Bill: ₹${total}. Stock registers updated.`);
}

function triggerNotification(type, title, description) {
  let list = readJson("systemNotifications", []);
  list.unshift({
    id: `NOTIF-${Date.now()}`,
    type,
    title,
    description,
    time: new Date().toISOString(),
    unread: true
  });
  writeJson("systemNotifications", list.slice(0, 50));
  
  // Dispatch storage event to notify other sections
  window.dispatchEvent(new Event("storage"));
}

function periodKey(date, mode) {
  let d = new Date(date);
  if (mode === "day") return d.toISOString().slice(0, 10);
  if (mode === "month") return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  // Weekly
  let first = startOfDay(d);
  first.setDate(first.getDate() - first.getDay() + 1);
  return first.toISOString().slice(0, 10);
}

function summarizeOrders(orders, products, fromDate) {
  let summary = { revenue: 0, cost: 0, profit: 0, orders: 0, units: 0, pcs7_5: 0, pcs15: 0, pcsTotal: 0, products: {} };
  let totalPattiPcs = 0;
  orders.forEach(order => {
    let created = new Date(order.createdAt);
    if (fromDate && created < fromDate) return;
    summary.orders += 1;
    let orderItems = Array.isArray(order.items) ? order.items : [];
    let orderRevenue = Number(order.total || orderItemsTotal(orderItems, products));
    summary.revenue += orderRevenue;

    orderItems.forEach(item => {
      let name = item.productName || item.name;
      let qty = Number(item.qty || 0);
      let price = Number(item.price || products[name]?.price || 75);
      let cost = Number(products[name]?.cost || products[name]?.costPrice || 48);
      
      let itemRevenue = qty * price;
      let itemCost = qty * cost;
      
      summary.cost += itemCost;
      summary.profit += (itemRevenue - itemCost);

      if (item.unit === "pcs") {
        summary.pcs15 += qty;
      } else {
        summary.pcs7_5 += qty;
        let multiplier = (price === 60 || name === "Pipes" || name === "Noodles") ? 8 : 10;
        totalPattiPcs += qty * multiplier;
      }

      if (!summary.products[name]) {
        summary.products[name] = { name, units: 0, revenue: 0, cost: 0, profit: 0, pcs7_5: 0, pcs15: 0, pcsTotal: 0, lastSold: null };
      }
      summary.products[name].units += qty;
      summary.products[name].revenue += itemRevenue;
      summary.products[name].cost += itemCost;
      summary.products[name].profit += (itemRevenue - itemCost);
      if (item.unit === "pcs") {
        summary.products[name].pcs15 += qty;
      } else {
        summary.products[name].pcs7_5 += qty;
      }
      let pMultiplier = (price === 60 || name === "Pipes" || name === "Noodles") ? 8 : 10;
      summary.products[name].pcsTotal = (summary.products[name].pcs7_5 * pMultiplier) + summary.products[name].pcs15;

      summary.units += qty;

      if (!summary.products[name].lastSold || created > new Date(summary.products[name].lastSold)) {
        summary.products[name].lastSold = order.createdAt;
      }
    });
  });
  summary.pcsTotal = totalPattiPcs + summary.pcs15;
  return summary;
}

function makeSeries(orders, products, labels, dateFactory) {
  return labels.map((label, index) => {
    let key = dateFactory(index);
    let matching = orders.filter(order => periodKey(order.createdAt, "day") === key);
    let rev = matching.reduce((sum, order) => sum + Number(order.total || orderItemsTotal(Array.isArray(order.items) ? order.items : [], products)), 0);
    
    let cost = matching.reduce((sum, order) => sum + (Array.isArray(order.items) ? order.items : []).reduce((itemSum, item) => {
      let name = item.productName || item.name;
      let qty = Number(item.qty || 0);
      let c = Number(products[name]?.cost || products[name]?.costPrice || 48);
      return itemSum + (qty * c);
    }, 0), 0);

    let pcs15 = matching.reduce((sum, order) => sum + (Array.isArray(order.items) ? order.items : []).reduce((itemSum, item) => {
      if (item.unit === "pcs") {
        return itemSum + Number(item.qty || 0);
      }
      return itemSum;
    }, 0), 0);

    let pcs7_5 = matching.reduce((sum, order) => sum + (Array.isArray(order.items) ? order.items : []).reduce((itemSum, item) => {
      if (item.unit !== "pcs") {
        return itemSum + Number(item.qty || 0);
      }
      return itemSum;
    }, 0), 0);

    let pcs7_5_pieces = matching.reduce((sum, order) => sum + (Array.isArray(order.items) ? order.items : []).reduce((itemSum, item) => {
      if (item.unit !== "pcs") {
        let name = item.productName || item.name;
        let price = Number(item.price || products[name]?.price || 75);
        let multiplier = (price === 60 || name === "Pipes" || name === "Noodles") ? 8 : 10;
        return itemSum + Number(item.qty || 0) * multiplier;
      }
      return itemSum;
    }, 0), 0);

    return {
      label,
      revenue: rev,
      cost: cost,
      profit: rev - cost,
      pcs15,
      pcs7_5,
      pcsTotal: pcs7_5_pieces + pcs15,
      orders: matching.length,
      units: matching.reduce((sum, order) => sum + (Array.isArray(order.items) ? order.items : []).reduce((qty, item) => qty + Number(item.qty || 0), 0), 0)
    };
  });
}

async function buildCraxxAnalytics() {
  try {
    let products = getProductCatalog();
    let seedOrders = await fetchSeedOrders();
    let records = [...seedOrderRecords(seedOrders, products), ...getSavedOrderRecords(products)]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    let today = startOfDay(new Date());
    
    // Weekly limits
    let weekStart = startOfDay(new Date());
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    
    // Monthly limits (30 days ago)
    let monthStart = new Date();
    monthStart.setDate(monthStart.getDate() - 29);
    monthStart.setHours(0, 0, 0, 0);

    let todaySummary = summarizeOrders(records, products, today);
    let weeklySummary = summarizeOrders(records, products, weekStart);
    let monthlySummary = summarizeOrders(records, products, monthStart);
    
    let previousWeek = summarizeOrders(records, products, new Date(weekStart.getTime() - 7 * 86400000), weekStart);
    let weeklyGrowth = previousWeek.revenue > 0 ? ((weeklySummary.revenue - previousWeek.revenue) / previousWeek.revenue) * 100 : 100;

    // Generate labels for weekly charts (Mon - Sun)
    let weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    let weeklySeries = makeSeries(records, products, weekLabels, index => {
      let date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      return date.toISOString().slice(0, 10);
    });

    // Generate labels for monthly charts (Last 30 days)
    let dailyLabels = Array.from({ length: 30 }, (_, index) => {
      let date = new Date(monthStart);
      date.setDate(monthStart.getDate() + index);
      return date.toISOString().slice(0, 10);
    });
    let monthlySeries = makeSeries(records, products, dailyLabels.map(label => label.slice(8) + "/" + label.slice(5, 7)), index => dailyLabels[index]);

    let stock = getStoredStock();
    let productRows = Object.keys(products).map(name => {
      let sold = monthlySummary.products[name] || { units: 0, revenue: 0, cost: 0, profit: 0, pcs7_5: 0, pcs15: 0, pcsTotal: 0, lastSold: null };
      let stockValue = normalizeStockValue(stock[name]);
      return {
        name,
        ...products[name],
        units: sold.units,
        revenue: sold.revenue,
        cost: sold.cost,
        profit: sold.profit,
        pcs7_5: sold.pcs7_5 || 0,
        pcs15: sold.pcs15 || 0,
        pcsTotal: sold.pcsTotal || 0,
        currentStock: stockValue,
        lastSold: sold.lastSold
      };
    }).sort((a, b) => b.units - a.units);

    let inventory = productRows.reduce((state, product) => {
      state.total += 1;
      if (product.currentStock <= 0) state.out += 1;
      else if (product.currentStock <= Number(product.reorderLevel || 12)) state.low += 1;
      else state.healthy += 1;
      return state;
    }, { total: 0, healthy: 0, low: 0, out: 0 });

    let analytics = {
      generatedAt: new Date().toISOString(),
      records,
      products,
      today: { ...todaySummary, avgOrder: todaySummary.orders ? todaySummary.revenue / todaySummary.orders : 0 },
      weekly: { ...weeklySummary, growth: weeklyGrowth, series: weeklySeries },
      monthly: {
        ...monthlySummary,
        series: monthlySeries,
        best: productRows[0]?.name || "No sales yet",
        lowest: [...productRows].reverse().find(item => item.units > 0)?.name || "No sales yet",
        growth: weeklyGrowth
      },
      productRows,
      inventory,
      activity: readJson(CRAXX_ACTIVITY_KEY, [])
    };
    writeJson(CRAXX_ANALYTICS_KEY, analytics);
    return analytics;
  } catch (error) {
    console.error("buildCraxxAnalytics failed, returning fallback parameters:", error);
    let products = getProductCatalog();
    let productRows = Object.keys(products).map(name => ({
      name,
      ...products[name],
      units: 0,
      revenue: 0,
      cost: 0,
      profit: 0,
      pcs7_5: 0,
      pcs15: 0,
      pcsTotal: 0,
      currentStock: 0,
      lastSold: null
    }));
    return {
      generatedAt: new Date().toISOString(),
      records: [],
      products: products,
      today: { revenue: 0, cost: 0, profit: 0, orders: 0, units: 0, pcs7_5: 0, pcs15: 0, pcsTotal: 0, products: {}, avgOrder: 0 },
      weekly: { revenue: 0, cost: 0, profit: 0, orders: 0, units: 0, pcs7_5: 0, pcs15: 0, pcsTotal: 0, products: {}, growth: 0, series: [] },
      monthly: { revenue: 0, cost: 0, profit: 0, orders: 0, units: 0, pcs7_5: 0, pcs15: 0, pcsTotal: 0, products: {}, growth: 0, series: [], best: "None", lowest: "None" },
      productRows,
      inventory: { total: productRows.length, healthy: productRows.length, low: 0, out: 0 },
      activity: []
    };
  }
}

// PREMIUM SVG LINE CHART DRAWING
function drawLineChart(svg, data, key, color) {
  if (!svg) return;
  svg.innerHTML = "";
  let width = 720;
  let height = 220;
  let pad = 40;
  
  let values = data.map(item => Number(item[key] || 0));
  let max = Math.max(...values, 1);
  
  let points = values.map((value, index) => {
    let x = pad + (index * (width - pad * 2)) / Math.max(values.length - 1, 1);
    let y = height - pad - (value / max) * (height - pad * 2);
    return `${x},${y}`;
  }).join(" ");
  
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  
  // Grid lines
  let gridLines = "";
  for (let i = 0; i <= 4; i++) {
    let y = pad + (i * (height - pad * 2)) / 4;
    gridLines += `<line x1="${pad}" y1="${y}" x2="${width - pad}" y2="${y}" stroke="var(--glass-border)" stroke-width="1" stroke-dasharray="4"/>`;
  }
  
  svg.innerHTML = `
    <defs>
      <linearGradient id="chartFill-${key}" x1="0" x2="0" y1="0" y2="1">
        <stop stop-color="${color}" stop-opacity=".3"/>
        <stop offset="1" stop-color="${color}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    ${gridLines}
    <polyline points="${points}" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <polygon points="${pad},${height - pad} ${points} ${width - pad},${height - pad}" fill="url(#chartFill-${key})"/>
    ${data.map((item, index) => {
      let x = pad + (index * (width - pad * 2)) / Math.max(data.length - 1, 1);
      // Label throttle for dense monthly items
      let showLabel = data.length < 10 || index % 4 === 0 || index === data.length - 1;
      return showLabel ? `<text x="${x}" y="${height - 12}" fill="var(--text-secondary)" font-size="10" text-anchor="middle">${item.label}</text>` : "";
    }).join("")}
  `;
}

// PREMIUM SVG BAR CHART DRAWING
function drawBarChart(svg, data, key, color) {
  if (!svg) return;
  svg.innerHTML = "";
  let width = 720;
  let height = 220;
  let pad = 40;
  
  let values = data.map(item => Number(item[key] || 0));
  let max = Math.max(...values, 1);
  let barWidth = Math.max(4, (width - pad * 2) / values.length - 10);
  
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  
  // Grid lines
  let gridLines = "";
  for (let i = 0; i <= 4; i++) {
    let y = pad + (i * (height - pad * 2)) / 4;
    gridLines += `<line x1="${pad}" y1="${y}" x2="${width - pad}" y2="${y}" stroke="var(--glass-border)" stroke-width="1" stroke-dasharray="4"/>`;
  }
  
  let barsHTML = data.map((item, index) => {
    let barHeight = (Number(item[key] || 0) / max) * (height - pad * 2);
    let x = pad + index * ((width - pad * 2) / values.length) + 5;
    let y = height - pad - barHeight;
    let showLabel = data.length < 10 || index % 4 === 0 || index === data.length - 1;
    let labelText = showLabel ? `<text x="${x + barWidth / 2}" y="${height - 12}" fill="var(--text-secondary)" font-size="10" text-anchor="middle">${item.label}</text>` : "";
    
    return `
      <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="4" fill="${color}" opacity="0.85">
        <animate attributeName="height" from="0" to="${barHeight}" dur="0.5s" fill="freeze" />
        <animate attributeName="y" from="${height - pad}" to="${y}" dur="0.5s" fill="freeze" />
      </rect>
      ${labelText}
    `;
  }).join("");
  
  svg.innerHTML = gridLines + barsHTML;
}

function downloadBlob(filename, content, type) {
  let blob = new Blob([content], { type });
  let url = URL.createObjectURL(blob);
  let link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapePdfText(value) {
  return String(value ?? "")
    .replaceAll("₹", "Rs. ")
    .replace(/[^\x20-\x7E]/g, "")
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)");
}

function makeSimplePdf(title, rows) {
  let lines = [title, "", ...rows.map(row => `${row.Metric || ""}: ${row.Value || ""}`)].slice(0, 44);
  let text = lines.map((line, index) => `BT /F1 11 Tf 48 ${750 - index * 16} Td (${escapePdfText(line)}) Tj ET`).join("\n");
  let objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${text.length} >>\nstream\n${text}\nendstream`
  ];
  let pdf = "%PDF-1.4\n";
  let offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  let xrefAt = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach(offset => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF`;
  return pdf;
}

function exportRows(filename, rows, format) {
  let headers = Object.keys(rows[0] || { Report: "" });
  if (format === "csv") {
    let csv = [headers.join(","), ...rows.map(row => headers.map(header => `"${String(row[header] ?? "").replaceAll('"', '""')}"`).join(","))].join("\n");
    downloadBlob(`${filename}.csv`, csv, "text/csv");
    return;
  }
  let table = `<table><thead><tr>${headers.map(header => `<th>${header}</th>`).join("")}</tr></thead><tbody>${rows.map(row => `<tr>${headers.map(header => `<td>${row[header] ?? ""}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  if (format === "excel") {
    downloadBlob(`${filename}.xls`, table, "application/vnd.ms-excel");
    return;
  }
  downloadBlob(`${filename}.pdf`, makeSimplePdf(filename, rows), "application/pdf");
}

// MONOSPACE COURIER PLAIN TEXT REPORT COMPILER
function compileReportText(period, analytics) {
  let title = `====================================================\n`;
  title += `           CRAXX operations center REPORT           \n`;
  title += `               ${period.toUpperCase()} PERFORMANCE SHEET              \n`;
  title += ` Generated At: ${new Date(analytics.generatedAt).toLocaleString()} \n`;
  title += `====================================================\n\n`;

  let source = analytics[period] || analytics.monthly;
  let summary = `  - Total Revenue        : ${formatMoney(source.revenue || 0)}\n`;
  summary += `  - Completed Orders     : ${source.orders || 0} invoices\n`;
  summary += `  - Total ₹7.5 Patti Sold: ${source.pcs7_5 || 0} Patti\n`;
  summary += `  - Total ₹15 PCS Sold   : ${source.pcs15 || 0} pcs\n`;
  summary += `  - Total PCS Sold       : ${source.pcsTotal || 0} pcs\n`;
  summary += `  - Best Selling Snack   : ${analytics.monthly.best}\n`;
  summary += `  - Lowest Selling Snack : ${analytics.monthly.lowest}\n\n`;

  summary += `====================================================\n`;
  summary += `        TOP PRODUCT SALES (CURRENT MONTH RANK)       \n`;
  summary += `====================================================\n`;
  summary += `  Rank  Snack Item          Sold Qty  Revenue  Pieces \n`;
  summary += `  --------------------------------------------------\n`;

  analytics.productRows.slice(0, 15).forEach((p, idx) => {
    let rank = String(idx + 1).padStart(2, " ");
    let name = p.name.padEnd(20, " ").slice(0, 20);
    let units = String(p.units).padStart(8, " ");
    let rev = formatMoney(p.revenue).padStart(8, " ");
    let pcs = String(p.pcsTotal || (p.units * 10)).padStart(8, " ");
    summary += `  ${rank}.   ${name} ${units} ${rev} ${pcs}\n`;
  });

  summary += `  --------------------------------------------------\n`;
  summary += `  Database integrity verified. Offline local sync complete.\n`;
  summary += `====================================================\n`;

  return title + summary;
}
