import BackButtonSvg from "@/components/svgs/back-button";
import UpdateUserContainer from "@/components/user-profile/update-user-container";
import { logToDiscord } from "@/lib/axios";

const UpdateUserProfile = () => {
  const logMessage = "This is a message for Update User Profile";
  logToDiscord(logMessage);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Mobile Layout */}
      <div className="lg:hidden px-4 py-4 h-[100dvh] flex flex-col pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButtonSvg to="/" />
            <h2 className="text-[#FFFFFF] text-[24px] font-medium">
              Update profile
            </h2>
          </div>
        </div>
        <UpdateUserContainer />
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block min-h-screen">
        {/* Desktop Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <BackButtonSvg to="/" />
                <div>
                  <h1 className="text-white text-3xl font-bold">Update Profile</h1>
                  <p className="text-gray-400 text-sm mt-1">Complete your professional profile</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Content */}
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="grid grid-cols-12 gap-8">
            {/* Left Column - Profile Picture & Quick Info */}
            <div className="col-span-4">
              <div className="sticky top-8">
                <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl p-8 border border-gray-600 shadow-xl">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#ED2944] to-[#c41e3a] p-1">
                        <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                          <span className="text-white text-2xl font-bold">👤</span>
                        </div>
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#ED2944] rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </div>
                    
                    <h3 className="text-white text-xl font-semibold mb-2">Profile Picture</h3>
                    <p className="text-gray-400 text-sm mb-6">Upload a professional photo to make your profile stand out</p>
                    
                    <button className="w-full bg-gradient-to-r from-[#ED2944] to-[#c41e3a] text-white py-3 px-6 rounded-xl font-medium hover:from-[#c41e3a] hover:to-[#a01830] transition-all duration-200 shadow-lg transform hover:scale-105">
                      Upload Photo
                    </button>
                  </div>

                  {/* Quick Stats */}
                  <div className="mt-8 pt-8 border-t border-gray-600">
                    <h4 className="text-white font-semibold mb-4">Profile Completion</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Basic Info</span>
                        <div className="w-16 h-2 bg-gray-600 rounded-full overflow-hidden">
                          <div className="w-3/4 h-full bg-[#ED2944] rounded-full"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Professional</span>
                        <div className="w-16 h-2 bg-gray-600 rounded-full overflow-hidden">
                          <div className="w-1/2 h-full bg-[#ED2944] rounded-full"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Social Links</span>
                        <div className="w-16 h-2 bg-gray-600 rounded-full overflow-hidden">
                          <div className="w-1/4 h-full bg-[#ED2944] rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="col-span-8">
              <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl border border-gray-600 shadow-xl overflow-hidden">
                <div className="p-8">
                  <UpdateUserContainer />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default UpdateUserProfile;
