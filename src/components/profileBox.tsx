import React from "react";

const ProfileBox = ({
  imageSrc,
  name,
  role,
  company,
  EventName,
}: {
  imageSrc: string;
  name: string;
  role: string;
  company: string;
  EventName: string;
}) => {
  return (
    <div className="w-full max-w-[180px] h-full mx-auto min-h-[250px] p-6 text-center flex flex-col justify-between bg-gray-100 shadow-md rounded-[20px]">
      {imageSrc && imageSrc.startsWith("http") ? (
        <div className="flex justify-center">
          <img
            src={imageSrc}
            alt={name}
            width={80}
            height={80}
            className="object-cover object-center w-20 h-20 border-4 border-white rounded-full shadow-md"
          />
        </div>
      ) : (
        <div className="flex justify-center">
          <img
            src={"/default.jpg"}
            alt={name}
            width={80}
            height={80}
            className="object-cover object-center w-20 h-20 border-4 border-white rounded-full shadow-md"
          />
        </div>
      )}
      <h2 className="mt-4 text-lg font-semibold text-gray-900 truncate">
        {name}
      </h2>
      <p className="text-sm font-medium text-gray-500">
        {role} | {company}
      </p>
      <span className="inline-block px-2 py-1 mt-3 text-[0.8rem] font-medium text-gray-800 border border-gray-300 rounded-full">
        {EventName}
      </span>
    </div>
  );
};

export default ProfileBox;
