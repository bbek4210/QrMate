"use client";
import UserProfileContainer from "@/components/user-profile/user-profile-container";
import UserProfileFooter from "@/components/user-profile/user-profile-footer";
import UserProfileHeader from "@/components/user-profile/user-profile-header";

const UserProfilePage = () => {
  return (
    <main className="px-4 py-3 h-[100dvh] flex flex-col pt-4">
      <UserProfileHeader />
      <UserProfileContainer />
      <UserProfileFooter />
    </main>
  );
};

export default UserProfilePage;
