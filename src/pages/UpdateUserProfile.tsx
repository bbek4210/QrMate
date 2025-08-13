import BackButtonSvg from "@/components/svgs/back-button";
import UpdateUserContainer from "@/components/user-profile/update-user-container";
import { logToDiscord } from "@/lib/axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import useGetUserProfile from "@/hooks/use-get-user-profile";
import useUploadFile from "@/hooks/use-upload-file";
import useUpdateUserProfile from "@/hooks/useUpdateUserProfile";
import toast from "react-hot-toast";

const UpdateUserProfile = () => {
  const logMessage = "This is a message for Update User Profile";
  logToDiscord(logMessage);

  // Avatar upload functionality
  const [avatar, setAvatar] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const { data, refetch } = useGetUserProfile();
  const user = data?.data;
  const uploadFileMutation = useUploadFile();
  const { mutateAsync } = useUpdateUserProfile();

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Prevent multiple uploads
    if (isUploading) return;
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    setIsUploading(true);

    const extension = file.name.split(".").pop() || "jpg";
    const key = `qrmate_profile_images/avatar-${Date.now()}.${extension}`;

    try {
      console.log('Uploading file:', file.name, 'Size:', file.size);
      
      // Step 1: Upload file
      const result = await uploadFileMutation.mutateAsync({ file, key });
      console.log('Upload result:', result);
      
      const uploadedUrl = result?.data?.file_url || result?.file_url;
      if (!uploadedUrl) {
        console.error('No URL in response:', result);
        throw new Error("No URL returned from upload");
      }

      // Step 2: Update local state immediately for UI feedback
      setAvatar(uploadedUrl);

      // Step 3: Update profile with new photo URL (optional - image is already uploaded and displayed)
      try {
        console.log('Updating profile with photo_url:', uploadedUrl);
        // Send current user data along with the new photo_url to ensure all required fields are present
        const updateData = {
          name: user?.name || '',
          username: user?.username || '',
          position: data?.data?.user_profile?.position || '',
          project_name: data?.data?.user_profile?.project_name || '',
          city: data?.data?.user_profile?.city || '',
          twitter_account: data?.data?.user_profile?.twitter_account || '',
          linkedin_url: data?.data?.user_profile?.linkedin_url || '',
          email: user?.email || '',
          selected_fields: data?.data?.user_fields?.map((f: any) => f.id) || [],
          photo_url: uploadedUrl
        };
        console.log('Sending update data:', updateData);
        const profileResult = await mutateAsync(updateData);
        console.log('Profile update result:', profileResult);
        
        // Step 4: Refetch user profile to sync form
        await refetch();
      } catch (profileError) {
        console.error('Profile update error:', profileError);
        // Silently handle profile update error - image is already uploaded and displayed
      }
      
      // Step 5: Show success message since image upload was successful
      toast.success("Profile picture updated successfully");
    } catch (uploadError) {
      console.error('Avatar upload error:', uploadError);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

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
                 <UpdateUserContainer 
                   onAvatarUpload={handleAvatarUpload} 
                   isUploading={isUploading || uploadFileMutation.isPending}
                   currentAvatarUrl={avatar || user?.photo_url}
                 />
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block min-h-screen">
        {/* Desktop Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                                 <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-3 hover:bg-white/20 transition-all duration-200">
                   <BackButtonSvg to="/" />
                 </div>
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
                      <Avatar className="w-32 h-32 border-4 border-white shadow-2xl">
                        <AvatarImage 
                          src={avatar || user?.photo_url || "https://github.com/shadcn.png"} 
                        />
                        <AvatarFallback className="bg-gradient-to-br from-[#ED2944] to-[#ff6b7a] text-white text-4xl font-bold">
                          {user?.name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#ED2944] rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </div>
                    
                    <h3 className="text-white text-xl font-semibold mb-2">Profile Picture</h3>
                    <p className="text-gray-400 text-sm mb-6">Upload a professional photo to make your profile stand out</p>
                    
                                         <label
                       htmlFor="desktopAvatarUpload"
                       className={`w-full bg-gradient-to-r from-[#ED2944] to-[#c41e3a] text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 shadow-lg transform cursor-pointer text-center ${
                         isUploading || uploadFileMutation.isPending
                           ? "opacity-50 cursor-not-allowed"
                           : "hover:from-[#c41e3a] hover:to-[#a01830] hover:scale-105"
                       }`}
                     >
                       {isUploading || uploadFileMutation.isPending ? "Uploading..." : "Upload Photo"}
                     </label>
                                         <input
                       id="desktopAvatarUpload"
                       type="file"
                       accept="image/*"
                       onChange={handleAvatarUpload}
                       disabled={isUploading || uploadFileMutation.isPending}
                       className="hidden"
                     />
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
                    <UpdateUserContainer 
                      onAvatarUpload={handleAvatarUpload} 
                      isUploading={isUploading || uploadFileMutation.isPending}
                      currentAvatarUrl={avatar || user?.photo_url}
                    />
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
