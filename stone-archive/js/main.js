const $ = (s, p=document) => p.querySelector(s);
const $$ = (s, p=document) => [...p.querySelectorAll(s)];

function imageMarkup(stone, className='stone-image') {
  return `<div class="${className}" role="img" aria-label="${stone.ja}（${stone.en}）の原石標本" style="background-image:url('images/stones/${stone.slug}.png')"></div>`;
}

function cardMarkup(stone, extra='') {
  return `<article class="stone-card ${extra}" tabindex="0" role="button" data-stone="${stone.id}" data-colors="${stone.colors.join(' ')}" aria-label="${stone.ja}の詳細を開く">
    ${imageMarkup(stone)}
    <div class="card-body"><span class="spec-no">${stone.id} / ${stone.group}</span><h3>${stone.en}</h3><p class="jp-name">${stone.ja}</p>
    <div class="card-meta"><span>MOHS<br><b>${stone.mohs}</b></span><span>COLOR<br><b>${stone.colorJa}</b></span></div></div>
    <div class="card-reveal"><span>${stone.formula}</span><span>${stone.origin.split('／')[0]}</span></div>
  </article>`;
}

function buildModal() {
  document.body.insertAdjacentHTML('beforeend', `<div class="modal" id="stone-modal" aria-hidden="true"><div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="modal-close" aria-label="詳細を閉じる">CLOSE <span>×</span></button><div id="modal-content"></div></div></div>`);
  const modal = $('#stone-modal');
  const close = () => { modal.classList.remove('is-open'); modal.setAttribute('aria-hidden','true'); document.body.classList.remove('modal-open'); setTimeout(()=>modal._trigger?.focus(),250); };
  modal.addEventListener('click', e => { if(e.target===modal || e.target.closest('.modal-close')) close(); });
  document.addEventListener('keydown', e => { if(e.key==='Escape' && modal.classList.contains('is-open')) close(); });
  window.openStone = (id, trigger) => {
    const s=STONES.find(x=>x.id===id); if(!s) return;
    $('#modal-content').innerHTML = `<div class="modal-grid">${imageMarkup(s,'modal-image')}<div class="modal-copy"><span class="eyebrow">SPECIMEN ${s.id} / ${s.group}</span><h2 id="modal-title">${s.en}</h2><p class="modal-ja">${s.ja}<small>${s.alias}</small></p><dl><div><dt>MINERAL / 鉱物分類</dt><dd>${s.group}</dd></div><div><dt>FORMULA / 化学式</dt><dd>${s.formula}</dd></div><div><dt>COLOR / 色</dt><dd>${s.colorJa}</dd></div><div><dt>MOHS / モース硬度</dt><dd>${s.mohs}</dd></div><div><dt>CRYSTAL SYSTEM / 結晶系</dt><dd>${s.crystal}</dd></div><div><dt>ORIGIN / 主な産地</dt><dd>${s.origin}</dd></div><div><dt>BIRTHSTONE / 誕生石</dt><dd>${s.birth}</dd></div></dl><div class="description"><span>DESCRIPTION</span><p>${s.desc}</p></div></div></div>`;
    modal._trigger=trigger; modal.classList.add('is-open'); modal.setAttribute('aria-hidden','false'); document.body.classList.add('modal-open'); $('.modal-close',modal).focus();
  };
}

function bindCards(root=document) {
  root.addEventListener('click', e=>{ const c=e.target.closest('[data-stone]'); if(c) openStone(c.dataset.stone,c); });
  root.addEventListener('keydown', e=>{ const c=e.target.closest('[data-stone]'); if(c && (e.key==='Enter'||e.key===' ')){e.preventDefault();openStone(c.dataset.stone,c);} });
}

function initCollection() {
  const grid=$('#collection-grid'); if(!grid) return;
  grid.innerHTML=STONES.map((s,i)=>cardMarkup(s, i===0||i===6?'card-featured':'')).join('');
  $$('.filter-btn').forEach(btn=>btn.addEventListener('click',()=>{
    $$('.filter-btn').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false')}); btn.classList.add('active');btn.setAttribute('aria-pressed','true');
    const f=btn.dataset.filter; $$('.stone-card',grid).forEach(c=>{ const show=f==='all'||c.dataset.colors.split(' ').includes(f); c.classList.toggle('filtered-out',!show); });
  }));
}

