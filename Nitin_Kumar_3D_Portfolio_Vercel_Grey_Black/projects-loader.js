/*  ──────────────────────────────────────────────────────────
    projects-loader.js
    Loads dynamic projects & graphic-design items from
    data/projects.json so you never have to edit HTML again.
    Now supports image thumbnails in cards!
    ────────────────────────────────────────────────────────── */

(function () {
  "use strict";

  const DATA_URL = "data/projects.json";

  /* ── Card builder ── */
  function buildCard(item, index, showImage) {
    const num = String(index + 1).padStart(2, "0");
    const hasLink = item.link && item.link.trim() !== "";
    const hasImage = showImage && item.image && item.image.trim() !== "";
    const tag = hasLink ? "a" : "div";

    const el = document.createElement(tag);
    el.className = "project" + (hasImage ? " project-has-image" : "");
    if (hasLink) {
      el.href = item.link;
      el.target = "_blank";
      el.rel = "noopener";
    }

    const imageHtml = hasImage
      ? `<div class="project-image"><img src="${escAttr(item.image)}" alt="${escAttr(item.title)}" loading="lazy"></div>`
      : "";

    el.innerHTML = `
      ${imageHtml}
      <div class="project-content">
        <span class="project-no">${num}</span>
        <span class="project-arrow">${hasLink ? "↗" : "◎"}</span>
        <div class="project-type">${escHtml(item.type || "PROJECT")}</div>
        <h3>${escHtml(item.title)}</h3>
        <p>${escHtml(item.description || "")}</p>
        <strong>${hasLink ? "View →" : (item.tag || "")}</strong>
      </div>
    `;
    return el;
  }

  function escHtml(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  function escAttr(str) {
    return str.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }

  /* ── Render into containers ── */
  function render(data) {
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
      /* No data file yet — show empty state */
      const gdEmpty = document.getElementById("gd-empty");
      if (gdEmpty) gdEmpty.style.display = "block";
    });
})();
