// js/organs/breast/breast-module.js
// Module specific to Breast ultrasound reporting logic.

// --- Core Imports ---
import { showNotification } from '../../core/ui-core.js';
import { populateForm, getFormData } from '../../core/form-core.js';

// --- Module Imports ---
// Import BI-RADS calculator functions
import { setupBiradsCalculationForLesion, updateBiradsDisplay } from '../../modules/birads-calculator.js';

// --- Module-level variables ---
let breastLesionCounter = 0; // Counter for unique breast lesion IDs
const hideSuggestionTimeoutsBreast = {}; // Separate timeout tracker for breast textareas

// --- Initialization ---
/**
 * Initializes the breast module functionalities.
 * Sets up event listeners specific to the breast assessment form.
 */
export function init() {
    console.log("[BreastModule] Initializing...");
    try {
        const addBreastLesionBtn = document.getElementById('add-breast-lesion-btn');
        const breastForm = document.getElementById('breast-assessment-form');

        if (!breastForm) {
            console.error("[BreastModule] CRITICAL: Breast assessment form ('#breast-assessment-form') not found. Module cannot function.");
            showNotification("Error: Breast assessment UI not found.", "error");
            return; // Stop initialization if form is missing
        }

        // Add Lesion Button Listener
        if (addBreastLesionBtn) {
            addBreastLesionBtn.addEventListener('click', addBreastLesionElement);
        } else {
            console.warn("[BreastModule] Add Breast Lesion button ('#add-breast-lesion-btn') not found.");
        }

        // Event Delegation for dynamic elements (remove lesion, suggestion buttons)
        breastForm.addEventListener('click', function(event) {
            const target = event.target;

            // Handle Remove Button click
            if (target.classList.contains('remove-breast-lesion-btn')) {
                removeBreastLesionElement(target);
            }
            // Handle Suggestion Button click
            else if (target.classList.contains('suggestion-btn')) {
                handleSuggestionButtonClickBreast(target); // Use breast-specific handler name
                const container = target.closest('.suggestion-button-container');
                if (container) container.style.display = 'none'; // Hide after click
            }
        });

        // Setup suggestion visibility for textareas present on initial load
        setupSuggestionVisibilityBreast(breastForm);

        console.log("[BreastModule] Initialized successfully.");
    } catch (error) {
        console.error("[BreastModule] Error during initialization:", error);
        showNotification("Failed to initialize breast module.", "error");
    }
}

// --- Suggestion Button Handling ---
/**
 * Sets up focus/blur listeners for suggestion buttons visibility within a parent element.
 * @param {HTMLElement} parentElement - Element to search within (form or lesion item).
 */
function setupSuggestionVisibilityBreast(parentElement) {
    const suggestionContainers = parentElement.querySelectorAll('.suggestion-button-container');
    // console.debug(`[BreastModule] Setting up suggestion visibility for ${suggestionContainers.length} containers in`, parentElement);
    suggestionContainers.forEach(container => {
        const textarea = container.previousElementSibling; // Assumes textarea is right before container
        if (textarea && (textarea.tagName === 'TEXTAREA' || textarea.tagName === 'INPUT')) { // Allow for input fields too
            let elementId = textarea.id || `input_${Date.now()}_${Math.random().toString(16).slice(2)}`;
            textarea.id = elementId; // Ensure it has an ID

            // Ensure no duplicate listeners
            textarea.removeEventListener('focus', handleTextareaFocusBreast);
            textarea.removeEventListener('blur', handleTextareaBlurBreast);

            // Add new listeners
            textarea.addEventListener('focus', handleTextareaFocusBreast);
            textarea.addEventListener('blur', handleTextareaBlurBreast);
        } else {
             // console.warn("[BreastModule] Could not find textarea/input before suggestion container:", container);
        }
    });
}

// Named function for focus listener
function handleTextareaFocusBreast(event) {
    const textarea = event.target;
    const textareaId = textarea.id;
    const container = textarea.nextElementSibling;
    // console.debug(`[BreastModule] Focus on: ${textareaId}`);
    if (hideSuggestionTimeoutsBreast[textareaId]) {
        clearTimeout(hideSuggestionTimeoutsBreast[textareaId]);
        delete hideSuggestionTimeoutsBreast[textareaId];
    }
    if (container && container.classList.contains('suggestion-button-container')) {
        container.style.display = 'flex'; // Use 'flex' as defined in CSS
    }
}

