document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.querySelector(".myths-grid");
  const modal = document.getElementById("mythModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalDescription = document.getElementById("modalDescription");
  const modalProofs = document.getElementById("modalProofs");
  const modalReferences = document.getElementById("modalReferences");
  const closeModal = document.getElementById("closeModal");
  const searchInput = document.getElementById("myth-search");
  const categorySelect = document.getElementById("myth-category");

  // Share buttons in modal
  const shareCopy = document.getElementById("shareCopy");
  const shareWhatsApp = document.getElementById("shareWhatsApp");
  const shareTwitter = document.getElementById("shareTwitter");
  const shareFacebook = document.getElementById("shareFacebook");
  const shareTelegram = document.getElementById("shareTelegram");

  let allMyths = [];

  try {
    const response = await fetch("assets/data/myths.json");
    allMyths = await response.json();
    renderMyths(allMyths);

    // Handle deep linking if hash exists
    if (window.location.hash) {
      const targetId = window.location.hash.substring(1);
      const targetMyth = allMyths.find(m => m.id === targetId);
      if (targetMyth) openModal(targetMyth);
    }
  } catch (err) {
    console.error("Failed to load myths data:", err);
    grid.innerHTML = "<p>⚠ Unable to load myths data.</p>";
  }

  // Render myths to grid with floating share button
  function renderMyths(list) {
    grid.innerHTML = "";
    if (!list.length) {
      grid.innerHTML = `<p style="text-align:center;margin-top:20px;">No myths found.</p>`;
      return;
    }

    list.forEach(myth => {
      const card = document.createElement("div");
      card.className = "festival-card";
      card.dataset.myth = myth.id;

      card.innerHTML = `
        <h3>${myth.title}</h3>
        <p>${myth.short}</p>
        <div class="card-share-btn" title="Copy link">🔗</div>
      `;

      grid.appendChild(card);

      // Click card to open modal
      card.addEventListener("click", e => {
        if (!e.target.classList.contains("card-share-btn")) {
          openModal(myth);
        }
      });

      // Floating share button: copy link
      const shareBtn = card.querySelector(".card-share-btn");
      shareBtn.addEventListener("click", e => {
        e.stopPropagation();
        const shareUrl = `${window.location.origin}${window.location.pathname}#${myth.id}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
          alert(`✅ Link to "${myth.title}" copied!`);
        });
      });
    });
  }

  // Open modal and populate share links
  function openModal(myth) {
    modalTitle.textContent = myth.title;
    modalDescription.textContent = myth.description;

    modalProofs.innerHTML = myth.proofs?.length 
      ? `<h4>Supporting Proofs:</h4><ul>${myth.proofs.map(p => `<li>${p}</li>`).join("")}</ul>` 
      : "";

    modalReferences.innerHTML = myth.references?.length
      ? `<h4>References:</h4><ul>${myth.references.map(r => 
          r.url 
            ? `<li><a href="${r.url}" target="_blank">${r.text}</a></li>` 
            : `<li>${r.text}</li>`
        ).join("")}</ul>`
      : "";

    const pageUrl = window.location.origin + window.location.pathname + "#" + myth.id;
    const shareText = encodeURIComponent(`${myth.title} - ${myth.short || ""} (${pageUrl})`);
    document.getElementById("shareWhatsApp").href = `https://wa.me/?text=${shareText}`;
    document.getElementById("shareTwitter").href = `https://twitter.com/intent/tweet?text=${shareText}`;
    document.getElementById("shareFacebook").href = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
    document.getElementById("shareTelegram").href = `https://t.me/share/url?url=${pageUrl}&text=${shareText}`;
    document.getElementById("shareCopy").onclick = () => navigator.clipboard.writeText(pageUrl);

    modal.style.display = "flex";
    window.location.hash = myth.id;
  }

  // Close modal
  closeModal.addEventListener("click", () => closeModalFn());
  window.addEventListener("click", e => { if (e.target === modal) closeModalFn(); });

  function closeModalFn() {
    modal.style.display = "none";
    history.replaceState(null, "", window.location.pathname); // clear hash
  }

  // Search & filter
  function applyFilters() {
    const keyword = searchInput?.value.toLowerCase() || "";
    const selectedCategory = categorySelect?.value || "all";

    const filtered = allMyths.filter(myth => {
      const matchesSearch =
        myth.title.toLowerCase().includes(keyword) ||
        myth.short.toLowerCase().includes(keyword) ||
        myth.description.toLowerCase().includes(keyword);

      const matchesCategory = selectedCategory === "all" || myth.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    renderMyths(filtered);
  }

  searchInput?.addEventListener("keyup", applyFilters);
  categorySelect?.addEventListener("change", applyFilters);
});
