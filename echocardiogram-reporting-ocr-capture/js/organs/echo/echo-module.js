// js/organs/echo/echo-module.js
// *** UPDATED WITH OCR INTEGRATION ***
// Module specific to Echocardiogram reporting logic.

// --- Core Imports ---
import { showNotification } from '../../core/ui-core.js';
import { populateForm, getFormData } from '../../core/form-core.js';

// --- Main Module Imports ---
// *** NEW: Import OCR related functions from main.js ***
import {
    getApiKey,
    isOcrAvailable,
    getOcrHandler
} from '../../main.js';

// --- Image Handler Import ---
// *** NEW: Import function to get image data by ID ***
import { getImageDataById } from '../../modules/image-handler.js';


// --- Module-level variables ---
const hideSuggestionTimeoutsEcho = {}; // Timeout tracker for echo textareas
const PI = Math.PI;
// *** NEW: OCR Prompt Variables ***
let ocrPromptEchoText = null; // Variable to store the loaded Echo OCR prompt
const OCR_PROMPT_ECHO_PATH = 'prompts/prompt_ocr_echo.txt'; // Path to the specific Echo OCR prompt


// --- *** NEW: Function to Load Echo OCR Prompt *** ---
/**
 * Loads the specific Echo OCR prompt text from file.
 */
async function loadOcrPromptEcho() {
    if (ocrPromptEchoText !== null) return; // Already loaded or failed

    if (!isOcrAvailable()) {
        console.log("[EchoModule] OCR is not available, skipping prompt load.");
        ocrPromptEchoText = ''; // Mark as attempted but unavailable
        return;
    }

    try {
        const response = await fetch(OCR_PROMPT_ECHO_PATH);
        if (!response.ok) {
             // Try fetching from parent directory if in nested structure during dev
             console.warn(`[EchoModule] Prompt not found at ${OCR_PROMPT_ECHO_PATH}, trying ../`);
             const responseAlt = await fetch('../' + OCR_PROMPT_ECHO_PATH);
             if (!responseAlt.ok) {
                  throw new Error(`HTTP error! Status: ${response.status} (Primary) / ${responseAlt.status} (Alt)`);
             }
             ocrPromptEchoText = await responseAlt.text();
        } else {
             ocrPromptEchoText = await response.text();
        }

        if (!ocrPromptEchoText) {
            console.warn(`[EchoModule] Loaded Echo OCR prompt from ${OCR_PROMPT_ECHO_PATH} but it's empty.`);
        } else {
            console.log("[EchoModule] Echo OCR Prompt loaded successfully.");
        }
    } catch (error) {
        console.error(`[EchoModule] Failed to load Echo OCR prompt from ${OCR_PROMPT_ECHO_PATH}:`, error);
        showNotification("Lỗi tải prompt OCR cho Echo. Tính năng OCR có thể không hoạt động.", "error");
        ocrPromptEchoText = ''; // Set to empty on failure to prevent trying again
    }
}


// --- *** NEW: Function to Handle OCR Button Click *** ---
/**
 * Handles clicks on the OCR trigger buttons added to image previews.
 * @param {Event} event - The click event object.
 */
async function handleEchoOcrClick(event) {
    const button = event.target.closest('.ocr-trigger-btn');
    if (!button) return; // Click wasn't on an OCR button

    const imageId = button.dataset.imageId;
    if (!imageId) {
        console.warn("[EchoModule] OCR button clicked but missing image ID.");
        return;
    }

    console.log(`[EchoModule] OCR button clicked for image ID: ${imageId}`);

    // --- Check Prerequisites ---
    if (!isOcrAvailable()) {
        showNotification("Tính năng OCR không khả dụng (module chưa tải hoặc thiếu API key).", "warning");
        return;
    }
    const apiKey = getApiKey();
    const ocrHandler = getOcrHandler();

    // Ensure prompt is loaded (it should have been loaded during init if OCR is available)
    if (ocrPromptEchoText === null || ocrPromptEchoText === '') {
         // Attempt to load again just in case, though unlikely needed if init worked
         await loadOcrPromptEcho();
         if (ocrPromptEchoText === null || ocrPromptEchoText === '') {
              showNotification("Không thể thực hiện OCR: Lỗi tải prompt.", "error");
              return;
         }
    }

    if (!apiKey || !ocrHandler || typeof ocrHandler.extractMeasurementsFromImage !== 'function') {
        showNotification("Không thể thực hiện OCR: Thiếu API Key hoặc hàm xử lý OCR.", "error");
        return;
    }

    // --- Get Image Data ---
    const imageData = getImageDataById(imageId);
    if (!imageData || !imageData.dataUrl || !imageData.mimeType) {
        showNotification("Không thể lấy dữ liệu ảnh cho OCR.", "error");
        return;
    }

    const base64Data = imageData.dataUrl.split(',')[1]; // Remove the "data:image/...;base64," prefix
    const mimeType = imageData.mimeType;

    if (!base64Data) {
         showNotification("Định dạng dữ liệu ảnh không hợp lệ cho OCR.", "error");
         return;
    }

    // --- Call OCR API ---
    button.classList.add('loading'); // Add loading state CSS
    button.disabled = true;
    showNotification("Đang đọc số đo từ ảnh...", "info", 2000);

    try {
        const jsonResult = await ocrHandler.extractMeasurementsFromImage(
            base64Data,
            mimeType,
            apiKey,
            ocrPromptEchoText // Use the specific Echo prompt
        );

        // --- Process Result ---
        if (jsonResult) {
            populateEchoFormWithOcr(jsonResult);
        } else {
             showNotification("OCR không trả về kết quả hợp lệ.", "warning");
        }

    } catch (error) {
        console.error("[EchoModule] OCR Processing Error:", error);
        showNotification(`Lỗi OCR: ${error.message}`, "error", 6000);
    } finally {
        button.classList.remove('loading'); // Remove loading state CSS
        button.disabled = false;
    }
}

// --- *** NEW: Function to Populate Form with OCR Data *** ---
/**
 * Populates the echo form fields based on the JSON data returned by OCR.
 * Uses populateForm for efficiency and triggers events for calculations.
 * @param {object} ocrData - The JSON object with measurement keys matching form field names.
 */
