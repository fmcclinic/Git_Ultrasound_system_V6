// js/core/ui-core.js
// Handles common UI interactions like tabs, section toggles, and notifications.
// Uses a simpler toggle mechanism based on CSS transitions for collapsible sections.

/**
 * Initializes tab switching functionality based on data-tab attributes.
 */
export function initTabs() {
    const tabContainer = document.querySelector('.tab-container');
    if (!tabContainer) {
        console.warn("[UI Core] Tab container (.tab-container) not found. Tabs not initialized.");
        return;
    }

    const tabNav = tabContainer.querySelector('.tab-nav');
    const tabContents = tabContainer.querySelectorAll(':scope > .tab-content'); // Direct children

    if (!tabNav || tabContents.length === 0) {
        console.warn("[UI Core] Tab navigation (.tab-nav) or tab content (.tab-content) elements missing.");
        return;
    }

    const tabButtons = tabNav.querySelectorAll('.tab-button');

    tabNav.addEventListener('click', (event) => {
        const button = event.target.closest('.tab-button'); // Handle clicks inside button too
        if (button) {
            const targetTabId = button.getAttribute('data-tab');
            if (!targetTabId) {
                console.warn("[UI Core] Tab button clicked but missing 'data-tab' attribute:", button);
                return;
            }

            // Update button active states
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Update content visibility
            let targetFound = false;
            tabContents.forEach(content => {
                 // Toggle 'active' class based on whether the content's ID matches the target ID
                 const shouldBeActive = content.id === targetTabId;
                 content.classList.toggle('active', shouldBeActive);
                 if(shouldBeActive) targetFound = true;
            });

            if (!targetFound) {
                console.warn(`[UI Core] Target tab content with ID '${targetTabId}' not found.`);
            }

            // Dispatch a custom event when tab changes (optional)
             const tabChangeEvent = new CustomEvent('tabchange', { detail: { activeTabId: targetTabId } });
             document.dispatchEvent(tabChangeEvent);
        }
    });

    // Activate the first tab by default if none are marked active in HTML
    const activeTabButton = tabNav.querySelector('.tab-button.active');
    if (!activeTabButton && tabButtons.length > 0) {
        const firstTabId = tabButtons[0].getAttribute('data-tab');
        const firstTabContent = firstTabId ? document.getElementById(firstTabId) : null;

        tabButtons[0].classList.add('active');
        if (firstTabContent) {
            firstTabContent.classList.add('active');
        }
         // Dispatch event for initial active tab
         if(firstTabId) {
            const tabChangeEvent = new CustomEvent('tabchange', { detail: { activeTabId: firstTabId } });
            document.dispatchEvent(tabChangeEvent);
         }
    }

    console.log("[UI Core] Tabs initialized.");
}


/**
 * Initializes collapsible section functionality.
 * Relies on CSS for transition/animation based on 'active' class on the toggle.
 */
export function initSectionToggles() {
    const container = document.body; // Delegate from body for simplicity
    if (!container) {
        console.error("[UI Core] Cannot set up section toggle delegation.");
        return;
    }

    container.addEventListener('click', (event) => {
        // Find the closest toggle element clicked or within the clicked element
        const toggle = event.target.closest('.section-toggle');
        if (!toggle) return; // Exit if the click wasn't on or inside a toggle

        const section = toggle.closest('.section.collapsible'); // Ensure it's a collapsible section
        if (!section) return;

        // Simply toggle the 'active' class on the header/toggle element.
        // CSS rules will handle the showing/hiding and animation of the sibling .section-content.
        toggle.classList.toggle('active');
        const isActive = toggle.classList.contains('active');
        console.log(`[UI Core] Toggled section. Active: ${isActive}`);

        // Find the direct sibling content (important for the CSS selector + .section-content)
        const content = toggle.nextElementSibling;
        if (!content || !content.classList.contains('section-content')) {
            // Fallback: try querying within the section if direct sibling doesn't match
            const queriedContent = section.querySelector(':scope > .section-content');
            if (!queriedContent) {
                console.warn("[UI Core] Could not find .section-content for toggle:", toggle);
                return; // Cannot proceed without content element
            }
            // Optionally add active class to content if needed by specific CSS rules
            // queriedContent.classList.toggle('active', isActive);
        } else {
             // Optionally add active class to content if needed by specific CSS rules
             // content.classList.toggle('active', isActive);
        }
    });

     // Initialization: Ensure initial visual state matches HTML classes
     // CSS should handle the display based on whether '.section-toggle' has '.active'
     // No initial JS height calculations are needed with this CSS-driven approach
     document.querySelectorAll('.section.collapsible').forEach(section => {
         const toggle = section.querySelector(':scope > .section-toggle');
         const content = section.querySelector(':scope > .section-content');
         if (toggle && content) {
             // CSS should correctly hide/show based on initial 'active' class on toggle
             // Example: If toggle lacks 'active', CSS hides content. If toggle has 'active', CSS shows content.
         } else {
              console.warn("[UI Core] Collapsible section missing toggle or direct content during init:", section);
         }
     });

    console.log("[UI Core] Section toggles initialized (CSS-driven).");
}


/**
 * Displays a temporary notification message on the screen.
 * @param {string} message - The message to display.
 * @param {string} type - 'success', 'error', or 'info' (controls background color via CSS class). Default: 'info'.
 * @param {number} duration - How long the notification stays visible in milliseconds. Default: 3000.
 */
export function showNotification(message, type = 'info', duration = 3000) {
     const notificationsContainer = document.getElementById('notifications');
    if (!notificationsContainer) {
        console.error("[UI Core] Notification container '#notifications' not found in the DOM.");
        alert(`${type.toUpperCase()}: ${message}`); // Fallback
        return;
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    // Use textContent for safety against XSS unless HTML is explicitly needed and sanitized
    notification.textContent = message;
    // If HTML is needed (use carefully): notification.innerHTML = sanitizedMessage;

    notificationsContainer.prepend(notification);

    // Force reflow/repaint before adding 'show' class for smooth animation
    requestAnimationFrame(() => {
        requestAnimationFrame(() => { // Double requestAnimationFrame can help ensure transition starts correctly
            notification.classList.add('show');
        });
    });


    // Auto-remove after duration
    const timeoutId = setTimeout(() => {
        notification.classList.remove('show'); // Trigger fade-out/slide-out animation
        // Remove the element after the CSS transition completes
        notification.addEventListener('transitionend', () => notification.remove(), { once: true });
        // Fallback removal in case transitionend doesn't fire reliably
        setTimeout(() => { if(notification.parentNode) notification.remove(); }, 600); // Should be > transition duration in CSS
    }, duration);

    // Allow closing notification manually by clicking on it
    notification.addEventListener('click', () => {
        clearTimeout(timeoutId); // Cancel auto-remove timer
        notification.classList.remove('show'); // Start fade-out immediately
        notification.addEventListener('transitionend', () => notification.remove(), { once: true });
        setTimeout(() => { if(notification.parentNode) notification.remove(); }, 600); // Fallback
    }, { once: true }); // Use {once: true} so click listener removes itself after first click
}

console.log("ui-core.js loaded (v_simple_toggle_stable).");