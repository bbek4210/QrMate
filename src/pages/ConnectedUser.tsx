"use client";

import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
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
  const { id } = useParams();
  const numericId = typeof id === "string" ? parseInt(id, 10) : undefined;

  const {
    data: connection,
    isLoading,
    isError,
    refetch,
  } = useGetConnectionProfile(numericId);
  const { data } = useGetUserProfile();

  // useEffect(() => {  
  //   let locallyScannedUserIds = [];
  //   try {
  //     const storedData = localStorage.getItem("locallyScannedUserIds");
  //     if (storedData) {
  //       locallyScannedUserIds = JSON.parse(storedData);
  //       if (!Array.isArray(locallyScannedUserIds)) {
  //         locallyScannedUserIds = [];
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Failed to parse locallyScannedUserIds:", error);
  //     locallyScannedUserIds = [];
  //   }
  
  //   console.log({ locallyScannedUserIds });
  
  //   if (id && data) {
  //     const updatedUserIds = Array.from(new Set([...locallyScannedUserIds, parseInt(id)]));
  //     localStorage.setItem("locallyScannedUserIds", JSON.stringify(updatedUserIds));
  //   }
  // }, [data]);
  

  if (isLoading) return <p className="mt-10 text-center text-white"></p>;
  if (isError || !connection)
    return (
      <p className="mt-10 text-center text-red-500">Failed to load profile</p>
    );
  const userProfile = data?.data?.user_profile;
  return (
    <>
      <main className="max-w-md p-4 mx-auto pt-28">
        {/* Header */}
        <div className="flex items-center gap-2 pt-2">
          <BackButtonSvg to="/networks-and-connections" />
          {/* <h2 className="text-[24px] text-[#F4F4F4] font-medium">
            @{connection.user?.username}
          </h2> */}
        </div>

        {/* Profile Info */}
        <div className="flex flex-col items-center gap-5 mt-10 text-center">
          <Avatar className="w-[144px] h-[144px] rounded-[36px]">
            <AvatarImage
              className="object-cover object-center"
              src={
                connection.user?.photo_url &&
                connection.user?.photo_url.includes("http")
                  ? connection.user?.photo_url
                  : "/default.jpg"
              }
            />
            <AvatarFallback>{connection.user?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>

          <h1 className="text-[24px] font-semibold text-white uppercase">
            {connection.user?.name || "Unnamed"}
          </h1>

          <div className="flex items-center justify-center gap-2">
            {connection.user?.user_profile?.user_fields.map(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (field: any, index: number) => (
                <Badge
                  key={index}
                  className="text-[0.9rem] text-white rounded-[29px] border-white border-[1.5px] bg-[#ED2944]"
                >
                  {field?.name.toUpperCase()}
                </Badge>
              )
            )}
          </div>

          <div className="flex flex-col items-center gap-1 text-sm font-medium text-white">
            <div className="flex items-center gap-2 uppercase">
              <UserIconpeople />{" "}
              {connection.user?.user_profile?.position || "Unknown Position"}
            </div>
            <div className="flex items-center gap-2 uppercase">
              <ProjectIcon />
              {connection.user?.user_profile?.project_name || "Unknown Project"}
            </div>
          </div>

          {/* Socials */}
          <div className="flex gap-3 mt-4">
            {connection.user?.user_profile?.twitter_account && (
              <a
                href={
                  connection.user?.user_profile?.twitter_account?.includes(
                    "http"
                  )
                    ? connection.user?.user_profile?.twitter_account
                    : `https://x.com/${connection.user?.user_profile?.twitter_account}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white px-4 py-4 rounded-[16px]"
              >
                <TwitterIcon />
              </a>
            )}
            {connection.user?.user_profile?.linkedin_url && (
              <a
                href={
                  connection.user?.user_profile?.linkedin_url?.includes("http")
                    ? connection.user?.user_profile?.linkedin_url
                    : `https://linkedin.com/${connection.user?.user_profile?.linkedin_url}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white px-4 py-4 rounded-[16px]"
              >
                <LinkedinIcon />
              </a>
            )}

            {connection?.user?.username && (
              <a
                href={`https://t.me/${connection?.user?.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white px-4 py-4 rounded-[16px]"
              >
                <BlackTelegramIcon />
              </a>
            )}
          </div>
        </div>

        {/* Selfie & Note Section */}
        {connection?.user?.id && (
          <SelfieNoteSection
            networkId={connection?.network_information?.id}
            eventTitle={connection?.network_information?.base_event?.name}
            telegramAccount={`https://t.me/${connection?.user?.username}`}
            baseEventId={connection?.network_information?.base_event?.id || 1}
          />
        )}
      </main>
      {userProfile &&
        (!userProfile?.position || !userProfile?.project_name) && (
          <CompleteProfileDrawer isOpen={true} onComplete={refetch} />
        )}
    </>
  );
};

export default ConnectedUserPage;
