document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.querySelector(".philosophy-grid");
  const modal = document.getElementById("philosophyModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalDescription = document.getElementById("modalDescription");
  const closeModal = document.getElementById("closeModal");

  try {
    const response = await fetch("assets/data/philosophy.json");
    const schools = await response.json();

    schools.forEach(school => {
      const card = document.createElement("div");
      card.className = "festival-card"; // reuse card style
      card.dataset.school = school.id;
      card.innerHTML = `
        <h3>${school.title}</h3>
        <p>${school.short}</p>
      `;
      grid.appendChild(card);

      // Modal open on click
      card.addEventListener("click", () => {
        modalTitle.textContent = school.title;
        modalDescription.textContent = school.description;
        modal.style.display = "flex";
      });
    });
  } catch (err) {
    console.error("Failed to load philosophy data:", err);
    grid.innerHTML = "<p>⚠ Unable to load philosophy data.</p>";
  }

  // Close modal
  closeModal.addEventListener("click", () => modal.style.display = "none");
  window.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });
});
