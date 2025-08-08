"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import useUpdateUserProfile from "@/hooks/useUpdateUserProfile";
import { useFieldOptions } from "@/hooks/use-field-options";
// import { useTelegramInitData } from "@/hooks/useTelegramInitData";
import useGetUserProfile from "@/hooks/use-get-user-profile";
import { Button } from "../ui/button";

// --- Schema ---
const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(1, "Username is required"),
  position: z.string().min(1, "Position is required"),
  project_name: z.string().min(1, "Project name is required"),
  city: z.string().min(1, "City is required"),
  twitter_account: z.string().optional(),
  linkedin_url: z.string().optional(),
  email: z
    .string()
    .email("Invalid email")
    .or(z.literal("").transform(() => undefined))
    .optional(),
  selected_fields: z
    .array(z.number())
    .min(1, "Select at least 1 field")
    .max(3, "Select up to 3 fields only"),
});

// --- Options ---
const positionOptions = [
  "FOUNDER",
  "CO-FOUNDER",
  "INVESTOR",
  "CEO",
  "CTO",
  "CFO",
  "FINANCE MANAGER",
  "GENERAL MANAGER",
  "EVENT MANAGER",
  "PRODUCT MANAGER",
  "BLOCKCHAIN DEVELOPER",
  "SOLIDITY DEVELOPER",
  "DEVELOPER",
  "ENGINEER",
  "MARKETING",
  "INFLUENCER",
  "INTERN",
  "COMMUNITY MOD",
  "PRODUCT DESIGNER",
  "SALES MANAGER",
  "RESEARCHER",
  "SPACEHOST",
  "TRADER",
  "GAMING",
  "EDUCATOR",
  "ARTIST",
  "COLLAB MANAGER",
  "JOB SEEKING",
  "SUBCOMMUNITY",
  "CONTENT CREATOR",
  "TOKEN",
  "METAVERSE",
  "COMMUNITY",
  "HIRING",
  "BRANDING",
  "VALIDATOR",
  "INCUBATOR",
  "ACCELERATOR",
  "MEDIA",
  "BUSINESS DEVELOPMENT OFFICER",
  "OTHER",
];

const cityOptions = [
  "SAN_FRANCISCO",
  "NEW_YORK_CITY",
  "LONDON",
  "TOKYO",
  "SINGAPORE",
  "BERLIN",
  "PARIS",
  "AMSTERDAM",
  "BARCELONA",
  "DUBAI",
  "HONG_KONG",
  "SYDNEY",
  "TORONTO",
  "AUSTIN",
  "MIAMI",
  "LOS_ANGELES",
  "SEATTLE",
  "BOSTON",
  "CHICAGO",
  "OTHER",
];

