const products = [
  {id:'especial',name:'Brasa Especial',category:'Hamburguesas',description:'Carne de res, queso, tocino, cebolla caramelizada y aderezo de la casa.',price:139,image:true},
  {id:'doble',name:'Doble Brasa',category:'Hamburguesas',description:'Doble carne, doble queso, vegetales frescos y salsa de la casa.',price:159,image:true},
  {id:'clasica',name:'La Clásica',category:'Hamburguesas',description:'Carne de res, queso americano, lechuga, tomate y pepinillos.',price:119,image:true},
  {id:'combo',name:'Combo de la semana',category:'Combos',description:'Doble Brasa, papas crujientes y bebida.',price:189,image:true},
  {id:'papas',name:'Papas especiales',category:'Acompañamientos',description:'Papas doradas con queso, especias y aderezo de la casa.',price:75,icon:'🍟'},
  {id:'bebida',name:'Bebida fría',category:'Bebidas',description:'Refresco o agua de sabor para acompañar tu pedido.',price:30,icon:'🥤'}
];
const cart = new Map();
const money = n => new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(n);
const grid=document.querySelector('#product-grid'), panel=document.querySelector('#cart'),overlay=document.querySelector('#overlay'),items=document.querySelector('#cart-items'),toast=document.querySelector('#toast');
let lastFocus,toastTimer;
function notify(message){toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),3200)}
function renderProducts(category='Todos'){
  grid.replaceChildren();
  products.filter(p=>category==='Todos'||p.category===category).forEach(p=>{
    const article=document.createElement('article');article.className='product';
    const photo=document.createElement('div');photo.className='product-photo'+(p.image?'':' pattern');
    if(p.image){const img=document.createElement('img');img.src=p.id==='combo'?'assets/burger-menu.webp':'assets/burger-hero.webp';img.alt=p.name;img.loading='lazy';photo.append(img)}else{photo.textContent=p.icon;photo.setAttribute('aria-hidden','true')}
    const body=document.createElement('div');body.className='product-body';
    const tag=document.createElement('span');tag.className='product-tag';tag.textContent=p.category;
    const title=document.createElement('h3');title.textContent=p.name;
    const desc=document.createElement('p');desc.textContent=p.description;
    const bottom=document.createElement('div');bottom.className='product-bottom';
    const price=document.createElement('strong');price.textContent=money(p.price);
    const add=document.createElement('button');add.type='button';add.textContent='+';add.setAttribute('aria-label','Agregar '+p.name+' al pedido');add.addEventListener('click',()=>addItem(p.id));
    bottom.append(price,add);body.append(tag,title,desc,bottom);article.append(photo,body);grid.append(article);
  });
}
function addItem(id){const product=products.find(p=>p.id===id);if(!product)return;cart.set(id,(cart.get(id)||0)+1);renderCart();notify(product.name+' agregado al pedido')}
function changeItem(id,delta){const next=(cart.get(id)||0)+delta;if(next<=0)cart.delete(id);else cart.set(id,next);renderCart()}
function renderCart(){
  const count=[...cart.values()].reduce((a,b)=>a+b,0);const total=products.reduce((sum,p)=>sum+p.price*(cart.get(p.id)||0),0);
  document.querySelectorAll('[data-count]').forEach(el=>el.textContent=count);
  document.querySelector('[data-total]').textContent=money(total);document.querySelector('#cart-total').textContent=money(total)+' MXN';
  document.querySelector('#send-order').disabled=!count;document.querySelector('#copy-order').disabled=!count;items.replaceChildren();
  if(!count){const empty=document.createElement('div');empty.className='empty-cart';empty.innerHTML='<span aria-hidden="true">🍔</span>Tu pedido está vacío.<br>Explora el menú y agrega lo que se te antoje.';items.append(empty);return}
  products.filter(p=>cart.has(p.id)).forEach(p=>{
    const row=document.createElement('div');row.className='cart-row';const info=document.createElement('div');
    const title=document.createElement('h3');title.textContent=p.name;const unit=document.createElement('small');unit.textContent=money(p.price)+' c/u';
    const qty=document.createElement('div');qty.className='quantity';const minus=document.createElement('button');minus.type='button';minus.textContent='−';minus.setAttribute('aria-label','Quitar una unidad de '+p.name);minus.addEventListener('click',()=>changeItem(p.id,-1));
    const value=document.createElement('span');value.textContent=cart.get(p.id);const plus=document.createElement('button');plus.type='button';plus.textContent='+';plus.setAttribute('aria-label','Agregar una unidad de '+p.name);plus.addEventListener('click',()=>changeItem(p.id,1));qty.append(minus,value,plus);info.append(title,unit,qty);
    const sub=document.createElement('strong');sub.textContent=money(p.price*cart.get(p.id));row.append(info,sub);items.append(row);
  });
}
function orderText(){const lines=products.filter(p=>cart.has(p.id)).map(p=>`${cart.get(p.id)} × ${p.name} — ${money(p.price*cart.get(p.id))}`);const total=products.reduce((sum,p)=>sum+p.price*(cart.get(p.id)||0),0);return `Hola 👋 Quiero realizar este pedido de ejemplo:\n\n${lines.join('\n')}\n\nTotal estimado: ${money(total)}\n\nDemo de Brasa 27 por Innovamoments.`}
function openCart(){lastFocus=document.activeElement;panel.classList.add('open');panel.setAttribute('aria-hidden','false');overlay.hidden=false;document.body.classList.add('cart-open');panel.querySelector('.close-cart').focus()}
function closeCart(){panel.classList.remove('open');panel.setAttribute('aria-hidden','true');overlay.hidden=true;document.body.classList.remove('cart-open');lastFocus?.focus()}
document.querySelectorAll('[data-open-cart]').forEach(button=>button.addEventListener('click',openCart));document.querySelector('.close-cart').addEventListener('click',closeCart);overlay.addEventListener('click',closeCart);
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&panel.classList.contains('open'))closeCart();if(event.key==='Tab'&&panel.classList.contains('open')){const focusable=[...panel.querySelectorAll('button:not(:disabled)')];if(event.shiftKey&&document.activeElement===focusable[0]){event.preventDefault();focusable.at(-1).focus()}else if(!event.shiftKey&&document.activeElement===focusable.at(-1)){event.preventDefault();focusable[0].focus()}}});
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',b===button?'true':'false')});renderProducts(button.dataset.filter)}));
document.querySelectorAll('[data-add]').forEach(button=>button.addEventListener('click',()=>addItem(button.dataset.add)));
document.querySelector('#send-order').addEventListener('click',()=>{window.open('https://wa.me/?text='+encodeURIComponent(orderText()),'_blank','noopener,noreferrer')});
document.querySelector('#copy-order').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(orderText());notify('Resumen copiado. Ya puedes compartirlo.')}catch{notify('No se pudo copiar. Prueba compartirlo por WhatsApp.')}});
document.querySelectorAll('[data-demo]').forEach(button=>button.addEventListener('click',()=>notify(button.dataset.demo+' se conecta cuando el negocio comparte su enlace real.')));
renderProducts();renderCart();
