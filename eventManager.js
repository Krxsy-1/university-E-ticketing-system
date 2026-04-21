/**
 * Event Manager - Shared data system between Admin and Student dashboards
 * Uses localStorage to persist events and sync across pages
 */

class EventManager {
    constructor() {
        this.storageKey = 'unitickets-events';
        this.initializeDefaultEvents();
    }

    // Initialize with default events if none exist
    initializeDefaultEvents() {
        const existingEvents = this.getAllEvents();
        if (existingEvents.length === 0) {
            const defaultEvents = [
                {
                    id: 1,
                    name: "Tech Innovation Night",
                    date: "2026-03-13",
                    time: "18:00",
                    location: "PFA Main Auditorium",
                    description: "Join us for an evening celebrating cutting-edge technology and innovation.",
                    price: 3000,
                    maxTickets: 300,
                    soldTickets: 145,
                    category: "academic",
                    image: "/images/image1.jpeg",
                    status: "active"
                },
                {
                    id: 2,
                    name: "Literary & Arts Night",
                    date: "2026-03-14",
                    time: "16:30",
                    location: "Law Auditorium",
                    description: "Experience poetry, storytelling, and visual art from talented campus artists.",
                    price: 1500,
                    maxTickets: 200,
                    soldTickets: 78,
                    category: "social",
                    image: "/images/image2.jpeg",
                    status: "active"
                },
                {
                    id: 3,
                    name: "Campus Live Concert",
                    date: "2026-03-15",
                    time: "19:30",
                    location: "Sports Complex",
                    description: "An electrifying live music performance featuring popular campus bands.",
                    price: 5000,
                    maxTickets: 500,
                    soldTickets: 287,
                    category: "music",
                    image: "/images/image3.jpeg",
                    status: "active"
                },
                {
                    id: 4,
                    name: "Career & Internship Fair",
                    date: "2026-03-18",
                    time: "10:00",
                    location: "PFA Main Auditorium",
                    description: "Connect with top companies and explore career opportunities.",
                    price: 0,
                    maxTickets: 1000,
                    soldTickets: 432,
                    category: "career",
                    image: "/images/image4.jpeg",
                    status: "active"
                }
            ];
            this.saveEvents(defaultEvents);
        }
    }

    // Get all events from localStorage
    getAllEvents() {
        try {
            const events = localStorage.getItem(this.storageKey);
            return events ? JSON.parse(events) : [];
        } catch (error) {
            console.error("Error reading events:", error);
            return [];
        }
    }

    // Get active events only (for student dashboard)
    getActiveEvents() {
        return this.getAllEvents().filter(event => event.status === 'active');
    }

    // Get event by ID
    getEventById(id) {
        return this.getAllEvents().find(event => event.id === id);
    }

    // Save events to localStorage
    saveEvents(events) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(events));
            // Trigger custom event to notify all pages of changes
            window.dispatchEvent(new CustomEvent('eventsUpdated', { detail: { events } }));
        } catch (error) {
            console.error("Error saving events:", error);
        }
    }

    // Create new event
    createEvent(eventData) {
        const events = this.getAllEvents();
        const newEvent = {
            id: Math.max(...events.map(e => e.id), 0) + 1,
            ...eventData,
            soldTickets: 0,
            status: 'active',
            createdAt: new Date().toISOString()
        };
        events.push(newEvent);
        this.saveEvents(events);
        return newEvent;
    }

    // Update existing event
    updateEvent(id, eventData) {
        const events = this.getAllEvents();
        const index = events.findIndex(e => e.id === id);
        if (index !== -1) {
            events[index] = { ...events[index], ...eventData, updatedAt: new Date().toISOString() };
            this.saveEvents(events);
            return events[index];
        }
        return null;
    }

    // Delete event
    deleteEvent(id) {
        const events = this.getAllEvents();
        const filtered = events.filter(e => e.id !== id);
        this.saveEvents(filtered);
        return true;
    }

    // Toggle event status (active/inactive)
    toggleEventStatus(id) {
        const event = this.getEventById(id);
        if (event) {
            const newStatus = event.status === 'active' ? 'inactive' : 'active';
            return this.updateEvent(id, { status: newStatus });
        }
        return null;
    }

    // Update ticket count
    updateTicketCount(id, newCount) {
        return this.updateEvent(id, { soldTickets: newCount });
    }

    // Get stats
    getStatistics() {
        const events = this.getAllEvents();
        const activeEvents = events.filter(e => e.status === 'active');
        const totalTickets = events.reduce((sum, e) => sum + e.soldTickets, 0);
        const totalRevenue = events.reduce((sum, e) => sum + (e.soldTickets * e.price), 0);

        return {
            totalEvents: events.length,
            activeEvents: activeEvents.length,
            totalTickets,
            totalRevenue,
            revenue: `₦${(totalRevenue / 1000000).toFixed(1)}M`
        };
    }

    // Search events
    searchEvents(query) {
        const events = this.getActiveEvents();
        const lowerQuery = query.toLowerCase();
        return events.filter(event =>
            event.name.toLowerCase().includes(lowerQuery) ||
            event.location.toLowerCase().includes(lowerQuery) ||
            event.description.toLowerCase().includes(lowerQuery) ||
            event.category.toLowerCase().includes(lowerQuery)
        );
    }
}

// Create global instance
const eventManager = new EventManager();
