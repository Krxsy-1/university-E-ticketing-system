/**
 * Administrator Dashboard Script
 * Manages events, students, and system settings
 * Integrates with EventManager for data persistence
 */

// Initialize EventManager
// Use the shared EventManager instance created in eventManager.js
// (no re-instantiation here to avoid duplicate declarations)

// ===== THEME MANAGEMENT =====
const themeToggle = document.getElementById("themeToggle");
const settingsDarkToggle = document.getElementById("settingsDarkToggle");
const body = document.body;

function applyTheme(theme) {
    if (theme === "dark") {
        body.classList.add("dark");
        if (themeToggle?.querySelector("i")) {
            themeToggle.querySelector("i").classList.remove("fa-moon");
            themeToggle.querySelector("i").classList.add("fa-sun");
        }
        if (settingsDarkToggle) settingsDarkToggle.checked = true;
    } else {
        body.classList.remove("dark");
        if (themeToggle?.querySelector("i")) {
            themeToggle.querySelector("i").classList.remove("fa-sun");
            themeToggle.querySelector("i").classList.add("fa-moon");
        }
        if (settingsDarkToggle) settingsDarkToggle.checked = false;
    }
}

const savedTheme = localStorage.getItem("unitickets-theme");
applyTheme(savedTheme || "light");

function toggleTheme() {
    body.classList.toggle("dark");
    const newTheme = body.classList.contains("dark") ? "dark" : "light";
    localStorage.setItem("unitickets-theme", newTheme);
    applyTheme(newTheme);
}

if (themeToggle) themeToggle.addEventListener("click", toggleTheme);
if (settingsDarkToggle) settingsDarkToggle.addEventListener("change", toggleTheme);

// Hide loader when page fully loads
window.addEventListener('load', () => {
    const loader = document.getElementById('loaderOverlay');
    if (loader) {
        loader.classList.add('hidden');
    }
});

// ===== STATISTICS MANAGEMENT =====
function updateStatistics() {
    const stats = eventManager.getStatistics();
    const events = eventManager.getAllEvents();
    const activeStudents = events.reduce((sum, e) => sum + Math.ceil(e.soldTickets * 0.7), 0);

    document.getElementById("totalEvents").textContent = stats.activeEvents;
    document.getElementById("totalTickets").textContent = stats.totalTickets.toLocaleString();
    document.getElementById("totalRevenue").textContent = stats.revenue;
    document.getElementById("activeStudents").textContent = Math.min(activeStudents, 847);
}

updateStatistics();

// ===== EVENTS MANAGEMENT =====
let currentEditingEventId = null;
let eventImageData = null; // base64 data URL or existing image path

function renderEvents() {
    const tbody = document.getElementById("eventsTableBody");
    const events = eventManager.getAllEvents();

    if (events.length === 0) {
        tbody.innerHTML = '<div class="table-row"><div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 20px;">No events yet. Create one to get started!</div></div>';
        return;
    }

    tbody.innerHTML = events.map(event => `
        <div class="table-row">
            <div class="event-name">
                ${event.name}
                <div class="event-date">${event.date} at ${event.time}</div>
            </div>
            <div class="event-date">${event.date}</div>
            <div class="ticket-sold">
                <i class="fa-solid fa-ticket"></i> 
                ${event.soldTickets}/${event.maxTickets}
            </div>
            <div class="price-tag">
                ${event.price === 0 ? 'Free' : '₦' + event.price.toLocaleString()}
            </div>
            <div class="action-buttons">
                <button class="icon-btn" onclick="editEvent(${event.id})" title="Edit">
                    <i class="fa-solid fa-edit"></i>
                </button>
                <button class="icon-btn" onclick="toggleEventStatus(${event.id})" title="${event.status === 'active' ? 'Deactivate' : 'Activate'}">
                    <i class="fa-solid fa-${event.status === 'active' ? 'eye-slash' : 'eye'}"></i>
                </button>
                <button class="icon-btn" onclick="deleteEvent(${event.id})" title="Delete" style="color: #ef4444;">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    `).join("");
}

// ===== MODAL MANAGEMENT =====
const modal = document.getElementById("eventModal");
const createBtn = document.getElementById("createEventBtn");
const modalClose = document.getElementById("modalClose");
const modalCancel = document.getElementById("modalCancel");
const eventForm = document.getElementById("eventForm");

function openCreateModal() {
    currentEditingEventId = null;
    document.getElementById("modalTitle").innerText = "Create New Event";
    eventForm.reset();
    // reset image preview
    eventImageData = null;
    const preview = document.getElementById('eventImagePreview');
    const input = document.getElementById('eventImageInput');
    if (preview) { preview.src = ''; preview.style.display = 'none'; }
    if (input) input.value = '';
    modal.classList.add("active");
}

function openEditModal(id) {
    const event = eventManager.getEventById(id);
    if (!event) return;

    currentEditingEventId = id;
    document.getElementById("modalTitle").innerText = "Edit Event";
    document.getElementById("eventName").value = event.name;
    document.getElementById("eventDate").value = event.date;
    document.getElementById("eventTime").value = event.time;
    document.getElementById("eventLocation").value = event.location;
    document.getElementById("eventDescription").value = event.description;
    document.getElementById("eventPrice").value = event.price;
    document.getElementById("eventMaxTickets").value = event.maxTickets;
    document.getElementById("eventCategory").value = event.category;
    // populate image preview
    eventImageData = event.image || null;
    const preview = document.getElementById('eventImagePreview');
    if (preview && eventImageData) { preview.src = eventImageData; preview.style.display = 'block'; }
    modal.classList.add("active");
}

