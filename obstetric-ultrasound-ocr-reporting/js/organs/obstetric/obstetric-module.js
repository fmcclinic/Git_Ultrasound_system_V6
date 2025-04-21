// js/organs/obstetric/obstetric-module.js
// Module specific to Obstetric Ultrasound reporting logic (with OCR + Average GA/EDD calculation)

// --- Core Imports ---
import { showNotification } from '../../core/ui-core.js';
import { populateForm, getFormData } from '../../core/form-core.js';
// --- Main Imports ---
import { getApiKey, isOcrAvailable, getOcrHandler } from '../../main.js'; // Import OCR availability check
// --- Module Imports ---
import { getImageDataById } from '../../modules/image-handler.js'; // Import function to get image data
// Import OCR function if OCR module is available (dynamic import handled in main.js)
// We will get the function via getOcrHandler()

// --- Module-level variables ---
const hideSuggestionTimeoutsOB = {};
let ocrPromptText = null; // Variable to store the loaded OCR prompt

// --- Constants ---
const ANATOMY_PARTS = ['head', 'face', 'neck', 'chest', 'abdomen', 'spine', 'limbs', 'genitalia'];
const NORMAL_STATUS_PREFIX = "Normal /";
const OCR_PROMPT_PATH = 'prompts/prompt_ocr_ob.txt'; // Path to the specific OCR prompt
const WEEKS_IN_FIRST_TRIMESTER = 14; // Define threshold for using CRL GA

// --- Helper Functions ---

/**
 * Parses a GA string (e.g., "20w1d", "12w", "15w 3d") into total days.
 * @param {string | null | undefined} gaString - The GA string to parse.
 * @returns {number | null} Total days or null if parsing fails.
 */
function parseGAString(gaString) {
    if (!gaString || typeof gaString !== 'string') return null;
    // Regex to capture weeks (required) and optional days
    // Allows formats like: 20w1d, 20w 1d, 12w, 12w0d, 12W1D etc.
    const match = gaString.match(/(\d+)\s*w(?:ek)?s?\s*(\d+)?\s*d(?:ay)?s?/i);
    if (match) {
        const weeks = parseInt(match[1], 10);
        const days = parseInt(match[2] || '0', 10); // Default to 0 days if not present
        if (!isNaN(weeks) && !isNaN(days)) {
            return weeks * 7 + days;
        }
    }
    return null; // Return null if parsing fails
}

/**
 * Formats total gestational days into a bilingual string "XwYd / XtYn".
 * @param {number | null | undefined} totalDays - Total days of gestation.
 * @returns {string} Formatted string or empty string if input is invalid.
 */
function formatGADaysToString(totalDays) {
    if (totalDays === null || totalDays === undefined || isNaN(totalDays) || totalDays < 0) {
        return '';
    }
    const weeks = Math.floor(totalDays / 7);
    const days = Math.round(totalDays % 7); // Round remaining days
    return `${weeks}w${days}d / ${weeks}t${days}n`;
}

/**
 * Calculates the Estimated Due Date (EDD) based on total gestational days and the exam date.
 * @param {number | null} totalDays - Total gestational days.
 * @param {Date} examDate - The date the ultrasound was performed.
 * @returns {string | null} EDD formatted as "YYYY-MM-DD" or null if calculation fails.
 */
function calculateEddFromGaDays(totalDays, examDate) {
    if (totalDays === null || isNaN(totalDays) || totalDays <= 0 || !(examDate instanceof Date) || isNaN(examDate.getTime())) {
        return null;
    }
    try {
        const fullTermDays = 280; // 40 weeks
        const remainingDays = fullTermDays - totalDays;

        const eddDate = new Date(examDate);
        eddDate.setDate(examDate.getDate() + remainingDays);

        // Format EDD to YYYY-MM-DD
        const eddYear = eddDate.getFullYear();
        const eddMonth = String(eddDate.getMonth() + 1).padStart(2, '0');
        const eddDay = String(eddDate.getDate()).padStart(2, '0');
        return `${eddYear}-${eddMonth}-${eddDay}`;
    } catch (e) {
        console.error("Error calculating EDD from GA days:", e);
        return null;
    }
}

/**
 * Calculates the average GA and corresponding EDD from OCR data.
 * Applies simplified clinical rules (CRL priority in 1st tri).
 * @param {object} ocrData - The JSON object returned by the OCR handler.
 * @param {Date} examDate - The date of the ultrasound exam.
 * @returns {object} Object containing { averageGaString: string|null, eddString: string|null }.
 */
