// js/organs/abdominal/abdominal-module.js
// Module specific to Abdominal ultrasound reporting logic.

// --- Core Imports ---
import { showNotification } from '../../core/ui-core.js';
import { populateForm, getFormData } from '../../core/form-core.js';

// --- Module-level variables ---
const hideSuggestionTimeoutsAbdominal = {}; // Timeout tracker for abdominal textareas

// --- Initialization ---
/**
 * Initializes the abdominal module functionalities.
 * Sets up event listeners specific to the abdominal assessment form.
 */
export function init() {
    console.log("[AbdominalModule] Initializing...");
    try {
        const abdominalForm = document.getElementById('abdominal-assessment-form');

        if (!abdominalForm) {
            console.error("[AbdominalModule] CRITICAL: Abdominal assessment form ('#abdominal-assessment-form') not found. Module cannot function.");
            showNotification("Error: Abdominal assessment UI not found.", "error");
            return; // Stop initialization if form is missing
        }

        // Event Delegation for suggestion buttons
        abdominalForm.addEventListener('click', function(event) {
            const target = event.target;
            // Handle Suggestion Button click
            if (target.classList.contains('suggestion-btn')) {
                handleSuggestionButtonClickAbdominal(target); // Use abdominal-specific handler
                const container = target.closest('.suggestion-button-container');
                if (container) container.style.display = 'none'; // Hide after click
            }
        });

        // Setup suggestion visibility for textareas/inputs present on initial load
        // Run this *after* potential template loading might occur, or ensure it's robust
        // Using setTimeout to slightly delay setup, allowing form population to potentially finish
        setTimeout(() => setupSuggestionVisibilityAbdominal(abdominalForm), 100);


        console.log("[AbdominalModule] Initialized successfully.");
    } catch (error) {
        console.error("[AbdominalModule] Error during initialization:", error);
        showNotification("Failed to initialize abdominal module.", "error");
    }
}

// --- Suggestion Button Handling (Adapted from Carotid) ---
/**
 * Sets up focus/blur listeners for suggestion buttons visibility within a parent element.
 * @param {HTMLElement} parentElement - Element to search within (the form).
 */
function setupSuggestionVisibilityAbdominal(parentElement) {
    const suggestionContainers = parentElement.querySelectorAll('.suggestion-button-container');
    // console.log(`[AbdominalModule] Setting up suggestion visibility for ${suggestionContainers.length} containers.`); // Debug
    suggestionContainers.forEach(container => {
        const inputElement = container.previousElementSibling; // Assumes input/textarea is right before container
        if (inputElement && (inputElement.tagName === 'TEXTAREA' || inputElement.tagName === 'INPUT')) {
            let elementId = inputElement.id || `input_abdominal_${Date.now()}_${Math.random().toString(16).slice(2)}`;
            inputElement.id = elementId; // Ensure it has an ID

            inputElement.removeEventListener('focus', handleTextareaFocusAbdominal);
            inputElement.removeEventListener('blur', handleTextareaBlurAbdominal);
            inputElement.addEventListener('focus', handleTextareaFocusAbdominal);
            inputElement.addEventListener('blur', handleTextareaBlurAbdominal);
             // console.log(`[AbdominalModule] Listener added for ${elementId}`); // Debug
        } else {
             // console.warn("[AbdominalModule] Could not find textarea/input before suggestion container:", container);
        }
    });
}

// Named function for focus listener
function handleTextareaFocusAbdominal(event) {
    const inputElement = event.target;
    const elementId = inputElement.id;
    const container = inputElement.nextElementSibling;
     // console.log(`[AbdominalModule] Focus on ${elementId}`); // Debug
    if (hideSuggestionTimeoutsAbdominal[elementId]) {
        clearTimeout(hideSuggestionTimeoutsAbdominal[elementId]);
        delete hideSuggestionTimeoutsAbdominal[elementId];
    }
    if (container && container.classList.contains('suggestion-button-container')) {
        container.style.display = 'flex';
    }
}

