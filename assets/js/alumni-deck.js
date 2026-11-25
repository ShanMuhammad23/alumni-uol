/* ==========================================================================
   Alumni Card deck — swaps the shared caption to the hovered/focused card.
   ========================================================================== */
(function () {
   const deck = document.getElementById('alumni-deck');
   const caption = document.getElementById('alumni-deck-caption');
   if (!deck || !caption) return;

   const DEFAULT = caption.textContent;

   deck.querySelectorAll('.alumni-deck-card').forEach(card => {
      const name = card.getAttribute('data-name') || DEFAULT;
      card.addEventListener('mouseenter', () => { caption.textContent = name; });
      card.addEventListener('focus', () => { caption.textContent = name; });
      card.addEventListener('mouseleave', () => { caption.textContent = DEFAULT; });
      card.addEventListener('blur', () => { caption.textContent = DEFAULT; });
   });
})();
