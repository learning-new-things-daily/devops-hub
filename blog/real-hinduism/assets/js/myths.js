document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.querySelector(".myths-grid");
  const modal = document.getElementById("mythModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalDescription = document.getElementById("modalDescription");
  const closeModal = document.getElementById("closeModal");

  try {
    const response = await fetch("assets/data/myths.json");
    const myths = await response.json();

    myths.forEach(myth => {
      const card = document.createElement("div");
      card.className = "festival-card"; // reuse same style
      card.dataset.myth = myth.id;
      card.innerHTML = `
        <h3>${myth.title}</h3>
        <p>${myth.short}</p>
      `;
      grid.appendChild(card);

      card.addEventListener("click", () => {
        modalTitle.textContent = myth.title;
        modalDescription.textContent = myth.description;
        modal.style.display = "flex";
      });
    });
  } catch (err) {
    console.error("Failed to load myths data:", err);
    grid.innerHTML = "<p>⚠ Unable to load myths data.</p>";
  }

  // Close modal
  closeModal.addEventListener("click", () => modal.style.display = "none");
  window.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });
});
