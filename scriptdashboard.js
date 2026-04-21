/**
 * Student Dashboard Script
 * Displays events from EventManager (synced with Admin dashboard)
 */

// Initialize EventManager
// Use the shared EventManager instance created in eventManager.js
// (no re-instantiation here to avoid duplicate declarations)

// ===== THEME MANAGEMENT =====
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

// Hide loader when page fully loads
window.addEventListener('load', () => {
    const loader = document.getElementById('loaderOverlay');
    if (loader) {
        loader.classList.add('hidden');
    }
});

// The sidebar Menu
const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menuBtn");
const closeBtn = document.getElementById("closeBtn");

if (menuBtn && sidebar) {
    menuBtn.addEventListener("click", () => {
        sidebar.classList.add("active");
    });
}

if (closeBtn && sidebar) {
    closeBtn.addEventListener("click", () => {
        sidebar.classList.remove("active");
    });
}

// event rendering
function renderEventsGrid() {
    const eventsGrid = document.querySelector('.events-grid');
    const events = eventManager.getActiveEvents(); // Only show active events to students

    if (!eventsGrid) return;

    if (events.length === 0) {
        eventsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);"><p>No events available at the moment.</p></div>';
        return;
    }

    eventsGrid.innerHTML = events.map(event => {
        const ticketsRemaining = event.maxTickets - event.soldTickets;
        const isAlmostFull = ticketsRemaining < 10;

        return `
            <article class="event-card">
                <div class="event-banner">
                    <img src="${event.image}" alt="${event.name}">
                    <div class="event-tag">
                        <i class="fa-solid fa-${isAlmostFull ? 'fire' : 'bolt'}"></i>
                        ${isAlmostFull ? 'Almost Full' : 'Featured'}
                    </div>
                </div>

                <div class="event-details">
                    <div class="event-date-time">
                        <i class="fa-solid fa-calendar"></i>
                        ${event.date} <span style="margin: 0 8px;">•</span> ${event.time}
                    </div>

                    <h3 class="event-title">${event.name}</h3>

                    <div class="event-info">
                        <span>
                            <i class="fa-solid fa-location-dot"></i>
                            ${event.location}
                        </span>
                        <span>
                            <i class="fa-solid fa-users"></i>
                            ${event.soldTickets}/${event.maxTickets} going
                        </span>
                    </div>

                    <div class="event-footer">
                        <span class="event-price">${event.price === 0 ? 'Free' : '₦' + event.price.toLocaleString()}</span>
                        <button class="btn btn-primary" onclick="navigateToBuyTicket('${event.name}', ${event.price})">
                            <i class="fa-solid fa-ticket"></i>
                            Buy Ticket
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}

// Search
function setupSearch() {
    const searchInput = document.getElementById("searchInput");
    const searchClear = document.getElementById("searchClear");

    if (!searchInput) return;

    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.trim();
        
        if (query) {
            searchClear.style.display = "block";
            const results = eventManager.searchEvents(query);
            
            const eventsGrid = document.querySelector('.events-grid');
            if (eventsGrid) {
                if (results.length === 0) {
                    eventsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);"><p>No events match your search.</p></div>';
                } else {
                    eventsGrid.innerHTML = results.map(event => {
                        const ticketsRemaining = event.maxTickets - event.soldTickets;
                        const isAlmostFull = ticketsRemaining < 10;

                        return `
                            <article class="event-card">
                                <div class="event-banner">
                                    <img src="${event.image}" alt="${event.name}">
                                    <div class="event-tag">
                                        <i class="fa-solid fa-${isAlmostFull ? 'fire' : 'bolt'}"></i>
                                        ${isAlmostFull ? 'Almost Full' : 'Featured'}
                                    </div>
                                </div>

                                <div class="event-details">
                                    <div class="event-date-time">
                                        <i class="fa-solid fa-calendar"></i>
                                        ${event.date} <span style="margin: 0 8px;">•</span> ${event.time}
                                    </div>

                                    <h3 class="event-title">${event.name}</h3>

                                    <div class="event-info">
                                        <span>
                                            <i class="fa-solid fa-location-dot"></i>
                                            ${event.location}
                                        </span>
                                        <span>
                                            <i class="fa-solid fa-users"></i>
                                            ${event.soldTickets}/${event.maxTickets} going
                                        </span>
                                    </div>

                                    <div class="event-footer">
                                        <span class="event-price">${event.price === 0 ? 'Free' : '₦' + event.price.toLocaleString()}</span>
                                        <button class="btn btn-primary" onclick="navigateToBuyTicket('${event.name}', ${event.price})">
                                            <i class="fa-solid fa-ticket"></i>
                                            Buy Ticket
                                        </button>
                                    </div>
                                </div>
                            </article>
                        `;
                    }).join("");
                }
            }
        } else {
            searchClear.style.display = "none";
            renderEventsGrid();
        }
    });

    if (searchClear) {
        searchClear.addEventListener("click", () => {
            searchInput.value = "";
            searchClear.style.display = "none";
            renderEventsGrid();
        });
    }
}

// nav
function navigateToBuyTicket(eventTitle, eventPrice) {
    const event = eventManager.getActiveEvents().find(e => e.name === eventTitle);
    if (event) {
        window.location.href = `buyTicket.html?title=${encodeURIComponent(event.name)}&price=${event.price}`;
    }
}

// ===== INITIALIZATION =====
renderEventsGrid();
setupSearch();

// ===== LISTEN FOR ADMIN UPDATES =====
// When admin creates/edits/deletes events, the student dashboard will auto-update
window.addEventListener('eventsUpdated', () => {
    console.log("Events updated by admin, refreshing dashboard...");
    renderEventsGrid();
});