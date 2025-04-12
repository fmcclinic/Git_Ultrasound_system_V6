// js/organs/breast/breast-presets.js
// Defines preset data templates for common breast ultrasound findings.

/**
 * Structure: Array of objects, each with 'name' and 'data'.
 * The 'data' object should contain a 'breast' key holding the form data.
 * Field names MUST match the 'name' attributes in the breast-assessment-form HTML.
 * Use BI-RADS terminology and categories correctly based on typical findings.
 * lesionDescription should ideally match the features selected.
 * overallBirads should reflect the highest BI-RADS category of findings.
 */
export const breastPresets = [
    {
        name: "Normal Exam / Siêu âm Bình Thường",
        data: {
            breast: {
                // Parenchyma
                breastEchotexture: "Homogeneous background echotexture, predominantly fatty / Cấu trúc nền đồng nhất, chủ yếu mô mỡ",
                breastDensity: "ACR Density A (Almost entirely fatty) / Mật độ ACR A (Hầu hết là mô mỡ)",
                parenchymaDescription: "Cooper's ligaments appear normal. No ductal ectasia. / Dây chằng Cooper bình thường. Không giãn ống tuyến.",
                // Lesions
                lesions: [], // No lesions for normal
                // Axilla
                axillaRight: "No abnormal lymph nodes seen. Normal cortical thickness. / Không thấy hạch bất thường. Vỏ hạch dày bình thường.",
                axillaLeft: "No abnormal lymph nodes seen. Normal cortical thickness. / Không thấy hạch bất thường. Vỏ hạch dày bình thường.",
                // Impression & Recommendation
                impression: "Normal bilateral breast ultrasound examination. / Siêu âm hai vú bình thường.",
                overallBirads: "BI-RADS 1: Negative / BI-RADS 1: Âm tính",
                recommendation: "Routine screening mammography as appropriate for age and risk factors. / Chụp nhũ ảnh tầm soát định kỳ phù hợp với tuổi và yếu tố nguy cơ."
            }
        }
    },
    {
        name: "Simple Cyst / Nang đơn thuần",
        data: {
            breast: {
                 // Parenchyma - Example
                breastEchotexture: "Heterogeneous background echotexture / Cấu trúc nền không đồng nhất",
                breastDensity: "ACR Density C (Heterogeneously dense) / Mật độ ACR C (Không đồng nhất)",
                 parenchymaDescription: "Scattered ducts, appear normal caliber. / Rải rác vài ống tuyến, khẩu kính bình thường.",
                // Lesions - One simple cyst
                lesions: [
                    {
                        lesionLocation: "Left Breast, 9 o'clock, 2 cm FN / Vú Trái, vị trí 9 giờ, cách núm vú 2 cm",
                        lesionD1: "15", lesionD2: "12", lesionD3: "14", // Size WxAPxL
                        lesionShape: "Oval / Bầu dục",
                        lesionOrientation: "Parallel / Song song",
                        lesionMargin: "Circumscribed / Giới hạn rõ",
                        lesionEchoPattern: "Anechoic / Trống âm",
                        lesionPosterior: "Enhancement / Tăng âm",
                        lesionCalcifications: "None / Không có",
                        // These would be set by the calculator in a real scenario, but included here for template completeness
                        biradsCategory: "BI-RADS 2: Benign / BI-RADS 2: Lành tính",
                        biradsRecommendation: "Routine screening interval. / Khoảng thời gian tầm soát định kỳ.",
                        lesionDescription: "Well-circumscribed anechoic lesion with posterior acoustic enhancement and imperceptible wall, consistent with a simple cyst. No internal vascularity. / Tổn thương trống âm giới hạn rõ, tăng âm phía sau, thành không quan sát được, phù hợp nang đơn thuần. Không có tưới máu bên trong."
                    }
                ],
                 // Axilla - Example
                axillaRight: "Unremarkable. / Không ghi nhận bất thường.",
                axillaLeft: "Unremarkable. / Không ghi nhận bất thường.",
                // Impression & Recommendation
                impression: "Simple cyst in the left breast. Heterogeneous background parenchyma. / Nang đơn thuần ở vú trái. Nền mô tuyến không đồng nhất.",
                overallBirads: "BI-RADS 2: Benign / BI-RADS 2: Lành tính", // Reflects the finding
                recommendation: "Routine screening follow-up. / Theo dõi tầm soát định kỳ."
            }
        }
    },
    {
        name: "Fibroadenoma (Typical) / Bướu sợi tuyến (Điển hình)",
        data: {
            breast: {
                // Parenchyma - Example
                breastEchotexture: "Homogeneous background echotexture, fibroglandular / Cấu trúc nền đồng nhất, mô sợi tuyến",
                breastDensity: "ACR Density B (Scattered fibroglandular densities) / Mật độ ACR B (Mô sợi tuyến rải rác)",
                parenchymaDescription: "", // Optional
                // Lesions - One typical fibroadenoma
                lesions: [
                    {
                        lesionLocation: "Right Breast, 11 o'clock, 4 cm FN / Vú Phải, vị trí 11 giờ, cách núm vú 4 cm",
                        lesionD1: "18", lesionD2: "10", lesionD3: "15", // Size WxAPxL
                        lesionShape: "Oval / Bầu dục",
                        lesionOrientation: "Parallel / Song song",
                        lesionMargin: "Circumscribed / Giới hạn rõ",
                        lesionEchoPattern: "Hypoechoic / Giảm âm", // Common
                        lesionPosterior: "No posterior features / Không có", // Common
                        lesionCalcifications: "None / Không có",
                        // BI-RADS assessment for a presumed new FA is often 3
                        biradsCategory: "BI-RADS 3: Probably Benign / BI-RADS 3: Nhiều khả năng lành tính",
                        biradsRecommendation: "Short-interval follow-up recommended (typically 6 months). / Đề nghị theo dõi khoảng thời gian ngắn (thường là 6 tháng).",
                        lesionDescription: "Circumscribed, oval, parallel, homogeneous hypoechoic solid mass. No suspicious features (no irregular margins, shadowing, suspicious calcifications). Appearance typical for a fibroadenoma. / Khối đặc giới hạn rõ, hình bầu dục, hướng song song, hồi âm giảm đồng nhất. Không có đặc điểm nghi ngờ (không bờ không đều, bóng lưng, vôi hóa nghi ngờ). Hình ảnh điển hình của bướu sợi tuyến."
                    }
                ],
                 // Axilla - Example
                axillaRight: "Unremarkable. / Không ghi nhận bất thường.",
                axillaLeft: "Unremarkable. / Không ghi nhận bất thường.",
                // Impression & Recommendation
                impression: "Solid mass in the right breast with features typical of a fibroadenoma. / Khối đặc ở vú phải với các đặc điểm điển hình của bướu sợi tuyến.",
                overallBirads: "BI-RADS 3: Probably Benign / BI-RADS 3: Nhiều khả năng lành tính", // Overall reflects the finding
                recommendation: "Short-term follow-up ultrasound (e.g., 6 months) recommended to ensure stability, especially if new. / Đề nghị siêu âm theo dõi ngắn hạn (ví dụ: 6 tháng) để đảm bảo ổn định, đặc biệt nếu mới phát hiện."
            }
        }
    },
     {
        name: "Suspicious Lesion (BI-RADS 4B Example) / Tổn thương Nghi ngờ (Ví dụ BI-RADS 4B)",
        data: {
            breast: {
                 // Parenchyma - Example
                breastEchotexture: "Heterogeneous background echotexture / Cấu trúc nền không đồng nhất",
                breastDensity: "ACR Density C (Heterogeneously dense) / Mật độ ACR C (Không đồng nhất)",
                parenchymaDescription: "",
                // Lesions - One suspicious lesion
                lesions: [
                    {
                        lesionLocation: "Left Breast, 1 o'clock, 5 cm FN / Vú Trái, vị trí 1 giờ, cách núm vú 5 cm",
                        lesionD1: "12", lesionD2: "10", lesionD3: "9", // Size WxAPxL
                        lesionShape: "Irregular / Không đều", // Suspicious
                        lesionOrientation: "Not Parallel (Vertical) / Không song song (Dọc)", // Suspicious
                        lesionMargin: "Indistinct / Không rõ", // Suspicious
                        lesionEchoPattern: "Hypoechoic / Giảm âm", // Non-specific but common in malignancy
                        lesionPosterior: "Shadowing / Bóng lưng", // Suspicious
                        lesionCalcifications: "None identified / Không xác định",
                         // Moderate suspicion
                        biradsCategory: "BI-RADS 4B: Moderate suspicion / BI-RADS 4B: Nghi ngờ vừa",
                        biradsRecommendation: "Biopsy recommended. / Đề nghị sinh thiết.",
                        lesionDescription: "Irregular, non-parallel (taller-than-wide appearance suggested), indistinctly marginated hypoechoic mass with posterior acoustic shadowing. These features raise moderate suspicion for malignancy. / Khối giảm âm, hình dạng không đều, hướng không song song (gợi ý cao hơn rộng), bờ không rõ, có bóng lưng phía sau. Các đặc điểm này gợi ý nghi ngờ ác tính mức độ vừa."
                    }
                ],
                // Axilla - Important to check
                axillaRight: "Unremarkable. / Không ghi nhận bất thường.",
                axillaLeft: "One node with mildly thickened cortex noted, indeterminate significance. Consider correlation or targeted sampling if lesion biopsy is positive. / Ghi nhận một hạch có vỏ hơi dày, ý nghĩa không xác định. Cân nhắc đối chiếu hoặc lấy mẫu định hướng nếu sinh thiết tổn thương dương tính.",
                // Impression & Recommendation
                impression: "Suspicious mass (BI-RADS 4B) in the left breast as described. Indeterminate left axillary node. / Khối nghi ngờ (BI-RADS 4B) ở vú trái như mô tả. Hạch nách trái không xác định.",
                overallBirads: "BI-RADS 4B: Moderate suspicion / BI-RADS 4B: Nghi ngờ vừa", // Driven by the lesion
                recommendation: "Ultrasound-guided core needle biopsy of the left breast mass is recommended. Depending on biopsy results, further evaluation of the left axillary node may be warranted. / Đề nghị sinh thiết lõi kim khối vú trái dưới hướng dẫn siêu âm. Tùy thuộc kết quả sinh thiết, có thể cần đánh giá thêm hạch nách trái."
            }
        }
    },
    // Thêm các preset khác nếu cần (ví dụ: BI-RADS 5, BI-RADS 6, Nang phức tạp, v.v.)

]; // End of breastPresets array

console.log("breast-presets.js loaded.");