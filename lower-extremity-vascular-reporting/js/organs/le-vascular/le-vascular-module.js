// js/organs/le-vascular/le-vascular-module.js
// Module specific to Lower Extremity Vascular (Arterial & Venous) ultrasound reporting logic.

// --- Core Imports ---
import { showNotification } from '../../core/ui-core.js';
import { populateForm, getFormData } from '../../core/form-core.js';

// --- Module-level variables ---
const hideSuggestionTimeoutsLEVascular = {}; // Timeout tracker for LE vascular textareas
let refluxEntryCounter = 1; // Counter for unique IDs in dynamically added reflux entries

// --- Constants ---
const ARTERIAL_SEGMENTS = ['Cfa', 'Pfa', 'SfaProx', 'SfaMid', 'SfaDist', 'PopA', 'Ata', 'Pta', 'PeroA', 'Dpa'];
const VENOUS_SEGMENTS = ['Cfv', 'FvProx', 'FvMid', 'FvDist', 'Pfv', 'PopV', 'Ptv', 'PeroV', 'Gastroc', 'Soleal', 'GsvAk', 'GsvBk', 'Ssv'];

// --- Initialization ---
/**
 * Initializes the LE Vascular module functionalities.
 * Sets up event listeners specific to the LE Vascular assessment form.
 */
export function init() {
    console.log("[LEVascularModule] Initializing...");
    try {
        const leVascularForm = document.getElementById('le-vascular-assessment-form');

        if (!leVascularForm) {
            console.error("[LEVascularModule] CRITICAL: LE Vascular assessment form ('#le-vascular-assessment-form') not found. Module cannot function.");
            showNotification("Error: LE Vascular assessment UI not found.", "error");
            return; // Stop initialization
        }

        // --- Event Delegation for suggestion buttons & remove reflux ---
        leVascularForm.addEventListener('click', function(event) {
            const target = event.target;
            // Handle Suggestion Button click
            if (target.classList.contains('suggestion-btn')) {
                handleSuggestionButtonClickLEVascular(target);
                const container = target.closest('.suggestion-button-container');
                if (container) container.style.display = 'none'; // Hide after click
            }
            // Handle Remove Reflux Button click
            else if (target.classList.contains('remove-reflux-btn')) {
                 const entry = target.closest('.reflux-entry');
                 if(entry && document.querySelectorAll('#venous-reflux-list .reflux-entry').length > 1) { // Keep at least one entry
                    entry.remove();
                    console.log("[LEVascularModule] Reflux entry removed.");
                 } else if (entry) {
                     showNotification("Cannot remove the last reflux entry.", "info");
                 }
            }
        });

        // --- Setup suggestion visibility ---
        // Needs to run after potential template loading, use timeout as safeguard
        setTimeout(() => setupSuggestionVisibilityLEVascular(leVascularForm), 100);

        // --- Setup ABI Calculation Listeners ---
        const abiInputs = leVascularForm.querySelectorAll('.abi-input');
        abiInputs.forEach(input => {
            input.addEventListener('input', handleAbiInputChange);
            input.addEventListener('change', handleAbiInputChange); // Also trigger on change
        });
        console.log("[LEVascularModule] ABI calculation listeners attached.");
        // Initial calculation in case of pre-filled values (e.g., from template)
        calculateAndDisplayABI('right');
        calculateAndDisplayABI('left');


         // --- Setup Add Reflux Entry Listener ---
         const addRefluxBtn = document.getElementById('add-reflux-btn');
         if (addRefluxBtn) {
             addRefluxBtn.addEventListener('click', addRefluxEntry);
             console.log("[LEVascularModule] Add Reflux Entry listener attached.");
         } else {
             console.warn("[LEVascularModule] Add Reflux button ('#add-reflux-btn') not found.");
         }

        console.log("[LEVascularModule] Initialized successfully.");
    } catch (error) {
        console.error("[LEVascularModule] Error during initialization:", error);
        showNotification("Failed to initialize LE Vascular module.", "error");
    }
}

