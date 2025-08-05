document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.querySelector(".scriptures-grid");
  const modal = document.getElementById("scripturesModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalDescription = document.getElementById("modalDescription");
  const closeModal = document.getElementById("closeModal");

  try {
    const response = await fetch("assets/data/scriptures.json");
    const scriptures = await response.json();

    scriptures.forEach(text => {
      const card = document.createElement("div");
      card.className = "festival-card"; // reuse card style
      card.dataset.scripture = text.id;
      card.innerHTML = `
        <h3>${text.title}</h3>
        <p>${text.short}</p>
      `;
      grid.appendChild(card);

      // Modal open on click
      card.addEventListener("click", () => {
        modalTitle.textContent = text.title;
        modalDescription.textContent = text.description;
        modal.style.display = "flex";
      });
    });
  } catch (err) {
    console.error("Failed to load scriptures data:", err);
    grid.innerHTML = "<p>⚠ Unable to load scriptures data.</p>";
  }

  // Close modal
  closeModal.addEventListener("click", () => modal.style.display = "none");
  window.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });
});