function initColorPage(){ const root=$('#color-catalog'); if(!root)return; const groups=[['01','RED / 赤',['006','015']],['02','PINK / ピンク',['002','016']],['03','YELLOW / 黄',['005','013']],['04','GREEN / 緑',['004','009']],['05','BLUE / 青',['003','008','014','007']],['06','PURPLE / 紫',['001','009']],['07','BLACK / 黒',['010']],['08','WHITE & CLEAR / 白・透明',['011','012']]]; root.innerHTML=groups.map((g,i)=>`<section class="color-group color-layout-${i%3}"><header><span>${g[0]}</span><h2>${g[1]}</h2></header><div class="color-cards">${g[2].map(id=>cardMarkup(STONES.find(s=>s.id===id))).join('')}</div></section>`).join(''); }

function initHome(){ const grid=$('#featured-grid'); if(grid) grid.innerHTML=['001','004','007','003'].map((id,i)=>cardMarkup(STONES.find(s=>s.id===id),`home-card home-card-${i+1}`)).join(''); }

function initNav(){ const b=$('.menu-toggle'),nav=$('.site-nav'); if(b)b.addEventListener('click',()=>{const open=nav.classList.toggle('open');b.setAttribute('aria-expanded',open)}); }
function initPageTransitions(){
  requestAnimationFrame(()=>document.body.classList.add('page-ready'));
  addEventListener('pageshow',()=>{document.body.classList.remove('page-leaving');requestAnimationFrame(()=>document.body.classList.add('page-ready'));});
  document.addEventListener('click',e=>{
    const link=e.target.closest('a[href]');
    if(!link||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||link.target==='_blank')return;
    const url=new URL(link.href,location.href);
    if(url.origin!==location.origin)return;
    if(url.pathname===location.pathname&&url.hash)return;
    e.preventDefault();document.body.classList.remove('page-ready');document.body.classList.add('page-leaving');
    setTimeout(()=>{location.href=url.href},300);
  });
}
function initCinematicHero(){
  const hero=$('#cinematic-hero'); if(!hero)return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){hero.style.setProperty('--p','.45');return;}
  const stage=$('.cinematic-sticky',hero);
  let ticking=false;
  const update=()=>{const max=hero.offsetHeight-innerHeight;const p=Math.max(0,Math.min(1,-hero.getBoundingClientRect().top/max));hero.style.setProperty('--p',p.toFixed(3));ticking=false;};
  addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(update);ticking=true;}},{passive:true});
  addEventListener('resize',update);update();
  if(matchMedia('(hover:hover) and (pointer:fine)').matches){
    stage.addEventListener('pointermove',e=>{const x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;hero.style.setProperty('--px',`${(x*18).toFixed(1)}px`);hero.style.setProperty('--py',`${(y*12).toFixed(1)}px`);hero.style.setProperty('--ry',`${(x*2.2).toFixed(2)}deg`);hero.style.setProperty('--rx',`${(-y*1.5).toFixed(2)}deg`);});
    stage.addEventListener('pointerleave',()=>{hero.style.setProperty('--px','0px');hero.style.setProperty('--py','0px');hero.style.setProperty('--ry','0deg');hero.style.setProperty('--rx','0deg');});
  }
}
function initReveal(){ if(matchMedia('(prefers-reduced-motion: reduce)').matches)return; const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('revealed');io.unobserve(e.target)}}),{threshold:.08}); $$('main section, .stone-card').forEach((el,i)=>{el.classList.add('reveal');if(el.classList.contains('stone-card'))el.style.setProperty('--delay',`${(i%4)*70}ms`);io.observe(el)}); }
document.addEventListener('DOMContentLoaded',()=>{initPageTransitions();buildModal();initHome();initCollection();initColorPage();bindCards();initNav();initCinematicHero();requestAnimationFrame(initReveal);});
