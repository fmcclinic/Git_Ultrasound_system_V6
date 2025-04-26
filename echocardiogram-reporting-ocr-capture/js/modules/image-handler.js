// js/modules/image-handler.js
// *** UPDATED to add OCR Trigger Button Placeholder AND addImageFromDataUrl function ***
// Includes detailed logging.

import { showNotification } from '../core/ui-core.js';

let uploadedImagesData = []; // Array to store {id, name, size, type, dataUrl}

export function initImageHandler() {
    console.log("[ImageHandler] initImageHandler called.");
    const imageUploadInput = document.getElementById('image-upload');
    const previewContainer = document.getElementById('image-preview-container');

    if (imageUploadInput && previewContainer) {
        console.log("[ImageHandler] Found image input and preview container.");
        imageUploadInput.addEventListener('change', (event) => {
            console.log("[ImageHandler] 'change' event detected on #image-upload.");
            // Pass the container element directly
            handleImageFiles(event.target.files, previewContainer, imageUploadInput);
        });
        console.log("[ImageHandler] Event listener added to #image-upload.");

        // Add delegated listener for remove buttons
        previewContainer.addEventListener('click', function(event) {
            if (event.target.classList.contains('remove-image-btn')) {
                const wrapper = event.target.closest('.image-preview-wrapper');
                const imageId = wrapper?.dataset.imageId;
                if (imageId && wrapper) {
                    removeImage(imageId, wrapper);
                }
            }
            // *** IMPORTANT: OCR button click is NOT handled here. ***
            // It will be handled via delegation in echo-module.js
        });

    } else {
        if (!imageUploadInput) console.error("[ImageHandler] CRITICAL: Image upload input ('#image-upload') NOT FOUND.");
        if (!previewContainer) console.error("[ImageHandler] CRITICAL: Preview container ('#image-preview-container') NOT FOUND.");
    }
}