function populateEchoFormWithOcr(ocrData) {
    if (!ocrData || typeof ocrData !== 'object' || Object.keys(ocrData).length === 0) {
        showNotification("OCR không tìm thấy số đo nào để điền.", "info");
        return;
    }

    const form = document.getElementById('echo-assessment-form');
    if (!form) {
        console.error("[EchoModule] Echo assessment form not found for OCR population.");
        return;
    }

    console.log("[EchoModule] Populating form with OCR data:", ocrData);

    const fieldsToUpdate = {};
    const populatedFieldNames = []; // Keep track of which fields were populated

    // Iterate through the keys received from OCR
    for (const key in ocrData) {
        if (Object.hasOwnProperty.call(ocrData, key)) {
            // Find the corresponding form field by its 'name' attribute
            // This assumes the keys in ocrData JSON match the 'name' attributes in the form
            const field = form.querySelector(`[name="${key}"]`);

            if (field) {
                const value = ocrData[key];
                let valueToSet = value;

                // Basic validation/conversion (can be expanded)
                if (field.type === 'number') {
                    const numValue = parseFloat(value);
                    if (isNaN(numValue)) {
                        console.warn(`[EchoModule] OCR value for ${key} ('${value}') is not a valid number for field. Skipping.`);
                        continue; // Skip if not a valid number for number input
                    }
                    valueToSet = numValue;
                } else if (field.tagName === 'SELECT') {
                    // Basic check if the value exists as an option value
                    const optionExists = [...field.options].some(opt => opt.value === String(value));
                     if (!optionExists) {
                          console.warn(`[EchoModule] OCR value for ${key} ('${value}') not found in select options. Skipping.`);
                          continue; // Skip if value isn't a valid option
                     }
                     valueToSet = String(value); // Ensure it's a string for select
                } else {
                    // For text, textarea, etc., just use the value as string
                    valueToSet = String(value);
                }

                // Add to our update object
                fieldsToUpdate[key] = valueToSet;
                populatedFieldNames.push(key);

                // Add visual feedback (optional)
                field.classList.remove('ocr-filled'); // Remove first if already there
                field.offsetHeight; // Trigger reflow
                field.classList.add('ocr-filled');
                setTimeout(() => {
                    if (field) field.classList.remove('ocr-filled');
                }, 4000); // Remove highlight after 4 seconds

            } else {
                console.warn(`[EchoModule] Form field with name '${key}' not found for OCR population.`);
            }
        }
    }

    // Populate the form using the collected data
    if (Object.keys(fieldsToUpdate).length > 0) {
        populateForm(form, fieldsToUpdate, { dispatchEvents: true }); // IMPORTANT: dispatchEvents = true
        console.log("[EchoModule] Form fields populated by OCR:", fieldsToUpdate);
        showNotification(`OCR Đã điền: ${populatedFieldNames.join(', ')}. Vui lòng KIỂM TRA LẠI!`, "success", 7000);

        // Optionally, re-run all calculations explicitly after a short delay
        // This is a safety net in case populateForm's events don't trigger everything perfectly
        // setTimeout(() => runAllCalculations(form), 100);

    } else {
        showNotification("OCR không tìm thấy giá trị hợp lệ nào khớp với các trường trong form.", "info");
    }
}


// --- Initialization ---
/**
 * Initializes the echo module functionalities.
 * Sets up event listeners and calculation logic for the echo assessment form.
 */
export async function init() { // *** Make init async ***
    console.log("[EchoModule] Initializing...");
    try {
        const echoForm = document.getElementById('echo-assessment-form');
        // *** NEW: Get reference to image preview container for OCR listener ***
        const imagePreviewContainer = document.getElementById('image-preview-container');

        if (!echoForm) {
            console.error("[EchoModule] CRITICAL: Echo assessment form ('#echo-assessment-form') not found. Module cannot function.");
            showNotification("Error: Echocardiogram assessment UI not found.", "error");
            return; // Stop initialization if form is missing
        }

        // --- *** NEW: Load OCR Prompt if OCR is available *** ---
        await loadOcrPromptEcho();

        // --- Setup Suggestion Buttons ---
        setupSuggestionVisibilityEcho(echoForm);

        // Event Delegation for suggestion buttons within the echo form
        echoForm.addEventListener('click', function(event) {
            const target = event.target;
            // Handle Suggestion Button click
            if (target.classList.contains('suggestion-btn')) {
                handleSuggestionButtonClickEcho(target); // Use echo-specific handler
                const container = target.closest('.suggestion-button-container');
                if (container) container.style.display = 'none'; // Hide after click
            }
        });

        // --- *** NEW: Setup OCR Button Listener via Delegation *** ---
        if (isOcrAvailable() && imagePreviewContainer) {
             console.log("[EchoModule] OCR is available. Adding delegated listener for OCR buttons.");
             // Add listener to the container, listening for clicks on .ocr-trigger-btn
             imagePreviewContainer.addEventListener('click', handleEchoOcrClick);
        } else if (!imagePreviewContainer) {
             console.warn("[EchoModule] Image preview container not found, cannot add OCR listener.");
        } else {
             console.log("[EchoModule] OCR not available, skipping OCR listener setup.");
        }


        // --- Setup Automatic Calculations ---
        setupCalculations(echoForm);

        console.log("[EchoModule] Initialized successfully.");
    } catch (error) {
        console.error("[EchoModule] Error during initialization:", error);
        showNotification("Failed to initialize echo module.", "error");
    }
}

// --- Calculation Setup ---
/**
 * Attaches event listeners to input fields involved in calculations.
 * @param {HTMLElement} form - The echo assessment form element.
 */
function setupCalculations(form) {
    console.log("[EchoModule] Setting up calculation listeners...");

    const fieldsToListen = [
        // BSA
        'ptHeight', 'ptWeight',
        // LV Mass, RWT, EF
        'lvidD', 'lvidS', 'ivsD', 'lvpwD',
        // E/A Ratio
        'mvPeakE', 'mvPeakA',
        // Avg e', E/e'
        'tdiSeptalE', 'tdiLateralE',
        // SV, CO, CI
        'lvotDiam', 'lvotVTI', 'heartRate',
        // AVA, DI
        'avVTI', // Depends on lvotVTI as well, implicitly handled
        // MVA
        'mvPHT',
        // RVSP
        'peakTRVel', 'ivcDiam', 'ivcCollapse'
        // Add other fields if needed
    ];

    fieldsToListen.forEach(fieldName => {
        // Query within the specific form
        const inputs = form.querySelectorAll(`[name="${fieldName}"]`); // Use querySelectorAll in case of radios
        if (inputs.length > 0) {
             inputs.forEach(input => {
                  // Use 'input' for immediate feedback, 'change' as fallback/for selects/radios
                  input.removeEventListener('input', () => runAllCalculations(form)); // Remove first to prevent duplicates
                  input.removeEventListener('change', () => runAllCalculations(form));
                  input.addEventListener('input', () => runAllCalculations(form));
                  input.addEventListener('change', () => runAllCalculations(form));
             });
        } else {
            console.warn(`[EchoModule Calc] Input field not found for calculation listener: ${fieldName}`);
        }
    });
    console.log("[EchoModule] Calculation listeners set up.");
     // Initial calculation run in case form is pre-populated (e.g., by template or OCR)
     // Run slightly delayed to allow potential population to finish
     setTimeout(() => runAllCalculations(form), 250);
}


/**
 * Runs all calculation functions and updates the respective fields.
 * @param {HTMLElement} form - The echo assessment form element.
 */
function runAllCalculations(form) {
    // console.log("[EchoModule Calc] Running all calculations..."); // Can be noisy

    // Get current form data (only needed once per run)
    // Ensure getFormData uses the 'name' attribute correctly
    const data = getFormData(form); // Scoped to the echo form

    // Perform calculations in logical order (dependencies first)
    calculateBSA(form, data); // BSA needed for LVMi, CI
    calculateLVMassIndexRWT(form, data); // Mass needed for Index
    calculateEF(form, data);
    calculateEARatio(form, data);
    calculateTDI(form, data); // Avg e' needed for E/e'
    calculateStrokeVolumeCOCI(form, data); // SV needed for CO/CI
    calculateAVContinuityDI(form, data); // Needs LVOT/AV data
    calculateMVA(form, data);
    calculateRVSP(form, data); // Needs TR/IVC data
    // Add calls to any other calculation functions here
}

