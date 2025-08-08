import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { Upload, Camera, X, Sparkles } from "lucide-react";
import jsQR from "jsqr";

// Simple QR code parser function
const parseQRCode = (data: string) => {
  try {
    const url = new URL(data);
    const startapp = url.searchParams.get("startapp");
    
    if (startapp) {
      // The startapp parameter is Base64-encoded JSON
      try {
        // First decode Base64
        const decodedString = atob(startapp);
        
        // Then parse as JSON
        const parsed = JSON.parse(decodedString);
        return parsed;
      } catch (error) {
        console.error("QR Scanner: Error decoding Base64 or parsing JSON:", error);
        // If not Base64 JSON, return as is
        return { data: startapp };
      }
    }
    
    // If no startapp, try to parse the entire URL data
    return { url: data };
  } catch (error) {
    // If not a URL, return as plain text
    return { text: data };
  }
};

// Check if device is mobile
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
};

const QRCodeScanner = ({
  isScannerOpen,
  onScanSuccess,
}: {
  isScannerOpen: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onScanSuccess: (data: any) => void;
}) => {
  const [hasShownInvalidToast, setHasShownInvalidToast] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setIsMobileDevice(isMobile());
  }, []);

  useEffect(() => {
    if (isScannerOpen) {
      setHasShownInvalidToast(false);
      setShowCamera(false);
      setCameraError(null);
    }
  }, [isScannerOpen]);

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setCameraStream(stream);
      setShowCamera(true);
      setCameraError(null);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setCameraError('Camera access denied. Please use upload instead.');
      toast.error('Camera access denied. Please use upload instead.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  // Process camera frame for QR code
  const processCameraFrame = () => {
    if (!videoRef.current || !canvasRef.current || !showCamera) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.videoWidth === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx?.drawImage(video, 0, 0);

    const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
    if (imageData) {
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code) {
        try {
          const parsed = parseQRCode(code.data);
          stopCamera();
          onScanSuccess(parsed);
          toast.success("QR code successfully scanned!");
        } catch (e) {
          console.error('QR parsing error:', e);
        }
      }
    }

    if (showCamera) {
      requestAnimationFrame(processCameraFrame);
    }
  };

  useEffect(() => {
    if (showCamera && videoRef.current) {
      videoRef.current.onloadedmetadata = () => {
        processCameraFrame();
      };
    }
  }, [showCamera]);

  // Function to process uploaded QR code image
  const processQRImage = async (file: File) => {
    setIsProcessingImage(true);
    try {
      // Create a canvas to process the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        // Get image data for QR processing
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (imageData) {
          // Use jsQR to decode the QR code
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (code) {
            // Successfully decoded QR code
            try {
              const parsed = parseQRCode(code.data);
              setHasShownInvalidToast(false);
              onScanSuccess(parsed);
              toast.success("QR code successfully scanned from image!");
            } catch (e) {
              if (!hasShownInvalidToast) {
                toast.error("Invalid QR code format");
                setHasShownInvalidToast(true);
              }
              console.error(e);
            }
          } else {
            toast.error("No QR code found in the image");
          }
        }
        setIsProcessingImage(false);
      };
      
      img.src = URL.createObjectURL(file);
    } catch (error) {
      console.error("Error processing QR image:", error);
      toast.error("Failed to process QR code image");
      setIsProcessingImage(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        processQRImage(file);
      } else {
        toast.error("Please select an image file");
      }
    }
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        processQRImage(file);
      } else {
        toast.error("Please select an image file");
      }
    }
  };

  if (!isScannerOpen) return null;

  // Camera view for mobile
  if (showCamera) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        {/* Camera Header */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={stopCamera}
              className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              <X size={20} className="text-white" />
            </button>
            <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
              <h3 className="text-white font-medium">Point camera at QR code</h3>
            </div>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Camera View */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Camera Instructions */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 text-center">
            <p className="text-white text-sm mb-2">Position QR code within the frame</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowCamera(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm"
              >
                Switch to Upload
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-2xl border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="relative p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#ED2944] to-[#c41e3a] rounded-xl flex items-center justify-center">
                <Camera size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-white text-xl font-bold">QR Scanner</h2>
                <p className="text-gray-400 text-sm">
                  {isMobileDevice ? 'Camera + Upload' : 'Upload QR codes'}
                </p>
              </div>
            </div>
            <button
              onClick={() => onScanSuccess({ cancel: true })}
              className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
            >
              <X size={16} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Mobile Camera Button */}
        {isMobileDevice && (
          <div className="px-6 pb-4">
            <button
              onClick={startCamera}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg font-medium transform hover:scale-105 active:scale-95 mb-4"
            >
              <div className="flex items-center justify-center space-x-3">
                <Camera size={20} className="text-white" />
                <span>Use Camera</span>
              </div>
            </button>
            
            <div className="text-center mb-4">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
              <span className="bg-gray-800 px-3 text-gray-400 text-xs">or</span>
            </div>
          </div>
        )}

        {/* Upload Area */}
        <div className="px-6 pb-6">
          <div
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
              dragActive
                ? 'border-[#ED2944] bg-[#ED2944]/10'
                : 'border-gray-600 hover:border-gray-500'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {isProcessingImage ? (
              <div className="space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#ED2944] to-[#c41e3a] rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <Sparkles size={24} className="text-white" />
                  </div>
                  <div className="absolute inset-0 w-16 h-16 border-2 border-[#ED2944] border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
                <div>
                  <h3 className="text-white text-lg font-semibold mb-2">Processing QR Code</h3>
                  <p className="text-gray-400 text-sm">Please wait while we scan your image</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-[#ED2944] to-[#c41e3a] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Upload size={28} className="text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">+</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-white text-xl font-bold mb-2">Upload QR Code Image</h3>
                  <p className="text-gray-400 text-sm mb-6">
                    {isMobileDevice ? 'Take a photo or choose from gallery' : 'Drag & drop an image here or click to browse'}
                  </p>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-6 py-4 bg-gradient-to-r from-[#ED2944] to-[#c41e3a] text-white rounded-xl hover:from-[#c41e3a] hover:to-[#a01830] transition-all duration-200 shadow-lg font-medium transform hover:scale-105 active:scale-95"
                >
                  Choose Image File
                </button>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-800 rounded-lg p-2">
                    <p className="text-[#ED2944] text-xs font-bold">JPG</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-2">
                    <p className="text-[#ED2944] text-xs font-bold">PNG</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-2">
                    <p className="text-[#ED2944] text-xs font-bold">GIF</p>
                  </div>
                </div>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Tips Section */}
       
      </div>
    </div>
  );
};

export default QRCodeScanner;
