// js/organs/thyroid/thyroid-presets.js

/**
 * Định nghĩa các mẫu dữ liệu cài sẵn cho các kết quả siêu âm tuyến giáp phổ biến.
 * Defines preset data templates for common thyroid ultrasound findings.
 *
 * PHIÊN BẢN CẬP NHẬT - DỰA TRÊN PHÂN TÍCH CODE LIÊN QUAN (template-core, thyroid-module, html)
 * UPDATED VERSION - BASED ON ANALYSIS OF RELATED CODE (template-core, thyroid-module, html)
 *
 * Cấu trúc: Mảng (Array) các object, mỗi object có 'name' và 'data'.
 * Structure: Array of objects, each with 'name' and 'data'.
 * Tên trường: Sử dụng tên trường khớp với form và hàm format (vd: rightLobeD1, rightLobeFindings).
 * Field Names: Uses field names matching the form and format function (e.g., rightLobeD1, rightLobeFindings).
 * Kích thước: Đơn vị milimét (mm).
 * Dimensions: Unit is millimeters (mm).
 * Thể tích: Không tính sẵn, để ứng dụng tự tính.
 * Volume: Not pre-calculated, let the application calculate.
 * Tổn thương: Dữ liệu chỉ nằm trong mảng 'lesions', không "flatten". Đối với các trường lựa chọn TI-RADS,
 * giá trị là chuỗi số điểm khớp với value của HTML options (vd: "0", "1", "2").
 * Lesions: Data resides only within the 'lesions' array, no flattening. For TI-RADS select fields,
 * the value is the numeric point string matching the HTML option value (e.g., "0", "1", "2").
 * Song ngữ: Định dạng "Tiếng Anh / Tiếng Việt" cho các mô tả.
 * Bilingual: Format "English / Vietnamese" for descriptions.
 */