const UpdateUserContainer = ({ 
  onAvatarUpload, 
  isUploading = false,
  currentAvatarUrl
}: { 
  onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  isUploading?: boolean;
  currentAvatarUrl?: string;
}) => {
  const router = useRouter();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Avatar state is now handled in the parent component (UpdateUserProfile.tsx)

  const { data, refetch } = useGetUserProfile();
  const user = data?.data;
  // User authentication data will be handled differently in web version
  const { fieldOptions, loading: fieldsLoading, error: fieldsError } = useFieldOptions();
  const { mutateAsync } = useUpdateUserProfile();

  // Debug logging
  useEffect(() => {
    console.log('Field options:', fieldOptions);
    console.log('Fields loading:', fieldsLoading);
    console.log('Fields error:', fieldsError);
    console.log('User data:', data);
    console.log('User fields from API:', data?.data?.user_fields);
  }, [fieldOptions, fieldsLoading, fieldsError, data]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      username: "",
      position: "",
      project_name: "",
      city: "",
      twitter_account: "",
      linkedin_url: "",
      email: "",
      selected_fields: [],
    },
  });

  const selectedFields = watch("selected_fields");

  useEffect(() => {
    if (!user) return;
    // The API returns ApiResponse<UserWithProfile> where data.data contains user_profile and user_fields
    const profile = data?.data?.user_profile || {};
    const fields = data?.data?.user_fields || [];
    
    setValue("name", user.name ?? "");
    setValue("username", user.username ?? "");
    setValue("position", profile.position ?? "");
    setValue("project_name", profile.project_name ?? "");
    setValue("city", profile.city ?? "");
    setValue("twitter_account", profile.twitter_account ?? "");
    setValue("linkedin_url", profile.linkedin_url ?? "");
    setValue("email", user.email ?? "");

    const selectedFieldIds = fields.map((f: { id: number }) => f.id) || [];
    setValue("selected_fields", selectedFieldIds);
  }, [user, data, setValue]);

  // Avatar upload is now handled in the parent component (UpdateUserProfile.tsx)
  // This prevents duplicate toast notifications

  // --- Handle Field Selection ---
  const toggleSelectedField = (fieldId: number) => {
    const current = selectedFields;
    if (current.includes(fieldId)) {
      setValue(
        "selected_fields",
        current.filter((id) => id !== fieldId)
      );
    } else if (current.length < 3) {
      setValue("selected_fields", [...current, fieldId]);
    } else {
      toast.error("You can select up to 3 fields only.");
    }
  };

  // --- Submit Form ---
  const onSubmit = async (formData: z.infer<typeof profileSchema>) => {
    setIsSubmitting(true);
    const { selected_fields, ...rest } = formData;
    try {
      await mutateAsync({
        ...rest,
        selected_fields,
      });
      toast.success("Profile updated successfully");
      router.push("/user");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-8 pb-8 mt-4 grow"
      noValidate
    >
      {/* Avatar section - only show on mobile */}
      <div className="lg:hidden flex flex-col items-center gap-3">
        <Avatar className="rounded-[36px] w-[144px] h-[144px] border border-white shadow-md">
          <AvatarImage
            src={currentAvatarUrl || user?.photo_url || "https://github.com/shadcn.png"}
          />
          <AvatarFallback className="bg-gradient-to-br from-[#ED2944] to-[#ff6b7a] text-white text-2xl font-bold">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
                 <label
           htmlFor="mobileAvatarUpload"
           className={`text-sm text-white underline transition-colors ${
             isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:text-gray-300"
           }`}
         >
           {isUploading ? "Uploading..." : "Upload new profile picture"}
         </label>
                 <input
           id="mobileAvatarUpload"
           type="file"
           accept="image/*"
           onChange={onAvatarUpload}
           disabled={isUploading}
           className="hidden"
         />
        {/* Mobile upload loading state will be handled by the parent component */}
      </div>

      {/* --- Personal Info --- */}
      <Section title="Personal">
        <div className="grid lg:grid-cols-2 gap-6">
          <FormField label="Your name" required error={errors.name?.message}>
            <Input 
              {...register("name")} 
              className="text-black bg-white border-gray-300 focus:border-[#ED2944] focus:ring-[#ED2944]" 
              placeholder="Enter your name"
            />
          </FormField>
          <FormField label="Username" required error={errors.username?.message}>
            <Input 
              {...register("username")} 
              className="text-black bg-white border-gray-300 focus:border-[#ED2944] focus:ring-[#ED2944]" 
              placeholder="Enter your username"
            />
          </FormField>
        </div>
      </Section>

      {/* --- Project Info --- */}
      <Section title="Project">
        <div className="grid lg:grid-cols-2 gap-6">
          <FormField label="Position" required error={errors.position?.message}>
            <Controller
              name="position"
              control={control}
              render={({ field }) => (
                <Select value={field.value || ""} onValueChange={field.onChange}>
                  <SelectTrigger className="text-black bg-white border-gray-300 focus:border-[#ED2944] focus:ring-[#ED2944]">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {positionOptions.map((pos) => (
                      <SelectItem key={pos} value={pos}>
                        {pos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <FormField label="City" required error={errors.city?.message}>
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <Select value={field.value || ""} onValueChange={field.onChange}>
                  <SelectTrigger className="text-black bg-white border-gray-300 focus:border-[#ED2944] focus:ring-[#ED2944]">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cityOptions.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
        </div>
        <FormField
          label="Project name"
          required
          error={errors.project_name?.message}
        >
          <Input 
            {...register("project_name")} 
            className="text-black bg-white border-gray-300 focus:border-[#ED2944] focus:ring-[#ED2944]" 
            placeholder="Enter your project name"
          />
        </FormField>
      </Section>

             {/* --- Fields --- */}
       <Section title="Fields">
         <Label className="text-white">
           Select up to 3 fields <span className="text-red-500">*</span>
         </Label>
         <div className="flex flex-wrap gap-3">
           {fieldsLoading ? (
             <div className="flex items-center gap-2">
               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
               <p className="text-white">Loading fields...</p>
             </div>
           ) : fieldsError ? (
             <div className="flex items-center gap-2">
               <p className="text-red-400">Error loading fields: {fieldsError}</p>
               <button 
                 onClick={() => window.location.reload()} 
                 className="text-blue-400 underline hover:text-blue-300"
               >
                 Retry
               </button>
             </div>
           ) : fieldOptions && fieldOptions.length > 0 ? (
             fieldOptions.map((field) => {
               const isSelected = selectedFields.includes(field.id);
               const isDisabled = selectedFields.length >= 3 && !isSelected;
               return (
                 <Badge
                   key={field.id}
                   onClick={() => toggleSelectedField(field.id)}
                   className={`cursor-pointer border border-white rounded-[29px] px-4 py-2 font-semibold text-[0.9rem] transition-all duration-200 hover:scale-105
                     ${
                       isSelected
                         ? "bg-[#ED2944] text-white shadow-lg"
                         : "bg-transparent text-white hover:bg-white/10"
                     }
                     ${isDisabled ? "opacity-50 pointer-events-none" : ""}
                   `}
                 >
                   {field.name}
                 </Badge>
               );
             })
           ) : (
             <div className="flex flex-col gap-2">
               <p className="text-white">No fields available. Please try refreshing the page.</p>
               <button 
                 onClick={() => window.location.reload()} 
                 className="text-blue-400 underline hover:text-blue-300 w-fit"
               >
                 Refresh Page
               </button>
             </div>
           )}
         </div>
         {errors.selected_fields && (
           <p className="text-sm text-red-500">
             {errors.selected_fields.message}
           </p>
         )}
       </Section>

      {/* --- Socials --- */}
      <Section title="Socials">
        <div className="grid lg:grid-cols-3 gap-6">
          <FormField label="Twitter account">
            <Input
              {...register("twitter_account")}
              className="text-black bg-white border-gray-300 focus:border-[#ED2944] focus:ring-[#ED2944]"
              placeholder="@twitter"
            />
          </FormField>
          <FormField label="Linkedin account">
            <Input
              {...register("linkedin_url")}
              className="text-black bg-white border-gray-300 focus:border-[#ED2944] focus:ring-[#ED2944]"
              placeholder="linkedin.com/"
            />
          </FormField>
          <FormField label="Email">
            <Input
              {...register("email")}
              className="text-black bg-white border-gray-300 focus:border-[#ED2944] focus:ring-[#ED2944]"
              placeholder="you@example.com"
            />
          </FormField>
        </div>
      </Section>

      {/* --- Terms Acceptance and Submit --- */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl border border-gray-600">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(!!checked)}
            className="data-[state=checked]:bg-[#5A41FF] data-[state=checked]:border-[#5A41FF]"
          />
          <label htmlFor="terms" className="text-sm font-medium text-white">
            I agree to receive updates from Zefe.
          </label>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className={`w-full lg:w-auto lg:px-12 rounded-[29px] text-white py-4 transition-all duration-200 shadow-lg transform hover:scale-105 ${
            isSubmitting
              ? "!bg-[#5A41FF] !text-white !cursor-not-allowed"
              : "bg-[#ED2944] hover:bg-[#cb1f38]"
          }`}
        >
          {isSubmitting ? "Submitting..." : "Continue"}
        </Button>
      </div>
    </form>
  );
};

// --- Small Components ---
const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="my-6">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-1 h-8 bg-gradient-to-b from-[#ED2944] to-[#c41e3a] rounded-full"></div>
      <p className="font-bold text-2xl lg:text-3xl uppercase text-white">{title}</p>
    </div>
    <div className="flex flex-col gap-6">{children}</div>
  </div>
);

const FormField = ({
  label,
  required = false,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-3">
    <Label className="text-white">
      {label} {required && <span className="text-red-500">*</span>}
    </Label>
    {children}
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);

export default UpdateUserContainer;
