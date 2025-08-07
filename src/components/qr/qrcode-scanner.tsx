import React, { useEffect, useState, useRef } from "react";
import QrReader from "react-qr-reader";
import toast from "react-hot-toast";
import { Upload, Camera } from "lucide-react";
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

const QRCodeScanner = ({
  isScannerOpen,
  onScanSuccess,
}: {
  isScannerOpen: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onScanSuccess: (data: any) => void;
}) => {
  const [scanError, setScanError] = useState<string | null>(null);
  const [hasShownInvalidToast, setHasShownInvalidToast] = useState(false);
  const [isUploadMode, setIsUploadMode] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isScannerOpen) {
      setScanError(null);
      setHasShownInvalidToast(false);
      setIsUploadMode(false);
    }
  }, [isScannerOpen]);

  const handleScan = (result: string | null) => {
    if (result) {
      try {
        const parsed = parseQRCode(result);
        setHasShownInvalidToast(false); // Reset for future invalids
        onScanSuccess(parsed);
      } catch (e) {
        console.error("QR Scanner: Error parsing QR code:", e);
        if (!hasShownInvalidToast) {
          toast.error("Invalid QR code format");
          setHasShownInvalidToast(true);
        }
        console.error(e);
      }
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleError = (err: any) => {
    console.error("QR Scan Error", err);

    if (!scanError) {
      toast.error("Camera access error or QR reading issue.");
      setScanError("Camera access error or QR reading issue.");
    }
  };

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

  if (!isScannerOpen) return null;

  return (
    <div className="relative w-full h-[50dvh] mt-28">
      {/* Mode Toggle Buttons */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex gap-2">
        <button
          onClick={() => setIsUploadMode(false)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            !isUploadMode
              ? "bg-[#ED2944] text-white"
              : "bg-white/20 text-white hover:bg-white/30"
          }`}
        >
          <Camera size={16} />
          Camera
        </button>
        <button
          onClick={() => setIsUploadMode(true)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            isUploadMode
              ? "bg-[#ED2944] text-white"
              : "bg-white/20 text-white hover:bg-white/30"
          }`}
        >
          <Upload size={16} />
          Upload
        </button>
      </div>

      {/* Camera Scanner */}
      {!isUploadMode && (
        <QrReader
          delay={300}
          onError={handleError}
          onScan={handleScan}
          style={{ width: "100%", height: "100%" }}
          facingMode="environment"
        />
      )}

      {/* Upload Mode */}
      {isUploadMode && (
        <div className="flex flex-col items-center justify-center h-full bg-gray-900">
          <div className="text-center">
            {isProcessingImage ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ED2944] mx-auto mb-4"></div>
                <p className="text-white mb-4">Processing QR code...</p>
              </>
            ) : (
              <>
                <Upload size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-white mb-4 font-medium">Upload a QR code image</p>
                <p className="text-gray-400 text-sm mb-4 max-w-xs">
                  Take a screenshot or photo of a QR code and upload it here
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-[#ED2944] text-white rounded-lg hover:bg-[#cb1f38] transition-colors"
                >
                  Choose Image
                </button>
              </>
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
      )}

      {/* Optional visual error message */}
      {scanError && (
        <div className="absolute px-4 py-2 text-white -translate-x-1/2 bg-red-500 rounded bottom-4 left-1/2">
          {scanError}
        </div>
      )}
    </div>
  );
};

export default QRCodeScanner;
