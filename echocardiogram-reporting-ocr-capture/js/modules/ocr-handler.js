// js/modules/ocr-handler.js
// Module xử lý OCR hình ảnh siêu âm bằng Gemini Vision API.

// API Endpoint cho model hỗ trợ vision
// Sử dụng model flash mới nhất (có thể thay đổi nếu cần model mạnh hơn như pro)
const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=';

/**
 * Hàm làm sạch văn bản trả về từ API, loại bỏ các dấu markdown code block.
 * @param {string} responseText - Văn bản gốc từ API.
 * @returns {string} - Văn bản đã được làm sạch.
 */
function cleanApiResponse(responseText) {
    if (!responseText) return '';
    let cleanedText = responseText.trim();
    // Loại bỏ ```json ... ```
    if (cleanedText.startsWith('```json') && cleanedText.endsWith('```')) {
        cleanedText = cleanedText.substring(7, cleanedText.length - 3).trim();
    }
    // Loại bỏ ``` ... ```
    else if (cleanedText.startsWith('```') && cleanedText.endsWith('```')) {
        cleanedText = cleanedText.substring(3, cleanedText.length - 3).trim();
    }
    return cleanedText;
}

/**
 * Gọi API Gemini Vision để trích xuất thông số từ ảnh siêu âm.
 * @param {string} imageDataBase64 - Dữ liệu ảnh đã được mã hóa base64 (chỉ phần data, không có tiền tố data:image/...).
 * @param {string} mimeType - Loại MIME của ảnh (ví dụ: 'image/jpeg', 'image/png').
 * @param {string} apiKey - API Key của Gemini.
 * @param {string} promptText - Prompt hướng dẫn AI trích xuất thông tin gì và định dạng JSON mong muốn.
 * @returns {Promise<object>} - Promise trả về đối tượng JSON chứa các thông số đọc được, hoặc reject với lỗi.
 * @throws {Error} Nếu có lỗi xảy ra trong quá trình gọi API hoặc xử lý kết quả.
 */
export async function extractMeasurementsFromImage(imageDataBase64, mimeType, apiKey, promptText) {
    console.log("[OCR Handler] Starting image measurement extraction...");

    if (!imageDataBase64 || !mimeType || !apiKey || !promptText) {
        console.error("[OCR Handler] Missing required parameters for API call.");
        // Ném lỗi thay vì chỉ trả về Promise.reject để dễ dàng bắt lỗi hơn ở nơi gọi
        throw new Error("Thiếu thông tin cần thiết (ảnh, API key, hoặc prompt) để gọi API OCR.");
    }

    const url = API_ENDPOINT + apiKey;

    // Cấu trúc Request Body cho Gemini
    const requestBody = {
        contents: [{
            parts: [
                { text: promptText }, // Prompt hướng dẫn chi tiết
                {
                    inline_data: { // Dữ liệu ảnh dạng inline
                        mime_type: mimeType,
                        data: imageDataBase64
                    }
                }
            ]
        }],
        // Cấu hình generation (tùy chỉnh nếu cần)
        generationConfig: {
          temperature: 0.1, // Giảm thấp để AI bám sát việc đọc text, ít sáng tạo
          // maxOutputTokens: 1024, // Giới hạn token nếu cần
        },
        // Cấu hình safety (nên giữ mặc định hoặc điều chỉnh cẩn thận)
        // safetySettings: [ ... ]
    };

    console.log("[OCR Handler] Sending request to Gemini Vision API...");
    // console.log("[OCR Handler] Request Body (excluding image data):", { contents: [{ parts: [{ text: 'Prompt...' }] }], generationConfig: requestBody.generationConfig });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        console.log("[OCR Handler] API Response Status:", response.status);
        const responseData = await response.json();
        // console.log("[OCR Handler] Full API Response Data:", responseData);

        if (!response.ok) {
            const errorDetail = responseData?.error?.message || `Lỗi HTTP ${response.status}`;
            console.error("[OCR Handler] API Error:", errorDetail, responseData);
            throw new Error(`Yêu cầu API OCR thất bại: ${errorDetail}`);
        }

        // Kiểm tra và lấy phần text trả về
        if (responseData.candidates && responseData.candidates.length > 0 &&
            responseData.candidates[0].content && responseData.candidates[0].content.parts &&
            responseData.candidates[0].content.parts.length > 0 && responseData.candidates[0].content.parts[0].text)
        {
            const rawText = responseData.candidates[0].content.parts[0].text;
            console.log("[OCR Handler] Raw text extracted from API:", rawText);

            const cleanedText = cleanApiResponse(rawText);
            console.log("[OCR Handler] Cleaned text:", cleanedText);

            if (!cleanedText) {
                 throw new Error("API trả về nội dung rỗng sau khi làm sạch.");
            }

            // Parse JSON từ text đã làm sạch
            try {
                const jsonResult = JSON.parse(cleanedText);
                console.log("[OCR Handler] Successfully parsed JSON result:", jsonResult);
                return jsonResult; // Trả về đối tượng JSON
            } catch (parseError) {
                console.error("[OCR Handler] Error parsing cleaned text as JSON:", parseError);
                throw new Error(`Không thể phân tích kết quả JSON từ API. Nội dung đã thử parse:\n${cleanedText}`);
            }

        } else {
            // Xử lý trường hợp bị chặn hoặc không có nội dung
            let reason = "Không rõ lý do (No valid candidate/part found)";
            if (responseData.candidates && responseData.candidates[0]?.finishReason) {
                reason = responseData.candidates[0].finishReason;
            } else if (responseData.promptFeedback?.blockReason) {
                 reason = `Bị chặn - ${responseData.promptFeedback.blockReason}`;
            }
            console.error("[OCR Handler] Invalid API response structure or content missing/blocked. Reason:", reason, responseData);
            throw new Error(`Trích xuất OCR thất bại: Không nhận được nội dung hợp lệ từ API. Lý do: ${reason}`);
        }

    } catch (error) {
        console.error('[OCR Handler] Error during API call or processing:', error);
        // Ném lại lỗi để module gọi có thể xử lý
        throw error;
    }
}

/**
 * Hàm khởi tạo cho module OCR (để main.js kiểm tra).
 */
export function initOcrHandler() {
    console.log("[OCR Handler] OCR Handler Module Initialized (if loaded).");
}

// Thêm log khi file được load
console.log("ocr-handler.js loaded.");