// --- Suggestion Button Handling ---
function setupSuggestionVisibilityLEVascular(parentElement) {
    const suggestionContainers = parentElement.querySelectorAll('.suggestion-button-container');
    suggestionContainers.forEach(container => {
        const inputElement = container.previousElementSibling;
        if (inputElement && (inputElement.tagName === 'TEXTAREA' || inputElement.tagName === 'INPUT')) {
            let elementId = inputElement.id || `input_levascular_${Date.now()}_${Math.random().toString(16).slice(2)}`;
            inputElement.id = elementId;

            inputElement.removeEventListener('focus', handleTextareaFocusLEVascular);
            inputElement.removeEventListener('blur', handleTextareaBlurLEVascular);
            inputElement.addEventListener('focus', handleTextareaFocusLEVascular);
            inputElement.addEventListener('blur', handleTextareaBlurLEVascular);
        }
    });
}

function handleTextareaFocusLEVascular(event) {
    const inputElement = event.target;
    const elementId = inputElement.id;
    const container = inputElement.nextElementSibling;
    if (hideSuggestionTimeoutsLEVascular[elementId]) {
        clearTimeout(hideSuggestionTimeoutsLEVascular[elementId]);
        delete hideSuggestionTimeoutsLEVascular[elementId];
    }
    if (container && container.classList.contains('suggestion-button-container')) {
        container.style.display = 'flex';
    }
}

function handleTextareaBlurLEVascular(event) {
    const inputElement = event.target;
    const elementId = inputElement.id;
    const container = inputElement.nextElementSibling;
    if (container && container.classList.contains('suggestion-button-container')) {
        hideSuggestionTimeoutsLEVascular[elementId] = setTimeout(() => {
            container.style.display = 'none';
            delete hideSuggestionTimeoutsLEVascular[elementId];
        }, 250); // 250ms delay
    }
}

function handleSuggestionButtonClickLEVascular(button) {
    const textToInsert = button.dataset.insert;
    const container = button.closest('.suggestion-button-container');
    const targetElement = container ? container.previousElementSibling : null;

    if (targetElement && (targetElement.tagName === 'TEXTAREA' || targetElement.tagName === 'INPUT') && textToInsert !== undefined) {
        const currentValue = targetElement.value;
        let separator = '';
        if (currentValue.trim().length > 0 && !currentValue.endsWith(' ') && !currentValue.endsWith('\n')) {
            const lastChar = currentValue.trim().slice(-1);
             separator = ['.', '?', '!', ':', ';', ','].includes(lastChar) ? ' ' : '. ';
        }
        targetElement.value += separator + textToInsert;
        targetElement.dispatchEvent(new Event('input', { bubbles: true }));
        targetElement.focus();
        if(targetElement.tagName === 'TEXTAREA') {
            targetElement.scrollTop = targetElement.scrollHeight;
        }
    } else {
        console.warn("[LEVascularModule] Target input/textarea or data-insert attribute not found for suggestion button.", button);
    }
}

// --- ABI Calculation ---
function handleAbiInputChange(event) {
    const inputId = event.target.id;
    if (inputId.startsWith('right')) {
        calculateAndDisplayABI('right');
    } else if (inputId.startsWith('left')) {
        calculateAndDisplayABI('left');
    }
}

