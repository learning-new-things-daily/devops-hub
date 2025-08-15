document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.querySelector(".philosophy-grid");
  const modal = document.getElementById("philosophyModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalDescription = document.getElementById("modalDescription");
  const modalReferences = document.getElementById("modalReferences");
  const philosophyShare = document.getElementById("philosophyShare");
  const closeModal = document.getElementById("closeModal");
  const searchInput = document.getElementById("philosophy-search");

  let philosophies = [];

  // Fetch data (replace with your actual JSON path)
  try {
    const response = await fetch("assets/data/philosophy.json");
    philosophies = await response.json();
  } catch (err) {
    grid.innerHTML = "<p>⚠ Unable to load philosophy data.</p>";
    return;
  }

  // Render philosophy cards
  function renderPhilosophies(philosophiesToRender) {
    grid.innerHTML = "";
    philosophiesToRender.forEach(philosophy => {
      const card = document.createElement("div");
      card.className = "festival-card";
      card.innerHTML = `<h3>${philosophy.title}</h3><p>${philosophy.short}</p>`;
      card.addEventListener("click", () => openModal(philosophy));
      grid.appendChild(card);
    });
  }

  renderPhilosophies(philosophies);

  // Modal open logic
  function openModal(philosophy) {
    modalTitle.textContent = philosophy.title;
    modalDescription.textContent = philosophy.description;
    modalReferences.innerHTML = philosophy.references?.length
      ? `<h4>References:</h4><ul>${philosophy.references.map(ref =>
          `<li><a href="${ref.url}" target="_blank" class="ref-link">${ref.text}</a></li>`
        ).join('')}</ul>`
      : "";

    // Share buttons
    const pageUrl = window.location.origin + window.location.pathname + "#" + philosophy.id;
    const shareText = encodeURIComponent(`${philosophy.title} - ${philosophy.short || ""} (${pageUrl})`);
    philosophyShare.innerHTML = `
      <h4>Share:</h4>
      <button onclick="navigator.clipboard.writeText('${pageUrl}');" title="Copy Link" style="background:none;border:none;cursor:pointer;">
        <img src="assets/icons/png/link.png" alt="Copy Link" style="height:20px;vertical-align:middle;">
      </button>
      <a href="https://wa.me/?text=${shareText}" target="_blank" class="whatsapp" title="Share on WhatsApp">
        <img src="assets/icons/png/WhatsApp.png" alt="WhatsApp" style="height:20px;vertical-align:middle;">
      </a>
      <a href="https://twitter.com/intent/tweet?text=${shareText}" target="_blank" class="twitter" title="Share on Twitter">
        <img src="assets/icons/png/Twitter.png" alt="Twitter" style="height:20px;vertical-align:middle;">
      </a>
      <a href="https://www.facebook.com/sharer/sharer.php?u=${pageUrl}" target="_blank" class="facebook" title="Share on Facebook">
        <img src="assets/icons/png/Facebook.png" alt="Facebook" style="height:20px;vertical-align:middle;">
      </a>
      <a href="https://t.me/share/url?url=${pageUrl}&text=${shareText}" target="_blank" class="telegram" title="Share on Telegram">
        <img src="assets/icons/png/Telegram.png" alt="Telegram" style="height:20px;vertical-align:middle;">
      </a>
    `;

    modal.style.display = "flex";
  }

  // Modal close logic
  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });
  window.addEventListener("click", e => {
    if (e.target === modal) modal.style.display = "none";
  });

  // Search functionality
  searchInput.addEventListener("input", function() {
    const query = this.value.trim().toLowerCase();
    const filtered = philosophies.filter(p =>
      p.title.toLowerCase().includes(query) ||
      (p.short && p.short.toLowerCase().includes(query)) ||
      (p.description && p.description.toLowerCase().includes(query))
    );
    renderPhilosophies(filtered);
  });
});