// Named function for blur listener
function handleTextareaBlurBreast(event) {
    const textarea = event.target;
    const textareaId = textarea.id;
    const container = textarea.nextElementSibling;
    // console.debug(`[BreastModule] Blur on: ${textareaId}`);
    if (container && container.classList.contains('suggestion-button-container')) {
        // Delay hiding to allow clicking on a suggestion button
        hideSuggestionTimeoutsBreast[textareaId] = setTimeout(() => {
            container.style.display = 'none';
            delete hideSuggestionTimeoutsBreast[textareaId];
        }, 250); // 250ms delay
    }
}

/**
 * Handles suggestion button clicks for breast module.
 * @param {HTMLButtonElement} button - The button clicked.
 */
function handleSuggestionButtonClickBreast(button) {
    const textToInsert = button.dataset.insert;
    // Find the target input/textarea (usually the preceding sibling of the container)
    const container = button.closest('.suggestion-button-container');
    const targetElement = container ? container.previousElementSibling : null;

    if (targetElement && (targetElement.tagName === 'TEXTAREA' || targetElement.tagName === 'INPUT') && textToInsert !== undefined) {
        const currentValue = targetElement.value;
        let separator = '';
        // Add a space or period+space if the current value is not empty
        if (currentValue.trim().length > 0) {
            const lastChar = currentValue.trim().slice(-1);
            // Avoid double periods or spaces
            separator = ['.', '?', '!', ':', ';', ','].includes(lastChar) ? ' ' : '. ';
            if (currentValue.endsWith(' ') || currentValue.endsWith('\n')) {
                 separator = ''; // No separator if ending with space/newline
            }
        }
        targetElement.value += separator + textToInsert;
        // Trigger 'input' event for any listeners (like calculators)
        targetElement.dispatchEvent(new Event('input', { bubbles: true }));
        targetElement.focus(); // Bring focus back
        // Scroll to end if textarea
        if(targetElement.tagName === 'TEXTAREA') {
            targetElement.scrollTop = targetElement.scrollHeight;
        }
    } else {
        console.warn("[BreastModule] Target input/textarea or data-insert attribute not found for suggestion button.", button);
    }
}


// --- Lesion Handling ---

/**
 * Adds a new, empty breast lesion entry section to the form.
 */
function addBreastLesionElement() {
    breastLesionCounter++;
    const template = document.getElementById('breast-lesion-template');
    const container = document.getElementById('breast-lesions-container');

    if (!template || !container) {
        console.error("[BreastModule] Breast lesion template ('#breast-lesion-template') or container ('#breast-lesions-container') not found.");
        showNotification("Cannot add breast lesion: UI elements missing.", "error");
        breastLesionCounter--; // Roll back counter
        return;
    }

    try {
        const clone = template.content.cloneNode(true);
        const lesionItem = clone.querySelector('.breast-lesion-item');
        if (!lesionItem) throw new Error("'.breast-lesion-item' not found in template content.");

        const lesionId = `breast_lesion_${Date.now()}_${breastLesionCounter}`; // More unique ID
        lesionItem.dataset.lesionId = lesionId;

        // Update lesion number display
        const numberSpans = lesionItem.querySelectorAll('.lesion-number'); // Update all spans if multiple
        numberSpans.forEach(span => span.textContent = breastLesionCounter);

        // Append the new structure to the DOM FIRST
        container.appendChild(clone);

        // Get the newly added element from the container (clone is a DocumentFragment)
        const addedLesionItem = container.querySelector(`[data-lesion-id="${lesionId}"]`);
        if (!addedLesionItem) throw new Error("Could not find the added lesion item in DOM.");

        // Setup BI-RADS calculation for the new lesion item
        setupBiradsCalculationForLesion(addedLesionItem); // Call the function from birads-calculator.js

        // Setup suggestion visibility for any textareas within the new item
        setupSuggestionVisibilityBreast(addedLesionItem);

        showNotification(`Breast Lesion ${breastLesionCounter} added.`, 'info', 1500);
        addedLesionItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    } catch (error) {
        console.error("[BreastModule] Error adding breast lesion element:", error);
        showNotification("Failed to add new breast lesion section.", "error");
        breastLesionCounter--; // Roll back counter
    }
}

