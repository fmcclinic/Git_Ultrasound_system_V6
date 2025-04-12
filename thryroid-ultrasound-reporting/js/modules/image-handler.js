// js/modules/image-handler.js (DEBUG VERSION)
// Includes detailed logging to diagnose preview issues.

import { showNotification } from '../core/ui-core.js';

let uploadedImagesData = [];

export function initImageHandler() {
    console.log("[DEBUG] initImageHandler called."); // Log init start
    const imageUploadInput = document.getElementById('image-upload');
    const previewContainer = document.getElementById('image-preview-container');

    if (imageUploadInput && previewContainer) {
        console.log("[DEBUG] Found image input and preview container.");
        imageUploadInput.addEventListener('change', (event) => {
            console.log("[DEBUG] 'change' event detected on #image-upload."); // Log event fired
            // Pass the container element directly
            handleImageFiles(event.target.files, previewContainer, imageUploadInput);
        });
        console.log("[DEBUG] Event listener added to #image-upload.");
    } else {
        // Log which element is missing
        if (!imageUploadInput) console.error("[DEBUG] CRITICAL: Image upload input ('#image-upload') NOT FOUND.");
        if (!previewContainer) console.error("[DEBUG] CRITICAL: Preview container ('#image-preview-container') NOT FOUND.");
    }
}

function handleImageFiles(files, previewContainer, imageUploadInput) { // Added input for clearing
    if (!files) {
        console.warn("[DEBUG] handleImageFiles called with null/undefined files list.");
        return;
    }
    console.log(`[DEBUG] handleImageFiles started processing ${files.length} file(s).`);

    // Reset input value immediately? Or after loop? Doing it after loop.

    if (files.length === 0) {
        console.log("[DEBUG] No files selected in this batch.");
        // Clear input value even if no files selected? Optional.
        // if (imageUploadInput) imageUploadInput.value = '';
        return;
    }

    Array.from(files).forEach((file, index) => {
        console.log(`[DEBUG] Processing file #${index + 1}: Name='${file.name}', Type='${file.type || 'unknown'}', Size=${file.size} bytes.`);

        // --- Type Check ---
        if (!file.type || !file.type.startsWith('image/')) {
            const skipMsg = `[DEBUG] Skipping non-image file: ${file.name}`;
            console.warn(skipMsg);
            showNotification(`Skipping non-image file: ${file.name}`, 'info');
            return; // Skip to next file in loop
        }
        console.log(`[DEBUG] File '${file.name}' passed image type check.`);

        // --- FileInfo Setup ---
        const fileInfo = {
            id: `img_${Date.now()}_${Math.random().toString(16).slice(2)}`,
            name: file.name, size: file.size, type: file.type, dataUrl: null
        };
        console.log(`[DEBUG] Created fileInfo for '${file.name}' with ID ${fileInfo.id}.`);

        // --- FileReader Setup ---
        try {
            const reader = new FileReader();
            console.log(`[DEBUG] FileReader created for '${file.name}'.`);

            // --- Onload Event Handler ---
            reader.onload = (e) => {
                console.log(`[DEBUG] reader.onload triggered for '${file.name}'.`);
                const imageDataUrl = e.target.result;

                // --- Data URL Validation ---
                if (!imageDataUrl) {
                    console.error(`[DEBUG] ERROR: reader.onload - Result is null/empty for '${file.name}'.`);
                    showNotification(`Error reading image data: ${file.name}`, 'error');
                    return; // Stop processing this file's onload
                }
                if (!imageDataUrl.startsWith('data:image/')) {
                    console.error(`[DEBUG] ERROR: reader.onload - Result is not a valid Data URL for '${file.name}'. Starts with: '${imageDataUrl.substring(0, 30)}...'`);
                    showNotification(`Invalid image data format: ${file.name}`, 'error');
                    return; // Stop processing this file's onload
                }
                console.log(`[DEBUG] reader.onload - Data URL is valid for '${file.name}' (Length: ${imageDataUrl.length}).`);

                // --- Store Data ---
                fileInfo.dataUrl = imageDataUrl;
                uploadedImagesData.push(fileInfo);
                console.log(`[DEBUG] Stored image data for '${file.name}'. Total stored: ${uploadedImagesData.length}.`);

                // --- Create DOM Elements ---
                try {
                    const imgElement = document.createElement('img');
                    imgElement.src = fileInfo.dataUrl;
                    imgElement.alt = file.name;
                    imgElement.title = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
                    imgElement.dataset.imageId = fileInfo.id;
                    console.log(`[DEBUG] Created <img> element for '${file.name}'.`);

                    const wrapper = document.createElement('div');
                    wrapper.className = 'image-preview-wrapper';
                    wrapper.appendChild(imgElement);
                    console.log(`[DEBUG] Created wrapper div for '${file.name}'.`);

                    const removeBtn = document.createElement('button');
                    removeBtn.textContent = 'X';
                    removeBtn.className = 'remove-image-btn';
                    removeBtn.title = `Remove ${file.name}`;
                    removeBtn.type = 'button';
                    removeBtn.onclick = () => {
                        console.log(`[DEBUG] Remove button clicked for image ID: ${fileInfo.id}`);
                        removeImage(fileInfo.id, wrapper);
                    };
                    wrapper.appendChild(removeBtn);
                    console.log(`[DEBUG] Created remove button for '${file.name}'.`);

                    // --- Append to DOM ---
                    if (previewContainer) {
                        previewContainer.appendChild(wrapper);
                        console.log(`[DEBUG] SUCCESS: Appended preview wrapper for '${file.name}' to container.`);
                    } else {
                        console.error("[DEBUG] ERROR: Cannot append preview, previewContainer is null inside reader.onload!");
                    }
                } catch (domError) {
                    console.error(`[DEBUG] ERROR creating or appending DOM elements for '${file.name}':`, domError);
                    showNotification(`UI error displaying image: ${file.name}`, 'error');
                }
            }; // End of reader.onload

            // --- Onerror Event Handler ---
            reader.onerror = (e) => {
                console.error(`[DEBUG] reader.onerror triggered for '${file.name}'. Error:`, e.target.error);
                showNotification(`Error reading file: ${file.name}`, 'error');
            };

            // --- Start Reading ---
            console.log(`[DEBUG] Calling reader.readAsDataURL for '${file.name}'.`);
            reader.readAsDataURL(file);

        } catch (readerError) {
            console.error(`[DEBUG] ERROR creating FileReader or starting read for '${file.name}':`, readerError);
            showNotification(`Failed to initiate reading: ${file.name}`, 'error');
        }
    }); // End of forEach loop

    // --- Clear Input Value ---
    if (imageUploadInput) {
        try {
            imageUploadInput.value = ''; // Reset input value AFTER loop finishes
            console.log("[DEBUG] Image file input value cleared after processing batch.");
        } catch(clearError) {
            console.error("[DEBUG] Error clearing file input value:", clearError);
        }
    } else {
         console.warn("[DEBUG] Could not clear file input value, input element not passed or found.");
    }
     console.log("[DEBUG] handleImageFiles finished processing batch.");
}

