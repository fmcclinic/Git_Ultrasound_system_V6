// js/modules/image-handler.js (DEBUG VERSION - Updated for OCR Trigger)
// Includes detailed logging and OCR button addition.

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
            handleImageFiles(event.target.files, previewContainer, imageUploadInput);
        });
        console.log("[ImageHandler] Event listener added to #image-upload.");

        // Optional: Add delegated listener for remove buttons if needed
        previewContainer.addEventListener('click', function(event) {
            if (event.target.classList.contains('remove-image-btn')) {
                const wrapper = event.target.closest('.image-preview-wrapper');
                const imageId = wrapper?.dataset.imageId;
                if (imageId && wrapper) {
                    removeImage(imageId, wrapper);
                }
            }
            // Note: OCR button listener should be added in obstetric-module.js
            // to keep image-handler generic.
        });

    } else {
        if (!imageUploadInput) console.error("[ImageHandler] CRITICAL: Image upload input ('#image-upload') NOT FOUND.");
        if (!previewContainer) console.error("[ImageHandler] CRITICAL: Preview container ('#image-preview-container') NOT FOUND.");
    }
}

function handleImageFiles(files, previewContainer, imageUploadInput) {
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

        if (!file.type || !file.type.startsWith('image/')) {
            console.warn(`[ImageHandler] Skipping non-image file: ${file.name}`);
            showNotification(`Skipping non-image file: ${file.name}`, 'info');
            return; // Skip to next file
        }

        const fileInfo = {
            id: `img_${Date.now()}_${Math.random().toString(16).slice(2)}`,
            name: file.name, size: file.size, type: file.type, dataUrl: null
        };
        console.log(`[ImageHandler] Created fileInfo for '${file.name}' with ID ${fileInfo.id}.`);

        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                console.log(`[ImageHandler] reader.onload triggered for '${file.name}'.`);
                const imageDataUrl = e.target.result;

                if (!imageDataUrl || !imageDataUrl.startsWith('data:image/')) {
                    console.error(`[ImageHandler] ERROR: Invalid Data URL for '${file.name}'.`);
                    showNotification(`Error reading image data: ${file.name}`, 'error');
                    return;
                }
                console.log(`[ImageHandler] Data URL valid for '${file.name}'.`);

                fileInfo.dataUrl = imageDataUrl; // Store the full data URL
                uploadedImagesData.push(fileInfo);
                console.log(`[ImageHandler] Stored image data for '${file.name}'. Total stored: ${uploadedImagesData.length}.`);

                // Create DOM Elements
                try {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'image-preview-wrapper';
                    wrapper.dataset.imageId = fileInfo.id; // Add ID to wrapper

                    const imgElement = document.createElement('img');
                    imgElement.src = fileInfo.dataUrl;
                    imgElement.alt = file.name;
                    imgElement.title = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
                    wrapper.appendChild(imgElement);

                    // --- Add Remove Button ---
                    const removeBtn = document.createElement('button');
                    removeBtn.textContent = 'X';
                    removeBtn.className = 'remove-image-btn danger-btn'; // Added danger-btn class
                    removeBtn.title = `Remove ${file.name}`;
                    removeBtn.type = 'button';
                    // removeBtn.onclick handled by delegated listener in initImageHandler
                    wrapper.appendChild(removeBtn);

                    // --- Add OCR Trigger Button ---
                    const ocrBtn = document.createElement('button');
                    ocrBtn.innerHTML = '<i class="fas fa-magic"></i> Đọc'; // Example icon + text
                    ocrBtn.className = 'ocr-trigger-btn';
                    ocrBtn.title = `Đọc số đo từ ảnh ${file.name}`;
                    ocrBtn.type = 'button';
                    ocrBtn.dataset.imageId = fileInfo.id; // Store image ID on the button
                    // onclick listener will be added in obstetric-module.js if OCR is available
                    wrapper.appendChild(ocrBtn);
                    console.log(`[ImageHandler] Added OCR button for image ID: ${fileInfo.id}`);
                    // --- End Add OCR Trigger Button ---

                    if (previewContainer) {
                        previewContainer.appendChild(wrapper);
                        console.log(`[ImageHandler] Appended preview wrapper for '${file.name}'.`);
                    } else {
                        console.error("[ImageHandler] ERROR: Cannot append preview, previewContainer is null inside reader.onload!");
                    }
                } catch (domError) {
                    console.error(`[ImageHandler] ERROR creating or appending DOM elements for '${file.name}':`, domError);
                    showNotification(`UI error displaying image: ${file.name}`, 'error');
                }
            }; // End of reader.onload

            reader.onerror = (e) => {
                console.error(`[ImageHandler] reader.onerror for '${file.name}'. Error:`, e.target.error);
                showNotification(`Error reading file: ${file.name}`, 'error');
            };

            reader.readAsDataURL(file);
        } catch (readerError) {
            console.error(`[ImageHandler] ERROR creating FileReader for '${file.name}':`, readerError);
            showNotification(`Failed to initiate reading: ${file.name}`, 'error');
        }
    }); // End of forEach loop

    if (imageUploadInput) {
        try {
            imageUploadInput.value = ''; // Reset input
            console.log("[ImageHandler] Image file input value cleared.");
        } catch(clearError) {
            console.error("[ImageHandler] Error clearing file input value:", clearError);
        }
    }
}

