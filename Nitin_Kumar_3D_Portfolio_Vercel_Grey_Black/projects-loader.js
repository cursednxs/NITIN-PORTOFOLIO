/*  ──────────────────────────────────────────────────────────
    projects-loader.js
    Loads dynamic projects & graphic-design items from
    data/projects.json.
    Includes built-in fullscreen lightbox modal for artworks/images!
    ────────────────────────────────────────────────────────── */

(function () {
  "use strict";

  const DATA_URL = "data/projects.json";

  /* ── Initialize Lightbox Modal ── */
  let modalEl, modalImg, modalType, modalTitle, modalDesc, modalMeta, closeBtn, backdrop;

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
      <div class="lightbox-dialog">
        <button class="lightbox-close" aria-label="Close modal">✕</button>
        <div class="lightbox-body">
          <div class="lightbox-image-wrap">
            <img id="lightboxImg" src="" alt="Artwork enlarged view">
          </div>
          <div class="lightbox-info">
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
    closeBtn = modalEl.querySelector(".lightbox-close");
    backdrop = modalEl.querySelector(".lightbox-backdrop");

    closeBtn.addEventListener("click", closeLightbox);
    backdrop.addEventListener("click", closeLightbox);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modalEl.classList.contains("active")) {
        closeLightbox();
      }
    });
  }

  function openLightbox(item) {
    if (!modalEl) initLightbox();

    modalImg.src = item.image;
    modalImg.alt = item.title || "Graphic design artwork";
    modalType.textContent = item.type || "GRAPHIC DESIGN";
    modalTitle.textContent = item.title || "Untitled";
    modalDesc.textContent = item.description || "";

    modalMeta.innerHTML = "";
    if (item.tag) {
      const tagSpan = document.createElement("span");
      tagSpan.className = "lightbox-tag";
      tagSpan.textContent = item.tag;
      modalMeta.appendChild(tagSpan);
    }

    /* Optional link to open high-res original if different from image */
    if (item.link && item.link.trim() !== "") {
      const linkBtn = document.createElement("a");
      linkBtn.href = item.link;
      linkBtn.target = "_blank";
      linkBtn.rel = "noopener";
      linkBtn.className = "lightbox-link-btn";
      linkBtn.innerHTML = `Open Original ↗`;
      modalMeta.appendChild(linkBtn);
    }

    modalEl.classList.add("active");
    modalEl.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!modalEl) return;
    modalEl.classList.remove("active");
    modalEl.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (modalImg) modalImg.src = "";
  }

  /* ── Card builder ── */
  function buildCard(item, index, showImage) {
    const num = String(index + 1).padStart(2, "0");
    const hasImage = showImage && item.image && item.image.trim() !== "";
    const hasLink = item.link && item.link.trim() !== "";

    let el;

    if (hasImage) {
      /* Artwork with image: click opens in-page Lightbox modal */
      el = document.createElement("div");
      el.className = "project project-has-image";
      el.setAttribute("role", "button");
      el.setAttribute("tabindex", "0");
      el.setAttribute("aria-label", `View ${item.title || "artwork"}`);

      el.addEventListener("click", function (e) {
        e.preventDefault();
        openLightbox(item);
      });

      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(item);
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
      /* Regular link project (e.g. live website) */
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

  /* ── Render into containers ── */
  function render(data) {
    initLightbox();

    /* Selected Work dynamic extras */
    const projGrid = document.getElementById("dynamicProjectsGrid");
    if (projGrid && data.projects && data.projects.length) {
      data.projects.forEach((p, i) => {
        projGrid.appendChild(buildCard(p, 6 + i, true));
      });
    }

    /* Graphic Design section */
    const gdGrid = document.getElementById("graphicDesignGrid");
    const gdEmpty = document.getElementById("gd-empty");
    if (gdGrid && data.graphicDesign && data.graphicDesign.length) {
      data.graphicDesign.forEach((p, i) => gdGrid.appendChild(buildCard(p, i, true)));
      if (gdEmpty) gdEmpty.style.display = "none";
    } else if (gdEmpty) {
      gdEmpty.style.display = "block";
    }

    /* Re-observe new cards for entrance animation */
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
