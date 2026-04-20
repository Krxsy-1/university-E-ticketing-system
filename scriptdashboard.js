// Hide loader when page fully loads
    window.addEventListener('load', () => {
        const loader = document.getElementById('loaderOverlay');
        if (loader) {
            loader.classList.add('hidden');
        }
    });

    // Dark mode toggle - synced across pages
    const toggle = document.getElementById("darkToggle");
    const body = document.body;

    function applyTheme(theme) {
      if (theme === "dark") {
        body.classList.add("dark");
        if (toggle) toggle.checked = true;
      } else {
        body.classList.remove("dark");
        if (toggle) toggle.checked = false;
      }
    }

    const savedTheme = localStorage.getItem("unitickets-theme");
    applyTheme(savedTheme || "light");

    if (toggle) {
      toggle.addEventListener("change", () => {
        const newTheme = toggle.checked ? "dark" : "light";
        applyTheme(newTheme);
        localStorage.setItem("unitickets-theme", newTheme);
      });
    }

    // Theme toggle
    const themeToggle = document.getElementById("themeToggle");
    const themeToggleSecondary = document.getElementById("themeToggleSecondary");

    function syncThemeIcon() {
      const icon = themeToggle?.querySelector("i");
      if (icon) {
        if (body.classList.contains("dark")) {
          icon.classList.remove("fa-moon");
          icon.classList.add("fa-sun");
        } else {
          icon.classList.remove("fa-sun");
          icon.classList.add("fa-moon");
        }
      }
    }

    function toggleTheme() {
      body.classList.toggle("dark");
      const newTheme = body.classList.contains("dark") ? "dark" : "light";
      localStorage.setItem("unitickets-theme", newTheme);
      syncThemeIcon();
      if (toggle) toggle.checked = body.classList.contains("dark");
    }

    if (themeToggle) themeToggle.addEventListener("click", toggleTheme);
    if (themeToggleSecondary) themeToggleSecondary.addEventListener("click", toggleTheme);

    syncThemeIcon();

    // Search clear
    const searchInput = document.getElementById("searchInput");
    const searchClear = document.getElementById("searchClear");

    if (searchClear) {
      searchClear.addEventListener("click", () => {
        searchInput.value = "";
        searchInput.focus();
      });
    }
    // Make Buy Ticket buttons navigate to buyTicket.html with event details
    (function () {
      function attachBuyHandlers() {
        const buyButtons = document.querySelectorAll('.event-actions .btn-primary, .event-actions .btn');
        buyButtons.forEach(btn => {
          btn.addEventListener('click', (e) => {
            const card = e.target.closest('.event-card');
            if (!card) return;
            const title = card.querySelector('.event-title')?.innerText.trim() || 'Event';
            const price = card.querySelector('.event-price-main')?.innerText.trim() || '';
            const href = `buyTicket.html?event=${encodeURIComponent(title)}&price=${encodeURIComponent(price)}`;
            // navigate to buy page
            window.location.href = href;
          });
        });
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachBuyHandlers);
      } else {
        attachBuyHandlers();
      }
    })();