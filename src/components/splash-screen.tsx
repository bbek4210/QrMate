"use client";

import React from "react";

const SplashScreen: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-[#222222]">
      <div className="animate-fade-in">
        <img src="zefewhitelogo.svg" alt="logo" />
      </div>
    </div>
  );
};

export default SplashScreen;