function removeImage(imageId, previewElementWrapper) {
    console.log(`[ImageHandler] Attempting to remove image ID: ${imageId}`);
    if (previewElementWrapper && previewElementWrapper.parentNode) {
        previewElementWrapper.remove();
        const initialLength = uploadedImagesData.length;
        uploadedImagesData = uploadedImagesData.filter(img => img.id !== imageId);
        if (initialLength > uploadedImagesData.length) {
             console.log(`[ImageHandler] Image (ID: ${imageId}) removed. Count: ${uploadedImagesData.length}.`);
             showNotification('Image removed.', 'success', 1500);
        } else {
             console.warn(`[ImageHandler] Image data ID ${imageId} not found.`);
        }
    } else {
         console.error("[ImageHandler] Invalid preview element during removal:", previewElementWrapper);
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
        // Filter out any potential entries where dataUrl failed to load
        const validImages = uploadedImagesData.filter(img => img.dataUrl && img.dataUrl.startsWith('data:image/'));
        if (validImages.length !== uploadedImagesData.length) {
            console.warn(`[ImageHandler] Returning ${validImages.length} valid images out of ${uploadedImagesData.length}.`);
        }
        // Return deep copy to prevent external modification
        return JSON.parse(JSON.stringify(validImages));
    } else {
        // Return only metadata without the potentially large dataUrl
        return uploadedImagesData.map(img => ({ id: img.id, name: img.name, size: img.size, type: img.type }));
    }
}

/**
 * NEW: Gets specific image data (including dataUrl and mimeType) by ID.
 * @param {string} imageId - The ID of the image to retrieve.
 * @returns {object | null} - Object { dataUrl, mimeType } or null if not found.
 */
export function getImageDataById(imageId) {
    const imageInfo = uploadedImagesData.find(img => img.id === imageId);
    if (imageInfo && imageInfo.dataUrl && imageInfo.type) {
        console.log(`[ImageHandler] Retrieved data for image ID: ${imageId}`);
        return {
            dataUrl: imageInfo.dataUrl, // Full data URL (data:image/...)
            mimeType: imageInfo.type
        };
    }
    console.warn(`[ImageHandler] Image data not found for ID: ${imageId}`);
    return null;
}


export function clearImageData() {
     const previewContainer = document.getElementById('image-preview-container');
     if (previewContainer) { previewContainer.innerHTML = ''; }
     uploadedImagesData = [];
     console.log("[ImageHandler] All image previews and data cleared.");
     showNotification('All uploaded images cleared.', 'info');
}

console.log("image-handler.js loaded (with OCR button support).");