function calculateAndDisplayABI(leg) { // leg = 'right' or 'left'
    const form = document.getElementById('le-vascular-assessment-form');
    if (!form) return;

    const dpPressureInput = form.querySelector(`#${leg}DpPressure`);
    const ptPressureInput = form.querySelector(`#${leg}PtPressure`);
    const brachialPressureInput = form.querySelector(`#${leg}BrachialPressure`);
    const highestAnkleDisplay = form.querySelector(`#${leg}HighestAnkle`);
    const abiResultDisplay = form.querySelector(`#${leg}AbiResult`);
    const abiValueInput = form.querySelector(`#${leg}AbiValue`); // Hidden input

    if (!dpPressureInput || !ptPressureInput || !brachialPressureInput || !highestAnkleDisplay || !abiResultDisplay || !abiValueInput) {
        console.warn(`[LEVascularModule] ABI elements not found for ${leg} leg.`);
        return;
    }

    const dp = parseFloat(dpPressureInput.value);
    const pt = parseFloat(ptPressureInput.value);
    const brachial = parseFloat(brachialPressureInput.value);

    let highestAnkle = NaN;
    if (!isNaN(dp) && !isNaN(pt)) { highestAnkle = Math.max(dp, pt); }
    else if (!isNaN(dp)) { highestAnkle = dp; }
    else if (!isNaN(pt)) { highestAnkle = pt; }

    highestAnkleDisplay.textContent = isNaN(highestAnkle) ? '--' : highestAnkle.toFixed(0);

    let abi = NaN;
    if (!isNaN(highestAnkle) && !isNaN(brachial) && brachial > 0) {
        abi = highestAnkle / brachial;
    }

    if (isNaN(abi)) {
        abiResultDisplay.textContent = '--';
        abiValueInput.value = '';
    } else {
        abiResultDisplay.textContent = abi.toFixed(2);
        abiValueInput.value = abi.toFixed(2); // Store calculated value
    }
}

// --- Venous Reflux Entry Management ---
function addRefluxEntry() {
    const list = document.getElementById('venous-reflux-list');
    const firstEntry = list.querySelector('.reflux-entry');
    if (!list || !firstEntry) {
        console.error("[LEVascularModule] Cannot find reflux list or template entry.");
        return;
    }

    refluxEntryCounter++;

    const newEntry = firstEntry.cloneNode(true);

    newEntry.querySelectorAll('input, select').forEach(field => {
        if (field.type === 'select-one') { field.selectedIndex = 0; }
        else { field.value = ''; }

        const oldId = field.id;
        if (oldId) {
            const newId = oldId.replace(/_\d+$/, `_${refluxEntryCounter}`);
            field.id = newId;
            const label = newEntry.querySelector(`label[for="${oldId}"]`);
            if (label) { label.htmlFor = newId; }
        }
        // Keep names the same for easier collection with getFormData scoped to the entry
    });

    const removeBtn = newEntry.querySelector('.remove-reflux-btn');
    if(removeBtn) {
         removeBtn.onclick = () => {
            if(document.querySelectorAll('#venous-reflux-list .reflux-entry').length > 1) {
                 newEntry.remove();
                 console.log("[LEVascularModule] Cloned reflux entry removed.");
            } else {
                 showNotification("Cannot remove the last reflux entry.", "info");
            }
         };
    }

    list.appendChild(newEntry);
    console.log("[LEVascularModule] Reflux entry added.");
}


// --- Data Collection ---
/**
 * Collects all data for the LE Vascular assessment form.
 * Returns an object containing the data AND a function `formatReportSectionHtml`.
 * @returns {object | null} - LE Vascular data object including the formatting function, or null on error.
 */
