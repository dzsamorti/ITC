/* ITC – nem görgetős, nézetváltós weboldal */
(function () {
  'use strict';

  /* ---- Elérhetőségek: ezeket írja át a valós adatokra ---- */
  var CONTACT = {
    email: 'info@example.com',
    phone: '+36 1 000 0000',
    address: 'Budapest, Magyarország'
  };

  var VIEWS = ['home', 'about', 'services', 'news', 'contact'];
  var SERVICES = ['export', 'sanctions', 'fta'];
  var DICT = window.ITC_I18N;
  var body = document.body;
  var lang = 'hu';
  var current = null;

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var t = function (key) { var v = DICT[lang][key]; return v === undefined ? DICT.hu[key] : v; };

  /* ================= Nyelv ================= */
  function detectLang() {
    try {
      var saved = localStorage.getItem('itc-lang');
      if (saved && DICT[saved]) return saved;
    } catch (e) { /* nincs tárhely */ }
    var nav = (navigator.language || 'hu').toLowerCase();
    return nav.indexOf('hu') === 0 ? 'hu' : 'en';
  }

  function applyLang(next) {
    lang = DICT[next] ? next : 'hu';
    document.documentElement.lang = lang;
    document.title = t('meta.title');
    $('meta[name="description"]').setAttribute('content', t('meta.description'));

    $$('[data-i18n]').forEach(function (el) { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-html]').forEach(function (el) { el.innerHTML = t(el.dataset.i18nHtml); });
    $$('[data-i18n-list]').forEach(function (el) {
      el.innerHTML = '';
      t(el.dataset.i18nList).forEach(function (item) {
        var li = document.createElement('li');
        li.textContent = item;
        el.appendChild(li);
      });
    });
    $$('[data-i18n-tags]').forEach(function (el) {
      el.innerHTML = '';
      t(el.dataset.i18nTags).forEach(function (tag, i) {
        if (i) {
          var sep = document.createElement('span');
          sep.className = 'sep';
          sep.setAttribute('aria-hidden', 'true');
          sep.textContent = '|';
          el.appendChild(sep);
        }
        el.appendChild(document.createTextNode(tag));
      });
    });
    $$('[data-i18n-attr]').forEach(function (el) {
      el.dataset.i18nAttr.split(';').forEach(function (pair) {
        var p = pair.split(':');
        el.setAttribute(p[0], t(p[1]));
      });
    });
    $('#main-nav').setAttribute('aria-label', t('nav.label'));

    $('.lang__current').textContent = lang.toUpperCase();
    $$('[data-lang]').forEach(function (b) {
      b.setAttribute('aria-current', b.dataset.lang === lang ? 'true' : 'false');
    });
    try { localStorage.setItem('itc-lang', lang); } catch (e) { /* nincs tárhely */ }
  }

  /* Nyelvválasztó */
  var langBtn = $('.lang__btn');
  var langMenu = $('#lang-menu');
  function toggleLangMenu(open) {
    langMenu.hidden = !open;
    langBtn.setAttribute('aria-expanded', String(open));
  }
  langBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    toggleLangMenu(langMenu.hidden);
    if (!langMenu.hidden) $('[data-lang="' + lang + '"]', langMenu).focus();
  });
  $$('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () {
      applyLang(b.dataset.lang);
      toggleLangMenu(false);
      langBtn.focus();
    });
  });
  document.addEventListener('click', function (e) {
    if (!langMenu.hidden && !e.target.closest('.lang')) toggleLangMenu(false);
    if (body.classList.contains('menu-open') && !e.target.closest('.main-nav, .menu-toggle')) setMenu(false);
  });

  /* ================= Mobil menü ================= */
  var menuBtn = $('.menu-toggle');
  function setMenu(open) {
    body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  }
  menuBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    setMenu(!body.classList.contains('menu-open'));
  });

  /* ================= Nézetváltás (hash-alapú) ================= */
  function parseHash() {
    var parts = location.hash.replace(/^#\/?/, '').split('/');
    var view = VIEWS.indexOf(parts[0]) > -1 ? parts[0] : 'home';
    return { view: view, sub: parts[1] || '' };
  }

  function route() {
    var r = parseHash();
    var changed = r.view !== current;
    var initial = current === null;

    if (changed) {
      $$('.view').forEach(function (v) {
        var on = v.dataset.view === r.view;
        v.classList.toggle('is-active', on);
        if (on) v.removeAttribute('inert'); else v.setAttribute('inert', '');
      });
      $$('[data-nav]').forEach(function (a) {
        if (a.dataset.nav === r.view) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
      });
      body.classList.toggle('is-home', r.view === 'home');
      body.dataset.view = r.view;
      current = r.view;
    }

    if (r.view === 'services') selectService(SERVICES.indexOf(r.sub) > -1 ? r.sub : (changed ? 'export' : null));
    if (r.view === 'contact' && SERVICES.indexOf(r.sub) > -1) $('#f-topic').value = r.sub;

    setMenu(false);
    toggleLangMenu(false);
    if (modal.open) modal.close();

    if (changed && !initial) {
      var heading = $('.view.is-active [tabindex="-1"]');
      if (heading) setTimeout(function () { heading.focus({ preventScroll: true }); }, 60);
    }
    /* biztosíték: a dokumentum sosem gördül el */
    window.scrollTo(0, 0);
  }

  /* ================= Szolgáltatás-fülek ================= */
  var tabs = $$('.tab');
  function selectService(id, focus) {
    if (!id) return;
    tabs.forEach(function (tab) {
      var on = tab.dataset.service === id;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      if (on && focus) tab.focus();
    });
    $$('.panel').forEach(function (p) {
      var on = p.dataset.panel === id;
      p.hidden = !on;
      p.classList.toggle('is-active', on);
      if (on) p.scrollTop = 0;
    });
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () {
      selectService(tab.dataset.service);
      history.replaceState(null, '', '#services/' + tab.dataset.service);
    });
    tab.addEventListener('keydown', function (e) {
      var dir = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      var idx = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : dir ? (i + dir + tabs.length) % tabs.length : -1;
      if (idx < 0) return;
      e.preventDefault();
      selectService(tabs[idx].dataset.service, true);
      history.replaceState(null, '', '#services/' + tabs[idx].dataset.service);
    });
  });

  /* ================= Cikk-olvasó ================= */
  var modal = $('#article-modal');
  $$('[data-article]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.dataset.article;
      $('#modal-tag').textContent = t('news.' + id + '.tag');
      $('#modal-title').textContent = t('news.' + id + '.title');
      $('#modal-body').innerHTML = t('news.' + id + '.body');
      modal.showModal();
      modal.scrollTop = 0;
    });
  });
  $('[data-close]', modal).addEventListener('click', function () { modal.close(); });
  modal.addEventListener('click', function (e) { if (e.target === modal) modal.close(); });

  /* ================= Kapcsolat ================= */
  var mailLink = $('[data-contact="email"]');
  mailLink.textContent = CONTACT.email;
  mailLink.href = 'mailto:' + CONTACT.email;
  var phoneLink = $('[data-contact="phone"]');
  phoneLink.textContent = CONTACT.phone;
  phoneLink.href = 'tel:' + CONTACT.phone.replace(/[^\d+]/g, '');
  $('[data-contact="address"]').textContent = CONTACT.address;
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  var form = $('.contact-form');
  var note = $('.form-note', form);
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = new FormData(form);
    if (!form.checkValidity()) {
      note.textContent = t('form.invalid');
      note.classList.add('is-error');
      var bad = $(':invalid', form);
      if (bad) bad.focus();
      return;
    }
    var topicLabel = form.topic.options[form.topic.selectedIndex].text;
    var subject = 'ITC – ' + t('form.subject') + ': ' + topicLabel;
    var text = [
      t('form.name') + ': ' + d.get('name'),
      t('form.company') + ': ' + (d.get('company') || '-'),
      t('form.email') + ': ' + d.get('email'),
      t('form.topic') + ': ' + topicLabel,
      '',
      d.get('message')
    ].join('\n');
    window.location.href = 'mailto:' + CONTACT.email +
      '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text);
    note.classList.remove('is-error');
    note.textContent = t('form.success');
  });
  form.addEventListener('input', function () {
    if (note.classList.contains('is-error')) {
      note.classList.remove('is-error');
      note.textContent = t('form.note');
    }
  });

  /* ================= Billentyűk ================= */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!langMenu.hidden) { toggleLangMenu(false); langBtn.focus(); }
    if (body.classList.contains('menu-open')) { setMenu(false); menuBtn.focus(); }
  });

  /* Görgetés tiltása a dokumentum szintjén (belső panelek görgethetők maradnak) */
  window.addEventListener('scroll', function () {
    if (window.scrollY || window.scrollX) window.scrollTo(0, 0);
  }, { passive: true });

  /* ================= Indítás ================= */
  applyLang(detectLang());
  window.addEventListener('hashchange', route);
  /* Belső linkek (logó, menü, gombok): mindig a megfelelő nézetet nyitják meg,
     akkor is, ha a böngésző vagy a beágyazó keret nem váltana magától */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var target = a.getAttribute('href');
    e.preventDefault();
    if (location.hash !== target) {
      try { history.pushState(null, '', target); } catch (err) { location.hash = target; }
    }
    route();
  });
  window.addEventListener('popstate', route);
  route();
  requestAnimationFrame(function () { body.classList.add('is-ready'); });
})();
