// js/modules/tirads-calculator.js
// Implements ACR TI-RADS calculation based on nodule features.

/**
 * Calculates the TI-RADS score based on selected features.
 * Handles multiple selections for Echogenic Foci by summing points.
 * @param {object} features - An object containing feature values (usually point values as strings).
 * Expected keys: lesionComposition, lesionEchogenicity, lesionShape, lesionMargin, lesionEchogenicFoci (can be array).
 * @returns {number} - The calculated TI-RADS score.
 */
export function calculateTiradsScore(features) {
    let score = 0;

    // --- Sum points from each category ---
    // Ensure values are parsed as numbers, default to 0 if missing/invalid
    score += parseInt(features.lesionComposition || '0', 10) || 0;
    score += parseInt(features.lesionEchogenicity || '0', 10) || 0;
    score += parseInt(features.lesionShape || '0', 10) || 0;
    score += parseInt(features.lesionMargin || '0', 10) || 0;

    // Echogenic Foci: Can be multiple selections. Sum their points.
    const foci = features.lesionEchogenicFoci;
    if (Array.isArray(foci)) {
        foci.forEach(focusValue => {
            score += parseInt(focusValue || '0', 10) || 0;
        });
    } else if (foci) { // Handle single selection if not array
         score += parseInt(foci || '0', 10) || 0;
    }

    // ACR TI-RADS doesn't subtract points, so score won't go below 0.
    console.log("Calculated TI-RADS score:", score, "from features:", features);
    return score;
}

/**
 * Determines the TI-RADS category based on the score.
 * @param {number} score - The calculated TI-RADS score.
 * @returns {string} - The TI-RADS category (e.g., "TR1", "TR2", ... "TR5").
 */
export function getTiradsCategory(score) {
    if (score === 0) return "TR1"; // Benign
    if (score === 1 || score === 2) return "TR2"; // Not suspicious
    if (score === 3) return "TR3"; // Mildly suspicious
    if (score >= 4 && score <= 6) return "TR4"; // Moderately suspicious
    if (score >= 7) return "TR5"; // Highly suspicious
    return "TR?"; // Should not happen if score is calculated
}

/**
 * Provides follow-up recommendations based on TI-RADS category and nodule size (largest dimension).
 * Note: These are simplified examples based on common practice / ACR guidelines. ALWAYS refer to the official, current ACR guidelines.
 * @param {string} category - The TI-RADS category (e.g., "TR3").
 * @param {number|string|null} largestDimension - The largest dimension of the nodule in mm.
 * @returns {string} - A text recommendation.
 */
export function getTiradsRecommendation(category, largestDimension) {
    const size = parseFloat(largestDimension);
     if (isNaN(size) && (category === 'TR3' || category === 'TR4' || category === 'TR5')) {
         return "Size needed for recommendation.";
     }

    switch (category) {
        case "TR1":
        case "TR2":
            return "No FNA or follow-up needed.";
        case "TR3": // Mildly suspicious
            if (size >= 25) return "FNA recommended."; // >= 2.5 cm
            if (size >= 15) return "Follow-up recommended (e.g., 1, 3, 5 years)."; // >= 1.5 cm
            return "No FNA or follow-up needed."; // < 1.5 cm
        case "TR4": // Moderately suspicious
            if (size >= 15) return "FNA recommended."; // >= 1.5 cm
            if (size >= 10) return "Follow-up recommended (e.g., 1, 2, 3, 5 years)."; // >= 1.0 cm
            return "No FNA or follow-up needed."; // < 1.0 cm
        case "TR5": // Highly suspicious
            if (size >= 10) return "FNA recommended."; // >= 1.0 cm
            if (size >= 5) return "Follow-up recommended (e.g., annually for up to 5 years)."; // >= 0.5 cm
            return "No FNA or follow-up needed."; // < 0.5 cm
        default:
            return "Recommendation undetermined.";
    }
}

