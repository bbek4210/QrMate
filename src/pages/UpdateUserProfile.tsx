import BackButtonSvg from "@/components/svgs/back-button";
import UpdateUserContainer from "@/components/user-profile/update-user-container";
import { logToDiscord } from "@/lib/axios";

const UpdateUserProfile = () => {
  const logMessage = "This is a message for Update User Profile";
  logToDiscord(logMessage);

  return (
    <main className="px-4 py-4 h-[100dvh] flex flex-col pt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButtonSvg to="/" />
          <h2 className="text-[#FFFFFF] text-[24px] font-medium">
            Update profile
          </h2>
        </div>
      </div>
      <UpdateUserContainer />
    </main>
  );
};

export default UpdateUserProfile;
