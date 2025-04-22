import { Link, useLocation } from "react-router-dom";
import DashboardIcon from "../svgs/dashboard-icon";
import PeopleIcon from "../svgs/people-icon";

const BottomNavbar = ({ baseOnClick}: { baseOnClick: () => void}) => {
  const location = useLocation();
  const pathname = location.pathname;

  const isDashboardActive = pathname === "/";
  const isNetworksActive = pathname.startsWith("/networks-and-connections");

  return (
    <div className="fixed bottom-4 left-0 right-0 flex items-center justify-between px-6 bg-[#232223] z-50">
      <Link to="/" aria-label="Home">
        <div onClick={baseOnClick} className="flex items-center justify-center mb-4 rounded-[37px] w-[80px] h-[60px] bg-white">
          <DashboardIcon color={isDashboardActive ? "#ED2944" : "#222222"} />
        </div>
      </Link>

      <Link to="/networks-and-connections" aria-label="Networks">
        <div onClick={baseOnClick} className="flex items-center justify-center mb-4 rounded-[37px] w-[80px] h-[60px] bg-white">
          <PeopleIcon color={isNetworksActive ? "#ED2944" : "#222222"} />
        </div>
      </Link>
    </div>
  );
};

export default BottomNavbar;