// removeImage, getUploadedImageData, clearImageData remain the same as the previous full code version
// Ensure they also have console.log if needed, but the core issue seems to be in the loading/display part.

function removeImage(imageId, previewElementWrapper) {
    console.log(`[DEBUG] Attempting to remove image with ID: ${imageId}`);
    if (previewElementWrapper && previewElementWrapper.parentNode) {
        previewElementWrapper.remove();
        const initialLength = uploadedImagesData.length;
        uploadedImagesData = uploadedImagesData.filter(img => img.id !== imageId);
        const removedCount = initialLength - uploadedImagesData.length;
        if (removedCount > 0) {
             console.log(`[DEBUG] Image (ID: ${imageId}) removed successfully. Current count: ${uploadedImagesData.length}.`);
             showNotification('Image removed.', 'success', 1500);
        } else {
             console.warn(`[DEBUG] Image data with ID ${imageId} not found in array.`);
        }
    } else {
         console.error("[DEBUG] Invalid preview element or parent during removal:", previewElementWrapper);
    }
}

export function getUploadedImageData(includeDataUrl = false) {
     console.log(`[DEBUG] Getting image data. Include URL: ${includeDataUrl}. Count: ${uploadedImagesData.length}`);
    if (includeDataUrl) {
        const validImages = uploadedImagesData.filter(img => img.dataUrl && img.dataUrl.startsWith('data:image/'));
        if (validImages.length !== uploadedImagesData.length) {
            console.warn(`[DEBUG] Returning ${validImages.length} valid images out of ${uploadedImagesData.length}.`);
        }
        return JSON.parse(JSON.stringify(validImages));
    } else {
        return uploadedImagesData.map(img => ({ id: img.id, name: img.name, size: img.size, type: img.type }));
    }
}

export function clearImageData() {
     const previewContainer = document.getElementById('image-preview-container');
     if (previewContainer) { previewContainer.innerHTML = ''; }
     uploadedImagesData = [];
     console.log("[DEBUG] All image previews and data cleared.");
     showNotification('All uploaded images cleared.', 'info');
}