"use client";

import React from "react";
import { useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import BackButtonSvg from "@/components/svgs/back-button";
import UserIconpeople from "@/components/svgs/userIcon";
import { TwitterIcon, LinkedinIcon } from "@/components/svgs/social-icons";

import useGetConnectionProfile from "@/hooks/use-get-connected-profile";
import useGetUserProfile from "@/hooks/use-get-user-profile";
import SelfieNoteSection from "@/components/connected-user/selfie-note-section";
import ProjectIcon from "@/components/svgs/compnay-name";

const ConnectedUserPage = () => {
  const { data: currentUser, error: userError } = useGetUserProfile();

  const { id } = useParams();
  const numericId = typeof id === "string" ? parseInt(id, 10) : undefined;

  const {
    data: connection,
    isLoading,
    isError,
  } = useGetConnectionProfile(numericId);

  if (isLoading) return <p className="mt-10 text-center text-white"></p>;
  if (isError || !connection)
    return (
      <p className="mt-10 text-center text-red-500">Failed to load profile</p>
    );
  console.log("Connection data:", connection);

  return (
    <main className="max-w-md p-4 mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <BackButtonSvg />
        <h2 className="text-[24px] text-[#F4F4F4] font-medium">
          @{connection.scanned_username}
        </h2>
      </div>

      {/* Profile Info */}
      <div className="flex flex-col items-center gap-5 mt-10 text-center">
        <Avatar className="w-[144px] h-[144px] rounded-[36px]">
          <AvatarImage
            className="object-cover object-center"
            src={
              connection.scanned_photo_url &&
              connection.scanned_photo_url.includes("http")
                ? connection.scanned_photo_url
                : "/default.jpg"
            }
          />
          <AvatarFallback>{connection.scanned_name?.[0] || "U"}</AvatarFallback>
        </Avatar>

        <h1 className="text-[24px] font-semibold text-white uppercase">
          {connection.scanned_name || "Unnamed"}
        </h1>

        <div className="flex items-center justify-center gap-2">
          {connection.fields.map((field: string, index: number) => (
            <Badge
              key={index}
              className="text-[0.9rem] text-white rounded-[29px] border-white border-[1.5px] bg-[#ED2944]"
            >
              {field.toUpperCase()}
            </Badge>
          ))}
        </div>

        <div className="flex flex-col items-center gap-1 text-sm font-medium text-white">
          <div className="flex items-center gap-2 uppercase">
            <UserIconpeople /> {connection.position || "Unknown Position"}
          </div>
          <div className="flex items-center gap-2 uppercase">
            <ProjectIcon />
            {connection.project_name || "Unknown City"}
          </div>
        </div>

        {/* Socials */}
        <div className="flex gap-3 mt-4">
          {connection?.twitter_account && (
            <a
              href={connection.twitter_account}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white px-4 py-4 rounded-[16px]"
            >
              <TwitterIcon />
            </a>
          )}
          {connection?.linkedin_url && (
            <a
              href={connection.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white px-4 py-4 rounded-[16px]"
            >
              <LinkedinIcon />
            </a>
          )}
        </div>
      </div>

      {/* Selfie & Note Section */}
      {connection?.id && (
        <SelfieNoteSection
          networkId={connection?.id}
          eventTitle={connection.event_title}
          telegramAccount={`https://t.me/${connection?.scanned_username}`}
          baseEventId={connection?.["base_event"]?.["id"] || 1}
        />
      )}
    </main>
  );
};

export default ConnectedUserPage;