/**
 * Removes a breast lesion entry section from the form.
 * @param {HTMLButtonElement} removeButton - The remove button that was clicked.
 */
function removeBreastLesionElement(removeButton) {
    const lesionItem = removeButton.closest('.breast-lesion-item');
    if (lesionItem) {
        const lesionNumberText = lesionItem.querySelector('.lesion-number')?.textContent || lesionItem.dataset.lesionId;
        if (confirm(`Are you sure you want to remove Lesion ${lesionNumberText}? / Xóa tổn thương ${lesionNumberText}?`)) {
            lesionItem.remove();
            showNotification(`Lesion ${lesionNumberText} removed.`, 'info', 1500);
            // Note: Re-numbering remaining lesions is complex and usually not necessary for data collection.
            // If re-numbering is visually desired, it would require iterating over remaining items and updating their '.lesion-number' spans.
        }
    } else {
        console.warn("[BreastModule] Could not find parent '.breast-lesion-item' for removal.", removeButton);
    }
}

// --- Data Collection ---
/**
 * Collects all data for the breast assessment form, including dynamic lesions.
 * MUST return an object containing the data AND a function `formatReportSectionHtml`.
 * @returns {object | null} - Breast data object including the formatting function, or null on error.
 */
export function collectBreastData() {
    console.log("[BreastModule] Collecting breast data...");
    const form = document.getElementById('breast-assessment-form');
    if (!form) {
        console.error("[collectBreastData] Breast assessment form ('#breast-assessment-form') not found.");
        return null;
    }

    try {
        // 1. Get main form data (parenchyma, axilla, overall impression etc.)
        // Use getFormData scoped to the main form, EXCLUDING lesion items
        const mainFormData = {};
        const mainFields = form.querySelectorAll(':scope > .section .form-group > input[name], :scope > .section .form-group > select[name], :scope > .section .form-group > textarea[name]');
        mainFields.forEach(field => {
            if (!field.closest('.breast-lesion-item')) { // Ensure field is not inside a lesion item
                 if (field.type === 'checkbox') {
                     mainFormData[field.name] = field.checked;
                 } else if(field.type === 'radio'){
                     if(field.checked) mainFormData[field.name] = field.value;
                 } else {
                     mainFormData[field.name] = field.value;
                 }
            }
        });


        // 2. Get data for each dynamic lesion item
        const lesionsData = [];
        const lesionItems = form.querySelectorAll('#breast-lesions-container > .breast-lesion-item'); // Direct children

        lesionItems.forEach((lesionItem, index) => {
            // Use getFormData scoped specifically to this lesion item DIV
            const lesionFormData = getFormData(lesionItem);
            // Add ID and sequential number (useful for report formatting)
            lesionFormData.id = lesionItem.dataset.lesionId || `breast_lesion_${index + 1}`;
            lesionFormData.number = index + 1;
            // Data includes values from hidden inputs like biradsCategory, biradsRecommendation
            lesionsData.push(lesionFormData);
        });

        // 3. Combine main form data and lesions array
        const fullData = {
            ...mainFormData,      // Parenchyma, Axilla, Overall Impression/Reco etc.
            lesions: lesionsData, // Array of lesion objects
            // IMPORTANT: Attach the specific formatter function for the breast report section
            formatReportSectionHtml: function() { return formatBreastReportSectionHtml(this); }
        };

        console.debug("[collectBreastData] Collected Breast Data:", JSON.parse(JSON.stringify(fullData))); // Log a copy
        return fullData;

    } catch (error) {
        console.error("[collectBreastData] Error collecting breast data:", error);
        showNotification("Failed to collect breast assessment data.", "error");
        return null;
    }
}

// --- Template Loading ---
/**
 * Loads template data into the breast assessment section.
 * @param {object} breastTemplateData - Breast-specific template data object (content of the 'breast' key).
 */
