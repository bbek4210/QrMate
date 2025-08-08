"use client";

import { useRouter } from "next/navigation";
import React from "react";

interface BackButtonSvgProps {
  to?: string;
  fallback?: number;
}

const BackButtonSvg: React.FC<BackButtonSvgProps> = ({ to, fallback = -1 }) => {
  const router = useRouter();

  const handleClick = () => {
    if (to) {
      router.push(to);
    } else {
      router.back();
    }
  };

  return (
    <svg
      onClick={handleClick}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="cursor-pointer"
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
};
export default BackButtonSvg;