// --- Calculation Functions ---
// calculateBSA, calculateLVMassIndexRWT, calculateEF, calculateEARatio,
// calculateTDI, calculateStrokeVolumeCOCI, calculateAVContinuityDI,
// calculateMVA, estimateRAP, calculateRVSP
// (Keep existing calculation functions unchanged)
function calculateBSA(form, data) {
    const heightM = parseFloat(data.ptHeight);
    const weightKg = parseFloat(data.ptWeight);
    const bsaOutput = form.querySelector('[name="bsa"]');
    if (!bsaOutput) return;

    if (heightM > 0 && weightKg > 0) {
        const heightCm = heightM * 100;
        const bsa = Math.sqrt((heightCm * weightKg) / 3600);
        bsaOutput.value = bsa.toFixed(2);
    } else {
        bsaOutput.value = '';
    }
}

function calculateLVMassIndexRWT(form, data) {
    const lvidD = parseFloat(data.lvidD);
    const ivsD = parseFloat(data.ivsD);
    const lvpwD = parseFloat(data.lvpwD);
    // Recalculate BSA directly here or ensure it's passed correctly if calculated elsewhere first
    let bsa = parseFloat(form.querySelector('[name="bsa"]')?.value); // Get current BSA value from form
    if(isNaN(bsa)) {
         const heightM = parseFloat(form.querySelector('[name="ptHeight"]')?.value);
         const weightKg = parseFloat(form.querySelector('[name="ptWeight"]')?.value);
         if (heightM > 0 && weightKg > 0) {
              const heightCm = heightM * 100;
              bsa = Math.sqrt((heightCm * weightKg) / 3600);
         } else {
              bsa = NaN; // Cannot calculate BSA
         }
    }

    const lvMassOutput = form.querySelector('[name="lvMass"]');
    const lvMassIndexOutput = form.querySelector('[name="lvMassIndex"]');
    const rwtOutput = form.querySelector('[name="rwt"]');

    let lvMass = null;
    let lvMassIndex = null;
    let rwt = null;

    if (lvidD > 0 && ivsD > 0 && lvpwD > 0) {
        // Devereux formula
        lvMass = 0.8 * (1.04 * (Math.pow(lvidD + ivsD + lvpwD, 3) - Math.pow(lvidD, 3))) + 0.6;
        if (lvMassOutput) lvMassOutput.value = lvMass.toFixed(1);

        // RWT
        rwt = (2 * lvpwD) / lvidD;
        if (rwtOutput) rwtOutput.value = rwt.toFixed(2);

        // Mass Index
        if (lvMass > 0 && !isNaN(bsa) && bsa > 0) { // Check if BSA is valid
            lvMassIndex = lvMass / bsa;
            if (lvMassIndexOutput) lvMassIndexOutput.value = lvMassIndex.toFixed(1);
        } else {
            if (lvMassIndexOutput) lvMassIndexOutput.value = '';
        }
    } else {
        if (lvMassOutput) lvMassOutput.value = '';
        if (lvMassIndexOutput) lvMassIndexOutput.value = '';
        if (rwtOutput) rwtOutput.value = '';
    }
}

function calculateEF(form, data) {
    const lvidD = parseFloat(data.lvidD);
    const lvidS = parseFloat(data.lvidS);
    const efOutput = form.querySelector('[name="ef"]');
    if (!efOutput) return;

    if (lvidD > 0 && lvidS > 0 && lvidD > lvidS) {
        // Teichholz method - Use diameters in mm directly
        const edv_teich = (7.0 / (2.4 + (lvidD / 10))) * Math.pow((lvidD / 10), 3); // Convert mm to cm for formula
        const esv_teich = (7.0 / (2.4 + (lvidS / 10))) * Math.pow((lvidS / 10), 3); // Convert mm to cm for formula

        if (edv_teich > 0) {
             const ef = ((edv_teich - esv_teich) / edv_teich) * 100;
             efOutput.value = ef.toFixed(0);
        } else {
             efOutput.value = '';
        }
        // Simpler Cube method (often used as fallback or quick estimate)
        // const ef_cube = ((Math.pow(lvidD, 3) - Math.pow(lvidS, 3)) / Math.pow(lvidD, 3)) * 100;
        // efOutput.value = ef_cube.toFixed(0);

    } else {
        efOutput.value = '';
    }
}

function calculateEARatio(form, data) {
    const peakE = parseFloat(data.mvPeakE);
    const peakA = parseFloat(data.mvPeakA);
    const ratioOutput = form.querySelector('[name="eaRatio"]');
    if (!ratioOutput) return;

    if (peakE > 0 && peakA > 0) { // Allow peakE or peakA to be 0
        const ratio = peakE / peakA;
        ratioOutput.value = ratio.toFixed(2);
    } else if (peakE === 0 && peakA > 0) {
         ratioOutput.value = '0.00';
    } else {
         ratioOutput.value = ''; // If peakA is 0 or invalid
    }
}

function calculateTDI(form, data) {
    const septalE = parseFloat(data.tdiSeptalE); // cm/s
    const lateralE = parseFloat(data.tdiLateralE); // cm/s
    const peakE = parseFloat(data.mvPeakE); // m/s (from Mitral Inflow)
    const avgEOutput = form.querySelector('[name="tdiAvgE"]');
    const e_ePrimeOutput = form.querySelector('[name="e_ePrimeAvg"]');

    let avgE_cm_s = null;

    // Calculate Average e' (in cm/s)
    if (septalE > 0 && lateralE > 0) {
        avgE_cm_s = (septalE + lateralE) / 2;
        if (avgEOutput) avgEOutput.value = avgE_cm_s.toFixed(1);
    } else if (septalE > 0) {
        avgE_cm_s = septalE; // Use septal if lateral missing
        if (avgEOutput) avgEOutput.value = avgE_cm_s.toFixed(1);
    } else if (lateralE > 0) {
         avgE_cm_s = lateralE; // Use lateral if septal missing
        if (avgEOutput) avgEOutput.value = avgE_cm_s.toFixed(1);
    }
     else {
        if (avgEOutput) avgEOutput.value = '';
    }

    // Calculate E/e' ratio
    if (peakE > 0 && avgE_cm_s !== null && avgE_cm_s > 0) {
        // E is in m/s, e' is in cm/s. Need consistent units.
        // Convert e' from cm/s to m/s for the ratio calculation.
        const avgE_m_s = avgE_cm_s / 100.0;
        const e_ePrimeRatio = peakE / avgE_m_s;
        if (e_ePrimeOutput) e_ePrimeOutput.value = e_ePrimeRatio.toFixed(1);
    } else {
        if (e_ePrimeOutput) e_ePrimeOutput.value = '';
    }
}

function calculateStrokeVolumeCOCI(form, data) {
    const lvotDiam_cm = parseFloat(data.lvotDiam); // cm
    const lvotVTI_cm = parseFloat(data.lvotVTI);   // cm
    const hr = parseFloat(data.heartRate);         // bpm
    let bsa = parseFloat(form.querySelector('[name="bsa"]')?.value); // m^2
     // Recalculate BSA if needed
     if(isNaN(bsa)) {
         const heightM = parseFloat(form.querySelector('[name="ptHeight"]')?.value);
         const weightKg = parseFloat(form.querySelector('[name="ptWeight"]')?.value);
         if (heightM > 0 && weightKg > 0) {
              const heightCm = heightM * 100;
              bsa = Math.sqrt((heightCm * weightKg) / 3600);
         } else {
              bsa = NaN;
         }
    }

    const svOutput = form.querySelector('[name="sv"]');
    const coOutput = form.querySelector('[name="co"]');
    const ciOutput = form.querySelector('[name="ci"]');

    let sv = null;
    let co = null;

    // Calculate Stroke Volume (SV) in mL
    if (lvotDiam_cm > 0 && lvotVTI_cm > 0) {
        const lvotRadius_cm = lvotDiam_cm / 2.0;
        const lvotArea_cm2 = PI * Math.pow(lvotRadius_cm, 2);
        sv = lvotArea_cm2 * lvotVTI_cm; // cm^2 * cm = cm^3 = mL
        if (svOutput) svOutput.value = sv.toFixed(1);
    } else {
        if (svOutput) svOutput.value = '';
    }

    // Calculate Cardiac Output (CO) in L/min
    if (sv !== null && sv > 0 && hr > 0) {
        co = (sv * hr) / 1000.0; // (mL * bpm) / 1000 = L/min
        if (coOutput) coOutput.value = co.toFixed(1);
    } else {
        if (coOutput) coOutput.value = '';
    }

    // Calculate Cardiac Index (CI) in L/min/m^2
    if (co !== null && co > 0 && !isNaN(bsa) && bsa > 0) {
        const ci = co / bsa; // L/min / m^2
        if (ciOutput) ciOutput.value = ci.toFixed(1);
    } else {
        if (ciOutput) ciOutput.value = '';
    }
}

