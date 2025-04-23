// js/modules/video-capture.js
// Module xử lý video capture từ thiết bị, tích hợp logic camera từ webcam.html
// nhưng vẫn giữ luồng xử lý ảnh qua callback.

import { showNotification } from '../core/ui-core.js';

// Biến lưu trữ trạng thái
let currentStream = null;
let videoElement = null;        // Thẻ <video> để hiển thị luồng chính
let captureButton = null;       // Nút "Chụp ảnh" chính
let sourceSelector = null;      // Thẻ <select> chọn nguồn
let startButton = null;         // Nút "Bắt đầu / Chọn"
let onCaptureSuccessCallback = null; // Callback khi chụp thành công

// --- Hàm populateVideoSources không thay đổi so với phiên bản trước ---
async function populateVideoSources(selectorId) {
    const selector = document.getElementById(selectorId);
    if (!selector) {
        console.error(`[VideoCapture] Video source selector #${selectorId} not found.`);
        return;
    }
    const previouslySelectedDeviceId = selector.value;
    selector.innerHTML = '<option value="">-- Chọn Nguồn Video --</option>';
    try {
        if (!navigator.mediaDevices?.enumerateDevices) {
            throw new Error("API enumerateDevices() không được hỗ trợ.");
        }
        const devices = await navigator.mediaDevices.enumerateDevices();
        let foundVideoInput = false;
        devices.forEach((device, index) => {
            if (device.kind === 'videoinput') {
                foundVideoInput = true;
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.text = device.label || `Camera ${index + 1}`;
                selector.appendChild(option);
            }
        });
        if (!foundVideoInput) {
            showNotification("Không tìm thấy thiết bị video đầu vào.", "warning");
        }
        if (previouslySelectedDeviceId) {
            selector.value = previouslySelectedDeviceId;
        }
        console.log("[VideoCapture] Populated video sources.");
    } catch (err) {
        console.error("[VideoCapture] Error enumerating devices:", err);
        showNotification(`Lỗi liệt kê thiết bị video: ${err.message}`, "error");
        // ... (xử lý lỗi hiển thị option) ...
    }
}

// --- Hàm stopVideoStream không thay đổi ---
function stopVideoStream() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        console.log("[VideoCapture] Video stream stopped.");
    }
    currentStream = null;
    if (videoElement) {
        videoElement.srcObject = null;
        videoElement.style.display = 'none';
        videoElement.onloadedmetadata = null;
        videoElement.onerror = null;
    }
     if (captureButton) {
        captureButton.disabled = true;
    }
}

// --- Hàm startVideoStream không thay đổi ---
async function startVideoStream(deviceId, sourceSelectorId) {
    stopVideoStream(); // Dừng stream cũ
    if (!videoElement) { /* ... xử lý lỗi ... */ return; }
    if (!captureButton) console.warn("[VideoCapture] Capture button reference is missing.");

    const constraints = { video: { deviceId: deviceId ? { exact: deviceId } : undefined } };
    console.log("[VideoCapture] Requesting video stream with constraints:", constraints);
    showNotification("Đang khởi động camera/capture card...", "info", 1500);
    if(startButton) startButton.disabled = true;
    if(sourceSelector) sourceSelector.disabled = true;

    try {
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        videoElement.srcObject = currentStream;
        videoElement.style.display = 'block'; // Hiển thị thẻ video
        videoElement.play();

        videoElement.onloadedmetadata = () => { // Sử dụng onloadedmetadata thay vì onplaying để đảm bảo có kích thước
             console.log(`[VideoCapture] Stream started. Resolution: ${videoElement.videoWidth}x${videoElement.videoHeight}`);
             if (captureButton) captureButton.disabled = false; // Kích hoạt nút chụp KHI video sẵn sàng
             showNotification("Bắt đầu xem trước video thành công!", "success", 2000);
             if (sourceSelectorId) {
                 populateVideoSources(sourceSelectorId); // Cập nhật lại label
             }
             if(startButton) startButton.disabled = false;
             if(sourceSelector) sourceSelector.disabled = false;
        };
        videoElement.onerror = (e) => { /* ... xử lý lỗi video ... */ };

    } catch (err) {
        console.error("[VideoCapture] Error accessing media devices:", err);
        stopVideoStream();
        let message = `Lỗi truy cập camera: ${err.name}`;
        if (err.name === 'NotAllowedError') message = 'Bạn đã từ chối quyền truy cập camera.';
        // ... các lỗi khác ...
        showNotification(message, "error", 6000);
        if(startButton) startButton.disabled = false;
        if(sourceSelector) sourceSelector.disabled = false;
    }
}

