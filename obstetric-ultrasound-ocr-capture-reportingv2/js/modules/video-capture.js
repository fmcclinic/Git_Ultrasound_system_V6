// js/modules/video-capture.js
// Module xử lý video capture từ thiết bị, tích hợp logic camera từ webcam.html
// nhưng vẫn giữ luồng xử lý ảnh qua callback. Bao gồm log debug chi tiết và xử lý deviceId rỗng.

import { showNotification } from '../core/ui-core.js';

// Biến lưu trữ trạng thái
let currentStream = null;
let videoElement = null;        // Thẻ <video> để hiển thị luồng chính
let captureButton = null;       // Nút "Chụp ảnh" chính
let sourceSelector = null;      // Thẻ <select> chọn nguồn
let startButton = null;         // Nút "Bắt đầu / Chọn"
let onCaptureSuccessCallback = null; // Callback khi chụp thành công

/**
 * Liệt kê các thiết bị video đầu vào và điền vào thẻ select.
 * Bao gồm log debug chi tiết và bỏ qua thiết bị có ID rỗng.
 * @param {string} selectorId - ID của thẻ select.
 */
async function populateVideoSources(selectorId) {
    console.log("[VideoCapture] DEBUG: populateVideoSources CALLED for selector:", selectorId); // Log bắt đầu hàm
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
        console.log("[VideoCapture] DEBUG: Devices found by enumerateDevices:", devices); // Log tất cả thiết bị tìm thấy

        let foundVideoInput = false;
        if (devices && devices.length > 0) {
            devices.forEach((device, index) => {
                // Log chi tiết từng thiết bị
                console.log(`[VideoCapture] DEBUG: Checking device ${index}: Kind='${device.kind}', Label='${device.label}', ID='${device.deviceId}'`);
                if (device.kind === 'videoinput') {
                    // Quan trọng: Kiểm tra xem deviceId có rỗng không trước khi thêm
                    if (!device.deviceId) {
                        console.warn(`[VideoCapture] DEBUG: Device ID is empty for video input device: ${device.label || '[No Label]'}. Skipping this device.`);
                        // Không thêm option nếu ID rỗng, vì nó sẽ gây lỗi khi chọn
                        return; // Bỏ qua thiết bị này trong vòng lặp forEach
                    }
                    // Chỉ thêm nếu deviceId hợp lệ
                    foundVideoInput = true;
                    console.log(`[VideoCapture] DEBUG: FOUND valid videoinput: Label='${device.label || '[No Label]'}', ID='${device.deviceId}'`); // Log khi tìm thấy video hợp lệ
                    const option = document.createElement('option');
                    option.value = device.deviceId;
                    option.text = device.label || `Camera ${index + 1}`;
                    selector.appendChild(option);
                }
            });
        } else {
             console.log("[VideoCapture] DEBUG: No devices found by enumerateDevices.");
        }


        if (!foundVideoInput) {
             // Thông báo này có thể hiện nếu TẤT CẢ camera đều có ID rỗng
             showNotification("Không tìm thấy thiết bị video hợp lệ (có ID).", "warning");
             console.log("[VideoCapture] DEBUG: No valid video input devices found after looping (or all had empty IDs).");
        }

        // Thử chọn lại thiết bị đã chọn trước đó (nếu nó hợp lệ và được thêm vào)
        if (previouslySelectedDeviceId) {
             if ([...selector.options].some(opt => opt.value === previouslySelectedDeviceId)) {
                 selector.value = previouslySelectedDeviceId;
                 console.log(`[VideoCapture] DEBUG: Restored previous selection: ${previouslySelectedDeviceId}`);
             } else {
                 console.log(`[VideoCapture] DEBUG: Previous device ID ${previouslySelectedDeviceId} not found in new list (possibly skipped due to empty ID).`);
             }
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
        videoElement.style.display = 'none';
        videoElement.onloadedmetadata = null;
        videoElement.onerror = null;
    }
     if (captureButton) {
        captureButton.disabled = true;
    }
}