export function collectLEVascularData() {
    console.log("[LEVascularModule] Collecting LE Vascular data...");
    const form = document.getElementById('le-vascular-assessment-form');
    if (!form) {
        console.error("[collectLEVascularData] LE Vascular assessment form ('#le-vascular-assessment-form') not found.");
        return null;
    }

    try {
        const allFormData = getFormData(form);

        const structuredData = {
            arterial: {
                abi: {
                    rightDpPressure: allFormData.rightDpPressure,
                    rightPtPressure: allFormData.rightPtPressure,
                    rightBrachialPressure: allFormData.rightBrachialPressure,
                    rightAbiValue: allFormData.rightAbiValue,
                    leftDpPressure: allFormData.leftDpPressure,
                    leftPtPressure: allFormData.leftPtPressure,
                    leftBrachialPressure: allFormData.leftBrachialPressure,
                    leftAbiValue: allFormData.leftAbiValue,
                },
                right: {},
                left: {}
            },
            venous: {
                reflux: [],
                right: {},
                left: {}
            },
            impression: allFormData.impression,
            recommendation: allFormData.recommendation
        };

        ARTERIAL_SEGMENTS.forEach(seg => {
            structuredData.arterial.right[seg.toLowerCase()] = {
                psv: allFormData[`right${seg}Psv`], edv: allFormData[`right${seg}Edv`],
                waveform: allFormData[`right${seg}Waveform`], desc: allFormData[`right${seg}Desc`],
            };
            structuredData.arterial.left[seg.toLowerCase()] = {
                psv: allFormData[`left${seg}Psv`], edv: allFormData[`left${seg}Edv`],
                waveform: allFormData[`left${seg}Waveform`], desc: allFormData[`left${seg}Desc`],
            };
        });

        VENOUS_SEGMENTS.forEach(seg => {
             structuredData.venous.right[seg.toLowerCase()] = {
                compress: allFormData[`right${seg}Compress`], doppler: allFormData[`right${seg}Doppler`],
                thrombus: allFormData[`right${seg}Thrombus`],
            };
            structuredData.venous.left[seg.toLowerCase()] = {
                 compress: allFormData[`left${seg}Compress`], doppler: allFormData[`left${seg}Doppler`],
                 thrombus: allFormData[`left${seg}Thrombus`],
            };
        });

         const refluxEntries = form.querySelectorAll('#venous-reflux-list .reflux-entry');
         refluxEntries.forEach(entry => {
             const entryData = getFormData(entry);
             if (entryData.refluxVeinName || entryData.refluxDuration || entryData.refluxManeuver) {
                 structuredData.venous.reflux.push({
                     veinName: entryData.refluxVeinName,
                     duration: entryData.refluxDuration,
                     maneuver: entryData.refluxManeuver,
                 });
             }
         });

        structuredData.formatReportSectionHtml = function() { return formatLEVascularReportSectionHtml(this); }

        console.debug("[collectLEVascularData] Collected LE Vascular Data:", JSON.parse(JSON.stringify(structuredData)));
        return structuredData;

    } catch (error) {
        console.error("[collectLEVascularData] Error collecting LE Vascular data:", error);
        showNotification("Failed to collect LE Vascular assessment data.", "error");
        return null;
    }
}


// --- Template Loading ---
/**
 * Loads template data into the LE Vascular assessment section.
 * @param {object} leVascularTemplateData - LE Vascular-specific template data (content of the 'leVascular' key).
 */