export async function loadBreastTemplateData(breastTemplateData) {
    if (!breastTemplateData || typeof breastTemplateData !== 'object') {
        console.warn("[loadBreastTemplateData] Invalid or missing breast template data provided.");
        return; // Exit if data is invalid
    }
    console.log("[BreastModule] Loading breast template data...");
    const form = document.getElementById('breast-assessment-form');
    const lesionsContainer = document.getElementById('breast-lesions-container');

    if (!form || !lesionsContainer) {
        console.error("[loadBreastTemplateData] Breast form or lesions container not found! Cannot load template.");
        showNotification("Cannot load breast template: UI elements missing.", "error");
        return;
    }

    try {
        // 1. Clear existing lesions from the container
        lesionsContainer.innerHTML = '';
        breastLesionCounter = 0; // Reset counter

        // 2. Prepare main form data (exclude the 'lesions' array itself)
        const mainDataToPopulate = { ...breastTemplateData };
        delete mainDataToPopulate.lesions; // Don't try to populate the main form with the lesions array

        // 3. Populate static fields in the main form (suppress automatic events during population)
        // Target the main form explicitly
        populateForm(form, mainDataToPopulate, { dispatchEvents: false });
         console.log("[loadBreastTemplateData] Main form fields populated (events suppressed).");

        // 4. Add and populate lesion items from the template's 'lesions' array
        if (breastTemplateData.lesions && Array.isArray(breastTemplateData.lesions)) {
            console.log(`[loadBreastTemplateData] Processing ${breastTemplateData.lesions.length} breast lesions from template.`);
            // Use Promise.all if addLesionElementAndPopulate becomes async (due to dynamic imports)
            // await Promise.all(breastTemplateData.lesions.map(lesionData => {
            breastTemplateData.lesions.forEach(lesionData => { // ForEach is fine if helper is sync
                 if (typeof lesionData === 'object' && lesionData !== null) {
                    // Use the helper which adds DOM, populates, and sets up listeners/calculators
                    addLesionElementAndPopulate(lesionData); // Call the dedicated helper
                 } else {
                    console.warn(`[loadBreastTemplateData] Skipping invalid lesion data item in template array.`);
                 }
            });
            // })); // End Promise.all if used

        } else {
             console.log("[loadBreastTemplateData] No lesions found in the template data.");
        }

        // 5. Manually trigger updates if needed AFTER all population is done
        // e.g., If there were any main form calculations dependent on populated values.
        // BI-RADS updates for lesions are handled within addLesionElementAndPopulate.

        console.log("[loadBreastTemplateData] Finished applying breast template data.");
        // Notification is usually shown by the calling function in template-core

    } catch (error) {
        console.error("[loadBreastTemplateData] Error applying breast template:", error);
        showNotification("Failed to apply breast template data.", "error");
    }
}

/**
 * Helper to Add a lesion element, Populate it, and setup its Listeners/Calculators.
 * Ensures population happens *after* appending to DOM and *before* setting up calculators.
 * @param {object} lesionData - Data object for a single breast lesion from the template.
 */
