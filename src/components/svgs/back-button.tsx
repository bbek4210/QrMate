import { useNavigate } from "react-router-dom";

const BackButtonSvg = () => {
  const navigate = useNavigate();

  return (
    <svg
      onClick={() => navigate(-1)} // simulates "go back"
      width="16"
      height="13"
      viewBox="0 0 16 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="cursor-pointer"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.71674 12.6668C7.24742 13.1111 6.4865 13.1111 6.01718 12.6668L0.351989 7.30437C-0.117331 6.86013 -0.117331 6.13987 0.351989 5.69563L6.01718 0.33318C6.4865 -0.11106 7.24742 -0.11106 7.71674 0.33318C8.18606 0.77742 8.18606 1.49768 7.71674 1.94192L4.1031 5.36245H14.7982C15.462 5.36245 16 5.87175 16 6.5C16 7.12825 15.462 7.63755 14.7982 7.63755H4.1031L7.71674 11.0581C8.18606 11.5023 8.18606 12.2226 7.71674 12.6668Z"
        fill="#ffffff"
      />
    </svg>
  );
};

export default BackButtonSvg;
