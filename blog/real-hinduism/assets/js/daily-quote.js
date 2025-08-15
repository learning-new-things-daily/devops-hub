document.addEventListener("DOMContentLoaded", async () => {
  const quoteElem = document.getElementById("daily-quote");

  // Share button elements
  const shareCopy = document.getElementById("shareCopy");
  const shareWhatsApp = document.getElementById("shareWhatsApp");
  const shareTwitter = document.getElementById("shareTwitter");
  const shareFacebook = document.getElementById("shareFacebook");
  const shareTelegram = document.getElementById("shareTelegram");

  try {
    const response = await fetch("assets/data/quotes.json");
    const quotes = await response.json();

    if (quotes.length > 0) {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

      const quoteHTML = `
        "${randomQuote.quote_en}"<br>
        <span style="color:#555; font-style:italic;">${randomQuote.quote_hi}</span><br>
        <span style="font-size:0.9em; color:#666;">— ${randomQuote.reference}</span>
      `;
      quoteElem.innerHTML = quoteHTML;

      // Prepare share text and URL
      const quoteText = quoteElem.textContent;
      const pageUrl = window.location.origin + window.location.pathname;
      const shareText = encodeURIComponent(`${quoteText} (${pageUrl})`);

      // Share buttons functionality
      shareCopy.onclick = () => {
        navigator.clipboard.writeText(pageUrl)
          .then(() => alert("✅ Quote link copied to clipboard!"));
      };

      shareWhatsApp.href = `https://wa.me/?text=${shareText}`;
      shareTwitter.href = `https://twitter.com/intent/tweet?text=${shareText}`;
      shareFacebook.href = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
      shareTelegram.href = `https://t.me/share/url?url=${pageUrl}&text=${shareText}`;

    } else {
      quoteElem.textContent = "⚠ No quotes available.";
    }
  } catch (err) {
    console.error("Failed to load quotes:", err);
    quoteElem.textContent = "⚠ Unable to load the daily quote.";
  }
});
