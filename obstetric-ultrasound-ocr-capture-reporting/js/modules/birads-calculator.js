// js/modules/birads-calculator.js
// Implements BI-RADS assessment logic based on lesion features.
// WARNING: BI-RADS assessment is complex and context-dependent.
// The logic here is a simplified placeholder and requires review/enhancement
// based on the latest ACR BI-RADS Atlas guidelines.

import { getFormData } from '../core/form-core.js'; // To easily get features from a lesion form group
import { showNotification } from '../core/ui-core.js'; // For notifications

/**
 * Estimates the BI-RADS category based on lesion features.
 * *** CRITICAL WARNING: THIS IS HIGHLY SIMPLIFIED PLACEHOLDER LOGIC. ***
 * Real BI-RADS assessment involves nuanced interpretation of feature combinations.
 * This function provides a basic estimation primarily based on the most suspicious feature found.
 *
 * @param {object} features - An object containing feature values (text descriptions from selects/inputs).
 * Example keys: lesionShape, lesionOrientation, lesionMargin, lesionEchoPattern, lesionPosterior, lesionCalcifications etc.
 * @returns {string} - The estimated BI-RADS category string (e.g., "BI-RADS 2", "BI-RADS 4B"). Returns empty string if assessment is unclear.
 */
export function calculateBiradsCategory(features) {
    console.log("[BIRADS Calc] Input Features:", features);

    // --- Rule-based simplified assessment ---

    // Rule 1: Definitive Benign (BI-RADS 2) - Needs more specific checks
    // Example: Classic simple cyst or stable presumed fibroadenoma (stability not checked here)
    if (features.lesionEchoPattern === 'Anechoic / Trống âm' &&
        features.lesionMargin === 'Circumscribed / Giới hạn rõ' &&
        features.lesionPosterior === 'Enhancement / Tăng âm') {
        console.log("[BIRADS Calc] Estimated: BI-RADS 2 (Simple Cyst Pattern)");
        return "BI-RADS 2: Benign / BI-RADS 2: Lành tính";
    }
    // Add checks for other classic benign findings if possible (e.g., fat-containing lesions, implants - need specific form fields)

    // Rule 2: Probably Benign (BI-RADS 3) - Typically solid, circumscribed, oval, parallel
    if (features.lesionShape === 'Oval / Bầu dục' &&
        features.lesionMargin === 'Circumscribed / Giới hạn rõ' &&
        features.lesionOrientation === 'Parallel / Song song' &&
        (features.lesionEchoPattern === 'Hypoechoic / Giảm âm' || features.lesionEchoPattern === 'Isoechoic / Đồng âm') &&
        !features.lesionPosterior?.includes('Shadowing') && // Not shadowing
        !features.lesionCalcifications?.toLowerCase().includes('micro')) // No microcalcs
     {
         // Check for *any* clearly suspicious features that would override BI-RADS 3
         if (features.lesionShape === 'Irregular / Không đều' ||
             features.lesionMargin === 'Indistinct / Không rõ' ||
             features.lesionMargin === 'Microlobulated / Đa cung nhỏ' ||
             features.lesionMargin === 'Spiculated / Tua gai' ||
             features.lesionOrientation === 'Not Parallel (Vertical) / Không song song (Dọc)') {
             // If any explicitly suspicious feature exists, don't call it TR3 based on the benign ones
         } else {
             console.log("[BIRADS Calc] Estimated: BI-RADS 3 (Typical Fibroadenoma Pattern - requires stability check)");
             return "BI-RADS 3: Probably Benign / BI-RADS 3: Nhiều khả năng lành tính";
         }
     }


    // Rule 3: Suspicious Features (BI-RADS 4 & 5) - Count or identify key suspicious features
    let suspicionLevel = 0;
    let isHighlySuspicious = false;

    // Key suspicious features (examples)
    const suspiciousMargins = ['Indistinct / Không rõ', 'Microlobulated / Đa cung nhỏ', 'Spiculated / Tua gai'];
    if (suspiciousMargins.includes(features.lesionMargin)) suspicionLevel++;
    if (features.lesionShape === 'Irregular / Không đều') suspicionLevel++;
    if (features.lesionOrientation === 'Not Parallel (Vertical) / Không song song (Dọc)') suspicionLevel++;
    if (features.lesionPosterior === 'Shadowing / Bóng lưng') suspicionLevel++;
    // Add check for suspicious calcifications if field exists and has relevant value
    if (features.lesionCalcifications?.toLowerCase().includes('micro') || features.lesionCalcifications?.toLowerCase().includes('linear') || features.lesionCalcifications?.toLowerCase().includes('segmental')) {
         suspicionLevel++;
    }


    // Check for BI-RADS 5 features (highly suggestive)
    if (features.lesionMargin === 'Spiculated / Tua gai' &&
        (features.lesionShape === 'Irregular / Không đều' || features.lesionOrientation === 'Not Parallel (Vertical) / Không song song (Dọc)')) {
        isHighlySuspicious = true;
    }
    // Add other BI-RADS 5 combinations here (e.g., irregular shape + non-parallel + posterior shadowing + suspicious calcs)

    // Determine category based on suspicion level
    if (isHighlySuspicious) {
        console.log("[BIRADS Calc] Estimated: BI-RADS 5 (Highly Suspicious Features)");
        return "BI-RADS 5: Highly Suggestive of Malignancy / BI-RADS 5: Rất nghi ngờ ác tính";
    } else if (suspicionLevel >= 3) { // High suspicion (adjust threshold as needed)
        console.log(`[BIRADS Calc] Estimated: BI-RADS 4C (Suspicion Level: ${suspicionLevel})`);
        return "BI-RADS 4C: High suspicion / BI-RADS 4C: Nghi ngờ cao";
    } else if (suspicionLevel === 2) { // Moderate suspicion
        console.log(`[BIRADS Calc] Estimated: BI-RADS 4B (Suspicion Level: ${suspicionLevel})`);
        return "BI-RADS 4B: Moderate suspicion / BI-RADS 4B: Nghi ngờ vừa";
    } else if (suspicionLevel === 1) { // Low suspicion
        console.log(`[BIRADS Calc] Estimated: BI-RADS 4A (Suspicion Level: ${suspicionLevel})`);
        return "BI-RADS 4A: Low suspicion / BI-RADS 4A: Nghi ngờ thấp";
    }

    // Rule 0: Incomplete - If essential features are missing (e.g., size, key descriptors)
    // This check might be better placed in the calling function (breast-module)
    if (!features.lesionShape || !features.lesionMargin || !features.lesionEchoPattern) {
         console.log("[BIRADS Calc] Assessment Incomplete (Missing key features)");
         // Returning empty might be better than guessing BI-RADS 0
         // return "BI-RADS 0: Incomplete / BI-RADS 0: Chưa hoàn chỉnh";
         return ""; // Indicate assessment couldn't be made
    }

    // If no rules met, default might be BI-RADS 2 if clearly not suspicious, or requires careful review
    // For safety, perhaps return "" if uncertain after checks.
    console.log("[BIRADS Calc] No specific category determined based on simplified rules.");
    return ""; // Return empty if no category clearly fits
}

