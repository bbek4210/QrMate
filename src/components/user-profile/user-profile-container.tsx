import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import PositionIcon from "../svgs/position-icon";
import PlaceIcon from "../svgs/place-icon";
import {
  BlackTelegramIcon,
  LinkedinIcon,
  TwitterIcon,
} from "../svgs/social-icons";
import useGetUserProfile from "@/hooks/use-get-user-profile";
import { useEffect, useState } from "react";
import Link from "next/link";
import EditProfileIconSvg from "../svgs/edit-profile-icon";
import SendFeedbackIconSvg from "../svgs/send-feedback-icon";
import { UserField } from "@/types/api";

const UserProfileContainer = () => {
  const [isClient, setIsClient] = useState(false);
  const { data, isLoading, isError, error, refetch } = useGetUserProfile();
  const user = data?.data;

  // Ensure component only renders on client side and refetch data
  useEffect(() => {
    setIsClient(true);
    // Refetch data when component mounts to ensure we have the latest data
    refetch();
  }, [refetch]);

  // Debug logging - only on client side and only in development
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && user) {
      console.log('User profile data:', user);
      console.log('User fields (direct):', user?.user_fields);
      console.log('User fields (profile):', user?.user_profile?.user_fields);
    }
  }, [user]);

  // Show loading skeleton during SSR and initial client render
  if (!isClient || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-8 grow">
        <div className="animate-pulse bg-gray-700 rounded-full w-32 h-32 lg:w-40 lg:h-40"></div>
        <div className="animate-pulse bg-gray-700 h-8 w-48 rounded"></div>
        <div className="flex gap-2">
          <div className="animate-pulse bg-gray-700 h-8 w-24 rounded-full"></div>
          <div className="animate-pulse bg-gray-700 h-8 w-20 rounded-full"></div>
        </div>
      </div>
    );
  }
  
  if (isError) {
    console.error("Error loading the user profile:", error);
    return (
      <div className="flex flex-col items-center justify-center gap-6 grow">
        <div className="text-center max-w-md mx-auto">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-white text-xl font-semibold mb-2">Error loading profile</h3>
          <p className="text-gray-400">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 lg:gap-8">
      {/* Profile Card - Desktop */}
      <div className="hidden lg:block w-full max-w-8xl">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column - Profile Info */}
            <div className="flex flex-col items-center">
              {/* Avatar Section */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  <Avatar className="rounded-full w-32 h-32 border-4 border-white shadow-2xl">
                    <AvatarImage src={user?.photo_url || "https://github.com/shadcn.png"} />
                    <AvatarFallback className="bg-gradient-to-br from-[#ED2944] to-[#ff6b7a] text-white text-4xl font-bold">
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Online indicator */}
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-white rounded-full shadow-lg"></div>
                </div>

                <h1 className="font-bold text-3xl text-white text-center mb-2">
                  {user?.name || "No Name Provided"}
                </h1>
                
                {user?.username && (
                  <p className="text-gray-400 text-lg">@{user.username}</p>
                )}
              </div>

              {/* Skills/Fields Section */}
              <div className="mb-6 w-full">
                <h3 className="text-white font-semibold text-lg mb-4 text-center">Skills & Interests</h3>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                                     {(() => {
                     const fields = user?.user_fields || user?.user_profile?.user_fields || [];
                     
                     if (fields.length > 0) {
                       return fields.map((field: any) => (
                         <Badge
                           key={field.id}
                           className="text-sm text-white rounded-full border-white/20 border bg-gradient-to-r from-[#ED2944] to-[#ff6b7a] px-4 py-2 font-medium shadow-lg"
                         >
                           {field.name?.toUpperCase() || 'Unknown Field'}
                         </Badge>
                       ));
                     } else {
                       return <p className="text-gray-400 italic">No fields selected</p>;
                     }
                   })()}
                </div>
              </div>

              {/* Social Links Section */}
              <div className="w-full mb-6">
                <h3 className="text-white font-semibold text-lg mb-4 text-center">Connect With Me</h3>
                <div className="flex items-center justify-center gap-4">
                  {user?.user_profile?.twitter_account && (
                    <a
                      href={
                        user.user_profile?.twitter_account?.includes("http")
                          ? user?.user_profile?.twitter_account
                          : `https://x.com/${user?.user_profile?.twitter_account}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-2xl hover:bg-white/20 transition-all duration-200 hover:scale-105 shadow-lg"
                    >
                      <TwitterIcon />
                    </a>
                  )}
                  {user?.user_profile?.linkedin_url && (
                    <a
                      href={user?.user_profile?.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-2xl hover:bg-white/20 transition-all duration-200 hover:scale-105 shadow-lg"
                    >
                      <LinkedinIcon />
                    </a>
                  )}
                  {user?.username && (
                    <a
                      href={`https://t.me/${user.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-2xl hover:bg-white/20 transition-all duration-200 hover:scale-105 shadow-lg"
                    >
                      <BlackTelegramIcon />
                    </a>
                  )}
                </div>
              </div>

              {/* Edit Profile Button */}
              <div className="w-full">
                <Link href="/update-user-profile" className="block w-full">
                  <button className="w-full py-4 rounded-2xl text-base font-semibold text-white border border-white/20 bg-gradient-to-r from-[#ED2944] to-[#ff6b7a] hover:from-[#cb1f38] hover:to-[#e55a68] transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
                    <EditProfileIconSvg />
                    Edit Profile
                  </button>
                </Link>
              </div>
            </div>

            {/* Middle Column - Professional Info */}
            <div className="flex flex-col justify-center">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-semibold text-xl mb-6 text-center">Professional Information</h3>
                <div className="space-y-6">
                  {user?.user_profile?.position && (
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                      <div className="bg-[#ED2944] p-3 rounded-full">
                        <PositionIcon />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Position</p>
                        <p className="text-white font-medium text-lg">{user.user_profile.position}</p>
                      </div>
                    </div>
                  )}
                  
                  {user?.user_profile?.project_name && (
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                      <div className="bg-[#ED2944] p-3 rounded-full">
                        <PlaceIcon />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Project</p>
                        <p className="text-white font-medium text-lg">{user.user_profile.project_name}</p>
                      </div>
                    </div>
                  )}

                  {user?.user_profile?.city && (
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                      <div className="bg-[#ED2944] p-3 rounded-full">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Location</p>
                        <p className="text-white font-medium text-lg">{user.user_profile.city}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col items-center justify-center gap-6">
        {/* Avatar */}
        <div className="relative">
          <Avatar className="rounded-full w-24 h-24 border-4 border-white shadow-lg">
            <AvatarImage src={user?.photo_url || "https://github.com/shadcn.png"} />
            <AvatarFallback className="bg-gradient-to-br from-[#ED2944] to-[#ff6b7a] text-white text-2xl font-bold">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          
          {/* Online indicator */}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full shadow-lg"></div>
        </div>

        {/* Name */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="font-bold text-2xl text-white text-center uppercase">
            {user?.name || "No Name Provided"}
          </h1>
          
          {user?.username && (
            <p className="text-gray-400 text-sm">@{user.username}</p>
          )}
        </div>

                          {/* Skills/Fields */}
         <div className="flex items-center justify-center gap-2 flex-wrap">
           {(() => {
             const fields = user?.user_fields || user?.user_profile?.user_fields || [];
             
             if (fields.length > 0) {
               return fields.map((field: any) => (
                 <Badge
                   key={field.id}
                   className="text-xs text-white rounded-full border-white/20 border bg-gradient-to-r from-[#ED2944] to-[#ff6b7a] px-3 py-1 font-medium"
                 >
                   {field.name?.toUpperCase() || 'Unknown Field'}
                 </Badge>
               ));
             } else {
               return <p className="text-gray-400 italic text-sm">No fields selected</p>;
             }
           })()}
         </div>

        {/* Professional Info */}
        <div className="flex flex-col gap-3 text-white text-base font-medium">
          {user?.user_profile?.position && (
            <div className="flex items-center gap-3">
              <div className="bg-[#ED2944] p-2 rounded-full">
                <PositionIcon />
              </div>
              <p>{user.user_profile.position}</p>
            </div>
          )}
          {user?.user_profile?.project_name && (
            <div className="flex items-center gap-3">
              <div className="bg-[#ED2944] p-2 rounded-full">
                <PlaceIcon />
              </div>
              <p>{user.user_profile.project_name}</p>
            </div>
          )}
        </div>

        {/* Social Links */}
        <div className="flex items-center justify-center gap-3 pt-4">
          {user?.user_profile?.twitter_account && (
            <a
              href={
                user.user_profile?.twitter_account?.includes("http")
                  ? user?.user_profile?.twitter_account
                  : `https://x.com/${user?.user_profile?.twitter_account}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 backdrop-blur-sm border border-white/20 p-3 rounded-2xl hover:bg-white/20 transition-all duration-200"
            >
              <TwitterIcon />
            </a>
          )}
          {user?.user_profile?.linkedin_url && (
            <a
              href={user?.user_profile?.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 backdrop-blur-sm border border-white/20 p-3 rounded-2xl hover:bg-white/20 transition-all duration-200"
            >
              <LinkedinIcon />
            </a>
          )}
          {user?.username && (
            <a
              href={`https://t.me/${user.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 backdrop-blur-sm border border-white/20 p-3 rounded-2xl hover:bg-white/20 transition-all duration-200"
            >
              <BlackTelegramIcon />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileContainer;