/**
 * Bắt đầu luồng video từ thiết bị được chọn HOẶC camera mặc định.
 * Gọi lại populateVideoSources sau khi thành công để cập nhật ID (nếu có).
 * @param {string | null} deviceId - ID của thiết bị video hoặc null để dùng mặc định.
 * @param {string} sourceSelectorId - ID của thẻ select nguồn video.
 */
async function startVideoStream(deviceId, sourceSelectorId) {
    console.log(`[VideoCapture] DEBUG: startVideoStream called with deviceId: ${deviceId === null ? "[Generic Request]" : deviceId}`); // Log rõ ràng hơn
    stopVideoStream(); // Dừng stream cũ (nếu có)

    if (!videoElement) {
        console.error("[VideoCapture] Video element reference is missing.");
        showNotification("Lỗi: Không tìm thấy thẻ video.", "error");
        return;
    }
    if (!captureButton) console.warn("[VideoCapture] Capture button reference is missing.");

    // Xác định constraints dựa trên deviceId
    const constraints = deviceId
        ? { video: { deviceId: { exact: deviceId } } } // Yêu cầu ID cụ thể nếu có
        : { video: true };                             // Yêu cầu video chung chung nếu ID là null/không có

    console.log("[VideoCapture] DEBUG: Requesting getUserMedia with constraints:", constraints);

    showNotification("Đang khởi động camera/capture card...", "info", 1500);
    // Vô hiệu hóa nút trong khi chờ
    if(startButton) startButton.disabled = true;
    if(sourceSelector) sourceSelector.disabled = true;

    try {
        // Gọi getUserMedia
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log("[VideoCapture] DEBUG: getUserMedia successful. Stream:", currentStream);

        videoElement.srcObject = currentStream;
        videoElement.style.display = 'block'; // Hiển thị thẻ video

        // Xử lý khi metadata (bao gồm kích thước video) đã được tải
        videoElement.onloadedmetadata = () => {
             console.log(`[VideoCapture] DEBUG: onloadedmetadata triggered. Resolution: ${videoElement.videoWidth}x${videoElement.videoHeight}`);

             // Chỉ gọi play() khi metadata đã tải xong
             videoElement.play().then(() => {
                 console.log("[VideoCapture] DEBUG: videoElement.play() successful after metadata loaded.");
                 if (captureButton) {
                     captureButton.disabled = false; // Kích hoạt nút chụp KHI video thực sự đang chạy
                     console.log("[VideoCapture] DEBUG: Capture button enabled.");
                 }
                 showNotification("Bắt đầu xem trước video thành công!", "success", 2000);

                 // GỌI LẠI populateVideoSources SAU KHI THÀNH CÔNG
                 // Hy vọng lúc này deviceId đã được trả về đúng
                 if (sourceSelectorId) {
                     console.log("[VideoCapture] DEBUG: Refreshing video source list AFTER successful stream start...");
                     populateVideoSources(sourceSelectorId); // << Quan trọng: Cập nhật lại dropdown
                 }

             }).catch(playError => {
                 console.error("[VideoCapture] DEBUG: videoElement.play() FAILED:", playError);
                 showNotification(`Lỗi khi bắt đầu phát video: ${playError.message}`, "error");
                 stopVideoStream(); // Dừng lại nếu không play được
             });
        };

         // Xử lý lỗi từ chính thẻ video
         videoElement.onerror = (e) => {
            console.error("[VideoCapture] DEBUG: Video element error event:", e);
            showNotification("Lỗi khi phát video (event error).", "error");
            stopVideoStream(); // Dừng nếu có lỗi
        };

    } catch (err) {
        // Xử lý lỗi từ getUserMedia
        console.error("[VideoCapture] DEBUG: getUserMedia FAILED:", err);
        stopVideoStream(); // Dừng stream (dù có thể chưa chạy)
        let message = `Lỗi truy cập camera: ${err.name}`;
        // ... (các thông báo lỗi chi tiết như trước) ...
        if (err.name === 'NotAllowedError') message = 'Bạn đã từ chối quyền truy cập camera.';
        else if (err.name === 'NotFoundError') message = 'Không tìm thấy camera được chọn hoặc ID không hợp lệ.';
        else if (err.name === 'NotReadableError') message = 'Không thể đọc tín hiệu từ camera (đang được dùng?).';
        else if (err.name === 'OverconstrainedError') message = `Thiết bị không hỗ trợ cấu hình yêu cầu: ${err.constraint}`;
        else if (err.name === 'AbortError') message = 'Yêu cầu camera bị hủy.';
        else if (err.name === 'SecurityError') message = 'Lỗi bảo mật khi truy cập camera.';
        else if (err.name === 'TypeError' && err.message.includes('deviceId')) message = 'Lỗi cấu hình: ID thiết bị có thể không hợp lệ.';
        else message = `Lỗi không xác định khi gọi getUserMedia: ${err.message || err.name}`;

        showNotification(message, "error", 7000);

    } finally {
        // Đảm bảo các nút điều khiển được kích hoạt lại bất kể thành công hay thất bại
        console.log("[VideoCapture] DEBUG: startVideoStream finished (try/catch/finally).");
        if(startButton) startButton.disabled = false;
        if(sourceSelector) sourceSelector.disabled = false;
        console.log(`[VideoCapture] DEBUG: Start button enabled: ${!startButton?.disabled}, Selector enabled: ${!sourceSelector?.disabled}`);
    }
}

