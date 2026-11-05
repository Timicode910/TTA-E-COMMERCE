const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const CART_KEY = 'branchCart';
// Saves a form input to json-server (db.json). Start it with: npm run api
const API = 'http://localhost:3000';
async function saveInput(collection, data){
  const res = await fetch(`${API}/${collection}`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({...data, createdAt:new Date().toISOString()})
  });
  if(!res.ok) throw new Error('Save failed');
  return res.json();
}
let cart = [];
try { cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { cart = []; }
const toast = (message) => {
  const el = $('.toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('show'), 2400);
};
function updateCart(){
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch {}
  $$('.cart-count').forEach(el => el.textContent = cart.length);
  $('.cart-count-text').textContent = `(${cart.length})`;
  const list = $('.cart-items');
  if(!cart.length){ list.innerHTML = '<p>Your bag is empty.</p>'; return; }
  list.innerHTML = cart.map((item,i)=>`<div class="cart-item"><img src="${item.image}" alt=""><div><strong>${item.name}</strong><small>${item.price}</small></div><button data-remove="${i}">Remove</button></div>`).join('');
  $$('[data-remove]', list).forEach(btn => btn.addEventListener('click', () => {cart.splice(Number(btn.dataset.remove),1);updateCart();}));
}
function openModal(id){ const el = $(id); if(el){el.classList.add('open');el.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';}}
function closeModal(el){el.classList.remove('open');el.setAttribute('aria-hidden','true');if(!$('.overlay.open'))document.body.style.overflow='';}
$$('.modal-close').forEach(btn=>btn.addEventListener('click',()=>closeModal(btn.closest('.overlay'))));
$$('.overlay').forEach(overlay=>overlay.addEventListener('click',e=>{if(e.target===overlay)closeModal(overlay)}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){$$('.overlay.open').forEach(closeModal);$('.mobile-menu').classList.remove('open');document.body.style.overflow='';}});
$('.announcement-close').addEventListener('click',()=>$('.announcement').remove());
$('.search-open').addEventListener('click',()=>openModal('#search-modal'));
$('.account-open').addEventListener('click',()=>{ window.location.href='login.html'; });
$('.cart-open').addEventListener('click',()=>{updateCart();openModal('#cart-modal')});
$$('.quiz-open').forEach(btn=>btn.addEventListener('click',()=>openModal('#quiz-modal')));
$('.menu-toggle').addEventListener('click',()=>{$('.mobile-menu').classList.add('open');$('.mobile-menu').setAttribute('aria-hidden','false');document.body.style.overflow='hidden';});
$('.mobile-menu-close').addEventListener('click',()=>{$('.mobile-menu').classList.remove('open');$('.mobile-menu').setAttribute('aria-hidden','true');document.body.style.overflow='';});
$$('.mobile-menu a').forEach(a=>a.addEventListener('click',()=>{$('.mobile-menu').classList.remove('open');document.body.style.overflow='';}));
$$('.filter-tab').forEach(tab=>tab.addEventListener('click',()=>{
  $$('.filter-tab').forEach(t=>t.classList.toggle('active',t===tab));
  $$('.persona-card').forEach(card=>{card.classList.toggle('hidden',tab.dataset.filter!=='all'&&card.dataset.category!==tab.dataset.filter);});
}));
const spaces = [
  {name:'Bedside Bureau',image:'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=90',products:[['Ergonomic Chair Pro','15 colors','$599+'],['Daily Desk','6 colors','$379+'],['Adjustable Footrest','2 colors','$119'],['Woven Chair Mat','5 colors','$189']]},
  {name:'Arcade Alcove',image:'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=90',products:[['Daily Desk','6 colors','$379+'],['Headphone Stand','3 colors','$59'],['Adjustable Footrest','2 colors','$119']]},
  {name:'Cozy Corner',image:'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=90',products:[['Ergonomic Chair Pro','15 colors','$599+'],['Duo Standing Desk','12 colors','$599+'],['Monitor Stand','3 colors','$139+'],['Headphone Stand','3 colors','$59']]},
  {name:'Scandinavian Studio',image:'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1400&q=90',products:[['Verve Chair','8 colors','$699+'],['Duo Standing Desk','12 colors','$599+']]},
  {name:'Organized Oasis',image:'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=90',products:[['Duo Standing Desk','12 colors','$599+'],['Desk Drawer','5 colors','$119+']]},
  {name:'Midcentury Sanctuary',image:'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=90',products:[['Tria Standing Desk','8 colors','$999+'],['Saddle Chair','5 colors','$389+']]}
];
const productImages=[
'https://images.unsplash.com/photo-1598300056393-4aac492f4344?auto=format&fit=crop&w=450&q=80',
'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=450&q=80',
'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=450&q=80',
'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=450&q=80'
];
function renderSpace(index){
  const s=spaces[index];
  $('#space-title').textContent=s.name;
  const img=$('#space-image'); img.style.opacity='0';
  setTimeout(()=>{img.src=s.image;img.alt=s.name+' workspace';img.style.opacity='1';},120);
  $('#space-products').innerHTML=s.products.map((p,i)=>`<div class="space-product"><span class="product-number">${String(i+1).padStart(2,'0')}</span><img src="${productImages[i%productImages.length]}" alt="${p[0]}"><div><h3>${p[0]}</h3><p>${p[1]}</p><strong>${p[2]}</strong></div><button class="add-cart" aria-label="Add ${p[0]} to bag" data-name="${p[0]}" data-price="${p[2]}" data-image="${productImages[i%productImages.length]}">+</button></div>`).join('');
  $$('.add-cart').forEach(btn=>btn.addEventListener('click',()=>addToCart(btn.dataset.name,btn.dataset.price,btn.dataset.image)));
}
$$('.space-tab').forEach(tab=>tab.addEventListener('click',()=>{$$('.space-tab').forEach(t=>t.classList.toggle('active',t===tab));renderSpace(Number(tab.dataset.space));}));
function addToCart(name,price,image){cart.push({name,price,image});updateCart();toast(`${name} added to your bag`);}
$$('.add-cart').forEach(btn=>btn.addEventListener('click',()=>addToCart(btn.closest('.space-product').querySelector('h3').textContent,btn.closest('.space-product').querySelector('strong').textContent,btn.closest('.space-product').querySelector('img').src)));
$('.review-next').addEventListener('click',()=>$('.review-track').scrollBy({left:290,behavior:'smooth'}));
$('.review-prev').addEventListener('click',()=>$('.review-track').scrollBy({left:-290,behavior:'smooth'}));
$('#newsletter-form').addEventListener('submit',async e=>{
  e.preventDefault();
  const form=e.target, msg=$('.newsletter-message');
  const email=form.querySelector('input').value.trim().toLowerCase();
  try{
    const existing=await (await fetch(`${API}/newsletter?email=${encodeURIComponent(email)}`)).json();
    if(!existing.length) await saveInput('newsletter',{email});
    msg.textContent='Thanks for subscribing! Keep an eye on your inbox.';
    form.reset();
  }catch{
    msg.textContent='Could not save your email right now. Please try again.';
  }
});
$('#search-form').addEventListener('submit',e=>{e.preventDefault();const q=e.target.querySelector('input').value.trim();if(q)saveInput('searches',{query:q}).catch(()=>{});$('.search-message').textContent=q?`Showing the best matches for “${q}” in this demo.`:'';});
$('#account-form').addEventListener('submit',e=>{e.preventDefault();saveInput('signups',{email:e.target.querySelector('input').value.trim().toLowerCase()}).catch(()=>{});$('.account-message').textContent='Thanks! Account sign-in is a demo in this recreation.';});
$$('.quiz-options button').forEach(btn=>btn.addEventListener('click',()=>{$$('.quiz-options button').forEach(b=>b.style.background='white');btn.style.background='#e4e9df';saveInput('quizAnswers',{answer:btn.dataset.answer}).catch(()=>{});$('.quiz-result').textContent=`Great — we’ll tailor your recommendations for: ${btn.dataset.answer}. Explore chairs, desks, and workspace bundles below.`;}));
$('.cart-start').addEventListener('click',()=>closeModal($('#cart-modal')));
renderSpace(0);
updateCart();
