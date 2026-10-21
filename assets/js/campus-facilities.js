/* ==========================================================================
   Campus Facilities — 50% Discount announcement + awarded-students roster
   Self-contained vanilla JS. No dependencies.
   --------------------------------------------------------------------------
   HOW TO CUSTOMIZE
   • Discount %    : CONFIG.discount (drives the hero number + "OFF" chips).
   • Rows shown    : CONFIG.pageSize (initial rows + increment per "Show more").
   • Facilities    : FACILITIES — labels used in chips, badges and filtering.
   • Students      : STUDENTS — replace freely. Shape per student:
                     { name, studentId, degree, photo: url|null,
                       facilities: subset of ["gym","pool","cricket"] }
                     photo: null renders an initials avatar.
   ========================================================================== */
(function () {
  'use strict';

  var CONFIG = {
    discount: 50,          // headline discount percentage
    pageSize: 8,           // rows before "Show more"
    countDuration: 1400,   // ms for the hero count-up
    staggerStep: 45        // ms between row reveals
  };

  /* Facility keys used in student.facilities arrays */
  var FACILITIES = {
    gym:     { label: 'Gym',           short: 'Gym'     },
    pool:    { label: 'Swimming Pool', short: 'Pool'    },
    cricket: { label: 'Cricket Club',  short: 'Cricket' }
  };
  var FACILITY_ORDER = ['gym', 'pool', 'cricket'];

  var STUDENTS = [
    { name: 'Ahmed Raza',     studentId: '70123456', degree: 'BS Software Engineering',    photo: null, facilities: ['gym', 'cricket'] },
    { name: 'Fatima Noor',    studentId: '70129871', degree: 'MBA',                        photo: null, facilities: ['pool'] },
    { name: 'Danish Ali',     studentId: '70118734', degree: 'BS Civil Engineering',       photo: null, facilities: ['cricket'] },
    { name: 'Hira Shahbaz',   studentId: '70135022', degree: 'BS Psychology',              photo: null, facilities: ['gym', 'pool'] },
    { name: 'Omar Farooq',    studentId: '70099215', degree: 'LLB (Hons)',                 photo: null, facilities: ['cricket', 'gym'] },
    { name: 'Iqra Mansoor',   studentId: '70144190', degree: 'Doctor of Pharmacy',         photo: null, facilities: ['pool', 'cricket'] },
    { name: 'Talha Mehmood',  studentId: '70107648', degree: 'BS Computer Science',        photo: null, facilities: ['gym'] },
    { name: 'Ayesha Khan',    studentId: '70130337', degree: 'BS Biotechnology',           photo: null, facilities: ['pool'] },
    { name: 'Waqas Ahmed',    studentId: '70086519', degree: 'MS Data Sciences',           photo: null, facilities: ['cricket'] },
    { name: 'Nimra Yousaf',   studentId: '70147702', degree: 'BS Media Studies',           photo: null, facilities: ['gym', 'pool', 'cricket'] },
    { name: 'Saad Rehman',    studentId: '70115883', degree: 'BS Electrical Engineering',  photo: null, facilities: ['cricket'] },
    { name: 'Kiran Ashfaq',   studentId: '70122416', degree: 'BBA',                        photo: null, facilities: ['gym'] },
    { name: 'Fahad Javed',    studentId: '70139154', degree: 'BS Physical Therapy',        photo: null, facilities: ['pool', 'gym'] },
    { name: 'Rabia Anwar',    studentId: '70094177', degree: 'MPhil Mathematics',          photo: null, facilities: ['pool'] }
  ];

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ------------------------------------------------------------ helpers */
  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function initials(name) {
    var parts = String(name || '').trim().split(/\s+/);
    return ((parts[0] || ' ')[0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
  }

  /* --------------------------------------------------------------- view */
  function ActiveCampus(root) {
    this.root = root;
    this.roster = root.querySelector('#uol-active-roster');
    this.listEl = root.querySelector('.uol-active-list');
    this.countEl = root.querySelector('.uol-active-count');
    this.emptyEl = root.querySelector('.uol-active-empty');
    this.moreBtn = root.querySelector('.uol-active-more');
    this.clearBtn = root.querySelector('.uol-active-clear');
    this.searchInput = root.querySelector('.uol-active-search-input');
    this.chips = Array.prototype.slice.call(root.querySelectorAll('.uol-active-chip'));
    this.tiles = Array.prototype.slice.call(root.querySelectorAll('.uol-active-tile'));
    this.countNum = root.querySelector('[data-count]');

    this.filter = 'all';
    this.query = '';
    this.shown = CONFIG.pageSize;
  }

  /* Students matching the current facility filter + search query */
  ActiveCampus.prototype.filtered = function () {
    var f = this.filter;
    var q = this.query.trim().toLowerCase();
    return STUDENTS.filter(function (s) {
      if (f !== 'all' && s.facilities.indexOf(f) === -1) return false;
      if (!q) return true;
      return s.name.toLowerCase().indexOf(q) !== -1 ||
             s.studentId.toLowerCase().indexOf(q) !== -1;
    });
  };

  ActiveCampus.prototype.rowHtml = function (s, rank) {
    var avatar =
      '<span class="uol-active-avatar" aria-hidden="true">' + esc(initials(s.name)) + '</span>' +
      (s.photo
        ? '<img class="uol-active-photo" src="' + esc(s.photo) + '" ' +
          'alt="Portrait of ' + esc(s.name) + '" loading="lazy" ' +
          'onerror="this.remove()">'
        : '');

    var badges = FACILITY_ORDER
      .filter(function (k) { return s.facilities.indexOf(k) !== -1; })
      .map(function (k) {
        return '<span class="uol-active-badge uol-active-badge--' + k + '">' +
               esc(FACILITIES[k].short) + '</span>';
      }).join('');

    return (
      '<li class="uol-active-row">' +
        '<span class="uol-active-row-rank" aria-hidden="true">' + rank + '</span>' +
        '<span class="uol-active-row-photo">' + avatar + '</span>' +
        '<span class="uol-active-row-main">' +
          '<span class="uol-active-row-name">' + esc(s.name) + '</span>' +
          '<span class="uol-active-row-degree">' + esc(s.degree) + '</span>' +
        '</span>' +
        '<span class="uol-active-row-id">' + esc(s.studentId) + '</span>' +
        '<span class="uol-active-row-badges">' +
          badges +
          '<span class="uol-active-off">' + CONFIG.discount + '% OFF</span>' +
        '</span>' +
      '</li>'
    );
  };

  /* Re-render the list. Rows at index >= animateFrom stagger in;
     earlier rows appear instantly (keeps "Show more" seamless). */
  ActiveCampus.prototype.render = function (animateFrom) {
    var self = this;
    var matches = this.filtered();
    var visible = matches.slice(0, this.shown);

    this.listEl.innerHTML = visible.map(function (s, i) {
      return self.rowHtml(s, i + 1);
    }).join('');

    if (!reducedMotion.matches) {
      Array.prototype.slice.call(this.listEl.children)
        .forEach(function (li, i) {
          if (i >= animateFrom) {
            li.classList.add('uol-active-row--anim');
            li.style.setProperty('--uol-act-d',
              ((i - animateFrom) * CONFIG.staggerStep) + 'ms');
          }
        });
    }

    /* Live counter — announced to screen readers */
    var label = this.filter === 'all' ? '' : ' — ' + FACILITIES[this.filter].label;
    this.countEl.textContent =
      'Showing ' + visible.length + ' of ' + matches.length + ' students' + label;

    /* Empty state + show-more visibility */
    var hasResults = matches.length > 0;
    this.emptyEl.hidden = hasResults;
    this.moreBtn.hidden = !hasResults || this.shown >= matches.length;
  };

  ActiveCampus.prototype.setFilter = function (filter, opts) {
    this.filter = filter;
    this.shown = CONFIG.pageSize;

    this.chips.forEach(function (chip) {
      var on = chip.getAttribute('data-filter') === filter;
      chip.classList.toggle('is-on', on);
      chip.setAttribute('aria-pressed', String(on));
    });
    this.tiles.forEach(function (tile) {
      var on = tile.getAttribute('data-facility') === filter;
      tile.classList.toggle('is-on', on);
      tile.setAttribute('aria-pressed', String(on));
    });

    this.render(0);

    if (opts && opts.scroll && this.roster) {
      this.roster.scrollIntoView({
        behavior: reducedMotion.matches ? 'auto' : 'smooth',
        block: 'start'
      });
    }
  };

  /* Hero "50%" count-up, triggered once when it scrolls into view */
  ActiveCampus.prototype.countUp = function () {
    var el = this.countNum;
    if (!el) return;
    var target = CONFIG.discount;

    function finish() { el.textContent = target; }

    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
      finish();
      return;
    }

    var done = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || done) return;
        done = true;
        io.disconnect();
        var start = null;
        function step(ts) {
          if (start === null) start = ts;
          var t = Math.min(1, (ts - start) / CONFIG.countDuration);
          el.textContent = Math.round((1 - Math.pow(1 - t, 3)) * target);
          if (t < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    io.observe(el);
  };

  ActiveCampus.prototype.bind = function () {
    var self = this;

    /* Filter chips */
    this.chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        self.setFilter(chip.getAttribute('data-filter'));
      });
    });

    /* Facility tiles — activate the matching filter + scroll to roster */
    this.tiles.forEach(function (tile) {
      tile.addEventListener('click', function () {
        self.setFilter(tile.getAttribute('data-facility'), { scroll: true });
      });
    });

    /* Search */
    this.searchInput.addEventListener('input', function () {
      self.query = self.searchInput.value;
      self.shown = CONFIG.pageSize;
      self.render(0);
    });

    /* Show more — reveal the next page, animating only the new rows */
    this.moreBtn.addEventListener('click', function () {
      var prev = self.shown;
      self.shown += CONFIG.pageSize;
      self.render(prev);
    });

    /* Empty-state reset */
    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', function () {
        self.searchInput.value = '';
        self.query = '';
        self.setFilter('all');
        self.searchInput.focus();
      });
    }
  };

  /* ------------------------------------------------------------- boot --- */
  function init() {
    var root = document.getElementById('uol-active-campus');
    if (!root) return;
    var widget = new ActiveCampus(root);
    widget.bind();
    widget.countUp();
    widget.render(0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
