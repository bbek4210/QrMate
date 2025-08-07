"use client";
import UserProfileContainer from "@/components/user-profile/user-profile-container";
import UserProfileFooter from "@/components/user-profile/user-profile-footer";
import UserProfileHeader from "@/components/user-profile/user-profile-header";

const UserProfilePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#232223] via-[#1a1a1a] to-[#2d2d2d] overflow-y-auto">
      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="max-w-8xl mx-auto px-8 py-8">
          <UserProfileHeader />
          <div className="mt-8 mb-8">
            <UserProfileContainer />
          </div>
          <div className="mt-12">
            <UserProfileFooter />
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="px-4 py-3 min-h-screen flex flex-col">
          <UserProfileHeader />
          <div className="flex-1 overflow-y-auto py-4">
            <UserProfileContainer />
          </div>
          <div className="mt-8 pb-6">
            <UserProfileFooter />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
