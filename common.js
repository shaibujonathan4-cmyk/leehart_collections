// =========================================================
// LEEHART COLLECTIONS - SHARED LOGIC
// Loaded by every customer-facing page (index, collections,
// about, faq, contact). Admin panel has its own script.
// =========================================================

// ---- Store contact number (used for every WhatsApp enquiry link) ----
const STORE_WHATSAPP_NUMBER = "2348000000000"; // TODO: replace with the real business WhatsApp number, international format, no + or leading 0s after country code

// Default product data - used the first time the site loads, before any admin edits
const defaultProducts = [
  {
    id: 1,
    name: "Luxury Embellished Heart Abaya (Pure White)",
    category: "abayas",
    price: "$135.00",
    rating: "★ 5.0 (42)",
    badge: "Best Seller",
    desc: "Hand-embellished silk blend gown with delicate embroidery.",
    image: "images/white-abaya.jpg",
    fallbackImg: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 2,
    name: "Royal Emerald Gold-Embroidered Abaya",
    category: "abayas",
    price: "$140.00",
    rating: "★ 4.9 (38)",
    badge: "Trending",
    desc: "Velvet-touch gown featuring gold trim embroidery along cuffs.",
    image: "images/emerald-abaya.jpg",
    fallbackImg: "https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 3,
    name: "6-Piece Champagne Gold Spinner Luggage Set",
    category: "luggage",
    price: "$290.00",
    rating: "★ 5.0 (64)",
    badge: "Must Have",
    desc: "Hardshell suitcases with 360-degree silent dual spinner wheels.",
    image: "images/luggage-set.jpg",
    fallbackImg: "https://images.unsplash.com/photo-1565026057447-b88e3f29042b?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 4,
    name: "Beauty Bella Textured Leather Handbag",
    category: "bags",
    price: "$85.00",
    rating: "★ 4.8 (29)",
    badge: "New",
    desc: "Structured leather handbag featuring dual handles.",
    image: "images/leather-bag.jpg",
    fallbackImg: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 5,
    name: "Crystal-Embellished H-Strap Slides",
    category: "footwear",
    price: "$45.00",
    rating: "★ 4.9 (51)",
    badge: "Hot",
    desc: "Comfort-cushioned flat sandals accented with rhinestones.",
    image: "images/h-strap-slides.jpg",
    fallbackImg: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 6,
    name: "Rhinestone Knot Low-Heel Mules",
    category: "footwear",
    price: "$52.00",
    rating: "★ 5.0 (19)",
    badge: "Limited",
    desc: "Square-toe mules featuring crossover mesh rhinestone straps.",
    image: "images/mules.jpg",
    fallbackImg: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=500&q=80"
  }
];

const defaultContent = {
  announcementText: 'FLASH SALE: Enjoy 15% OFF your first order with code: <strong>LEEHART15</strong>',
  heroTitle: 'Redefine Your Style With Premium <span>Leehart Wear</span>',
  heroDesc: 'Explore our curated selection of embellished silk abayas, luxury luggage sets, handcrafted designer handbags, and crystal-studded footwear.',
  heroImage: 'images/hero-abaya.jpg'
};

