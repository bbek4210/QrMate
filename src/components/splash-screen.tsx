"use client";

import React from "react";
import ZefeLogo from "./svgs/logo";

const SplashScreen: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-[#5D4FFF]">
      <div className="animate-fade-in">
        <ZefeLogo />
      </div>
    </div>
  );
};

export default SplashScreen;
