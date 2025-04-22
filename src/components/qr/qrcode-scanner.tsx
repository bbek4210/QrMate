import React, { useEffect, useState } from "react";
import QrReader from "react-qr-reader";
import toast from "react-hot-toast";

const QRCodeScanner = ({
  isScannerOpen,
  onScanSuccess,
}: {
  isScannerOpen: boolean;
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
        const url = new URL(result);
        const startapp = url.searchParams.get("startapp");

        if (startapp) {
          const parsed = Object.fromEntries(
            new URLSearchParams(decodeURIComponent(startapp))
          );
          setHasShownInvalidToast(false); // Reset for future invalids
          onScanSuccess(parsed);
        } else if (!hasShownInvalidToast) {
          toast.error("Invalid QR code (missing startapp param)");
          setHasShownInvalidToast(true);
        }
      } catch (e) {
        if (!hasShownInvalidToast) {
          toast.error("Invalid QR format");
          setHasShownInvalidToast(true);
        }
        console.error(e);
      }
    }
  };

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
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded">
          {scanError}
        </div>
      )}
    </div>
  );
};

export default QRCodeScanner;
