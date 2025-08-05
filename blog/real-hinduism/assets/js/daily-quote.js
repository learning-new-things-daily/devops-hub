document.addEventListener("DOMContentLoaded", async () => {
  const quoteElem = document.getElementById("daily-quote");

  try {
    const response = await fetch("assets/data/quotes.json");
    const quotes = await response.json();

    if (quotes.length > 0) {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      quoteElem.innerHTML = `
        "${randomQuote.quote_en}"<br>
        <span style="color:#555; font-style:italic;">${randomQuote.quote_hi}</span><br>
        <span style="font-size:0.9em; color:#666;">— ${randomQuote.reference}</span>
      `;
    } else {
      quoteElem.textContent = "⚠ No quotes available.";
    }
  } catch (err) {
    console.error("Failed to load quotes:", err);
    quoteElem.textContent = "⚠ Unable to load the daily quote.";
  }
});