// Named function for blur listener
function handleTextareaBlurAbdominal(event) {
    const inputElement = event.target;
    const elementId = inputElement.id;
    const container = inputElement.nextElementSibling;
     // console.log(`[AbdominalModule] Blur on ${elementId}`); // Debug
    if (container && container.classList.contains('suggestion-button-container')) {
        hideSuggestionTimeoutsAbdominal[elementId] = setTimeout(() => {
            container.style.display = 'none';
            delete hideSuggestionTimeoutsAbdominal[elementId];
        }, 250); // 250ms delay
    }
}

/**
 * Handles suggestion button clicks for abdominal module.
 * @param {HTMLButtonElement} button - The button clicked.
 */
function handleSuggestionButtonClickAbdominal(button) {
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
        console.warn("[AbdominalModule] Target input/textarea or data-insert attribute not found for suggestion button.", button);
    }
}


// --- Data Collection ---
/**
 * Collects all data for the abdominal assessment form.
 * Returns an object containing the data AND a function `formatReportSectionHtml`.
 * @returns {object | null} - Abdominal data object including the formatting function, or null on error.
 */
export function collectAbdominalData() {
    console.log("[AbdominalModule] Collecting abdominal data...");
    const form = document.getElementById('abdominal-assessment-form');
    if (!form) {
        console.error("[collectAbdominalData] Abdominal assessment form ('#abdominal-assessment-form') not found.");
        return null;
    }

    try {
        // Use getFormData scoped to the entire abdominal form
        const allFormData = getFormData(form);

        // Structure the data logically by organ/section
        const structuredData = {
            liver: {
                span: allFormData.liverSpan,
                echotexture: allFormData.liverEchotexture,
                margins: allFormData.liverMargins,
                portalVeinDiameter: allFormData.portalVeinDiameter,
                hepaticVeinsPatent: allFormData.hepaticVeinsPatent,
                hepaticArteryViz: allFormData.hepaticArteryViz,
                lesionsDesc: allFormData.liverLesionsDesc
            },
            gallbladder: {
                status: allFormData.gallbladderStatus,
                wallThickness: allFormData.gallbladderWallThickness,
                stones: allFormData.gallbladderStones,
                stoneSize: allFormData.gallbladderStoneSize,
                stoneShadow: allFormData.gallbladderStoneShadow,
                sludge: allFormData.gallbladderSludge,
                polyps: allFormData.gallbladderPolyps,
                polypSize: allFormData.gallbladderPolypSize,
                pericholecysticFluid: allFormData.pericholecysticFluid,
                sonographicMurphy: allFormData.sonographicMurphy,
                lesionsDesc: allFormData.gallbladderLesionsDesc // <-- ADDED Gallbladder Lesion Desc
            },
            biliaryDucts: {
                cbdDiameter: allFormData.cbdDiameter,
                ihdDilatation: allFormData.ihdDilatation
            },
            pancreas: {
                visualization: allFormData.pancreasVisualization,
                headSize: allFormData.pancreasHeadSize,
                bodySize: allFormData.pancreasBodySize,
                tailSize: allFormData.pancreasTailSize,
                echotexture: allFormData.pancreasEchotexture,
                pancreaticDuctDiameter: allFormData.pancreaticDuctDiameter,
                lesionsDesc: allFormData.pancreasLesionsDesc
            },
            spleen: {
                size: allFormData.spleenSize,
                echotexture: allFormData.spleenEchotexture,
                lesionsDesc: allFormData.spleenLesionsDesc
            },
            rightKidney: {
                length: allFormData.rightKidneyLength,
                parenchymaThickness: allFormData.rightKidneyParenchymaThickness,
                parenchymaEchogenicity: allFormData.rightKidneyParenchymaEchogenicity,
                cmd: allFormData.rightKidneyCMD,
                stones: allFormData.rightKidneyStones,
                stoneSize: allFormData.rightKidneyStoneSize,
                stoneLocation: allFormData.rightKidneyStoneLocation,
                hydro: allFormData.rightKidneyHydro,
                lesionsDesc: allFormData.rightKidneyLesionsDesc
            },
            leftKidney: {
                length: allFormData.leftKidneyLength,
                parenchymaThickness: allFormData.leftKidneyParenchymaThickness,
                parenchymaEchogenicity: allFormData.leftKidneyParenchymaEchogenicity,
                cmd: allFormData.leftKidneyCMD,
                stones: allFormData.leftKidneyStones,
                stoneSize: allFormData.leftKidneyStoneSize,
                stoneLocation: allFormData.leftKidneyStoneLocation,
                hydro: allFormData.leftKidneyHydro,
                lesionsDesc: allFormData.leftKidneyLesionsDesc
            },
            bladder: {
                volume: allFormData.bladderVolume,
                wallThickness: allFormData.bladderWallThickness,
                lumen: allFormData.bladderLumen,
                lesionsDesc: allFormData.bladderLesionsDesc
            },
            uterus: {
                present: allFormData.uterusPresent,
                position: allFormData.uterusPosition,
                length: allFormData.uterusLength,
                width: allFormData.uterusWidth,
                ap: allFormData.uterusAP,
                endometrialThickness: allFormData.endometrialThickness,
                myometriumEchotexture: allFormData.myometriumEchotexture,
                cervixAppearance: allFormData.cervixAppearance,
                lesionsDesc: allFormData.uterusLesionsDesc
            },
            adnexa: {
                rightOvaryDesc: allFormData.rightOvaryDesc,
                leftOvaryDesc: allFormData.leftOvaryDesc,
                pelvicFreeFluid: allFormData.pelvicFreeFluid
            },
            ascites: {
                 amount: allFormData.ascitesAmount,
                 location: allFormData.ascitesLocation
            },
            otherFindings: allFormData.otherFindings,
            // General Impression/Recommendation
            impression: allFormData.impression,
            recommendation: allFormData.recommendation,

            // IMPORTANT: Attach the specific formatter function for the abdominal report section
            formatReportSectionHtml: function() { return formatAbdominalReportSectionHtml(this); }
        };

        console.debug("[collectAbdominalData] Collected Abdominal Data:", JSON.parse(JSON.stringify(structuredData))); // Log a copy
        return structuredData;

    } catch (error) {
        console.error("[collectAbdominalData] Error collecting abdominal data:", error);
        showNotification("Failed to collect abdominal assessment data.", "error");
        return null;
    }
}

