// js/modules/video-capture.js
// Module chung để xử lý video capture từ thiết bị (webcam/capture card)

// Import hàm hiển thị thông báo từ core
import { showNotification } from '../core/ui-core.js';

// Biến lưu trữ trạng thái của module
let currentStream = null;         // Luồng video đang chạy
let videoElement = null;          // Thẻ <video> để hiển thị
let canvasElement = null;         // Thẻ <canvas> ẩn để chụp ảnh
let captureButton = null;         // Nút "Chụp ảnh"
let sourceSelector = null;        // Thẻ <select> chọn nguồn
let startButton = null;           // Nút "Bắt đầu / Chọn"
let onCaptureSuccessCallback = null; // Hàm callback khi chụp ảnh thành công

/**
 * Liệt kê các thiết bị video đầu vào và điền vào thẻ select.
 * Hàm này có thể được gọi lại để cập nhật label sau khi có quyền.
 * @param {string} selectorId - ID của thẻ select.
 */
async function populateVideoSources(selectorId) {
    const selector = document.getElementById(selectorId);
    if (!selector) {
        console.error(`[VideoCapture] Video source selector #${selectorId} not found.`);
        return;
    }

    // Lưu lại giá trị đang chọn (nếu có) để thử chọn lại sau khi cập nhật
    const previouslySelectedDeviceId = selector.value;
    selector.innerHTML = '<option value="">-- Chọn Nguồn Video --</option>'; // Xóa các option cũ

    try {
        if (!navigator.mediaDevices?.enumerateDevices) {
            throw new Error("API enumerateDevices() không được hỗ trợ trên trình duyệt này.");
        }
        const devices = await navigator.mediaDevices.enumerateDevices();

        // Log chi tiết các thiết bị tìm thấy để debug
        console.log("[VideoCapture] Processing Devices Found:");
        let foundVideoInput = false;
        if (devices && devices.length > 0) {
            devices.forEach((device, index) => {
                console.log(`  Device #${index + 1}: Kind: ${device.kind}, Label: ${device.label || '(Trống - Chưa cấp quyền?)'}, ID: ${device.deviceId.substring(0,10)}...`);
                if (device.kind === 'videoinput') {
                    foundVideoInput = true;
                    const option = document.createElement('option');
                    option.value = device.deviceId;
                    // Hiển thị label nếu có, nếu không thì hiển thị tên chung chung
                    option.text = device.label || `Camera ${index + 1}`;
                    selector.appendChild(option);
                }
            });
        } else {
            console.log("  No devices found by enumerateDevices.");
        }

        if (!foundVideoInput) {
             showNotification("Không tìm thấy thiết bị video đầu vào nào.", "warning");
        }

        // Thử chọn lại thiết bị đã chọn trước đó (nếu label đã được cập nhật)
        if (previouslySelectedDeviceId) {
            selector.value = previouslySelectedDeviceId;
        }

        console.log("[VideoCapture] Populated video sources.");

    } catch (err) {
        console.error("[VideoCapture] Error enumerating devices:", err);
        showNotification(`Lỗi liệt kê thiết bị video: ${err.message}`, "error");
        const option = document.createElement('option');
        option.value = ""; option.text = "Lỗi lấy danh sách"; option.disabled = true;
        selector.appendChild(option);
    }
}

/**
 * Dừng luồng video hiện tại (nếu có) và cập nhật UI.
 */
function stopVideoStream() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        console.log("[VideoCapture] Video stream stopped.");
    }
    currentStream = null;
    if (videoElement) {
        videoElement.srcObject = null;
        videoElement.style.display = 'none'; // Ẩn video
        videoElement.onloadedmetadata = null; // Xóa handler cũ
        videoElement.onerror = null; // Xóa handler cũ
    }
     if (captureButton) {
        captureButton.disabled = true; // Vô hiệu hóa nút chụp
    }
    // Không cần thông báo khi chỉ dừng stream
}