function calculateAVContinuityDI(form, data) {
    const lvotDiam_cm = parseFloat(data.lvotDiam); // cm
    const lvotVTI_cm = parseFloat(data.lvotVTI);   // cm
    const avVTI_cm = parseFloat(data.avVTI);       // cm (VTI across AV)
    const avaOutput = form.querySelector('[name="avaContinuity"]');
    const diOutput = form.querySelector('[name="avDI"]');

    let lvotArea_cm2 = null;
     if (lvotDiam_cm > 0) {
         const lvotRadius_cm = lvotDiam_cm / 2.0;
         lvotArea_cm2 = PI * Math.pow(lvotRadius_cm, 2); // cm^2
     }

    // Calculate AVA by Continuity (cm^2)
    if (lvotArea_cm2 !== null && lvotVTI_cm > 0 && avVTI_cm > 0) {
        const ava = (lvotArea_cm2 * lvotVTI_cm) / avVTI_cm; // (cm^2 * cm) / cm = cm^2
        if (avaOutput) avaOutput.value = ava.toFixed(2);
    } else {
        if (avaOutput) avaOutput.value = '';
    }

    // Calculate Doppler Index (DI) (dimensionless)
    if (lvotVTI_cm > 0 && avVTI_cm > 0) {
        const di = lvotVTI_cm / avVTI_cm;
        if (diOutput) diOutput.value = di.toFixed(2);
    } else {
        if (diOutput) diOutput.value = '';
    }
}


function calculateMVA(form, data) {
    const pht_ms = parseFloat(data.mvPHT); // ms
    const mvaOutput = form.querySelector('[name="mvaPHT"]');
    if (!mvaOutput) return;

    if (pht_ms > 0) {
        const mva_cm2 = 220 / pht_ms; // cm^2
        mvaOutput.value = mva_cm2.toFixed(2);
    } else {
        mvaOutput.value = '';
    }
}

function estimateRAP(ivcDiam_mm, ivcCollapse_percent) {
    // Simplified RAP estimation based on IVC diameter (mm) and collapse (%)
    const diam = parseFloat(ivcDiam_mm);
    const collapse = parseFloat(ivcCollapse_percent);

    // Use ASE 2015 guidelines simplified approach
    if (isNaN(diam)) return 8; // Default/Intermediate RAP if IVC diameter is missing

    if (diam <= 21 && collapse > 50) return 3;  // Normal RAP (3 mmHg, range 1-5)
    if (diam > 21 && collapse <= 50) return 15; // High RAP (15 mmHg, range 10-20)

    // Intermediate cases (or if only one parameter is met)
    // Diam <= 21, Collapse <= 50  -> Intermediate RAP
    // Diam > 21, Collapse > 50   -> Intermediate RAP
    // If collapse % is missing but diameter is known
     if (isNaN(collapse)) {
         if (diam <= 21) return 3; // Assume normal if diameter normal and collapse unknown
         if (diam > 21) return 15; // Assume high if diameter dilated and collapse unknown
     }

     // Default intermediate if conditions above aren't strictly met
    return 8;  // Intermediate RAP (8 mmHg, range 5-10)
}


function calculateRVSP(form, data) {
    const trVel_m_s = parseFloat(data.peakTRVel); // m/s
    const ivcDiam_mm = data.ivcDiam; // Keep as is for RAP function
    const ivcCollapse_percent = data.ivcCollapse; // Keep as is for RAP function
    const rvspOutput = form.querySelector('[name="estRVSP"]');
    if (!rvspOutput) return;

    if (trVel_m_s > 0) {
        const rap = estimateRAP(ivcDiam_mm, ivcCollapse_percent);
        // Simplified Bernoulli: Pressure Gradient = 4 * V^2
        const trPressureGradient = 4 * Math.pow(trVel_m_s, 2);
        // RVSP = TR Pressure Gradient + RAP
        const rvsp = trPressureGradient + rap;
        rvspOutput.value = rvsp.toFixed(0); // Report as whole number mmHg
    } else {
        rvspOutput.value = ''; // Cannot calculate if TR velocity is missing/invalid
    }
}


// --- Suggestion Button Handling (Adapted from Abdominal) ---
/**
 * Sets up focus/blur listeners for suggestion buttons visibility within the echo form.
 * @param {HTMLElement} parentElement - The echo form element.
 */
function setupSuggestionVisibilityEcho(parentElement) {
    const suggestionContainers = parentElement.querySelectorAll('.suggestion-button-container');
    suggestionContainers.forEach(container => {
        const inputElement = container.previousElementSibling; // Assumes input/textarea is right before container
        if (inputElement && (inputElement.tagName === 'TEXTAREA' || inputElement.tagName === 'INPUT')) {
            let elementId = inputElement.id || `input_echo_${Date.now()}_${Math.random().toString(16).slice(2)}`;
            inputElement.id = elementId; // Ensure it has an ID

            inputElement.removeEventListener('focus', handleTextareaFocusEcho);
            inputElement.removeEventListener('blur', handleTextareaBlurEcho);
            inputElement.addEventListener('focus', handleTextareaFocusEcho);
            inputElement.addEventListener('blur', handleTextareaBlurEcho);
        } else {
             console.warn("[EchoModule] Could not find textarea/input before suggestion container:", container);
        }
    });
}

// Named function for focus listener
function handleTextareaFocusEcho(event) {
    const inputElement = event.target;
    const elementId = inputElement.id;
    const container = inputElement.nextElementSibling;
    if (hideSuggestionTimeoutsEcho[elementId]) {
        clearTimeout(hideSuggestionTimeoutsEcho[elementId]);
        delete hideSuggestionTimeoutsEcho[elementId];
    }
    if (container && container.classList.contains('suggestion-button-container')) {
        container.style.display = 'flex'; // Use flex for wrapping
    }
}

// Named function for blur listener
function handleTextareaBlurEcho(event) {
    const inputElement = event.target;
    const elementId = inputElement.id;
    const container = inputElement.nextElementSibling;
    if (container && container.classList.contains('suggestion-button-container')) {
        hideSuggestionTimeoutsEcho[elementId] = setTimeout(() => {
            container.style.display = 'none';
            delete hideSuggestionTimeoutsEcho[elementId];
        }, 250); // 250ms delay
    }
}

/**
 * Handles suggestion button clicks for echo module.
 * @param {HTMLButtonElement} button - The button clicked.
 */
