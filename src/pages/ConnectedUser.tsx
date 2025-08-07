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

  if (isLoading) return <p className="mt-10 text-center text-white">Loading...</p>;
  
  console.log("Connection data:", connection);
  console.log("Is error:", isError);
  console.log("Connection exists:", !!connection);
  console.log("Network ID:", connection?.network_information?.id);
  console.log("Meeting info:", connection?.network_information?.meeting_informations);
  
  if (isError || !connection)
    return (
      <p className="mt-10 text-center text-red-500">Failed to load profile</p>
    );
  const userProfile = data?.data?.user_profile;
  return (
    <>
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