/**
 * Bắt đầu luồng video từ thiết bị được chọn.
 * Sẽ gọi lại populateVideoSources sau khi thành công để cập nhật label.
 * @param {string} deviceId - ID của thiết bị video.
 * @param {string} sourceSelectorId - ID của thẻ select nguồn video (để cập nhật lại).
 */
async function startVideoStream(deviceId, sourceSelectorId) {
    stopVideoStream(); // Dừng stream cũ

    if (!videoElement) {
        console.error("[VideoCapture] Video element reference is missing.");
        showNotification("Lỗi: Không tìm thấy thẻ video.", "error");
        return;
    }
    if (!captureButton) console.warn("[VideoCapture] Capture button reference is missing.");

    const constraints = { video: { deviceId: deviceId ? { exact: deviceId } : undefined } };

    console.log("[VideoCapture] Requesting video stream with constraints:", constraints);
    showNotification("Đang khởi động camera/capture card...", "info", 1500);
    if(startButton) startButton.disabled = true; // Vô hiệu hóa nút Start tạm thời
    if(sourceSelector) sourceSelector.disabled = true; // Vô hiệu hóa chọn lựa tạm thời

    try {
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        videoElement.srcObject = currentStream;
        videoElement.style.display = 'block';
        videoElement.play();

        videoElement.onloadedmetadata = () => {
             console.log(`[VideoCapture] Stream started. Resolution: ${videoElement.videoWidth}x${videoElement.videoHeight}`);
             if (captureButton) captureButton.disabled = false;
             showNotification("Bắt đầu xem trước video thành công!", "success", 2000);

             // *** QUAN TRỌNG: Gọi lại populateVideoSources để cập nhật label ***
             if (sourceSelectorId) {
                 console.log("[VideoCapture] Refreshing video source list after permission grant...");
                 populateVideoSources(sourceSelectorId); // Cập nhật dropdown với label mới (nếu có)
             }
             // Kích hoạt lại nút và select sau khi stream chạy
             if(startButton) startButton.disabled = false;
             if(sourceSelector) sourceSelector.disabled = false;
        };
         videoElement.onerror = (e) => {
            console.error("[VideoCapture] Video element error:", e);
            showNotification("Lỗi khi phát video.", "error");
            stopVideoStream(); // Dừng nếu có lỗi
             if(startButton) startButton.disabled = false; // Kích hoạt lại nút
             if(sourceSelector) sourceSelector.disabled = false;
        };

    } catch (err) {
        console.error("[VideoCapture] Error accessing media devices:", err);
        stopVideoStream(); // Dừng nếu lỗi
        let message = `Lỗi truy cập camera: ${err.name}`;
        // ... (Các thông báo lỗi chi tiết như phiên bản trước) ...
        if (err.name === 'NotAllowedError') message = 'Bạn đã từ chối quyền truy cập camera.';
        else if (err.name === 'NotFoundError') message = 'Không tìm thấy camera được chọn.';
        else if (err.name === 'NotReadableError') message = 'Không thể đọc tín hiệu từ camera (đang được dùng?).';
        else if (err.name === 'OverconstrainedError') message = `Thiết bị không hỗ trợ cấu hình yêu cầu: ${err.constraint}`;
        showNotification(message, "error", 6000);
        // Kích hoạt lại nút và select nếu lỗi
        if(startButton) startButton.disabled = false;
        if(sourceSelector) sourceSelector.disabled = false;
    }
}

/**
 * Chụp khung hình hiện tại từ video và gọi callback onCaptureSuccess.
 */