function handleSuggestionButtonClickEcho(button) {
    const textToInsert = button.dataset.insert;
    const container = button.closest('.suggestion-button-container');
    const targetElement = container ? container.previousElementSibling : null;

    if (targetElement && (targetElement.tagName === 'TEXTAREA' || targetElement.tagName === 'INPUT') && textToInsert !== undefined) {
        const currentValue = targetElement.value;
        let separator = '';
        // Basic check for needing a separator (space or period+space)
        if (currentValue.trim().length > 0 && !currentValue.endsWith(' ') && !currentValue.endsWith('\n')) {
            const lastChar = currentValue.trim().slice(-1);
             separator = ['.', '?', '!', ':', ';', ','].includes(lastChar) ? ' ' : '. ';
        }

        targetElement.value += separator + textToInsert;
        targetElement.dispatchEvent(new Event('input', { bubbles: true })); // Trigger input event for potential listeners
        targetElement.focus();
        // Scroll to bottom if textarea
        if(targetElement.tagName === 'TEXTAREA') {
            targetElement.scrollTop = targetElement.scrollHeight;
        }
    } else {
        console.warn("[EchoModule] Target input/textarea or data-insert attribute not found for suggestion button.", button);
    }
}


// --- Data Collection ---
/**
 * Collects all data for the echocardiogram assessment form.
 * Structures the data logically.
 * Returns an object containing the data AND a function `formatReportSectionHtml`.
 * @returns {object | null} - Echo data object including the formatting function, or null on error.
 */
export function collectEchoData() {
    console.log("[EchoModule] Collecting echo data...");
    const form = document.getElementById('echo-assessment-form');
    if (!form) {
        console.error("[collectEchoData] Echo assessment form ('#echo-assessment-form') not found.");
        return null;
    }

    try {
        // Run calculations one last time to ensure calculated fields are up-to-date
        runAllCalculations(form);

        // Use getFormData scoped to the echo form
        // Ensure getFormData is correctly getting values based on 'name' attributes
        const allFormData = getFormData(form);

        // Structure the data logically by section, matching the form structure
        // AND the keys expected by the report formatter
        const structuredData = {
            clinicalInfo: {
                ptHeight: allFormData.ptHeight,
                ptWeight: allFormData.ptWeight,
                bsa: allFormData.bsa,
                heartRate: allFormData.heartRate,
                bloodPressure: allFormData.bloodPressure,
                studyQuality: allFormData.studyQuality,
                indications: allFormData.indications,
            },
            measurements2D: {
                lvidD: allFormData.lvidD,
                lvidS: allFormData.lvidS,
                ivsD: allFormData.ivsD,
                lvpwD: allFormData.lvpwD,
                lvMass: allFormData.lvMass,
                lvMassIndex: allFormData.lvMassIndex,
                rwt: allFormData.rwt,
                laDiamPS: allFormData.laDiamPS,
                laVolIndex: allFormData.laVolIndex,
                aoRootDiam: allFormData.aoRootDiam,
                aoAnnulusDiam: allFormData.aoAnnulusDiam,
                ascAoDiam: allFormData.ascAoDiam,
                raArea: allFormData.raArea,
                rvDiam: allFormData.rvDiam,
                rvFac: allFormData.rvFac,
                tapse: allFormData.tapse,
                ivcDiam: allFormData.ivcDiam,
                ivcCollapse: allFormData.ivcCollapse,
                paDiam: allFormData.paDiam,
                ef: allFormData.ef, // EF is calculated but included here for reporting
            },
            measurementsMMode: {
                 epss: allFormData.epss,
                 // Add other M-Mode fields if added to HTML
            },
            measurementsDoppler: {
                mitralInflow: {
                    mvPeakE: allFormData.mvPeakE,
                    mvPeakA: allFormData.mvPeakA,
                    eaRatio: allFormData.eaRatio,
                    decelTime: allFormData.decelTime,
                    ivrt: allFormData.ivrt,
                },
                tdi: {
                    tdiSeptalE: allFormData.tdiSeptalE,
                    tdiLateralE: allFormData.tdiLateralE,
                    tdiAvgE: allFormData.tdiAvgE,
                    e_ePrimeAvg: allFormData.e_ePrimeAvg,
                    tdiSeptalS: allFormData.tdiSeptalS,
                    tdiLateralS: allFormData.tdiLateralS,
                    tdiRvS: allFormData.tdiRvS,
                },
                pulmonaryVein: {
                    pvS: allFormData.pvS,
                    pvD: allFormData.pvD,
                    pvArMinusMvA: allFormData.pvArMinusMvA,
                },
                lvotCalculations: {
                    lvotDiam: allFormData.lvotDiam,
                    lvotVTI: allFormData.lvotVTI,
                    sv: allFormData.sv,
                    co: allFormData.co,
                    ci: allFormData.ci,
                },
                aorticValve: {
                    avPeakVel: allFormData.avPeakVel,
                    avPeakGrad: allFormData.avPeakGrad,
                    avMeanGrad: allFormData.avMeanGrad,
                    avVTI: allFormData.avVTI, // Added AV VTI input
                    avaContinuity: allFormData.avaContinuity,
                    avDI: allFormData.avDI,
                },
                mitralValve: {
                    mvPeakVel: allFormData.mvPeakVel,
                    mvPeakGrad: allFormData.mvPeakGrad,
                    mvMeanGrad: allFormData.mvMeanGrad,
                    mvPHT: allFormData.mvPHT, // Added PHT input
                    mvaPHT: allFormData.mvaPHT,
                },
                tricuspidValve: {
                    peakTRVel: allFormData.peakTRVel,
                    estRVSP: allFormData.estRVSP,
                },
                pulmonicValve: {
                    pvPeakVel: allFormData.pvPeakVel,
                    pvPeakGrad: allFormData.pvPeakGrad,
                    padpFromPR: allFormData.padpFromPR,
                },
                mrQuant: {
                    mrPisaRadius: allFormData.mrPisaRadius,
                    mrEROA: allFormData.mrEROA,
                    mrRegVol: allFormData.mrRegVol,
                    mrVenaContracta: allFormData.mrVenaContracta,
                },
                arQuant: {
                    arPHT: allFormData.arPHT,
                    arVenaContracta: allFormData.arVenaContracta,
                }
                // Add other Doppler sub-sections if they exist
            },
            leftVentricle: {
                lvSize: allFormData.lvSize,
                lvWallThickness: allFormData.lvWallThickness,
                lvSystolicFuncQual: allFormData.lvSystolicFuncQual,
                gls: allFormData.gls,
                rwma: allFormData.rwma,
            },
            lvDiastolicFunction: {
                diastolicGrade: allFormData.diastolicGrade,
                laPressureEst: allFormData.laPressureEst,
            },
            rightVentricle: {
                rvSize: allFormData.rvSize,
                rvWallThickness: allFormData.rvWallThickness,
                rvSystolicFuncQual: allFormData.rvSystolicFuncQual,
            },
            atria: {
                laSizeVolume: allFormData.laSizeVolume,
                raSizeVolume: allFormData.raSizeVolume,
            },
            aorticValve: {
                avMorphology: allFormData.avMorphology,
                asGrade: allFormData.asGrade,
                arGrade: allFormData.arGrade,
                arDescription: allFormData.arDescription,
            },
            mitralValve: {
                mvMorphology: allFormData.mvMorphology,
                msGrade: allFormData.msGrade,
                mrGrade: allFormData.mrGrade,
                mrDescription: allFormData.mrDescription,
            },
            tricuspidValve: {
                tvMorphology: allFormData.tvMorphology,
                tsGrade: allFormData.tsGrade,
                trGrade: allFormData.trGrade,
            },
            pulmonicValve: {
                pvMorphology: allFormData.pvMorphology,
                psGrade: allFormData.psGrade,
                prGrade: allFormData.prGrade,
            },
            prostheticValves: {
                prostheticValveTypePos: allFormData.prostheticValveTypePos,
                prostheticValveAssess: allFormData.prostheticValveAssess,
            },
            pericardium: {
                pericardiumAppearance: allFormData.pericardiumAppearance,
                pericardialEffusion: allFormData.pericardialEffusion,
                effusionDescription: allFormData.effusionDescription,
            },
            congenitalFindings: {
                congenitalDesc: allFormData.congenitalDesc,
            },
            aortaGreatVessels: {
                aorticArchDesc: allFormData.aorticArchDesc,
                paDesc: allFormData.paDesc,
            },
            impression: allFormData.impression,
            recommendation: allFormData.recommendation,

            // IMPORTANT: Attach the specific formatter function for the echo report section
            formatReportSectionHtml: function() { return formatEchoReportSectionHtml(this); }
        };

        console.debug("[collectEchoData] Collected Echo Data:", JSON.parse(JSON.stringify(structuredData))); // Log a copy
        return structuredData;

    } catch (error) {
        console.error("[collectEchoData] Error collecting echo data:", error);
        showNotification("Failed to collect echo assessment data.", "error");
        return null;
    }
}


