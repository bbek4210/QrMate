"use client";

import React, { useEffect } from "react";

import { useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import BackButtonSvg from "@/components/svgs/back-button";
import UserIconpeople from "@/components/svgs/userIcon";
import {
  TwitterIcon,
  LinkedinIcon,
  BlackTelegramIcon,
} from "@/components/svgs/social-icons";

import useGetConnectionProfile from "@/hooks/use-get-connected-profile";
import SelfieNoteSection from "@/components/connected-user/selfie-note-section";
import ProjectIcon from "@/components/svgs/compnay-name";
import CompleteProfileDrawer from "@/components/connected-user/collect-role-project";
import useGetUserProfile from "@/hooks/use-get-user-profile";

const ConnectedUserPage = () => {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const numericId = typeof id === "string" ? parseInt(id, 10) : undefined;
  const { data } = useGetUserProfile();

  const {
    data: connection,
    isLoading,
    isError,
    refetch,
  } = useGetConnectionProfile(data?.data?.id, numericId as number);

  // Add a callback to refresh connection data when selfie/note is saved
  const handleSelfieNoteSaved = () => {
    console.log("Selfie/note saved, refreshing connection data...");
    refetch();
  };

  useEffect(() => {
    let locallyScannedUserIds = [];
    try {
      const storedData = localStorage.getItem("locallyScannedUserIds");
      if (storedData) {
        locallyScannedUserIds = JSON.parse(storedData);
        if (!Array.isArray(locallyScannedUserIds)) {
          locallyScannedUserIds = [];
        }
      }
    } catch (error) {
      console.error("Failed to parse locallyScannedUserIds:", error);
      locallyScannedUserIds = [];
    }

    console.log({ locallyScannedUserIds });

    if (id && data?.data) {
      const updatedUserIds = Array.from(new Set([...locallyScannedUserIds, parseInt(id)]));
      localStorage.setItem("locallyScannedUserIds", JSON.stringify(updatedUserIds));
    }
  }, [data?.data]);

  if (isLoading) return (
    <div className="min-h-screen bg-[#232223] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ED2944] mx-auto mb-4"></div>
        <p className="text-white text-lg">Loading profile...</p>
      </div>
    </div>
  );
  
  console.log("Connection data:", connection);
  console.log("Is error:", isError);
  console.log("Connection exists:", !!connection);
  console.log("Network ID:", connection?.network_information?.id);
  console.log("Meeting info:", connection?.network_information?.meeting_informations);
  
  if (isError || !connection)
    return (
      <div className="min-h-screen bg-[#232223] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-500 text-xl">Failed to load profile</p>
          <p className="text-gray-400 mt-2">Please try again later</p>
        </div>
      </div>
    );
  const userProfile = data?.data?.user_profile;
  
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#232223] via-[#1a1a1a] to-[#2d2d2d] overflow-y-auto">
        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="max-w-6xl mx-auto px-8 py-8 min-h-screen">
            {/* Header */}
            <div className="flex items-center gap-4 mb-1 sticky top-0 z-10  py-4">
              <BackButtonSvg to="/networks-and-connections" />
              <h1 className="text-3xl font-bold text-white">Connection Profile</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
              {/* Left Column - Profile Card */}
              <div className="lg:col-span-1">
                <div className="bg-[#2a2a2a] rounded-3xl p-6 shadow-2xl border border-gray-700 sticky top-24 h-fit">
                  {/* Profile Image */}
                  <div className="flex justify-center mb-4">
                    <Avatar className="w-24 h-24 rounded-2xl shadow-xl border-4 border-[#ED2944]">
                      <AvatarImage
                        className="object-cover object-center"
                        src={
                          connection.user?.photo_url &&
                          connection.user?.photo_url.includes("http")
                            ? connection.user?.photo_url
                            : "/default.jpg"
                        }
                      />
                      <AvatarFallback className="bg-[#ED2944] text-white text-2xl font-bold">
                        {connection.user?.name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Name */}
                  <h2 className="text-2xl font-bold text-white text-center mb-3 uppercase tracking-wide">
                    {connection.user?.name || "Unnamed"}
                  </h2>

                  {/* Event Badge */}
                  {connection?.network_information?.base_event?.name && (
                    <div className="bg-gradient-to-r from-[#ED2944] to-[#cb1f38] text-white px-4 py-2 rounded-xl text-center font-semibold mb-4 shadow-lg text-sm">
                      Met at {connection.network_information.base_event.name}
                    </div>
                  )}

                  {/* Fields */}
                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {connection.user?.user_profile?.user_fields?.map(
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (field: any, index: number) => (
                        <Badge
                          key={index}
                          className="text-xs text-white rounded-full border-2 border-[#ED2944] bg-transparent px-3 py-1 hover:bg-[#ED2944] transition-colors"
                        >
                          {field?.name.toUpperCase()}
                        </Badge>
                      )
                    )}
                  </div>

                  {/* Position & Project */}
                  <div className="space-y-3 mb-6">
                    {connection.user?.user_profile?.position && (
                      <div className="flex items-center gap-3 p-3 bg-[#333] rounded-xl">
                        <div className="p-1.5 bg-[#ED2944] rounded-lg">
                          <UserIconpeople />
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Position</p>
                          <p className="text-white font-semibold uppercase text-sm">{connection.user.user_profile.position}</p>
                        </div>
                      </div>
                    )}
                    {connection.user?.user_profile?.project_name && (
                      <div className="flex items-center gap-3 p-3 bg-[#333] rounded-xl">
                        <div className="p-1.5 bg-[#ED2944] rounded-lg">
                          <ProjectIcon />
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Project</p>
                          <p className="text-white font-semibold uppercase text-sm">{connection.user.user_profile.project_name}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Social Links */}
                  <div className="flex justify-center gap-3 mb-4">
                    {connection.user?.user_profile?.twitter_account && (
                      <a
                        href={
                          connection.user.user_profile.twitter_account.includes('http') 
                            ? connection.user.user_profile.twitter_account 
                            : `https://x.com/${connection.user.user_profile.twitter_account}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-[#333] rounded-lg hover:bg-[#ED2944] transition-colors"
                      >
                        <TwitterIcon />
                      </a>
                    )}
                    {connection.user?.user_profile?.linkedin_url && (
                      <a
                        href={
                          connection.user.user_profile.linkedin_url.includes('http')
                            ? connection.user.user_profile.linkedin_url
                            : `https://linkedin.com/${connection.user.user_profile.linkedin_url}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-[#333] rounded-lg hover:bg-[#ED2944] transition-colors"
                      >
                        <LinkedinIcon />
                      </a>
                    )}
                    {connection?.user?.username && (
                      <a
                        href={`https://t.me/${connection.user.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-[#333] rounded-lg hover:bg-[#ED2944] transition-colors"
                      >
                        <BlackTelegramIcon />
                      </a>
                    )}
                  </div>

                  {/* Message Button */}
                  <button
                    onClick={() => {
                      // Find the first available social link
                      const socialLinks = [];
                      if (connection.user?.user_profile?.twitter_account) {
                        socialLinks.push({
                          type: 'twitter',
                          url: connection.user.user_profile.twitter_account.includes('http') 
                            ? connection.user.user_profile.twitter_account 
                            : `https://x.com/${connection.user.user_profile.twitter_account}`
                        });
                      }
                      if (connection.user?.user_profile?.linkedin_url) {
                        socialLinks.push({
                          type: 'linkedin',
                          url: connection.user.user_profile.linkedin_url.includes('http')
                            ? connection.user.user_profile.linkedin_url
                            : `https://linkedin.com/${connection.user.user_profile.linkedin_url}`
                        });
                      }
                      if (connection?.user?.username) {
                        socialLinks.push({
                          type: 'telegram',
                          url: `https://t.me/${connection.user.username}`
                        });
                      }

                      // Open the first available social link
                      if (socialLinks.length > 0) {
                        window.open(socialLinks[0].url, '_blank');
                      } else {
                        // Fallback to email if no social links
                        window.open(`mailto:${connection.user?.username}@example.com`, '_blank');
                      }
                    }}
                    className="w-full bg-gradient-to-r from-[#ED2944] to-[#cb1f38] text-white py-3 px-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:from-[#cb1f38] hover:to-[#a01830] transition-all shadow-lg transform hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Message
                  </button>
                </div>
              </div>

              {/* Right Column - Meeting Details */}
              <div className="lg:col-span-2">
                {connection?.user?.id && (
                  <div className="bg-[#2a2a2a] rounded-3xl p-6 shadow-2xl border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4 text-center">
                      Meeting Details
                    </h3>
                    <div className="overflow-y-auto max-h-[80vh]">
                      <SelfieNoteSection
                        networkId={connection?.network_information?.id}
                        eventTitle={connection?.network_information?.base_event?.name}
                        telegramAccount={`https://t.me/${connection?.user?.username}`}
                        baseEventId={connection?.network_information?.base_event?.id || 1}
                        onSaved={handleSelfieNoteSaved}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          <main className="max-w-md p-4 mx-auto pt-20 bg-[#232223] min-h-screen">
            {/* Header */}
            <div className="flex items-center gap-3 pt-4 pb-6">
              <BackButtonSvg to="/networks-and-connections" />
              <h2 className="text-[20px] text-[#F4F4F4] font-medium">
                Connection Profile
              </h2>
            </div>

            {/* Profile Info */}
            <div className="flex flex-col items-center gap-6 mt-8 text-center">
              <Avatar className="w-[120px] h-[120px] rounded-[30px] shadow-lg">
                <AvatarImage
                  className="object-cover object-center"
                  src={
                    connection.user?.photo_url &&
                    connection.user?.photo_url.includes("http")
                      ? connection.user?.photo_url
                      : "/default.jpg"
                  }
                />
                <AvatarFallback className="bg-[#ED2944] text-white text-2xl font-bold">
                  {connection.user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-3">
                <h1 className="text-[28px] font-bold text-white uppercase tracking-wide">
                  {connection.user?.name || "Unnamed"}
                </h1>

                {/* Event Badge */}
                {connection?.network_information?.base_event?.name && (
                  <div className="bg-[#ED2944] text-white px-4 py-2 rounded-full text-sm font-medium">
                    Met at {connection.network_information.base_event.name}
                  </div>
                )}

                {/* Fields */}
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {connection.user?.user_profile?.user_fields?.map(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (field: any, index: number) => (
                      <Badge
                        key={index}
                        className="text-[0.8rem] text-white rounded-[20px] border-white border-[1px] bg-[#ED2944] px-3 py-1"
                      >
                        {field?.name.toUpperCase()}
                      </Badge>
                    )
                  )}
                </div>

                {/* Position & Project */}
                <div className="flex flex-col items-center gap-2 text-sm font-medium text-gray-300">
                  {connection.user?.user_profile?.position && (
                    <div className="flex items-center gap-2">
                      <UserIconpeople />
                      <span className="uppercase">{connection.user.user_profile.position}</span>
                    </div>
                  )}
                  {connection.user?.user_profile?.project_name && (
                    <div className="flex items-center gap-2">
                      <ProjectIcon />
                      <span className="uppercase">{connection.user.user_profile.project_name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Message Button */}
              <div className="w-full mt-6">
                <button
                  onClick={() => {
                    // Find the first available social link
                    const socialLinks = [];
                    if (connection.user?.user_profile?.twitter_account) {
                      socialLinks.push({
                        type: 'twitter',
                        url: connection.user.user_profile.twitter_account.includes('http') 
                          ? connection.user.user_profile.twitter_account 
                          : `https://x.com/${connection.user.user_profile.twitter_account}`
                      });
                    }
                    if (connection.user?.user_profile?.linkedin_url) {
                      socialLinks.push({
                        type: 'linkedin',
                        url: connection.user.user_profile.linkedin_url.includes('http')
                          ? connection.user.user_profile.linkedin_url
                          : `https://linkedin.com/${connection.user.user_profile.linkedin_url}`
                      });
                    }
                    if (connection?.user?.username) {
                      socialLinks.push({
                        type: 'telegram',
                        url: `https://t.me/${connection.user.username}`
                      });
                    }

                    // Open the first available social link
                    if (socialLinks.length > 0) {
                      window.open(socialLinks[0].url, '_blank');
                    } else {
                      // Fallback to email if no social links
                      window.open(`mailto:${connection.user?.username}@example.com`, '_blank');
                    }
                  }}
                  className="w-full bg-[#ED2944] text-white py-4 px-6 rounded-[16px] font-semibold text-lg flex items-center justify-center gap-3 hover:bg-[#cb1f38] transition-colors shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Message
                </button>
              </div>
            </div>

            {/* Selfie & Note Section */}
            {connection?.user?.id && (
              <div className="mt-8 space-y-4">
                <div className="bg-gray-800 rounded-[16px] p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 text-center">
                    Meeting Details
                  </h3>
                  <SelfieNoteSection
                    networkId={connection?.network_information?.id}
                    eventTitle={connection?.network_information?.base_event?.name}
                    telegramAccount={`https://t.me/${connection?.user?.username}`}
                    baseEventId={connection?.network_information?.base_event?.id || 1}
                    onSaved={handleSelfieNoteSaved}
                  />
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {userProfile &&
        (!userProfile?.position || !userProfile?.project_name) && (
          <CompleteProfileDrawer
            onOpenChange={() => {}}
            isOpen={true}
            onComplete={refetch}
          />
        )}
    </>
  );
};

export default ConnectedUserPage;
