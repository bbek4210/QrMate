"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import useUpdateUserProfile from "@/hooks/useUpdateUserProfile";

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

// Form validation schema
const profileUpdateSchema = z.object({
  position: z.string().min(1, "Position is required"),
  project_name: z.string().min(1, "Project name is required"),
  city: z.string().min(1, "City is required"),
});

interface CompleteProfileDrawerProps {
  isOpen: boolean;
  onComplete: () => void;
  onOpenChange?: (open: boolean) => void;
  userData?: {
    name?: string;
    username?: string;
    position?: string;
    project_name?: string;
    city?: string;
  };
}

const CompleteProfileDrawer = ({
  isOpen,
  onComplete,
  onOpenChange,
  userData,
}: CompleteProfileDrawerProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof profileUpdateSchema>>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      position: userData?.position || "",
      project_name: userData?.project_name || "",
      city: userData?.city || "",
    },
  });

  const { mutateAsync: updateProfile } = useUpdateUserProfile();

  const onSubmit = async (formData: z.infer<typeof profileUpdateSchema>) => {
    setIsSubmitting(true);

    try {
      // Only send the missing fields that need to be updated
      await updateProfile(formData);
      toast.success("Profile updated successfully");
      onComplete();
    } catch (error) {
      toast.error("Profile update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="px-6 py-8 bg-[#232322]">
        <DrawerHeader>
          <DrawerTitle className="text-lg font-semibold text-center text-white">
            Complete missing information
          </DrawerTitle>
        </DrawerHeader>

                 <form
           onSubmit={handleSubmit(onSubmit)}
           className="flex flex-col gap-5 mt-4"
         >
           {/* Show existing user info (read-only) */}
          
           {userData?.username && (
             <div>
               <Label className="text-sm font-medium text-white">Username</Label>
               <Input
                 value={userData.username}
                 disabled
                 className="mt-2 text-black bg-[#F4F4F4] border border-gray-300"
               />
             </div>
           )}

           {/* Only ask for missing information */}
           <div>
             <Label className="text-sm font-medium text-white">Position *</Label>
             <Select onValueChange={(value) => setValue("position", value)}>
               <SelectTrigger className="mt-2 text-black">
                 <SelectValue placeholder="Select your position" />
               </SelectTrigger>
               <SelectContent>
                 {positionOptions.map((pos) => (
                   <SelectItem key={pos} value={pos}>
                     {pos}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
             {errors.position && (
               <p className="text-sm text-red-500">{errors.position.message}</p>
             )}
           </div>

           <div>
             <Label className="text-sm font-medium text-white">Project Name *</Label>
             <Input
               {...register("project_name")}
               placeholder="Enter your project name"
               className="mt-2 text-black"
             />
             {errors.project_name && (
               <p className="text-sm text-red-500">{errors.project_name.message}</p>
             )}
           </div>

           <div>
             <Label className="text-sm font-medium text-white">City *</Label>
             <Select onValueChange={(value) => setValue("city", value)}>
               <SelectTrigger className="mt-2 text-black">
                 <SelectValue placeholder="Select your city" />
               </SelectTrigger>
               <SelectContent>
                 {cityOptions.map((city) => (
                   <SelectItem key={city} value={city}>
                     {city.replace(/_/g, ' ')}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
             {errors.city && (
               <p className="text-sm text-red-500">{errors.city.message}</p>
             )}
           </div>

          <Button
            disabled={isSubmitting}
            type="submit"
            className="bg-[#ED2944] border hover:bg-[#5A41FF] border-white text-white rounded-lg py-3 mt-2"
          >
            Save
          </Button>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

export default CompleteProfileDrawer;