function calculateAverageGA(ocrData, examDate) {
    if (!ocrData || typeof ocrData !== 'object') {
        return { averageGaString: null, eddString: null };
    }

    let finalGaDays = null;
    const gaKeysToAverage = ['ga_bpd', 'ga_hc', 'ga_ac', 'ga_fl']; // Keys to average in 2nd/3rd tri
    const validGaDaysList = [];

    // 1. Check CRL GA first
    const crlGaDays = parseGAString(ocrData.ga_crl);
    // Use CRL GA if it's valid and likely first trimester (e.g., < 14 weeks = 98 days)
    if (crlGaDays !== null && crlGaDays < (WEEKS_IN_FIRST_TRIMESTER * 7)) {
        finalGaDays = crlGaDays;
        console.log(`[calculateAverageGA] Using CRL GA: ${crlGaDays} days`);
    } else {
        // 2. If not using CRL, parse and collect other GA values
        gaKeysToAverage.forEach(key => {
            const gaDays = parseGAString(ocrData[key]);
            if (gaDays !== null) {
                validGaDaysList.push(gaDays);
            }
        });

        console.log(`[calculateAverageGA] GA days list for averaging: ${validGaDaysList}`);

        // 3. Calculate average if valid GAs exist
        if (validGaDaysList.length > 0) {
            const sum = validGaDaysList.reduce((a, b) => a + b, 0);
            finalGaDays = sum / validGaDaysList.length;
            console.log(`[calculateAverageGA] Calculated average GA: ${finalGaDays} days`);
        }
    }

    // 4. Format results
    if (finalGaDays !== null) {
        const averageGaString = formatGADaysToString(finalGaDays);
        const eddString = calculateEddFromGaDays(finalGaDays, examDate);
        return { averageGaString, eddString };
    } else {
        console.log("[calculateAverageGA] No valid GA data found to calculate average.");
        return { averageGaString: null, eddString: null };
    }
}


