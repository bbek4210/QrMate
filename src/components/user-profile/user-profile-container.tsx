import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import PositionIcon from "../svgs/position-icon";
import PlaceIcon from "../svgs/place-icon";
import { LinkedinIcon, TelegramIcon, TwitterIcon } from "../svgs/social-icons";
import useGetUserProfile from "@/hooks/use-get-user-profile";

export interface UserField {
  id: number;
  name: string;
}

const UserProfileContainer = () => {
  const { data: user, isLoading, isError, error } = useGetUserProfile();

  if (isLoading) return <div></div>;
  if (isError) {
    console.error("Error loading the user profile:", error);
    return <div>Error loading profile. Please try again later.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-8 mt-12 grow">
      <Avatar className="rounded-[36px] w-[144px] h-[144px]">
        <AvatarImage src={user?.avatar || "https://github.com/shadcn.png"} />
        <AvatarFallback>{user?.name?.[0] || "CN"}</AvatarFallback>
      </Avatar>

      <div className="flex flex-col items-center gap-2">
        <h1 className="font-semibold text-[32px] text-[#ffffff] uppercase">
          {user?.name || "No Name Provided"}
        </h1>
        <div className="flex items-center justify-center gap-2">
          {user?.user_profile?.user_fields?.map((field: UserField) => (
            <Badge
              key={field.id}
              className="text-[0.9rem] text-white rounded-[29px] border-white border-[1.5px] bg-[#ED2944]"
            >
              {field.name.toUpperCase()}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 text-white text-[0.85rem] font-medium">
        {user?.user_profile?.position && (
          <div className="flex items-center gap-3">
            <PositionIcon />
            <div>
              <p className="text-xs text-gray-400">Position</p>
              <p>{user.user_profile.position}</p>
            </div>
          </div>
        )}
        {user?.user_profile?.project_name && (
          <div className="flex items-center gap-3">
            <PlaceIcon />
            <div>
              <p className="text-xs text-gray-400">Project</p>
              <p>{user.user_profile.project_name}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-2">
        {user?.user_profile?.twitter_account && (
          <a
            href={user.user_profile?.twitter_account}
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
        {user?.user_profile?.telegram_account && (
          <a
            href={`https://t.me/${user.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#F0F0F0] px-4 py-4 rounded-[16px]"
          >
            <TelegramIcon />
          </a>
        )}
      </div>
    </div>
  );
};

export default UserProfileContainer;
