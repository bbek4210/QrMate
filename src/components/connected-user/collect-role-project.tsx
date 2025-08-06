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
import useInitUser from "@/hooks/useUpdateUserProfile";

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

// Form validation schema
const profileUpdateSchema = z.object({
  user_id: z.number(),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  username: z.string().min(1, "Username is required"),
  position: z.string().min(1, "Position is required"),
  project_name: z.string().min(1, "Project name is required"),
});

interface CompleteProfileDrawerProps {
  isOpen: boolean;
  onComplete: () => void;
  onOpenChange?: (open: boolean) => void;
}

const CompleteProfileDrawer = ({
  isOpen,
  onComplete,
  onOpenChange,
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
      user_id: 123456789, // Replace with dynamic values if available
      first_name: "Shooman",
      last_name: "Khatri",
      username: "shoomankhatri",
    },
  });

  const { mutate: initUser } = useInitUser();

  const onSubmit = (formData: z.infer<typeof profileUpdateSchema>) => {
    setIsSubmitting(true);

    const { user_id, first_name, last_name, username } = formData;

    initUser(
      { user_id, first_name, last_name, username },
      {
        onSuccess: () => {
          toast.success("User initialized successfully");
          onComplete();
        },
        onError: () => {
          toast.error("Initialization failed");
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
      }
    );
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
          <div>
            <Label className="text-sm font-medium text-white">First Name</Label>
            <Input
              {...register("first_name")}
              placeholder="Shooman"
              className="mt-2 text-black"
            />
            {errors.first_name && (
              <p className="text-sm text-red-500">
                {errors.first_name.message}
              </p>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium text-white">Last Name</Label>
            <Input
              {...register("last_name")}
              placeholder="Khatri"
              className="mt-2 text-black"
            />
            {errors.last_name && (
              <p className="text-sm text-red-500">{errors.last_name.message}</p>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium text-white">Username</Label>
            <Input
              {...register("username")}
              placeholder="shoomankhatri"
              className="mt-2 text-black"
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>

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
                  <SelectItem key={pos} value={pos} className="text-black">
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
              {...register("project_name")}
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