// --- Template Loading ---
/**
 * Loads template data into the abdominal assessment section.
 * @param {object} abdominalTemplateData - Abdominal-specific template data (content of the 'abdominal' key).
 */
export async function loadAbdominalTemplateData(abdominalTemplateData) {
    if (!abdominalTemplateData || typeof abdominalTemplateData !== 'object') {
        console.warn("[loadAbdominalTemplateData] Invalid or missing abdominal template data provided.");
        return;
    }
    console.log("[AbdominalModule] Loading abdominal template data...");
    const form = document.getElementById('abdominal-assessment-form');

    if (!form) {
        console.error("[loadAbdominalTemplateData] Abdominal form not found! Cannot load template.");
        showNotification("Cannot load abdominal template: UI elements missing.", "error");
        return;
    }

    try {
        // Flatten the structured data
        const flattenedData = {};
        for (const organ in abdominalTemplateData) {
            if (abdominalTemplateData.hasOwnProperty(organ) && typeof abdominalTemplateData[organ] === 'object' && abdominalTemplateData[organ] !== null) {
                 for (const key in abdominalTemplateData[organ]) {
                    if (abdominalTemplateData[organ].hasOwnProperty(key)) {
                         // Basic flattening: organKey -> organKey (e.g., liverSpan, gallbladderWallThickness)
                         const fieldName = organ + key.charAt(0).toUpperCase() + key.slice(1);
                         flattenedData[fieldName] = abdominalTemplateData[organ][key];
                     }
                 }
             } else if (abdominalTemplateData.hasOwnProperty(organ)) {
                 // Top-level keys (impression, recommendation, otherFindings)
                 flattenedData[organ] = abdominalTemplateData[organ];
             }
        }

        // Manual corrections if naming convention differs (example for kidney CMD)
         flattenedData.rightKidneyCMD = abdominalTemplateData.rightKidney?.cmd;
         flattenedData.leftKidneyCMD = abdominalTemplateData.leftKidney?.cmd;
         flattenedData.cbdDiameter = abdominalTemplateData.biliaryDucts?.cbdDiameter;
         flattenedData.ihdDilatation = abdominalTemplateData.biliaryDucts?.ihdDilatation;
         flattenedData.ascitesAmount = abdominalTemplateData.ascites?.amount;
         flattenedData.ascitesLocation = abdominalTemplateData.ascites?.location;
         flattenedData.uterusAP = abdominalTemplateData.uterus?.ap;

        // Note: gallbladderLesionsDesc should be handled correctly by the automatic flattening.

         console.log("[loadAbdominalTemplateData] Flattened data for population:", flattenedData);

        // Populate the form fields
        // Dispatch events = true to ensure dynamic elements (like suggestion buttons visibility) update
        populateForm(form, flattenedData, { dispatchEvents: true });
        console.log("[loadAbdominalTemplateData] Abdominal form fields populated.");

        // Re-setup suggestion visibility *after* population might be needed if fields were initially empty
        setTimeout(() => setupSuggestionVisibilityAbdominal(form), 150);


        console.log("[loadAbdominalTemplateData] Finished applying abdominal template data.");

    } catch (error) {
        console.error("[loadAbdominalTemplateData] Error applying abdominal template:", error);
        showNotification("Failed to apply abdominal template data.", "error");
    }
}