/**
 * Chụp khung hình hiện tại từ video, tạo Data URL và gọi callback onCaptureSuccess.
 * Sử dụng canvas tạm thời để tạo Data URL.
 */
function captureFrame() {
    if (!currentStream || !videoElement || !videoElement.videoWidth || videoElement.readyState < videoElement.HAVE_CURRENT_DATA) {
        console.warn("[VideoCapture] Cannot capture: stream or video not ready.");
        showNotification("Video chưa sẵn sàng để chụp.", "warning");
        return;
    }

    console.log("[VideoCapture] Capturing frame...");

    // 1. Tạo canvas TẠM THỜI trong bộ nhớ (không cần thêm vào DOM)
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = videoElement.videoWidth;  // Lấy kích thước thật của video
    tempCanvas.height = videoElement.videoHeight;

    try {
        const context = tempCanvas.getContext('2d');
        // 2. Vẽ khung hình video hiện tại lên canvas tạm thời
        context.drawImage(videoElement, 0, 0, tempCanvas.width, tempCanvas.height);

        // 3. Tạo Data URL từ canvas tạm thời
        const dataUrl = tempCanvas.toDataURL('image/png'); // Dùng PNG
        console.log("[VideoCapture] Frame captured successfully to Data URL.");

        // 4. Gọi callback với Data URL để image-handler xử lý
        if (typeof onCaptureSuccessCallback === 'function') {
            onCaptureSuccessCallback(dataUrl);
        } else {
            console.warn("[VideoCapture] onCaptureSuccess callback not defined.");
            showNotification("Đã chụp ảnh nhưng không có hành động xử lý.", "warning");
        }
    } catch (e) {
         console.error("[VideoCapture] Error drawing video frame or creating Data URL:", e);
         showNotification("Lỗi khi tạo dữ liệu ảnh chụp.", "error");
    }
    // Canvas tạm thời sẽ tự bị xóa khi hàm kết thúc (garbage collection)
}

/**
 * Hàm khởi tạo chính cho module video capture.
 * @param {object} options - Các ID element và callback.
 * @param {string} options.videoElementId
 * @param {string} options.canvasElementId - ID này không còn dùng trực tiếp để vẽ nữa, nhưng có thể giữ lại nếu cần cho việc khác.
 * @param {string} options.captureButtonId
 * @param {string} options.sourceSelectorId
 * @param {string} options.startButtonId
 * @param {function(string)} options.onCaptureSuccess - Callback khi chụp ảnh thành công (nhận dataUrl).
 */
export function initVideoCapture(options) {
    console.log("[VideoCapture] Initializing (adapted logic)...");

    // Gán các element cần thiết
    videoElement = document.getElementById(options.videoElementId);
    // canvasElement = document.getElementById(options.canvasElementId); // Không còn dùng trực tiếp
    captureButton = document.getElementById(options.captureButtonId);
    sourceSelector = document.getElementById(options.sourceSelectorId);
    startButton = document.getElementById(options.startButtonId);
    onCaptureSuccessCallback = options.onCaptureSuccess;

    // Kiểm tra các element quan trọng
    if (!videoElement || !captureButton || !sourceSelector || !startButton) {
        console.error("[VideoCapture] Init failed: Missing required elements (video, captureBtn, sourceSelect, startBtn).");
        showNotification("Lỗi khởi tạo giao diện Video Capture.", "error");
        if(startButton) startButton.disabled = true;
        if(captureButton) captureButton.disabled = true;
        if(sourceSelector) sourceSelector.disabled = true;
        return;
    }

     captureButton.disabled = true; // Vô hiệu hóa nút chụp ban đầu

    // Điền danh sách nguồn video
    populateVideoSources(options.sourceSelectorId);

    // Gắn sự kiện cho nút Bắt đầu/Chọn nguồn
    startButton.addEventListener('click', () => {
        const selectedDeviceId = sourceSelector.value;
        if (!selectedDeviceId) {
            stopVideoStream();
            showNotification("Vui lòng chọn một nguồn video.", "info");
        } else {
            startVideoStream(selectedDeviceId, options.sourceSelectorId);
        }
    });

    // Gắn sự kiện cho nút Chụp ảnh
    captureButton.addEventListener('click', captureFrame);

    console.log("[VideoCapture] Initialization complete. Waiting for user action.");
}

// Log khi module được tải
console.log("video-capture.js loaded (adapted from webcam.html logic).");