"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import BackButtonSvg from "../svgs/back-button";
import LogoutIcon from "../svgs/logout-icon";

const UserProfileHeader = () => {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <BackButtonSvg to="/" />
        <h2 className="text-[#ffffff] text-[24px] font-medium">Your profile</h2>
      </div>
      <button
        onClick={handleLogout}
        className="p-1 hover:bg-gray-800 rounded-full transition-colors"
        title="Logout"
      >
        <LogoutIcon size={20} />
      </button>
    </div>
  );
};

export default UserProfileHeader;
