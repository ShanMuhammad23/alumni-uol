/* ==========================================================================
   Scholarship Recipients — Spotlight Slider (UOL Alumni)
   Self-contained vanilla JS. No dependencies.
   --------------------------------------------------------------------------
   HOW TO CUSTOMIZE
   • Students      : SAMPLE_STUDENTS below is the fallback used when the API
                     is unreachable. Live data comes from CONFIG.endpoint.
   • Autoplay      : CONFIG.autoplayDelay (milliseconds).
   • Visible cards : controlled by CSS — edit --uol-spot-g1 / --uol-spot-g2
                     and the media queries in scholarship-spotlight.css.
   ========================================================================== */
(function () {
  'use strict';

  var CONFIG = {
    endpoint: 'https://portal-alumni.uol.edu.pk/api/external/scholarships',
    imageBase: 'https://portal-alumni.uol.edu.pk/images',
    autoplayDelay: 5000    // ms between auto-advances
  };

  /* -----------------------------------------------------------------------
     Sample data — replace freely. Shape per student:
     {
       photo: url|null,              // null renders an initials avatar
       name: string, id: string,
       degree: string,
       percent: 0-100,               // total discount; 100 => gold "full" card
       discounts: {                  // optional breakdown chips; null = hidden
         admission: 0-100|null,
         tuition:   0-100|null,
         achiever:  0-100|null
       }
     }
     ----------------------------------------------------------------------- */
  var SAMPLE_STUDENTS = [
    { photo: null, name: 'Areeba Amjad',   id: '70140795', degree: 'MPhil Public Health',            percent: 50,  discounts: { admission: 75,  tuition: 50,  achiever: null } },
    { photo: null, name: 'Bilal Hussain',  id: '70123681', degree: 'BS Computer Science',            percent: 100, discounts: { admission: 100, tuition: 100, achiever: null } },
    { photo: null, name: 'Sana Tariq',     id: '70095512', degree: 'Doctor of Pharmacy',             percent: 75,  discounts: { admission: 100, tuition: 50,  achiever: 25   } },
    { photo: null, name: 'Usman Khalid',   id: '70112034', degree: 'BS Electrical Engineering',      percent: 40,  discounts: { admission: 50,  tuition: 40,  achiever: null } },
    { photo: null, name: 'Mahnoor Fatima', id: '70138890', degree: 'BS Accounting & Finance',        percent: 65,  discounts: { admission: 80,  tuition: 50,  achiever: 15   } },
    { photo: null, name: 'Hamza Sheikh',   id: '70087145', degree: 'LLB (Hons)',                     percent: 30,  discounts: { admission: 30,  tuition: 30,  achiever: null } },
    { photo: null, name: 'Zainab Raza',    id: '70129907', degree: 'BS Media & Communication',       percent: 85,  discounts: { admission: 100, tuition: 75,  achiever: 10   } },
    { photo: null, name: 'Ali Nawaz',      id: '70076430', degree: 'MBA Executive',                  percent: 55,  discounts: { admission: 60,  tuition: 55,  achiever: null } }
  ];

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ------------------------------------------------------------ helpers */
  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function titleCase(str) {
    return String(str || '').toLowerCase().replace(/\b\w/g, function (c) {
      return c.toUpperCase();
    });
  }

  function initials(name) {
    var parts = String(name || '').trim().split(/\s+/);
    return ((parts[0] || ' ')[0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
  }

  function clampPct(n) {
    n = Math.round(Number(n) || 0);
    return Math.max(0, Math.min(100, n));
  }

  /* null stays null (chip hidden); numbers are clamped to 0-100 */
  function pctOrNull(n) {
    return n === null || n === undefined ? null : clampPct(n);
  }

  /* Map one API record -> {photo, name, id, degree, percent, discounts} */
  function normalizeItem(item) {
    var photo = item.imageUrl || item.image_url || item.image || '';
    if (photo && !/^https?:\/\//i.test(photo)) {
      photo = CONFIG.imageBase + '/' + photo.replace(/^\/+/, '');
    }
    var d = item.discounts || {};
    // Headline % prefers the new totalPercent; falls back to the legacy field
    var total = d.totalPercent != null ? d.totalPercent : item.appliedDiscountPercent;
    return {
      photo: photo || null,
      name: titleCase(item.name || 'UOL Scholar'),
      id: String(item.sapId || item.registrationNo || item.alumniId || ''),
      degree: item.degreeTitle || item.program || 'Degree Programme',
      percent: clampPct(total),
      discounts: {
        admission: pctOrNull(d.admissionFeePercent),
        tuition: pctOrNull(d.tuitionFeePercent),
        achiever: pctOrNull(d.highAchieverPercent)
      }
    };
  }

  function fetchStudents() {
    return fetch(CONFIG.endpoint, { headers: { 'Accept': 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error('Scholarships API ' + res.status);
        return res.json();
      })
      .then(function (payload) {
        var items =
          (payload && payload.data && payload.data.items) ||
          (payload && payload.items) ||
          (Array.isArray(payload) ? payload : []);
        var students = items
          .filter(function (it) { return it && (it.name || it.sapId); })
          .map(normalizeItem);
        if (!students.length) throw new Error('Scholarships API returned no items');
        return students;
      });
  }

  /* -------------------------------------------------------------- slider */
  function Spotlight(root) {
    this.root = root;
    this.viewport = root.querySelector('.uol-spot-viewport');
    this.track = root.querySelector('.uol-spot-track');
    this.dotsWrap = root.querySelector('.uol-spot-dots');
    this.live = root.querySelector('.uol-spot-live');
    this.statusEl = root.querySelector('.uol-spot-status');
    this.btnPrev = root.querySelector('.uol-spot-btn--prev');
    this.btnNext = root.querySelector('.uol-spot-btn--next');
    this.btnToggle = root.querySelector('.uol-spot-btn--toggle');

    this.students = [];
    this.slides = [];
    this.dots = [];
    this.active = 0;
    this.timer = null;
    this.userPaused = false;
    this.hoverHold = false;
    this.focusHold = false;
    this.touchHold = false;
    this.swipeX = null;
    this.raf = null;
  }

  Spotlight.prototype.build = function (students) {
    this.students = students;
    this.renderSlides();
    this.renderDots();
    this.bind();
    this.layout();
    this.updateAutoplay();
  };

  Spotlight.prototype.renderSlides = function () {
    var html = this.students.map(function (s, i) {
      var full = s.percent >= 100;

      // Discount breakdown chips — only fields the API actually returned
      var d = s.discounts || {};
      var chips = [
        ['Admission', d.admission],
        ['Tuition', d.tuition],
        ['High Achiever', d.achiever]
      ].filter(function (c) { return c[1] !== null && c[1] !== undefined; })
       .map(function (c) {
         return (
           '<span class="uol-spot-chip">' +
             '<span class="uol-spot-chip-val">' + esc(c[1]) + '%</span>' +
             '<span class="uol-spot-chip-key">' + esc(c[0]) + '</span>' +
           '</span>'
         );
       }).join('');
      var breakdown = chips
        ? '<div class="uol-spot-break" aria-label="Discount breakdown">' + chips + '</div>'
        : '';
      var avatar =
        '<span class="uol-spot-avatar" aria-hidden="true">' + esc(initials(s.name)) + '</span>' +
        (s.photo
          ? '<img class="uol-spot-photo" src="' + esc(s.photo) + '" ' +
            'alt="Portrait of ' + esc(s.name) + '" loading="lazy" ' +
            'onerror="this.remove()">'
          : '');

      return (
        '<li class="uol-spot-slide" data-index="' + i + '" data-pos="far-r" ' +
          'role="group" aria-roledescription="slide" aria-label="' + (i + 1) + ' of ' + this.students.length + '">' +
          '<div class="uol-spot-hanger">' +
            '<div class="uol-spot-strap" aria-hidden="true"><span class="uol-spot-clip"></span></div>' +
            '<article class="uol-spot-card' + (full ? ' is-full' : '') + '">' +
              '<span class="uol-spot-slot" aria-hidden="true"></span>' +
              '<div class="uol-spot-card-top">' +
                '<span class="uol-spot-card-brand">The University<br>of Lahore</span>' +
                '<span class="uol-spot-card-tag">' + (full ? 'Full Scholar' : 'Scholar ID') + '</span>' +
              '</div>' +
              '<div class="uol-spot-card-main">' +
                '<div class="uol-spot-photo-wrap">' +
                  avatar +
                  (full
                    ? '<span class="uol-spot-seal" role="img" aria-label="Full scholarship">&#9733;</span>'
                    : '') +
                '</div>' +
              '</div>' +
              '<h3 class="uol-spot-name">' + esc(s.name) + '</h3>' +
              '<p class="uol-spot-degree">' + esc(s.degree) + '</p>' +
              breakdown +
              '<p class="uol-spot-sapid"><small>Student ID</small>' + esc(s.id) + '</p>' +
              '<div class="uol-spot-barcode" aria-hidden="true"></div>' +
            '</article>' +
          '</div>' +
        '</li>'
      );
    }, this).join('');

    this.track.innerHTML = html;
    this.slides = Array.prototype.slice.call(this.track.children);
    if (this.statusEl) this.statusEl.remove();
  };

  Spotlight.prototype.renderDots = function () {
    this.dotsWrap.innerHTML = this.students.map(function (s, i) {
      return (
        '<button type="button" class="uol-spot-dot" data-index="' + i + '" ' +
        'aria-label="Go to ' + esc(s.name) + '"></button>'
      );
    }).join('');
    this.dots = Array.prototype.slice.call(this.dotsWrap.children);
  };

  /* Signed modular offset of slide i from the active slide */
  Spotlight.prototype.offsetOf = function (i) {
    var n = this.students.length;
    var raw = ((i - this.active) % n + n) % n;
    return raw > n / 2 ? raw - n : raw;   // in (-n/2, n/2]
  };

  Spotlight.prototype.layout = function () {
    var self = this;
    this.slides.forEach(function (slide, i) {
      var off = self.offsetOf(i);
      var pos =
        off === 0 ? '0' :
        off === 1 ? '1' : off === -1 ? '-1' :
        off === 2 ? '2' : off === -2 ? '-2' :
        off > 0 ? 'far-r' : 'far-l';

      slide.setAttribute('data-pos', pos);
      slide.setAttribute('aria-hidden', pos.indexOf('far') === 0 ? 'true' : 'false');
      slide.tabIndex = pos === '0' ? 0 : -1;
    });

    this.dots.forEach(function (dot, i) {
      dot.setAttribute('aria-current', i === self.active ? 'true' : 'false');
    });

    this.announce();
  };

  /* Announce the active slide to screen readers */
  Spotlight.prototype.announce = function () {
    if (!this.live || !this.students.length) return;
    var s = this.students[this.active];
    this.live.textContent =
      'Showing ' + s.name + ', ' + s.degree + ', ' + s.percent + '% scholarship' +
      ' (' + (this.active + 1) + ' of ' + this.students.length + ')';
  };

  /* Navigation ------------------------------------------------------------ */
  Spotlight.prototype.goTo = function (i) {
    var n = this.students.length;
    if (n < 2) return;
    this.active = ((i % n) + n) % n;
    this.layout();
    this.updateAutoplay();   // reset the autoplay clock after manual nav
  };

  Spotlight.prototype.next = function () { this.goTo(this.active + 1); };
  Spotlight.prototype.prev = function () { this.goTo(this.active - 1); };

  /* Autoplay -------------------------------------------------------------- */
  Spotlight.prototype.isPaused = function () {
    return this.userPaused || this.hoverHold || this.focusHold ||
           this.touchHold || reducedMotion.matches || document.hidden;
  };

  Spotlight.prototype.updateAutoplay = function () {
    var self = this;
    clearTimeout(this.timer);
    this.timer = null;
    if (this.isPaused() || this.students.length < 2) return;
    this.timer = setTimeout(function () {
      self.next();
    }, CONFIG.autoplayDelay);
  };

  Spotlight.prototype.setUserPaused = function (paused) {
    this.userPaused = paused;
    if (this.btnToggle) {
      this.btnToggle.setAttribute('aria-pressed', String(paused));
      this.btnToggle.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow');
      var play = this.btnToggle.querySelector('.uol-spot-ic-play');
      var pause = this.btnToggle.querySelector('.uol-spot-ic-pause');
      if (play) play.hidden = !paused;
      if (pause) pause.hidden = paused;
    }
    this.updateAutoplay();
  };

  /* Events ---------------------------------------------------------------- */
  Spotlight.prototype.bind = function () {
    var self = this;
    var single = this.students.length < 2;

    if (this.btnPrev) this.btnPrev.addEventListener('click', function () { self.prev(); });
    if (this.btnNext) this.btnNext.addEventListener('click', function () { self.next(); });
    if (this.btnToggle) {
      this.btnToggle.addEventListener('click', function () {
        self.setUserPaused(!self.userPaused);
      });
    }

    this.dotsWrap.addEventListener('click', function (e) {
      var dot = e.target.closest('.uol-spot-dot');
      if (dot) self.goTo(Number(dot.getAttribute('data-index')));
    });

    /* Click a side card to activate it; Enter/Space works too */
    this.track.addEventListener('click', function (e) {
      var slide = e.target.closest('.uol-spot-slide');
      if (!slide || slide.getAttribute('data-pos') === '0') return;
      if (Date.now() - (self.suppressClick || 0) < 350) return;
      self.goTo(Number(slide.getAttribute('data-index')));
    });

    /* Arrow-key navigation while focus is inside the region */
    this.root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); self.next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); self.prev(); }
      else if (e.key === 'Home') { e.preventDefault(); self.goTo(0); }
      else if (e.key === 'End') { e.preventDefault(); self.goTo(self.students.length - 1); }
      else if ((e.key === 'Enter' || e.key === ' ') &&
               e.target.classList && e.target.classList.contains('uol-spot-slide')) {
        /* only reachable on side slides if they ever get tabindex */
        e.preventDefault();
      }
    });

    /* Pause on hover / focus / touch */
    this.root.addEventListener('pointerenter', function () {
      self.hoverHold = true; self.updateAutoplay();
    });
    this.root.addEventListener('pointerleave', function () {
      self.hoverHold = false; self.updateAutoplay();
    });
    this.root.addEventListener('focusin', function () {
      self.focusHold = true; self.updateAutoplay();
    });
    this.root.addEventListener('focusout', function (e) {
      if (!self.root.contains(e.relatedTarget)) {
        self.focusHold = false; self.updateAutoplay();
      }
    });

    /* Swipe (pointer events cover mouse + touch) */
    this.viewport.addEventListener('pointerdown', function (e) {
      self.swipeX = e.clientX;
      self.touchHold = true; self.updateAutoplay();
    });
    window.addEventListener('pointerup', function (e) {
      if (self.swipeX === null) return;
      var dx = e.clientX - self.swipeX;
      self.swipeX = null;
      self.touchHold = false;
      if (Math.abs(dx) > 40) {
        self.suppressClick = Date.now();      // swallow the click that follows a swipe
        dx < 0 ? self.next() : self.prev();
      } else self.updateAutoplay();
    });
    this.viewport.addEventListener('pointercancel', function () {
      self.swipeX = null; self.touchHold = false; self.updateAutoplay();
    });

    /* Pause when the tab is hidden */
    document.addEventListener('visibilitychange', function () {
      self.updateAutoplay();
    });

    /* Honour a runtime change of the reduced-motion preference */
    if (reducedMotion.addEventListener) {
      reducedMotion.addEventListener('change', function () { self.updateAutoplay(); });
    }

    if (single) {
      [this.btnPrev, this.btnNext, this.btnToggle].forEach(function (b) {
        if (b) { b.disabled = true; b.setAttribute('aria-hidden', 'true'); b.style.display = 'none'; }
      });
    }
  };

  /* ------------------------------------------------------------- boot --- */
  function init() {
    var root = document.getElementById('uol-scholarship-spotlight');
    if (!root) return;
    var slider = new Spotlight(root);

    fetchStudents()
      .catch(function () { return SAMPLE_STUDENTS; })   // silent fallback
      .then(function (students) { slider.build(students); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
