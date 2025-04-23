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
import useUpdateUserProfile from "@/hooks/useUpdateUserProfile";
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

const profileUpdateSchema = z.object({
  position: z.string().min(1, "Position is required"),
  project_name: z.string().min(1, "Project name is required"),
});

interface CompleteProfileDrawerProps {
  isOpen: boolean;
  onComplete: () => void;
}

const CompleteProfileDrawer = ({
  isOpen,
  onComplete,
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
  });

  const { mutate: updateProfile } = useUpdateUserProfile();

  const onSubmit = (data: { position: string; project_name: string }) => {
    updateProfile(data, {
      onSuccess: () => {
        toast.success("Profile updated successfully");
        onComplete();
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onError: () => {
        toast.error("Failed to update profile");
      },
      onSettled: () => {
        setIsSubmitting(false);
      },
    });
  };

  if (!isOpen) return null;

  return (
    <Drawer open={isOpen}>
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
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-white">
              Your position
            </Label>
            <Select
              value={watch("position")}
              onValueChange={(val) => setValue("position", val)}
            >
              <SelectTrigger className="text-black">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent className="text-black">
                {positionOptions.map((pos) => (
                  <SelectItem className="text-black" key={pos} value={pos}>
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
            <Label className="text-sm font-medium text-white">
              Project Name
            </Label>
            <Input
              {...register("project_name", {
                required: "Project name is required",
              })}
              placeholder="Zefe"
              className="mt-3 text-black"
            />
            {errors.project_name && (
              <p className="text-sm text-red-500">
                {errors.project_name.message}
              </p>
            )}
          </div>

          <Button
            disabled={isSubmitting}
            type="submit"
            className="bg-[#ED2944] border border-white text-white rounded-lg py-3 mt-2"
          >
            Save
          </Button>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

export default CompleteProfileDrawer;