export async function loadLEVascularTemplateData(leVascularTemplateData) {
    if (!leVascularTemplateData || typeof leVascularTemplateData !== 'object') {
        console.warn("[loadLEVascularTemplateData] Invalid or missing LE Vascular template data provided.");
        return;
    }
    console.log("[LEVascularModule] Loading LE Vascular template data...");
    const form = document.getElementById('le-vascular-assessment-form');
    if (!form) {
        console.error("[loadLEVascularTemplateData] LE Vascular form not found! Cannot load template.");
        showNotification("Cannot load LE Vascular template: UI elements missing.", "error");
        return;
    }

    try {
        const flattenedData = {};
        // Flatten Arterial ABI
        if (leVascularTemplateData.arterial?.abi) {
            for (const key in leVascularTemplateData.arterial.abi) {
                flattenedData[key] = leVascularTemplateData.arterial.abi[key];
            }
        }
        // Flatten Arterial Segments
        ['right', 'left'].forEach(leg => {
            if (leVascularTemplateData.arterial?.[leg]) {
                ARTERIAL_SEGMENTS.forEach(seg => {
                    const segKeyLower = seg.toLowerCase(); // Use lowercase key for lookup
                    const segData = leVascularTemplateData.arterial[leg][segKeyLower];
                    if (segData) {
                        flattenedData[`${leg}${seg}Psv`] = segData.psv;
                        flattenedData[`${leg}${seg}Edv`] = segData.edv;
                        flattenedData[`${leg}${seg}Waveform`] = segData.waveform;
                        flattenedData[`${leg}${seg}Desc`] = segData.desc;
                    }
                });
            }
        });
         // Flatten Venous Segments
         ['right', 'left'].forEach(leg => {
            if (leVascularTemplateData.venous?.[leg]) {
                VENOUS_SEGMENTS.forEach(seg => {
                     const segKeyLower = seg.toLowerCase(); // Use lowercase key for lookup
                     const segData = leVascularTemplateData.venous[leg][segKeyLower];
                     if (segData) {
                         flattenedData[`${leg}${seg}Compress`] = segData.compress;
                         flattenedData[`${leg}${seg}Doppler`] = segData.doppler;
                         flattenedData[`${leg}${seg}Thrombus`] = segData.thrombus;
                     }
                 });
             }
         });
        // Flatten Impression/Recommendation
        flattenedData.impression = leVascularTemplateData.impression;
        flattenedData.recommendation = leVascularTemplateData.recommendation;

        // Populate Form Fields (excluding reflux)
        populateForm(form, flattenedData, { dispatchEvents: true });
        console.log("[loadLEVascularTemplateData] LE Vascular form fields (excluding reflux) populated.");

        // Handle Venous Reflux Entries
         const refluxList = document.getElementById('venous-reflux-list');
         if (refluxList && leVascularTemplateData.venous?.reflux && Array.isArray(leVascularTemplateData.venous.reflux)) {
             const existingEntries = refluxList.querySelectorAll('.reflux-entry');
             for (let i = existingEntries.length - 1; i > 0; i--) { existingEntries[i].remove(); }
             const firstEntry = refluxList.querySelector('.reflux-entry');
             if(firstEntry) {
                 firstEntry.querySelectorAll('input, select').forEach(field => {
                     if (field.type === 'select-one') field.selectedIndex = 0; else field.value = '';
                 });
             }
             refluxEntryCounter = 0; // Reset counter before adding from template

             leVascularTemplateData.venous.reflux.forEach((refluxItem, index) => {
                 let targetEntry = firstEntry;
                 if (index > 0) {
                    // addRefluxEntry calls counter++ internally, so counter will be correct
                    addRefluxEntry();
                    targetEntry = refluxList.lastElementChild;
                 } else {
                    refluxEntryCounter = 1; // Set counter for the first entry
                 }

                 if(targetEntry) {
                     // Map keys from refluxItem { veinName, duration, maneuver } to form field names
                     // The names don't change in addRefluxEntry, only IDs might, but getFormData works on names scoped to entry
                     const refluxFormData = {
                         refluxVeinName: refluxItem.veinName,
                         refluxDuration: refluxItem.duration,
                         refluxManeuver: refluxItem.maneuver
                     };
                     // Populate the correct entry (first or newly added)
                     populateForm(targetEntry, refluxFormData, { dispatchEvents: true });
                 }
             });
             console.log(`[loadLEVascularTemplateData] Populated ${leVascularTemplateData.venous.reflux.length} reflux entries.`);
         } else if (refluxList) {
             // If template has no reflux, clear all but the first entry
             const existingEntries = refluxList.querySelectorAll('.reflux-entry');
             for (let i = existingEntries.length - 1; i > 0; i--) { existingEntries[i].remove(); }
             const firstEntry = refluxList.querySelector('.reflux-entry');
             if(firstEntry) {
                 firstEntry.querySelectorAll('input, select').forEach(field => {
                     if (field.type === 'select-one') field.selectedIndex = 0; else field.value = '';
                 });
             }
              refluxEntryCounter = 1;
         }

        // Final Updates
        calculateAndDisplayABI('right');
        calculateAndDisplayABI('left');
        setTimeout(() => setupSuggestionVisibilityLEVascular(form), 150);

        console.log("[loadLEVascularTemplateData] Finished applying LE Vascular template data.");

    } catch (error) {
        console.error("[loadLEVascularTemplateData] Error applying LE Vascular template:", error);
        showNotification("Failed to apply LE Vascular template data.", "error");
    }
}