// --- Report Formatting ---

// Helper function to safely get values and format text/numbers
const getValue = (val, unit = '', fallback = 'N/A') => {
    if (val === null || val === undefined || String(val).trim() === '') return fallback; // Treat empty strings as N/A too
    const strVal = String(val).replace(/\n/g, '<br>&nbsp;&nbsp;'); // Handle line breaks in textareas
    return strVal + (unit && strVal !== fallback ? unit : '');
};

// Helper to format a section for a specific organ (UPDATED to handle lesionsDesc generically)
function formatOrganHtml(organName, data, fields) {
    if (!data) return ''; // No data for this organ

    let content = '';
    let hasData = false;

    // Check for specific status fields first (like GB removed, Uterus absent)
    let statusMessage = '';
     if (data.status === 'Surgically Removed / Đã cắt' || data.present === 'Absent (Post-hysterectomy) / Không (Sau cắt TC)') {
         statusMessage = `<li>${getValue(data.status || data.present)}</li>`;
         hasData = true; // Mark as having data even if just status
     } else if (data.visualization === 'Not visualized / Không thấy') {
          statusMessage = `<li>${getValue(data.visualization)}</li>`;
          hasData = true; // Mark as having data even if just status
     }


    // Add regular fields if status doesn't preclude them
     if(statusMessage === '') {
        fields.forEach(field => {
            const value = getValue(data[field.key], field.unit || '');
            if (value !== 'N/A' && value !== '') { // Check for non-empty/non-default values
                content += `<li><strong>${field.label}:</strong> ${value}</li>`;
                hasData = true;
            }
        });
     }


    // Special handling for lesion descriptions (generic key 'lesionsDesc')
    if (data.lesionsDesc && data.lesionsDesc.trim()) {
         content += `<li><strong>Focal Findings / Tổn thương khu trú:</strong> ${getValue(data.lesionsDesc)}</li>`;
         hasData = true;
    }

     // Special handling for Adnexa/Ovary descriptions
     if (organName.includes('Adnexa')) {
         const rightOvaryText = getValue(data.rightOvaryDesc);
         const leftOvaryText = getValue(data.leftOvaryDesc);
         if (rightOvaryText !== 'N/A') {
             content += `<li><strong>Right Ovary / Buồng trứng phải:</strong> ${rightOvaryText}</li>`;
             hasData = true;
         }
          if (leftOvaryText !== 'N/A') {
             content += `<li><strong>Left Ovary / Buồng trứng trái:</strong> ${leftOvaryText}</li>`;
             hasData = true;
         }
         const freeFluid = getValue(data.pelvicFreeFluid);
         if (freeFluid !== 'N/A' && freeFluid !== 'None / Không') {
            content += `<li><strong>Free Fluid / Dịch tự do:</strong> ${freeFluid}</li>`;
            hasData = true;
         }
     }


    // Only return section if there is actual data to display
    if (hasData) {
        return `<h4>${organName}:</h4><ul>${statusMessage}${content}</ul>`;
    } else {
        return ''; // Return empty if no relevant data was entered
    }
}


