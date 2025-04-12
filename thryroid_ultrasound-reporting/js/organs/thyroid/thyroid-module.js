// js/organs/thyroid/thyroid-module.js
// Module specific to Thyroid ultrasound reporting.

// Core imports
import { showNotification } from '../../core/ui-core.js';
import { populateForm, getFormData } from '../../core/form-core.js'; // Use updated v4
// Module imports
import { setupThyroidVolumeCalculations } from '../../modules/volume-calculator.js';
import { setupTiradsCalculationForLesion, updateTiradsDisplay } from '../../modules/tirads-calculator.js';
// import { clearImageData } from '../../modules/image-handler.js'; // Uncomment if image handling is used

// Module-level variables
let lesionCounter = 0; // Counter for unique lesion IDs
const hideSuggestionTimeouts = {}; // Object to store suggestion hide timeouts

/**
 * Initializes the thyroid module functionalities.
 */
export function init() {
    console.log("[ThyroidModule] Initializing...");
    try {
        setupThyroidVolumeCalculations(); // Setup for main gland dimensions

        const addLesionBtn = document.getElementById('add-lesion-btn');
        const thyroidForm = document.getElementById('thyroid-form'); // Main container

        if (addLesionBtn) {
            addLesionBtn.addEventListener('click', addLesionElement);
        } else {
            console.warn("[ThyroidModule] Add Lesion button ('#add-lesion-btn') not found.");
        }

        if (thyroidForm) {
            // Event Delegation for dynamic elements within the form
            thyroidForm.addEventListener('click', function(event) {
                const target = event.target;
                if (target.classList.contains('suggestion-btn')) {
                    handleSuggestionButtonClick(target);
                    const container = target.closest('.suggestion-button-container');
                    if (container) container.style.display = 'none';
                } else if (target.classList.contains('remove-lesion-btn')) {
                    removeLesionElement(target);
                }
            });
            // Initial suggestion setup for elements present on load
            setupSuggestionVisibility(thyroidForm);
        } else {
             console.warn("[ThyroidModule] Thyroid form element ('#thyroid-form') not found for event delegation or initial setup.");
        }

        console.log("[ThyroidModule] Initialized successfully.");
    } catch (error) {
         console.error("[ThyroidModule] Error during initialization:", error);
         showNotification("Failed to initialize thyroid module.", "error");
    }
}

/**
 * Sets up focus/blur listeners for suggestion buttons visibility.
 * @param {HTMLElement} parentElement - Element to search within (form or lesion item).
 */
function setupSuggestionVisibility(parentElement) {
     const suggestionContainers = parentElement.querySelectorAll('.suggestion-button-container');
     // console.debug(`[ThyroidModule] Setting up suggestion visibility for ${suggestionContainers.length} containers in`, parentElement);
     suggestionContainers.forEach(container => {
         const textarea = container.previousElementSibling;
         if (textarea && textarea.tagName === 'TEXTAREA') {
             let textareaId = textarea.id || `textarea_${Date.now()}_${Math.random().toString(16).slice(2)}`;
             textarea.id = textareaId; // Ensure it has an ID

             // Remove existing listeners first to prevent duplicates if called multiple times on same element
             textarea.removeEventListener('focus', handleTextareaFocus);
             textarea.removeEventListener('blur', handleTextareaBlur);

             // Add new listeners
             textarea.addEventListener('focus', handleTextareaFocus);
             textarea.addEventListener('blur', handleTextareaBlur);
         }
     });
}

// Named function for focus listener
function handleTextareaFocus(event) {
    const textarea = event.target;
    const textareaId = textarea.id;
    const container = textarea.nextElementSibling; // Assuming container is immediate sibling
    // console.debug(`[ThyroidModule] Focus on textarea: ${textareaId}`);
    if (hideSuggestionTimeouts[textareaId]) {
        clearTimeout(hideSuggestionTimeouts[textareaId]);
        delete hideSuggestionTimeouts[textareaId];
    }
    if(container && container.classList.contains('suggestion-button-container')) {
        container.style.display = 'flex';
    }
}

