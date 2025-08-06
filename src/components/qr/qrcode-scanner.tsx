import React, { useEffect, useState } from "react";
import QrReader from "react-qr-reader";
import toast from "react-hot-toast";

// Simple QR code parser function
const parseQRCode = (data: string) => {
  try {
    const url = new URL(data);
    const startapp = url.searchParams.get("startapp");
    
    if (startapp) {
      // Parse the startapp parameter - this could be JSON or any format
      try {
        return JSON.parse(startapp);
      } catch {
        // If not JSON, return as is
        return { data: startapp };
      }
    }
    
    // If no startapp, try to parse the entire URL data
    return { url: data };
  } catch {
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

  useEffect(() => {
    if (isScannerOpen) {
      setScanError(null);
      setHasShownInvalidToast(false);
    }
  }, [isScannerOpen]);

  const handleScan = (result: string | null) => {
    if (result) {
      try {
        const parsed = parseQRCode(result);
        setHasShownInvalidToast(false); // Reset for future invalids
        onScanSuccess(parsed);
      } catch (e) {
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

  if (!isScannerOpen) return null;

  return (
    <div className="relative w-full h-[50dvh] mt-28">
      {" "}
      {/* Increased height */}
      <QrReader
        delay={300}
        onError={handleError}
        onScan={handleScan}
        style={{ width: "100%", height: "100%" }}
        facingMode="environment"
      />
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
