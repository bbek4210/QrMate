"use client";
import BackButtonSvg from "../svgs/back-button";
import LogoutButtonSvg from "../svgs/logout-button";

const UserProfileHeader = () => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <BackButtonSvg />
        <h2 className="text-[#ffffff] text-[24px] font-medium">Your profile</h2>
      </div>
      {/* <LogoutButtonSvg /> */}
    </div>
  );
};

export default UserProfileHeader;
