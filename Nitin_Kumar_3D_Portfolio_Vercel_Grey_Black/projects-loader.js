/*  ──────────────────────────────────────────────────────────
    projects-loader.js
    Loads dynamic projects & graphic-design items from
    data/projects.json.
    Includes:
    - Interactive single Graphic Design Folder with smooth expand/collapse drawer
    - Fullscreen lightbox modal with Previous/Next gallery navigation
    ────────────────────────────────────────────────────────── */

(function () {
  "use strict";

  const DATA_URL = "data/projects.json";

  let graphicDesignItems = [];
  let currentItemIndex = -1;

  /* ── Lightbox Elements ── */
  let modalEl, modalImg, modalType, modalTitle, modalDesc, modalMeta, modalCounter;
  let prevBtn, nextBtn, closeBtn, backdrop;

  function initLightbox() {
    if (document.getElementById("imageLightbox")) return;

    modalEl = document.createElement("div");
    modalEl.id = "imageLightbox";
    modalEl.className = "lightbox-modal";
    modalEl.setAttribute("aria-hidden", "true");
    modalEl.setAttribute("role", "dialog");
    modalEl.setAttribute("aria-modal", "true");

    modalEl.innerHTML = `
      <div class="lightbox-backdrop"></div>
      <button class="lightbox-nav lightbox-prev" id="lightboxPrev" aria-label="Previous artwork">‹</button>
      <button class="lightbox-nav lightbox-next" id="lightboxNext" aria-label="Next artwork">›</button>
      <div class="lightbox-dialog">
        <button class="lightbox-close" aria-label="Close modal">✕</button>
        <div class="lightbox-body">
          <div class="lightbox-image-wrap">
            <img id="lightboxImg" src="" alt="Artwork enlarged view">
          </div>
          <div class="lightbox-info">
            <div class="lightbox-counter" id="lightboxCounter"></div>
            <div class="lightbox-type" id="lightboxType"></div>
            <h3 class="lightbox-title" id="lightboxTitle"></h3>
            <p class="lightbox-desc" id="lightboxDesc"></p>
            <div class="lightbox-meta" id="lightboxMeta"></div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modalEl);

    modalImg = document.getElementById("lightboxImg");
    modalType = document.getElementById("lightboxType");
    modalTitle = document.getElementById("lightboxTitle");
    modalDesc = document.getElementById("lightboxDesc");
    modalMeta = document.getElementById("lightboxMeta");
    modalCounter = document.getElementById("lightboxCounter");

    closeBtn = modalEl.querySelector(".lightbox-close");
    backdrop = modalEl.querySelector(".lightbox-backdrop");
    prevBtn = document.getElementById("lightboxPrev");
    nextBtn = document.getElementById("lightboxNext");

    closeBtn.addEventListener("click", closeLightbox);
    backdrop.addEventListener("click", closeLightbox);

    prevBtn.addEventListener("click", showPrevArtwork);
    nextBtn.addEventListener("click", showNextArtwork);

    document.addEventListener("keydown", function (e) {
      if (!modalEl.classList.contains("active")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrevArtwork();
      if (e.key === "ArrowRight") showNextArtwork();
    });
  }

  function displayItemAtIndex(idx) {
    if (!graphicDesignItems.length) return;
    if (idx < 0) idx = graphicDesignItems.length - 1;
    if (idx >= graphicDesignItems.length) idx = 0;
    currentItemIndex = idx;

    const item = graphicDesignItems[idx];
    modalImg.src = item.image;
    modalImg.alt = item.title || "Graphic design artwork";
    modalType.textContent = item.type || "GRAPHIC DESIGN";
    modalTitle.textContent = item.title || "Untitled";
    modalDesc.textContent = item.description || "";
    modalCounter.textContent = `ARTWORK ${idx + 1} OF ${graphicDesignItems.length}`;

    modalMeta.innerHTML = "";
    if (item.tag) {
      const tagSpan = document.createElement("span");
      tagSpan.className = "lightbox-tag";
      tagSpan.textContent = item.tag;
      modalMeta.appendChild(tagSpan);
    }

    if (item.link && item.link.trim() !== "" && !item.link.includes("ibb.co")) {
      const linkBtn = document.createElement("a");
      linkBtn.href = item.link;
      linkBtn.target = "_blank";
      linkBtn.rel = "noopener";
      linkBtn.className = "lightbox-link-btn";
      linkBtn.innerHTML = `Open Project Link ↗`;
      modalMeta.appendChild(linkBtn);
    }
  }

  function openLightbox(item, index) {
    if (!modalEl) initLightbox();
    if (typeof index === "number" && index >= 0) {
      displayItemAtIndex(index);
    } else {
      const foundIdx = graphicDesignItems.findIndex(i => i.title === item.title);
      displayItemAtIndex(foundIdx >= 0 ? foundIdx : 0);
    }

    modalEl.classList.add("active");
    modalEl.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function showPrevArtwork(e) {
    if (e) e.stopPropagation();
    displayItemAtIndex(currentItemIndex - 1);
  }

  function showNextArtwork(e) {
    if (e) e.stopPropagation();
    displayItemAtIndex(currentItemIndex + 1);
  }

  function closeLightbox() {
    if (!modalEl) return;
    modalEl.classList.remove("active");
    modalEl.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (modalImg) modalImg.src = "";
  }

  /* ── Card Builder ── */
  function buildCard(item, index, showImage, isGraphicDesign) {
    const num = String(index + 1).padStart(2, "0");
    const hasImage = showImage && item.image && item.image.trim() !== "";
    const hasLink = item.link && item.link.trim() !== "" && !item.link.includes("ibb.co");

    let el;

    if (hasImage) {
      el = document.createElement("div");
      el.className = "project project-has-image";
      el.setAttribute("role", "button");
      el.setAttribute("tabindex", "0");
      el.setAttribute("aria-label", `View ${item.title || "artwork"}`);

      el.addEventListener("click", function (e) {
        e.preventDefault();
        openLightbox(item, isGraphicDesign ? index : -1);
      });

      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(item, isGraphicDesign ? index : -1);
        }
      });

      el.innerHTML = `
        <div class="project-image">
          <img src="${escAttr(item.image)}" alt="${escAttr(item.title)}" loading="lazy">
          <div class="project-expand-badge">Enlarge ⤢</div>
        </div>
        <div class="project-content">
          <span class="project-no">${num}</span>
          <span class="project-arrow">⤢</span>
          <div class="project-type">${escHtml(item.type || "GRAPHIC DESIGN")}</div>
          <h3>${escHtml(item.title)}</h3>
          <p>${escHtml(item.description || "")}</p>
          <strong>Enlarge Artwork ⤢</strong>
        </div>
      `;
    } else {
      const tag = hasLink ? "a" : "div";
      el = document.createElement(tag);
      el.className = "project";
      if (hasLink) {
        el.href = item.link;
        el.target = "_blank";
        el.rel = "noopener";
      }

      el.innerHTML = `
        <span class="project-no">${num}</span>
        <span class="project-arrow">${hasLink ? "↗" : "◎"}</span>
        <div class="project-type">${escHtml(item.type || "PROJECT")}</div>
        <h3>${escHtml(item.title)}</h3>
        <p>${escHtml(item.description || "")}</p>
        <strong>${hasLink ? "Open project →" : (item.tag || "")}</strong>
      `;
    }

    return el;
  }

  function escHtml(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  function escAttr(str) {
    return String(str || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* ── Interactive Folder Controls ── */
  function setupFolderControls(count) {
    const folderCard = document.getElementById("designFolderCard");
    const toggleBtn = document.getElementById("folderToggleBtn");
    const stackPreview = document.getElementById("folderStackPreview");
    const closeBtn = document.getElementById("drawerCloseBtn");
    const countBadge = document.getElementById("folderCountBadge");

    if (countBadge) {
      countBadge.textContent = `${count} Works Inside`;
    }

    function openFolder() {
      if (!folderCard) return;
      folderCard.classList.add("open");
      if (toggleBtn) {
        toggleBtn.setAttribute("aria-expanded", "true");
        const textSpan = toggleBtn.querySelector(".folder-btn-text");
        if (textSpan) textSpan.textContent = `Close Folder (${count} Works)`;
      }
    }

    function closeFolder() {
      if (!folderCard) return;
      folderCard.classList.remove("open");
      if (toggleBtn) {
        toggleBtn.setAttribute("aria-expanded", "false");
        const textSpan = toggleBtn.querySelector(".folder-btn-text");
        if (textSpan) textSpan.textContent = `Open Folder (${count} Works)`;
      }
    }

    function toggleFolder() {
      if (!folderCard) return;
      if (folderCard.classList.contains("open")) {
        closeFolder();
      } else {
        openFolder();
      }
    }

    if (toggleBtn) toggleBtn.addEventListener("click", toggleFolder);
    if (stackPreview) stackPreview.addEventListener("click", openFolder);
    if (closeBtn) closeBtn.addEventListener("click", closeFolder);

    /* Clicking hero 'Graphic Design' button opens the folder and scrolls down */
    const heroBtn = document.getElementById("heroGraphicDesignBtn");
    if (heroBtn) {
      heroBtn.addEventListener("click", function () {
        openFolder();
      });
    }
    document.querySelectorAll('a[href="#graphic-design"]').forEach(link => {
      link.addEventListener("click", function () {
        openFolder();
      });
    });
  }

  /* ── Render Function ── */
  function render(data) {
    initLightbox();

    /* Selected Work dynamic extras */
    const projGrid = document.getElementById("dynamicProjectsGrid");
    if (projGrid && data.projects && data.projects.length) {
      data.projects.forEach((p, i) => {
        projGrid.appendChild(buildCard(p, 6 + i, true, false));
      });
    }

    /* Graphic Design Folder */
    const gdGrid = document.getElementById("graphicDesignGrid");
    const gdEmpty = document.getElementById("gd-empty");

    if (data.graphicDesign && data.graphicDesign.length) {
      graphicDesignItems = data.graphicDesign;
      if (gdGrid) {
        gdGrid.innerHTML = "";
        data.graphicDesign.forEach((p, i) => {
          gdGrid.appendChild(buildCard(p, i, true, true));
        });
      }
      setupFolderControls(data.graphicDesign.length);
      if (gdEmpty) gdEmpty.style.display = "none";
    } else if (gdEmpty) {
      gdEmpty.style.display = "block";
    }

    /* Re-observe cards for entrance animations */
    if (window.__projObserver) {
      document.querySelectorAll("#dynamicProjectsGrid .project, #graphicDesignGrid .project")
        .forEach(el => window.__projObserver.observe(el));
    }
  }

  /* ── Fetch JSON ── */
  fetch(DATA_URL)
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(render)
    .catch(() => {
      const gdEmpty = document.getElementById("gd-empty");
      if (gdEmpty) gdEmpty.style.display = "block";
    });
})();