// Named function for blur listener
function handleTextareaBlur(event) {
    const textarea = event.target;
    const textareaId = textarea.id;
    const container = textarea.nextElementSibling;
    // console.debug(`[ThyroidModule] Blur on textarea: ${textareaId}`);
    if(container && container.classList.contains('suggestion-button-container')) {
        hideSuggestionTimeouts[textareaId] = setTimeout(() => {
            container.style.display = 'none';
            delete hideSuggestionTimeouts[textareaId];
        }, 250);
    }
}


/**
 * Handles suggestion button clicks.
 * @param {HTMLButtonElement} button - The button clicked.
 */
function handleSuggestionButtonClick(button) {
    const textToInsert = button.dataset.insert;
    const formGroup = button.closest('.form-group');
    const targetTextarea = formGroup ? formGroup.querySelector('textarea') : null;
    if (targetTextarea && textToInsert !== undefined) { // Check if data-insert exists
        const currentValue = targetTextarea.value;
        let separator = '';
        if (currentValue.trim().length > 0) {
            const lastChar = currentValue.trim().slice(-1);
            separator = ['.', '?', '!', ':', ';', ','].includes(lastChar) ? ' ' : '. ';
        }
        targetTextarea.value += separator + textToInsert;
        targetTextarea.dispatchEvent(new Event('input', { bubbles: true }));
        targetTextarea.focus();
        targetTextarea.scrollTop = targetTextarea.scrollHeight; // Scroll to bottom
    } else {
        console.warn("[handleSuggestionButtonClick] Target textarea or data-insert attribute not found.", button);
    }
}

/**
 * Adds a new lesion entry section to the form.
 */
function addLesionElement() {
    lesionCounter++;
    const template = document.getElementById('lesion-template');
    const lesionsContainer = document.getElementById('lesions-container');
    if (!template || !lesionsContainer) {
        console.error("[addLesionElement] Lesion template or container not found.");
        return;
    }

    try {
        const clone = template.content.cloneNode(true);
        const lesionItem = clone.querySelector('.lesion-item');
        if (!lesionItem) {
             console.error("[addLesionElement] '.lesion-item' div not found in template content.");
             return;
        }

        const lesionId = `lesion_${lesionCounter}`;
        lesionItem.dataset.lesionId = lesionId; // Useful for tracking
        const numberSpan = lesionItem.querySelector('.lesion-number');
        if (numberSpan) numberSpan.textContent = lesionCounter;

        // Append the new structure to the DOM *before* trying to set up listeners on it
        lesionsContainer.appendChild(clone);

        // Setup functionalities specific to the newly added lesionItem DIV
        setupTiradsCalculationForLesion(lesionItem); // Setup TI-RADS listeners
        setupSuggestionVisibility(lesionItem); // Setup suggestion listeners within new item

        showNotification(`Lesion ${lesionCounter} added. / Thêm tổn thương ${lesionCounter}.`, 'info', 1500);
        lesionItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    } catch (error) {
        console.error("[addLesionElement] Error:", error);
        showNotification("Failed to add new lesion section.", "error");
    }
}


/**
 * Removes a lesion entry section.
 * @param {HTMLButtonElement} removeButton - The remove button clicked.
 */
function removeLesionElement(removeButton) {
    const lesionItem = removeButton.closest('.lesion-item');
    if (lesionItem) {
        const lesionNumberText = lesionItem.querySelector('.lesion-number')?.textContent;
        const lesionId = lesionItem.dataset.lesionId;
        const confirmText = lesionNumberText ? `Lesion ${lesionNumberText}` : (lesionId || 'this lesion');

        if (confirm(`Are you sure you want to remove ${confirmText}? / Xóa tổn thương ${lesionNumberText || lesionId}?`)) {
             lesionItem.remove();
             showNotification(`${confirmText} removed. / Đã xóa.`, 'info', 1500);
             // Note: Re-numbering lesions dynamically after removal is complex and not implemented here.
        }
    } else {
        console.warn("[removeLesionElement] Could not find parent '.lesion-item'.", removeButton);
    }
}