function handleImageFiles(files, previewContainer, imageUploadInput) { // Added input for clearing
    if (!files) {
        console.warn("[ImageHandler] handleImageFiles called with null/undefined files list.");
        return;
    }
    console.log(`[ImageHandler] handleImageFiles started processing ${files.length} file(s).`);

    if (files.length === 0) {
        console.log("[ImageHandler] No files selected in this batch.");
        return;
    }

    Array.from(files).forEach((file, index) => {
        console.log(`[ImageHandler] Processing file #${index + 1}: Name='${file.name}', Type='${file.type || 'unknown'}', Size=${file.size} bytes.`);

        // --- Type Check ---
        if (!file.type || !file.type.startsWith('image/')) {
            const skipMsg = `[ImageHandler] Skipping non-image file: ${file.name}`;
            console.warn(skipMsg);
            showNotification(`Skipping non-image file: ${file.name}`, 'info');
            return; // Skip to next file in loop
        }
        console.log(`[ImageHandler] File '${file.name}' passed image type check.`);

        // --- FileInfo Setup ---
        const fileInfo = {
            id: `img_${Date.now()}_${Math.random().toString(16).slice(2)}`,
            name: file.name, size: file.size, type: file.type, dataUrl: null
        };
        console.log(`[ImageHandler] Created fileInfo for '${file.name}' with ID ${fileInfo.id}.`);

        // --- FileReader Setup ---
        try {
            const reader = new FileReader();
            console.log(`[ImageHandler] FileReader created for '${file.name}'.`);

            // --- Onload Event Handler ---
            reader.onload = (e) => {
                console.log(`[ImageHandler] reader.onload triggered for '${file.name}'.`);
                const imageDataUrl = e.target.result;

                // --- Data URL Validation ---
                if (!imageDataUrl || !imageDataUrl.startsWith('data:image/')) {
                    console.error(`[ImageHandler] ERROR: Invalid Data URL for '${file.name}'.`);
                    showNotification(`Error reading image data: ${file.name}`, 'error');
                    return; // Stop processing this file's onload
                }
                console.log(`[ImageHandler] Data URL valid for '${file.name}' (Length: ${imageDataUrl.length}).`);

                // --- Store Data ---
                fileInfo.dataUrl = imageDataUrl;
                uploadedImagesData.push(fileInfo);
                console.log(`[ImageHandler] Stored image data for '${file.name}'. Total stored: ${uploadedImagesData.length}.`);

                // --- Create DOM Elements ---
                try {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'image-preview-wrapper';
                    wrapper.dataset.imageId = fileInfo.id; // Add ID to wrapper for remove/OCR logic

                    const imgElement = document.createElement('img');
                    imgElement.src = fileInfo.dataUrl;
                    imgElement.alt = file.name;
                    imgElement.title = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
                    wrapper.appendChild(imgElement);
                    console.log(`[ImageHandler] Created <img> element for '${file.name}'.`);

                    const removeBtn = document.createElement('button');
                    removeBtn.textContent = 'X';
                    removeBtn.className = 'remove-image-btn'; // Let delegated listener handle this
                    removeBtn.title = `Remove ${file.name}`;
                    removeBtn.type = 'button';
                    wrapper.appendChild(removeBtn);
                    console.log(`[ImageHandler] Created remove button for '${file.name}'.`);

                    // --- ADD OCR TRIGGER BUTTON ---
                    const ocrBtn = document.createElement('button');
                    ocrBtn.innerHTML = '<i class="fas fa-magic"></i> Đọc'; // Example text/icon
                    ocrBtn.className = 'ocr-trigger-btn'; // CSS class for styling and selection
                    ocrBtn.title = `Đọc số đo từ ảnh ${file.name}`;
                    ocrBtn.type = 'button';
                    ocrBtn.dataset.imageId = fileInfo.id; // Crucial: Link button to image ID
                    // NOTE: The actual 'click' event listener will be added in echo-module.js
                    wrapper.appendChild(ocrBtn);
                    console.log(`[ImageHandler] Added OCR trigger button placeholder for image ID: ${fileInfo.id}`);
                    // --- END OCR TRIGGER BUTTON ---


                    // --- Append to DOM ---
                    if (previewContainer) {
                        previewContainer.appendChild(wrapper);
                        console.log(`[ImageHandler] SUCCESS: Appended preview wrapper for '${file.name}' to container.`);
                    } else {
                        console.error("[ImageHandler] ERROR: Cannot append preview, previewContainer is null inside reader.onload!");
                    }
                } catch (domError) {
                    console.error(`[ImageHandler] ERROR creating or appending DOM elements for '${file.name}':`, domError);
                    showNotification(`UI error displaying image: ${file.name}`, 'error');
                }
            }; // End of reader.onload

            // --- Onerror Event Handler ---
            reader.onerror = (e) => {
                console.error(`[ImageHandler] reader.onerror triggered for '${file.name}'. Error:`, e.target.error);
                showNotification(`Error reading file: ${file.name}`, 'error');
            };

            // --- Start Reading ---
            console.log(`[ImageHandler] Calling reader.readAsDataURL for '${file.name}'.`);
            reader.readAsDataURL(file);

        } catch (readerError) {
            console.error(`[ImageHandler] ERROR creating FileReader or starting read for '${file.name}':`, readerError);
            showNotification(`Failed to initiate reading: ${file.name}`, 'error');
        }
    }); // End of forEach loop

    // --- Clear Input Value ---
    if (imageUploadInput) {
        try {
            imageUploadInput.value = ''; // Reset input value AFTER loop finishes
            console.log("[ImageHandler] Image file input value cleared after processing batch.");
        } catch(clearError) {
            console.error("[ImageHandler] Error clearing file input value:", clearError);
        }
    } else {
         console.warn("[ImageHandler] Could not clear file input value, input element not passed or found.");
    }
     console.log("[ImageHandler] handleImageFiles finished processing batch.");
}

function removeImage(imageId, previewElementWrapper) {
    console.log(`[ImageHandler] Attempting to remove image with ID: ${imageId}`);
    if (previewElementWrapper && previewElementWrapper.parentNode) {
        previewElementWrapper.remove();
        const initialLength = uploadedImagesData.length;
        uploadedImagesData = uploadedImagesData.filter(img => img.id !== imageId);
        const removedCount = initialLength - uploadedImagesData.length;
        if (removedCount > 0) {
             console.log(`[ImageHandler] Image (ID: ${imageId}) removed successfully. Current count: ${uploadedImagesData.length}.`);
             showNotification('Image removed.', 'success', 1500);
        } else {
             console.warn(`[ImageHandler] Image data with ID ${imageId} not found in array.`);
        }
    } else {
         console.error("[ImageHandler] Invalid preview element or parent during removal:", previewElementWrapper);
    }
}

/**
 * Returns all uploaded image data, optionally including the dataUrl.
 * @param {boolean} [includeDataUrl=false] - Whether to include the base64 dataUrl.
 * @returns {Array<object>} - Array of image info objects.
 */
export function getUploadedImageData(includeDataUrl = false) {
     console.log(`[ImageHandler] Getting image data. Include URL: ${includeDataUrl}. Count: ${uploadedImagesData.length}`);
    if (includeDataUrl) {
        const validImages = uploadedImagesData.filter(img => img.dataUrl && img.dataUrl.startsWith('data:image/'));
        if (validImages.length !== uploadedImagesData.length) {
            console.warn(`[ImageHandler] Returning ${validImages.length} valid images out of ${uploadedImagesData.length}.`);
        }
        return JSON.parse(JSON.stringify(validImages)); // Deep copy
    } else {
        return uploadedImagesData.map(img => ({ id: img.id, name: img.name, size: img.size, type: img.type }));
    }
}