/**
 * Provides follow-up recommendations based on BI-RADS category.
 * @param {string} category - The BI-RADS category string (e.g., "BI-RADS 3: Probably Benign...").
 * @returns {string} - A text recommendation. Returns empty string if category is invalid.
 */
export function getBiradsRecommendation(category) {
    if (!category || typeof category !== 'string') {
        return ""; // No recommendation if category is missing
    }

    // Extract the core category (e.g., "BI-RADS 3")
    const coreCategoryMatch = category.match(/BI-RADS\s*([0-6])/i);
    const coreCategoryNum = coreCategoryMatch ? parseInt(coreCategoryMatch[1]) : -1;
    const subCategory = category.includes("4A") ? "4A" : category.includes("4B") ? "4B" : category.includes("4C") ? "4C" : null;

    switch (coreCategoryNum) {
        case 0: return "Needs additional imaging evaluation (e.g., diagnostic mammogram, comparison). / Cần đánh giá hình ảnh bổ sung (ví dụ: chụp nhũ ảnh chẩn đoán, so sánh).";
        case 1:
        case 2: return "Routine screening interval. / Khoảng thời gian tầm soát định kỳ.";
        case 3: return "Short-interval follow-up recommended (typically 6 months). / Đề nghị theo dõi khoảng thời gian ngắn (thường là 6 tháng).";
        case 4: // Biopsy generally recommended for all subcategories 4A, 4B, 4C
            return "Biopsy recommended. / Đề nghị sinh thiết.";
        case 5: return "Biopsy is highly recommended; appropriate action should be taken. / Rất đề nghị sinh thiết; cần có hành động thích hợp.";
        case 6: return "Appropriate action should be taken (e.g., surgical excision planned). / Cần có hành động thích hợp (ví dụ: phẫu thuật cắt bỏ theo kế hoạch).";
        default:
            console.warn(`[BIRADS Calc] Unknown core category number "${coreCategoryNum}" derived from "${category}"`);
            return ""; // Undetermined recommendation
    }
}

