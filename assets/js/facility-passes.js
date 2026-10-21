/* ==========================================================================
   50% Off Campus Facilities — announcement panel + facility pass strip
   Self-contained vanilla JS. No dependencies.
   --------------------------------------------------------------------------
   CONFIG (edit these):
   • API_URL        : memberships endpoint. Leave "" to use MOCK_DATA offline.
   • MAX_ITEMS      : cap on slider tiles (latest N).
   • AUTOPLAY_MS    : ms between auto-advances.
   • NEW_BADGE_DAYS : items awarded within this many days get a "New" ribbon.
   • VIEW_ALL_URL   : link used by the "View all" tile.
   ========================================================================== */
(function () {
  'use strict';

  var API_URL = 'https://portal-alumni.uol.edu.pk/api/external/memberships';
  var MAX_ITEMS = 12;
  var AUTOPLAY_MS = 4000;
  var NEW_BADGE_DAYS = 7;
  var COUNT_MS = 1400;      // hero count-up duration
  var VIEW_ALL_URL = '#';

  /* Facility keys -> label + icon (static SVG, safe to parse as markup) */
  var FACILITIES = {
    gym: {
      label: 'Gym',
      icon: '<svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true">' +
            '<rect x="3" y="18" width="7" height="12" rx="2"/>' +
            '<rect x="12" y="12" width="7" height="24" rx="2"/>' +
            '<rect x="19" y="21" width="10" height="6" rx="3"/>' +
            '<rect x="29" y="12" width="7" height="24" rx="2"/>' +
            '<rect x="38" y="18" width="7" height="12" rx="2"/></svg>'
    },
    pool: {
      label: 'Pool',
      icon: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" ' +
            'stroke-width="3" stroke-linecap="round" aria-hidden="true">' +
            '<circle cx="13" cy="13" r="4.5" fill="currentColor" stroke="none"/>' +
            '<path d="M4 24c4-3.5 8-3.5 12 0s8 3.5 12 0 8-3.5 12 0"/>' +
            '<path d="M4 34c4-3.5 8-3.5 12 0s8 3.5 12 0 8-3.5 12 0"/></svg>'
    },
    cricket: {
      label: 'Cricket Club',
      icon: '<svg viewBox="0 0 48 48" aria-hidden="true">' +
            '<circle cx="24" cy="24" r="17" fill="currentColor"/>' +
            '<path d="M17.5 10.5c5.5 8 5.5 19 0 27" stroke="#fff" stroke-width="2.5" ' +
            'fill="none" stroke-linecap="round" stroke-dasharray="4 4"/>' +
            '<path d="M30.5 10.5c-5.5 8-5.5 19 0 27" stroke="#fff" stroke-width="2.5" ' +
            'fill="none" stroke-linecap="round" stroke-dasharray="4 4"/></svg>'
    },
    /* Neutral fallback for any unknown facilityType from the API */
    other: {
      label: 'Facility',
      icon: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" ' +
            'stroke-width="3" stroke-linecap="round" stroke-linejoin="round" ' +
            'aria-hidden="true"><path d="M10 10h28v28H10z"/>' +
            '<path d="M10 10l14 14 14-14"/></svg>'
    }
  };

  /* Sample data in the API's item shape — used when API_URL is empty */
  var MOCK_DATA = [
    { name: 'ALI HAMZA ABID',   sapId: '70131166', facilityType: 'gym',     imageUrl: null, awardedAt: 'Mon Oct 19 2026 10:31:11 GMT+0500' },
    { name: 'SARA IMRAN',       sapId: '70140218', facilityType: 'pool',    imageUrl: null, awardedAt: 'Sat Oct 17 2026 09:12:40 GMT+0500' },
    { name: 'HASSAN RIAZ',      sapId: '70125590', facilityType: 'cricket', imageUrl: null, awardedAt: 'Thu Oct 15 2026 14:03:22 GMT+0500' },
    { name: 'MAHNOOR SALEEM',   sapId: '70112347', facilityType: 'gym',     imageUrl: null, awardedAt: 'Tue Oct 13 2026 11:45:09 GMT+0500' },
    { name: 'USMAN TARIQ',      sapId: '70098714', facilityType: 'pool',    imageUrl: null, awardedAt: 'Sun Oct 11 2026 16:20:55 GMT+0500' },
    { name: 'ZAINAB ARIF',      sapId: '70136682', facilityType: 'cricket', imageUrl: null, awardedAt: 'Fri Oct 09 2026 10:02:31 GMT+0500' },
    { name: 'BILAL NADEEM',     sapId: '70104829', facilityType: 'badminton', imageUrl: null, awardedAt: 'Wed Oct 07 2026 13:37:48 GMT+0500' },
    { name: 'FATIMA ASLAM',     sapId: '70121930', facilityType: 'gym',     imageUrl: null, awardedAt: 'Mon Oct 05 2026 08:51:17 GMT+0500' },
    { name: 'HAMZA YOUNAS',     sapId: '70087355', facilityType: 'pool',    imageUrl: null, awardedAt: 'Sat Oct 03 2026 15:44:02 GMT+0500' },
    { name: 'KIRAN WAQAR',      sapId: '70143771', facilityType: 'cricket', imageUrl: null, awardedAt: 'Thu Oct 01 2026 12:10:26 GMT+0500' }
  ];

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ------------------------------------------------------------ helpers */
  function titleCase(str) {
    return String(str || '').toLowerCase().replace(/\b\w/g, function (c) {
      return c.toUpperCase();
    });
  }

  function initials(name) {
    var parts = String(name || '').trim().split(/\s+/);
    return ((parts[0] || ' ')[0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
  }

  /* awardedAt is a JS Date string that may carry "(Pakistan Standard Time)";
     parse safely, return null when unparseable */
  function parseDate(raw) {
    if (!raw) return null;
    var d = new Date(raw);
    if (isNaN(d.getTime())) d = new Date(String(raw).replace(/\s*\(.*\)\s*$/, ''));
    return isNaN(d.getTime()) ? null : d;
  }

  function svgNode(markup) {
    var span = document.createElement('span');
    span.className = 'uol-pass-ic';
    span.innerHTML = markup;          // static icon strings only — never API data
    return span.firstChild;
  }

  /* ----------------------------------------------------------- component */
  function PassStrip(root) {
    this.root = root;
    this.slider = root.querySelector('.uol-pass-slider');
    this.viewport = root.querySelector('.uol-pass-viewport');
    this.track = root.querySelector('.uol-pass-track');
    this.progress = root.querySelector('.uol-pass-progress-fill');
    this.live = root.querySelector('.uol-pass-live');
    this.btnPrev = root.querySelector('.uol-pass-btn--prev');
    this.btnNext = root.querySelector('.uol-pass-btn--next');
    this.btnToggle = root.querySelector('.uol-pass-btn--toggle');
    this.chips = Array.prototype.slice.call(root.querySelectorAll('.uol-pass-chip'));
    this.countNum = root.querySelector('[data-count]');

    this.items = [];
    this.filter = 'all';
    this.timer = null;
    this.userPaused = false;
    this.hoverHold = false;
    this.focusHold = false;
    this.touchHold = false;
  }

  /* Map an API record -> {name, id, facility, facilityLabel, photo, awarded} */
  PassStrip.prototype.normalize = function (item) {
    var rawFac = String(item.facilityType || '').toLowerCase();
    var known = FACILITIES[rawFac] ? rawFac : 'other';
    var photo = /^https?:\/\//i.test(item.imageUrl || '') ? item.imageUrl : null;
    return {
      name: titleCase(item.name || 'UOL Student'),
      id: String(item.sapId || item.registrationNo || item.alumniId || ''),
      facility: known,
      facilityLabel: known === 'other'
        ? titleCase(item.facilityType || 'Facility')
        : FACILITIES[known].label,
      photo: photo,
      awarded: parseDate(item.awardedAt)
    };
  };

  PassStrip.prototype.isNew = function (item) {
    if (!item.awarded) return false;
    var diff = Date.now() - item.awarded.getTime();
    return diff >= -86400000 && diff <= NEW_BADGE_DAYS * 86400000;
  };

  PassStrip.prototype.filtered = function () {
    var f = this.filter;
    return f === 'all'
      ? this.items
      : this.items.filter(function (it) { return it.facility === f; });
  };

  /* ----------------------------------------------------------- tile DOM */
  PassStrip.prototype.buildTile = function (item) {
    var li = document.createElement('li');
    li.className = 'uol-pass-tile uol-pass-tile--' + item.facility;

    var photoWrap = document.createElement('div');
    photoWrap.className = 'uol-pass-tile-photo';

    /* Initials avatar sits under the image as the automatic fallback */
    var avatar = document.createElement('span');
    avatar.className = 'uol-pass-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = initials(item.name);
    photoWrap.appendChild(avatar);

    if (item.photo) {
      var img = document.createElement('img');
      img.className = 'uol-pass-photo';
      img.src = item.photo;
      img.alt = 'Photo of ' + item.name;
      img.width = 400;
      img.height = 400;
      img.loading = 'lazy';
      img.onerror = function () { img.remove(); };
      photoWrap.appendChild(img);
    }

    /* Circular facility badge overlapping the photo corner */
    var badge = document.createElement('span');
    badge.className = 'uol-pass-tile-badge';
    badge.setAttribute('title', item.facilityLabel);
    badge.appendChild(svgNode(FACILITIES[item.facility].icon));
    photoWrap.appendChild(badge);

    if (this.isNew(item)) {
      var ribbon = document.createElement('span');
      ribbon.className = 'uol-pass-tile-new';
      ribbon.textContent = 'New';
      photoWrap.appendChild(ribbon);
    }

    var info = document.createElement('div');
    info.className = 'uol-pass-tile-info';

    var name = document.createElement('p');
    name.className = 'uol-pass-tile-name';
    name.textContent = item.name;

    var id = document.createElement('p');
    id.className = 'uol-pass-tile-id';
    id.textContent = item.id || '—';

    var pill = document.createElement('span');
    pill.className = 'uol-pass-tile-pill';
    pill.textContent = item.facilityLabel;

    info.appendChild(name);
    info.appendChild(id);
    info.appendChild(pill);
    li.appendChild(photoWrap);
    li.appendChild(info);
    return li;
  };

  /* "View all" tile appended after the last recipient */
  PassStrip.prototype.buildMoreTile = function () {
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.className = 'uol-pass-tile uol-pass-tile--more';
    a.href = VIEW_ALL_URL;
    var t = document.createElement('span');
    t.className = 'uol-pass-tile-more-label';
    t.textContent = 'View all';
    var arrow = document.createElement('span');
    arrow.className = 'uol-pass-tile-more-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '→';
    a.appendChild(t);
    a.appendChild(arrow);
    li.appendChild(a);
    return li;
  };

  /* ----------------------------------------------------------- states --- */
  PassStrip.prototype.renderSkeletons = function () {
    this.track.textContent = '';
    for (var i = 0; i < 4; i++) {
      var li = document.createElement('li');
      li.className = 'uol-pass-tile uol-pass-tile--skel';
      li.setAttribute('aria-hidden', 'true');
      li.innerHTML =
        '<div class="uol-pass-skel-photo"></div>' +
        '<div class="uol-pass-skel-line w70"></div>' +
        '<div class="uol-pass-skel-line w40"></div>';
      this.track.appendChild(li);
    }
  };

  PassStrip.prototype.renderError = function () {
    var self = this;
    this.track.textContent = '';
    var li = document.createElement('li');
    li.className = 'uol-pass-state';
    var msg = document.createElement('p');
    msg.textContent = 'Couldn’t load the recipients right now.';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'uol-pass-retry';
    btn.textContent = 'Retry';
    btn.addEventListener('click', function () { self.load(); });
    li.appendChild(msg);
    li.appendChild(btn);
    this.track.appendChild(li);
    this.setControlsDisabled(true);
    this.updateProgress();
  };

  PassStrip.prototype.render = function () {
    var self = this;
    var items = this.filtered();

    /* Fade the strip, swap content, fade back in */
    this.track.classList.add('is-fading');
    window.setTimeout(function () {
      self.track.textContent = '';
      items.forEach(function (item) {
        self.track.appendChild(self.buildTile(item));
      });
      if (items.length) self.track.appendChild(self.buildMoreTile());
      self.viewport.scrollLeft = 0;
      self.track.classList.remove('is-fading');
      self.updateProgress();
      self.setControlsDisabled(items.length < 2);
      self.announce();
    }, reducedMotion.matches ? 0 : 260);
  };

  PassStrip.prototype.announce = function () {
    if (!this.live) return;
    var n = this.filtered().length;
    var label = this.filter === 'all' ? '' : ' — ' + FACILITIES[this.filter].label;
    this.live.textContent = 'Showing ' + n + ' recipients' + label;
  };

  /* ---------------------------------------------------------- controls -- */
  PassStrip.prototype.setControlsDisabled = function (off) {
    [this.btnPrev, this.btnNext].forEach(function (b) {
      if (b) b.disabled = !!off;
    });
  };

  /* Scroll step = tile width + gap, measured live (works at all sizes) */
  PassStrip.prototype.step = function () {
    var tile = this.track.querySelector('.uol-pass-tile');
    if (!tile) return 200;
    var gap = parseFloat(getComputedStyle(this.track).gap) || 0;
    return tile.getBoundingClientRect().width + gap;
  };

  PassStrip.prototype.scrollByStep = function (dir) {
    this.viewport.scrollBy({
      left: dir * this.step(),
      behavior: reducedMotion.matches ? 'auto' : 'smooth'
    });
  };

  /* Advance one tile, or loop back to the start at the end */
  PassStrip.prototype.advance = function () {
    var max = this.viewport.scrollWidth - this.viewport.clientWidth;
    if (max <= 4) return;
    if (this.viewport.scrollLeft >= max - 8) {
      this.viewport.scrollTo({
        left: 0,
        behavior: reducedMotion.matches ? 'auto' : 'smooth'
      });
    } else {
      this.scrollByStep(1);
    }
  };

  PassStrip.prototype.updateProgress = function () {
    if (!this.progress) return;
    var max = this.viewport.scrollWidth - this.viewport.clientWidth;
    var p = max > 0 ? Math.min(1, this.viewport.scrollLeft / max) : 0;
    this.progress.style.transform = 'scaleX(' + (p * 0.98 + 0.02) + ')';
  };

  /* ------------------------------------------------------------ autoplay */
  PassStrip.prototype.isPaused = function () {
    return this.userPaused || this.hoverHold || this.focusHold ||
           this.touchHold || reducedMotion.matches || document.hidden;
  };

  PassStrip.prototype.updateAutoplay = function () {
    var self = this;
    clearTimeout(this.timer);
    this.timer = null;
    if (this.isPaused() || this.items.length < 2) return;
    this.timer = setTimeout(function () {
      self.advance();
      self.updateAutoplay();
    }, AUTOPLAY_MS);
  };

  PassStrip.prototype.setUserPaused = function (paused) {
    this.userPaused = paused;
    if (this.btnToggle) {
      this.btnToggle.setAttribute('aria-pressed', String(paused));
      this.btnToggle.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow');
      var play = this.btnToggle.querySelector('.uol-pass-ic-play');
      var pause = this.btnToggle.querySelector('.uol-pass-ic-pause');
      if (play) play.hidden = !paused;
      if (pause) pause.hidden = paused;
    }
    this.updateAutoplay();
  };

  /* Hero "50" count-up once it scrolls into view */
  PassStrip.prototype.countUp = function () {
    var el = this.countNum;
    if (!el) return;
    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
      el.textContent = '50';
      return;
    }
    var done = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || done) return;
        done = true;
        io.disconnect();
        var start = null;
        function stepFn(ts) {
          if (start === null) start = ts;
          var t = Math.min(1, (ts - start) / COUNT_MS);
          el.textContent = Math.round((1 - Math.pow(1 - t, 3)) * 50);
          if (t < 1) requestAnimationFrame(stepFn);
        }
        requestAnimationFrame(stepFn);
      });
    }, { threshold: 0.4 });
    io.observe(el);
  };

  /* ------------------------------------------------------------- events -- */
  PassStrip.prototype.bind = function () {
    var self = this;

    /* Filter chips — click a facility chip to filter, click again to clear */
    this.chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var f = chip.getAttribute('data-filter');
        self.setFilter(f === 'all' ? 'all' : (self.filter === f ? 'all' : f));
      });
    });

    if (this.btnPrev) this.btnPrev.addEventListener('click', function () {
      self.scrollByStep(-1); self.updateAutoplay();
    });
    if (this.btnNext) this.btnNext.addEventListener('click', function () {
      self.scrollByStep(1); self.updateAutoplay();
    });
    if (this.btnToggle) this.btnToggle.addEventListener('click', function () {
      self.setUserPaused(!self.userPaused);
    });

    /* Progress bar follows the scroll position */
    this.viewport.addEventListener('scroll', function () {
      self.updateProgress();
    }, { passive: true });

    window.addEventListener('resize', function () {
      self.updateProgress();
    });

    /* Keyboard arrows while focus is inside the slider */
    this.slider.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); self.scrollByStep(1); self.updateAutoplay(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); self.scrollByStep(-1); self.updateAutoplay(); }
    });

    /* Pause on hover / focus / touch-drag */
    this.slider.addEventListener('pointerenter', function () {
      self.hoverHold = true; self.updateAutoplay();
    });
    this.slider.addEventListener('pointerleave', function () {
      self.hoverHold = false; self.updateAutoplay();
    });
    this.slider.addEventListener('focusin', function () {
      self.focusHold = true; self.updateAutoplay();
    });
    this.slider.addEventListener('focusout', function (e) {
      if (!self.slider.contains(e.relatedTarget)) {
        self.focusHold = false; self.updateAutoplay();
      }
    });
    this.viewport.addEventListener('pointerdown', function () {
      self.touchHold = true; self.updateAutoplay();
    });
    window.addEventListener('pointerup', function () {
      if (self.touchHold) { self.touchHold = false; self.updateAutoplay(); }
    });
    document.addEventListener('visibilitychange', function () {
      self.updateAutoplay();
    });
    if (reducedMotion.addEventListener) {
      reducedMotion.addEventListener('change', function () { self.updateAutoplay(); });
    }
  };

  PassStrip.prototype.setFilter = function (filter) {
    this.filter = filter;
    this.chips.forEach(function (chip) {
      var on = chip.getAttribute('data-filter') === filter;
      chip.classList.toggle('is-on', on);
      chip.setAttribute('aria-pressed', String(on));
    });
    this.render();
    this.updateAutoplay();
  };

  /* --------------------------------------------------------------- data --- */
  PassStrip.prototype.load = function () {
    var self = this;
    this.renderSkeletons();
    this.setControlsDisabled(true);

    var done = function (rawItems) {
      self.items = (rawItems || [])
        .filter(function (it) { return it && (it.name || it.sapId); })
        .map(function (it) { return self.normalize(it); })
        .sort(function (a, b) {
          return (b.awarded ? b.awarded.getTime() : 0) -
                 (a.awarded ? a.awarded.getTime() : 0);
        })
        .slice(0, MAX_ITEMS);

      if (!self.items.length) {
        /* Zero items: hide only the slider, keep the announcement panel */
        self.slider.hidden = true;
        return;
      }
      self.render();
      self.updateAutoplay();
    };

    if (!API_URL) {
      done(MOCK_DATA);
      return;
    }

    fetch(API_URL, { headers: { 'Accept': 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error('Memberships API ' + res.status);
        return res.json();
      })
      .then(function (payload) {
        var items =
          (payload && payload.data && payload.data.items) ||
          (payload && payload.items) ||
          (Array.isArray(payload) ? payload : []);
        done(items);
      })
      .catch(function () {
        self.renderError();
      });
  };

  /* -------------------------------------------------------------- boot --- */
  function init() {
    var root = document.getElementById('uol-pass-section');
    if (!root) return;
    var widget = new PassStrip(root);
    widget.bind();
    widget.countUp();
    widget.load();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