/**
 * Formats the FINDINGS section for an Abdominal report as an HTML string.
 * Uses the data object collected by collectAbdominalData.
 * @param {object} data - Collected abdominal data object.
 * @returns {string} - Formatted findings HTML block string.
 */
function formatAbdominalReportSectionHtml(data) {
    console.log("[AbdominalModule] Formatting Abdominal report section HTML...");
    if (!data) return "<p>Error: No abdominal data provided for formatting.</p>";

    let findings = '';

    // Liver
    findings += formatOrganHtml('Liver / Gan', data.liver, [
        { key: 'span', label: 'Size (Span)', unit: ' cm' },
        { key: 'echotexture', label: 'Echotexture' },
        { key: 'margins', label: 'Margins' },
        { key: 'portalVeinDiameter', label: 'Portal Vein Diameter', unit: ' mm' },
        { key: 'hepaticVeinsPatent', label: 'Hepatic Veins' },
        { key: 'hepaticArteryViz', label: 'Hepatic Artery' }
        // lesionsDesc handled within formatOrganHtml
    ]);

    // Gallbladder (lesionsDesc will be handled by formatOrganHtml)
    findings += formatOrganHtml('Gallbladder / Túi mật', data.gallbladder, [
        { key: 'status', label: 'Status' },
        { key: 'wallThickness', label: 'Wall Thickness', unit: ' mm' },
        { key: 'stones', label: 'Stones' },
        { key: 'stoneSize', label: 'Stone Size (Max)', unit: ' mm' },
        { key: 'stoneShadow', label: 'Stone Shadowing' },
        { key: 'sludge', label: 'Sludge' },
        { key: 'polyps', label: 'Polyps' },
        { key: 'polypSize', label: 'Polyp Size (Max)', unit: ' mm' },
        { key: 'pericholecysticFluid', label: 'Pericholecystic Fluid' },
        { key: 'sonographicMurphy', label: "Sonographic Murphy's Sign" }
        // lesionsDesc handled within formatOrganHtml now
    ]);

     // Biliary Ducts
    findings += formatOrganHtml('Biliary Ducts / Đường mật', data.biliaryDucts, [
        { key: 'cbdDiameter', label: 'CBD Diameter', unit: ' mm' },
        { key: 'ihdDilatation', label: 'Intrahepatic Duct Dilatation' }
    ]);

     // Pancreas
    findings += formatOrganHtml('Pancreas / Tụy', data.pancreas, [
        { key: 'visualization', label: 'Visualization' },
        { key: 'headSize', label: 'Head Size', unit: ' mm' },
        { key: 'bodySize', label: 'Body Size', unit: ' mm' },
        { key: 'tailSize', label: 'Tail Size', unit: ' mm' },
        { key: 'echotexture', label: 'Echotexture' },
        { key: 'pancreaticDuctDiameter', label: 'Pancreatic Duct Diameter', unit: ' mm' }
         // lesionsDesc handled within formatOrganHtml
    ]);

     // Spleen
    findings += formatOrganHtml('Spleen / Lách', data.spleen, [
        { key: 'size', label: 'Size (Longest Dimension)', unit: ' cm' },
        { key: 'echotexture', label: 'Echotexture' }
         // lesionsDesc handled within formatOrganHtml
    ]);

     // Kidneys (Right)
    findings += formatOrganHtml('Right Kidney / Thận Phải', data.rightKidney, [
        { key: 'length', label: 'Size (Length)', unit: ' cm' },
        { key: 'parenchymaThickness', label: 'Parenchymal Thickness', unit: ' mm' },
        { key: 'parenchymaEchogenicity', label: 'Parenchymal Echogenicity' },
        { key: 'cmd', label: 'Corticomedullary Differentiation' },
        { key: 'stones', label: 'Stones' },
        { key: 'stoneSize', label: 'Stone Size (Max)', unit: ' mm' },
        { key: 'stoneLocation', label: 'Stone Location' },
        { key: 'hydro', label: 'Hydronephrosis' }
         // lesionsDesc handled within formatOrganHtml
    ]);

    // Kidneys (Left)
    findings += formatOrganHtml('Left Kidney / Thận Trái', data.leftKidney, [
         { key: 'length', label: 'Size (Length)', unit: ' cm' },
         { key: 'parenchymaThickness', label: 'Parenchymal Thickness', unit: ' mm' },
         { key: 'parenchymaEchogenicity', label: 'Parenchymal Echogenicity' },
         { key: 'cmd', label: 'Corticomedullary Differentiation' },
         { key: 'stones', label: 'Stones' },
         { key: 'stoneSize', label: 'Stone Size (Max)', unit: ' mm' },
         { key: 'stoneLocation', label: 'Stone Location' },
         { key: 'hydro', label: 'Hydronephrosis' }
         // lesionsDesc handled within formatOrganHtml
    ]);

    // Bladder
     findings += formatOrganHtml('Bladder / Bàng quang', data.bladder, [
         { key: 'volume', label: 'Volume (Pre/Post-void)' },
         { key: 'wallThickness', label: 'Wall Thickness', unit: ' mm' },
         { key: 'lumen', label: 'Lumen' }
          // lesionsDesc handled within formatOrganHtml
     ]);

    // Uterus
     findings += formatOrganHtml('Uterus / Tử cung', data.uterus, [
         { key: 'present', label: 'Status' },
         { key: 'position', label: 'Position' },
         { key: 'length', label: 'Length', unit: ' mm' },
         { key: 'width', label: 'Width', unit: ' mm' },
         { key: 'ap', label: 'AP Diameter', unit: ' mm' },
         { key: 'endometrialThickness', label: 'Endometrial Thickness', unit: ' mm' },
         { key: 'myometriumEchotexture', label: 'Myometrium Echotexture' },
         { key: 'cervixAppearance', label: 'Cervix Appearance' }
          // lesionsDesc handled within formatOrganHtml
     ]);

     // Adnexa
     findings += formatOrganHtml('Adnexa / Phần phụ', data.adnexa, [
          // Fields like right/left Ovary Desc and Free Fluid are now handled inside formatOrganHtml
     ]);

    // Ascites
    findings += formatOrganHtml('Ascites / Dịch ổ bụng', data.ascites, [
        { key: 'amount', label: 'Amount' },
        { key: 'location', label: 'Location' }
    ]);

    // Other Findings
    const otherFindingsText = getValue(data.otherFindings);
    if (otherFindingsText !== 'N/A') {
        findings += `<h4>Other Findings / Khảo sát khác:</h4><p>${otherFindingsText}</p>`;
    }


    // --- Impression and Recommendation ---
    findings += `<hr class="report-hr"><h4>IMPRESSION / KẾT LUẬN:</h4>`;
    // Ensure impression is wrapped in <p> even if simple text
    findings += `<p>${getValue(data.impression, '', 'Not specified.')}</p>`;

    const recommendation = getValue(data.recommendation);
    if (recommendation !== 'N/A' && recommendation.trim() !== '') { // Check if recommendation exists and is not empty
        findings += `<hr class="report-hr"><h4>RECOMMENDATION / ĐỀ NGHỊ:</h4><p>${recommendation}</p>`;
    }

    console.log("[AbdominalModule] Finished formatting Abdominal report section HTML.");
    // Wrap everything in a container div for potential styling
    return `<div class="abdominal-findings-container">${findings || '<p>No significant findings entered.</p>'}</div>`;
}


console.log("abdominal-module.js loaded.");