/**
 * Collects all data for the thyroid assessment.
 * @returns {object | null} - Thyroid data object or null on error.
 */
export function collectThyroidData() {
    // console.log("[ThyroidModule] Collecting thyroid data...");
    const mainForm = document.getElementById('thyroid-form');
    if (!mainForm) {
        console.error("[collectThyroidData] Main form '#thyroid-form' not found.");
        return null;
    }
    try {
        // Use getFormData scoped to the main form, it should ignore inputs within lesion items if they are nested correctly
        const basicData = getFormData(mainForm);
        const lesionsData = [];
        const lesionItems = mainForm.querySelectorAll('#lesions-container > .lesion-item'); // Direct children

        lesionItems.forEach((lesionItem, index) => {
            // Use getFormData scoped to the specific lesion item DIV
            const lesionFormData = getFormData(lesionItem);
            // Ensure IDs/Numbers are consistent
            lesionFormData.id = lesionItem.dataset.lesionId || `lesion_${index + 1}`;
            lesionFormData.number = index + 1;
            lesionsData.push(lesionFormData);
        });

        // Check for potential conflicts before merging
        if (basicData.hasOwnProperty('lesions')) {
            console.warn("[collectThyroidData] Main form contains a field named 'lesions'. This will be overwritten by the lesions array.");
        }
        if (basicData.hasOwnProperty('formatReportSectionHtml')) {
            console.warn("[collectThyroidData] Main form contains a field named 'formatReportSectionHtml'. This will be overwritten.");
        }


        const fullData = {
            ...basicData, // Gland-level data
            lesions: lesionsData, // Array of lesion data objects
            formatReportSectionHtml: function() { return formatThyroidReportSectionHtml(this); } // Attach formatter
        };
        // console.debug("[collectThyroidData] Collected data:", fullData);
        return fullData;
    } catch (error) {
        console.error("[collectThyroidData] Error:", error);
        showNotification("Failed to collect thyroid data.", "error");
        return null;
    }
}


/**
 * Loads template data into the thyroid section.
 * @param {object} thyroidTemplateData - Thyroid-specific template data object.
 */
