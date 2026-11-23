// Merchant Benefits — partner offer vouchers from /merchants
(function () {
   const PORTAL_HOST = 'https://portal-alumni.uol.edu.pk';
   const fmtDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

   function escapeHtml(text) {
      if (!text) return '';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
   }

   // banner_url points at the dev host (localhost:3000) — keep the path, swap the host
   function bannerUrl(raw) {
      if (!raw) return '';
      try {
         const url = new URL(raw, PORTAL_HOST);
         return PORTAL_HOST + url.pathname;
      } catch (e) {
         return '';
      }
   }

   function isEnded(merchant) {
      if (merchant.status && merchant.status.toLowerCase() !== 'active') return true;
      if (!merchant.end_date) return false;
      const end = new Date(merchant.end_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return end < today;
   }

   function createVoucher(merchant) {
      const name = escapeHtml(merchant.business_name || 'Partner merchant');
      const scope = escapeHtml(merchant.discount_type || '');
      const location = escapeHtml(merchant.location || '');
      const ended = isEnded(merchant);
      const banner = bannerUrl(merchant.banner_url);
      const pct = merchant.discount_pct != null ? String(merchant.discount_pct) : '';

      const validLine = ended
         ? '<p class="tp-voucher-valid">This offer has ended</p>'
         : '<p class="tp-voucher-valid">Valid until ' +
           (merchant.end_date ? fmtDate.format(new Date(merchant.end_date)) : 'further notice') + '</p>';

      const stub = pct
         ? '<div class="tp-voucher-figure">' + escapeHtml(pct) + '<sup>%</sup></div>' +
           (scope ? '<div class="tp-voucher-scope">off ' + scope + '</div>' : '<div class="tp-voucher-scope">off</div>')
         : (scope ? '<div class="tp-voucher-scope">' + scope + '</div>' : '');

      const bannerCell = banner
         ? '<a class="tp-voucher-banner popup-image" href="' + escapeHtml(banner) + '" aria-label="View ' + name + ' offer banner">' +
           '<img src="' + escapeHtml(banner) + '" alt="' + name + ' offer banner" loading="lazy"></a>'
         : '<span class="tp-voucher-banner" aria-hidden="true"></span>';

      return '<div class="tp-voucher' + (ended ? ' tp-voucher--ended' : '') + (banner ? '' : ' tp-voucher--no-banner') + '">' +
         bannerCell +
         '<div class="tp-voucher-body">' +
         '<h3 class="tp-voucher-name">' + name + '</h3>' +
         (location ? '<p class="tp-voucher-meta">' + location + '</p>' : '') +
         validLine +
         '</div>' +
         '<div class="tp-voucher-stub">' + stub + '</div>' +
         '</div>';
   }

   async function loadMerchants() {
      const grid = document.getElementById('merchantOffersGrid');
      if (!grid) return;
      grid.innerHTML = '<p class="tp-voucher-empty">Loading offers…</p>';

      try {
         if (!window.apiClient) throw new Error('API client not initialized');
         const response = await window.apiClient.getMerchants();
         const items = (response.data && (response.data.items || response.data)) || response;
         if (response.error) throw response.error;

         const list = Array.isArray(items) ? items : [];
         if (!list.length) {
            grid.innerHTML = '<p class="tp-voucher-empty">No partner offers right now. Check back soon.</p>';
            return;
         }

         const live = list.filter(m => !isEnded(m));
         const ended = list.filter(isEnded);
         grid.innerHTML = live.concat(ended).map(createVoucher).join('');

         if (typeof $ !== 'undefined' && $.fn.magnificPopup) {
            $('.popup-image').magnificPopup({ type: 'image', gallery: { enabled: true } });
         }
      } catch (error) {
         console.error('Error loading merchants:', error);
         grid.innerHTML = '<p class="tp-voucher-empty">Could not load partner offers. Refresh the page to try again.</p>';
      }
   }

   document.addEventListener('DOMContentLoaded', loadMerchants);
})();
