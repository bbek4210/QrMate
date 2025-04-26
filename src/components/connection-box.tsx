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
    <div className="w-full max-w-[180px] h-full mx-auto min-h-[250px] p-6 text-center flex flex-col justify-between bg-gray-100 shadow-md rounded-[20px]">
      {image && image.startsWith("http") ? (
        <div className="flex justify-center">
          <img
            src={image}
            alt={user?.name}
            width={80}
            height={80}
            className="object-cover object-center w-20 h-20 border-4 border-white rounded-full shadow-md"
          />
        </div>
      ) : (
        <div className="flex justify-center">
          <img
            src={"/default.jpg"}
            alt={user?.name}
            width={80}
            height={80}
            className="object-cover object-center w-20 h-20 border-4 border-white rounded-full shadow-md"
          />
        </div>
      )}
      <h2 className="mt-4 text-lg font-semibold text-gray-900 truncate">
        {user?.name}
      </h2>
      <p className="text-sm font-medium text-gray-500">
        {user?.user_profile?.position} | {user?.user_profile?.project_name}
      </p>
      <span className="inline-block px-2 py-1 mt-3 text-[0.8rem] font-medium text-gray-800 border border-gray-300 rounded-full">
        {base_event?.name}
      </span>
    </div>
  );
};

export default ConnectionBox;
