import React, { useEffect } from "react";
import ZefeLogo from "@/components/svgs/logo";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      onComplete?.();
    }, 10000);
    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#ff7e5f] to-[#feb47b] animate-fade-in">
      <div className="animate-scale-in">
        <ZefeLogo />
      </div>

      <p className="mt-2 text-sm tracking-widest uppercase delay-200 text-white/70 animate-slide-in">
        Empowering Your Web3 Network
      </p>
    </div>
  );
};

export default SplashScreen;