/**
 * Attaches event listeners to TI-RADS related fields within a lesion element
 * to trigger score recalculation and display updates.
 * @param {HTMLElement} lesionElement - The container element for a single lesion's form fields.
 */
export function setupTiradsCalculationForLesion(lesionElement) {
    const tiradsFields = lesionElement.querySelectorAll('.tirads-field');
    const dimensionFields = lesionElement.querySelectorAll('.dimension'); // Need size for recommendation

    const updateDisplay = () => {
        updateTiradsDisplay(lesionElement);
    };

    tiradsFields.forEach(field => {
        field.addEventListener('change', updateDisplay);
    });

     dimensionFields.forEach(field => {
         field.addEventListener('input', updateDisplay); // Update recommendation as size changes
          field.addEventListener('change', updateDisplay);
     });

    // Initial calculation when setting up
    updateTiradsDisplay(lesionElement);
    console.log(`TI-RADS calculation listener set up for lesion: ${lesionElement.dataset.lesionId}`);
}

/**
 * Updates the displayed TI-RADS score, category, and recommendation for a lesion.
 * @param {HTMLElement} lesionElement - The lesion container element.
 */
export function updateTiradsDisplay(lesionElement) {
    const features = {};
    const tiradsFields = lesionElement.querySelectorAll('.tirads-field');

    // Gather feature data from the fields within this lesion element
    tiradsFields.forEach(field => {
        if (field.name) {
             if (field.type === 'select-multiple') {
                 features[field.name] = Array.from(field.selectedOptions).map(opt => opt.value);
             } else {
                 features[field.name] = field.value;
             }
        }
    });

     // Get largest dimension for recommendation
     let largestDim = 0;
     const dimInputs = lesionElement.querySelectorAll('.dimension-group input.dimension');
     dimInputs.forEach(input => {
         const val = parseFloat(input.value);
         if (!isNaN(val) && val > largestDim) {
             largestDim = val;
         }
     });

    // Calculate score, category, recommendation
    const score = calculateTiradsScore(features);
    const category = getTiradsCategory(score);
    const recommendation = getTiradsRecommendation(category, largestDim > 0 ? largestDim : null);

    // Update the display elements
    const scoreDisplay = lesionElement.querySelector('.tirads-score');
    const categoryDisplay = lesionElement.querySelector('.tirads-category');
    const recommendationDisplay = lesionElement.querySelector('.tirads-recommendation');
     // Hidden input to store score in form data
     let scoreInput = lesionElement.querySelector('input[name="tiradsScore"]');
     if (!scoreInput) {
         scoreInput = document.createElement('input');
         scoreInput.type = 'hidden';
         scoreInput.name = 'tiradsScore';
         lesionElement.appendChild(scoreInput);
     }
     // Hidden input for category
     let categoryInput = lesionElement.querySelector('input[name="tiradsCategory"]');
     if (!categoryInput) {
         categoryInput = document.createElement('input');
         categoryInput.type = 'hidden';
         categoryInput.name = 'tiradsCategory';
         lesionElement.appendChild(categoryInput);
     }
      // Hidden input for recommendation
     let recommendationInput = lesionElement.querySelector('input[name="tiradsRecommendation"]');
     if (!recommendationInput) {
         recommendationInput = document.createElement('input');
         recommendationInput.type = 'hidden';
         recommendationInput.name = 'tiradsRecommendation';
         lesionElement.appendChild(recommendationInput);
     }


    if (scoreDisplay) scoreDisplay.textContent = score;
    if (categoryDisplay) categoryDisplay.textContent = category;
    if (recommendationDisplay) recommendationDisplay.textContent = `Recommendation: ${recommendation}`;
     if (scoreInput) scoreInput.value = score;
     if (categoryInput) categoryInput.value = category;
     if (recommendationInput) recommendationInput.value = recommendation;

     // console.log(`TI-RADS display updated for lesion ${lesionElement.dataset.lesionId}: Score=${score}, Cat=${category}, Reco=${recommendation}`);
}