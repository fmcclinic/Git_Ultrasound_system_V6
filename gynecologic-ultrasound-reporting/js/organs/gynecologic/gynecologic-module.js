// js/organs/gynecologic/gynecologic-module.js
// Module specific to Gynecologic Ultrasound reporting logic.

// --- Core Imports ---
import { showNotification } from '../../core/ui-core.js';
import { populateForm, getFormData } from '../../core/form-core.js';
import { calculateEllipsoidVolume } from '../../modules/volume-calculator.js'; // Import volume calculator

// --- Module-level variables ---
const hideSuggestionTimeoutsGYN = {}; // Timeout tracker for GYN textareas

// --- Constants ---
const RIGHT_OVARY_PREFIX = 'ovaryRight';
const LEFT_OVARY_PREFIX = 'ovaryLeft';

// --- Initialization ---
/**
 * Initializes the Gynecologic module functionalities.
 * Sets up event listeners specific to the Gynecologic assessment form.
 */
export function init() {
    console.log("[GynecologicModule] Initializing...");
    try {
        const gynForm = document.getElementById('gyn-assessment-form');
        if (!gynForm) {
            console.error("[GynecologicModule] CRITICAL: Gynecologic assessment form ('#gyn-assessment-form') not found. Module cannot function.");
            showNotification("Error: Gynecologic assessment UI not found.", "error");
            return; // Stop initialization
        }

        // --- Event Delegation ---
        gynForm.addEventListener('click', function(event) {
            const target = event.target;

            // Handle Suggestion Button click
            if (target.classList.contains('suggestion-btn')) {
                handleGynSuggestionClick(target); // Use GYN specific handler
                // Container hiding logic is now within handleGynSuggestionClick
            }
            // Handle Add Fibroid Button
            else if (target.id === 'add-fibroid-btn') {
                addFibroidEntry();
            }
            // Handle Add Adnexal Finding Button
            else if (target.id === 'add-adnexal-finding-btn') {
                addAdnexalFindingEntry();
            }
            // Handle Remove Dynamic Entry Button
            else if (target.classList.contains('remove-btn')) {
                // Determine type based on closest parent
                const fibroidEntry = target.closest('.fibroid-entry');
                const findingEntry = target.closest('.adnexal-finding-entry');
                if (fibroidEntry) {
                    removeDynamicEntry(target, 'fibroid');
                } else if (findingEntry) {
                    removeDynamicEntry(target, 'adnexalFinding');
                }
            }
        });

        // Handle input/change events for calculations and UI toggles
        gynForm.addEventListener('input', function(event) {
             const target = event.target;
             // Trigger Ovarian Volume Calculation on dimension input
             if (target.name && (target.name.startsWith(RIGHT_OVARY_PREFIX) || target.name.startsWith(LEFT_OVARY_PREFIX)) && target.name.includes('Size')) {
                 const side = target.name.startsWith(RIGHT_OVARY_PREFIX) ? 'right' : 'left';
                 calculateOvarianVolume(side);
             }
        });

        gynForm.addEventListener('change', function(event) {
             const target = event.target;
            // Toggle Fibroid section based on Myometrium selection
             if (target.id === 'uterus-myometrium') {
                toggleFibroidSection(target.value);
             }
        });

        // --- Initialize UI State ---
        // Needs to run after potential template loading, use timeout as safeguard? Or rely on loadTemplate to call these.
        // Direct call might be sufficient if init runs after DOMContentLoaded and before any template loading.
        setTimeout(() => {
             console.log("[GynecologicModule] Running initial UI setup...");
             calculateOvarianVolume('right');
             calculateOvarianVolume('left');
             const myometriumSelect = document.getElementById('uterus-myometrium');
             if (myometriumSelect) toggleFibroidSection(myometriumSelect.value);
             setupSuggestionVisibilityGYN(gynForm); // Setup for static fields
             console.log("[GynecologicModule] Initial UI setup complete.");
        }, 150);


        console.log("[GynecologicModule] Initialized successfully.");
    } catch (error) {
        console.error("[GynecologicModule] Error during initialization:", error);
        showNotification("Failed to initialize Gynecologic module.", "error");
    }
}

// --- Calculation Helpers ---

/**
 * Calculates ovarian volume based on L, W, AP dimensions for the specified side.
 * @param {'right' | 'left'} side - The side of the ovary ('right' or 'left').
 */
