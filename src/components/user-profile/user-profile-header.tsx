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
      <div className="flex items-center gap-4">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-2 hover:bg-white/20 transition-all duration-200">
          <BackButtonSvg to="/" />
        </div>
        <div>
          <h1 className="text-white text-2xl lg:text-3xl font-bold">Your Profile</h1>
          <p className="text-gray-400 text-sm lg:text-base">Manage your account and preferences</p>
        </div>
      </div>
      
      <button
        onClick={handleLogout}
        className="bg-[#ED2944] text-white p-3 rounded-full hover:bg-[#cb1f38] transition-all duration-200 shadow-lg hover:scale-105"
        title="Logout"
      >
        <LogoutIcon size={20} />
      </button>
    </div>
  );
};

export default UserProfileHeader;
