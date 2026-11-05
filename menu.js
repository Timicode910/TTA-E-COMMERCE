const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

const CART_KEY = 'branchCart'; // same bag the shop page and order page use

const IMAGES = [
  'https://images.unsplash.com/photo-1598300056393-4aac492f4344?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80'
];

const MENU = [
  { name: 'Ergonomic Chair Pro', category: 'Chairs', colors: 15, price: '$599+', note: 'Adjustable lumbar and arms' },
  { name: 'Verve Chair', category: 'Chairs', colors: 8, price: '$699+', note: 'Breathable mesh back' },
  { name: 'Saddle Chair', category: 'Chairs', colors: 5, price: '$389+', note: 'Open-hip seating' },
  { name: 'Daily Desk', category: 'Desks', colors: 6, price: '$379+', note: 'A simple, sturdy everyday desk' },
  { name: 'Duo Standing Desk', category: 'Desks', colors: 12, price: '$599+', note: 'Dual-motor sit-stand' },
  { name: 'Tria Standing Desk', category: 'Desks', colors: 8, price: '$999+', note: 'Three-motor, extra stable' },
  { name: 'Monitor Stand', category: 'Accessories', colors: 3, price: '$139+', note: 'Lifts your screen to eye level' },
  { name: 'Headphone Stand', category: 'Accessories', colors: 3, price: '$59', note: 'A tidy home for your headphones' },
  { name: 'Adjustable Footrest', category: 'Accessories', colors: 2, price: '$119', note: 'Tilts to the angle you like' },
  { name: 'Woven Chair Mat', category: 'Accessories', colors: 5, price: '$189', note: 'Protects floors, rolls smoothly' },
  { name: 'Desk Drawer', category: 'Storage', colors: 5, price: '$119+', note: 'Slides under any desk' }
].map((p, i) => ({ ...p, image: IMAGES[i % IMAGES.length] }));

const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---------- bag ----------
const readCart = () => {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; }
};
const writeCart = items => {
  try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch { /* storage blocked */ }
};
const paintBagCount = () => { $('#bag-count').textContent = readCart().length; };

let toastTimer;
function toast(text) {
  const el = $('#menu-toast');
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

function addToBag(name) {
  const item = MENU.find(p => p.name === name);
  if (!item) return;
  const cart = readCart();
  cart.push({ name: item.name, price: item.price, image: item.image });
  writeCart(cart);
  paintBagCount();
  toast(`${item.name} added to your bag`);
}

// ---------- filtering ----------
let filter = 'all';
let query = '';

function render() {
  const q = query.trim().toLowerCase();
  const shown = MENU.filter(p =>
    (filter === 'all' || p.category === filter) &&
    (!q || (p.name + ' ' + p.category + ' ' + p.note).toLowerCase().includes(q))
  );

  $('#menu-grid').innerHTML = shown.map(p => `
    <article class="menu-card">
      <div class="menu-card-media"><img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy"></div>
      <div class="menu-card-body">
        <div class="eyebrow">${escapeHtml(p.category)}</div>
        <h3>${escapeHtml(p.name)}</h3>
        <p>${escapeHtml(p.note)}</p>
        <small>${p.colors} colors</small>
      </div>
      <div class="menu-card-foot">
        <strong>${escapeHtml(p.price)}</strong>
        <button class="button button-outline" type="button" data-add="${escapeHtml(p.name)}">Add to bag <span>+</span></button>
      </div>
    </article>`).join('');

  $('#menu-none').hidden = shown.length > 0;
  $('#menu-count').textContent = shown.length
    ? `${shown.length} ${shown.length === 1 ? 'item' : 'items'}`
    : '';
}

$('.menu-filters').addEventListener('click', e => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  filter = chip.dataset.filter;
  $$('.chip').forEach(c => c.classList.toggle('active', c === chip));
  render();
});

$('#menu-search').addEventListener('input', e => { query = e.target.value; render(); });

$('#menu-reset').addEventListener('click', () => {
  filter = 'all';
  query = '';
  $('#menu-search').value = '';
  $$('.chip').forEach(c => c.classList.toggle('active', c.dataset.filter === 'all'));
  render();
});

$('#menu-grid').addEventListener('click', e => {
  const btn = e.target.closest('[data-add]');
  if (btn) addToBag(btn.dataset.add);
});

// the bag may change in another tab
window.addEventListener('storage', e => { if (e.key === CART_KEY) paintBagCount(); });

render();
paintBagCount();
