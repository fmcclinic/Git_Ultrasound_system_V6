// js/organs/echo/echo-module.js
// Module specific to Echocardiogram reporting logic.

// --- Core Imports ---
import { showNotification } from '../../core/ui-core.js';
import { populateForm, getFormData } from '../../core/form-core.js';

// --- Module-level variables ---
const hideSuggestionTimeoutsEcho = {}; // Timeout tracker for echo textareas
const PI = Math.PI;

// --- Initialization ---
/**
 * Initializes the echo module functionalities.
 * Sets up event listeners and calculation logic for the echo assessment form.
 */
export function init() {
    console.log("[EchoModule] Initializing...");
    try {
        const echoForm = document.getElementById('echo-assessment-form');

        if (!echoForm) {
            console.error("[EchoModule] CRITICAL: Echo assessment form ('#echo-assessment-form') not found. Module cannot function.");
            showNotification("Error: Echocardiogram assessment UI not found.", "error");
            return; // Stop initialization if form is missing
        }

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
        'avVTI',
        // MVA
        'mvPHT',
        // RVSP
        'peakTRVel', 'ivcDiam', 'ivcCollapse'
    ];

    fieldsToListen.forEach(fieldName => {
        const input = form.querySelector(`[name="${fieldName}"]`);
        if (input) {
            input.addEventListener('input', () => runAllCalculations(form));
             input.addEventListener('change', () => runAllCalculations(form)); // Also trigger on change
        } else {
            console.warn(`[EchoModule Calc] Input field not found for calculation listener: ${fieldName}`);
        }
    });
    console.log("[EchoModule] Calculation listeners set up.");
     // Initial calculation run in case form is pre-populated (e.g., by template)
     setTimeout(() => runAllCalculations(form), 200);
}

/**
 * Runs all calculation functions and updates the respective fields.
 * @param {HTMLElement} form - The echo assessment form element.
 */
function runAllCalculations(form) {
    // console.log("[EchoModule Calc] Running all calculations..."); // Can be noisy

    // Get current form data (only needed once per run)
    const data = getFormData(form); // Scoped to the echo form

    // Perform calculations in logical order (dependencies first)
    calculateBSA(form, data); // BSA needed for LVMi, CI
    calculateLVMassIndexRWT(form, data); // Mass needed for Index
    calculateEF(form, data);
    calculateEARatio(form, data);
    calculateTDI(form, data); // Avg e' needed for E/e'
    calculateStrokeVolumeCOCI(form, data); // SV needed for CO/CI
    calculateAVContinuityDI(form, data);
    calculateMVA(form, data);
    calculateRVSP(form, data);
}

// --- Calculation Functions ---

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
    const bsa = parseFloat(data.bsa); // Use already calculated BSA
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
        if (lvMass > 0 && bsa > 0) {
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
        // Teichholz method
        const ef = ((Math.pow(lvidD, 3) - Math.pow(lvidS, 3)) / Math.pow(lvidD, 3)) * 100;
        efOutput.value = ef.toFixed(0);
    } else {
        efOutput.value = '';
    }
}

function calculateEARatio(form, data) {
    const peakE = parseFloat(data.mvPeakE);
    const peakA = parseFloat(data.mvPeakA);
    const ratioOutput = form.querySelector('[name="eaRatio"]');
    if (!ratioOutput) return;

    if (peakE > 0 && peakA > 0) {
        const ratio = peakE / peakA;
        ratioOutput.value = ratio.toFixed(2);
    } else {
        ratioOutput.value = '';
    }
}

function calculateTDI(form, data) {
    const septalE = parseFloat(data.tdiSeptalE);
    const lateralE = parseFloat(data.tdiLateralE);
    const peakE = parseFloat(data.mvPeakE); // From Mitral Inflow
    const avgEOutput = form.querySelector('[name="tdiAvgE"]');
    const e_ePrimeOutput = form.querySelector('[name="e_ePrimeAvg"]');

    let avgE = null;

    // Calculate Average e'
    if (septalE > 0 && lateralE > 0) {
        avgE = (septalE + lateralE) / 2;
        if (avgEOutput) avgEOutput.value = avgE.toFixed(1);
    } else {
        if (avgEOutput) avgEOutput.value = '';
    }

    // Calculate E/e' ratio
    if (peakE > 0 && avgE > 0) {
        const avgEmps = avgE / 100; // Convert cm/s to m/s
        const e_ePrimeRatio = peakE / avgEmps;
        if (e_ePrimeOutput) e_ePrimeOutput.value = e_ePrimeRatio.toFixed(1);
    } else {
        if (e_ePrimeOutput) e_ePrimeOutput.value = '';
    }
}