/**
 * Chụp khung hình hiện tại từ video, tạo Data URL và gọi callback onCaptureSuccess.
 * Sử dụng canvas tạm thời để tạo Data URL.
 */
function captureFrame() {
    console.log("[VideoCapture] DEBUG: captureFrame called."); // Log bắt đầu hàm
    if (!currentStream) {
        console.warn("[VideoCapture] Cannot capture: No active stream (currentStream is null).");
        showNotification("Lỗi: Chưa có luồng video nào đang chạy.", "warning");
        return;
    }
     if (!videoElement) {
        console.warn("[VideoCapture] Cannot capture: videoElement is null.");
        showNotification("Lỗi: Không tìm thấy element video.", "error");
        return;
    }
    if (videoElement.paused || videoElement.ended || !videoElement.videoWidth || videoElement.videoHeight <= 0 || videoElement.readyState < 2) { // HAVE_CURRENT_DATA = 2
        console.warn(`[VideoCapture] Cannot capture frame: Video not ready. State: ${videoElement.readyState}, Width: ${videoElement.videoWidth}, Height: ${videoElement.videoHeight}, Paused: ${videoElement.paused}, Ended: ${videoElement.ended}`);
        showNotification("Video chưa sẵn sàng để chụp.", "warning");
        return;
    }

    console.log("[VideoCapture] Capturing frame...");

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = videoElement.videoWidth;
    tempCanvas.height = videoElement.videoHeight;
    console.log(`[VideoCapture] DEBUG: Created tempCanvas ${tempCanvas.width}x${tempCanvas.height}`);

    try {
        const context = tempCanvas.getContext('2d');
        if (!context) {
             throw new Error("Could not get 2D context from temporary canvas.");
        }
        context.drawImage(videoElement, 0, 0, tempCanvas.width, tempCanvas.height);
        console.log("[VideoCapture] DEBUG: Drew video frame onto tempCanvas.");

        const dataUrl = tempCanvas.toDataURL('image/png');
        if (!dataUrl || dataUrl === 'data:,') {
             throw new Error("Failed to generate Data URL from canvas (result was empty or invalid).");
        }
        console.log("[VideoCapture] Frame captured successfully to Data URL (length approx: " + dataUrl.length + ").");

        if (typeof onCaptureSuccessCallback === 'function') {
            console.log("[VideoCapture] DEBUG: Calling onCaptureSuccessCallback.");
            onCaptureSuccessCallback(dataUrl);
        } else {
            console.warn("[VideoCapture] onCaptureSuccess callback not defined.");
            showNotification("Đã chụp ảnh nhưng không có hành động xử lý.", "warning");
        }
    } catch (e) {
         console.error("[VideoCapture] Error during captureFrame execution:", e);
         showNotification(`Lỗi khi tạo dữ liệu ảnh chụp: ${e.message}`, "error");
    }
}