// --- Template Loading ---
/**
 * Loads template data into the echo assessment form.
 * @param {object} echoTemplateData - Echo-specific template data (content matching the structuredData).
 */
export async function loadEchoTemplateData(echoTemplateData) {
    if (!echoTemplateData || typeof echoTemplateData !== 'object') {
        console.warn("[loadEchoTemplateData] Invalid or missing echo template data provided.");
        return;
    }
    console.log("[EchoModule] Loading echo template data...");
    const form = document.getElementById('echo-assessment-form');

    if (!form) {
        console.error("[loadEchoTemplateData] Echo form not found! Cannot load template.");
        showNotification("Cannot load echo template: UI elements missing.", "error");
        return;
    }

    try {
        // Flatten the structured data for populateForm
        const flattenedData = {};
        for (const sectionKey in echoTemplateData) {
            if (echoTemplateData.hasOwnProperty(sectionKey) && typeof echoTemplateData[sectionKey] === 'object' && echoTemplateData[sectionKey] !== null) {
                const sectionData = echoTemplateData[sectionKey];
                for (const key in sectionData) {
                    if (sectionData.hasOwnProperty(key)) {
                        // Handle nested Doppler structure specifically IF form fields have unique names
                        if (key === 'measurementsDoppler' && typeof sectionData[key] === 'object' && sectionData[key] !== null) {
                             const dopplerData = sectionData[key];
                             for(const subSectionKey in dopplerData) {
                                  if(dopplerData.hasOwnProperty(subSectionKey) && typeof dopplerData[subSectionKey] === 'object' && dopplerData[subSectionKey] !== null) {
                                       const subSectionData = dopplerData[subSectionKey];
                                       for(const subKey in subSectionData) {
                                            if(subSectionData.hasOwnProperty(subKey)) {
                                                 // Assumes subKey directly matches a form field name (e.g., 'mvPeakE', 'tdiSeptalE')
                                                 flattenedData[subKey] = subSectionData[subKey];
                                            }
                                       }
                                  }
                             }
                        } else if (typeof sectionData[key] === 'object' && sectionData[key] !== null) {
                             // Generic handling for potentially nested objects (like aorticValve, mitralValve etc.)
                             const nestedData = sectionData[key];
                             for (const nestedKey in nestedData) {
                                  if (nestedData.hasOwnProperty(nestedKey)) {
                                       // Assumes nestedKey directly matches form field name (e.g., 'avMorphology', 'asGrade')
                                       flattenedData[nestedKey] = nestedData[nestedKey];
                                  }
                             }
                        } else {
                            // Basic flattening: key -> key (e.g., lvSize, gls)
                             flattenedData[key] = sectionData[key];
                        }
                    }
                }
            } else if (echoTemplateData.hasOwnProperty(sectionKey) && ['impression', 'recommendation'].includes(sectionKey)) {
                // Top-level keys (impression, recommendation)
                flattenedData[sectionKey] = echoTemplateData[sectionKey];
            }
             // Handle clinicalInfo separately if it's at the top level of templateData
            else if (sectionKey === 'clinicalInfo' && typeof echoTemplateData[sectionKey] === 'object' && echoTemplateData[sectionKey] !== null) {
                 Object.assign(flattenedData, echoTemplateData[sectionKey]);
            }
        }

         console.log("[loadEchoTemplateData] Flattened data for population:", flattenedData);

        // Populate the form fields
        // Dispatch events = true to ensure dynamic elements update and calculations run
        populateForm(form, flattenedData, { dispatchEvents: true });
        console.log("[loadEchoTemplateData] Echo form fields populated.");

        // Re-run calculations explicitly after loading data and dispatching events
        // Use setTimeout to ensure events have propagated and values are set
        setTimeout(() => runAllCalculations(form), 150);

        // Re-setup suggestion visibility *after* population might be needed if fields were initially empty
        setTimeout(() => setupSuggestionVisibilityEcho(form), 150);


        console.log("[loadEchoTemplateData] Finished applying echo template data.");

    } catch (error) {
        console.error("[loadEchoTemplateData] Error applying echo template:", error);
        showNotification("Failed to apply echo template data.", "error");
    }
}


// --- Report Formatting ---

/** Helper to get value safely and handle line breaks. Returns null if empty/invalid. */
const getReportValue = (val) => {
    if (val === null || val === undefined || String(val).trim() === '') {
        return null; // Indicate empty
    }
    // Replace multiple consecutive newlines with a single <br>, then handle single newlines
    let formatted = String(val).replace(/\n\s*\n+/g, '<br>');
    return formatted.replace(/\n/g, '<br>&nbsp;&nbsp;'); // Handle remaining single line breaks
};


/** Helper to add a list item to HTML string only if value exists */
const addListItem = (label, value, unit = '') => {
    const formattedValue = getReportValue(value);
    if (formattedValue !== null) {
         // Add a non-breaking space before the unit if it exists
         const unitStr = unit ? `&nbsp;${unit}` : '';
        return `<li><strong>${label}:</strong> ${formattedValue}${unitStr}</li>`;
    }
    return '';
};


/** Helper to add a paragraph if value exists */
const addParagraph = (label, value) => {
    const formattedValue = getReportValue(value);
    if (formattedValue !== null) {
         // Simple paragraph for text descriptions
        return `<p><strong>${label}:</strong> ${formattedValue}</p>`;
    }
    return '';
}


/** Helper to format a standard section with key-value pairs */
function formatStandardSection(title, data, fields) {
    if (!data) return '';
    let content = '';
    let hasData = false;

    fields.forEach(field => {
        const itemHtml = addListItem(field.label, data[field.key], field.unit);
        if (itemHtml) {
            content += itemHtml;
            hasData = true;
        }
    });

    return hasData ? `<h4>${title}</h4><ul>${content}</ul>` : '';
}


