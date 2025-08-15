document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.querySelector(".scriptures-grid");
  const modal = document.getElementById("scripturesModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalDescription = document.getElementById("modalDescription");
  const modalReferences = document.getElementById("modalReferences");
  const closeModal = document.getElementById("closeModal");

  let allScriptures = [];

  try {
    const response = await fetch("assets/data/scriptures.json");
    allScriptures = await response.json();
    renderScriptures(allScriptures);

    // Handle deep linking if hash exists
    if (window.location.hash) {
      const targetId = window.location.hash.substring(1);
      const targetScripture = allScriptures.find(s => s.id === targetId);
      if (targetScripture) openModal(targetScripture);
    }
  } catch (err) {
    console.error("Failed to load scriptures data:", err);
    grid.innerHTML = "<p>⚠ Unable to load scriptures data.</p>";
  }

  // Render scriptures to grid
  function renderScriptures(list) {
    grid.innerHTML = "";
    if (!list.length) {
      grid.innerHTML = `<p style="text-align:center;margin-top:20px;">No scriptures found.</p>`;
      return;
    }

    list.forEach(scripture => {
      const card = document.createElement("div");
      card.className = "festival-card";
      card.dataset.scripture = scripture.id;

      card.innerHTML = `
        <h3>${scripture.title}</h3>
        <p>${scripture.short}</p>
      `;

      grid.appendChild(card);

      // Click card to open modal
      card.addEventListener("click", () => openModal(scripture));
    });
  }

  // Open modal and show details
  function openModal(scripture) {
    modalTitle.textContent = scripture.title;
    modalDescription.textContent = scripture.description;

    modalReferences.innerHTML = scripture.references?.length
      ? `<h4>References:</h4><ul>${scripture.references.map(r => 
          r.url 
            ? `<li><a href="${r.url}" target="_blank" class="ref-link">${r.text}</a></li>` 
            : `<li>${r.text}</li>`
        ).join("")}</ul>`
      : "";

    // Share links
    const shareDiv = document.getElementById("scriptureShare");
    const pageUrl = window.location.origin + window.location.pathname + "#" + scripture.id;
    const shareText = encodeURIComponent(`${scripture.title} - ${scripture.short} (${pageUrl})`);

    shareDiv.innerHTML = `
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
    window.location.hash = scripture.id;
  }

  // Close modal
  closeModal.addEventListener("click", () => closeModalFn());
  window.addEventListener("click", e => { if (e.target === modal) closeModalFn(); });

  function closeModalFn() {
    modal.style.display = "none";
    history.replaceState(null, "", window.location.pathname); // clear hash
  }
});
