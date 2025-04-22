import React, {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
} from "react";
import toast from "react-hot-toast";
import { Html5Qrcode } from "html5-qrcode";

const QRCodeScanner = forwardRef(
  (
    {
      onScanSuccess,
      isScannerOpen,
    }: {
      onScanSuccess: (data: any) => void;
      isScannerOpen: boolean;
    },
    ref
  ) => {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
      if (isScannerOpen) {
        // Delay scanner start until DOM is fully ready
        requestAnimationFrame(() => {
          startScanner();
        });
      } else {
        stopScanner();
      }

      return () => {
        stopScanner();
      };
    }, [isScannerOpen]);

    useImperativeHandle(ref, () => ({
      stopScanning: stopScanner,
    }));

    const startScanner = async () => {
      const qrRegionId = "qr-reader";
      const config = {
        fps: 10,
        qrbox: {
          width: 250,
          height: 250,
        },
        aspectRatio: 0.7,
      };

      try {
        console.log("Attempting to start QR scanner...");

        // Check camera API support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          toast.error("Camera API not supported in this browser");
          return;
        }

        if (!scannerRef.current) {
          scannerRef.current = new Html5Qrcode(qrRegionId);
        } else {
          await scannerRef.current.stop();
          await scannerRef.current.clear();
        }

        await scannerRef.current.start(
          { facingMode: "environment" },
          config,
          (decodedText: string) => {
            handleScannedText(decodedText);
            stopScanner();
          },
          undefined
        );

      } catch (error: any) {
        console.error("Failed to start QR scanner:", error);
        if (!error.message?.toLowerCase().includes("camera")) return;
        toast.error("Failed to access camera");
      }
    };

    const handleScannedText = (decodedText: string) => {
      try {
        const url = new URL(decodedText);
        const startapp = url.searchParams.get("startapp");

        if (startapp) {
          const parsed = Object.fromEntries(
            new URLSearchParams(decodeURIComponent(startapp))
          );
          onScanSuccess(parsed);
        } else {
          toast.error("Invalid QR code (missing startapp parameter)");
        }
      } catch (err) {
        console.error("Invalid QR format:", err);
        toast.error("Invalid QR code format");
      }
    };

    const stopScanner = async () => {
      try {
        if (scannerRef.current) {
          await scannerRef.current.stop();
          await scannerRef.current.clear();
          scannerRef.current = null;
        }
      } catch (error) {
        console.error("Error stopping scanner:", error);
      }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const qr = new Html5Qrcode("qr-image-reader");
        const result = await qr.scanFile(file, true);
        handleScannedText(result);
        await qr.clear();
      } catch (err) {
        toast.error("Failed to scan QR from image");
        console.error(err);
      }
    };

    return (
      <div className="relative w-full h-[70vh] mt-4">
        <div
          id="qr-reader"
          className="w-full h-full"
          style={{ backgroundColor: "transparent" }}
        />
        {/* Optional visible scanner frame */}
        {/* <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-4 border-green-500 rounded-xl w-56 h-56 z-10 pointer-events-none" /> */}

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
          <button
            className="bg-white text-black px-4 py-2 mb-6 font-semibold rounded-full shadow"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload QR Image
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
          />
          <div id="qr-image-reader" style={{ display: "none" }} />
        </div>
      </div>
    );
  }
);

QRCodeScanner.displayName = "QRCodeScanner";
export default QRCodeScanner;