/**
 * Gets specific image data (including dataUrl and mimeType) by ID.
 * Needed by echo-module to get data for the OCR handler.
 * @param {string} imageId - The ID of the image to retrieve.
 * @returns {object | null} - Object { dataUrl, mimeType } or null if not found.
 */
export function getImageDataById(imageId) {
    const imageInfo = uploadedImagesData.find(img => img.id === imageId);
    if (imageInfo && imageInfo.dataUrl && imageInfo.type) {
        console.log(`[ImageHandler] Retrieved data for image ID: ${imageId}`);
        return {
            dataUrl: imageInfo.dataUrl,
            mimeType: imageInfo.type
        };
    }
    console.warn(`[ImageHandler] Image data not found or invalid for ID: ${imageId}`);
    return null;
}


export function clearImageData() {
     const previewContainer = document.getElementById('image-preview-container');
     if (previewContainer) { previewContainer.innerHTML = ''; }
     uploadedImagesData = [];
     console.log("[ImageHandler] All image previews and data cleared.");
     showNotification('All uploaded images cleared.', 'info');
}

// --- *** NEW: Function to Add Image From Data URL *** ---
/**
 * Adds an image from a Data URL (e.g., captured from video) to the preview and internal list.
 * @param {string} dataUrl - The full Data URL (e.g., "data:image/png;base64,...").
 * @param {string} filename - The desired filename for the captured image.
 */
export function addImageFromDataUrl(dataUrl, filename) {
    console.log(`[ImageHandler] Adding image from Data URL: ${filename}`);
    const previewContainer = document.getElementById('image-preview-container');
    if (!previewContainer) {
        console.error("[ImageHandler] Preview container not found, cannot add captured image preview.");
        showNotification("Lỗi: Không tìm thấy khu vực xem trước ảnh.", "error");
        return;
    }

    if (!dataUrl || !dataUrl.startsWith('data:image/')) {
        console.error("[ImageHandler] Invalid Data URL provided.");
        showNotification("Lỗi: Dữ liệu ảnh chụp không hợp lệ.", "error");
        return;
    }

    // Extract mime type and approximate size
    const mimeMatch = dataUrl.match(/data:(image\/\w+);/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/png'; // Default to png
    const base64Data = dataUrl.split(',')[1];
    const approxSize = Math.ceil(base64Data.length * 0.75); // Estimate size

    const fileInfo = {
        id: `img_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        name: filename,
        size: approxSize,
        type: mimeType,
        dataUrl: dataUrl
    };

    // Store the data
    uploadedImagesData.push(fileInfo);
    console.log(`[ImageHandler] Stored captured image data: ${filename}. Total stored: ${uploadedImagesData.length}.`);

    // Create DOM Elements for preview (Same logic as handleImageFiles)
    try {
        const wrapper = document.createElement('div');
        wrapper.className = 'image-preview-wrapper';
        wrapper.dataset.imageId = fileInfo.id;

        const imgElement = document.createElement('img');
        imgElement.src = fileInfo.dataUrl;
        imgElement.alt = fileInfo.name;
        imgElement.title = `${fileInfo.name} (~${(approxSize / 1024).toFixed(1)} KB)`;
        wrapper.appendChild(imgElement);

        // Add Remove Button
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'X';
        removeBtn.className = 'remove-image-btn'; // Delegated listener handles click
        removeBtn.title = `Remove ${fileInfo.name}`;
        removeBtn.type = 'button';
        wrapper.appendChild(removeBtn);

        // Add OCR Trigger Button (also for captured images)
        const ocrBtn = document.createElement('button');
        ocrBtn.innerHTML = '<i class="fas fa-magic"></i> Đọc';
        ocrBtn.className = 'ocr-trigger-btn';
        ocrBtn.title = `Đọc số đo từ ảnh ${fileInfo.name}`;
        ocrBtn.type = 'button';
        ocrBtn.dataset.imageId = fileInfo.id;
        // onclick listener added by echo-module.js if OCR is available
        wrapper.appendChild(ocrBtn);

        // Append to DOM
        previewContainer.appendChild(wrapper);
        console.log(`[ImageHandler] Appended captured image preview: ${filename}.`);

    } catch (domError) {
        console.error(`[ImageHandler] ERROR creating or appending DOM elements for captured image '${filename}':`, domError);
        showNotification(`UI error displaying captured image: ${filename}`, 'error');
        // Attempt to remove the data if UI fails?
        uploadedImagesData = uploadedImagesData.filter(img => img.id !== fileInfo.id);
    }
}
// --- *** END NEW Function *** ---


// Log khi module được tải (cập nhật)
console.log("image-handler.js (updated with OCR button & addImageFromDataUrl) loaded.");