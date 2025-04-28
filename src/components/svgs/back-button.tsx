import { useNavigate } from "react-router-dom";
import React from "react";

interface BackButtonSvgProps {
  to?: string;
  fallback?: number;
}

const BackButtonSvg: React.FC<BackButtonSvgProps> = ({ to, fallback = -1 }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(fallback);
    }
  };

  return (
    <img
      src="/backbutton.svg"
      alt="Back"
      onClick={handleClick}
      className="cursor-pointer"
      style={{ width: "16px", height: "13px" }}
    />
  );
};
export default BackButtonSvg;