// --- Report Formatting ---

// Helper function to safely get values and format text/numbers
const getValue = (val, unit = '', fallback = '') => {
    if (val === null || val === undefined || String(val).trim() === '') {
        return fallback;
    }
    const strVal = String(val).replace(/\n/g, '<br>&nbsp;&nbsp;');
    return strVal + (unit ? ` ${unit}` : '');
};

// Helper to format a single vessel segment's findings with BILINGUAL LABELS
function formatVesselSegmentHtml(segmentName, segmentData) {
    let content = '';
    let hasData = false;

    const psv = getValue(segmentData?.psv, 'cm/s');
    const edv = getValue(segmentData?.edv, 'cm/s');
    const waveform = getValue(segmentData?.waveform);
    const artDesc = getValue(segmentData?.desc);
    const compress = getValue(segmentData?.compress);
    const doppler = getValue(segmentData?.doppler);
    const thrombusDesc = getValue(segmentData?.thrombus); // Combined venous description

    // Add findings with BILINGUAL labels
    if (psv) { content += `<li><strong>PSV:</strong> ${psv}</li>`; hasData = true; }
    if (edv) { content += `<li><strong>EDV:</strong> ${edv}</li>`; hasData = true; }
    if (waveform) { content += `<li><strong>Waveform / Dạng sóng:</strong> ${waveform}</li>`; hasData = true; }
    if (artDesc) { content += `<li><strong>Description / Mô tả:</strong> ${artDesc}</li>`; hasData = true; }
    if (compress) { content += `<li><strong>Compressibility / Độ đè xẹp:</strong> ${compress}</li>`; hasData = true; }
    if (doppler) { content += `<li><strong>Doppler Signal / Tín hiệu Doppler:</strong> ${doppler}</li>`; hasData = true; }
    if (thrombusDesc) { content += `<li><strong>Description / Mô tả:</strong> ${thrombusDesc}</li>`; hasData = true; } // Use generic label for venous desc

    if (hasData) {
        const displayName = segmentName; // Assume segmentName is already bilingual from the map
        return `<h4>${displayName}</h4><ul>${content}</ul>`;
    } else {
        return '';
    }
}

/**
 * Formats the FINDINGS section for an LE Vascular report as an HTML string.
 * Uses the data object collected by collectLEVascularData.
 * Implements 2-column layout and conditional reporting.
 * @param {object} data - Collected LE Vascular data object.
 * @returns {string} - Formatted findings HTML block string.
 */