function captureFrame() {
    if (!currentStream || !videoElement || !canvasElement) {
        console.error("[VideoCapture] Cannot capture: stream, video or canvas missing.");
        showNotification("Lỗi: Không thể chụp ảnh.", "error");
        return;
    }
     if (videoElement.paused || videoElement.ended || !videoElement.videoWidth || !videoElement.videoHeight || videoElement.readyState < 2) { // HAVE_CURRENT_DATA
        console.warn("[VideoCapture] Cannot capture frame: Video not ready.");
        showNotification("Video chưa sẵn sàng để chụp.", "warning");
        return;
    }

    console.log("[VideoCapture] Capturing frame...");
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    try {
        const context = canvasElement.getContext('2d');
        // Đảm bảo không vẽ ảnh từ nguồn không an toàn (dù ở đây là video stream nên thường ok)
        context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
        const dataUrl = canvasElement.toDataURL('image/png'); // Dùng PNG cho chất lượng tốt nhất
        console.log("[VideoCapture] Frame captured successfully.");

        if (typeof onCaptureSuccessCallback === 'function') {
            onCaptureSuccessCallback(dataUrl); // Gọi callback với dữ liệu ảnh
        } else {
            console.warn("[VideoCapture] onCaptureSuccess callback not defined.");
            showNotification("Đã chụp ảnh nhưng không có hành động xử lý.", "warning");
        }
    } catch (e) {
         console.error("[VideoCapture] Error drawing video frame or creating Data URL:", e);
         showNotification("Lỗi khi tạo dữ liệu ảnh chụp.", "error");
    }
}

/**
 * Hàm khởi tạo chính cho module video capture.
 * @param {object} options - Đối tượng chứa các ID của element và callback.
 * @param {string} options.videoElementId - ID của thẻ <video>.
 * @param {string} options.canvasElementId - ID của thẻ <canvas> ẩn.
 * @param {string} options.captureButtonId - ID của nút chụp ảnh.
 * @param {string} options.sourceSelectorId - ID của thẻ <select> chọn nguồn video.
 * @param {string} options.startButtonId - ID của nút bắt đầu/chọn nguồn.
 * @param {function(string)} options.onCaptureSuccess - Hàm callback được gọi khi chụp ảnh thành công, nhận tham số là dataUrl.
 */
export function initVideoCapture(options) {
    console.log("[VideoCapture] Initializing with options:", options);

    // Gán các biến toàn cục của module
    videoElement = document.getElementById(options.videoElementId);
    canvasElement = document.getElementById(options.canvasElementId);
    captureButton = document.getElementById(options.captureButtonId);
    sourceSelector = document.getElementById(options.sourceSelectorId); // Gán vào biến module
    startButton = document.getElementById(options.startButtonId); // Gán vào biến module
    onCaptureSuccessCallback = options.onCaptureSuccess;

    if (!videoElement || !canvasElement || !captureButton || !sourceSelector || !startButton) {
        console.error("[VideoCapture] Initialization failed: One or more required element IDs not found.");
        showNotification("Lỗi khởi tạo giao diện Video Capture.", "error");
        // Vô hiệu hóa các nút liên quan nếu có thể tìm thấy
        if(startButton) startButton.disabled = true;
        if(captureButton) captureButton.disabled = true;
        if(sourceSelector) sourceSelector.disabled = true;
        return;
    }

     captureButton.disabled = true; // Vô hiệu hóa nút chụp ban đầu

    // Điền danh sách nguồn video vào selector (lần đầu)
    populateVideoSources(options.sourceSelectorId);

    // Thêm sự kiện cho nút Bắt đầu/Chọn nguồn
    startButton.addEventListener('click', () => {
        const selectedDeviceId = sourceSelector.value;
        if (!selectedDeviceId) {
            stopVideoStream();
            showNotification("Vui lòng chọn một nguồn video.", "info");
        } else {
            // Truyền cả ID của selector để hàm startVideoStream có thể gọi lại populateVideoSources
            startVideoStream(selectedDeviceId, options.sourceSelectorId);
        }
    });

    // Thêm sự kiện cho nút Chụp ảnh
    captureButton.addEventListener('click', captureFrame);

    console.log("[VideoCapture] Initialization complete. Waiting for user action.");
}

// Log khi module được tải
console.log("video-capture.js loaded.");