/** Helper to format valve sections (Morphology + Grades + Description) */
function formatValveSection(title, valveData, morphologyKey, stenosisKey, regurgKey, descriptionKey) {
    if (!valveData) return '';
    let content = '';
    let hasData = false;

    // Use the provided keys to access the data
    const morphology = getReportValue(valveData[morphologyKey]);
    const stenosisGrade = getReportValue(valveData[stenosisKey]);
    const regurgGrade = getReportValue(valveData[regurgKey]);
    const description = getReportValue(valveData[descriptionKey]); // Optional description

    if (morphology) {
        content += `<p><strong>Morphology / Hình thái:</strong> ${morphology}</p>`;
        hasData = true;
    }

    let gradesList = '';
    if (stenosisGrade !== null) {
        gradesList += addListItem('Stenosis Grade / Độ hẹp', stenosisGrade);
        hasData = true;
    }
    if (regurgGrade !== null) {
         // Handle specific "None/Trivial" value for cleaner output if needed
         const displayRegurg = (regurgGrade === "None/Trivial / Không/Không đáng kể") ? "None/Trivial / Không/Không đáng kể" : regurgGrade;
        gradesList += addListItem('Regurgitation Grade / Độ hở', displayRegurg);
        hasData = true;
    }

    if (gradesList) {
        content += `<ul>${gradesList}</ul>`;
    }

    if (description) {
        // Only add description if regurgitation is more than trivial (optional logic)
        // if (regurgGrade && regurgGrade !== "None/Trivial / Không/Không đáng kể") {
            content += addParagraph('Description / Mô tả', description);
            hasData = true;
        // }
    }

    return hasData ? `<h4>${title}</h4>${content}` : '';
}


/**
 * Formats the FINDINGS section for an Echocardiogram report as an HTML string.
 * Uses the data object collected by collectEchoData.
 * **Crucially, only includes parameters with non-empty values.**
 * @param {object} data - Collected echo data object.
 * @returns {string} - Formatted findings HTML block string.
 */
