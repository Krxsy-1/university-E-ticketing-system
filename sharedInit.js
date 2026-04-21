/**
 * Shared Initialization Script
 * Must be loaded BEFORE scriptdashboard.js and scriptAdministrator.js
 * Initializes the eventManager singleton and other shared utilities
 */

// Initialize EventManager globally (only once)
if (typeof eventManager === 'undefined') {
    var eventManager = new EventManager();
}