function calculateStrokeVolumeCOCI(form, data) {
    const lvotDiam = parseFloat(data.lvotDiam);
    const lvotVTI = parseFloat(data.lvotVTI);
    const hr = parseFloat(data.heartRate);
    const bsa = parseFloat(data.bsa);
    const svOutput = form.querySelector('[name="sv"]');
    const coOutput = form.querySelector('[name="co"]');
    const ciOutput = form.querySelector('[name="ci"]');

    let sv = null;
    let co = null;

    // Calculate Stroke Volume (SV)
    if (lvotDiam > 0 && lvotVTI > 0) {
        const lvotRadius = lvotDiam / 2;
        const lvotArea = PI * Math.pow(lvotRadius, 2);
        sv = lvotArea * lvotVTI; // cm^2 * cm = cm^3 = mL
        if (svOutput) svOutput.value = sv.toFixed(1);
    } else {
        if (svOutput) svOutput.value = '';
    }

    // Calculate Cardiac Output (CO)
    if (sv > 0 && hr > 0) {
        co = (sv * hr) / 1000; // (mL * bpm) / 1000 = L/min
        if (coOutput) coOutput.value = co.toFixed(1);
    } else {
        if (coOutput) coOutput.value = '';
    }

    // Calculate Cardiac Index (CI)
    if (co > 0 && bsa > 0) {
        const ci = co / bsa; // L/min / m^2
        if (ciOutput) ciOutput.value = ci.toFixed(1);
    } else {
        if (ciOutput) ciOutput.value = '';
    }
}

function calculateAVContinuityDI(form, data) {
    const lvotDiam = parseFloat(data.lvotDiam);
    const lvotVTI = parseFloat(data.lvotVTI);
    const avVTI = parseFloat(data.avVTI);
    const avaOutput = form.querySelector('[name="avaContinuity"]');
    const diOutput = form.querySelector('[name="avDI"]');

    // Calculate AVA by Continuity
    if (lvotDiam > 0 && lvotVTI > 0 && avVTI > 0) {
        const lvotRadius = lvotDiam / 2;
        const lvotArea = PI * Math.pow(lvotRadius, 2);
        const ava = (lvotArea * lvotVTI) / avVTI; // (cm^2 * cm) / cm = cm^2
        if (avaOutput) avaOutput.value = ava.toFixed(2);
    } else {
        if (avaOutput) avaOutput.value = '';
    }

    // Calculate Doppler Index (DI)
    if (lvotVTI > 0 && avVTI > 0) {
        const di = lvotVTI / avVTI;
        if (diOutput) diOutput.value = di.toFixed(2);
    } else {
        if (diOutput) diOutput.value = '';
    }
}

function calculateMVA(form, data) {
    const pht = parseFloat(data.mvPHT);
    const mvaOutput = form.querySelector('[name="mvaPHT"]');
    if (!mvaOutput) return;

    if (pht > 0) {
        const mva = 220 / pht; // cm^2
        mvaOutput.value = mva.toFixed(2);
    } else {
        mvaOutput.value = '';
    }
}

function estimateRAP(ivcDiam, ivcCollapse) {
    // Simplified RAP estimation based on IVC diameter (mm) and collapse (%)
    const diam = parseFloat(ivcDiam);
    const collapse = parseFloat(ivcCollapse);

    if (isNaN(diam) || isNaN(collapse)) return 8; // Default RAP if data is missing

    if (diam <= 21 && collapse > 50) return 3;  // Normal
    if (diam <= 21 && collapse <= 50) return 8;  // Intermediate
    if (diam > 21 && collapse > 50) return 8;   // Intermediate
    if (diam > 21 && collapse <= 50) return 15; // High
    return 8; // Default if conditions don't match somehow
}

