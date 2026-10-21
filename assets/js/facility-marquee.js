/* ==========================================================================
   50% Discount on Campus Facilities — twin vertical marquee columns
   Gym column scrolls UP, Pool column scrolls DOWN. Seamless infinite loop
   via duplicated content + CSS keyframes (translateY 0 -> -50% / -50% -> 0).
   Self-contained vanilla JS. No dependencies.
   --------------------------------------------------------------------------
   CONFIG (edit these):
   • API_URL                 : memberships endpoint. "" => MOCK_DATA preview.
   • MAX_ITEMS_PER_FACILITY  : cap per column (newest first).
   • SPEED_PX_PER_SEC        : marquee speed in pixels/second.
   ========================================================================== */
(function () {
  'use strict';

  var API_URL = 'https://portal-alumni.uol.edu.pk/api/external/memberships';
  var MAX_ITEMS_PER_FACILITY = 15;
  var SPEED_PX_PER_SEC = 30;

  /* One entry per facility column. To add a facility later: add a key here
     and a matching .uol-fac-col[data-facility="key"] column in the markup. */
  var FACILITY_CONFIG = {
    gym:  { label: 'Gym',  dir: 'up'   },
    pool: { label: 'Pool', dir: 'down' }
  };

  /* Sample data in the API's item shape — used when API_URL is empty */
  var MOCK_DATA = [
    { name: 'ALI HAMZA ABID',   sapId: '70131166', facilityType: 'gym',     imageUrl: null, awardedAt: 'Mon Oct 19 2026 10:31:11 GMT+0500' },
    { name: 'SARA IMRAN',       sapId: '70140218', facilityType: 'pool',    imageUrl: null, awardedAt: 'Sat Oct 17 2026 09:12:40 GMT+0500' },
    { name: 'HASSAN RIAZ',      sapId: '70125590', facilityType: 'gym',     imageUrl: null, awardedAt: 'Thu Oct 15 2026 14:03:22 GMT+0500' },
    { name: 'MAHNOOR SALEEM',   sapId: '70112347', facilityType: 'pool',    imageUrl: null, awardedAt: 'Tue Oct 13 2026 11:45:09 GMT+0500' },
    { name: 'USMAN TARIQ',      sapId: '70098714', facilityType: 'gym',     imageUrl: null, awardedAt: 'Sun Oct 11 2026 16:20:55 GMT+0500' },
    { name: 'ZAINAB ARIF',      sapId: '70136682', facilityType: 'pool',    imageUrl: null, awardedAt: 'Fri Oct 09 2026 10:02:31 GMT+0500' },
    { name: 'BILAL NADEEM',     sapId: '70104829', facilityType: 'gym',     imageUrl: null, awardedAt: 'Wed Oct 07 2026 13:37:48 GMT+0500' },
    { name: 'FATIMA ASLAM',     sapId: '70121930', facilityType: 'pool',    imageUrl: null, awardedAt: 'Mon Oct 05 2026 08:51:17 GMT+0500' },
    { name: 'HAMZA YOUNAS',     sapId: '70087355', facilityType: 'gym',     imageUrl: null, awardedAt: 'Sat Oct 03 2026 15:44:02 GMT+0500' },
    { name: 'KIRAN WAQAR',      sapId: '70143771', facilityType: 'pool',    imageUrl: null, awardedAt: 'Thu Oct 01 2026 12:10:26 GMT+0500' },
    { name: 'DANIYAL AKBAR',    sapId: '70109644', facilityType: 'gym',     imageUrl: null, awardedAt: 'Tue Sep 29 2026 17:26:50 GMT+0500' },
    { name: 'RIMSHA TANVEER',   sapId: '70132809', facilityType: 'pool',    imageUrl: null, awardedAt: 'Sun Sep 27 2026 09:58:14 GMT+0500' }
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

  /* ------------------------------------------------------ column slider */
  function Column(colEl) {
    this.el = colEl;
    this.viewport = colEl.querySelector('.uol-fac-viewport');
    this.track = colEl.querySelector('.uol-fac-track');
    this.toggle = colEl.querySelector('.uol-fac-toggle');
    this.dir = colEl.getAttribute('data-dir') === 'down' ? 'down' : 'up';
    this.items = [];
    this.userPaused = false;
    this.hoverHold = false;
    this.focusHold = false;
    this.touchHold = false;
  }

  /* One compact card: photo + name + SAP ID (all textContent, no innerHTML) */
  Column.prototype.buildCard = function (item) {
    var li = document.createElement('li');
    li.className = 'uol-fac-card';

    var photoWrap = document.createElement('span');
    photoWrap.className = 'uol-fac-card-photo';

    var avatar = document.createElement('span');
    avatar.className = 'uol-fac-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = initials(item.name);
    photoWrap.appendChild(avatar);

    if (item.photo) {
      var img = document.createElement('img');
      img.className = 'uol-fac-photo';
      img.src = item.photo;
      img.alt = 'Photo of ' + item.name;
      img.width = 112;
      img.height = 112;
      img.loading = 'lazy';
      img.onerror = function () { img.remove(); };
      photoWrap.appendChild(img);
    }

    var info = document.createElement('span');
    info.className = 'uol-fac-card-info';

    var name = document.createElement('span');
    name.className = 'uol-fac-card-name';
    name.textContent = item.name;

    var id = document.createElement('span');
    id.className = 'uol-fac-card-id';
    id.textContent = item.id || '—';

    info.appendChild(name);
    info.appendChild(id);
    li.appendChild(photoWrap);
    li.appendChild(info);
    return li;
  };

  Column.prototype.renderSkeletons = function () {
    this.track.textContent = '';
    for (var i = 0; i < 5; i++) {
      var li = document.createElement('li');
      li.className = 'uol-fac-card uol-fac-card--skel';
      li.setAttribute('aria-hidden', 'true');
      li.innerHTML =
        '<span class="uol-fac-skel-dot"></span>' +
        '<span class="uol-fac-skel-lines"><i></i><i></i></span>';
      this.track.appendChild(li);
    }
  };

  Column.prototype.renderMessage = function (text, withRetry, reload) {
    this.track.textContent = '';
    var li = document.createElement('li');
    li.className = 'uol-fac-note';
    var p = document.createElement('p');
    p.textContent = text;
    li.appendChild(p);
    if (withRetry) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'uol-fac-retry';
      btn.textContent = 'Retry';
      btn.addEventListener('click', reload);
      li.appendChild(btn);
    }
    this.track.appendChild(li);
    this.stopAnimation();
  };

  /* Build the looping track: repeat the card set enough times to fill the
     viewport, then duplicate once more so translateY(-50%) loops seamlessly */
  Column.prototype.rebuild = function () {
    var self = this;
    this.track.textContent = '';

    if (!this.items.length) {
      this.renderMessage('No awardees yet — check back soon.', false);
      return;
    }

    /* First copy — the only one exposed to screen readers */
    var first = document.createDocumentFragment();
    this.items.forEach(function (item) {
      first.appendChild(self.buildCard(item));
    });
    this.track.appendChild(first);

    /* Measure the set, then clone it enough times for a seamless loop */
    var card = this.track.querySelector('.uol-fac-card');
    if (!card) return;
    var style = getComputedStyle(card);
    var cardH = card.getBoundingClientRect().height +
                parseFloat(style.marginBottom || 0);
    var setH = cardH * this.items.length;
    var viewportH = this.viewport.clientHeight || 360;

    /* repeat: whole copies needed so one "half" fills the viewport */
    var repeat = Math.max(1, Math.ceil(viewportH / setH));
    var totalCopies = repeat * 2;   // two identical halves for the -50% loop

    for (var c = 1; c < totalCopies; c++) {
      var frag = document.createDocumentFragment();
      this.items.forEach(function (item) {
        var dup = self.buildCard(item);
        dup.setAttribute('aria-hidden', 'true');
        frag.appendChild(dup);
      });
      this.track.appendChild(frag);
    }

    /* Loop distance = half the track height; duration keeps speed constant */
    var distance = setH * repeat;
    var duration = distance / SPEED_PX_PER_SEC;
    this.track.style.animationDuration = duration.toFixed(2) + 's';
    this.track.classList.remove('uol-fac-anim-up', 'uol-fac-anim-down');
    this.track.classList.add(this.dir === 'down' ? 'uol-fac-anim-down' : 'uol-fac-anim-up');
    this.updateAnimState();
  };

  Column.prototype.isPaused = function () {
    return this.userPaused || this.hoverHold || this.focusHold || this.touchHold;
  };

  Column.prototype.updateAnimState = function () {
    this.track.classList.toggle('is-paused', this.isPaused());
  };

  Column.prototype.stopAnimation = function () {
    this.track.classList.remove('uol-fac-anim-up', 'uol-fac-anim-down');
  };

  Column.prototype.setUserPaused = function (paused) {
    this.userPaused = paused;
    if (this.toggle) {
      this.toggle.setAttribute('aria-pressed', String(paused));
      this.toggle.setAttribute('aria-label', paused ? 'Play slider' : 'Pause slider');
      var play = this.toggle.querySelector('.uol-fac-ic-play');
      var pause = this.toggle.querySelector('.uol-fac-ic-pause');
      if (play) play.hidden = !paused;
      if (pause) pause.hidden = paused;
    }
    this.updateAnimState();
  };

  Column.prototype.bind = function () {
    var self = this;
    var el = this.viewport;

    if (this.toggle) {
      this.toggle.addEventListener('click', function () {
        self.setUserPaused(!self.userPaused);
      });
    }

    /* Pause on hover / keyboard focus / touch */
    el.addEventListener('pointerenter', function () {
      self.hoverHold = true; self.updateAnimState();
    });
    el.addEventListener('pointerleave', function () {
      self.hoverHold = false; self.updateAnimState();
    });
    el.addEventListener('focusin', function () {
      self.focusHold = true; self.updateAnimState();
    });
    el.addEventListener('focusout', function (e) {
      if (!el.contains(e.relatedTarget)) {
        self.focusHold = false; self.updateAnimState();
      }
    });
    el.addEventListener('pointerdown', function () {
      self.touchHold = true; self.updateAnimState();
    });
    window.addEventListener('pointerup', function () {
      if (self.touchHold) { self.touchHold = false; self.updateAnimState(); }
    });

    /* Re-measure when the viewport size changes (responsive) */
    var rt = null;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { if (self.items.length) self.rebuild(); }, 200);
    });
  };

  /* --------------------------------------------------------------- boot --- */
  function init() {
    var root = document.getElementById('uol-fac-section');
    if (!root) return;

    /* Build a Column per .uol-fac-col element present in the markup */
    var cols = Array.prototype.slice
      .call(root.querySelectorAll('.uol-fac-col'))
      .map(function (colEl) {
        var col = new Column(colEl);
        col.facility = colEl.getAttribute('data-facility');
        col.bind();
        col.renderSkeletons();
        if (reducedMotion.matches) {
          col.viewport.classList.add('uol-fac-static'); // manual scroll instead
        }
        return col;
      });

    function load() {
      cols.forEach(function (c) { c.renderSkeletons(); });

      var done = function (rawItems) {
        var byFac = {};
        (rawItems || [])
          .filter(function (it) { return it && (it.name || it.sapId); })
          .forEach(function (it) {
            var fac = String(it.facilityType || '').toLowerCase();
            if (!FACILITY_CONFIG[fac]) return;            // ignore unknown types
            var photo = /^https?:\/\//i.test(it.imageUrl || '') ? it.imageUrl : null;
            (byFac[fac] = byFac[fac] || []).push({
              name: titleCase(it.name || 'UOL Student'),
              id: String(it.sapId || it.registrationNo || it.alumniId || ''),
              photo: photo,
              awarded: parseDate(it.awardedAt)
            });
          });

        cols.forEach(function (col) {
          var items = (byFac[col.facility] || [])
            .sort(function (a, b) {
              return (b.awarded ? b.awarded.getTime() : 0) -
                     (a.awarded ? a.awarded.getTime() : 0);
            })
            .slice(0, MAX_ITEMS_PER_FACILITY);
          col.items = items;
          col.rebuild();
        });
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
          cols.forEach(function (col) {
            col.renderMessage('Couldn’t load recipients.', true, load);
          });
        });
    }

    load();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
