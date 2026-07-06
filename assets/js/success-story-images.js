(function () {
   function fitSuccessStoryImage(img) {
      if (!img || !img.naturalWidth || !img.naturalHeight) {
         return;
      }

      var ratio = img.naturalWidth / img.naturalHeight;
      img.classList.remove('is-portrait', 'is-landscape', 'is-square');

      if (ratio < 0.9) {
         img.classList.add('is-portrait');
      } else if (ratio > 1.15) {
         img.classList.add('is-landscape');
      } else {
         img.classList.add('is-square');
      }
   }

   function bindSuccessStoryImage(img) {
      if (!img) {
         return;
      }

      if (img.complete && img.naturalWidth) {
         fitSuccessStoryImage(img);
      } else {
         img.addEventListener('load', function onLoad() {
            img.removeEventListener('load', onLoad);
            fitSuccessStoryImage(img);
         });
      }
   }

   function bindSuccessStoryImages(root) {
      var scope = root || document;
      scope.querySelectorAll('.success-story-media img').forEach(bindSuccessStoryImage);
   }

   window.fitSuccessStoryImage = fitSuccessStoryImage;
   window.bindSuccessStoryImages = bindSuccessStoryImages;
})();
