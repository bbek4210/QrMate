import React from "react";

export type NetworkConnection = {
  base_event: {
    id: number;
    name: string;
    code: string;
    city: string;
    address: string | null;
    created_date: string; // ISO 8601 format
  };
  user: {
    id: number;
    uuid: string;
    name: string;
    username: string;
    photo_url: string | null;
    user_profile: {
      city: string;
      project_name: string;
      position: string;
    };
  };
};

const ConnectionBox = ({ base_event, user }: NetworkConnection) => {
  const image = user?.photo_url;
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-6">
      {/* Avatar */}
      <div className="relative mb-6">
        {image && image.startsWith("http") ? (
          <img
            src={image}
            alt={user?.name}
            width={80}
            height={80}
            className="object-cover object-center w-20 h-20 border-4 border-white rounded-full shadow-lg"
          />
        ) : (
          <div className="w-20 h-20 bg-gradient-to-br from-[#ED2944] to-[#ff6b7a] rounded-full flex items-center justify-center shadow-lg border-4 border-white">
            <span className="text-white text-2xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
        )}
        
        {/* Online indicator */}
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full shadow-lg"></div>
      </div>

      {/* User Info */}
      <div className="flex-1 flex flex-col justify-center">
        <h2 className="text-xl font-bold text-white mb-2 truncate w-full">
          {user?.name}
        </h2>
        
        <div className="space-y-2 mb-4">
          {user?.user_profile?.position && (
            <p className="text-sm font-medium text-gray-300">
              {user.user_profile.position}
            </p>
          )}
          
          {user?.user_profile?.project_name && (
            <p className="text-sm text-gray-400">
              {user.user_profile.project_name}
            </p>
          )}
        </div>

        {/* Event Badge */}
        <div className="mt-auto">
          <span className="inline-block px-4 py-2 bg-gradient-to-r from-[#ED2944] to-[#ff6b7a] text-white text-sm font-semibold rounded-full shadow-lg">
            {base_event?.name}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ConnectionBox;
