/* BYRAIN · FIRST TRANSFORMATION · поведение локальной карточки */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Галерея */
  var main = $('#gallery-main'), badge = $('#gallery-badge');
  $$('[data-gallery] [role="tab"]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (b.getAttribute('aria-selected') === 'true') return;
      $$('[data-gallery] [role="tab"]').forEach(function (x) { x.setAttribute('aria-selected', 'false'); });
      b.setAttribute('aria-selected', 'true');
      main.classList.add('is-fading');
      setTimeout(function () {
        main.src = b.dataset.src;
        if (b.dataset.alt) main.alt = b.dataset.alt;
        badge.textContent = b.dataset.cap;
        main.onload = function () { main.classList.remove('is-fading'); };
      }, 180);
    });
  });

  /* Лайтбокс галереи */
  var lb = $('#lightbox'), lbImg = $('#lightbox-img'), lbCap = $('#lightbox-cap');
  var tabs = $$('[data-gallery] [role="tab"]'), cur = 0, lastFocus = null;
  function showLb(i) {
    cur = (i + tabs.length) % tabs.length;
    var b = tabs[cur]; lbImg.src = b.dataset.src; lbImg.alt = b.dataset.alt || ''; lbCap.textContent = (cur + 1) + ' / ' + tabs.length + ' · ' + b.dataset.cap;
  }
  function openLb() { lastFocus = document.activeElement; var i = tabs.findIndex(function (t) { return t.getAttribute('aria-selected') === 'true'; }); showLb(i < 0 ? 0 : i); lb.hidden = false; document.body.style.overflow = 'hidden'; $('[data-lightbox-close]').focus(); }
  function closeLb() { lb.hidden = true; document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
  if (lb) {
    $$('[data-lightbox-open]').forEach(function (b) { b.addEventListener('click', openLb); });
    $('[data-lightbox-close]').addEventListener('click', closeLb);
    $('[data-lightbox-prev]').addEventListener('click', function () { showLb(cur - 1); });
    $('[data-lightbox-next]').addEventListener('click', function () { showLb(cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) { if (lb.hidden) return; if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowLeft') showLb(cur - 1); if (e.key === 'ArrowRight') showLb(cur + 1); });
    var sx = null; lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) showLb(cur + (dx < 0 ? 1 : -1)); sx = null; });
  }

  /* Этапы результата: клик и автопрокрутка, пока блок виден */
  var stages = $$('[data-stages] .stage'), stageTimer = null, idx = 0;
  function setStage(i) {
    idx = i; stages.forEach(function (s, n) { s.classList.toggle('is-active', n === i); });
  }
  stages.forEach(function (s, i) {
    s.addEventListener('click', function () { setStage(i); restart(); });
    s.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setStage(i); restart(); } });
  });
  function restart() { clearInterval(stageTimer); stageTimer = setInterval(function () { setStage((idx + 1) % stages.length); }, 4200); }
  if (stages.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var so = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) restart(); else clearInterval(stageTimer); }); }, { threshold: 0.4 });
    so.observe($('[data-stages]'));
  }

  /* До/после: бегунок двигает линию раздела */
  $$('[data-ba]').forEach(function (fig) {
    var r = $('.ba__range', fig);
    if (!r) return;
    var set = function (v) { fig.style.setProperty('--pos', v + '%'); };
    r.addEventListener('input', function () { set(r.value); });
    var frame = $('.ba__frame', fig);
    var drag = function (e) {
      var rect = frame.getBoundingClientRect();
      var x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      var v = Math.max(0, Math.min(100, x / rect.width * 100));
      r.value = v; set(v);
    };
    frame.addEventListener('pointerdown', function (e) { frame.setPointerCapture(e.pointerId); drag(e); frame.addEventListener('pointermove', drag); });
    frame.addEventListener('pointerup', function () { frame.removeEventListener('pointermove', drag); });
    frame.addEventListener('pointercancel', function () { frame.removeEventListener('pointermove', drag); });
  });

  /* Нижняя панель покупки появляется после первого экрана */
  var sticky = $('#sticky'), hero = $('.hero');
  if (sticky && hero) {
    var ho = new IntersectionObserver(function (es) {
      var on = !es[0].isIntersecting && es[0].boundingClientRect.top < 0;
      sticky.classList.toggle('is-on', on);
      sticky.setAttribute('aria-hidden', String(!on));
    }, { threshold: 0, rootMargin: '-120px 0px 0px 0px' });
    ho.observe(hero);
  }

  /* Корзина и избранное: локальная имитация */
  var toast = $('#toast'), tt = null;
  function say(msg) { toast.textContent = msg; toast.classList.add('is-on'); clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove('is-on'); }, 2600); }
  var count = 0;
  $$('[data-add]').forEach(function (b) { b.addEventListener('click', function () { count++; say('Крем добавлен в корзину · ' + count + ' шт. · 16 000 ₽'); }); });
  $$('[data-fav]').forEach(function (b) { b.addEventListener('click', function () { var on = b.classList.toggle('is-on'); b.style.background = on ? 'var(--field)' : ''; say(on ? 'Добавлено в избранное' : 'Убрано из избранного'); }); });
  var cart = $('[data-cart]'); if (cart) cart.addEventListener('click', function () { say(count ? 'В корзине: ' + count + ' × FIRST TRANSFORMATION' : 'Корзина пуста'); });

  /* Появление секций */
  if ('IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); ro.unobserve(e.target); } }); }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach(function (el) { ro.observe(el); });
  } else { $$('.reveal').forEach(function (el) { el.classList.add('is-in'); }); }

  /* Пометки для согласования */
  var dt = $('#dev-toggle');
  function applyDev(on) { document.documentElement.classList.toggle('dev', on); dt.setAttribute('aria-pressed', String(on)); try { localStorage.setItem('ft-dev', on ? '1' : '0'); } catch (e) {} }
  var saved = false; try { saved = localStorage.getItem('ft-dev') === '1'; } catch (e) {}
  applyDev(saved);
  dt.addEventListener('click', function () { applyDev(!document.documentElement.classList.contains('dev')); });

  /* FAQ: открыт один вопрос за раз */
  var ds = $$('.faq details');
  ds.forEach(function (d) { d.addEventListener('toggle', function () { if (d.open) ds.forEach(function (o) { if (o !== d) o.open = false; }); }); });
})();
