document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.querySelector(".festival-grid");
  const modal = document.getElementById("festivalModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalImage = document.getElementById("modalImage");
  const modalDescription = document.getElementById("modalDescription");
  const closeModal = document.getElementById("closeModal");

  try {
    const response = await fetch("assets/data/festivals.json");
    const festivals = await response.json();

    // Populate Festival Cards Dynamically
    festivals.forEach(festival => {
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
        modal.style.display = "flex";
      });
    });
  } catch (err) {
    console.error("Failed to load festival data:", err);
    grid.innerHTML = "<p>⚠ Unable to load festival data.</p>";
  }

  // Close Modal
  closeModal.addEventListener("click", () => modal.style.display = "none");
  window.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });
});