function calculateOvarianVolume(side) {
    const prefix = side === 'right' ? RIGHT_OVARY_PREFIX : LEFT_OVARY_PREFIX;
    const form = document.getElementById('gyn-assessment-form');
    if (!form) return;

    const lInput = form.querySelector(`#${prefix}SizeL`);
    const wInput = form.querySelector(`#${prefix}SizeW`);
    const apInput = form.querySelector(`#${prefix}SizeAP`);
    const volumeDisplay = form.querySelector(`#${prefix}Volume`); // Assuming a span or div for display
    const volumeInput = form.querySelector(`input[name="${prefix}Volume"]`); // Hidden input

    if (!lInput || !wInput || !apInput || !volumeDisplay || !volumeInput) {
        // console.warn(`[GynecologicModule] Missing elements for ${side} ovary volume calculation.`);
        return;
    }

    const length = lInput.value;
    const width = wInput.value;
    const ap = apInput.value;

    const volume = calculateEllipsoidVolume(length, width, ap); // Expects mm, returns mL

    if (volume !== null) {
        volumeDisplay.textContent = volume.toFixed(1); // Display volume rounded to 1 decimal
        volumeDisplay.value = volume.toFixed(1); // Also set value if it's an input
        volumeInput.value = volume.toFixed(1); // Store value for data collection
    } else {
        volumeDisplay.textContent = 'N/A';
        volumeDisplay.value = '';
        volumeInput.value = '';
    }
}


// --- UI Helpers ---

/**
 * Shows/hides the fibroid details section based on Myometrium selection.
 * @param {string} selectedValue - The value of the uterus-myometrium select element.
 */
function toggleFibroidSection(selectedValue) {
    const section = document.getElementById('fibroids-section');
    const addButton = document.getElementById('add-fibroid-btn');
    if (section && addButton) {
        const show = selectedValue === 'Fibroids Present / Có U xơ';
        section.style.display = show ? 'block' : 'none';
        // Optional: Clear fibroid entries if hidden? Decide based on desired behavior.
        // if (!show) { document.getElementById('fibroids-list').innerHTML = ''; }
    } else {
         console.warn("[GynecologicModule] Fibroid section or add button not found.");
    }
}

// --- Suggestion Button Logic ---
// (Adapted from Obstetric module, could potentially be moved to ui-core if identical)

