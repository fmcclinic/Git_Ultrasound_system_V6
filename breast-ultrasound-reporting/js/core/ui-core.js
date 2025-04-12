// js/core/ui-core.js
// Handles common UI interactions like tabs, section toggles, and notifications.
// (This file can generally be reused across projects with the same HTML structure patterns)

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
        if (event.target.matches('.tab-button')) {
            const button = event.target;
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
                if (content.id === targetTabId) {
                    content.classList.add('active');
                    targetFound = true;
                } else {
                    content.classList.remove('active');
                }
            });

            if (!targetFound) {
                console.warn(`[UI Core] Target tab content with ID '${targetTabId}' not found.`);
            }
        }
    });

    console.log("[UI Core] Tabs initialized.");
}


/**
 * Initializes collapsible section functionality based on .section-toggle and .section-content classes.
 */
export function initSectionToggles() {
    // Use event delegation on a common ancestor if possible, or query all toggles
    const container = document.querySelector('.container'); // Or a more specific parent
    if (!container) {
         console.warn("[UI Core] Main container not found for section toggle delegation.");
         return; // Or fallback to querySelectorAll
    }

     container.addEventListener('click', (event) => {
        // Check if the clicked element IS the toggle itself
        if (event.target.matches('.section-toggle')) {
            const toggle = event.target;
            const section = toggle.closest('.section'); // Find the parent .section
            if (!section) return;

            const content = section.querySelector('.section-content'); // Find content within THAT section

            if (content) {
                const isActive = toggle.classList.toggle('active'); // Toggle and check state
                content.classList.toggle('active');
                // Use max-height for smooth animation (needs CSS) or simple display toggle
                // content.style.display = isActive ? 'block' : 'none';

                // Example using max-height (add corresponding CSS transition)
                if (isActive) {
                     content.style.display = 'block'; // Need display block for height calculation
                     // Use a small delay to ensure display:block is applied before setting max-height
                     // requestAnimationFrame(() => {
                     //     content.style.maxHeight = content.scrollHeight + "px";
                     // });

                } else {
                    // content.style.maxHeight = "0";
                    // // Hide after transition (optional, depends on CSS)
                    // content.addEventListener('transitionend', () => {
                    //     if (!content.classList.contains('active')) {
                    //         content.style.display = 'none';
                    //     }
                    // }, { once: true });
                     content.style.display = 'none'; // Simpler toggle without animation
                }
            }
        }
    });

     // Initialize state based on initial 'active' classes in HTML
     document.querySelectorAll('.section').forEach(section => {
        const toggle = section.querySelector('.section-toggle');
        const content = section.querySelector('.section-content');
        if(toggle && content) {
            if (toggle.classList.contains('active') && content.classList.contains('active')) {
                 content.style.display = 'block';
                 // if using max-height: content.style.maxHeight = content.scrollHeight + "px";
            } else {
                 content.style.display = 'none';
                 // if using max-height: content.style.maxHeight = "0";
                 // Ensure classes are consistent
                 toggle.classList.remove('active');
                 content.classList.remove('active');
            }
        }
     });


    console.log("[UI Core] Section toggles initialized.");
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
        // Fallback to simple alert if container is missing
        alert(`${type.toUpperCase()}: ${message}`);
        return;
    }

    const notification = document.createElement('div');
    // Basic class + type-specific class
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Prepend to show newest on top (optional)
    notificationsContainer.prepend(notification);
    // Or append: notificationsContainer.appendChild(notification);

    // Trigger the animation (if defined in CSS)
    // Force reflow before adding animation class if needed, but usually direct append works with @keyframes
    // requestAnimationFrame(() => { notification.classList.add('show'); }); // If using a 'show' class for animation

    // Auto-remove after duration
    const timeoutId = setTimeout(() => {
        // Add a class to trigger fade-out animation (optional)
        notification.classList.add('fade-out');

        // Remove the element after the animation completes
        notification.addEventListener('transitionend', () => {
             // Check if the element still exists before removing
             if(notification.parentNode === notificationsContainer) {
                 notification.remove();
             }
        });

         // Fallback removal if transitionend doesn't fire (e.g., animation cancelled)
         setTimeout(() => {
              if(notification.parentNode === notificationsContainer) {
                 notification.remove();
              }
         }, 500); // Corresponds to typical fade-out duration

    }, duration);

    // Optional: Allow closing notification manually
    notification.addEventListener('click', () => {
        clearTimeout(timeoutId); // Cancel auto-remove
        notification.classList.add('fade-out');
         setTimeout(() => { if(notification.parentNode) notification.remove(); }, 500);
    });

    // console.log(`[UI Core] Notification shown: ${message} (Type: ${type})`);
}

console.log("ui-core.js loaded.");