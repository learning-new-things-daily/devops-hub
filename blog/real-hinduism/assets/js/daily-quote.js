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
      const shareText = `${randomQuote.quote_en} — ${randomQuote.reference}`;
      const shareUrl = window.location.href;

      // Share buttons functionality
      shareCopy.onclick = () => {
        navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
          .then(() => alert("✅ Quote link copied to clipboard!"));
      };

      shareWhatsApp.href = `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`;
      shareTwitter.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
      shareFacebook.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
      shareTelegram.href = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;

    } else {
      quoteElem.textContent = "⚠ No quotes available.";
    }
  } catch (err) {
    console.error("Failed to load quotes:", err);
    quoteElem.textContent = "⚠ Unable to load the daily quote.";
  }
});