export const thyroidPresets = [
    { // Preset 1: Normal
        name: "Normal Thyroid / Tuyến Giáp Bình Thường",
        data: {
            thyroid: {
                // General Findings / Tổng quát
                overallSize: "Normal size for age and sex / Kích thước bình thường theo tuổi và giới",
                echotexture: "Homogeneous with medium level echoes / Đồng nhất, hồi âm trung bình",
                vascularity: "Normal vascularity on Color Doppler / Tưới máu bình thường trên Doppler màu",
                // Right Lobe / Thùy Phải (mm)
                rightLobeD1: "15", rightLobeD2: "18", rightLobeD3: "45",
                rightLobeFindings: "Normal parenchyma, appears homogeneous. No cystic or solid focal lesions identified. / Mô giáp bình thường, cấu trúc đồng nhất. Không thấy tổn thương khu trú dạng nang hay đặc.",
                // Left Lobe / Thùy Trái (mm)
                leftLobeD1: "14", leftLobeD2: "17", leftLobeD3: "44",
                leftLobeFindings: "Normal parenchyma, appears homogeneous. No cystic or solid focal lesions identified. / Mô giáp bình thường, cấu trúc đồng nhất. Không thấy tổn thương khu trú dạng nang hay đặc.",
                // Isthmus / Eo giáp (mm)
                isthmusThickness: "3",
                isthmusFindings: "Normal thickness and echotexture. No nodules. / Bề dày và cấu trúc hồi âm bình thường. Không có nhân.",
                // Lesions / Tổn thương khu trú
                lesions: [], // No lesions for normal / Không có tổn thương
                // Lymph Nodes / Hạch vùng cổ
                lymphNodes: "No pathologically enlarged or suspicious cervical lymph nodes observed in accessible areas. / Không thấy hạch cổ to bệnh lý hoặc nghi ngờ ở các vùng khảo sát được.",
                // Impression / Kết luận
                impression: "Normal thyroid ultrasound examination. / Kết quả siêu âm tuyến giáp bình thường."
                // recommendation field can be added if needed
            }
        }
    }, // End of Normal Preset (don't forget comma)
    { // Preset 2: Hashimoto
        name: "Hashimoto's Thyroiditis / Viêm Giáp Hashimoto",
        data: {
            thyroid: {
                // General Findings / Tổng quát
                overallSize: "Mildly enlarged / To nhẹ",
                echotexture: "Diffusely heterogeneous, coarsened, with micronodulation pattern (multiple ill-defined hypoechoic areas < 5mm). Fibrous septations may be present. / Không đồng nhất lan tỏa, cấu trúc thô, dạng vi hạt (nhiều vùng giảm âm giới hạn không rõ < 5mm). Có thể thấy các vách xơ.",
                vascularity: "Variable, often normal or increased in early stages, can be decreased later. / Thay đổi, thường bình thường hoặc tăng ở giai đoạn sớm, có thể giảm ở giai đoạn sau.",
                // Right Lobe / Thùy Phải (mm) - Example typical dimensions
                rightLobeD1: "18", rightLobeD2: "20", rightLobeD3: "50",
                rightLobeFindings: "Parenchyma shows diffuse heterogeneous and hypoechoic changes as described above. No discrete suspicious nodule identified. / Mô giáp thay đổi cấu trúc không đồng nhất và giảm âm lan tỏa như mô tả ở trên. Không thấy nhân nghi ngờ khu trú.",
                // Left Lobe / Thùy Trái (mm) - Example typical dimensions
                leftLobeD1: "17", leftLobeD2: "19", leftLobeD3: "48",
                leftLobeFindings: "Parenchyma shows diffuse heterogeneous and hypoechoic changes as described above. No discrete suspicious nodule identified. / Mô giáp thay đổi cấu trúc không đồng nhất và giảm âm lan tỏa như mô tả ở trên. Không thấy nhân nghi ngờ khu trú.",
                // Isthmus / Eo giáp (mm) - Example
                isthmusThickness: "5",
                isthmusFindings: "Thickened and heterogeneous, similar to lobes. / Dày và không đồng nhất, tương tự hai thùy.",
                // Lesions / Tổn thương khu trú
                lesions: [], // Assess any dominant/suspicious nodules separately if present
                // Lymph Nodes / Hạch vùng cổ
                lymphNodes: "May show few small, oval, reactive-appearing lymph nodes in level VI or lateral compartments. / Có thể thấy vài hạch cổ nhỏ, hình bầu dục, dạng phản ứng ở nhóm VI hoặc các nhóm bên.",
                // Impression / Kết luận
                impression: "Findings are consistent with chronic lymphocytic (Hashimoto's) thyroiditis. If any discrete nodules are present, they should be evaluated separately according to ACR TI-RADS criteria. / Hình ảnh phù hợp với bệnh cảnh viêm giáp mãn tính tự miễn (viêm giáp Hashimoto). Nếu có nhân giáp khu trú, cần đánh giá riêng theo tiêu chuẩn ACR TI-RADS."
            }
        }
    }, // End of Hashimoto Preset (don't forget comma)
    { // Preset 3: Graves
        name: "Graves' Disease / Bệnh Basedow (Graves)",
        data: {
            thyroid: {
                // General Findings / Tổng quát
                overallSize: "Moderately to markedly enlarged, often symmetrically. / To vừa đến nhiều, thường đối xứng.",
                echotexture: "Diffusely hypoechoic and relatively homogeneous (compared to Hashimoto's). May appear 'spongy'. / Giảm âm lan tỏa và tương đối đồng nhất (so với Hashimoto). Có thể có dạng 'xốp'.",
                vascularity: "Markedly increased parenchymal vascularity ('Thyroid Inferno') on Color Doppler, with high velocity flow on spectral Doppler (if performed). / Tăng tưới máu nhu mô rõ rệt ('dấu hiệu địa ngục') trên Doppler màu, với dòng chảy vận tốc cao trên Doppler phổ (nếu thực hiện).",
                // Right Lobe / Thùy Phải (mm) - Example typical dimensions
                rightLobeD1: "22", rightLobeD2: "25", rightLobeD3: "55",
                rightLobeFindings: "Enlarged lobe, diffusely hypoechoic parenchyma with marked hypervascularity. No discrete suspicious nodule seen. / Thùy to, mô giáp giảm âm lan tỏa với tăng tưới máu rõ rệt. Không thấy nhân nghi ngờ khu trú.",
                // Left Lobe / Thùy Trái (mm) - Example typical dimensions
                leftLobeD1: "21", leftLobeD2: "24", leftLobeD3: "53",
                leftLobeFindings: "Enlarged lobe, diffusely hypoechoic parenchyma with marked hypervascularity. No discrete suspicious nodule seen. / Thùy to, mô giáp giảm âm lan tỏa với tăng tưới máu rõ rệt. Không thấy nhân nghi ngờ khu trú.",
                // Isthmus / Eo giáp (mm) - Example
                isthmusThickness: "6",
                isthmusFindings: "Enlarged, hypoechoic and hypervascular, similar to lobes. / To, giảm âm và tăng tưới máu, tương tự hai thùy.",
                // Lesions / Tổn thương khu trú
                lesions: [], // Nodules can co-exist but are not the primary feature
                // Lymph Nodes / Hạch vùng cổ
                lymphNodes: "Usually no suspicious lymphadenopathy. May see minimal reactive nodes. / Thường không thấy hạch cổ bệnh lý. Có thể thấy ít hạch viêm phản ứng.",
                // Impression / Kết luận
                impression: "Findings are highly suggestive of Graves' disease (diffuse enlargement, hypoechogenicity, marked hypervascularity). Clinical and laboratory correlation (TSH, FT4, T3, TRAb) is recommended. / Hình ảnh rất gợi ý bệnh Graves (tuyến giáp to lan tỏa, giảm âm, tăng tưới máu rất nhiều). Đề nghị kết hợp lâm sàng và xét nghiệm (TSH, FT4, T3, TRAb)."
            }
        }
    }, // End of Graves Preset (don't forget comma)
    { // Preset 4: MNG (with corrected lesion values)
        name: "Multinodular Goiter (MNG) / Bướu giáp đa nhân",
        data: {
            thyroid: {
                // General Findings / Tổng quát
                overallSize: "Enlarged, often asymmetric / To, thường không đối xứng",
                echotexture: "Heterogeneous background parenchyma, sometimes with underlying chronic thyroiditis features. May show coarse echotexture, fibrosis, or background calcifications. / Cấu trúc nền không đồng nhất, đôi khi có đặc điểm viêm giáp mạn tính kèm theo. Có thể thấy cấu trúc thô, xơ hóa, hoặc vôi hóa nền.",
                vascularity: "Variable, often normal or slightly increased within nodules or background. / Thay đổi, thường bình thường hoặc tăng nhẹ trong các nhân hoặc nhu mô nền.",
                // Right Lobe / Thùy Phải (mm) - Example enlarged dimensions
                rightLobeD1: "25", rightLobeD2: "28", rightLobeD3: "60",
                rightLobeFindings: "Enlarged lobe with heterogeneous background and multiple nodules (described below). / Thùy to, cấu trúc nền không đồng nhất và chứa nhiều nhân (mô tả bên dưới).",
                // Left Lobe / Thùy Trái (mm) - Example enlarged dimensions
                leftLobeD1: "24", leftLobeD2: "26", leftLobeD3: "58",
                leftLobeFindings: "Enlarged lobe with heterogeneous background and multiple nodules (described below). / Thùy to, cấu trúc nền không đồng nhất và chứa nhiều nhân (mô tả bên dưới).",
                // Isthmus / Eo giáp (mm) - Example
                isthmusThickness: "7",
                isthmusFindings: "Thickened, heterogeneous, may contain nodules. / Dày, không đồng nhất, có thể chứa nhân.",

                // Lesions / Tổn thương khu trú - Using numeric string point values matching HTML option values
                lesions: [
                    { // Lesion 1: Larger, Mixed, Benign-appearing
                        lesionLocation: "Right Lobe - Mid-portion / Thùy Phải - Phần giữa", // Location usually text
                        lesionD1: "22", lesionD2: "18", lesionD3: "25", // mm
                        lesionComposition: "1", // "Mixed cystic and solid" -> value="1"
                        lesionEchogenicity: "1", // "Isoechoic" -> value="1"
                        lesionShape: "0", // "Wider-than-tall" -> value="0"
                        lesionMargin: "0", // "Smooth" -> value="0"
                        lesionEchogenicFoci: ["1"], // "Macrocalcifications" & "Peripheral" -> both likely value="1"
                        tiradsScore: "3", // Example calculated score
                        tiradsCategory: "TR3 / Nghi ngờ thấp",
                        tiradsRecommendation: "FNA if ≥ 25 mm, Follow-up if 15-24 mm / FNA nếu ≥ 25 mm, Theo dõi nếu 15-24 mm",
                        lesionDescription: "A relatively large, well-defined nodule (25mm max dimension) located in the mid-right lobe. Composition: Mixed cystic and solid. Echogenicity (solid): Isoechoic. Shape: Wider-than-tall. Margin: Smooth. Echogenic Foci: Macrocalcifications and incomplete peripheral calcification. No other suspicious features identified. ACR TI-RADS Score: 3 (TR3). / Một nhân tương đối lớn, giới hạn rõ (kích thước lớn nhất 25mm) ở giữa thùy phải. Thành phần: Hỗn hợp nang và đặc. Hồi âm (phần đặc): Đồng âm. Hình dạng: Rộng hơn cao. Bờ: Đều. Hồi âm dày: Vôi hóa thô và vôi hóa viền không liên tục. Không thấy đặc điểm nghi ngờ nào khác. Điểm ACR TI-RADS: 3 (TR3)."
                    },
                    { // Lesion 2: Small, Spongiform
                        lesionLocation: "Left Lobe - Lower pole / Thùy Trái - Cực dưới",
                        lesionD1: "8", lesionD2: "5", lesionD3: "7", // mm
                        lesionComposition: "0", // "Spongiform" -> value="0"
                        lesionEchogenicity: "", // N/A
                        lesionShape: "0", // "Wider-than-tall" -> value="0"
                        lesionMargin: "0", // "Smooth" -> value="0"
                        lesionEchogenicFoci: ["0"], // "None or Large comet-tail" -> value="0"
                        tiradsScore: "0",
                        tiradsCategory: "TR1 / Lành tính",
                        tiradsRecommendation: "No FNA / Không FNA",
                        lesionDescription: "Small nodule (8mm) at the left lower pole. Composition: Spongiform (classic appearance of aggregated microcysts). Shape: Wider-than-tall. Margin: Smooth. ACR TI-RADS Score: 0 (TR1). / Nhân nhỏ (8mm) ở cực dưới thùy trái. Thành phần: Dạng bọt biển (hình ảnh điển hình các vi nang kết tụ). Hình dạng: Rộng hơn cao. Bờ: Đều. Điểm ACR TI-RADS: 0 (TR1)."
                    },
                    { // Lesion 3: Solid, Isoechoic, needs follow-up
                        lesionLocation: "Isthmus / Eo giáp",
                        lesionD1: "16", lesionD2: "14", lesionD3: "15", // mm
                        lesionComposition: "2", // "Solid" -> value="2"
                        lesionEchogenicity: "1", // "Isoechoic" -> value="1"
                        lesionShape: "0", // "Wider-than-tall" -> value="0"
                        lesionMargin: "0", // "Smooth" -> value="0"
                        lesionEchogenicFoci: ["0"], // "None" -> value="0"
                        tiradsScore: "3",
                        tiradsCategory: "TR3 / Nghi ngờ thấp",
                        tiradsRecommendation: "FNA if ≥ 25 mm, Follow-up if 15-24 mm / FNA nếu ≥ 25 mm, Theo dõi nếu 15-24 mm",
                        lesionDescription: "Solid nodule measuring 16mm in the isthmus. Echogenicity: Isoechoic. Shape: Round/Oval (Wider-than-tall). Margin: Smooth. No calcifications or other suspicious features are seen. ACR TI-RADS Score: 3 (TR3). Requires follow-up based on size (15-24 mm range). / Nhân đặc kích thước 16mm ở eo giáp. Hồi âm: Đồng âm. Hình dạng: Tròn/Bầu dục (Rộng hơn cao). Bờ: Đều. Không thấy vôi hóa hay đặc điểm nghi ngờ khác. Điểm ACR TI-RADS: 3 (TR3). Cần theo dõi dựa trên kích thước (trong khoảng 15-24 mm)."
                    }
                ], // End of lesions array

                // Lymph Nodes / Hạch vùng cổ
                lymphNodes: "Multiple small, oval lymph nodes with preserved fatty hila seen bilaterally, likely reactive. No pathologically enlarged or suspicious nodes identified. / Thấy nhiều hạch cổ nhỏ, hình bầu dục, còn rốn hạch mỡ ở hai bên, nghĩ nhiều là hạch viêm phản ứng. Không thấy hạch to bệnh lý hoặc nghi ngờ.",
                // Impression / Kết luận
                impression: "Multinodular goiter (MNG) with diffuse thyroid enlargement and multiple nodules of varying appearances as described. Dominant/relevant nodules assessed by ACR TI-RADS (largest TR3, another TR1). No features highly suspicious for malignancy identified in the described nodules. / Bướu giáp đa nhân (MNG) với tuyến giáp to lan tỏa và nhiều nhân có hình thái khác nhau như mô tả. Các nhân trội/liên quan được đánh giá theo ACR TI-RADS (lớn nhất TR3, nhân khác TR1). Không thấy đặc điểm nghi ngờ cao ác tính ở các nhân đã mô tả.",
                // Recommendation / Đề nghị
                recommendation: "Management based on ACR TI-RADS score and size criteria for the most significant nodule(s). Recommend follow-up ultrasound in approx. 12-24 months to assess stability, or sooner if clinically indicated. / Xử trí dựa trên điểm ACR TI-RADS và tiêu chuẩn kích thước cho (các) nhân đáng kể nhất. Đề nghị siêu âm theo dõi trong khoảng 12-24 tháng để đánh giá sự ổn định, hoặc sớm hơn nếu có chỉ định lâm sàng."
            }
        }
    }, // End of MNG Preset (this should be the last one for now)

    // Preset for Benign Colloid Cyst - Add this object to the thyroidPresets array
// Mẫu cho Nang Keo Lành Tính - Thêm object này vào mảng thyroidPresets

{
    name: "Benign Colloid Cyst / Nang keo lành tính",
    data: {
        thyroid: {
            // General Findings / Tổng quát - Assuming normal background / Giả sử nền giáp bình thường
            overallSize: "Normal size / Kích thước bình thường",
            echotexture: "Homogeneous / Đồng nhất",
            vascularity: "Normal / Bình thường",

            // Right Lobe / Thùy Phải (mm) - Normal example
            rightLobeD1: "15", rightLobeD2: "18", rightLobeD3: "45",
            rightLobeFindings: "Normal parenchyma. Single lesion described below. / Mô giáp bình thường. Có một tổn thương mô tả bên dưới.",

            // Left Lobe / Thùy Trái (mm) - Normal example
            leftLobeD1: "14", leftLobeD2: "17", leftLobeD3: "44",
            leftLobeFindings: "Normal parenchyma. No focal lesions. / Mô giáp bình thường. Không có tổn thương khu trú.",

            // Isthmus / Eo giáp (mm) - Normal example
            isthmusThickness: "3",
            isthmusFindings: "Normal thickness and echotexture. / Bề dày và cấu trúc hồi âm bình thường.",

            // Lesions / Tổn thương khu trú - One typical colloid cyst / Một nang keo điển hình
            lesions: [
                { // Lesion 1: Colloid Cyst
                    lesionLocation: "Right Lobe - Lower pole / Thùy Phải - Cực dưới", // Example location
                    lesionD1: "12", // Width / Ngang (mm)
                    lesionD2: "9",  // AP / Trước-Sau (mm)
                    lesionD3: "8",  // Length / Dọc (mm)
                    // --- Use numeric point values (as strings) matching HTML option values ---
                    lesionComposition: "0", // value="0" for "Cystic or almost completely cystic"
                    lesionEchogenicity: "0", // value="0" for "Anechoic"
                    lesionShape: "0", // value="0" for "Wider-than-tall"
                    lesionMargin: "0", // value="0" for "Smooth or Ill-defined"
                    lesionEchogenicFoci: ["0"], // value="0" for "None or Large comet-tail". Presence of comet-tail artifact itself confirms benignity (TR1).
                    // --- TIRADS results ---
                    tiradsScore: "0", // Score is 0 for cystic/spongiform regardless of other features if classic benign
                    tiradsCategory: "TR1 / Lành tính",
                    tiradsRecommendation: "No FNA / Không FNA",
                    // --- Detailed Description ---
                    lesionDescription: "Well-defined, purely cystic (anechoic) nodule measuring 12x9x8 mm, located in the right lower pole. Contains classic echogenic foci demonstrating distinct comet-tail artifacts, confirming benign colloid content. No solid components, septations, or suspicious features identified. ACR TI-RADS Score: 0 (TR1). / Nhân giới hạn rõ, hoàn toàn dạng nang (trống âm), kích thước 12x9x8 mm, ở cực dưới thùy phải. Bên trong có các đốm hồi âm dày điển hình tạo ảnh giả đuôi sao chổi rõ rệt, xác nhận bản chất keo lành tính. Không có thành phần đặc, không vách ngăn, không có đặc điểm nghi ngờ nào khác. Điểm ACR TI-RADS: 0 (TR1)."
                }
            ],

            // Lymph Nodes / Hạch vùng cổ
            lymphNodes: "No suspicious cervical lymph nodes identified. / Không thấy hạch cổ bệnh lý nghi ngờ.",

            // Impression / Kết luận
            impression: "Single benign colloid cyst (TR1) with characteristic comet-tail artifacts in the right lower pole. The remainder of the thyroid gland is unremarkable. / Một nang keo lành tính (TR1) với dấu hiệu đuôi sao chổi đặc trưng ở cực dưới thùy phải. Phần còn lại của tuyến giáp không ghi nhận bất thường.",

            // Recommendation / Đề nghị (optional)
            recommendation: "No specific follow-up required for this benign lesion. / Không cần theo dõi đặc biệt cho tổn thương lành tính này."
        }
    }
},
// Preset for Suspicious Nodule (e.g., Papillary Thyroid Cancer - PTC)
// Mẫu cho Nhân Nghi Ngờ (ví dụ: Ung thư Tuyến Giáp Dạng Nhú - PTC)
// Add this object to the thyroidPresets array / Thêm object này vào mảng thyroidPresets

{
    name: "Suspicious Nodule (e.g., PTC) / Nhân nghi ngờ (ví dụ: K giáp dạng nhú)",
    data: {
        thyroid: {
            // General Findings / Tổng quát - Assuming normal background / Giả sử nền giáp bình thường
            overallSize: "Normal size / Kích thước bình thường",
            echotexture: "Homogeneous / Đồng nhất",
            vascularity: "Normal background vascularity / Tưới máu nền bình thường",

            // Right Lobe / Thùy Phải (mm) - Normal example
            rightLobeD1: "15", rightLobeD2: "18", rightLobeD3: "45",
            rightLobeFindings: "Normal parenchyma. No focal lesions. / Mô giáp bình thường. Không có tổn thương khu trú.",

            // Left Lobe / Thùy Trái (mm) - Normal example
            leftLobeD1: "14", leftLobeD2: "17", leftLobeD3: "44",
            leftLobeFindings: "Normal parenchyma. Contains one suspicious nodule described below. / Mô giáp bình thường. Chứa một nhân nghi ngờ mô tả bên dưới.",

            // Isthmus / Eo giáp (mm) - Normal example
            isthmusThickness: "3",
            isthmusFindings: "Normal thickness and echotexture. / Bề dày và cấu trúc hồi âm bình thường.",

            // Lesions / Tổn thương khu trú - One suspicious nodule / Một nhân nghi ngờ
            lesions: [
                { // Lesion 1: Suspicious Nodule (PTC Example)
                    lesionLocation: "Left Lobe - Mid / Thùy Trái - Giữa", // Example location
                    lesionD1: "8",  // Width / Ngang (mm)
                    lesionD2: "13", // AP / Trước-Sau (mm) - Taller than wide
                    lesionD3: "11", // Length / Dọc (mm)
                    // --- Use numeric point values (as strings) matching HTML option values ---
                    lesionComposition: "2", // value="2" for "Solid or almost completely solid"
                    lesionEchogenicity: "3", // value="3" for "Very hypoechoic"
                    lesionShape: "3", // value="3" for "Taller-than-wide"
                    lesionMargin: "2", // value="2" for "Lobulated or Irregular" (Using Irregular)
                    lesionEchogenicFoci: ["2"], // value="2" for "Punctate echogenic foci (PEF)"
                    // --- TIRADS results ---
                    // Calculated Score: Comp(2)+Echo(3)+Shape(3)+Margin(2)+Foci(3) = 13 points -> TR5
                    tiradsScore: "13",
                    tiradsCategory: "TR5 / Rất nghi ngờ",
                    tiradsRecommendation: "FNA recommended / Đề nghị FNA", // >= 10mm (using max dimension 13mm) and TR5
                    // --- Detailed Description ---
                    lesionDescription: "Located in the mid-left lobe, there is a solid nodule measuring 8x13x11 mm. It demonstrates significant hypoechogenicity (very hypoechoic) compared to the strap muscle. The shape is taller-than-wide. The margins are irregular. Numerous punctate echogenic foci (microcalcifications) are seen throughout the nodule. No cystic changes or macrocalcifications observed. These features (solid, very hypoechoic, taller-than-wide, irregular margins, microcalcifications) are highly suspicious for malignancy. ACR TI-RADS Score: 13 (TR5). / Ở giữa thùy trái có một nhân đặc, kích thước 8x13x11 mm. Nhân giảm âm rất rõ (so với cơ cạnh giáp). Hình dạng cao hơn rộng. Đường bờ không đều. Quan sát thấy nhiều đốm hồi âm dày dạng chấm (vi vôi hóa) khắp nhân. Không thấy thoái hóa nang hay vôi hóa thô. Các đặc điểm này (đặc, rất giảm âm, cao hơn rộng, bờ không đều, vi vôi hóa) là rất nghi ngờ ác tính. Điểm ACR TI-RADS: 13 (TR5)."
                }
            ],

            // Lymph Nodes / Hạch vùng cổ
            lymphNodes: "Careful evaluation for suspicious cervical lymph nodes (e.g., rounded shape, cystic changes, calcifications, loss of fatty hilum) is recommended. No definitively abnormal nodes seen in this example scan. / Đề nghị đánh giá kỹ các hạch cổ để tìm đặc điểm nghi ngờ (ví dụ: hình tròn, thoái hóa nang, vôi hóa, mất rốn hạch mỡ). Chưa thấy hạch bệnh lý rõ ràng trong lần siêu âm ví dụ này.",

            // Impression / Kết luận
            impression: "Single highly suspicious nodule (ACR TI-RADS 5) identified in the left lobe, concerning for malignancy, such as papillary thyroid carcinoma. / Ghi nhận một nhân rất nghi ngờ (ACR TI-RADS 5) ở thùy trái, nghĩ nhiều đến bệnh lý ác tính, ví dụ ung thư tuyến giáp dạng nhú.",

            // Recommendation / Đề nghị
            recommendation: "Fine Needle Aspiration (FNA) of the described left lobe nodule is recommended for cytological diagnosis. Comprehensive evaluation of cervical lymph node compartments is advised. / Đề nghị chọc hút tế bào bằng kim nhỏ (FNA) nhân thùy trái đã mô tả để chẩn đoán tế bào học. Khuyến cáo đánh giá toàn diện các khoang hạch cổ."
        }
    }
},
// Preset for Follicular Neoplasm Pattern
// Mẫu cho Hình ảnh dạng U tuyến nang
// Add this object to the thyroidPresets array / Thêm object này vào mảng thyroidPresets

{
    name: "Follicular Neoplasm Pattern / Hình ảnh dạng U tuyến nang",
    data: {
        thyroid: {
            // General Findings / Tổng quát - Assuming normal background / Giả sử nền giáp bình thường
            overallSize: "Normal size / Kích thước bình thường",
            echotexture: "Homogeneous / Đồng nhất",
            vascularity: "Normal background vascularity / Tưới máu nền bình thường",

            // Right Lobe / Thùy Phải (mm) - Normal example
            rightLobeD1: "16", rightLobeD2: "19", rightLobeD3: "46",
            rightLobeFindings: "Normal parenchyma. Contains one indeterminate nodule described below. / Mô giáp bình thường. Chứa một nhân không xác định mô tả bên dưới.",

            // Left Lobe / Thùy Trái (mm) - Normal example
            leftLobeD1: "15", leftLobeD2: "18", leftLobeD3: "45",
            leftLobeFindings: "Normal parenchyma. No focal lesions. / Mô giáp bình thường. Không có tổn thương khu trú.",

            // Isthmus / Eo giáp (mm) - Normal example
            isthmusThickness: "3",
            isthmusFindings: "Normal thickness and echotexture. / Bề dày và cấu trúc hồi âm bình thường.",

            // Lesions / Tổn thương khu trú - One follicular pattern nodule / Một nhân dạng nang
            lesions: [
                { // Lesion 1: Follicular Neoplasm Pattern Example
                    lesionLocation: "Right Lobe - Upper pole / Thùy Phải - Cực trên", // Example location
                    lesionD1: "20", // Width / Ngang (mm)
                    lesionD2: "18", // AP / Trước-Sau (mm)
                    lesionD3: "25", // Length / Dọc (mm)
                    // --- Use numeric point values (as strings) matching HTML option values ---
                    lesionComposition: "2", // value="2" for "Solid or almost completely solid"
                    lesionEchogenicity: "1", // value="1" for "Hyperechoic or Isoechoic" (Let's use Isoechoic)
                    lesionShape: "0", // value="0" for "Wider-than-tall" (Often round/oval)
                    lesionMargin: "0", // value="0" for "Smooth or Ill-defined" (Often appears smooth)
                    lesionEchogenicFoci: ["0"], // value="0" for "None or Large comet-tail" (Usually no suspicious foci)
                    // --- TIRADS results ---
                    // Calculated Score: Comp(2)+Echo(1)+Shape(0)+Margin(0)+Foci(0) = 3 points -> TR3
                    tiradsScore: "3",
                    tiradsCategory: "TR3 / Nghi ngờ thấp",
                    // Recommendation depends on size and local practice for indeterminate nodules
                    tiradsRecommendation: "FNA recommended (size ≥ 15-20mm often threshold) / Đề nghị FNA (kích thước ≥ 15-20mm thường là ngưỡng)", // Example, size 25mm fits
                    // --- Detailed Description ---
                    lesionDescription: "Located in the right upper pole, there is a solid nodule measuring 20x18x25 mm. It is isoechoic compared to the thyroid parenchyma. The shape is roughly oval (wider-than-tall) and margins are smooth, possibly indicating encapsulation (halo sign may be present but is non-specific). No microcalcifications or other highly suspicious features are identified. While lacking definitive malignant signs, the solid nature makes it indeterminate. Appearance is consistent with a follicular neoplasm pattern. ACR TI-RADS Score: 3 (TR3). FNA is typically considered for indeterminate nodules of this size. / Ở cực trên thùy phải có một nhân đặc, kích thước 20x18x25 mm. Nhân đồng âm so với mô giáp. Hình dạng tương đối bầu dục (rộng hơn cao) và bờ đều, có thể gợi ý có vỏ bao (dấu hiệu halo có thể có nhưng không đặc hiệu). Không thấy vi vôi hóa hay các đặc điểm nghi ngờ cao khác. Mặc dù thiếu dấu hiệu ác tính rõ ràng, bản chất đặc làm cho nhân không xác định được. Hình ảnh phù hợp với dạng u tuyến nang. Điểm ACR TI-RADS: 3 (TR3). FNA thường được cân nhắc cho các nhân không xác định có kích thước này."
                }
            ],

            // Lymph Nodes / Hạch vùng cổ
            lymphNodes: "No suspicious cervical lymph nodes identified. / Không thấy hạch cổ bệnh lý nghi ngờ.",

            // Impression / Kết luận
            impression: "Indeterminate solid nodule (ACR TI-RADS 3) in the right upper pole with features suggestive of a follicular neoplasm pattern. Ultrasound cannot reliably differentiate follicular adenoma (benign) from follicular carcinoma (malignant). / Nhân đặc không xác định (ACR TI-RADS 3) ở cực trên thùy phải với các đặc điểm gợi ý hình ảnh dạng u tuyến nang. Siêu âm không thể phân biệt chắc chắn u tuyến nang lành tính (adenoma) và ung thư (carcinoma).",

            // Recommendation / Đề nghị
            recommendation: "Fine Needle Aspiration (FNA) is recommended for cytological evaluation given the indeterminate nature and size of the nodule. / Chọc hút tế bào bằng kim nhỏ (FNA) được đề nghị để đánh giá tế bào học do bản chất không xác định và kích thước của nhân."
        }
    }
},
// Preset for Subacute Thyroiditis (De Quervain's)
// Mẫu cho Viêm giáp bán cấp (De Quervain's)
// Add this object to the thyroidPresets array / Thêm object này vào mảng thyroidPresets

{
    name: "Subacute Thyroiditis (De Quervain's) / Viêm giáp bán cấp (De Quervain's)",
    data: {
        thyroid: {
            // General Findings / Tổng quát - Often involves part of the gland initially
            overallSize: "Normal or Mildly Enlarged, may be asymmetric / Kích thước bình thường hoặc to nhẹ, có thể không đối xứng",
            // Echotexture shows characteristic inflammatory areas
            echotexture: "Focal or diffuse ill-defined, hypoechoic area(s) within the parenchyma / (Các) vùng giảm âm giới hạn không rõ, khu trú hoặc lan tỏa trong nhu mô",
            // Vascularity is key for diagnosis
            vascularity: "Markedly decreased or absent vascularity ('cold' area) within the affected hypoechoic region(s) on Color Doppler / Giảm rõ rệt hoặc không có tưới máu (vùng 'lạnh') trong (các) vùng giảm âm bị ảnh hưởng trên Doppler màu",

            // Example: Right lobe affected, Left lobe less so / Ví dụ: Thùy phải bị ảnh hưởng, thùy trái ít hơn
            // Right Lobe / Thùy Phải (mm)
            rightLobeD1: "19", // Example - slightly enlarged/swollen
            rightLobeD2: "21",
            rightLobeD3: "52",
            rightLobeFindings: "Contains large, ill-defined hypoechoic area involving the mid and upper pole, demonstrating significantly reduced vascularity. No discrete nodule identified within this area. Correlate with clinical tenderness. / Chứa vùng giảm âm lớn, giới hạn không rõ ở phần giữa và cực trên, cho thấy tưới máu giảm đáng kể. Không thấy nhân khu trú trong vùng này. Kết hợp với dấu hiệu đau lâm sàng.",

            // Left Lobe / Thùy Trái (mm) - Example less affected/normal
            leftLobeD1: "15",
            leftLobeD2: "18",
            leftLobeD3: "45",
            leftLobeFindings: "Appears relatively normal in size and echotexture, with normal vascularity. / Có vẻ bình thường về kích thước, cấu trúc âm và tưới máu.",

            // Isthmus / Eo giáp (mm) - Example normal
            isthmusThickness: "4",
            isthmusFindings: "Normal appearance. / Hình thái bình thường.",

            // Lesions / Tổn thương khu trú - Typically none in classic subacute thyroiditis
            lesions: [], // Should be empty / Nên để trống

            // Lymph Nodes / Hạch vùng cổ
            lymphNodes: "May show mildly enlarged, elongated, reactive-appearing cervical lymph nodes. No clearly suspicious nodes. / Có thể thấy vài hạch cổ hơi lớn, hình dài, dạng phản ứng. Không có hạch nghi ngờ rõ ràng.",

            // Impression / Kết luận
            impression: "Findings are highly suggestive of subacute (granulomatous / De Quervain's) thyroiditis, predominantly affecting the right lobe as described (ill-defined hypoechoic areas with markedly decreased vascularity). Clinical correlation (neck pain, fever, inflammatory markers like ESR/CRP, thyroid function tests) is essential. / Hình ảnh rất gợi ý viêm giáp bán cấp (viêm giáp u hạt / De Quervain's), chủ yếu ảnh hưởng thùy phải như mô tả (vùng giảm âm giới hạn không rõ, tưới máu giảm rõ rệt). Kết hợp lâm sàng (đau cổ, sốt, chỉ số viêm như ESR/CRP, xét nghiệm chức năng giáp) là cần thiết.",

            // Recommendation / Đề nghị
            recommendation: "Usually self-limiting or medically managed (NSAIDs/steroids). Ultrasound follow-up in several weeks to months can be performed to monitor resolution of inflammatory changes. / Thường tự giới hạn hoặc điều trị nội khoa (NSAID/steroid). Siêu âm theo dõi sau vài tuần đến vài tháng có thể được thực hiện để đánh giá sự hồi phục của các thay đổi viêm."
        }
    }
},
// Preset for Simple Thyroid Cyst
// Mẫu cho Nang giáp đơn thuần
{
    name: "Simple Thyroid Cyst / Nang giáp đơn thuần",
    data: {
        thyroid: {
            // General Findings - Assuming normal background
            overallSize: "Normal size / Kích thước bình thường",
            echotexture: "Homogeneous / Đồng nhất",
            vascularity: "Normal / Bình thường",

            // Lobes & Isthmus (mm) - Normal examples
            rightLobeD1: "15", rightLobeD2: "18", rightLobeD3: "45",
            rightLobeFindings: "Normal parenchyma. / Mô giáp bình thường.",
            leftLobeD1: "14", leftLobeD2: "17", leftLobeD3: "44",
            leftLobeFindings: "Normal parenchyma. Contains one simple cyst described below. / Mô giáp bình thường. Chứa một nang đơn thuần mô tả bên dưới.",
            isthmusThickness: "3",
            isthmusFindings: "Normal appearance. / Hình thái bình thường.",

            // Lesions - One simple cyst
            lesions: [
                { // Lesion 1: Simple Cyst
                    lesionLocation: "Left Lobe - Mid / Thùy Trái - Giữa", // Example location
                    lesionD1: "10", // Width (mm)
                    lesionD2: "8",  // AP (mm)
                    lesionD3: "7",  // Length (mm)
                    // --- Use numeric point values (as strings) ---
                    lesionComposition: "0", // value="0" for "Cystic..."
                    lesionEchogenicity: "0", // value="0" for "Anechoic"
                    lesionShape: "0", // value="0" for "Wider-than-tall"
                    lesionMargin: "0", // value="0" for "Smooth..."
                    lesionEchogenicFoci: ["0"], // value="0" for "None..."
                    // --- TIRADS results ---
                    tiradsScore: "0",
                    tiradsCategory: "TR1 / Lành tính",
                    tiradsRecommendation: "No FNA / Không FNA",
                    // --- Detailed Description ---
                    lesionDescription: "Well-defined, purely cystic lesion measuring 10x8x7 mm in the mid-left lobe. It is completely anechoic with posterior acoustic enhancement and thin, smooth walls. No septations, solid components, internal vascularity, or suspicious features identified. Classic appearance of a simple cyst. ACR TI-RADS Score: 0 (TR1). / Tổn thương giới hạn rõ, hoàn toàn dạng nang ở giữa thùy trái, kích thước 10x8x7 mm. Hoàn toàn trống âm, có tăng âm phía sau, thành mỏng và đều. Không thấy vách ngăn, thành phần đặc, tưới máu bên trong hay đặc điểm nghi ngờ nào khác. Hình ảnh điển hình của nang đơn thuần. Điểm ACR TI-RADS: 0 (TR1)."
                }
            ],

            // Lymph Nodes
            lymphNodes: "No suspicious cervical lymph nodes. / Không thấy hạch cổ bệnh lý.",

            // Impression
            impression: "Single simple cyst (TR1) in the left lobe. Remainder of the thyroid gland is unremarkable. / Một nang đơn thuần (TR1) ở thùy trái. Phần còn lại của tuyến giáp không có bất thường.",

            // Recommendation
            recommendation: "No follow-up required for this simple cyst. / Không cần theo dõi đối với nang đơn thuần này."
        }
    }
}, // <-- Nhớ thêm dấu phẩy nếu có thêm preset sau đây
// Preset for Spongiform Nodule
// Mẫu cho Nhân giáp dạng bọt biển
{
    name: "Spongiform Nodule / Nhân giáp dạng bọt biển",
    data: {
        thyroid: {
            // General Findings - Assuming normal background
            overallSize: "Normal size / Kích thước bình thường",
            echotexture: "Homogeneous / Đồng nhất",
            vascularity: "Normal / Bình thường",

            // Lobes & Isthmus (mm) - Normal examples
            rightLobeD1: "16", rightLobeD2: "17", rightLobeD3: "47",
            rightLobeFindings: "Normal parenchyma. Contains one spongiform nodule described below. / Mô giáp bình thường. Chứa một nhân dạng bọt biển mô tả bên dưới.",
            leftLobeD1: "15", leftLobeD2: "18", leftLobeD3: "46",
            leftLobeFindings: "Normal parenchyma. No focal lesions. / Mô giáp bình thường. Không có tổn thương khu trú.",
            isthmusThickness: "4",
            isthmusFindings: "Normal appearance. / Hình thái bình thường.",

            // Lesions - One spongiform nodule
            lesions: [
                { // Lesion 1: Spongiform Nodule
                    lesionLocation: "Right Lobe - Isthmus Junction / Thùy Phải - Vị trí nối Eo giáp", // Example location
                    lesionD1: "14", // Width (mm)
                    lesionD2: "11", // AP (mm)
                    lesionD3: "10", // Length (mm)
                    // --- Use numeric point values (as strings) ---
                    lesionComposition: "0", // value="0" for "Spongiform"
                    lesionEchogenicity: "", // N/A - Not scored when spongiform
                    lesionShape: "0", // value="0" for "Wider-than-tall" (or shape irrelevant if spongiform)
                    lesionMargin: "0", // value="0" for "Smooth or Ill-defined"
                    lesionEchogenicFoci: ["0"], // value="0" for "None..."
                    // --- TIRADS results ---
                    tiradsScore: "0", // Spongiform morphology automatically assigns 0 points
                    tiradsCategory: "TR1 / Lành tính",
                    tiradsRecommendation: "No FNA / Không FNA",
                    // --- Detailed Description ---
                    lesionDescription: "Well-defined nodule measuring 14x11x10 mm, located at the junction of the right lobe and isthmus. The nodule is composed almost entirely (>50%) of aggregated microcystic spaces (<1mm), consistent with a classic spongiform appearance. No discernible solid components or suspicious features. ACR TI-RADS Score: 0 (TR1). / Nhân giới hạn rõ, kích thước 14x11x10 mm, ở vị trí nối thùy phải và eo giáp. Nhân cấu tạo gần như hoàn toàn (>50%) bởi các khoang vi nang (<1mm) kết tụ lại, phù hợp với hình ảnh dạng bọt biển điển hình. Không có thành phần đặc hay đặc điểm nghi ngờ nào có thể phân biệt được. Điểm ACR TI-RADS: 0 (TR1)."
                }
            ],

            // Lymph Nodes
            lymphNodes: "No suspicious cervical lymph nodes. / Không thấy hạch cổ bệnh lý.",

            // Impression
            impression: "Single spongiform nodule (TR1) in the right lobe/isthmus junction, a definitively benign finding. Remainder of the thyroid gland is unremarkable. / Một nhân dạng bọt biển (TR1) ở vị trí nối thùy phải/eo giáp, là một dấu hiệu lành tính chắc chắn. Phần còn lại của tuyến giáp không có bất thường.",

            // Recommendation
            recommendation: "No follow-up required for this spongiform nodule. / Không cần theo dõi đối với nhân dạng bọt biển này."
        }
    }
}, // <-- Nhớ thêm dấu phẩy nếu có thêm preset sau đây
// Preset for Simple Diffuse Goiter
// Mẫu cho Bướu giáp lan tỏa đơn thuần
{
    name: "Simple Diffuse Goiter / Bướu giáp lan tỏa đơn thuần",
    data: {
        thyroid: {
            // General Findings
            overallSize: "Diffusely enlarged, relatively symmetric / To lan tỏa, tương đối đối xứng",
            echotexture: "Homogeneous or minimally heterogeneous, without features of thyroiditis / Đồng nhất hoặc không đồng nhất rất ít, không có đặc điểm của viêm giáp",
            vascularity: "Normal or mildly increased, non-specific pattern / Bình thường hoặc tăng nhẹ, kiểu không đặc hiệu",

            // Lobes & Isthmus (mm) - Example enlarged dimensions
            rightLobeD1: "20", rightLobeD2: "22", rightLobeD3: "55",
            rightLobeFindings: "Enlarged lobe with generally preserved homogeneous echotexture. No discrete nodules identified. / Thùy to, cấu trúc âm nhìn chung đồng nhất được bảo tồn. Không thấy nhân khu trú rõ ràng.",
            leftLobeD1: "19", leftLobeD2: "21", leftLobeD3: "54",
            leftLobeFindings: "Enlarged lobe with generally preserved homogeneous echotexture. No discrete nodules identified. / Thùy to, cấu trúc âm nhìn chung đồng nhất được bảo tồn. Không thấy nhân khu trú rõ ràng.",
            isthmusThickness: "5", // Slightly thickened example
            isthmusFindings: "Mildly thickened but maintains normal echotexture. / Hơi dày nhưng giữ được cấu trúc âm bình thường.",

            // Lesions - Typically none or incidental small ones
            lesions: [], // Empty array - characteristic is diffuse enlargement without significant nodules

            // Lymph Nodes
            lymphNodes: "No suspicious cervical lymph nodes. / Không thấy hạch cổ bệnh lý.",

            // Impression
            impression: "Diffusely enlarged thyroid gland (goiter) with relatively homogeneous echotexture and normal/mildly increased vascularity. No features suggestive of autoimmune thyroiditis (Hashimoto's/Graves') or significant nodularity identified. Findings consistent with simple diffuse goiter. / Tuyến giáp to lan tỏa (bướu cổ) với cấu trúc âm tương đối đồng nhất và tưới máu bình thường/tăng nhẹ. Không thấy các đặc điểm gợi ý bệnh tuyến giáp tự miễn (Hashimoto/Graves) hay các nốt đáng kể. Hình ảnh phù hợp với bướu giáp lan tỏa đơn thuần.",

            // Recommendation
            recommendation: "Clinical correlation (TSH, symptoms of compression if any) is recommended. Follow-up interval based on clinical assessment. / Đề nghị kết hợp lâm sàng (TSH, triệu chứng chèn ép nếu có). Khoảng thời gian theo dõi dựa trên đánh giá lâm sàng."
        }
    }
} // <-- Dấu phẩy KHÔNG cần thiết nếu đây là preset cuối cùng trong mảng
]; // End of thyroidPresets array

console.log("thyroid-presets.js loaded with corrected MNG lesion values.");