// ---- Load products & site content (admin-edited data lives in localStorage) ----
function loadProducts() {
  try {
    const stored = localStorage.getItem('leehart_products');
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return defaultProducts;
}

function loadContent() {
  try {
    const stored = localStorage.getItem('leehart_content');
    if (stored) return { ...defaultContent, ...JSON.parse(stored) };
  } catch (e) {}
  return defaultContent;
}

const products = loadProducts();
const content = loadContent();
let currentCategory = 'all';
let singleItemEnquiryId = null;

function applyContent() {
  const bar = document.getElementById('announcementText');
  if (bar) bar.innerHTML = content.announcementText;

  const heroTitle = document.getElementById('heroTitle');
  if (heroTitle) heroTitle.innerHTML = content.heroTitle;

  const heroDesc = document.getElementById('heroDesc');
  if (heroDesc) heroDesc.textContent = content.heroDesc;

  const heroImage = document.getElementById('heroImage');
  if (heroImage) heroImage.src = content.heroImage;
}

// ---- Enquiry list (cart-like), persisted so it survives moving between pages ----
function getEnquiryList() {
  try {
    const stored = localStorage.getItem('leehart_enquiry_list');
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return [];
}

function saveEnquiryList(list) {
  localStorage.setItem('leehart_enquiry_list', JSON.stringify(list));
}

function addToEnquiry(id) {
  const list = getEnquiryList();
  if (list.includes(id)) {
    showToast('Already in your enquiry list');
    return;
  }
  list.push(id);
  saveEnquiryList(list);
  updateCartBadge();
  showToast('Added to your enquiry list');
}

function removeFromEnquiry(id) {
  const list = getEnquiryList().filter(x => x !== id);
  saveEnquiryList(list);
  updateCartBadge();
  renderEnquiryDrawer();
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (badge) badge.innerText = getEnquiryList().length;
}

function openEnquiryDrawer() {
  renderEnquiryDrawer();
  openModal('enquiryDrawer');
}

function renderEnquiryDrawer() {
  const body = document.getElementById('enquiryListBody');
  if (!body) return;
  const btn = document.getElementById('proceedEnquiryBtn');
  const list = getEnquiryList();

  if (!list.length) {
    body.innerHTML = '<div class="empty-state">Your enquiry list is empty. Tap "Enquire" on any item to add it here.</div>';
    if (btn) btn.disabled = true;
    return;
  }

  if (btn) btn.disabled = false;
  body.innerHTML = list.map(id => {
    const p = products.find(x => x.id === id);
    if (!p) return '';
    return `
      <div class="enquiry-item">
        <img src="${p.image}" alt="${p.name}" onerror="this.src='${p.fallbackImg}'">
        <div class="enquiry-item-info">
          <div class="enquiry-item-name">${p.name}</div>
          <div class="enquiry-item-price">${p.price}</div>
        </div>
        <button class="enquiry-remove" onclick="removeFromEnquiry(${p.id})">Remove</button>
      </div>
    `;
  }).join('');
}

// ---- Product rendering (used on the home page's featured strip and the full collections page) ----
function renderProducts(items, gridId) {
  const grid = document.getElementById(gridId || 'productGrid');
  if (!grid) return;

  if (!items.length) {
    grid.innerHTML = '<div class="empty-state">No items in this collection yet. Check back soon.</div>';
    return;
  }

  grid.innerHTML = items.map(p => `
    <div class="product-card">
      <div>
        <div class="product-image-wrap" onclick="openProductModal(${p.id})">
          ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
          <img src="${p.image}" alt="${p.name}" onerror="this.src='${p.fallbackImg}'">
        </div>
        <div class="product-details" onclick="openProductModal(${p.id})">
          <div class="product-rating">${p.rating}</div>
          <div class="product-name">${p.name}</div>
          <div class="product-desc">${p.desc}</div>
        </div>
      </div>
      <div class="product-footer">
        <div class="product-price">${p.price}</div>
        <button class="btn btn-primary" style="padding: 6px 12px; font-size: 0.8rem;" onclick="addToEnquiry(${p.id})">Enquire</button>
      </div>
    </div>
  `).join('');
}

function filterCategory(cat, btn) {
  currentCategory = cat;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderProducts(cat === 'all' ? products : products.filter(p => p.category === cat));
}

// ---- Product detail modal ----
function openProductModal(id) {
  const p = products.find(x => x.id === id);
  const body = document.getElementById('productModalBody');
  if (!p || !body) return;

  body.innerHTML = `
    <div class="pd-image">
      <img src="${p.image}" alt="${p.name}" onerror="this.src='${p.fallbackImg}'">
    </div>
    <div class="pd-info">
      <div class="pd-category">${p.category.toUpperCase()}</div>
      <div class="pd-name">${p.name}</div>
      <div class="pd-price">${p.price}</div>
      <div class="pd-desc">${p.desc}</div>
      <div class="pd-actions">
        <button class="btn btn-primary" onclick="addToEnquiry(${p.id}); closeModal('productModal');">Add to Enquiry List</button>
        <button class="btn btn-whatsapp" onclick="enquireSingleItem(${p.id})">Enquire on WhatsApp Now</button>
      </div>
      <p class="pd-note">Delivery timelines and exact sizing are confirmed once we receive your enquiry.</p>
    </div>
  `;
  openModal('productModal');
}

// ---- Enquiry form -> WhatsApp ----
function enquireSingleItem(id) {
  singleItemEnquiryId = id;
  closeModal('productModal');
  openEnquiryForm();
}

function openEnquiryForm() {
  closeModal('enquiryDrawer');
  openModal('enquiryFormModal');
}

function sendEnquiry() {
  const name = document.getElementById('enqName').value.trim();
  const phone = document.getElementById('enqPhone').value.trim();
  const message = document.getElementById('enqMessage').value.trim();

  if (!name || !phone) {
    showToast('Please enter your name and phone number');
    return;
  }

  const list = getEnquiryList();
  const items = singleItemEnquiryId
    ? [products.find(x => x.id === singleItemEnquiryId)].filter(Boolean)
    : list.map(id => products.find(x => x.id === id)).filter(Boolean);

  if (!items.length) {
    showToast('Add at least one item before sending an enquiry');
    return;
  }

  let text = `Hello Leehart Collections, my name is ${name} (${phone}).\n\nI'd like to enquire about:\n`;
  items.forEach(p => {
    text += `- ${p.name} (${p.price})\n`;
  });
  if (message) text += `\nMessage: ${message}`;

  const url = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');

  closeModal('enquiryFormModal');
  showToast('Opening WhatsApp…');
  singleItemEnquiryId = null;
}

// ---- Contact form (general enquiries, not tied to a specific product) ----
function submitContactForm() {
  const name = document.getElementById('contactName').value.trim();
  const phone = document.getElementById('contactPhone').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const message = document.getElementById('contactMessage').value.trim();

  if (!name || !phone) {
    showToast('Please enter your name and phone number');
    return;
  }

  let text = `Hello Leehart Collections, my name is ${name} (${phone}).`;
  if (email) text += `\nEmail: ${email}`;
  text += `\n\n${message || "I'd like to know more about your products."}`;

  const url = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');

  document.getElementById('contactName').value = '';
  document.getElementById('contactPhone').value = '';
  document.getElementById('contactEmail').value = '';
  document.getElementById('contactMessage').value = '';
  showToast('Opening WhatsApp…');
}

// ---- Modal helpers ----
function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('open');
  document.body.classList.add('no-scroll');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('open');
  document.body.classList.remove('no-scroll');
}

// ---- Toast ----
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

// ---- Mobile hamburger menu ----
function toggleMobileNav() {
  const nav = document.getElementById('mobileNav');
  if (nav) nav.classList.toggle('open');
}

// ---- Page-wide setup ----
document.addEventListener('DOMContentLoaded', function () {
  applyContent();
  updateCartBadge();

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  document.querySelectorAll('#mobileNav a').forEach(a => {
    a.addEventListener('click', () => {
      const nav = document.getElementById('mobileNav');
      if (nav) nav.classList.remove('open');
    });
  });

  // Highlight the current page in both nav menus
  const currentFile = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentFile || (currentFile === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
});
