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

export interface UserField {
  id: number;
  name: string;
}

const UserProfileContainer = () => {
  const [isClient, setIsClient] = useState(false);
  const { data, isLoading, isError, error } = useGetUserProfile();
  const user = data?.data;

  // Ensure component only renders on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

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
    return <div className="flex flex-col items-center justify-center gap-4 grow">
      <div className="animate-pulse bg-gray-700 rounded-[36px] w-[100px] h-[100px]"></div>
      <div className="animate-pulse bg-gray-700 h-8 w-48 rounded"></div>
    </div>;
  }
  
  if (isError) {
    console.error("Error loading the user profile:", error);
    return <div className="flex flex-col items-center justify-center gap-4 grow text-white">
      Error loading profile. Please try again later.
    </div>;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 grow">
      <Avatar className="rounded-[36px] w-[100px] h-[100px]">
        <AvatarImage src={user?.photo_url || "https://github.com/shadcn.png"} />
        <AvatarFallback>{user?.name?.[0] || "CN"}</AvatarFallback>
      </Avatar>

      <div className="flex flex-col items-center gap-2 ">
        <h1 className="font-medium text-[26px] text-[#ffffff] uppercase text-center">
          {user?.name || "No Name Provided"}
        </h1>

        {/* <h6 className="font-normal text-[20px] text-[#ffffff] uppercase text-center">
          @{user?.username}
        </h6> */}
        
        {/* User Fields Display */}
        <div className="flex items-center justify-center gap-2 flex-wrap mt-2">
          {user?.user_fields && user.user_fields.length > 0 ? (
            user.user_fields.map((field: UserField) => (
              <Badge
                key={field.id}
                className="text-[0.9rem] text-white rounded-[29px] border-white border-[1.5px] bg-[#ED2944] px-3 py-1 font-medium"
              >
                {field.name.toUpperCase()}
              </Badge>
            ))
          ) : user?.user_profile?.user_fields && user.user_profile.user_fields.length > 0 ? (
            // Fallback for different data structure
            user.user_profile.user_fields.map((field: UserField) => (
              <Badge
                key={field.id}
                className="text-[0.9rem] text-white rounded-[29px] border-white border-[1.5px] bg-[#ED2944] px-3 py-1 font-medium"
              >
                {field.name.toUpperCase()}
              </Badge>
            ))
          ) : (
            // Show message if no fields are selected
            <p className="text-sm text-gray-400 italic">No fields selected</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 text-white text-[1rem] font-medium pt-4">
        {user?.user_profile?.position && (
          <div className="flex items-center gap-3">
            <PositionIcon />
            <div>
              {/* <p className="text-xs text-gray-400">Position</p> */}
              <p>{user.user_profile.position}</p>
            </div>
          </div>
        )}
        {user?.user_profile?.project_name && (
          <div className="flex items-center gap-3">
            <PlaceIcon />
            <div>
              {/* <p className="text-xs text-gray-400">Project</p> */}
              <p>{user.user_profile.project_name}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 pt-20">
        {user?.user_profile?.twitter_account && (
          <a
            href={
              user.user_profile?.twitter_account?.includes("http")
                ? user?.user_profile?.twitter_account
                : `https://x.com/${user?.user_profile?.twitter_account}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#F0F0F0] px-4 py-4 rounded-[16px]"
          >
            <TwitterIcon />
          </a>
        )}
        {user?.user_profile?.linkedin_url && (
          <a
            href={user?.user_profile?.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#F0F0F0] px-4 py-4 rounded-[16px]"
          >
            <LinkedinIcon />
          </a>
        )}
        {user?.username && (
          <a
            href={`mailto:${user.username}@example.com`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#F0F0F0] px-4 py-4 rounded-[16px]"
          >
            <BlackTelegramIcon />
          </a>
        )}
      </div>
    </div>
  );
};

export default UserProfileContainer;
