import { useState, useEffect, useRef } from "react";
import "./QRScanner.css";

interface Location {
  _id: string;
  floor: number;
  block: string;
  rooms: {
    number: string;
    code: string;
  }[];
  closestBlocks: string[];
  closestRooms: string[];
  qrCodeRef: string;
  createdAt: string;
  updatedAt: string;
}

interface QRScannerProps {
  onScanSuccess: (location: Location) => void;
  onClose: () => void;
}

function QRScanner({ onScanSuccess, onClose }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [Html5Qrcode, setHtml5Qrcode] = useState<any>(null);
  const [libraryLoaded, setLibraryLoaded] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const html5QrCodeRef = useRef<any>(null);

  // Load html5-qrcode dynamically
  useEffect(() => {
    import("html5-qrcode").then((module: any) => {
      setHtml5Qrcode(() => module.Html5Qrcode);
      setLibraryLoaded(true);
    }).catch((err) => {
      console.error("Failed to load html5-qrcode:", err);
      setLibraryLoaded(false);
    });
  }, []);

  // Enumerate available devices
  useEffect(() => {
    const enumerateDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setAvailableDevices(videoDevices);
        console.log('Available video devices:', videoDevices);
        
        // Auto-select OBS virtual camera if available
        const obsDevice = videoDevices.find(device => 
          device.label.toLowerCase().includes('obs') || 
          device.label.toLowerCase().includes('virtual')
        );
        if (obsDevice) {
          setSelectedDeviceId(obsDevice.deviceId);
        }
      } catch (err) {
        console.error('Failed to enumerate devices:', err);
      }
    };

    enumerateDevices();
    
    // Listen for device changes
    navigator.mediaDevices.addEventListener('devicechange', enumerateDevices);
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', enumerateDevices);
    };
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current
          .stop()
          .then(() => {
            if (html5QrCodeRef.current) {
              html5QrCodeRef.current.clear();
            }
          })
          .catch((err: any) => {
            console.error("Error stopping scanner:", err);
          })
          .finally(() => {
            html5QrCodeRef.current = null;
          });
      }
    };
  }, []);

  const handleManualInput = async () => {
    if (!manualInput.trim()) {
      setError("Please enter a QR code reference");
      return;
    }

    try {
      setError("");
      // Fetch location data from API
      const res = await fetch(`/api/locations/qr/${encodeURIComponent(manualInput.trim())}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Location not found");
      }

      const location = await res.json();
      onScanSuccess(location);
      setManualInput("");
    } catch (err: any) {
      setError(`Location not found: ${manualInput}. ${err.message}`);
    }
  };

  const startScanning = async () => {
    if (!Html5Qrcode || !libraryLoaded) {
      setError("QR scanner library not loaded yet. Please wait a moment and try again.");
      return;
    }

    try {
      setError("");
      
      if (availableDevices.length === 0) {
        setError("No camera devices found. Please ensure your OBS virtual camera is enabled.");
        return;
      }

      // Try to get camera permissions with selected device
      let stream;
      try {
        const constraints: MediaStreamConstraints = {
          video: selectedDeviceId 
            ? { deviceId: { exact: selectedDeviceId } }
            : { facingMode: "user" }
        };
        
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('Camera stream obtained successfully');
      } catch (permErr: any) {
        console.error('Camera permission error:', permErr);
        
        // Try fallback without device ID
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          console.log('Camera stream obtained with fallback constraints');
        } catch (fallbackErr: any) {
          console.error('Fallback camera permission error:', fallbackErr);
          
          if (fallbackErr.name === 'NotAllowedError' || fallbackErr.name === 'PermissionDeniedError') {
            setError(`Camera permission denied. Please:\n1. Allow camera access in your browser\n2. Enable OBS virtual camera in OBS settings\n3. Start OBS virtual camera\n4. Refresh the page and try again`);
          } else if (fallbackErr.name === 'NotFoundError' || fallbackErr.name === 'DevicesNotFoundError') {
            setError("No camera found. Please ensure OBS virtual camera is running and enabled.");
          } else {
            setError(`Camera error: ${fallbackErr.message}. Try refreshing the page and ensuring OBS virtual camera is active.`);
          }
          return;
        }
      }
      
      // Stop the stream immediately, html5-qrcode will start its own
      stream.getTracks().forEach(track => track.stop());

      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      // Use selected device or default config
      const cameraConfig = selectedDeviceId 
        ? { deviceId: selectedDeviceId }
        : { facingMode: "user" };

      await html5QrCode.start(
        cameraConfig,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText: any) => {
          // QR code scanned successfully
          handleQRCodeScanned(decodedText);
        },
        (_errorMessage: any) => {
          // Ignore scanning errors (they're frequent while scanning)
        }
      );

      setScanning(true);
    } catch (err: any) {
      console.error("Error starting scanner:", err);
      setError(`Failed to start camera: ${err.message}. Please ensure OBS virtual camera is properly configured.`);
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
        setScanning(false);
      } catch (err) {
        console.error("Error stopping scanner:", err);
        // Even if stop fails, clear the reference
        html5QrCodeRef.current = null;
        setScanning(false);
      }
    }
  };

  const handleClose = async () => {
    try {
      // Stop scanning if active
      await stopScanning();
    } catch (err) {
      console.error("Error during close cleanup:", err);
    }
    // Clear any errors
    setError("");
    setManualInput("");
    // Call the onClose callback
    onClose();
  };

  const handleQRCodeScanned = async (qrCodeRef: string) => {
    // Stop scanning once we get a result
    await stopScanning();

    try {
      // Fetch location data from API
      const res = await fetch(`/api/locations/qr/${encodeURIComponent(qrCodeRef)}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Location not found");
      }

      const location = await res.json();

      // Call success callback
      onScanSuccess(location);
    } catch (err: any) {
      setError(`Location not found for QR code: ${qrCodeRef}. ${err.message}`);
      // Don't auto-restart, let user decide
    }
  };

  return (
    <div className="qr-scanner-overlay" onClick={handleClose}>
      <div className="qr-scanner-modal" onClick={(e) => e.stopPropagation()}>
        <div className="qr-scanner-header">
          <h2>QR Code Scanner</h2>
          <button className="close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="qr-scanner-content">
          {/* Camera Scanner Section */}
          <div className="scanner-section">
            {libraryLoaded ? (
              <>
                {availableDevices.length > 1 && (
                  <div className="device-selector">
                    <label className="device-label">Select Camera:</label>
                    <select
                      value={selectedDeviceId}
                      onChange={(e) => setSelectedDeviceId(e.target.value)}
                      className="device-select"
                    >
                      <option value="">Auto-select</option>
                      {availableDevices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Camera ${device.deviceId.slice(0, 8)}...`}
                          {device.label.toLowerCase().includes('obs') && ' 📹'}
                          {device.label.toLowerCase().includes('virtual') && ' 🔮'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div id="qr-reader" className="qr-reader-container"></div>
                {!scanning ? (
                  <button className="start-scan-btn" onClick={startScanning}>
                    Start Camera
                  </button>
                ) : (
                  <button className="stop-scan-btn" onClick={stopScanning}>
                    Stop Scanning
                  </button>
                )}
              </>
            ) : (
              <div className="scanner-placeholder">
                <div className="scanner-icon">📱</div>
                <p className="scanner-text">Loading QR Scanner Library...</p>
                <button className="start-scan-btn" disabled>
                  Please Wait
                </button>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="scanner-divider">
            <span>OR</span>
          </div>

          {/* Manual Input Section */}
          <div className="manual-section">
            <h3>Manual QR Code Entry</h3>
            <p className="manual-description">
              Enter the QR code reference manually (e.g., QR-001, LAB-A1, ROOM-7B-16)
            </p>
            <div className="manual-input-group">
              <input
                type="text"
                placeholder="Enter QR code reference..."
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                className="manual-input"
                onKeyPress={(e) => e.key === 'Enter' && handleManualInput()}
              />
              <button
                onClick={handleManualInput}
                disabled={!manualInput.trim()}
                className="manual-search-btn"
              >
                Search
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="error-message">
              {error}
              <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
                <button
                  className="retry-btn"
                  onClick={() => {
                    setError("");
                    if (libraryLoaded && !scanning) {
                      startScanning();
                    }
                  }}
                  style={{ flex: 1 }}
                >
                  Try Again
                </button>
                <button
                  className="close-error-btn"
                  onClick={handleClose}
                  style={{ flex: 1 }}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="instructions">
            <h4>How to use:</h4>
            <ol>
              <li><strong>OBS Setup:</strong> Start OBS virtual camera and ensure it's running</li>
              <li><strong>Camera Selection:</strong> Choose your OBS virtual camera from the dropdown</li>
              <li><strong>Camera Scanner:</strong> Click "Start Camera" to scan QR codes</li>
              <li><strong>Manual Entry:</strong> Enter QR code reference manually and click "Search"</li>
              <li><strong>QR Code Format:</strong> Usually formatted as QR-001, LAB-A1, or similar patterns</li>
            </ol>
            <div className="obs-tips">
              <h5>OBS Virtual Camera Tips:</h5>
              <ul>
                <li>Start OBS before opening the QR scanner</li>
                <li>Enable "Virtual Camera" in OBS settings</li>
                <li>Set a scene with content for the virtual camera</li>
                <li>If permission denied, refresh the page after starting OBS</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QRScanner;
