document.addEventListener("DOMContentLoaded", () => {
  // === Daily Gita Quotes ===
  const quotes = [
    "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। (BG 2.47) – You have the right to perform your duties, but not to the fruits thereof.",
    "न जायते म्रियते वा कदाचिन्नायं भूत्वा भविता वा न भूयः। (BG 2.20) – The soul is never born, nor does it ever die.",
    "ज्ञानेन तु तदज्ञानं येषां नाशितमात्मनः। (BG 4.39) – Through knowledge, ignorance is destroyed for the self.",
    "यत्र योगेश्वरः कृष्णो यत्र पार्थो धनुर्धरः। (BG 18.78) – Where Krishna and Arjuna are present, there is victory.",
    "असंगशस्त्रेण दृढेन छित्त्वा। (BG 15.3) – Cut the attachment with the strong sword of detachment.",
    "उद्धरेदात्मनात्मानं नात्मानमवसादयेत्। (BG 6.5) – Elevate yourself by your own mind; do not degrade yourself."
  ];

  const quoteElem = document.getElementById('daily-quote');
  if (quoteElem) {
    // === DAILY PERSISTENCE LOGIC ===
    const today = new Date().toDateString(); 
    let savedQuote = localStorage.getItem("dailyQuote");
    const savedDate = localStorage.getItem("dailyQuoteDate");

    if (!savedQuote || savedDate !== today) {
      savedQuote = quotes[Math.floor(Math.random() * quotes.length)];
      localStorage.setItem("dailyQuote", savedQuote);
      localStorage.setItem("dailyQuoteDate", today);
    }

    // Show the saved quote initially
    quoteElem.textContent = savedQuote;

    // === AUTO ROTATION WITH FADE ANIMATION ===
    let currentIndex = Math.floor(Math.random() * quotes.length);

    setInterval(() => {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * quotes.length);
      } while (newIndex === currentIndex);
      currentIndex = newIndex;

      // Fade-out, change text, then fade-in
      quoteElem.classList.add("fade-out");
      setTimeout(() => {
        quoteElem.textContent = quotes[currentIndex];
        quoteElem.classList.remove("fade-out");
      }, 1000); // Match the transition duration
    }, 30000); // Change quote every 30s
  }

  // === Mobile Menu Toggle ===
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  if(menuToggle && navLinks){
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('show');
    });
  }

  // === Simple Search Feature (on homepage only) ===
  const searchInput = document.getElementById('site-search');
  if(searchInput){
    searchInput.addEventListener('keyup', e => {
      let keyword = e.target.value.toLowerCase();
      document.querySelectorAll('section.content, section.features div.feature').forEach(sec => {
        sec.style.display = sec.textContent.toLowerCase().includes(keyword) ? '' : 'none';
      });
    });
  }

  // === Highlight Active Nav Link ===
  document.querySelectorAll('#nav-links a').forEach(link => {
    if (window.location.pathname.endsWith(link.getAttribute('href'))) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
});
