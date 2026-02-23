(() => {
  const root = document.querySelector("[data-alumni-stories]");
  if (!root) {
    return;
  }

  // Next.js API (same domain as events/chapters/associations)
  const API_BASE_URL = 'https://portal-alumni.uol.edu.pk/api/external';

  async function apiGet(endpoint) {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data: json.data, error: json.error };
  }

  // Helper function to extract filename from image path
  function getImageUrl(imagePath) {
    if (!imagePath) return 'https://portal-alumni.uol.edu.pk/images/about-1.jpg';
    // Extract filename from path like "/assets/img/wall/rubeel.jpg"
    const filename = imagePath.split('/').pop();
    return `https://portal-alumni.uol.edu.pk/images/${filename}`;
  }

  const loaders = {
    show(message = "Loading stories...") {
      root.innerHTML = `<div class="tp-alumni-loader">
        <span class="tp-loader-spinner"></span>
        <p>${message}</p>
      </div>`;
    },
    error(message) {
      root.innerHTML = `<div class="tp-alumni-error">
        <h3>We couldn&rsquo;t load that story yet.</h3>
        <p>${message}</p>
      </div>`;
    }
  };

  const utils = {
    toSlug(value) {
      return (value || "")
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    },
    getPathSlug() {
      // First check for query parameter (like chapters/associations pattern)
      const urlParams = new URLSearchParams(window.location.search);
      const querySlug = urlParams.get("slug");
      if (querySlug) {
        return utils.toSlug(decodeURIComponent(querySlug));
      }
      
      // Also check window.alumniSlugFromQuery if set by detail.html
      if (window.alumniSlugFromQuery) {
        return utils.toSlug(decodeURIComponent(window.alumniSlugFromQuery));
      }
      
      // Fallback to path-based slug (for /stories/[slug]/ format)
      const trimmed = window.location.pathname.replace(/\/+$/, "");
      const parts = trimmed.split("/").filter(Boolean);
      if (parts.length >= 2 && parts[0] === "stories") {
        const lastPart = parts[parts.length - 1];
        // Skip if it's index.html or detail.html
        if (lastPart !== "index.html" && lastPart !== "detail.html" && lastPart !== "stories") {
          return utils.toSlug(decodeURIComponent(lastPart));
        }
      }
      return null;
    },
    applyDocumentMeta(story) {
      if (!story) return;
      document.title = `${story.name} | Distinguished Alumni Stories`;
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", `${story.name} | Distinguished Alumni Stories`);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute("content", story.headline || story.summary || "");
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage && story.image) {
        const imageUrl = story.image.startsWith('http') ? story.image : getImageUrl(story.image);
        ogImage.setAttribute("content", imageUrl);
      }
      const breadcrumbTitle = document.querySelector(".tp-breadcrumb__title");
      if (breadcrumbTitle) breadcrumbTitle.textContent = story.name;
    },

    renderAchievements(achievements = []) {
      if (!achievements || !Array.isArray(achievements) || achievements.length === 0) return "";
      return `<div class="tp-alumni-achievements">
        <h4>Highlights</h4>
        <ul>
          ${achievements.map((item) => `<li><i class="fa-regular fa-star"></i>${item}</li>`).join("")}
        </ul>
      </div>`;
    },
    renderStoryParagraphs(paragraphs = []) {
      return paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("");
    },
    renderQuote(story) {
      if (!story.quote) return "";
      return `<div class="tp-alumni-quote">
        <i class="fa-solid fa-quote-right"></i>
        <blockquote>${story.quote}</blockquote>
        ${story.quoteBy ? `<span class="tp-alumni-quote__by">${story.quoteBy}</span>` : ""}
      </div>`;
    },
    renderTags(tags = []) {
      if (!tags || !Array.isArray(tags) || tags.length === 0) return "";
      return `<div class="tp-alumni-tags">
        ${tags.map((tag) => `<span class="tp-alumni-tag">${tag}</span>`).join("")}
      </div>`;
    },
    renderStats(stats = []) {
      if (!stats || !Array.isArray(stats) || stats.length === 0) return "";
      return `<div class="tp-alumni-stats">
        ${stats.map((stat) => {
          const value = stat && typeof stat === 'object' ? stat.value : '';
          const label = stat && typeof stat === 'object' ? stat.label : '';
          return `
          <div class="tp-alumni-stat">
            <div class="tp-alumni-stat__value">${value}</div>
            <div class="tp-alumni-stat__label">${label}</div>
          </div>
        `;
        }).join("")}
      </div>`;
    },
    renderListCards(stories) {
      return `<div class="tp-alumni-card-grid">
        ${stories
          .map(
            (story) => `<article class="tp-alumni-card">
              <div class="tp-alumni-card__banner" style="background-image: url('${story.image || "https://portal-alumni.uol.edu.pk/images/about-1.jpg"}');">
               
              </div>
              <div class="tp-alumni-card__body">
                <h3 class="tp-alumni-card__name">${story.name}</h3>
                <p class="tp-alumni-card__role">${story.role ? story.role.replace(/<br\s*\/?>/gi, ' ') : ""}</p>
                <p class="tp-alumni-card__headline">${story.headline || ""}</p>
                <a class="tp-alumni-card__cta" href="/stories/detail.html?slug=${story.slug}">
                  Read ${story.name.split(" ")[0]}'s story
                  <span class="tp-alumni-card__icon"><i class="fa-regular fa-arrow-right"></i></span>
                </a>
              </div>
            </article>`
          )
          .join("")}
      </div>`;
    }
  };

  // Safely parse JSONB-style fields from API
  function parseJsonbField(field) {
    if (field === null || field === undefined) return [];
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    if (typeof field === 'object') return Array.isArray(field) ? field : [];
    return [];
  }

  function parseJsonbStats(field) {
    if (field === null || field === undefined) return [];
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    if (typeof field === 'object') return Array.isArray(field) ? field : [];
    return [];
  }

  loaders.show();

  (async function() {
    try {
      const slugFromPath = utils.getPathSlug();

      if (slugFromPath) {
        const { ok, data: story, error } = await apiGet(`/distinguished-alumni/${encodeURIComponent(slugFromPath)}`);

        if (!ok || !story) {
          const { data: allStories } = await apiGet('/distinguished-alumni');
          renderNotFoundView(Array.isArray(allStories) ? allStories : []);
          return;
        }

        const normalizedStory = {
          ...story,
          tags: parseJsonbField(story.tags),
          stats: parseJsonbStats(story.stats),
          achievements: parseJsonbField(story.achievements),
          story: parseJsonbField(story.story),
          image: getImageUrl(story.image)
        };

        utils.applyDocumentMeta(normalizedStory);

        const { data: listData } = await apiGet('/distinguished-alumni');
        const allStories = Array.isArray(listData) ? listData : [];
        const normalizedOtherStories = allStories
          .filter((item) => item.slug && item.slug !== slugFromPath)
          .slice(0, 20)
          .map((item) => ({
            ...item,
            image: getImageUrl(item.image)
          }));

        renderDetailView(normalizedStory, normalizedOtherStories);
      } else {
        const { ok, data: stories, error } = await apiGet('/distinguished-alumni');

        if (!ok || error) {
          throw new Error(error || "Unable to fetch alumni stories.");
        }

        if (!Array.isArray(stories) || !stories.length) {
          loaders.error("No alumni stories have been published yet. Please check back soon.");
          return;
        }

        const normalizedStories = stories.map((item) => ({
          ...item,
          slug: item.slug || utils.toSlug(item.name),
          image: getImageUrl(item.image)
        }));

        renderListingView(normalizedStories);
      }
    } catch (err) {
      console.error(err);
      loaders.error(
        "Please refresh to try again or contact the alumni office if this issue continues."
      );
    }
  })();

  function renderListingView(stories) {
    root.innerHTML = `
      <div class="tp-alumni-intro">
        <span class="tp-alumni-intro__eyebrow">Distinguished Alumni</span>
        <h2>Stories of impact across the globe</h2>
        <p>Explore the journeys of alumni who are raising the UoL flag in healthcare, climate technology, inclusive design and beyond.</p>
      </div>
      ${utils.renderListCards(stories)}
    `;
  }

  function renderDetailView(story, otherStories) {
    const moreStories = otherStories.slice(0, 2);

    root.innerHTML = `
      <article class="tp-alumni-detail">
        <header class="tp-alumni-detail__hero">
          <div class="tp-alumni-detail__media">
            <img src="${story.image || "https://portal-alumni.uol.edu.pk/images/about-1.jpg"}" alt="${story.name}">
          </div>
          <div class="tp-alumni-detail__meta">
            <span class="tp-alumni-detail__eyebrow">Distinguished Alumni Story</span>
            <h1>${story.name}</h1>
            <p class="tp-alumni-detail__role">${story.role ? story.role.replace(/<br\s*\/?>/gi, ' ') : ""}</p>
            <p class="tp-alumni-detail__headline">${story.headline || ""}</p>
            ${utils.renderTags(story.tags)}
            ${utils.renderStats(story.stats)}
          </div>
        </header>
        <div class="tp-alumni-detail__body">
          <div class="tp-alumni-detail__story">
            <p class="tp-alumni-detail__summary">${story.summary ? story.summary.replace(/<br\s*\/?>/gi, ' ') : ""}</p>
            ${utils.renderStoryParagraphs(story.story || [])}
            ${utils.renderQuote(story)}
          </div>
          <aside class="tp-alumni-detail__aside">
            ${utils.renderAchievements(story.achievements)}
            ${renderMoreStories(moreStories)}
          </aside>
        </div>
      </article>
    `;
  }

  function renderMoreStories(stories) {
    if (!stories.length) return "";
    return `<div class="tp-alumni-more">
      <h4>More distinguished alumni</h4>
      <ul>
        ${stories
          .map(
            (story) => `<li>
            <a href="/stories/detail.html?slug=${story.slug}">
              <span>
                <strong>${story.name}</strong>
                <em>${story.role || ""}</em>
              </span>
              <i class="fa-regular fa-arrow-right"></i>
            </a>
          </li>`
          )
          .join("")}
      </ul>
    </div>`;
  }

  function renderNotFoundView(stories) {
    const backLink = `<a class="tp-alumni-back" href="/stories/"><i class="fa-regular fa-arrow-left"></i>Back to all stories</a>`;
    root.innerHTML = `
      <div class="tp-alumni-not-found">
        <h2>Story not found</h2>
        <p>The alumni profile you&rsquo;re looking for hasn&rsquo;t been published yet. Explore other inspiring journeys below.</p>
        ${backLink}
      </div>
      ${utils.renderListCards(stories)}
    `;
  }
})();