export function loadThyroidTemplateData(thyroidTemplateData) {
    if (!thyroidTemplateData || typeof thyroidTemplateData !== 'object') {
         console.warn("[loadThyroidTemplateData] Invalid or missing thyroid template data.");
         return;
    }
    console.log("[loadThyroidTemplateData] Loading thyroid template...");

    // 1. Clear existing lesions
    const lesionsContainer = document.getElementById('lesions-container');
    if (lesionsContainer) {
        lesionsContainer.innerHTML = '';
    } else {
        console.error("[loadThyroidTemplateData] Lesions container '#lesions-container' not found!");
        return;
    }
    lesionCounter = 0;

    // 2. Prepare gland data (exclude 'lesions' array)
    const glandDataToPopulate = { ...thyroidTemplateData };
    delete glandDataToPopulate.lesions; // Don't try to populate main form with the array

    // 3. Populate static fields (suppress events)
    try {
        // Target the main form explicitly for gland data
        populateForm('#thyroid-form', glandDataToPopulate, { dispatchEvents: false });
    } catch (formError) {
        console.error("[loadThyroidTemplateData] Error populating main thyroid form:", formError);
        // Decide whether to continue
    }

    // 4. Add and populate lesions from the 'lesions' array
    if (thyroidTemplateData.lesions && Array.isArray(thyroidTemplateData.lesions)) {
        console.log(`[loadThyroidTemplateData] Processing ${thyroidTemplateData.lesions.length} lesions from template.`);
        thyroidTemplateData.lesions.forEach((lesionData, index) => {
            if (typeof lesionData === 'object' && lesionData !== null) {
                console.log(`[loadThyroidTemplateData] Processing lesion #${index + 1}...`);
                addLesionElementAndPopulate(lesionData); // Use the helper which now handles errors per lesion
            } else {
                 console.warn(`[loadThyroidTemplateData] Invalid lesion data at index ${index}. Skipping.`);
            }
        });
    }

    // 5. Trigger necessary updates AFTER all population attempts
    console.log("[loadThyroidTemplateData] Triggering post-population updates...");
    // Trigger volume calculation update for main gland dimensions
    document.querySelectorAll('#thyroid-assessment .dimension-group input.dimension[data-lobe]').forEach(input => {
         input.dispatchEvent(new Event('input', { bubbles: true }));
         input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    // TI-RADS updates are handled within addLesionElementAndPopulate after each successful population

    console.log("[loadThyroidTemplateData] Finished applying template data process.");
}


/**
 * Helper to add, append, populate a lesion item, and set up its listeners.
 * Includes error handling for the population step.
 * @param {object} lesionData - Data object for a single lesion.
 */
function addLesionElementAndPopulate(lesionData) {
     lesionCounter++;
     const template = document.getElementById('lesion-template');
     const lesionsContainer = document.getElementById('lesions-container');
     if (!template || !lesionsContainer) { return; } // Guard clauses

     try {
         const clone = template.content.cloneNode(true);
         const lesionItem = clone.querySelector('.lesion-item'); // Get the wrapper DIV
         if (!lesionItem) {
            console.error("[addLesionElementAndPopulate] '.lesion-item' DIV not found in template content.");
            return;
         }

         const lesionId = lesionData.id || `lesion_${lesionCounter}`;
         lesionItem.dataset.lesionId = lesionId;
         const numberSpan = lesionItem.querySelector('.lesion-number');
         if (numberSpan) numberSpan.textContent = lesionCounter;

         // 1. Append the structure to the DOM FIRST
         lesionsContainer.appendChild(clone);

         // 2. Populate the fields WITHIN the newly appended lesionItem DIV (suppress events)
         try {
             // Pass the lesionItem DIV element directly
             populateForm(lesionItem, lesionData, { dispatchEvents: false });
         } catch (populateError) {
             // Log the error and potentially mark the item, but continue to next lesion
             console.error(`[addLesionElementAndPopulate] Error during populateForm for lesion ${lesionId}:`, populateError);
             showNotification(`Error populating data for lesion ${lesionCounter}. Check console.`, "error");
             lesionItem.classList.add('populate-error'); // Add class for styling/identification
             return; // Stop processing THIS lesion, but allow loop in loadThyroidTemplateData to continue
         }

         // 3. Setup TI-RADS listeners AFTER successful population
         setupTiradsCalculationForLesion(lesionItem);

         // 4. Manually trigger TI-RADS update based on populated data
         // This should now work as data is set and listeners are attached
         // console.debug(`[addLesionElementAndPopulate] Updating TI-RADS display for ${lesionId}`);
         updateTiradsDisplay(lesionItem);

         // 5. Setup suggestion visibility for textareas within this item
         setupSuggestionVisibility(lesionItem);

     } catch (error) {
         // Catch errors during cloning or appending
         console.error("[addLesionElementAndPopulate] Error creating/appending lesion structure:", error);
         showNotification("Failed to create new lesion structure.", "error");
     }
}


/**
 * Formats the FINDINGS section for a Thyroid report as an HTML string.
 * @param {object} data - Collected thyroid data object.
 * @returns {string} - Formatted findings HTML block string.
 */
function formatThyroidReportSectionHtml(data) {
     if (!data) return "<p>Error: No thyroid data provided.</p>";
     // console.log("[ThyroidModule] Formatting Thyroid report section...");

     // Helper to safely get value and format multiline text
     const getValue = (obj, key, fallback = 'N/A') => (obj && obj[key] !== null && obj[key] !== undefined && obj[key] !== '') ? obj[key] : fallback;
     const formatText = (text) => text ? String(text).replace(/\n/g, '<br>&nbsp;&nbsp;') : 'N/A';

     let findings = `<h4>THYROID GLAND / TUYẾN GIÁP:</h4>`;
     findings += `<p><strong>Overall Size / Kích thước chung:</strong> ${formatText(getValue(data, 'overallSize'))}<br>`;
     findings += `<strong>Echotexture / Cấu trúc hồi âm:</strong> ${formatText(getValue(data, 'echotexture'))}<br>`;
     findings += `<strong>Vascularity / Tưới máu:</strong> ${formatText(getValue(data, 'vascularity'))}</p>`;

     findings += `<h4>Right Lobe / Thùy Phải:</h4><p><strong>Dimensions / Kích thước (WxAPxL):</strong> ${getValue(data, 'rightLobeD1','?')} x ${getValue(data, 'rightLobeD2','?')} x ${getValue(data, 'rightLobeD3','?')} mm<br><strong>Volume / Thể tích:</strong> ${getValue(data, 'rightLobeVolume','N/A')} mL<br><strong>Findings / Mô tả:</strong> ${formatText(getValue(data, 'rightLobeFindings'))}</p>`;
     findings += `<h4>Left Lobe / Thùy Trái:</h4><p><strong>Dimensions / Kích thước (WxAPxL):</strong> ${getValue(data, 'leftLobeD1','?')} x ${getValue(data, 'leftLobeD2','?')} x ${getValue(data, 'leftLobeD3','?')} mm<br><strong>Volume / Thể tích:</strong> ${getValue(data, 'leftLobeVolume','N/A')} mL<br><strong>Findings / Mô tả:</strong> ${formatText(getValue(data, 'leftLobeFindings'))}</p>`;
     findings += `<h4>Isthmus / Eo Giáp:</h4><p><strong>AP Thickness / Bề dày TS:</strong> ${getValue(data, 'isthmusThickness') !== 'N/A' ? getValue(data, 'isthmusThickness') + ' mm' : 'N/A'}<br><strong>Findings / Mô tả:</strong> ${formatText(getValue(data, 'isthmusFindings'))}</p>`;

     findings += `<h4>FOCAL LESIONS / TỔN THƯƠNG KHU TRÚ:</h4>`;
     if (data.lesions && Array.isArray(data.lesions) && data.lesions.length > 0) {
         data.lesions.forEach((lesion, index) => {
            findings += `<div class="report-lesion-item" style="margin-bottom: 10px; padding-left: 15px; border-left: 2px solid #eee;">`;
            findings += `<p><strong><u>Lesion #${index + 1} / Tổn thương #${index + 1}:</u></strong><br>`;
            findings += `&nbsp;&nbsp;<strong>Location / Vị trí:</strong> ${formatText(getValue(lesion, 'lesionLocation'))}<br>`;
            findings += `&nbsp;&nbsp;<strong>Size / Kích thước (WxAPxL):</strong> ${getValue(lesion, 'lesionD1','?')} x ${getValue(lesion, 'lesionD2','?')} x ${getValue(lesion, 'lesionD3','?')} mm<br>`;
            // Map TI-RADS values to text for report readability
            findings += `&nbsp;&nbsp;<strong>Composition / Thành phần:</strong> ${formatText(mapTiradsValueToText('Composition', getValue(lesion, 'lesionComposition')))}<br>`;
            findings += `&nbsp;&nbsp;<strong>Echogenicity / Hồi âm:</strong> ${formatText(mapTiradsValueToText('Echogenicity', getValue(lesion, 'lesionEchogenicity')))}<br>`;
            findings += `&nbsp;&nbsp;<strong>Shape / Hình dạng:</strong> ${formatText(mapTiradsValueToText('Shape', getValue(lesion, 'lesionShape')))}<br>`;
            findings += `&nbsp;&nbsp;<strong>Margin / Bờ:</strong> ${formatText(mapTiradsValueToText('Margin', getValue(lesion, 'lesionMargin')))}<br>`;
            const fociValues = getValue(lesion, 'lesionEchogenicFoci', []); // Expecting array of values like ["1", "2"]
            const fociText = Array.isArray(fociValues) && fociValues.length > 0
                             ? fociValues.map(f => mapTiradsValueToText('Foci', f)).join(', ')
                             : 'None / Không có';
            findings += `&nbsp;&nbsp;<strong>Echogenic Foci / Hồi âm dày:</strong> ${formatText(fociText)}<br>`;
            findings += `&nbsp;&nbsp;<strong>ACR TI-RADS Score / Điểm:</strong> ${getValue(lesion, 'tiradsScore')}<br>`;
            findings += `&nbsp;&nbsp;<strong>ACR TI-RADS Category / Phân loại:</strong> ${formatText(getValue(lesion, 'tiradsCategory'))}<br>`;
            findings += `&nbsp;&nbsp;<strong>Recommendation / Đề nghị:</strong> ${formatText(getValue(lesion, 'tiradsRecommendation'))}<br>`;
            findings += `&nbsp;&nbsp;<strong>Description / Mô tả chi tiết:</strong> ${formatText(getValue(lesion, 'lesionDescription'))}</p>`;
            findings += `</div>`;
         });
     } else {
         findings += `<p>No discrete focal lesions identified. / Không thấy tổn thương khu trú rõ rệt.</p>`;
     }

     findings += `<h4>REGIONAL LYMPH NODES / HẠCH VÙNG CỔ:</h4><p>${formatText(getValue(data, 'lymphNodes', 'Not assessed or no significant findings. / Không đánh giá hoặc không thấy bất thường đáng kể.'))}</p>`;
     findings += `<h4>IMPRESSION / KẾT LUẬN:</h4><p>${formatText(getValue(data, 'impression'))}</p>`;
     const recommendation = getValue(data, 'recommendation', '');
     if (recommendation !== 'N/A' && recommendation !== '') {
        findings += `<h4>RECOMMENDATION / ĐỀ NGHỊ:</h4><p>${formatText(recommendation)}</p>`;
     }

     return findings;
}

// Helper function to map TI-RADS numeric string values back to readable text
// Used ONLY for formatting the final report section HTML
function mapTiradsValueToText(featureType, value) {
    // Added more specific text, trying to match HTML options where possible
    const map = {
        Composition: { '0': 'Cystic/Spongiform / Nang/Bọt biển', '1': 'Mixed / Hỗn hợp', '2': 'Solid / Đặc' },
        Echogenicity: { '0': 'Anechoic / Trống âm', '1': 'Hyper/Isoechoic / Tăng/Đồng âm', '2': 'Hypoechoic / Giảm âm', '3': 'Very Hypoechoic / Rất giảm âm' },
        Shape: { '0': 'Wider-than-tall / Rộng hơn cao', '3': 'Taller-than-wide / Cao hơn rộng' },
        Margin: { '0': 'Smooth or Ill-defined / Trơn láng/Không rõ', '2': 'Lobulated or Irregular / Bờ thùy/Không đều', '3': 'Extra-thyroidal extension / Xâm lấn vỏ bao' },
        Foci: { '0': 'None or Large comet-tail / Không/Đuôi sao chổi lớn', '1': 'Macro/Rim Calc. / Vôi hóa thô/Viền', '2': 'Punctate (PEF) / Vi vôi hóa (PEF)' }
    };
    return map[featureType]?.[value] || value || 'N/A'; // Return mapped text, original value, or N/A
}


console.log("thyroid-module.js loaded v4");