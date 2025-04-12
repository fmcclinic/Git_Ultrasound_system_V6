// js/modules/volume-calculator.js
// Contains formulas and functions for calculating organ volumes.

import { showNotification } from '../core/ui-core.js';

const VOLUME_COEFFICIENT = 0.523; // Standard coefficient for ellipsoid volume (π/6)

/**
 * Calculates the volume based on three dimensions using the ellipsoid formula.
 * @param {number|string} d1 - Dimension 1 (e.g., Width).
 * @param {number|string} d2 - Dimension 2 (e.g., AP diameter).
 * @param {number|string} d3 - Dimension 3 (e.g., Length).
 * @returns {number|null} - Calculated volume in mL, or null if inputs are invalid.
 */
export function calculateEllipsoidVolume(d1, d2, d3) {
    const numD1 = parseFloat(d1);
    const numD2 = parseFloat(d2);
    const numD3 = parseFloat(d3);

    if (isNaN(numD1) || isNaN(numD2) || isNaN(numD3) || numD1 <= 0 || numD2 <= 0 || numD3 <= 0) {
        // console.warn("Invalid dimensions for volume calculation:", d1, d2, d3);
        return null; // Return null for invalid or incomplete dimensions
    }

    const volume = numD1 * numD2 * numD3 * VOLUME_COEFFICIENT / 1000; // Convert mm^3 to mL (cm^3)
    return parseFloat(volume.toFixed(2)); // Return volume rounded to 2 decimal places
}

/**
 * Sets up automatic volume calculation for thyroid lobe dimension inputs.
 */
export function setupThyroidVolumeCalculations() {
    const dimensionInputs = document.querySelectorAll('#thyroid-assessment .dimension-group input.dimension');
    dimensionInputs.forEach(input => {
        input.addEventListener('input', (event) => {
            updateLobeVolume(event.target);
        });
         // Also trigger on 'change' in case values are pasted or set programmatically
         input.addEventListener('change', (event) => {
             updateLobeVolume(event.target);
         });
    });
     console.log("Thyroid volume calculation listeners set up.");
}

/**
 * Updates the volume display for a specific lobe based on its dimension inputs.
 * @param {HTMLInputElement} triggerInput - The input element that triggered the update.
 */
function updateLobeVolume(triggerInput) {
    const dimensionGroup = triggerInput.closest('.dimension-group');
    if (!dimensionGroup) return;

    const lobe = triggerInput.getAttribute('data-lobe'); // e.g., 'right', 'left'
    if (!lobe) return;

    const d1Input = dimensionGroup.querySelector(`#${lobe}-lobe-d1`);
    const d2Input = dimensionGroup.querySelector(`#${lobe}-lobe-d2`);
    const d3Input = dimensionGroup.querySelector(`#${lobe}-lobe-d3`);
    const volumeDisplay = dimensionGroup.querySelector(`#${lobe}-lobe-volume`);
    // Hidden input to store calculated volume in the form data
    let volumeInput = dimensionGroup.querySelector(`input[name="${lobe}LobeVolume"]`);
     if (!volumeInput) {
         volumeInput = document.createElement('input');
         volumeInput.type = 'hidden';
         volumeInput.name = `${lobe}LobeVolume`;
         dimensionGroup.appendChild(volumeInput);
     }


    if (d1Input && d2Input && d3Input && volumeDisplay && volumeInput) {
        const volume = calculateEllipsoidVolume(d1Input.value, d2Input.value, d3Input.value);

        if (volume !== null) {
            volumeDisplay.textContent = volume;
            volumeInput.value = volume; // Store for form submission/data collection
        } else {
            volumeDisplay.textContent = '0'; // Or 'N/A', or empty
             volumeInput.value = ''; // Clear stored value if calculation fails
        }
    } else {
         console.warn(`Could not find all elements for ${lobe} lobe volume calculation.`);
    }
}

// Potential future expansion:
// export function calculateVolume(shape, ...dims) {
//   switch(shape) {
//     case 'ellipsoid': return calculateEllipsoidVolume(...dims);
//     // case 'otherShape': ...
//     default: return null;
//   }
// }