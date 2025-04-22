import { useEffect, useState } from "react";
import TapToCompleteProfile from "./complete-profile";
import CrossIcon from "./svgs/cross-icon";

const LOCAL_STORAGE_KEY = "profile_banner_dismissed";

const ProfileBanner = () => {
  const [isProfileVisible, setIsProfileVisible] = useState(() => {
    // On first load, read from localStorage
    if (typeof window !== "undefined") {
      return localStorage.getItem(LOCAL_STORAGE_KEY) !== "true";
    }
    return true;
  });

  useEffect(() => {
    // Save to localStorage when banner is hidden
    if (!isProfileVisible) {
      localStorage.setItem(LOCAL_STORAGE_KEY, "true");
    }
  }, [isProfileVisible]);

  return (
    <>
      {isProfileVisible && (
        <div className="bg-[#5A41FF] py-4 px-3 flex items-center justify-between">
          <TapToCompleteProfile />
          <CrossIcon onClick={() => setIsProfileVisible(false)} />
        </div>
      )}
    </>
  );
};

export default ProfileBanner;
