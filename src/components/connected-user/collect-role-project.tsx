"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";
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
import { useState, useRef, useEffect } from "react";
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
  "KATHMANDU",
  "POKHARA",
  "LALITPUR",
  "BHARATPUR",
  "BIRATNAGAR",
  "BIRGUNJ",
  "DHARAN",
  "DHANGADHI",
  "BUTWAL",
  "HETAUDA",
  "NEPALGANJ",
  "ITAHARI",
  "TRIYUGA",
  "GODAWARI",
  "GULARIYA",
  "TULSIPUR",
  "SIDDHARTHANAGAR",
  "BHAKTAPUR",
  "DHANKUTA",
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
  const [customCity, setCustomCity] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const projectNameRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<z.infer<typeof profileUpdateSchema>>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      position: userData?.position || "",
      project_name: userData?.project_name || "",
      city: userData?.city || "",
    },
    mode: "onChange",
  });

  // Watch form values for debugging
  const watchedValues = watch();
  console.log("Profile form values:", watchedValues);
  console.log("Profile form errors:", errors);
  console.log("Profile form isValid:", isValid);

  const { mutateAsync: updateProfile } = useUpdateUserProfile();

  // Ensure focus works properly when drawer opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure drawer is fully rendered
      setTimeout(() => {
        if (projectNameRef.current) {
          projectNameRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen]);

  // Reset form when drawer opens/closes
  useEffect(() => {
    if (isOpen) {
      setValue("position", userData?.position || "");
      setValue("project_name", userData?.project_name || "");
      setValue("city", userData?.city || "");
      setSelectedCity(userData?.city || "");
      setCustomCity("");
    }
  }, [isOpen, userData, setValue]);

  const onSubmit = async (formData: z.infer<typeof profileUpdateSchema>) => {
    console.log("Submitting profile data:", formData);
    setIsSubmitting(true);

    try {
      // If "OTHER" is selected, use the custom city value
      const finalCity = formData.city === "OTHER" ? customCity : formData.city;
      
      const profileData = {
        ...formData,
        city: finalCity,
      };
      
      // Only send the missing fields that need to be updated
      await updateProfile(profileData);
      toast.success("Profile updated successfully");
      onComplete();
    } catch (error) {
      toast.error("Profile update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCityChange = (value: string) => {
    console.log("City selected:", value);
    setSelectedCity(value);
    setValue("city", value);
    
    // Clear custom city if not "OTHER"
    if (value !== "OTHER") {
      setCustomCity("");
    }
  };

  if (!isOpen) return null;

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="px-6 py-8 bg-[#232322] max-w-[80%] mx-auto">
        <DrawerHeader>
          <DrawerTitle className="text-lg font-semibold text-center text-white">
            Complete missing information
          </DrawerTitle>
        </DrawerHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5 mt-4"
        >
         
         
         <div>
            <Label className="text-sm font-medium text-white">Project Name *</Label>
            <Controller
              name="project_name"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  ref={projectNameRef}
                  placeholder="Enter your project name"
                  className="mt-2 w-full h-[58px] rounded-[1rem] bg-white px-6 py-3 text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ED2944] focus:border-transparent"
                  onFocus={(e) => {
                    console.log("Project name focused");
                    e.target.select();
                  }}
                />
              )}
            />
            {errors.project_name && (
              <p className="text-sm text-red-500">{errors.project_name.message}</p>
            )}
          </div>
          {/* Only ask for missing information */}
          <div>
            <Label className="text-sm font-medium text-white">Position *</Label>
            <Controller
              name="position"
              control={control}
              render={({ field }) => (
                <Select 
                  onValueChange={(value) => {
                    console.log("Position selected:", value);
                    field.onChange(value);
                  }} 
                  value={field.value || ""}
                >
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
              )}
            />
            {errors.position && (
              <p className="text-sm text-red-500">{errors.position.message}</p>
            )}
          </div>

         

          <div>
            <Label className="text-sm font-medium text-white">City *</Label>
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <Select 
                  onValueChange={handleCityChange}
                  value={selectedCity || ""}
                >
                  <SelectTrigger className="mt-2 w-full h-[58px] rounded-[1rem] bg-white text-black border border-gray-300 focus:ring-2 focus:ring-[#ED2944] focus:border-transparent">
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
              )}
            />
            
            {/* Custom city input field */}
            {selectedCity === "OTHER" && (
              <div className="mt-2">
                <input
                  type="text"
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  placeholder="Enter your city name"
                  className="w-full h-[58px] rounded-[1rem] bg-white px-6 py-3 text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ED2944] focus:border-transparent"
                  disabled={isSubmitting}
                />
                {!customCity && selectedCity === "OTHER" && (
                  <p className="text-sm text-red-500 mt-1">Please enter your city name</p>
                )}
              </div>
            )}
            
            {errors.city && (
              <p className="text-sm text-red-500">{errors.city.message}</p>
            )}
          </div>

          <Button
            disabled={isSubmitting || !isValid || (selectedCity === "OTHER" && !customCity)}
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