function addLesionElementAndPopulate(lesionData) {
    breastLesionCounter++;
    const template = document.getElementById('breast-lesion-template');
    const container = document.getElementById('breast-lesions-container');
    if (!template || !container) {
         console.error("[addLesionElementAndPopulate] Template or Container not found.");
         breastLesionCounter--; // Roll back
         return;
    }

    let addedLesionItem = null; // To store reference to the added DOM element

    try {
        const clone = template.content.cloneNode(true);
        const lesionItem = clone.querySelector('.breast-lesion-item');
        if (!lesionItem) throw new Error("'.breast-lesion-item' not found in template.");

        const lesionId = lesionData.id || `breast_lesion_${Date.now()}_${breastLesionCounter}`;
        lesionItem.dataset.lesionId = lesionId;

        const numberSpans = lesionItem.querySelectorAll('.lesion-number');
        numberSpans.forEach(span => span.textContent = breastLesionCounter);

        // 1. Append Structure to DOM
        container.appendChild(clone);
        addedLesionItem = container.querySelector(`[data-lesion-id="${lesionId}"]`); // Get the actual element in DOM
        if (!addedLesionItem) throw new Error("Could not find the added lesion item in DOM after append.");


        // 2. Populate the fields WITHIN the newly added lesionItem (No events)
        try {
            // Pass the specific DOM element 'addedLesionItem' to populateForm
            populateForm(addedLesionItem, lesionData, { dispatchEvents: false });
             console.log(`[addLesionElementAndPopulate] Lesion ${lesionId} populated.`);
        } catch (populateError) {
            console.error(`[addLesionElementAndPopulate] Error during populateForm for lesion ${lesionId}:`, populateError);
            showNotification(`Error populating data for breast lesion ${breastLesionCounter}. Check console.`, "error");
            if(addedLesionItem) addedLesionItem.classList.add('populate-error'); // Mark the item visually
            return; // Stop processing THIS lesion if population fails critically
        }

        // 3. Setup BI-RADS Calculation for this specific item AFTER population
        // setupBiradsCalculationForLesion is responsible for the initial calculation display
        setupBiradsCalculationForLesion(addedLesionItem);
         console.log(`[addLesionElementAndPopulate] BI-RADS setup complete for lesion ${lesionId}.`);


        // 4. Setup suggestion visibility if applicable
        setupSuggestionVisibilityBreast(addedLesionItem);

    } catch (error) {
        // Catch errors during cloning, appending, or finding the element
        console.error("[addLesionElementAndPopulate] Error creating/appending/setting up lesion structure:", error);
        showNotification("Failed to create or setup new lesion structure from template.", "error");
         if (!addedLesionItem && container.lastChild?.dataset?.lesionId?.startsWith('breast_lesion_')) {
              // Attempt to remove potentially partially added item if population/setup failed early
             // container.lastChild.remove();
         }
        breastLesionCounter--; // Roll back counter if structure failed
    }
}


// --- Report Formatting ---
/**
 * Formats the FINDINGS section for a Breast report as an HTML string.
 * This function is attached to the object returned by collectBreastData.
 * @param {object} data - Collected breast data object (passed as 'this' context).
 * @returns {string} - Formatted findings HTML block string.
 */
