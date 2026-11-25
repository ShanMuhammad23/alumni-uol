/* ==========================================================================
   Birthday Shoutouts — Alumni Leadership
   Loads /api/external/birthdays and renders a Swiper of gift-tag cards.
   ========================================================================== */
(function () {
   const wrapper = document.getElementById('birthday-shoutouts-wrapper');
   const sliderEl = document.getElementById('birthday-shoutouts-slider');
   if (!wrapper || !sliderEl) return;

   const PLACEHOLDER_IMG = 'https://portal-alumni.uol.edu.pk/images/about-1.jpg';


   function escapeHtml(text) {
      if (text === null || text === undefined) return '';
      return String(text)
         .replace(/&/g, '&amp;')
         .replace(/</g, '&lt;')
         .replace(/>/g, '&gt;')
         .replace(/"/g, '&quot;')
         .replace(/'/g, '&#39;');
   }

   function renderSlide(item) {
      const name = escapeHtml(item.name || 'Alumni');
      const sapId = escapeHtml(item.sapId || '');
      const gift = item.giftImageUrl || item.imageUrl || PLACEHOLDER_IMG;
      const url = item.linkedinPostUrl || '';

      const avatar = item.imageUrl
         ? `<span class="tp-bday-avatar"><img src="${escapeHtml(item.imageUrl)}" alt="" loading="lazy" onerror="this.parentElement.style.display='none'"></span>`
         : '';

      const linkAffordance = url
         ? `<span class="tp-bday-link"><i class="fa-brands fa-linkedin-in" aria-hidden="true"></i>View post</span>`
         : '';

      const cardInner = `
         <div class="tp-bday-media">
            <div class="tp-bday-media-clip">
               <img class="tp-bday-gift" src="${escapeHtml(gift)}" alt="Birthday gift for ${name}" loading="lazy"
                  onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}'">
            </div>
            ${avatar}
         </div>
         <div class="tp-bday-body">
            <h4 class="tp-bday-name">${name}</h4>
            <div class="tp-bday-foot">
               ${sapId ? `<span class="tp-bday-sap">SAP <b>${sapId}</b></span>` : '<span></span>'}
               ${linkAffordance}
            </div>
         </div>`;

      const tag = url ? 'a' : 'div';
      const attrs = url ? ` href="${escapeHtml(url)}" target="_blank" rel="noopener"` : '';
      return `<div class="swiper-slide"><${tag} class="tp-bday-card"${attrs}>${cardInner}</${tag}></div>`;
   }

   function initSlider(count) {
      if (typeof Swiper === 'undefined') {
         setTimeout(() => initSlider(count), 100);
         return;
      }
      if (window.birthdayShoutoutsSlider) {
         try { window.birthdayShoutoutsSlider.destroy(true, true); } catch (e) { /* noop */ }
      }
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      try {
         window.birthdayShoutoutsSlider = new Swiper('#birthday-shoutouts-slider', {
            slidesPerView: 4,
            spaceBetween: 24,
            speed: 700,
            loop: count > 4,
            watchOverflow: true,
            autoplay: reduceMotion ? false : {
               delay: 4000,
               disableOnInteraction: false,
               pauseOnMouseEnter: true,
            },
            navigation: {
               nextEl: '.tp-bday-next',
               prevEl: '.tp-bday-prev',
            },
            pagination: {
               el: '.tp-bday-pagination',
               clickable: true,
            },
            breakpoints: {
               1400: { slidesPerView: 4 },
               1200: { slidesPerView: 3 },
               992: { slidesPerView: 3 },
               768: { slidesPerView: 2 },
               576: { slidesPerView: 1 },
               0: { slidesPerView: 1 },
            },
         });
      } catch (e) {
         console.error('Error initializing birthday shoutouts slider:', e);
      }
   }

   function showMessage(text) {
      wrapper.innerHTML = `<div class="swiper-slide"><p class="tp-bday-empty">${escapeHtml(text)}</p></div>`;
      initSlider(0);
   }

   async function load() {
      try {
         if (!window.apiClient) throw new Error('API client not initialized');
         const response = await window.apiClient.getBirthdays();
         if (response && response.error) throw new Error(response.error);

         const items = (response && response.data && Array.isArray(response.data.items))
            ? response.data.items
            : (Array.isArray(response) ? response : []);

         if (items.length === 0) {
            showMessage('No birthday shoutouts right now. Check back soon.');
            return;
         }

         wrapper.innerHTML = items.map(renderSlide).join('');
         initSlider(items.length);
      } catch (error) {
         console.error('Error loading birthday shoutouts:', error);
         showMessage('Unable to load birthday shoutouts.');
      }
   }

   if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', load);
   } else {
      load();
   }
})();
