import { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";

const FancyQRCode = ({ value }: { value: string }) => {
  const ref = useRef<HTMLDivElement>(null);

  const qrCode = useRef(
    new QRCodeStyling({
      width: 256,
      height: 256,
      type: "svg",
      data: value,
      image: "/zefelogo.png",
      dotsOptions: {
        color: "#000000",
        type: "rounded",
      },
      cornersSquareOptions: {
        color: "#ED2944",
        type: "extra-rounded",
      },
      cornersDotOptions: {
        color: "#ED2944",
      },
      backgroundOptions: {
        color: "#ffffff",
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 8,
        imageSize: 0.22,
        // @ts-expect-error excavate not in type but supported
        excavate: true,
      },

      qrOptions: {
        errorCorrectionLevel: "H",
      },
    })
  );

  useEffect(() => {
    qrCode.current.update({ data: value });
    if (ref.current) {
      ref.current.innerHTML = "";
      qrCode.current.append(ref.current);
    }
  }, [value]);

  return (
    <div className="flex flex-col items-center animate-fade-in">
      <div ref={ref}></div>
    </div>
  );
};

export default FancyQRCode;
