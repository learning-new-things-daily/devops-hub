document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.querySelector(".festival-grid");
  const modal = document.getElementById("festivalModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalImage = document.getElementById("modalImage");
  const modalDescription = document.getElementById("modalDescription");
  const closeModal = document.getElementById("closeModal");
  const searchInput = document.getElementById("festival-search");

  let festivals = []; // Declare festivals array in a higher scope

  try {
    const response = await fetch("assets/data/festivals.json");
    festivals = await response.json();

    // Populate Festival Cards Dynamically
    const renderFestivals = (festivalsToRender) => {
      grid.innerHTML = ""; // Clear existing cards
      festivalsToRender.forEach(festival => {
        const card = document.createElement("div");
        card.className = "festival-card";
        card.dataset.festival = festival.id;
        card.innerHTML = `
          <img src="${festival.image}" alt="${festival.title}">
          <h3>${festival.title.split("–")[0]}</h3>
          <div class="festival-date">${festival.date}</div>
          <p>${festival.short}</p>
        `;
        grid.appendChild(card);

        // Card Click → Open Modal
        card.addEventListener("click", () => {
          modalTitle.textContent = festival.title;
          modalImage.src = festival.image;
          modalDescription.textContent = festival.description;

          // Share buttons
          const shareDiv = document.getElementById("festivalShare");
          const pageUrl = window.location.origin + window.location.pathname + "#" + festival.id;
          const shareText = encodeURIComponent(`${festival.title} - ${festival.short || ""} (${pageUrl})`);
          shareDiv.innerHTML = `
            <h4>Share this festival:</h4>
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
        });
      });
    };

    renderFestivals(festivals); // Initial render

    // Search functionality
    searchInput.addEventListener("input", function() {
      const query = this.value.trim().toLowerCase();
      const filtered = festivals.filter(f =>
        f.title.toLowerCase().includes(query) ||
        (f.short && f.short.toLowerCase().includes(query)) ||
        (f.description && f.description.toLowerCase().includes(query))
      );
      renderFestivals(filtered); // Re-render with filtered results
    });
  } catch (err) {
    console.error("Failed to load festival data:", err);
    grid.innerHTML = "<p>⚠ Unable to load festival data.</p>";
  }

  // Close Modal
  closeModal.addEventListener("click", () => modal.style.display = "none");
  window.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });
});