function closeModal() {
    modal.classList.remove("active");
    currentEditingEventId = null;
}

createBtn.addEventListener("click", openCreateModal);
modalClose.addEventListener("click", closeModal);
modalCancel.addEventListener("click", closeModal);

modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
});

// Image input handler
const imageInput = document.getElementById('eventImageInput');
const imagePreview = document.getElementById('eventImagePreview');
if (imageInput) {
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) {
            eventImageData = null;
            if (imagePreview) { imagePreview.src = ''; imagePreview.style.display = 'none'; }
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            eventImageData = reader.result;
            if (imagePreview) { imagePreview.src = eventImageData; imagePreview.style.display = 'block'; }
        };
        reader.readAsDataURL(file);
    });
}

// ===== EVENT FORM SUBMISSION =====
eventForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const eventData = {
        name: document.getElementById("eventName").value.trim(),
        date: document.getElementById("eventDate").value,
        time: document.getElementById("eventTime").value,
        location: document.getElementById("eventLocation").value.trim(),
        description: document.getElementById("eventDescription").value.trim(),
        price: parseInt(document.getElementById("eventPrice").value) || 0,
        maxTickets: parseInt(document.getElementById("eventMaxTickets").value),
        category: document.getElementById("eventCategory").value,
        image: eventImageData || "/images/event-default.jpeg"
    };

    // Validation
    if (!eventData.name || !eventData.date || !eventData.time || !eventData.location || !eventData.maxTickets) {
        alert("Please fill in all required fields.");
        return;
    }

    if (eventData.maxTickets < 1) {
        alert("Max tickets must be at least 1.");
        return;
    }

    try {
        if (currentEditingEventId) {
            eventManager.updateEvent(currentEditingEventId, eventData);
            alert("Event updated successfully!");
        } else {
            eventManager.createEvent(eventData);
            alert("Event created successfully!");
        }
        
        renderEvents();
        updateStatistics();
        closeModal();
    } catch (error) {
        alert("Error saving event: " + error.message);
    }
});

function editEvent(id) {
    openEditModal(id);
}

function toggleEventStatus(id) {
    const event = eventManager.getEventById(id);
    if (event) {
        const newStatus = event.status === 'active' ? 'inactive' : 'active';
        eventManager.updateEvent(id, { status: newStatus });
        renderEvents();
        alert(`Event ${newStatus === 'active' ? 'activated' : 'deactivated'}!`);
    }
}

function deleteEvent(id) {
    if (confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
        eventManager.deleteEvent(id);
        renderEvents();
        updateStatistics();
        alert("Event deleted successfully!");
    }
}

// ===== TAB SWITCHING =====
document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const tabName = btn.getAttribute("data-tab");
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById(tabName + "-tab").classList.add("active");
    });
});

// ===== STUDENT DATA =====
const studentData = [
    { id: 1, name: "Kristen Osheku", matric: "201109012", email: "kristen@university.edu", tickets: 3, spent: 9500, eventsBought: ["Tech Innovation Night", "Literary & Arts Night", "Campus Live Concert"] },
    { id: 2, name: "Chioma Ibrahim", matric: "201110045", email: "chioma@university.edu", tickets: 2, spent: 8000, eventsBought: ["Campus Live Concert", "Literary & Arts Night"] },
    { id: 3, name: "Morayo Bakare", matric: "201108932", email: "morayo@university.edu", tickets: 1, spent: 5000, eventsBought: ["Campus Live Concert"] },
    { id: 4, name: "Zainab Ahmed", matric: "201109567", email: "zainab@university.edu", tickets: 4, spent: 13500, eventsBought: ["Tech Innovation Night", "Literary & Arts Night", "Campus Live Concert", "Career & Internship Fair"] },
    { id: 5, name: "Emeka Okoro", matric: "201111234", email: "emeka@university.edu", tickets: 2, spent: 6500, eventsBought: ["Tech Innovation Night", "Career & Internship Fair"] }
];

function renderStudents(data = studentData) {
    const list = document.getElementById("studentsList");
    
    if (data.length === 0) {
        list.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-muted);">No students found.</div>';
        return;
    }

    list.innerHTML = data.map(student => `
        <div class="student-item">
            <div class="student-info">
                <div class="student-avatar">${student.name.split(' ').map(n => n[0]).join('')}</div>
                <div class="student-details">
                    <h4>${student.name}</h4>
                    <p>${student.matric} • ${student.email}</p>
                    <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Events: ${student.eventsBought.join(', ')}</p>
                </div>
            </div>
            <div style="text-align: right;">
                <p style="font-weight: 600; color: var(--accent);">${student.tickets} tickets</p>
                <p style="font-size: 12px; color: var(--text-muted);">₦${student.spent.toLocaleString()} spent</p>
            </div>
        </div>
    `).join("");
}

renderStudents();
renderEvents();

// ===== STUDENT SEARCH =====
const studentSearch = document.getElementById("studentSearch");
if (studentSearch) {
    studentSearch.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = studentData.filter(s =>
            s.name.toLowerCase().includes(query) ||
            s.matric.toLowerCase().includes(query) ||
            s.email.toLowerCase().includes(query)
        );
        renderStudents(filtered);
    });
}

// ===== REFRESH BUTTON =====
document.getElementById("refreshBtn").addEventListener("click", () => {
    renderEvents();
    updateStatistics();
    alert("Dashboard refreshed!");
});

// ===== LISTEN FOR EXTERNAL EVENTS UPDATES =====
window.addEventListener('eventsUpdated', () => {
    renderEvents();
    updateStatistics();
});