function calculateRVSP(form, data) {
    const trVel = parseFloat(data.peakTRVel);
    const ivcDiam = data.ivcDiam; // Keep as string/number for RAP function
    const ivcCollapse = data.ivcCollapse;
    const rvspOutput = form.querySelector('[name="estRVSP"]');
    if (!rvspOutput) return;

    if (trVel > 0) {
        const rap = estimateRAP(ivcDiam, ivcCollapse);
        // Simplified Bernoulli: 4 * V^2
        const rvsp = 4 * Math.pow(trVel, 2) + rap;
        rvspOutput.value = rvsp.toFixed(0);
    } else {
        rvspOutput.value = '';
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
        const allFormData = getFormData(form);

        // Structure the data logically by section
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
            },
            leftVentricle: {
                lvSize: allFormData.lvSize,
                lvWallThickness: allFormData.lvWallThickness,
                lvSystolicFuncQual: allFormData.lvSystolicFuncQual,
                // EF is reported under 2D measurements where calculated
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
            // General Impression/Recommendation
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
                        // Handle nested Doppler structure
                        if (typeof sectionData[key] === 'object' && sectionData[key] !== null) {
                            const nestedData = sectionData[key];
                            for (const nestedKey in nestedData) {
                                if (nestedData.hasOwnProperty(nestedKey)) {
                                    // Use nestedKey directly as form field names match
                                    flattenedData[nestedKey] = nestedData[nestedKey];
                                }
                            }
                        } else {
                             // Basic flattening: key -> key (e.g., lvSize, gls)
                             flattenedData[key] = sectionData[key];
                        }
                    }
                }
            } else if (echoTemplateData.hasOwnProperty(sectionKey)) {
                // Top-level keys (impression, recommendation)
                flattenedData[sectionKey] = echoTemplateData[sectionKey];
            }
        }

         console.log("[loadEchoTemplateData] Flattened data for population:", flattenedData);

        // Populate the form fields
        // Dispatch events = true to ensure dynamic elements update
        populateForm(form, flattenedData, { dispatchEvents: true });
        console.log("[loadEchoTemplateData] Echo form fields populated.");

        // Re-run calculations after loading data
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
    return String(val).replace(/\n/g, '<br>&nbsp;&nbsp;'); // Handle line breaks
};

