type CrossIconProps = {
  onClick?: () => void;
};
const CrossIcon: React.FC<CrossIconProps> = ({ onClick }) => {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      onClick={onClick}
      style={{ cursor: "pointer" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.96745 2.96745C3.38238 2.55252 4.05512 2.55252 4.47005 2.96745L8.5 6.9974L12.5299 2.96745C12.9449 2.55252 13.6176 2.55252 14.0325 2.96745C14.4475 3.38238 14.4475 4.05512 14.0325 4.47005L10.0026 8.5L14.0325 12.5299C14.4475 12.9449 14.4475 13.6176 14.0325 14.0325C13.6176 14.4475 12.9449 14.4475 12.5299 14.0325L8.5 10.0026L4.47005 14.0325C4.05512 14.4475 3.38238 14.4475 2.96745 14.0325C2.55252 13.6176 2.55252 12.9449 2.96745 12.5299L6.9974 8.5L2.96745 4.47005C2.55252 4.05512 2.55252 3.38238 2.96745 2.96745Z"
        fill="white"
      />
    </svg>
  );
};

export default CrossIcon;