/**
 * Hàm khởi tạo chính cho module video capture.
 * @param {object} options - Các ID element và callback.
 * @param {string} options.videoElementId
 * @param {string} options.canvasElementId - ID này không còn thực sự cần thiết cho việc vẽ.
 * @param {string} options.captureButtonId
 * @param {string} options.sourceSelectorId
 * @param {string} options.startButtonId
 * @param {function(string)} options.onCaptureSuccess - Callback khi chụp ảnh thành công (nhận dataUrl).
 */
export function initVideoCapture(options) {
    console.log("[VideoCapture] DEBUG: initVideoCapture CALLED with options:", options);

    videoElement = document.getElementById(options.videoElementId);
    captureButton = document.getElementById(options.captureButtonId);
    sourceSelector = document.getElementById(options.sourceSelectorId);
    startButton = document.getElementById(options.startButtonId);
    onCaptureSuccessCallback = options.onCaptureSuccess;

    console.log("[VideoCapture] DEBUG: videoElement found?", !!videoElement);
    console.log("[VideoCapture] DEBUG: captureButton found?", !!captureButton);
    console.log("[VideoCapture] DEBUG: sourceSelector found?", !!sourceSelector);
    console.log("[VideoCapture] DEBUG: startButton found?", !!startButton);
    console.log("[VideoCapture] DEBUG: onCaptureSuccessCallback provided?", typeof onCaptureSuccessCallback === 'function');

    if (!videoElement || !captureButton || !sourceSelector || !startButton) {
        console.error("[VideoCapture] Init failed: Missing required elements. Aborting initialization.");
        showNotification("Lỗi khởi tạo giao diện Video Capture. Không tìm thấy element cần thiết.", "error");
        if(startButton) startButton.disabled = true;
        if(captureButton) captureButton.disabled = true;
        if(sourceSelector) sourceSelector.disabled = true;
        return; // Dừng hẳn nếu thiếu element cốt lõi
    }

     captureButton.disabled = true;
     console.log("[VideoCapture] DEBUG: Capture button initially disabled.");

    populateVideoSources(options.sourceSelectorId); // Gọi lần đầu

    // Gắn sự kiện cho nút Bắt đầu/Chọn nguồn (ĐÃ CẬP NHẬT LOGIC XỬ LÝ KHI KHÔNG CHỌN)
    startButton.addEventListener('click', () => {
        console.log("[VideoCapture] DEBUG: Start/Select button clicked.");

        // Log giá trị trực tiếp của select element ngay khi click
        console.log(`[VideoCapture] DEBUG: Value directly from sourceSelector.value: "${sourceSelector.value}"`);

        if (sourceSelector && sourceSelector.selectedIndex >= 0 && sourceSelector.options[sourceSelector.selectedIndex]) {
            console.log(`[VideoCapture] DEBUG: Selected index: ${sourceSelector.selectedIndex}`);
            console.log(`[VideoCapture] DEBUG: Value from selected option: "${sourceSelector.options[sourceSelector.selectedIndex].value}"`);
            console.log(`[VideoCapture] DEBUG: Text from selected option: "${sourceSelector.options[sourceSelector.selectedIndex].text}"`);
        } else {
            console.log("[VideoCapture] DEBUG: Could not get selected option details (selectedIndex < 0 or options unavailable).");
        }

        const selectedDeviceId = sourceSelector.value;

        // ---- LOGIC XỬ LÝ KHI CLICK NÚT ----
        if (!selectedDeviceId) {
            console.log("[VideoCapture] DEBUG: No specific device selected from dropdown. Attempting generic video request...");
            // Gọi startVideoStream không có deviceId (dùng mặc định)
            startVideoStream(null, options.sourceSelectorId); // <<< Thay đổi quan trọng
            showNotification("Đang thử truy cập camera mặc định...", "info");
        } else {
            console.log(`[VideoCapture] DEBUG: Specific device selected (${selectedDeviceId}). Starting stream...`);
            // Gọi startVideoStream với ID cụ thể
            startVideoStream(selectedDeviceId, options.sourceSelectorId);
        }
        // ---------------------------------
    });

    // Gắn sự kiện cho nút Chụp ảnh
    captureButton.addEventListener('click', captureFrame);

    console.log("[VideoCapture] Initialization complete. Waiting for user action.");
}

// Log khi module được tải
console.log("video-capture.js loaded (v_full_debug_logs_handle_empty_id).");