function formatEchoReportSectionHtml(data) {
    console.log("[EchoModule] Formatting Echo report section HTML...");
    if (!data) return "<p>Error: No echo data provided for formatting.</p>";

    let findings = '';

    // --- Measurements ---
    let measurementsContent = '';
    // 2D
    const meas2DFields = [
        { key: 'lvidD', label: 'LVIDd', unit: 'mm' }, { key: 'lvidS', label: 'LVIDs', unit: 'mm' },
        { key: 'ivsD', label: 'IVSd', unit: 'mm' }, { key: 'lvpwD', label: 'LVPWd', unit: 'mm' },
        { key: 'lvMass', label: 'LV Mass', unit: 'g' }, { key: 'lvMassIndex', label: 'LV Mass Index', unit: 'g/m²' },
        { key: 'rwt', label: 'RWT' }, { key: 'laDiamPS', label: 'LA Diam (PS)', unit: 'mm' },
        { key: 'laVolIndex', label: 'LAVi', unit: 'ml/m²' }, { key: 'aoRootDiam', label: 'Ao Root Diam', unit: 'mm' },
        { key: 'aoAnnulusDiam', label: 'Ao Annulus Diam', unit: 'mm' }, { key: 'ascAoDiam', label: 'Asc Ao Diam', unit: 'mm' },
        { key: 'raArea', label: 'RA Area', unit: 'cm²' }, { key: 'rvDiam', label: 'RV Basal Diam', unit: 'mm' },
        { key: 'rvFac', label: 'RV FAC', unit: '%' }, { key: 'tapse', label: 'TAPSE', unit: 'mm' },
        { key: 'ivcDiam', label: 'IVC Diam', unit: 'mm' }, { key: 'ivcCollapse', label: 'IVC Collapse', unit: '%' },
        { key: 'paDiam', label: 'PA Diam', unit: 'mm' }, { key: 'ef', label: 'EF (Teich)', unit: '%' },
    ];
    meas2DFields.forEach(f => measurementsContent += addListItem(f.label, data.measurements2D?.[f.key], f.unit));

    // M-Mode
    const measMModeFields = [ { key: 'epss', label: 'EPSS', unit: 'mm' } ];
    measMModeFields.forEach(f => measurementsContent += addListItem(f.label, data.measurementsMMode?.[f.key], f.unit));

    // Doppler - Mitral Inflow
    const dopplerMIFields = [
        { key: 'mvPeakE', label: 'Mitral Peak E', unit: 'm/s' }, { key: 'mvPeakA', label: 'Mitral Peak A', unit: 'm/s' },
        { key: 'eaRatio', label: 'E/A Ratio' }, { key: 'decelTime', label: 'DT', unit: 'ms' }, { key: 'ivrt', label: 'IVRT', unit: 'ms' },
    ];
    dopplerMIFields.forEach(f => measurementsContent += addListItem(f.label, data.measurementsDoppler?.mitralInflow?.[f.key], f.unit));

    // Doppler - TDI
    const dopplerTDIFields = [
        { key: 'tdiSeptalE', label: "Septal e'", unit: 'cm/s' }, { key: 'tdiLateralE', label: "Lateral e'", unit: 'cm/s' },
        { key: 'tdiAvgE', label: "Average e'", unit: 'cm/s' }, { key: 'e_ePrimeAvg', label: "E/e' (avg)" },
        { key: 'tdiSeptalS', label: "Septal S'", unit: 'cm/s' }, { key: 'tdiLateralS', label: "Lateral S'", unit: 'cm/s' },
        { key: 'tdiRvS', label: "RV S'", unit: 'cm/s' },
    ];
    dopplerTDIFields.forEach(f => measurementsContent += addListItem(f.label, data.measurementsDoppler?.tdi?.[f.key], f.unit));

    // Doppler - Pulm Vein
    const dopplerPVFields = [
        { key: 'pvS', label: 'PV S wave', unit: 'm/s' }, { key: 'pvD', label: 'PV D wave', unit: 'm/s' },
        { key: 'pvArMinusMvA', label: 'Ar-A diff', unit: 'ms' },
    ];
     dopplerPVFields.forEach(f => measurementsContent += addListItem(f.label, data.measurementsDoppler?.pulmonaryVein?.[f.key], f.unit));

    // Doppler - LVOT/SV/CO
    const dopplerLVOTFields = [
        { key: 'lvotDiam', label: 'LVOT Diam', unit: 'cm' }, { key: 'lvotVTI', label: 'LVOT VTI', unit: 'cm' },
        { key: 'sv', label: 'SV', unit: 'ml' }, { key: 'co', label: 'CO', unit: 'L/min' }, { key: 'ci', label: 'CI', unit: 'L/min/m²' },
    ];
    dopplerLVOTFields.forEach(f => measurementsContent += addListItem(f.label, data.measurementsDoppler?.lvotCalculations?.[f.key], f.unit));

    // Doppler - AV
    const dopplerAVFields = [
        { key: 'avPeakVel', label: 'AV Peak Vel', unit: 'm/s' }, { key: 'avPeakGrad', label: 'AV Peak Grad', unit: 'mmHg' },
        { key: 'avMeanGrad', label: 'AV Mean Grad', unit: 'mmHg' }, { key: 'avVTI', label: 'AV VTI', unit: 'cm' },
        { key: 'avaContinuity', label: 'AVA (Continuity)', unit: 'cm²' }, { key: 'avDI', label: 'AV DI' },
    ];
    dopplerAVFields.forEach(f => measurementsContent += addListItem(f.label, data.measurementsDoppler?.aorticValve?.[f.key], f.unit));

    // Doppler - MV
    const dopplerMVFields = [
        { key: 'mvPeakVel', label: 'MV Peak Vel', unit: 'm/s' }, { key: 'mvPeakGrad', label: 'MV Peak Grad', unit: 'mmHg' },
        { key: 'mvMeanGrad', label: 'MV Mean Grad', unit: 'mmHg' }, { key: 'mvPHT', label: 'MV PHT', unit: 'ms' },
        { key: 'mvaPHT', label: 'MVA (PHT)', unit: 'cm²' },
    ];
    dopplerMVFields.forEach(f => measurementsContent += addListItem(f.label, data.measurementsDoppler?.mitralValve?.[f.key], f.unit));

    // Doppler - TV
    const dopplerTVFields = [ { key: 'peakTRVel', label: 'Peak TR Vel', unit: 'm/s' }, { key: 'estRVSP', label: 'Est. PASP', unit: 'mmHg' } ];
    dopplerTVFields.forEach(f => measurementsContent += addListItem(f.label, data.measurementsDoppler?.tricuspidValve?.[f.key], f.unit));

    // Doppler - PV
    const dopplerPVFlowFields = [
        { key: 'pvPeakVel', label: 'PV Peak Vel', unit: 'm/s' }, { key: 'pvPeakGrad', label: 'PV Peak Grad', unit: 'mmHg' },
        { key: 'padpFromPR', label: 'PADP (from PR)', unit: 'mmHg' },
    ];
    dopplerPVFlowFields.forEach(f => measurementsContent += addListItem(f.label, data.measurementsDoppler?.pulmonicValve?.[f.key], f.unit));

    // Doppler - MR Quant
    const dopplerMRQuantFields = [
        { key: 'mrPisaRadius', label: 'MR PISA Radius', unit: 'cm' }, { key: 'mrEROA', label: 'MR EROA', unit: 'cm²' },
        { key: 'mrRegVol', label: 'MR Reg Vol', unit: 'ml' }, { key: 'mrVenaContracta', label: 'MR Vena Contracta', unit: 'cm' },
    ];
    dopplerMRQuantFields.forEach(f => measurementsContent += addListItem(f.label, data.measurementsDoppler?.mrQuant?.[f.key], f.unit));

    // Doppler - AR Quant
    const dopplerARQuantFields = [ { key: 'arPHT', label: 'AR PHT', unit: 'ms' }, { key: 'arVenaContracta', label: 'AR Vena Contracta', unit: 'cm' } ];
    dopplerARQuantFields.forEach(f => measurementsContent += addListItem(f.label, data.measurementsDoppler?.arQuant?.[f.key], f.unit));


    if (measurementsContent) {
        findings += `<h4>Measurements / Các số đo:</h4><ul>${measurementsContent}</ul>`;
    }

     // --- Qualitative Assessments ---
    findings += formatStandardSection('Left Ventricle / Thất Trái', data.leftVentricle, [
        { key: 'lvSize', label: 'LV Size / Kích thước TT' },
        { key: 'lvWallThickness', label: 'LV Wall Thickness / Bề dày thành TT' },
        { key: 'lvSystolicFuncQual', label: 'LV Systolic Function (Qualitative) / CN tâm thu TT (Định tính)' },
        { key: 'gls', label: 'GLS', unit: '%' },
    ]);
    findings += addParagraph('RWMA / RLVĐ Vùng', data.leftVentricle?.rwma);

    findings += formatStandardSection('LV Diastolic Function / Chức năng tâm trương TT', data.lvDiastolicFunction, [
        { key: 'diastolicGrade', label: 'Grade / Phân độ' },
        { key: 'laPressureEst', label: 'LA Pressure Estimation / Ước tính áp lực NT' },
    ]);

    findings += formatStandardSection('Right Ventricle / Thất Phải', data.rightVentricle, [
        { key: 'rvSize', label: 'RV Size / Kích thước TP' },
        { key: 'rvWallThickness', label: 'RV Wall Thickness / Bề dày thành TP' },
        { key: 'rvSystolicFuncQual', label: 'RV Systolic Function (Qualitative) / CN tâm thu TP (Định tính)' },
    ]);

     findings += formatStandardSection('Atria / Nhĩ Trái & Phải', data.atria, [
        { key: 'laSizeVolume', label: 'LA Size/Volume / Kích thước/Thể tích NT' },
        { key: 'raSizeVolume', label: 'RA Size/Volume / Kích thước/Thể tích NP' },
    ]);

    // --- Valves ---
    // Use the specific keys for each valve section
    findings += formatValveSection('Aortic Valve / Van ĐMC', data.aorticValve, 'avMorphology', 'asGrade', 'arGrade', 'arDescription');
    findings += formatValveSection('Mitral Valve / Van Hai Lá', data.mitralValve, 'mvMorphology', 'msGrade', 'mrGrade', 'mrDescription');
    findings += formatValveSection('Tricuspid Valve / Van Ba Lá', data.tricuspidValve, 'tvMorphology', 'tsGrade', 'trGrade', null); // No description field for TR
    findings += formatValveSection('Pulmonic Valve / Van ĐM Phổi', data.pulmonicValve, 'pvMorphology', 'psGrade', 'prGrade', null); // No description field for PR


    // --- Prosthetic Valves ---
    let prostheticContent = '';
    prostheticContent += addListItem('Type/Position / Loại/Vị trí', data.prostheticValves?.prostheticValveTypePos);
    prostheticContent += addParagraph('Assessment / Đánh giá', data.prostheticValves?.prostheticValveAssess);
    if (getReportValue(data.prostheticValves?.prostheticValveTypePos) || getReportValue(data.prostheticValves?.prostheticValveAssess)) {
        findings += `<h4>Prosthetic Valves / Van nhân tạo</h4>${prostheticContent}`;
    }

    // --- Pericardium ---
    let pericardiumContent = '';
    pericardiumContent += addListItem('Appearance / Hình thái', data.pericardium?.pericardiumAppearance);
    pericardiumContent += addListItem('Effusion / Tràn dịch', data.pericardium?.pericardialEffusion);
    pericardiumContent += addParagraph('Effusion Description / Mô tả dịch', data.pericardium?.effusionDescription);
     if (getReportValue(data.pericardium?.pericardiumAppearance) || getReportValue(data.pericardium?.pericardialEffusion) || getReportValue(data.pericardium?.effusionDescription)) {
         findings += `<h4>Pericardium / Màng ngoài tim</h4>${pericardiumContent}`;
    }

    // --- Other Sections ---
    findings += addParagraph('Congenital Findings / Bất thường bẩm sinh', data.congenitalFindings?.congenitalDesc);
    findings += addParagraph('Aortic Arch / Cung ĐMC', data.aortaGreatVessels?.aorticArchDesc);
    findings += addParagraph('Pulmonary Artery / Động mạch phổi', data.aortaGreatVessels?.paDesc);


    // --- Impression and Recommendation ---
    const impression = getReportValue(data.impression);
    const recommendation = getReportValue(data.recommendation);

    // Use <hr> consistently before these final sections
    if (impression) {
        findings += `<hr class="report-hr"><h4>IMPRESSION / KẾT LUẬN:</h4><p>${impression}</p>`;
    }
    if (recommendation) {
        findings += `<hr class="report-hr"><h4>RECOMMENDATION / ĐỀ NGHỊ:</h4><p>${recommendation}</p>`;
    }

    console.log("[EchoModule] Finished formatting Echo report section HTML.");
    // Wrap everything in a container div for potential styling
    return `<div class="echo-findings-container">${findings || '<p>No significant findings entered.</p>'}</div>`;
}


console.log("echo-module.js loaded.");