/** Helper to add a list item to HTML string only if value exists */
const addListItem = (label, value, unit = '') => {
    const formattedValue = getReportValue(value);
    if (formattedValue !== null) {
        return `<li><strong>${label}:</strong> ${formattedValue}${unit}</li>`;
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

/** Helper to format valve sections (Morphology + Grades) */
function formatValveSection(title, valveData) {
    if (!valveData) return '';
    let content = '';
    let hasData = false;

    const morphology = getReportValue(valveData.avMorphology || valveData.mvMorphology || valveData.tvMorphology || valveData.pvMorphology);
    if (morphology) {
        content += `<p><strong>Morphology / Hình thái:</strong> ${morphology}</p>`;
        hasData = true;
    }

    let stenosisGrade = '';
    if (valveData.asGrade) stenosisGrade = addListItem('Stenosis Grade / Độ hẹp', valveData.asGrade);
    else if (valveData.msGrade) stenosisGrade = addListItem('Stenosis Grade / Độ hẹp', valveData.msGrade);
    else if (valveData.tsGrade) stenosisGrade = addListItem('Stenosis Grade / Độ hẹp', valveData.tsGrade);
    else if (valveData.psGrade) stenosisGrade = addListItem('Stenosis Grade / Độ hẹp', valveData.psGrade);

    let regurgGrade = '';
    if (valveData.arGrade) regurgGrade = addListItem('Regurgitation Grade / Độ hở', valveData.arGrade);
    else if (valveData.mrGrade) regurgGrade = addListItem('Regurgitation Grade / Độ hở', valveData.mrGrade);
    else if (valveData.trGrade) regurgGrade = addListItem('Regurgitation Grade / Độ hở', valveData.trGrade);
    else if (valveData.prGrade) regurgGrade = addListItem('Regurgitation Grade / Độ hở', valveData.prGrade);

    let regurgDesc = '';
    if (valveData.arDescription) regurgDesc = addParagraph('Regurgitation Description / Mô tả hở', valveData.arDescription);
    else if (valveData.mrDescription) regurgDesc = addParagraph('Regurgitation Description / Mô tả hở', valveData.mrDescription);

    if (stenosisGrade || regurgGrade || regurgDesc) {
        content += `<ul>${stenosisGrade}${regurgGrade}</ul>${regurgDesc}`;
        hasData = true;
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
        { key: 'lvidD', label: 'LVIDd', unit: ' mm' }, { key: 'lvidS', label: 'LVIDs', unit: ' mm' },
        { key: 'ivsD', label: 'IVSd', unit: ' mm' }, { key: 'lvpwD', label: 'LVPWd', unit: ' mm' },
        { key: 'lvMass', label: 'LV Mass', unit: ' g' }, { key: 'lvMassIndex', label: 'LV Mass Index', unit: ' g/m²' },
        { key: 'rwt', label: 'RWT' }, { key: 'laDiamPS', label: 'LA Diam (Parasternal)', unit: ' mm' },
        { key: 'laVolIndex', label: 'LAVi', unit: ' ml/m²' }, { key: 'aoRootDiam', label: 'Ao Root Diam', unit: ' mm' },
        { key: 'aoAnnulusDiam', label: 'Ao Annulus Diam', unit: ' mm' }, { key: 'ascAoDiam', label: 'Asc Ao Diam', unit: ' mm' },
        { key: 'raArea', label: 'RA Area', unit: ' cm²' }, { key: 'rvDiam', label: 'RV Basal Diam', unit: ' mm' },
        { key: 'rvFac', label: 'RV FAC', unit: '%' }, { key: 'tapse', label: 'TAPSE', unit: ' mm' },
        { key: 'ivcDiam', label: 'IVC Diam', unit: ' mm' }, { key: 'ivcCollapse', label: 'IVC Collapse', unit: '%' },
        { key: 'paDiam', label: 'PA Diam', unit: ' mm' }, { key: 'ef', label: 'EF (Teich)', unit: '%' },
    ];
    meas2DFields.forEach(f => measurementsContent += addListItem(f.label, data.measurements2D?.[f.key], f.unit));

    // M-Mode
    const measMModeFields = [ { key: 'epss', label: 'EPSS', unit: ' mm' } ];
    measMModeFields.forEach(f => measurementsContent += addListItem(f.label, data.measurementsMMode?.[f.key], f.unit));

    // Doppler - Mitral Inflow
    const dopplerMIFields = [
        { key: 'mvPeakE', label: 'Mitral Peak E', unit: ' m/s' }, { key: 'mvPeakA', label: 'Mitral Peak A', unit: ' m/s' },
        { key: 'eaRatio', label: 'E/A Ratio' }, { key: 'decelTime', label: 'DT', unit: ' ms' }, { key: 'ivrt', label: 'IVRT', unit: ' ms' },
    ];
    dopplerMIFields.forEach(f => measurementsContent += addListItem(f.label, data.measurementsDoppler?.mitralInflow?.[f.key], f.unit));

    // Doppler - TDI
    const dopplerTDIFields = [
        { key: 'tdiSeptalE', label: "Septal e'", unit: ' cm/s' }, { key: 'tdiLateralE', label: "Lateral e'", unit: ' cm/s' },
        { key: 'tdiAvgE', label: "Average e'", unit: ' cm/s' }, { key: 'e_ePrimeAvg', label: "E/e' (avg)" },
        { key: 'tdiSeptalS', label: "Septal S'", unit: ' cm/s' }, { key: 'tdiLateralS', label: "Lateral S'", unit: ' cm/s' },
        { key: 'tdiRvS', label: "RV S'", unit: ' cm/s' },
    ];
    dopplerTDIFields.forEach(f => measurementsContent += addListItem(f.label, data.measurementsDoppler?.tdi?.[f.key], f.unit));

    // Doppler - Pulm Vein
    const dopplerPVFields = [
        { key: 'pvS', label: 'PV S wave', unit: ' m/s' }, { key: 'pvD', label: 'PV D wave', unit: ' m/s' },
        { key: 'pvArMinusMvA', label: 'Ar-A diff', unit: ' ms' },
    ];
     dopplerPVFields.forEach(f => measurementsContent += addListItem(f.label, data.measurementsDoppler?.pulmonaryVein?.[f.key], f.unit));

    // Doppler - LVOT/SV/CO
    const dopplerLVOTFields = [
        { key: 'lvotDiam', label: 'LVOT Diam', unit: ' cm' }, { key: 'lvotVTI', label: 'LVOT VTI', unit: ' cm' },
        { key: 'sv', label: 'SV', unit: ' ml' }, { key: 'co', label: 'CO', unit: ' L/min' }, { key: 'ci', label: 'CI', unit: ' L/min/m²' },
    ];
    dopplerLVOTFields.forEach(f => measurementsContent += addListItem(f.label, data.measurementsDoppler?.lvotCalculations?.[f.key], f.unit));

    // Doppler - AV
    const dopplerAVFields = [
        { key: 'avPeakVel', label: 'AV Peak Vel', unit: ' m/s' }, { key: 'avPeakGrad', label: 'AV Peak Grad', unit: ' mmHg' },
        { key: 'avMeanGrad', label: 'AV Mean Grad', unit: ' mmHg' }, { key: 'avVTI', label: 'AV VTI', unit: ' cm' },
        { key: 'avaContinuity', label: 'AVA (Continuity)', unit: ' cm²' }, { key: 'avDI', label: 'AV DI' },
    ];
    dopplerAVFields.forEach(f => measurementsContent += addListItem(f.label, data.measurementsDoppler?.aorticValve?.[f.key], f.unit));

    // Doppler - MV
    const dopplerMVFields = [
        { key: 'mvPeakVel', label: 'MV Peak Vel', unit: ' m/s' }, { key: 'mvPeakGrad', label: 'MV Peak Grad', unit: ' mmHg' },
        { key: 'mvMeanGrad', label: 'MV Mean Grad', unit: ' mmHg' }, { key: 'mvPHT', label: 'MV PHT', unit: ' ms' },
        { key: 'mvaPHT', label: 'MVA (PHT)', unit: ' cm²' },
    ];
    dopplerMVFields.forEach(f => measurementsContent += addListItem(f.label, data.measurementsDoppler?.mitralValve?.[f.key], f.unit));

    // Doppler - TV
    const dopplerTVFields = [ { key: 'peakTRVel', label: 'Peak TR Vel', unit: ' m/s' }, { key: 'estRVSP', label: 'Est. PASP', unit: ' mmHg' } ];
    dopplerTVFields.forEach(f => measurementsContent += addListItem(f.label, data.measurementsDoppler?.tricuspidValve?.[f.key], f.unit));

    // Doppler - PV
    const dopplerPVFlowFields = [
        { key: 'pvPeakVel', label: 'PV Peak Vel', unit: ' m/s' }, { key: 'pvPeakGrad', label: 'PV Peak Grad', unit: ' mmHg' },
        { key: 'padpFromPR', label: 'PADP (from PR)', unit: ' mmHg' },
    ];
    dopplerPVFlowFields.forEach(f => measurementsContent += addListItem(f.label, data.measurementsDoppler?.pulmonicValve?.[f.key], f.unit));

    // Doppler - MR Quant
    const dopplerMRQuantFields = [
        { key: 'mrPisaRadius', label: 'MR PISA Radius', unit: ' cm' }, { key: 'mrEROA', label: 'MR EROA', unit: ' cm²' },
        { key: 'mrRegVol', label: 'MR Reg Vol', unit: ' ml' }, { key: 'mrVenaContracta', label: 'MR Vena Contracta', unit: ' cm' },
    ];
    dopplerMRQuantFields.forEach(f => measurementsContent += addListItem(f.label, data.measurementsDoppler?.mrQuant?.[f.key], f.unit));

    // Doppler - AR Quant
    const dopplerARQuantFields = [ { key: 'arPHT', label: 'AR PHT', unit: ' ms' }, { key: 'arVenaContracta', label: 'AR Vena Contracta', unit: ' cm' } ];
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
        // Note: RWMA is handled separately as free text
    ]);
    // Add RWMA if present
    const rwmaText = getReportValue(data.leftVentricle?.rwma);
    if (rwmaText) findings += `<p><strong>RWMA / RLVĐ Vùng:</strong> ${rwmaText}</p>`;

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
    findings += formatValveSection('Aortic Valve / Van ĐMC', data.aorticValve);
    findings += formatValveSection('Mitral Valve / Van Hai Lá', data.mitralValve);
    findings += formatValveSection('Tricuspid Valve / Van Ba Lá', data.tricuspidValve);
    findings += formatValveSection('Pulmonic Valve / Van ĐM Phổi', data.pulmonicValve);

    // --- Prosthetic Valves ---
    let prostheticContent = '';
    prostheticContent += addListItem('Type/Position / Loại/Vị trí', data.prostheticValves?.prostheticValveTypePos);
    prostheticContent += addParagraph('Assessment / Đánh giá', data.prostheticValves?.prostheticValveAssess); // Use paragraph for free text
    if (getReportValue(data.prostheticValves?.prostheticValveTypePos) || getReportValue(data.prostheticValves?.prostheticValveAssess)) {
        findings += `<h4>Prosthetic Valves / Van nhân tạo</h4>${prostheticContent}`;
    }

    // --- Pericardium ---
    let pericardiumContent = '';
    pericardiumContent += addListItem('Appearance / Hình thái', data.pericardium?.pericardiumAppearance);
    pericardiumContent += addListItem('Effusion / Tràn dịch', data.pericardium?.pericardialEffusion);
    pericardiumContent += addParagraph('Effusion Description / Mô tả dịch', data.pericardium?.effusionDescription); // Use paragraph for free text
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