function formatLEVascularReportSectionHtml(data) {
    console.log("[LEVascularModule] Formatting LE Vascular report section HTML (v2)...");
    if (!data) return "<p>Error: No LE Vascular data provided for formatting.</p>";

    let findings = '';
    let rightColumnHtml = '<h4>Right Leg / Chân Phải</h4>';
    let leftColumnHtml = '<h4>Left Leg / Chân Trái</h4>';
    let rightArterialContent = '<h5>Arterial / Động mạch</h5>';
    let rightVenousContent = '<h5>Venous / Tĩnh mạch</h5>';
    let leftArterialContent = '<h5>Arterial / Động mạch</h5>';
    let leftVenousContent = '<h5>Venous / Tĩnh mạch</h5>';
    let hasRightArterialData = false;
    let hasRightVenousData = false;
    let hasLeftArterialData = false;
    let hasLeftVenousData = false;

    // --- ABI Summary (UPDATED LABELS) ---
    const abiData = data.arterial?.abi;
    let abiSummaryHtml = '';
     if (abiData && (abiData.rightAbiValue || abiData.leftAbiValue || abiData.rightBrachialPressure || abiData.leftBrachialPressure)) {
        abiSummaryHtml += `<div class="abi-summary-section"><h5>Ankle-Brachial Index (ABI) / Chỉ số Cổ chân-Cánh tay</h5>`;
        const rightABI = getValue(abiData.rightAbiValue);
        const rightDP = getValue(abiData.rightDpPressure,'mmHg','N/A');
        const rightPT = getValue(abiData.rightPtPressure,'mmHg','N/A');
        const rightBrachial = getValue(abiData.rightBrachialPressure,'mmHg','N/A');
        if (rightABI || rightBrachial !== 'N/A') {
             abiSummaryHtml += `<p><strong>Right / Phải:</strong>` + (rightABI ? ` ABI = <strong>${rightABI}</strong>` : '') + ` (DP: ${rightDP}, PT: ${rightPT}, Brachial / Cánh tay: ${rightBrachial})</p>`;
        }
        const leftABI = getValue(abiData.leftAbiValue);
        const leftDP = getValue(abiData.leftDpPressure,'mmHg','N/A');
        const leftPT = getValue(abiData.leftPtPressure,'mmHg','N/A');
        const leftBrachial = getValue(abiData.leftBrachialPressure,'mmHg','N/A');
         if (leftABI || leftBrachial !== 'N/A') {
             abiSummaryHtml += `<p><strong>Left / Trái:</strong>` + (leftABI ? ` ABI = <strong>${leftABI}</strong>` : '') + ` (DP: ${leftDP}, PT: ${leftPT}, Brachial / Cánh tay: ${leftBrachial})</p>`;
         }
        abiSummaryHtml += `</div>`;
    }
    findings += abiSummaryHtml;

     // --- Process Arterial Segments ---
     const arterialDisplayNames = { cfa: 'Common Femoral A. (CFA) / ĐM Đùi Chung', pfa: 'Profunda Femoris A. (PFA) / ĐM Đùi Sâu', sfaprox: 'Superficial Femoral A. Prox (SFA) / ĐM Đùi Nông Đoạn Gần', sfamid: 'Superficial Femoral A. Mid (SFA) / ĐM Đùi Nông Đoạn Giữa', sfadist: 'Superficial Femoral A. Dist (SFA) / ĐM Đùi Nông Đoạn Xa', popa: 'Popliteal A. (Pop A) / ĐM Khoeo', ata: 'Anterior Tibial A. (ATA) / ĐM Chày Trước', pta: 'Posterior Tibial A. (PTA) / ĐM Chày Sau', peroa: 'Peroneal A. (Pero A) / ĐM Mác', dpa: 'Dorsalis Pedis A. (DPA) / ĐM Mu Chân' };
     ARTERIAL_SEGMENTS.forEach(segKeyInternalUpper => {
         const segKey = segKeyInternalUpper.toLowerCase();
         const displayName = arterialDisplayNames[segKey] || segKeyInternalUpper;
         const rightSegHtml = formatVesselSegmentHtml(displayName, data.arterial?.right?.[segKey]);
         if (rightSegHtml) { rightArterialContent += rightSegHtml; hasRightArterialData = true; }
         const leftSegHtml = formatVesselSegmentHtml(displayName, data.arterial?.left?.[segKey]);
         if (leftSegHtml) { leftArterialContent += leftSegHtml; hasLeftArterialData = true; }
     });

     // --- Process Venous Segments ---
      const venousDisplayNames = { cfv: 'Common Femoral V. (CFV) / TM Đùi Chung', fvprox: 'Femoral V. Prox (FV) / TM Đùi Đoạn Gần', fvmid: 'Femoral V. Mid (FV) / TM Đùi Đoạn Giữa', fvdist: 'Femoral V. Dist (FV) / TM Đùi Đoạn Xa', pfv: 'Profunda Femoris V. (PFV) / TM Đùi Sâu', popv: 'Popliteal V. (Pop V) / TM Khoeo', ptv: 'Posterior Tibial Vs (PTVs) / Các TM Chày Sau', perov: 'Peroneal Vs (Pero Vs) / Các TM Mác', gastroc: 'Gastrocnemius Veins / TM Bụng chân', soleal: 'Soleal Veins / TM Cơ dép', gsvak: 'Great Saphenous V. (GSV) Above Knee / TM Hiển Lớn trên gối', gsvbk: 'Great Saphenous V. (GSV) Below Knee / TM Hiển Lớn dưới gối', ssv: 'Small Saphenous V. (SSV) / TM Hiển Bé' };
      VENOUS_SEGMENTS.forEach(segKeyInternalUpper => {
         const segKey = segKeyInternalUpper.toLowerCase();
         const displayName = venousDisplayNames[segKey] || segKeyInternalUpper;
         const rightSegHtml = formatVesselSegmentHtml(displayName, data.venous?.right?.[segKey]);
         if (rightSegHtml) { rightVenousContent += rightSegHtml; hasRightVenousData = true; }
         const leftSegHtml = formatVesselSegmentHtml(displayName, data.venous?.left?.[segKey]);
         if (leftSegHtml) { leftVenousContent += leftSegHtml; hasLeftVenousData = true; }
     });

    // --- Assemble Columns ---
    // Add placeholder text if no data exists for a section within a leg
    if (!hasRightArterialData) rightArterialContent += '<p>No significant findings entered / Không ghi nhận bất thường.</p>';
    if (!hasRightVenousData) rightVenousContent += '<p>No significant findings entered / Không ghi nhận bất thường.</p>';
    if (!hasLeftArterialData) leftArterialContent += '<p>No significant findings entered / Không ghi nhận bất thường.</p>';
    if (!hasLeftVenousData) leftVenousContent += '<p>No significant findings entered / Không ghi nhận bất thường.</p>';

    // Combine arterial and venous content for each leg
    rightColumnHtml += rightArterialContent + rightVenousContent;
    leftColumnHtml += leftArterialContent + leftVenousContent;

    // Create grid content using the assembled columns
    let gridContent = `<div class="report-findings-right-column">${rightColumnHtml}</div>`
                    + `<div class="report-findings-left-column">${leftColumnHtml}</div>`;

    // Add the grid to the findings section
    findings += `<div class="findings-grid">${gridContent}</div>`;

     // --- Venous Reflux Summary (UPDATED LABELS) ---
     let refluxSummaryHtml = '';
     if (data.venous?.reflux && data.venous.reflux.length > 0) {
         let hasRefluxData = false;
         let refluxListContent = '';
         data.venous.reflux.forEach(item => {
             const vein = getValue(item.veinName, '', '');
             const duration = getValue(item.duration, 's', '');
             const maneuver = getValue(item.maneuver, '', 'N/A');
             if (vein || duration) { // Only add if some data exists
                refluxListContent += `<li><strong>${vein || 'Unnamed Vein / TM không tên'}</strong>: Reflux Duration / Thời gian trào ngược: ${duration || 'N/A'} (Maneuver / Nghiệm pháp: ${maneuver})</li>`;
                hasRefluxData = true;
             }
         });
         if (hasRefluxData) {
            refluxSummaryHtml += `<div class="reflux-summary-section"><h5>Venous Reflux / Trào ngược tĩnh mạch</h5><ul>${refluxListContent}</ul></div>`;
         }
     }
     findings += refluxSummaryHtml;


    // --- Impression and Recommendation ---
    const impressionText = getValue(data.impression, '', 'Not specified.');
    const recommendationText = getValue(data.recommendation);

    // Use H4 for consistency with how CSS targets Impression/Recommendation in print styles
    findings += `<hr class="report-hr"><h4>IMPRESSION / KẾT LUẬN:</h4>`;
    findings += `<p>${impressionText}</p>`;

    if (recommendationText) {
        findings += `<hr class="report-hr"><h4>RECOMMENDATION / ĐỀ NGHỊ:</h4><p>${recommendationText}</p>`;
    }

    console.log("[LEVascularModule] Finished formatting LE Vascular report section HTML.");
    return `<div class="le-vascular-findings-container">${findings}</div>`;
}


console.log("le-vascular-module.js loaded (with updated formatters).");