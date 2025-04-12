// js/core/ui-core.js
// Handles common UI interactions like tabs, section toggles, and notifications.

/**
 * Initializes tab switching functionality.
 */
export function initTabs() {
    const tabContainer = document.querySelector('.tab-container');
    if (!tabContainer) return;

    const tabButtons = tabContainer.querySelectorAll('.tab-nav .tab-button');
    const tabContents = tabContainer.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTabId = button.getAttribute('data-tab');

            // Update button states
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Update content visibility
            tabContents.forEach(content => {
                if (content.id === targetTabId) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    });
    console.log("Tabs initialized.");
}

/**
 * Initializes collapsible section functionality.
 */
export function initSectionToggles() {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        const toggle = section.querySelector('.section-toggle');
        const content = section.querySelector('.section-content');

        if (toggle && content) {
            toggle.addEventListener('click', () => {
                toggle.classList.toggle('active');
                content.classList.toggle('active');
                // Optional: Change display style directly if needed
                 content.style.display = content.classList.contains('active') ? 'block' : 'none';
            });
             // Start collapsed by default (unless already has active class)
            if (!content.classList.contains('active')) {
                content.style.display = 'none';
            } else {
                 toggle.classList.add('active'); // Ensure toggle matches content state
            }
        }
    });
     console.log("Section toggles initialized.");
     // Optional: Auto-expand the first section in the assessment tab?
     const firstToggle = document.querySelector('#thyroid-assessment .section .section-toggle');
     if (firstToggle) {
        // firstToggle.click(); // Simulate a click to open it
     }
}

/**
 * Displays a temporary notification message.
 * @param {string} message - The message to display.
 * @param {string} type - 'success', 'error', or 'info' (default).
 * @param {number} duration - Duration in milliseconds (default: 3000).
 */
export function showNotification(message, type = 'info', duration = 3000) {
    const notificationsContainer = document.getElementById('notifications');
    if (!notificationsContainer) {
        console.warn("Notification container not found.");
        return;
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    notificationsContainer.appendChild(notification);

    // Auto-remove after duration
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 500); // Wait for fade out
    }, duration);
    console.log(`Notification shown: ${message} (Type: ${type})`);
}