// --- Other Helper Functions (Keep as before) ---
function calculateGA_EDD_FromLMP(lmpDateString) { /* ... unchanged ... */
    const gaLmpField = document.getElementById('ga-lmp');
    const eddLmpField = document.getElementById('edd-lmp');
    if (!gaLmpField || !eddLmpField) return;
    if (!lmpDateString) { gaLmpField.value = ''; eddLmpField.value = ''; return; }
    try {
        const lmpDate = new Date(lmpDateString + 'T00:00:00');
        if (isNaN(lmpDate.getTime())) { gaLmpField.value = ''; eddLmpField.value = ''; return; }
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const diffTime = Math.abs(today - lmpDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const weeks = Math.floor(diffDays / 7);
        const days = diffDays % 7;
        gaLmpField.value = `${weeks}w${days}d / ${weeks}t${days}n`;
        const eddDate = new Date(lmpDate); eddDate.setDate(lmpDate.getDate() + 280);
        const eddYear = eddDate.getFullYear();
        const eddMonth = String(eddDate.getMonth() + 1).padStart(2, '0');
        const eddDay = String(eddDate.getDate()).padStart(2, '0');
        eddLmpField.value = `${eddYear}-${eddMonth}-${eddDay}`;
    } catch (e) { console.error("Error calculating GA/EDD from LMP:", e); gaLmpField.value = 'Error'; eddLmpField.value = ''; }
}
function calculateEFW(fetusNumber = 1) { /* ... unchanged ... */
    const methodSelect = document.getElementById(`efw-method_${fetusNumber}`);
    const efwField = document.getElementById(`efw_${fetusNumber}`);
    if (!methodSelect || !efwField) return;
    const method = methodSelect.value;
    const bpd = parseFloat(document.getElementById(`bpd_${fetusNumber}`)?.value); // mm
    const hc = parseFloat(document.getElementById(`hc_${fetusNumber}`)?.value); // mm
    const ac = parseFloat(document.getElementById(`ac_${fetusNumber}`)?.value); // mm
    const fl = parseFloat(document.getElementById(`fl_${fetusNumber}`)?.value); // mm
    let efw = null;
    try {
        if (method.startsWith('Hadlock') && !isNaN(bpd) && !isNaN(hc) && !isNaN(ac) && !isNaN(fl)) {
            const hc_cm = hc / 10, ac_cm = ac / 10, fl_cm = fl / 10, bpd_cm = bpd / 10;
             const log10EFW = 1.3596 + (0.0064 * hc_cm) + (0.0424 * ac_cm) + (0.174 * fl_cm) + (0.00061 * bpd_cm * ac_cm) - (0.00386 * ac_cm * fl_cm);
             efw = Math.pow(10, log10EFW);
        } else if (method.includes('Shepard') && !isNaN(bpd) && !isNaN(ac)) {
            const bpd_cm = bpd / 10, ac_cm = ac / 10;
            const log10EFW = -1.7492 + (0.166 * bpd_cm) + (0.046 * ac_cm) - (0.002546 * ac_cm * bpd_cm);
            efw = Math.pow(10, log10EFW);
        }
        if (efw !== null && !isNaN(efw)) efwField.value = efw.toFixed(0); else efwField.value = '';
    } catch (e) { console.error(`Error calculating EFW for fetus ${fetusNumber}:`, e); efwField.value = 'Error'; }
}
function calculateBPPScore() { /* ... unchanged ... */
    const scoreField = document.getElementById('bpp_score'); if (!scoreField) return;
    const tone = parseInt(document.getElementById('bpp_tone')?.value || 0);
    const movement = parseInt(document.getElementById('bpp_movement')?.value || 0);
    const breathing = parseInt(document.getElementById('bpp_breathing')?.value || 0);
    const fluid = parseInt(document.getElementById('bpp_fluid')?.value || 0);
    let score = 0;
    if (tone === 2) score += 2; if (movement === 2) score += 2;
    if (breathing === 2) score += 2; if (fluid === 2) score += 2;
    scoreField.value = score;
 }
function calculateCPR() { /* ... unchanged ... */
    const cprField = document.getElementById('cpr'); if (!cprField) return;
    const mcaPi = parseFloat(document.getElementById('mca_pi')?.value);
    const uaPi = parseFloat(document.getElementById('ua_pi')?.value);
    if (!isNaN(mcaPi) && !isNaN(uaPi) && uaPi > 0) cprField.value = (mcaPi / uaPi).toFixed(2);
    else cprField.value = '';
 }
function handleAnatomyStatusChange(selectElement) { /* ... unchanged ... */
    const targetAreaId = selectElement.dataset.targetArea; if (!targetAreaId) return;
    const descriptionGroup = selectElement.closest('.anatomy-content')?.querySelector(`#${targetAreaId}`)?.closest('.anatomy-description-group');
    if (!descriptionGroup) return;
    descriptionGroup.style.display = (selectElement.value === 'Abnormal / Bất thường') ? 'block' : 'none';
 }
function setupSuggestionVisibilityOB(parentElement) { /* ... unchanged ... */
    const suggestionContainers = parentElement.querySelectorAll('.suggestion-button-container');
    suggestionContainers.forEach(container => {
        const inputElement = container.previousElementSibling;
        if (inputElement && (inputElement.tagName === 'TEXTAREA' || inputElement.tagName === 'INPUT')) {
            let elementId = inputElement.id || `input_ob_${Date.now()}_${Math.random().toString(16).slice(2)}`;
            inputElement.id = elementId;
            inputElement.removeEventListener('focus', handleInputFocusOB); inputElement.removeEventListener('blur', handleInputBlurOB);
            inputElement.addEventListener('focus', handleInputFocusOB); inputElement.addEventListener('blur', handleInputBlurOB);
        }
    });
}
function handleInputFocusOB(event) { /* ... unchanged ... */
    const inputElement = event.target; const elementId = inputElement.id;
    const container = inputElement.nextElementSibling;
    if (hideSuggestionTimeoutsOB[elementId]) clearTimeout(hideSuggestionTimeoutsOB[elementId]); delete hideSuggestionTimeoutsOB[elementId];
    if (container?.classList.contains('suggestion-button-container')) container.style.display = 'flex';
}
function handleInputBlurOB(event) { /* ... unchanged ... */
    const inputElement = event.target; const elementId = inputElement.id;
    const container = inputElement.nextElementSibling;
    if (container?.classList.contains('suggestion-button-container')) {
        hideSuggestionTimeoutsOB[elementId] = setTimeout(() => { container.style.display = 'none'; delete hideSuggestionTimeoutsOB[elementId]; }, 250);
    }
}
function handleSuggestionButtonClickOB(button) { /* ... unchanged ... */
    const textToInsert = button.dataset.insert;
    const container = button.closest('.suggestion-button-container');
    const targetElement = container ? container.previousElementSibling : null;
    if (targetElement && (targetElement.tagName === 'TEXTAREA' || targetElement.tagName === 'INPUT') && textToInsert !== undefined) {
        const currentValue = targetElement.value; let separator = '';
        if (currentValue.trim().length > 0 && !/[\s\.\?\!;:,]$/.test(currentValue.trim())) separator = '. ';
        else if (currentValue.length > 0 && !currentValue.endsWith(' ') && !currentValue.endsWith('\n')) separator = ' ';
        targetElement.value += separator + textToInsert;
        targetElement.dispatchEvent(new Event('input', { bubbles: true })); targetElement.focus();
        if(targetElement.tagName === 'TEXTAREA') targetElement.scrollTop = targetElement.scrollHeight;
    } else console.warn("Target input/textarea or data-insert not found.", button);
}
// --- End Helper Functions ---

/**
 * Loads the specific OCR prompt text from file.
 */
async function loadOcrPrompt() {
    if (ocrPromptText !== null) return; // Already loaded or failed previously
    try {
        const response = await fetch(OCR_PROMPT_PATH);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        ocrPromptText = await response.text();
        console.log("[ObstetricModule] OCR Prompt loaded successfully.");
    } catch (error) {
        console.error(`[ObstetricModule] Failed to load OCR prompt from ${OCR_PROMPT_PATH}:`, error);
        showNotification("Error loading OCR prompt file. OCR feature may not work correctly.", "error");
        ocrPromptText = ''; // Set to empty on failure
    }
}

/**
 * Populates form fields based on OCR data AND calculates/updates average GA + EDD.
 * @param {object} ocrData - The JSON object returned by the OCR handler.
 */
function populateFormWithOcrData(ocrData) {
    if (!ocrData || typeof ocrData !== 'object') {
        showNotification("OCR returned no valid data to populate.", "warning");
        return;
    }

    const form = document.getElementById('ob-assessment-form');
    const gaUsInput = document.getElementById('ga-us'); // GA by US input
    const eddUsInput = document.getElementById('edd-us'); // EDD by US input
    const examDateField = document.getElementById('exam-date'); // Exam date input

    if (!form || !gaUsInput || !eddUsInput || !examDateField) {
        console.error("One or more required form fields (form, ga-us, edd-us, exam-date) not found for OCR population.");
        return;
    }

    console.log("[ObstetricModule] Populating form with OCR data:", ocrData);
    const populatedFields = [];
    const mapping = { // Maps OCR keys to form field IDs (assuming fetus 1)
        bpd: 'bpd_1', hc: 'hc_1', ac: 'ac_1', fl: 'fl_1', hl: 'hl_1',
        crl: 'crl_1', efw: 'efw_1', afi: 'afi', sdp: 'sdp',
        efwMethod: 'efwMethod_1',
        // Add mappings for individual GA strings if needed for other logic
        // ga_bpd: null, ga_hc: null, etc. (not directly populating fields)
    };

    const fieldsToUpdate = {};
    // Populate direct measurements first
    for (const key in ocrData) {
        if (Object.hasOwnProperty.call(ocrData, key) && mapping[key]) {
            const fieldId = mapping[key];
            const field = document.getElementById(fieldId);
            if (field) {
                const value = ocrData[key];
                 if (field.type === 'number' && isNaN(parseFloat(value))) {
                    console.warn(`OCR value for ${key} ('${value}') is not a valid number for field ${fieldId}. Skipping.`);
                    continue;
                 }
                fieldsToUpdate[field.name || fieldId] = value;
                populatedFields.push(key.toUpperCase());

                // Add visual indication
                 field.classList.remove('ocr-filled');
                 setTimeout(() => field.classList.add('ocr-filled'), 100);
                 setTimeout(() => field.classList.remove('ocr-filled'), 4000);
            }
        }
    }

     // Use populateForm for efficiency, dispatching events
     if (Object.keys(fieldsToUpdate).length > 0) {
        populateForm(form, fieldsToUpdate, { dispatchEvents: true });
        console.log("[ObstetricModule] Form fields updated with OCR measurements:", fieldsToUpdate);
    }

    // Now, calculate Average GA and EDD from OCR'd GA strings
    const examDateString = examDateField.value; // Get exam date from patient info
    const examDate = examDateString ? new Date(examDateString + 'T00:00:00') : new Date(); // Use today if exam date not set
     if (isNaN(examDate.getTime())) { // Handle invalid exam date
        console.warn("Invalid Exam Date found, using today for EDD calculation.");
        examDate = new Date();
    }
    examDate.setHours(0, 0, 0, 0); // Normalize exam date

    const gaResult = calculateAverageGA(ocrData, examDate); // Pass exam date

    // Update GA by US field
    if (gaResult.averageGaString) {
        gaUsInput.value = gaResult.averageGaString;
        gaUsInput.dispatchEvent(new Event('input', { bubbles: true })); // Trigger events
        gaUsInput.dispatchEvent(new Event('change', { bubbles: true }));
        gaUsInput.classList.remove('ocr-filled'); // Manage highlight
        setTimeout(() => gaUsInput.classList.add('ocr-filled'), 100);
        setTimeout(() => gaUsInput.classList.remove('ocr-filled'), 4000);
        populatedFields.push("GA by US");
        console.log(`[ObstetricModule] Updated GA by US: ${gaResult.averageGaString}`);
    } else {
         // Optionally clear the field if calculation fails? Or leave existing value?
         // gaUsInput.value = '';
    }

    // Update EDD by US field
    if (gaResult.eddString) {
        eddUsInput.value = gaResult.eddString;
        eddUsInput.dispatchEvent(new Event('input', { bubbles: true })); // Trigger events
        eddUsInput.dispatchEvent(new Event('change', { bubbles: true }));
        eddUsInput.classList.remove('ocr-filled'); // Manage highlight
        setTimeout(() => eddUsInput.classList.add('ocr-filled'), 100);
        setTimeout(() => eddUsInput.classList.remove('ocr-filled'), 4000);
        populatedFields.push("EDD by US");
         console.log(`[ObstetricModule] Updated EDD by US: ${gaResult.eddString}`);
    } else {
         // Optionally clear the field if calculation fails?
         // eddUsInput.value = '';
    }


    // Final Notification
    if (populatedFields.length > 0) {
        showNotification(`OCR Populated: ${populatedFields.join(', ')}. PLEASE VERIFY ALL VALUES!`, "success", 7000);
    } else {
        showNotification("OCR did not find recognizable measurements to populate.", "info");
    }
}


/**
 * Handles clicks on the OCR trigger buttons added to image previews.
 */
async function handleOcrButtonClick(event) {
    const button = event.target.closest('.ocr-trigger-btn');
    if (!button) return;

    const imageId = button.dataset.imageId; if (!imageId) return;

    console.log(`[ObstetricModule] OCR button clicked for image ID: ${imageId}`);
    button.classList.add('loading'); button.disabled = true;

    const apiKey = getApiKey();
    // Load prompt if not already loaded
    if (ocrPromptText === null) await loadOcrPrompt();

    if (!apiKey || ocrPromptText === null || ocrPromptText === '') { // Check if prompt loading failed
        showNotification("OCR cannot proceed: Missing API Key or failed to load OCR Prompt.", "error");
        button.classList.remove('loading'); button.disabled = false;
        return;
    }

    const imageData = getImageDataById(imageId);
    if (!imageData || !imageData.dataUrl) {
        showNotification("Could not retrieve image data for OCR.", "error");
        button.classList.remove('loading'); button.disabled = false;
        return;
    }

    const base64Data = imageData.dataUrl.split(',')[1];
    const mimeType = imageData.mimeType;
    if (!base64Data) {
         showNotification("Invalid image data format for OCR.", "error");
         button.classList.remove('loading'); button.disabled = false;
         return;
    }

    const ocrHandler = getOcrHandler();
    if (!ocrHandler || typeof ocrHandler.extractMeasurementsFromImage !== 'function') {
         showNotification("OCR processing function is not available.", "error");
         button.classList.remove('loading'); button.disabled = false;
         return;
    }

    showNotification("Reading measurements from image...", "info", 2000);

    try {
        // Call the OCR handler function from the separate module
        const jsonResult = await ocrHandler.extractMeasurementsFromImage(base64Data, mimeType, apiKey, ocrPromptText);
        populateFormWithOcrData(jsonResult); // Populate form with results + calculate average GA/EDD
    } catch (error) {
        console.error("[ObstetricModule] OCR Processing Error:", error);
        showNotification(`OCR Error: ${error.message}`, "error", 6000);
    } finally {
         button.classList.remove('loading');
         button.disabled = false;
    }
}


// --- Initialization ---
/**
 * Initializes the Obstetric module functionalities.
 */
export async function init() { // Made async to handle prompt loading
    console.log("[ObstetricModule] Initializing...");
    try {
        const obForm = document.getElementById('ob-assessment-form');
        const imagePreviewContainer = document.getElementById('image-preview-container');

        if (!obForm) throw new Error("Obstetric assessment form ('#ob-assessment-form') not found.");

        // --- Event Delegation (Suggestions, Anatomy Status, Calculations) ---
        obForm.addEventListener('click', function(event) {
            if (event.target.classList.contains('suggestion-btn')) {
                handleSuggestionButtonClickOB(event.target);
                const container = event.target.closest('.suggestion-button-container');
                if (container) container.style.display = 'none';
            }
        });
        obForm.addEventListener('change', function(event) {
            const target = event.target;
            if (target.classList.contains('anatomy-status-select')) handleAnatomyStatusChange(target);
            if (target.id === 'lmp') calculateGA_EDD_FromLMP(target.value);
            // Trigger EFW calculation on relevant biometry changes
            if (target.name && (target.name.startsWith('bpd_') || target.name.startsWith('hc_') || target.name.startsWith('ac_') || target.name.startsWith('fl_') || target.name.startsWith('efwMethod_'))) calculateEFW(1);
            if (target.name && target.name.startsWith('bpp')) calculateBPPScore();
            if (target.name && (target.name === 'uaPi' || target.name === 'mcaPi')) calculateCPR();
            // Note: Manual biometry changes currently DON'T trigger average GA/EDD calculation. Only OCR does.
            // Could add that logic here if desired, calling calculateAverageGA based on form fields instead of ocrData.
        });

        // --- Conditional OCR Initialization ---
        if (isOcrAvailable()) {
            console.log("[ObstetricModule] OCR Feature Available - Initializing OCR elements.");
            await loadOcrPrompt(); // Load the prompt needed for OB OCR

            if (imagePreviewContainer) {
                 imagePreviewContainer.addEventListener('click', handleOcrButtonClick);
                 console.log("[ObstetricModule] OCR button listener added to image preview container.");
            } else {
                 console.warn("[ObstetricModule] Image preview container not found, cannot add OCR button listener.");
            }
        } else {
            console.log("[ObstetricModule] OCR Feature Disabled.");
        }

        // --- Initialize UI States ---
        // Use setTimeout to ensure DOM is fully ready and potential templates are loaded
        setTimeout(() => {
            obForm.querySelectorAll('.anatomy-status-select').forEach(handleAnatomyStatusChange);
            // Initial calculations if form has default/template values
            calculateBPPScore();
            calculateCPR();
            const lmpInput = document.getElementById('lmp');
            if(lmpInput?.value) calculateGA_EDD_FromLMP(lmpInput.value);
            calculateEFW(1); // Calculate EFW based on current biometry fields
            // Potentially calculate initial Average GA/EDD from form fields here if needed on load
        }, 150);
        setupSuggestionVisibilityOB(obForm);

        console.log("[ObstetricModule] Initialized successfully.");
    } catch (error) {
        console.error("[ObstetricModule] Error during initialization:", error);
        showNotification(`Failed to initialize Obstetric module: ${error.message}`, "error");
    }
}

// --- Data Collection & Loading --- (Keep collectObstetricData and loadObstetricTemplateData as previously generated)
/**
 * Collects all data for the Obstetric assessment form.
 */
export function collectObstetricData() {
    console.log("[ObstetricModule] Collecting Obstetric data...");
    const form = document.getElementById('ob-assessment-form');
    if (!form) { console.error("Obstetric form not found."); return null; }
    try {
        const allFormData = getFormData(form);
        const fetusNumber = 1; // Assuming singleton
        const structuredData = {
            gestationalInfo: { lmp: allFormData.lmp, gaLmp: allFormData.gaLmp, eddLmp: allFormData.eddLmp, gaUs: allFormData.gaUs, eddUs: allFormData.eddUs, ultrasoundMethod: allFormData.ultrasoundMethod, },
            fetalBiometry: { crl: allFormData[`crl_${fetusNumber}`], bpd: allFormData[`bpd_${fetusNumber}`], hc: allFormData[`hc_${fetusNumber}`], ac: allFormData[`ac_${fetusNumber}`], fl: allFormData[`fl_${fetusNumber}`], hl: allFormData[`hl_${fetusNumber}`], efwMethod: allFormData[`efwMethod_${fetusNumber}`], efw: allFormData[`efw_${fetusNumber}`], efwPercentile: allFormData[`efwPercentile_${fetusNumber}`], },
            fetalAnatomy: {},
            amnioticFluid: { afi: allFormData.afi, sdp: allFormData.sdp, fluidAssessment: allFormData.fluidAssessment, },
            placenta: { location: allFormData.placentaLocation, distanceOs: allFormData.placentaDistanceOs, grade: allFormData.placentaGrade, appearance: allFormData.placentaAppearance, },
            cervix: { length: allFormData.cervixLength, method: allFormData.cervixMethod, appearance: allFormData.cervixAppearance, },
            maternalStructures: { uterus: allFormData.maternalUterus, adnexa: allFormData.maternalAdnexa, },
            fetalWellbeing: { bppTone: allFormData.bppTone, bppMovement: allFormData.bppMovement, bppBreathing: allFormData.bppBreathing, bppFluid: allFormData.bppFluid, bppScore: allFormData.bppScore, uaPi: allFormData.uaPi, uaRi: allFormData.uaRi, uaSd: allFormData.uaSd, uaEdf: allFormData.uaEdf, mcaPi: allFormData.mcaPi, mcaRi: allFormData.mcaRi, mcaPsv: allFormData.mcaPsv, cpr: allFormData.cpr, },
            impression: allFormData.impression, recommendation: allFormData.recommendation
        };
        ANATOMY_PARTS.forEach(part => { structuredData.fetalAnatomy[part] = { status: allFormData[`anatomy${part.charAt(0).toUpperCase() + part.slice(1)}Status`], desc: allFormData[`anatomy${part.charAt(0).toUpperCase() + part.slice(1)}Desc`] ?? '', }; });
        structuredData.formatReportSectionHtml = function() { return formatObstetricReportSectionHtml(this); }
        // console.debug("Collected Obstetric Data:", JSON.parse(JSON.stringify(structuredData))); // Less verbose logging
        return structuredData;
    } catch (error) { console.error("Error collecting Obstetric data:", error); showNotification("Failed to collect Obstetric assessment data.", "error"); return null; }
}

/**
 * Loads template data into the Obstetric assessment form.
 */
export async function loadObstetricTemplateData(obstetricTemplateData) {
    // ... (Keep this function exactly as previously generated) ...
    // It already calls populateForm with dispatchEvents=true, which will trigger
    // the calculation listeners we added in init() for fields like LMP, biometry, BPP, Doppler.
    if (!obstetricTemplateData || typeof obstetricTemplateData !== 'object') { console.warn("Invalid Obstetric template data."); return; }
    console.log("[ObstetricModule] Loading Obstetric template data...");
    const form = document.getElementById('ob-assessment-form'); if (!form) { console.error("Obstetric form not found!"); return; }
    try {
        const flattenedData = {};
        Object.assign(flattenedData, obstetricTemplateData.gestationalInfo);
        Object.assign(flattenedData, obstetricTemplateData.amnioticFluid);
        flattenedData.placentaLocation = obstetricTemplateData.placenta?.location; flattenedData.placentaDistanceOs = obstetricTemplateData.placenta?.distanceOs; flattenedData.placentaGrade = obstetricTemplateData.placenta?.grade; flattenedData.placentaAppearance = obstetricTemplateData.placenta?.appearance;
        flattenedData.cervixLength = obstetricTemplateData.cervix?.length; flattenedData.cervixMethod = obstetricTemplateData.cervix?.method; flattenedData.cervixAppearance = obstetricTemplateData.cervix?.appearance;
        Object.assign(flattenedData, obstetricTemplateData.maternalStructures);
        Object.assign(flattenedData, obstetricTemplateData.fetalWellbeing);
        flattenedData.impression = obstetricTemplateData.impression; flattenedData.recommendation = obstetricTemplateData.recommendation;
        if (obstetricTemplateData.fetalBiometry) { for (const key in obstetricTemplateData.fetalBiometry) { flattenedData[`${key}_1`] = obstetricTemplateData.fetalBiometry[key]; } } // Assume singleton
        if (obstetricTemplateData.fetalAnatomy) { ANATOMY_PARTS.forEach(part => { if (obstetricTemplateData.fetalAnatomy[part]) { const statusKey = `anatomy${part.charAt(0).toUpperCase() + part.slice(1)}Status`; const descKey = `anatomy${part.charAt(0).toUpperCase() + part.slice(1)}Desc`; flattenedData[statusKey] = obstetricTemplateData.fetalAnatomy[part].status; flattenedData[descKey] = obstetricTemplateData.fetalAnatomy[part].desc; } }); }
        populateForm(form, flattenedData, { dispatchEvents: true });
        console.log("[loadObstetricTemplateData] Obstetric form fields populated.");
        // Final Updates & UI Sync - triggers handled by populateForm's dispatchEvents=true
        form.querySelectorAll('.anatomy-status-select').forEach(handleAnatomyStatusChange); // Ensure anatomy state is correct
        setTimeout(() => setupSuggestionVisibilityOB(form), 200); // Setup suggestions after delay
        console.log("[loadObstetricTemplateData] Finished applying Obstetric template data.");
    } catch (error) { console.error("Error applying Obstetric template:", error); showNotification("Failed to apply Obstetric template data.", "error"); }
}


// --- Report Formatting --- (Keep formatObstetricReportSectionHtml as previously generated)
const formatValue = (value, unit = '', fallback = '') => {
    if (value === null || value === undefined || String(value).trim() === '') return fallback;
    const strVal = String(value).replace(/\n/g, '<br>&nbsp;&nbsp;'); return strVal + (unit ? ` ${unit}` : '');
};
function formatObstetricReportSectionHtml(data) {
    // ... (Keep this function exactly as previously generated) ...
    // It reads data collected by collectObstetricData and formats it conditionally.
    console.log("[ObstetricModule] Formatting Obstetric report section HTML..."); if (!data) return "<p>Error: No data.</p>";
    let findingsHtml = ''; const gi = data.gestationalInfo; let giContent = ''; // Gestational Info
    if (formatValue(gi?.lmp)) giContent += `<li><strong>LMP / Kinh chót:</strong> ${formatValue(gi.lmp)}</li>`; if (formatValue(gi?.gaLmp)) giContent += `<li><strong>GA by LMP / Tuổi thai theo KCC:</strong> ${formatValue(gi.gaLmp)}</li>`; if (formatValue(gi?.eddLmp)) giContent += `<li><strong>EDD by LMP / Ngày dự sinh theo KCC:</strong> ${formatValue(gi.eddLmp)}</li>`; if (formatValue(gi?.gaUs)) giContent += `<li><strong>GA by Ultrasound / Tuổi thai theo SA:</strong> ${formatValue(gi.gaUs)}</li>`; if (formatValue(gi?.eddUs)) giContent += `<li><strong>EDD by Ultrasound / Ngày dự sinh theo SA:</strong> ${formatValue(gi.eddUs)}</li>`; if (formatValue(gi?.ultrasoundMethod)) giContent += `<li><strong>Method / Phương pháp SA:</strong> ${formatValue(gi.ultrasoundMethod)}</li>`; if (giContent) findingsHtml += `<h4>Gestational Information / Thông tin Thai kỳ</h4><ul>${giContent}</ul>`;
    const bio = data.fetalBiometry; let bioContent = ''; // Biometry
    if (formatValue(bio?.crl)) bioContent += `<li><strong>CRL:</strong> ${formatValue(bio.crl, 'mm')}</li>`; if (formatValue(bio?.bpd)) bioContent += `<li><strong>BPD / ĐK Lưỡng đỉnh:</strong> ${formatValue(bio.bpd, 'mm')}</li>`; if (formatValue(bio?.hc)) bioContent += `<li><strong>HC / Chu vi đầu:</strong> ${formatValue(bio.hc, 'mm')}</li>`; if (formatValue(bio?.ac)) bioContent += `<li><strong>AC / Chu vi bụng:</strong> ${formatValue(bio.ac, 'mm')}</li>`; if (formatValue(bio?.fl)) bioContent += `<li><strong>FL / Chiều dài XĐ:</strong> ${formatValue(bio.fl, 'mm')}</li>`; if (formatValue(bio?.hl)) bioContent += `<li><strong>HL / Chiều dài XC Tay:</strong> ${formatValue(bio.hl, 'mm')}</li>`; if (formatValue(bio?.efw)) { bioContent += `<li><strong>EFW / ƯLCN (${formatValue(bio.efwMethod || '?')}):</strong> ${formatValue(bio.efw, 'g')}</li>`; } else if (formatValue(bio?.efwMethod)) { bioContent += `<li><strong>EFW Method / Công thức ƯLCN:</strong> ${formatValue(bio.efwMethod)}</li>`; } if (formatValue(bio?.efwPercentile)) bioContent += `<li><strong>EFW Percentile / Bách phân vị ƯLCN:</strong> ${formatValue(bio.efwPercentile, '%')}</li>`; if (bioContent) findingsHtml += `<h4>Fetal Biometry / Sinh trắc học Thai</h4><ul>${bioContent}</ul>`;
    const anatomy = data.fetalAnatomy; let anatomyContent = ''; let reportedNormal = false; let hasAbnormalities = false; // Anatomy
    ANATOMY_PARTS.forEach(part => { const partData = anatomy[part]; const status = formatValue(partData?.status); const desc = formatValue(partData?.desc); if (status && !status.startsWith(NORMAL_STATUS_PREFIX)) { const partName = part.charAt(0).toUpperCase() + part.slice(1); let partEntry = `<li><strong>${partName}:</strong> ${status}`; if (desc) partEntry += ` - ${desc}`; partEntry += `</li>`; anatomyContent += partEntry; hasAbnormalities = true; } else if (desc) { const partName = part.charAt(0).toUpperCase() + part.slice(1); anatomyContent += `<li><strong>${partName} (Description / Mô tả):</strong> ${desc}</li>`; hasAbnormalities = true; } else if (status.startsWith(NORMAL_STATUS_PREFIX)) { reportedNormal = true; } }); if (anatomyContent) { findingsHtml += `<h4>Fetal Anatomy Survey / Khảo sát Hình thái học Thai</h4><ul>${anatomyContent}</ul>`; } else if (reportedNormal && !hasAbnormalities) { findingsHtml += `<h4>Fetal Anatomy Survey / Khảo sát Hình thái học Thai</h4><p>Appears grossly normal for gestational age. / Đại thể bình thường theo tuổi thai.</p>`; }
    const fluid = data.amnioticFluid; let fluidContent = ''; // Fluid
    if (formatValue(fluid?.afi)) fluidContent += `<li><strong>AFI / Chỉ số ối:</strong> ${formatValue(fluid.afi, 'cm')}</li>`; if (formatValue(fluid?.sdp)) fluidContent += `<li><strong>SDP / Khoang ối sâu nhất:</strong> ${formatValue(fluid.sdp, 'cm')}</li>`; if (formatValue(fluid?.fluidAssessment)) fluidContent += `<li><strong>Assessment / Đánh giá:</strong> ${formatValue(fluid.fluidAssessment)}</li>`; if (fluidContent) findingsHtml += `<h4>Amniotic Fluid / Nước ối</h4><ul>${fluidContent}</ul>`;
    const plac = data.placenta; let placContent = ''; // Placenta
    if (formatValue(plac?.location)) placContent += `<li><strong>Location / Vị trí:</strong> ${formatValue(plac.location)}</li>`; if (formatValue(plac?.distanceOs) && (formatValue(plac?.location).includes('Low-lying') || formatValue(plac?.location).includes('Previa') || parseFloat(plac.distanceOs) >= 0)) { placContent += `<li><strong>Distance from Internal Os / Khoảng cách tới lỗ trong CTC:</strong> ${formatValue(plac.distanceOs, 'mm')}</li>`; } if (formatValue(plac?.grade)) placContent += `<li><strong>Grade / Độ trưởng thành:</strong> ${formatValue(plac.grade)}</li>`; if (formatValue(plac?.appearance)) placContent += `<li><strong>Appearance / Hình dạng:</strong> ${formatValue(plac.appearance)}</li>`; if (placContent) findingsHtml += `<h4>Placenta / Nhau thai</h4><ul>${placContent}</ul>`;
    const cerv = data.cervix; let cervContent = ''; // Cervix
    if (formatValue(cerv?.length)) cervContent += `<li><strong>Length / Chiều dài:</strong> ${formatValue(cerv.length, 'mm')} (${formatValue(cerv.method, '', 'N/A')})</li>`; else if(formatValue(cerv?.method)) cervContent += `<li><strong>Method / Phương pháp đo:</strong> ${formatValue(cerv.method)}</li>`; if (formatValue(cerv?.appearance)) cervContent += `<li><strong>Appearance / Hình dạng:</strong> ${formatValue(cerv.appearance)}</li>`; if (cervContent) findingsHtml += `<h4>Cervix / Cổ tử cung</h4><ul>${cervContent}</ul>`;
    const maternal = data.maternalStructures; let maternalContent = ''; // Maternal
    if (formatValue(maternal?.uterus)) maternalContent += `<li><strong>Uterus / Tử cung:</strong> ${formatValue(maternal.uterus)}</li>`; if (formatValue(maternal?.adnexa)) maternalContent += `<li><strong>Adnexa / Phần phụ:</strong> ${formatValue(maternal.adnexa)}</li>`; if (maternalContent) findingsHtml += `<h4>Maternal Structures / Cấu trúc của Mẹ</h4><ul>${maternalContent}</ul>`;
    const wellbeing = data.fetalWellbeing; let wellbeingContent = ''; // Wellbeing
    if (formatValue(wellbeing?.bppScore)) { let bppDetail = `<li><strong>BPP Score / Điểm TĐSL:</strong> ${formatValue(wellbeing.bppScore)}/8`; let comps = []; if(formatValue(wellbeing?.bppTone)) comps.push(`Tone:${wellbeing.bppTone}`); if(formatValue(wellbeing?.bppMovement)) comps.push(`Move:${wellbeing.bppMovement}`); if(formatValue(wellbeing?.bppBreathing)) comps.push(`Breath:${wellbeing.bppBreathing}`); if(formatValue(wellbeing?.bppFluid)) comps.push(`Fluid:${wellbeing.bppFluid}`); if (comps.length) bppDetail += ` (${comps.join(', ')})`; bppDetail += `</li>`; wellbeingContent += bppDetail; }
    if (formatValue(wellbeing?.uaPi)) wellbeingContent += `<li><strong>UA PI:</strong> ${formatValue(wellbeing.uaPi)}</li>`; if (formatValue(wellbeing?.uaRi)) wellbeingContent += `<li><strong>UA RI:</strong> ${formatValue(wellbeing.uaRi)}</li>`; if (formatValue(wellbeing?.uaSd)) wellbeingContent += `<li><strong>UA S/D:</strong> ${formatValue(wellbeing.uaSd)}</li>`; if (formatValue(wellbeing?.uaEdf)) wellbeingContent += `<li><strong>UA EDF:</strong> ${formatValue(wellbeing.uaEdf)}</li>`; if (formatValue(wellbeing?.mcaPi)) wellbeingContent += `<li><strong>MCA PI:</strong> ${formatValue(wellbeing.mcaPi)}</li>`; if (formatValue(wellbeing?.mcaRi)) wellbeingContent += `<li><strong>MCA RI:</strong> ${formatValue(wellbeing.mcaRi)}</li>`; if (formatValue(wellbeing?.mcaPsv)) wellbeingContent += `<li><strong>MCA PSV:</strong> ${formatValue(wellbeing.mcaPsv, 'cm/s')}</li>`; if (formatValue(wellbeing?.cpr)) wellbeingContent += `<li><strong>CPR:</strong> ${formatValue(wellbeing.cpr)}</li>`; if (wellbeingContent) findingsHtml += `<h4>Fetal Well-being / Sức khỏe Thai</h4><ul>${wellbeingContent}</ul>`;
    const impressionText = formatValue(data.impression); const recommendationText = formatValue(data.recommendation); // Impression/Recommendation
    if (impressionText) findingsHtml += `<hr class="report-hr"><h4>IMPRESSION / KẾT LUẬN:</h4><p>${impressionText}</p>`; if (recommendationText) findingsHtml += `<hr class="report-hr"><h4>RECOMMENDATION / ĐỀ NGHỊ:</h4><p>${recommendationText}</p>`;
    console.log("[ObstetricModule] Finished formatting Obstetric report HTML.");
    return `<div class="obstetric-findings-container">${findingsHtml || '<p>No significant findings entered / Không nhập kết quả nào.</p>'}</div>`;
}


console.log("obstetric-module.js loaded (with OCR integration hooks and GA/EDD calculation).");