/** Sets up focus/blur listeners for suggestion buttons visibility. */
function setupSuggestionVisibilityGYN(parentElement) {
    // console.log("[GynecologicModule] Setting up suggestion visibility in:", parentElement.id || parentElement.tagName);
    const suggestionContainers = parentElement.querySelectorAll('.suggestion-button-container');
    suggestionContainers.forEach(container => {
        const inputElement = container.previousElementSibling; // Assumes input/textarea is directly before container
        if (inputElement && (inputElement.tagName === 'TEXTAREA' || inputElement.tagName === 'INPUT')) {
             // Ensure input has a unique ID, especially for dynamic elements
            let elementId = inputElement.id || `${inputElement.name}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
            inputElement.id = elementId;

            // Remove existing listeners to prevent duplicates if init is called multiple times
            inputElement.removeEventListener('focus', handleGynInputFocus);
            inputElement.removeEventListener('blur', handleGynInputBlur);

            // Add new listeners
            inputElement.addEventListener('focus', handleGynInputFocus);
            inputElement.addEventListener('blur', handleGynInputBlur);

             // Add listeners to buttons inside this specific container
             container.querySelectorAll('.suggestion-btn').forEach(button => {
                button.removeEventListener('click', handleGynSuggestionClick); // Prevent duplicates
                button.addEventListener('click', handleGynSuggestionClick);
            });
        }
    });
}

/** Shows suggestion buttons on focus. */
function handleGynInputFocus(event) {
    const inputElement = event.target;
    const elementId = inputElement.id;
    const container = inputElement.nextElementSibling; // Assumes container is directly after
    if (hideSuggestionTimeoutsGYN[elementId]) {
        clearTimeout(hideSuggestionTimeoutsGYN[elementId]);
        delete hideSuggestionTimeoutsGYN[elementId];
    }
    if (container && container.classList.contains('suggestion-button-container')) {
        container.style.display = 'flex'; // Use 'flex' for horizontal layout
    }
}

/** Hides suggestion buttons on blur with a delay, checking if focus moved to a button. */
function handleGynInputBlur(event) {
    const inputElement = event.target;
    const elementId = inputElement.id;
    const container = inputElement.nextElementSibling; // Assumes container is directly after
    if (container && container.classList.contains('suggestion-button-container')) {
        // Use a short timeout to allow clicking a suggestion button before hiding
        hideSuggestionTimeoutsGYN[elementId] = setTimeout(() => {
            // Check if the currently focused element is one of the buttons *within* this container
            const isFocusInside = container.contains(document.activeElement);
             if (!isFocusInside) { // Only hide if focus moved outside the container
                 container.style.display = 'none';
             }
            delete hideSuggestionTimeoutsGYN[elementId]; // Clean up timeout ID
        }, 250); // 250ms delay
    }
}

/** Handles suggestion button click, inserting text and hiding the container. */
function handleGynSuggestionClick(button) {
     const textToInsert = button.dataset.insert;
     const container = button.closest('.suggestion-button-container');
     const targetElement = container ? container.previousElementSibling : null;

     if (targetElement && (targetElement.tagName === 'TEXTAREA' || targetElement.tagName === 'INPUT') && textToInsert !== undefined) {
         const currentValue = targetElement.value;
         let separator = '';
         // Add separator (e.g., ". ") if the target is not empty and doesn't end with space/newline/punctuation
         if (currentValue.trim().length > 0 && !/[\s\.\?\!;:,]$/.test(currentValue.trim())) {
              separator = '. ';
         } else if (currentValue.length > 0 && !currentValue.endsWith(' ') && !currentValue.endsWith('\n')) {
             separator = ' '; // Add a space if not empty but ends with non-space
         }

         targetElement.value += separator + textToInsert;
         // Trigger input event to notify any other listeners (e.g., auto-save)
         targetElement.dispatchEvent(new Event('input', { bubbles: true }));
         targetElement.focus(); // Set focus back to the input field
         // Scroll to the bottom of textarea if applicable
         if(targetElement.tagName === 'TEXTAREA') {
             targetElement.scrollTop = targetElement.scrollHeight;
         }
     } else {
         console.warn("[GynecologicModule] Target input/textarea or data-insert attribute not found for suggestion button.", button);
     }
     // Hide the container after clicking a button
     if (container) {
        container.style.display = 'none';
     }
}

// --- Dynamic Section Handling ---

/** Adds a new fibroid entry section to the form. */
function addFibroidEntry() {
    const list = document.getElementById('fibroids-list');
    const template = document.getElementById('fibroid-template');
    if (!list || !template) {
        console.error("[GynecologicModule] Cannot add fibroid entry: List or template not found.");
        return;
    }
    const clone = template.content.cloneNode(true);
    const newEntry = clone.querySelector('.fibroid-entry');
    if (!newEntry) {
         console.error("[GynecologicModule] Invalid fibroid template structure.");
         return;
     }
    const fibroidId = `fibroid_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    newEntry.dataset.fibroidId = fibroidId; // Store ID for potential future reference
    list.appendChild(clone);
    // Setup listeners for the newly added elements within this entry
    setupSuggestionVisibilityGYN(newEntry);
     // Focus on the first input of the new entry (optional)
     const firstInput = newEntry.querySelector('select, input, textarea');
     if (firstInput) firstInput.focus();
     console.log(`[GynecologicModule] Added fibroid entry: ${fibroidId}`);
}

/** Adds a new adnexal finding entry section to the form. */
function addAdnexalFindingEntry() {
    const list = document.getElementById('adnexal-findings-list');
    const template = document.getElementById('adnexal-finding-template');
     if (!list || !template) {
        console.error("[GynecologicModule] Cannot add adnexal finding entry: List or template not found.");
        return;
    }
    const clone = template.content.cloneNode(true);
    const newEntry = clone.querySelector('.adnexal-finding-entry');
     if (!newEntry) {
         console.error("[GynecologicModule] Invalid adnexal finding template structure.");
         return;
     }
    const findingId = `finding_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    newEntry.dataset.findingId = findingId; // Store ID
    list.appendChild(clone);
     // Setup listeners for the newly added elements within this entry
    setupSuggestionVisibilityGYN(newEntry);
     // Focus on the first input of the new entry (optional)
     const firstInput = newEntry.querySelector('select, input, textarea');
     if (firstInput) firstInput.focus();
     console.log(`[GynecologicModule] Added adnexal finding entry: ${findingId}`);
}

/** Removes a dynamic entry (fibroid or adnexal finding). */
function removeDynamicEntry(button, type) { // type: 'fibroid' or 'adnexalFinding'
    const entry = button.closest(`.dynamic-entry.${type}-entry`);
    if (entry) {
        const entryId = entry.dataset.fibroidId || entry.dataset.findingId;
        entry.remove();
        console.log(`[GynecologicModule] Removed ${type} entry: ${entryId}`);
        showNotification(`${type === 'fibroid' ? 'Fibroid' : 'Finding'} entry removed.`, 'info', 1500);
    } else {
         console.warn(`[GynecologicModule] Could not find parent entry to remove for button:`, button);
    }
}


// --- Data Collection ---
/**
 * Collects all data for the Gynecologic assessment form.
 * Returns an object containing the structured data AND a function `formatReportSectionHtml`.
 * @returns {object | null} - Gynecologic data object including the formatting function, or null on error.
 */
export function collectGynecologicData() {
    console.log("[GynecologicModule] Collecting Gynecologic data...");
    const form = document.getElementById('gyn-assessment-form');
    if (!form) {
        console.error("[collectGynecologicData] Gynecologic assessment form ('#gyn-assessment-form') not found.");
        return null;
    }

    try {
        // Use getFormData from form-core.js for static fields
        const staticFormData = getFormData(form);
        // console.log("Raw Static Form Data:", staticFormData); // Debug

        const structuredData = {
            scanApproach: staticFormData.scanApproach,
            uterus: {
                position: staticFormData.uterusPosition,
                sizeL: staticFormData.uterusSizeL,
                sizeW: staticFormData.uterusSizeW,
                sizeAP: staticFormData.uterusSizeAP,
                shape: staticFormData.uterusShape,
                contour: staticFormData.uterusContour,
                myometrium: staticFormData.uterusMyometrium,
                comments: staticFormData.uterusComments,
            },
            endometrium: {
                thickness: staticFormData.endometriumThickness,
                echogenicity: staticFormData.endometriumEchogenicity,
                appearance: staticFormData.endometriumAppearance,
                iudStatus: staticFormData.iudStatus,
            },
            cervix: {
                appearance: staticFormData.cervixAppearance,
                length: staticFormData.cervixLength,
            },
            adnexa: {
                right: {
                    visibility: staticFormData.ovaryRightVisibility,
                    sizeL: staticFormData.ovaryRightSizeL,
                    sizeW: staticFormData.ovaryRightSizeW,
                    sizeAP: staticFormData.ovaryRightSizeAP,
                    volume: staticFormData.ovaryRightVolume, // From hidden input
                    appearance: staticFormData.ovaryRightAppearance,
                },
                left: {
                    visibility: staticFormData.ovaryLeftVisibility,
                    sizeL: staticFormData.ovaryLeftSizeL,
                    sizeW: staticFormData.ovaryLeftSizeW,
                    sizeAP: staticFormData.ovaryLeftSizeAP,
                    volume: staticFormData.ovaryLeftVolume, // From hidden input
                    appearance: staticFormData.ovaryLeftAppearance,
                },
                comments: staticFormData.adnexaComments,
            },
            culdesac: {
                fluid: staticFormData.culdesacFluid,
            },
            fibroids: [], // Populate below
            adnexalFindings: [], // Populate below
            impression: staticFormData.impression,
            recommendation: staticFormData.recommendation
        };

        // --- Collect Dynamic Fibroid Data ---
        const fibroidEntries = form.querySelectorAll('#fibroids-list .fibroid-entry');
        fibroidEntries.forEach((entry, index) => {
            // Scope getFormData to the specific entry div
            const fibroidData = getFormData(entry);
            // Add an ID for reference if needed, could use index or the dataset ID
            fibroidData.id = entry.dataset.fibroidId || `fibroid_${index + 1}`;
            structuredData.fibroids.push(fibroidData);
        });

        // --- Collect Dynamic Adnexal Finding Data ---
        const findingEntries = form.querySelectorAll('#adnexal-findings-list .adnexal-finding-entry');
        findingEntries.forEach((entry, index) => {
            // Scope getFormData to the specific entry div
            const findingData = getFormData(entry);
            findingData.id = entry.dataset.findingId || `finding_${index + 1}`;
            structuredData.adnexalFindings.push(findingData);
        });

        // Attach the formatting function
        // Use 'function() { return ... }' to ensure 'this' refers to structuredData when called
        structuredData.formatReportSectionHtml = function() { return formatGynecologicReportSectionHtml(this); }

        console.debug("[collectGynecologicData] Collected Gynecologic Data:", JSON.parse(JSON.stringify(structuredData))); // Deep copy for logging
        return structuredData;

    } catch (error) {
        console.error("[collectGynecologicData] Error collecting Gynecologic data:", error);
        showNotification("Failed to collect Gynecologic assessment data.", "error");
        return null;
    }
}


// --- Template Loading ---
/**
 * Loads template data into the Gynecologic assessment form.
 * @param {object} gynecologicTemplateData - Gynecologic-specific template data.
 */
export async function loadGynecologicTemplateData(gynecologicTemplateData) {
    if (!gynecologicTemplateData || typeof gynecologicTemplateData !== 'object') {
        console.warn("[loadGynecologicTemplateData] Invalid or missing Gynecologic template data provided.");
        return;
    }
    console.log("[GynecologicModule] Loading Gynecologic template data...");
    const form = document.getElementById('gyn-assessment-form');
    if (!form) {
        console.error("[loadGynecologicTemplateData] Gynecologic form not found! Cannot load template.");
        showNotification("Cannot load Gynecologic template: UI elements missing.", "error");
        return;
    }

    try {
        // --- Clear existing dynamic entries BEFORE populating static fields ---
        const fibroidList = document.getElementById('fibroids-list');
        const findingList = document.getElementById('adnexal-findings-list');
        if (fibroidList) fibroidList.innerHTML = '';
        if (findingList) findingList.innerHTML = '';
        console.log("[GynecologicModule] Cleared dynamic fibroid/finding lists.");

        // --- Flatten the data for static fields ---
        const flattenedData = {};
        // Top level
        flattenedData.scanApproach = gynecologicTemplateData.scanApproach;
        flattenedData.impression = gynecologicTemplateData.impression;
        flattenedData.recommendation = gynecologicTemplateData.recommendation;
        // Uterus
        Object.assign(flattenedData, gynecologicTemplateData.uterus); // sizeL, sizeW, sizeAP, position, shape, contour, myometrium, comments
        // Endometrium
        Object.assign(flattenedData, gynecologicTemplateData.endometrium); // thickness, echogenicity, appearance, iudStatus
         // Cervix
        Object.assign(flattenedData, gynecologicTemplateData.cervix); // appearance, length
        // Adnexa (Right)
        for (const key in gynecologicTemplateData.adnexa?.right) {
             flattenedData[`${RIGHT_OVARY_PREFIX}${key.charAt(0).toUpperCase() + key.slice(1)}`] = gynecologicTemplateData.adnexa.right[key];
        }
         // Adnexa (Left)
         for (const key in gynecologicTemplateData.adnexa?.left) {
              flattenedData[`${LEFT_OVARY_PREFIX}${key.charAt(0).toUpperCase() + key.slice(1)}`] = gynecologicTemplateData.adnexa.left[key];
         }
         // Adnexa Comments
         flattenedData.adnexaComments = gynecologicTemplateData.adnexa?.comments;
        // Cul-de-sac
        flattenedData.culdesacFluid = gynecologicTemplateData.culdesac?.fluid;

        // Populate static form fields
        populateForm(form, flattenedData, { dispatchEvents: false }); // Populate without events first
        console.log("[loadGynecologicTemplateData] Static form fields populated.");

        // --- Recreate Dynamic Fibroid Entries ---
        if (Array.isArray(gynecologicTemplateData.fibroids)) {
            gynecologicTemplateData.fibroids.forEach(fibroid => {
                addFibroidEntry(); // Add a blank entry
                const newEntry = form.querySelector('#fibroids-list .fibroid-entry:last-child');
                if (newEntry) {
                    // Populate the fields of the newly added entry
                    populateForm(newEntry, fibroid, { dispatchEvents: false });
                }
            });
            console.log(`[loadGynecologicTemplateData] Recreated ${gynecologicTemplateData.fibroids.length} fibroid entries.`);
        }

        // --- Recreate Dynamic Adnexal Finding Entries ---
        if (Array.isArray(gynecologicTemplateData.adnexalFindings)) {
            gynecologicTemplateData.adnexalFindings.forEach(finding => {
                 addAdnexalFindingEntry(); // Add a blank entry
                 const newEntry = form.querySelector('#adnexal-findings-list .adnexal-finding-entry:last-child');
                 if (newEntry) {
                     // Populate the fields of the newly added entry
                     populateForm(newEntry, finding, { dispatchEvents: false });
                 }
            });
             console.log(`[loadGynecologicTemplateData] Recreated ${gynecologicTemplateData.adnexalFindings.length} adnexal finding entries.`);
        }

        // --- Final Updates & UI Sync ---
        console.log("[loadGynecologicTemplateData] Triggering final UI updates...");
        // 1. Trigger Ovarian Volume calculations
        calculateOvarianVolume('right');
        calculateOvarianVolume('left');
        // 2. Set Fibroid section visibility based on loaded myometrium value
        const myometriumSelect = document.getElementById('uterus-myometrium');
        if (myometriumSelect) toggleFibroidSection(myometriumSelect.value);
        // 3. Ensure suggestion visibility is correctly set up for all fields (static and dynamic)
        // Use a small delay to ensure DOM is fully updated after dynamic additions
        setTimeout(() => {
            setupSuggestionVisibilityGYN(form);
             console.log("[loadGynecologicTemplateData] Suggestion visibility setup complete.");
        }, 100);
        // 4. Dispatch 'change' events manually if needed for other complex listeners (unlikely here)
        // form.querySelectorAll('select, input[type="number"]').forEach(el => el.dispatchEvent(new Event('change', { bubbles: true })));

        console.log("[loadGynecologicTemplateData] Finished applying Gynecologic template data.");

    } catch (error) {
        console.error("[loadGynecologicTemplateData] Error applying Gynecologic template:", error);
        showNotification("Failed to apply Gynecologic template data.", "error");
    }
}


// --- Report Formatting ---

/**
 * Helper function to safely get and format values for the report.
 * Returns the fallback if the value is null, undefined, or an empty string.
 * Replaces newlines in text areas with <br> for HTML display.
 * @param {*} value - The value to format.
 * @param {string} [unit=''] - Optional unit to append.
 * @param {string} [fallback=''] - Value to return if input is empty/null/undefined.
 * @returns {string} - Formatted value string or fallback.
 */
const formatValue = (value, unit = '', fallback = '') => {
    if (value === null || value === undefined || String(value).trim() === '') {
        return fallback;
    }
    // Replace newlines for multi-line text fields
    const strVal = String(value).replace(/\n/g, '<br>&nbsp;&nbsp;');
    return strVal + (unit ? ` ${unit}` : '');
};

/**
 * Formats the FINDINGS section for a Gynecologic report as an HTML string.
 * Uses the data object collected by collectGynecologicData.
 * **Implements CONDITIONAL REPORTING: Only includes items with actual data.**
 * Uses a single-column layout.
 * @param {object} data - Collected Gynecologic data object.
 * @returns {string} - Formatted findings HTML block string.
 */
function formatGynecologicReportSectionHtml(data) {
    console.log("[GynecologicModule] Formatting Gynecologic report section HTML...");
    if (!data) return "<p>Error: No Gynecologic data provided for formatting.</p>";

    let findingsHtml = '';
    const br = '<br>'; // Shortcut for line breaks

    // --- Scan Approach ---
    const approach = formatValue(data.scanApproach);
    if (approach) {
        findingsHtml += `<h4>Scan Approach / Ngã tiếp cận</h4><ul><li>${approach}</li></ul>`;
    }

    // --- Uterus ---
    const ut = data.uterus;
    let utContent = '';
    if (formatValue(ut?.position)) utContent += `<li><strong>Position / Tư thế:</strong> ${formatValue(ut.position)}</li>`;
    // Combine size only if at least one dimension is present
    const utSizeL = formatValue(ut?.sizeL);
    const utSizeW = formatValue(ut?.sizeW);
    const utSizeAP = formatValue(ut?.sizeAP);
    if (utSizeL || utSizeW || utSizeAP) {
        utContent += `<li><strong>Size / Kích thước:</strong> ${utSizeL || '?'} x ${utSizeW || '?'} x ${utSizeAP || '?'} mm (L x W x AP)</li>`;
    }
    if (formatValue(ut?.shape)) utContent += `<li><strong>Shape / Hình dạng:</strong> ${formatValue(ut.shape)}</li>`;
    if (formatValue(ut?.contour)) utContent += `<li><strong>Contour / Đường bờ:</strong> ${formatValue(ut.contour)}</li>`;
    if (formatValue(ut?.myometrium) && ut.myometrium !== 'Fibroids Present / Có U xơ') { // Don't report "Fibroids Present" here if fibroids list follows
         utContent += `<li><strong>Myometrium / Cơ tử cung:</strong> ${formatValue(ut.myometrium)}</li>`;
    }
    if (formatValue(ut?.comments)) utContent += `<li><strong>Comments / Ghi chú TC:</strong> ${formatValue(ut.comments)}</li>`;
    if (utContent) {
        findingsHtml += `<h4>Uterus / Tử cung</h4><ul>${utContent}</ul>`;
    }

    // --- Fibroids (Dynamic) ---
    const fibroids = data.fibroids;
    if (fibroids && Array.isArray(fibroids) && fibroids.length > 0) {
         findingsHtml += `<h4>Uterine Fibroids / U xơ tử cung</h4><ul>`;
         fibroids.forEach((fib, index) => {
             let fibDetail = `<li><strong>Fibroid ${index + 1}:</strong> `;
             let parts = [];
             if (formatValue(fib.fibroidLocation)) parts.push(`Location: ${formatValue(fib.fibroidLocation)}`);
             if (formatValue(fib.fibroidSize)) parts.push(`Size: ${formatValue(fib.fibroidSize, 'mm')}`);
             if (formatValue(fib.fibroidEchogenicity)) parts.push(`Echo: ${formatValue(fib.fibroidEchogenicity)}`);
             if (formatValue(fib.fibroidDescription)) parts.push(`Desc: ${formatValue(fib.fibroidDescription)}`);
             if (formatValue(fib.fibroidComments)) parts.push(`Comments: ${formatValue(fib.fibroidComments)}`);
             fibDetail += parts.join('; ') || 'Details not specified.';
             fibDetail += `</li>`;
             findingsHtml += fibDetail;
         });
         findingsHtml += `</ul>`;
    } else if (ut?.myometrium === 'Fibroids Present / Có U xơ') {
        // Handle case where "Fibroids Present" was selected but none were added
        findingsHtml += `<h4>Uterine Fibroids / U xơ tử cung</h4><ul><li>Fibroids indicated but details not provided. / Đã chỉ định có u xơ nhưng không cung cấp chi tiết.</li></ul>`;
    }


    // --- Endometrium ---
    const endo = data.endometrium;
    let endoContent = '';
    if (formatValue(endo?.thickness)) endoContent += `<li><strong>Thickness / Bề dày:</strong> ${formatValue(endo.thickness, 'mm')}</li>`;
    if (formatValue(endo?.echogenicity)) endoContent += `<li><strong>Echogenicity / Độ hồi âm:</strong> ${formatValue(endo.echogenicity)}</li>`;
    if (formatValue(endo?.appearance)) endoContent += `<li><strong>Appearance/Pattern / Hình thái/Dạng:</strong> ${formatValue(endo.appearance)}</li>`;
    if (formatValue(endo?.iudStatus) && endo.iudStatus !== 'Not Present / Không có') {
        endoContent += `<li><strong>IUD Status / Tình trạng Vòng:</strong> ${formatValue(endo.iudStatus)}</li>`;
    }
    if (endoContent) {
        findingsHtml += `<h4>Endometrium / Nội mạc tử cung</h4><ul>${endoContent}</ul>`;
    }

    // --- Cervix ---
    const cervix = data.cervix;
    let cervixContent = '';
    if (formatValue(cervix?.appearance)) cervixContent += `<li><strong>Appearance / Hình dạng:</strong> ${formatValue(cervix.appearance)}</li>`;
    if (formatValue(cervix?.length)) cervixContent += `<li><strong>Length / Chiều dài:</strong> ${formatValue(cervix.length, 'mm')}</li>`;
     if (cervixContent) {
        findingsHtml += `<h4>Cervix / Cổ tử cung</h4><ul>${cervixContent}</ul>`;
    }

    // --- Adnexa ---
    const adnexa = data.adnexa;
    let adnexaContent = '';
    // Right Ovary
    const ro = adnexa?.right;
    let roContent = '';
    if (formatValue(ro?.visibility)) {
        roContent += `<li><strong>Visibility / Khả năng thấy:</strong> ${formatValue(ro.visibility)}</li>`;
        // Only add size/volume/appearance if visualized
        if (ro.visibility !== 'Not Visualized / Không thấy' && ro.visibility !== 'Surgically Absent / Đã cắt bỏ') {
            const roSizeL = formatValue(ro?.sizeL); const roSizeW = formatValue(ro?.sizeW); const roSizeAP = formatValue(ro?.sizeAP);
            if (roSizeL || roSizeW || roSizeAP) { roContent += `<li><strong>Size / Kích thước:</strong> ${roSizeL || '?'} x ${roSizeW || '?'} x ${roSizeAP || '?'} mm</li>`; }
            if (formatValue(ro?.volume)) { roContent += `<li><strong>Volume / Thể tích:</strong> ${formatValue(ro.volume, 'mL')}</li>`; }
            if (formatValue(ro?.appearance)) { roContent += `<li><strong>Appearance / Hình thái:</strong> ${formatValue(ro.appearance)}</li>`; }
        }
    }
     if (roContent) {
         adnexaContent += `<h5>Right Ovary / Buồng trứng Phải</h5><ul>${roContent}</ul>`;
     }

    // Left Ovary
    const lo = adnexa?.left;
    let loContent = '';
     if (formatValue(lo?.visibility)) {
        loContent += `<li><strong>Visibility / Khả năng thấy:</strong> ${formatValue(lo.visibility)}</li>`;
        if (lo.visibility !== 'Not Visualized / Không thấy' && lo.visibility !== 'Surgically Absent / Đã cắt bỏ') {
             const loSizeL = formatValue(lo?.sizeL); const loSizeW = formatValue(lo?.sizeW); const loSizeAP = formatValue(lo?.sizeAP);
             if (loSizeL || loSizeW || loSizeAP) { loContent += `<li><strong>Size / Kích thước:</strong> ${loSizeL || '?'} x ${loSizeW || '?'} x ${loSizeAP || '?'} mm</li>`; }
             if (formatValue(lo?.volume)) { loContent += `<li><strong>Volume / Thể tích:</strong> ${formatValue(lo.volume, 'mL')}</li>`; }
             if (formatValue(lo?.appearance)) { loContent += `<li><strong>Appearance / Hình thái:</strong> ${formatValue(lo.appearance)}</li>`; }
        }
     }
     if (loContent) {
         adnexaContent += `<h5>Left Ovary / Buồng trứng Trái</h5><ul>${loContent}</ul>`;
     }
     // Adnexa Comments
     if (formatValue(adnexa?.comments)){
         adnexaContent += `<h5>Adnexa Comments / Ghi chú Phần phụ</h5><ul><li>${formatValue(adnexa.comments)}</li></ul>`;
     }

     if (adnexaContent) {
         findingsHtml += `<h4>Adnexa / Phần phụ</h4>${adnexaContent}`;
     }

    // --- Adnexal Findings (Dynamic) ---
     const findings = data.adnexalFindings;
     if (findings && Array.isArray(findings) && findings.length > 0) {
          findingsHtml += `<h4>Adnexal Findings (Masses/Cysts) / Tổn thương Phần phụ (Khối u/Nang)</h4><ul>`;
          findings.forEach((f, index) => {
              let fDetail = `<li><strong>Finding ${index + 1}:</strong> `;
              let parts = [];
              if (formatValue(f.findingLaterality)) parts.push(`Side: ${formatValue(f.findingLaterality)}`);
              if (formatValue(f.findingOrigin)) parts.push(`Origin: ${formatValue(f.findingOrigin)}`);
              if (formatValue(f.findingSize)) parts.push(`Size: ${formatValue(f.findingSize, 'mm')}`);
              if (formatValue(f.findingType)) parts.push(`Type: ${formatValue(f.findingType)}`);
              if (formatValue(f.findingDescription)) parts.push(`Desc: ${formatValue(f.findingDescription)}`);
              fDetail += parts.join('; ') || 'Details not specified.';
              fDetail += `</li>`;
              findingsHtml += fDetail;
          });
          findingsHtml += `</ul>`;
     }

    // --- Cul-de-sac ---
    const cds = data.culdesac;
    if (formatValue(cds?.fluid) && cds.fluid !== 'None / Không có') {
        findingsHtml += `<h4>Cul-de-sac / Túi cùng Douglas</h4><ul><li><strong>Free Fluid / Dịch tự do:</strong> ${formatValue(cds.fluid)}</li></ul>`;
    }

    // --- Impression and Recommendation ---
    const impressionText = formatValue(data.impression);
    const recommendationText = formatValue(data.recommendation);

    if (impressionText) {
        findingsHtml += `<hr class="report-hr"><h4>IMPRESSION / KẾT LUẬN:</h4>`;
        findingsHtml += `<p>${impressionText}</p>`; // Already handles <br>
    }

    if (recommendationText) {
        findingsHtml += `<hr class="report-hr"><h4>RECOMMENDATION / ĐỀ NGHỊ:</h4><p>${recommendationText}</p>`;
    }

    console.log("[GynecologicModule] Finished formatting Gynecologic report section HTML.");
    // Wrap the entire findings section for potential specific styling and easier targeting
    return `<div class="gynecologic-findings-container">${findingsHtml || '<p>No significant findings entered / Không nhập kết quả nào.</p>'}</div>`;
}


console.log("gynecologic-module.js loaded.");