// js/modules/report-translator.js
// Module for translating report content using a Generative AI API.

import { showNotification } from '../core/ui-core.js';

// Gemini API endpoint (sử dụng model flash mới nhất)
const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=';

/**
 * Calls the Generative AI API to translate report text.
 * @param {string} reportText - The plain text content of the report to translate.
 * @param {string} apiKey - The API key for the AI service.
 * @param {string} systemPrompt - The detailed system prompt guiding the translation.
 * @returns {Promise<string>} - A promise that resolves with the translated text or rejects with an error.
 */
export async function translateReportViaApi(reportText, apiKey, systemPrompt) {
    console.log("[Translator] Starting translation via API.");

    if (!reportText) {
        return Promise.reject("No report text provided for translation.");
    }
    if (!apiKey) {
        return Promise.reject("API key is missing for translation.");
    }
    if (!systemPrompt) {
        return Promise.reject("System prompt is missing for translation.");
    }

    const fullApiUrl = API_ENDPOINT + apiKey;

    // Cấu trúc request body cho Gemini API
    const requestBody = {
        // System prompt hướng dẫn vai trò và cách dịch
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
        // Nội dung cần dịch (prompt cuối cùng là nội dung báo cáo)
        contents: [
            {
                role: "user",
                parts: [{
                    // Thêm phần dẫn nhập yêu cầu dịch trước nội dung báo cáo
                    text: `\n\n--- BEGIN ENGLISH ULTRASOUND REPORT ---\n\n${reportText}\n\n--- END ENGLISH ULTRASOUND REPORT ---`
                }]
            }
        ],
        // Cấu hình sinh nội dung (tùy chọn, có thể điều chỉnh)
        generationConfig: {
          temperature: 0.3, // Giảm temperature để dịch bám sát hơn
          // topP: 0.9,
          // topK: 40,
          // maxOutputTokens: 4096, // Tăng nếu báo cáo dài
        },
        // Cài đặt an toàn (tùy chọn)
        // safetySettings: [ ... ]
    };

    console.log("[Translator] Sending request to API:", fullApiUrl);
    // console.log("[Translator] Request body (excluding prompt):", { contents: requestBody.contents, generationConfig: requestBody.generationConfig }); // Log request body for debug

    try {
        const response = await fetch(fullApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        console.log("[Translator] API Response Status:", response.status);
        const responseData = await response.json();

        if (!response.ok) {
            console.error("[Translator] API Error Response:", responseData);
            const errorDetail = responseData?.error?.message || `HTTP error ${response.status}`;
            throw new Error(`API request failed: ${errorDetail}`);
        }

        // Kiểm tra cấu trúc response và lấy phần text dịch
        if (responseData.candidates && responseData.candidates.length > 0 &&
            responseData.candidates[0].content && responseData.candidates[0].content.parts &&
            responseData.candidates[0].content.parts.length > 0 && responseData.candidates[0].content.parts[0].text)
        {
            const translatedText = responseData.candidates[0].content.parts[0].text;
            console.log("[Translator] Translation successful.");
            // console.log("[Translator] Translated Text:", translatedText); // Log kết quả dịch
            return translatedText; // Trả về nội dung đã dịch
        } else {
             // Xử lý trường hợp response không có nội dung hoặc bị chặn bởi safety settings
            let reason = "Unknown reason";
            if (responseData.candidates && responseData.candidates[0]?.finishReason) {
                 reason = responseData.candidates[0].finishReason;
            }
             console.error("[Translator] API response structure invalid or content missing/blocked. Reason:", reason, "Response:", responseData);
            throw new Error(`Translation failed: No valid content received from API. Finish Reason: ${reason}`);
        }

    } catch (error) {
        console.error('[Translator] Error during API call:', error);
        showNotification(`Translation Error: ${error.message}`, 'error', 5000); // Show error to user
        // Ném lỗi ra ngoài để hàm gọi có thể xử lý
        throw error; // Re-throw the error after logging/notifying
    }
}