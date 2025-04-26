// intergrowthCalculator.js
// Module độc lập để tính toán bách phân vị/khoảng bách phân vị
// cho các số đo sinh trắc học thai nhi (BPD, HC, AC, FL)
// dựa trên dữ liệu INTERGROWTH-21st Centiles.

/**
 * Dữ liệu tham chiếu INTERGROWTH-21st Centiles.
 * Dữ liệu được phiên âm từ các bảng hình ảnh được cung cấp.
 * Cần đảm bảo tính chính xác của dữ liệu này.
 * Dữ liệu cho HL (Humerus Length) chưa được thêm vào.
 */
const GROWTH_CHART_DATA_INTERGROWTH21 = {
    // Head Circumference (HC) - Centiles table
    hc: {
        weeks: [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
        p3:  [87.1, 99.3, 111.1, 123.0, 134.9, 146.8, 158.5, 170.1, 181.4, 192.6, 203.5, 214.1, 224.3, 234.1, 243.6, 252.5, 261.0, 268.9, 276.3, 283.0, 289.1, 294.5, 299.2, 303.1, 306.1, 308.3, 309.6],
        p5:  [88.7, 100.6, 112.6, 124.6, 136.6, 148.5, 160.2, 171.9, 183.3, 194.5, 205.5, 216.0, 226.3, 236.2, 245.7, 254.7, 263.2, 271.1, 278.5, 285.2, 291.5, 296.9, 301.7, 305.7, 308.9, 311.2, 312.7],
        p10: [90.7, 102.8, 114.8, 127.0, 139.1, 151.1, 163.0, 174.7, 186.2, 197.5, 208.6, 219.1, 229.5, 239.4, 248.9, 258.0, 266.5, 274.6, 282.1, 288.9, 295.2, 300.8, 305.6, 309.8, 313.1, 315.7, 317.4],
        p50: [97.9, 110.4, 122.9, 135.4, 147.9, 160.3, 172.5, 184.5, 196.3, 207.8, 219.1, 230.0, 240.5, 250.7, 260.4, 269.6, 278.4, 286.6, 294.4, 301.5, 308.1, 314.1, 319.4, 324.1, 328.1, 331.4, 333.9], // Median
        p90: [105.0, 118.0, 130.9, 143.9, 156.7, 169.5, 182.0, 194.3, 206.4, 218.2, 229.6, 240.8, 251.6, 261.9, 271.8, 281.3, 290.2, 298.7, 306.7, 314.1, 321.0, 327.4, 333.2, 338.4, 343.0, 347.1, 350.5],
        p95: [107.1, 120.1, 133.2, 146.3, 159.2, 172.1, 184.7, 197.1, 209.3, 221.1, 232.7, 243.9, 254.7, 265.1, 275.1, 284.6, 293.6, 302.1, 310.0, 317.4, 324.7, 331.2, 337.1, 342.5, 347.3, 351.5, 355.2],
        p97: [108.4, 121.5, 134.7, 147.8, 160.9, 173.8, 186.5, 199.0, 211.2, 223.1, 234.7, 245.9, 256.7, 267.2, 277.2, 286.7, 295.8, 304.4, 312.5, 320.0, 327.1, 333.6, 339.6, 345.1, 350.0, 354.4, 358.3]
    },
    // Bi-parietal Diameter (BPD) - Centiles table
    bpd: {
        weeks: [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
        p3:  [25.3, 29.1, 32.0, 35.0, 38.0, 41.1, 44.1, 47.2, 50.1, 53.1, 56.0, 59.4, 62.3, 65.2, 67.9, 70.6, 73.1, 75.5, 77.8, 79.8, 81.7, 83.3, 84.7, 85.9, 86.7, 87.3, 87.5],
        p5:  [25.7, 29.6, 32.5, 35.5, 38.5, 41.6, 44.7, 47.8, 50.8, 53.8, 56.8, 60.0, 63.0, 65.9, 68.6, 71.3, 73.9, 76.3, 78.6, 80.6, 82.4, 84.1, 85.5, 86.7, 87.6, 88.2, 88.4],
        p10: [26.7, 30.2, 33.2, 36.2, 39.3, 42.4, 45.5, 48.6, 51.8, 54.9, 58.0, 61.0, 64.0, 66.9, 69.7, 72.4, 75.0, 77.4, 79.7, 81.8, 83.7, 85.3, 86.8, 88.0, 88.9, 89.6, 89.9],
        p50: [27.4, 32.0, 35.2, 38.8, 42.0, 45.2, 48.4, 51.7, 55.0, 58.2, 61.4, 64.5, 67.6, 70.6, 73.5, 76.3, 78.9, 81.4, 83.8, 85.9, 87.9, 89.7, 91.2, 92.5, 93.6, 94.4, 94.9], // Median
        p90: [29.6, 34.9, 38.1, 41.4, 44.7, 48.0, 51.4, 54.8, 58.1, 61.4, 64.7, 68.0, 71.2, 74.3, 77.3, 80.1, 82.8, 85.4, 87.8, 90.1, 92.2, 94.0, 95.7, 97.1, 98.3, 99.2, 99.9],
        p95: [31.8, 35.6, 38.8, 42.1, 45.4, 48.8, 52.2, 55.6, 58.9, 62.3, 65.7, 69.0, 72.2, 75.3, 78.3, 81.2, 84.0, 86.6, 89.0, 91.3, 93.4, 95.2, 96.9, 98.4, 99.6, 100.6, 101.3],
        p97: [32.5, 36.0, 39.3, 42.6, 45.9, 49.3, 52.8, 56.2, 59.6, 63.0, 66.4, 69.7, 72.9, 76.0, 79.0, 81.9, 84.7, 87.3, 89.7, 92.0, 94.1, 96.0, 97.7, 99.2, 100.5, 101.5, 102.3]
    },
    // Femur Length (FL) - Centiles table
    fl: {
        weeks: [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
        p3:  [10.3, 13.4, 16.4, 19.4, 22.3, 25.2, 28.0, 30.6, 33.3, 35.9, 38.3, 40.6, 42.9, 45.1, 47.3, 49.3, 51.3, 53.2, 54.9, 56.7, 58.3, 59.8, 61.3, 62.6, 63.9, 65.0, 66.1], // Adjusted last value
        p5:  [10.8, 13.7, 16.8, 19.8, 22.7, 25.6, 28.4, 31.1, 33.7, 36.2, 38.7, 41.1, 43.4, 45.6, 47.8, 49.8, 51.8, 53.7, 55.4, 57.3, 58.9, 60.5, 61.9, 63.3, 64.6, 65.8, 66.8],
        p10: [11.2, 14.3, 17.4, 20.4, 23.4, 26.2, 29.0, 31.7, 34.4, 36.9, 39.4, 41.8, 44.1, 46.4, 48.6, 50.6, 52.6, 54.6, 56.4, 58.2, 59.8, 61.4, 62.9, 64.3, 65.6, 66.9, 68.0],
        p50: [13.1, 16.3, 19.5, 22.5, 25.5, 28.5, 31.3, 34.1, 36.7, 39.4, 41.9, 44.4, 46.7, 49.0, 51.3, 53.4, 55.5, 57.5, 59.4, 61.2, 62.8, 64.4, 66.4, 67.9, 69.4, 70.8, 72.1], // Median
        p90: [15.1, 18.3, 21.5, 24.7, 27.7, 30.7, 33.6, 36.4, 39.1, 41.8, 44.4, 46.9, 49.3, 51.7, 54.0, 56.2, 58.4, 60.5, 62.5, 64.3, 66.3, 68.1, 69.9, 71.6, 73.2, 74.7, 76.2],
        p95: [15.5, 18.9, 22.1, 25.3, 28.3, 31.3, 34.2, 37.0, 39.8, 42.5, 45.1, 47.6, 50.1, 52.5, 54.8, 57.0, 59.2, 61.3, 63.3, 65.3, 67.2, 69.1, 70.9, 72.6, 74.3, 75.9, 77.4],
        p97: [16.0, 19.3, 22.5, 25.7, 28.7, 31.7, 34.6, 37.5, 40.2, 42.9, 45.5, 48.1, 50.5, 52.9, 55.3, 57.5, 59.7, 61.9, 63.9, 65.9, 67.8, 69.7, 71.5, 73.3, 75.0, 76.6, 78.2]
    },
    // Abdominal Circumference (AC) - Centiles table
    ac: {
        weeks: [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
        p3:  [72.9, 82.8, 93.0, 103.1, 113.2, 123.3, 133.4, 143.4, 153.5, 163.4, 173.3, 183.2, 192.9, 202.6, 212.1, 221.4, 230.6, 239.6, 248.4, 256.9, 265.2, 273.2, 280.8, 288.1, 295.1, 301.6, 307.7],
        p5:  [73.8, 84.1, 94.3, 104.5, 114.8, 125.0, 135.2, 145.3, 155.5, 165.6, 175.6, 185.5, 195.4, 205.1, 214.7, 224.2, 233.5, 242.6, 251.6, 260.2, 268.7, 276.9, 284.8, 292.4, 299.6, 306.5, 312.9],
        p10: [75.3, 85.8, 96.3, 106.7, 117.2, 127.6, 138.0, 148.3, 158.6, 168.9, 179.0, 189.1, 199.1, 209.1, 218.8, 228.5, 238.0, 247.4, 256.5, 265.3, 274.3, 282.8, 291.0, 299.0, 306.7, 314.1, 321.1],
        p50: [80.6, 91.8, 103.2, 114.4, 125.6, 136.7, 147.7, 158.7, 169.6, 180.4, 191.2, 201.8, 212.4, 222.9, 233.3, 243.6, 253.8, 263.9, 273.9, 283.6, 293.6, 303.3, 312.8, 322.3, 331.6, 340.8, 349.8], // Median
        p90: [85.9, 98.1, 110.1, 122.1, 134.0, 145.8, 157.5, 169.1, 180.6, 192.0, 203.3, 214.5, 225.7, 236.8, 247.8, 258.7, 269.6, 280.5, 291.3, 302.0, 313.0, 323.8, 334.6, 345.5, 356.4, 367.4, 378.5],
        p95: [87.4, 99.8, 112.1, 124.3, 136.4, 148.4, 160.3, 172.0, 183.7, 195.3, 206.8, 218.1, 229.5, 240.7, 251.9, 263.0, 274.1, 285.2, 296.1, 307.0, 318.5, 329.6, 340.9, 352.1, 363.5, 375.0, 386.7],
        p97: [88.4, 100.9, 113.4, 125.7, 138.0, 150.1, 162.1, 174.0, 185.7, 197.4, 209.0, 220.5, 231.9, 243.2, 254.5, 265.8, 277.0, 288.3, 299.5, 310.7, 322.0, 333.4, 344.9, 356.4, 368.1, 379.9, 392.0]
    },
    // --- ADD HL DATA HERE (Optional) ---
    hl: {
        // Dữ liệu cho Humerus Length nếu bạn tìm thấy và muốn thêm
    }
};

/**
 * Helper function: Linear interpolation
 * @param {number} x0 - Lower known x value (e.g., week 20)
 * @param {number} y0 - Value at x0
 * @param {number} x1 - Upper known x value (e.g., week 21)
 * @param {number} y1 - Value at x1
 * @param {number} x - The x value where we want to estimate y (e.g., week 20.4)
 * @returns {number} Interpolated y value, or NaN if inputs are invalid.
 */
function linearInterpolate(x0, y0, x1, y1, x) {
    // Ensure inputs are numbers and denominator is not zero
    if (typeof x0 !== 'number' || typeof y0 !== 'number' ||
        typeof x1 !== 'number' || typeof y1 !== 'number' || typeof x !== 'number') {
        console.error("Invalid non-numeric input for linearInterpolate:", { x0, y0, x1, y1, x });
        return NaN;
    }
    if (x1 === x0) {
        // If x values are the same, return y0 (or y1, they should be the same)
        // Avoid division by zero.
        return y0;
    }
    return y0 + (x - x0) * (y1 - y0) / (x1 - x0);
}


/**
 * Calculates percentile/range using INTERGROWTH-21st centile tables.
 * Implemented for HC, BPD, FL, AC. HL requires data.
 * @param {'bpd'|'hc'|'ac'|'fl'|'hl'} measurementType - The type of measurement (e.g., 'hc').
 * @param {number} measurementValue - The measured value in mm.
 * @param {number} gaInWeeks - Gestational age in decimal weeks (e.g., 20.14).
 * @returns {string | null} Formatted percentile string/range (e.g., "P: ~42", "P10-P50") or "N/A" or "Error".
 */
export function calculateBiometryPercentile(measurementType, measurementValue, gaInWeeks) {
    // --- 1. Input Validation ---
    if (measurementValue === null || isNaN(measurementValue) || measurementValue <= 0 ||
        gaInWeeks === null || isNaN(gaInWeeks) || gaInWeeks < 14.0 || gaInWeeks > 40.0) {
        // console.warn(`Invalid input for percentile calc: Type=${measurementType}, Val=${measurementValue}, GA=${gaInWeeks}`);
        return "N/A"; // Indicate invalid input range
    }

    const chartData = GROWTH_CHART_DATA_INTERGROWTH21[measurementType];
    // --- 2. Check if Chart Data Exists ---
    if (!chartData || !chartData.weeks || chartData.weeks.length === 0 || !chartData.p50) {
        console.warn(`[Percentile Calc] No chart data available or incomplete for: ${measurementType}.`);
        if (measurementType === 'hl') return "N/A (No Data)"; // Specific message if HL data wasn't added
        return "Data Error"; // Error for expected types if data is missing
    }

    // --- 3. Find Bounding Weeks for Interpolation ---
    let lowerWeekIndex = -1;
    for (let i = 0; i < chartData.weeks.length - 1; i++) {
        // Check if gaInWeeks falls within the interval [weeks[i], weeks[i+1])
        // Use a small tolerance for floating point comparison for the lower bound
        if ((gaInWeeks >= chartData.weeks[i] - 0.001 && gaInWeeks < chartData.weeks[i+1]) ) {
            lowerWeekIndex = i;
            break;
        }
    }
     // Handle exact match for the last week in the chart
     if (lowerWeekIndex === -1 && Math.abs(gaInWeeks - chartData.weeks[chartData.weeks.length - 1]) < 0.001) {
          lowerWeekIndex = chartData.weeks.length - 2; // Use the second to last index for interpolation interval
     }

    // If GA is outside the defined range of the chart
    if (lowerWeekIndex === -1) {
         console.warn(`[Percentile Calc] GA ${gaInWeeks}w is outside the chart's week range [${chartData.weeks[0]}-${chartData.weeks[chartData.weeks.length-1]}] for ${measurementType}.`);
         return "N/A (Out of Range)";
    }

    const upperWeekIndex = lowerWeekIndex + 1;
    const w0 = chartData.weeks[lowerWeekIndex]; // Week value at lower index
    const w1 = chartData.weeks[upperWeekIndex]; // Week value at upper index

    // --- 4. Interpolate Centile Values & Determine Range ---
    try {
        const percentiles = ['p3', 'p5', 'p10', 'p50', 'p90', 'p95', 'p97'];
        // Verify that all required percentile arrays exist and have enough data points
        const requiredColumnsExist = percentiles.every(p => chartData[p] && chartData[p].length > upperWeekIndex);
        if (!requiredColumnsExist) {
             console.error(`[Percentile Calc] Chart data for ${measurementType} is missing required percentile columns or data points.`);
             return "Data Error";
        }

        // Interpolate the value for each standard percentile curve at the specific gaInWeeks
        const percentileValues = {};
        for (const p of percentiles) {
             // Double check indices are valid before accessing array elements
             if (lowerWeekIndex < 0 || lowerWeekIndex >= chartData[p].length || upperWeekIndex < 0 || upperWeekIndex >= chartData[p].length) {
                 console.error(`[Percentile Calc] Index out of bounds while interpolating ${p} for ${measurementType} at GA ${gaInWeeks}w. Indices: ${lowerWeekIndex}, ${upperWeekIndex}`);
                 return "Data Error";
             }
             const y0 = Number(chartData[p][lowerWeekIndex]); // Value at lower week
             const y1 = Number(chartData[p][upperWeekIndex]); // Value at upper week

             // Check if data points are valid numbers
             if (isNaN(y0) || isNaN(y1)) {
                  console.error(`[Percentile Calc] Invalid non-numeric data found for ${p} at weeks ${w0}/${w1} for ${measurementType}`);
                  return "Data Error";
             }

             // Perform linear interpolation
             percentileValues[p] = linearInterpolate(w0, y0, w1, y1, gaInWeeks);

             // Check if interpolation result is valid
             if (isNaN(percentileValues[p])) {
                  console.error(`[Percentile Calc] Interpolation resulted in NaN for ${p} for ${measurementType} @ ${gaInWeeks}w.`);
                  return "Calc Error";
             }
        }

        // Determine the percentile range or estimate the specific percentile
        const mv = Number(measurementValue); // Ensure measured value is a number
        if (isNaN(mv)) return "N/A"; // Cannot compare if input is not a number

        if (mv < percentileValues.p3) return "< P3";
        if (mv < percentileValues.p5) return "P3-P5";
        if (mv < percentileValues.p10) return "P5-P10";
        // Estimate percentile between P10 and P90 using linear interpolation on the percentile scale
        if (mv <= percentileValues.p50) {
             // Handle edge case where p10 and p50 values might be equal (flat curve segment)
             if (percentileValues.p50 <= percentileValues.p10) return "P10-P50 (~P50)";
             const estP = linearInterpolate(percentileValues.p10, 10, percentileValues.p50, 50, mv);
             // Clamp result between 1 and 99, round to nearest integer
             return `P: ~${Math.max(1, Math.min(99, Math.round(estP)))}`;
        }
        if (mv <= percentileValues.p90) {
             // Handle edge case where p50 and p90 values might be equal
            if (percentileValues.p90 <= percentileValues.p50) return "P50-P90 (~P90)";
             const estP = linearInterpolate(percentileValues.p50, 50, percentileValues.p90, 90, mv);
             // Clamp result between 1 and 99, round to nearest integer
             return `P: ~${Math.max(1, Math.min(99, Math.round(estP)))}`;
        }
        if (mv <= percentileValues.p95) return "P90-P95";
        if (mv <= percentileValues.p97) return "P95-P97";
        return "> P97";

    } catch (error) {
        console.error(`[Percentile Calc] Error during calculation for ${measurementType}:`, error);
        return "Error"; // Return generic error string
    }
}

// --- Các hàm còn lại (init, collectData, loadTemplate, formatReport, etc.) ---
// Giữ nguyên như phiên bản trước, đảm bảo chúng gọi calculateBiometryPercentile
// và các hàm helper khác một cách chính xác.

// Ví dụ: Hàm updatePercentileDisplay (không thay đổi)
function updatePercentileDisplay(inputElement) {
    if (!inputElement || !inputElement.classList.contains('biometry-input')) return;
    const measurementType = inputElement.name; // Assumes name='bpd', 'hc', etc.
    const measurementValue = parseFloat(inputElement.value);
    const percentileDisplayElement = document.getElementById(`${inputElement.id}_percentile`);
    const gaUsInput = document.getElementById('ga-us');
    const gaString = gaUsInput ? gaUsInput.value : null;
    const gaInWeeks = parseGAStringToWeeks(gaString);

    if (!percentileDisplayElement) return;

    let percentileText = "--";
    if (!isNaN(measurementValue) && measurementValue > 0 && gaInWeeks !== null) {
        const calculatedPercentile = calculateBiometryPercentile(measurementType, measurementValue, gaInWeeks);
        percentileText = calculatedPercentile !== null ? calculatedPercentile : "N/A";
    }
    percentileDisplayElement.textContent = `${percentileText}`;
}

// ... (Các hàm khác như init, collectObstetricData, loadObstetricTemplateData, etc. giữ nguyên) ...

// --- Log cuối file ---
console.log("intergrowthCalculator.js loaded (with INTERGROWTH-21st HC/BPD/FL/AC centile data and calculation logic).");