function formatBreastReportSectionHtml(data) {
    console.log("[BreastModule] Formatting Breast report section HTML...");
    if (!data) return "<p>Error: No breast data provided for formatting.</p>";

    // Helper functions (can be defined outside if reused often)
    const getValue = (obj, key, fallback = 'N/A') => {
        const value = obj?.[key]; // Use optional chaining
        // Check for null, undefined, or empty string
        return (value !== null && value !== undefined && value !== '') ? value : fallback;
    };
    const formatText = (text) => {
         // Convert potential null/undefined to empty string before replacing
         const strText = (text === null || text === undefined) ? '' : String(text);
        // Replace newlines with <br> and indent subsequent lines for readability
        return strText.replace(/\n/g, '<br>&nbsp;&nbsp;');
    };
     const formatSize = (d1, d2, d3) => {
         const val1 = getValue(data, d1, '?');
         const val2 = getValue(data, d2, '?');
         const val3 = getValue(data, d3, '?');
         if (val1 === '?' && val2 === '?' && val3 === '?') return 'N/A';
         return `${val1} x ${val2} x ${val3} mm`;
     };


    let findings = `<h4>BREAST PARENCHYMA / MÔ TUYẾN VÚ:</h4>`;
    findings += `<p><strong>Background Echotexture / Cấu trúc nền:</strong> ${formatText(getValue(data, 'breastEchotexture'))}<br>`;
    findings += `<strong>Fibroglandular Tissue Density / Mật độ mô sợi tuyến:</strong> ${formatText(getValue(data, 'breastDensity'))}<br>`;
    findings += `<strong>Other Findings / Mô tả khác:</strong> ${formatText(getValue(data, 'parenchymaDescription', 'None / Không có'))}</p>`;

    findings += `<hr class="report-hr"><h4>FOCAL LESIONS / TỔN THƯƠNG KHU TRÚ:</h4>`;
    if (data.lesions && Array.isArray(data.lesions) && data.lesions.length > 0) {
        data.lesions.forEach((lesion) => { // Use lesion.number provided by collectBreastData
            findings += `<div class="report-lesion-item">`; // Style handled by print/preview CSS
            findings += `<p><strong><u>Lesion #${lesion.number} / Tổn thương #${lesion.number}:</u></strong><br>`; // Use collected number
            findings += `&nbsp;&nbsp;<strong>Location / Vị trí:</strong> ${formatText(getValue(lesion, 'lesionLocation'))}<br>`;
            findings += `&nbsp;&nbsp;<strong>Size / Kích thước (WxAPxL):</strong> ${formatSize('lesionD1','lesionD2','lesionD3')}<br>`;
            // --- BI-RADS Descriptors ---
            findings += `&nbsp;&nbsp;<strong>Shape / Hình dạng:</strong> ${formatText(getValue(lesion, 'lesionShape'))}<br>`;
            findings += `&nbsp;&nbsp;<strong>Orientation / Hướng:</strong> ${formatText(getValue(lesion, 'lesionOrientation'))}<br>`;
            findings += `&nbsp;&nbsp;<strong>Margin / Đường bờ:</strong> ${formatText(getValue(lesion, 'lesionMargin'))}<br>`;
            findings += `&nbsp;&nbsp;<strong>Echo Pattern / Cấu trúc hồi âm:</strong> ${formatText(getValue(lesion, 'lesionEchoPattern'))}<br>`;
            findings += `&nbsp;&nbsp;<strong>Posterior Features / Đặc điểm âm sau:</strong> ${formatText(getValue(lesion, 'lesionPosterior'))}<br>`;
            findings += `&nbsp;&nbsp;<strong>Calcifications / Vôi hóa:</strong> ${formatText(getValue(lesion, 'lesionCalcifications', 'N/A'))}<br>`;
             // --- BI-RADS Assessment (from hidden inputs) ---
             const biradsCat = getValue(lesion, 'biradsCategory', 'Undetermined / Chưa xác định');
            findings += `&nbsp;&nbsp;<strong>BI-RADS Assessment / Đánh giá BI-RADS:</strong> ${formatText(biradsCat)}<br>`;
             const biradsReco = getValue(lesion, 'biradsRecommendation', 'N/A');
            findings += `&nbsp;&nbsp;<strong>Recommendation (Lesion) / Đề nghị (Tổn thương):</strong> ${formatText(biradsReco)}<br>`;
            // --- Additional Description ---
            findings += `&nbsp;&nbsp;<strong>Description / Mô tả thêm:</strong> ${formatText(getValue(lesion, 'lesionDescription', 'N/A'))}</p>`;
            findings += `</div>`;
        });
    } else {
        findings += `<p>No discrete focal lesions identified. / Không thấy tổn thương khu trú rõ rệt.</p>`;
    }

    findings += `<hr class="report-hr"><h4>AXILLA / HỐ NÁCH:</h4>`;
    findings += `<p><strong>Right Axilla / Nách Phải:</strong> ${formatText(getValue(data, 'axillaRight', 'Unremarkable / Không ghi nhận bất thường.'))}<br>`;
    findings += `<strong>Left Axilla / Nách Trái:</strong> ${formatText(getValue(data, 'axillaLeft', 'Unremarkable / Không ghi nhận bất thường.'))}</p>`;

    // Impression and Overall Recommendation are part of the main data object
    findings += `<hr class="report-hr"><h4>IMPRESSION / KẾT LUẬN:</h4>`;
    findings += `<p>${formatText(getValue(data, 'impression'))}</p>`;
     // Optionally reiterate overall BI-RADS here for clarity in findings section
    findings += `<p><strong>Overall BI-RADS Assessment / Đánh giá BI-RADS tổng thể:</strong> ${formatText(getValue(data, 'overallBirads', 'See individual lesion assessment / Xem đánh giá từng tổn thương.'))}</p>`;

    const recommendation = getValue(data, 'recommendation', ''); // Overall recommendation
    if (recommendation !== 'N/A' && recommendation !== '') {
        findings += `<hr class="report-hr"><h4>RECOMMENDATION / ĐỀ NGHỊ:</h4><p>${formatText(recommendation)}</p>`;
    } else {
        // If no overall recommendation, maybe pull the highest recommendation from lesions? Optional complex logic.
    }


    console.log("[BreastModule] Finished formatting Breast report section HTML.");
    return findings;
}


console.log("breast-module.js loaded.");