/**
 * Attaches event listeners to BI-RADS related fields within a lesion element
 * to trigger category recalculation and display updates.
 * @param {HTMLElement} lesionElement - The container element for a single lesion's form fields.
 */
export function setupBiradsCalculationForLesion(lesionElement) {
    if (!lesionElement) {
        console.error("[BIRADS Calc] setupBiradsCalculationForLesion called with invalid element.");
        return;
    }
    // Find all elements within this specific lesionElement that influence the BI-RADS calculation
    const biradsFields = lesionElement.querySelectorAll('.birads-field'); // Ensure HTML uses this class
    if (biradsFields.length === 0) {
        console.warn(`[BIRADS Calc] No elements with class 'birads-field' found within lesion:`, lesionElement.dataset.lesionId);
        // return; // Continue even if no fields found? Or stop? Let's continue.
    }

    const updateDisplayCallback = () => {
        // Add a small delay to allow potential form value updates to settle, especially for text inputs
        // setTimeout(() => {
             updateBiradsDisplay(lesionElement);
        // }, 50); // 50ms delay - adjust if needed, or remove if causing issues
    };


    biradsFields.forEach(field => {
        // Use 'change' for selects, 'input' for text fields might be better for real-time updates
        const eventType = (field.tagName === 'SELECT' || field.type === 'radio' || field.type === 'checkbox') ? 'change' : 'input';
        field.removeEventListener(eventType, updateDisplayCallback); // Prevent duplicates
        field.addEventListener(eventType, updateDisplayCallback);
    });

    // Initial calculation and display update when the lesion is first added/loaded
    console.log(`[BIRADS Calc] Setting up listeners and performing initial calculation for lesion: ${lesionElement.dataset.lesionId}`);
    // Ensure initial calculation happens after potential population by template loader
    // A small timeout might help ensure data is present, but direct call is usually fine if setup is called *after* population
    // setTimeout(() => updateBiradsDisplay(lesionElement), 0);
     updateBiradsDisplay(lesionElement); // Call directly


}

/**
 * Updates the displayed BI-RADS category and recommendation for a specific lesion.
 * @param {HTMLElement} lesionElement - The lesion container element.
 */
export function updateBiradsDisplay(lesionElement) {
    if (!lesionElement) {
        console.warn("[BIRADS Calc] updateBiradsDisplay called with null element.");
        return;
    }
    try {
        // Use getFormData scoped to the lesion element to get all relevant feature values
        const features = getFormData(lesionElement);

        // Calculate category and recommendation using the logic defined above
        const category = calculateBiradsCategory(features); // Might return ""
        const recommendation = getBiradsRecommendation(category);

        // Find the display elements and hidden inputs within this specific lesionElement
        const categoryDisplay = lesionElement.querySelector('.birads-category');
        const recommendationDisplay = lesionElement.querySelector('.birads-recommendation');
        const categoryInput = lesionElement.querySelector('input[name="biradsCategory"]');
        const recommendationInput = lesionElement.querySelector('input[name="biradsRecommendation"]');

        // Update the UI elements safely
        if (categoryDisplay) {
            categoryDisplay.textContent = category || '?'; // Show '?' if category is empty/undetermined
            // Optional: Add styling based on category
             categoryDisplay.className = 'birads-category'; // Reset classes
             if(category.includes('BI-RADS 4') || category.includes('BI-RADS 5')) {
                 categoryDisplay.classList.add('suspicious'); // Example class for CSS
             } else if (category.includes('BI-RADS 3')) {
                 categoryDisplay.classList.add('probably-benign');
             } else if (category.includes('BI-RADS 1') || category.includes('BI-RADS 2')) {
                 categoryDisplay.classList.add('benign');
             }
        }
        if (recommendationDisplay) {
            recommendationDisplay.textContent = recommendation || 'Recommendation undetermined / Đề nghị không xác định';
        }
        if (categoryInput) {
            categoryInput.value = category || ''; // Store the calculated category
        }
        if (recommendationInput) {
            recommendationInput.value = recommendation || ''; // Store the recommendation
        }

         // console.log(`[BIRADS Calc] Display updated for lesion ${lesionElement.dataset.lesionId}: Cat='${category}', Reco='${recommendation}'`);

    } catch (error) {
        console.error(`[BIRADS Calc] Error updating display for lesion ${lesionElement.dataset.lesionId}:`, error);
        // Optionally show a UI error message specific to this lesion's calculation
    }
}

console.log("birads-calculator.js loaded (with simplified placeholder logic).");