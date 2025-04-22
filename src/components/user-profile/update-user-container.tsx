"use client";
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
import { Button } from "../ui/button";
import useUpdateUserProfile from "@/hooks/useUpdateUserProfile";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { useTelegramInitData } from "@/hooks/useTelegramInitData";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(1, "Username is required"),
  position: z.string().min(1, "Position is required"),
  project_name: z.string().min(1, "Project name is required"),
  // company_name: z.string().min(1, "Company name is required"),
  city: z.string().min(1, "City is required"),
  telegram_account: z.string().min(1, "Telegram account is required"),
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
const fieldOptions = [
  {
    id: 1,
    name: "DEFI",
  },
  {
    id: 2,
    name: "DePIN",
  },
  {
    id: 3,
    name: "RWA",
  },
  {
    id: 4,
    name: "GAMEFI",
  },
  {
    id: 5,
    name: "TOKEN",
  },
  {
    id: 6,
    name: "NFT",
  },
  {
    id: 7,
    name: "AI",
  },
  {
    id: 8,
    name: "EVENT",
  },
  {
    id: 9,
    name: "DAO",
  },
  {
    id: 10,
    name: "SOCIAL",
  },
  {
    id: 11,
    name: "COMMUNITY",
  },
  {
    id: 12,
    name: "TOKENIZATION",
  },
  {
    id: 13,
    name: "BLOCKCHAIN",
  },
  {
    id: 14,
    name: "Venture Capital",
  },
  {
    id: 15,
    name: "INVESTMENT",
  },
];

type ProfileData = {
  name: string;
  username: string;
  position: string;
  project_name: string;
  company_name: string;
  city: string;
  telegram_account: string;
  twitter_account: string;
  linkedin_url: string;
  email: string;
  selected_fields: number[];
};

const UpdateUserContainer = () => {
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const telegramInitData = useTelegramInitData();

  const { mutateAsync } = useUpdateUserProfile();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      username: "",
      position: "",
      project_name: "",

      city: "",
      telegram_account: "",
      twitter_account: "",
      linkedin_url: "",
      email: "",
      selected_fields: [],
    },
  });
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Validation errors:", errors);
    }
  }, [errors]);

  useEffect(() => {
    if (telegramInitData?.user) {
      const user = telegramInitData.user;
      setValue("name", `${user.first_name} ${user.last_name || ""}`.trim());
      setValue("username", user.username || "");
    }
  }, [telegramInitData, setValue]);

  const selectedFields = watch("selected_fields");

  const toggleSelectedField = (fieldId: number) => {
    const current = getValues("selected_fields");
    if (current.includes(fieldId)) {
      setValue(
        "selected_fields",
        current.filter((id) => id !== fieldId)
      );
    } else {
      if (current.length >= 3) {
        toast.error("You can select up to 3 fields only.");
      } else {
        setValue("selected_fields", [...current, fieldId]);
      }
    }
  };

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    setIsSubmitting(true);
    const { selected_fields, ...rest } = data;
    const formattedData = {
      ...rest,
      user_fields: selected_fields,
    };

    try {
      await mutateAsync(formattedData);

      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-8 pb-8 mt-12 grow"
    >
      <div className="flex flex-col items-center justify-center w-full gap-3">
        <Avatar className="rounded-[36px] w-[144px] h-[144px]">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <p className="font-semibold text-[15px]">Change image</p>
      </div>
      <div className="my-4">
        <p className="font-semibold text-[32px] mb-6 uppercase">PERSONAL</p>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <Label className="text-[#ffffff]">
              Your name <span className="text-red-500">*</span>
            </Label>
            <Input
              {...register("name")}
              className="text-black"
              placeholder="Satoshi Nakamoto"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <Label className="text-ffffff">
              Username <span className="text-red-500">*</span>
            </Label>
            <Input
              {...register("username")}
              className="text-black"
              placeholder="@bbekbhandari"
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>
        </div>
      </div>
      <div className="my-4">
        <p className="font-semibold text-[32px] mb-6 uppercase text-[#ffffff]">
          PROJECTS
        </p>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <Label className="text-[#ffffff]">
              Your position <span className="text-red-500">*</span>
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
          <div className="flex flex-col gap-3">
            <Label className="text-[#ffffff]">
              Project name <span className="text-red-500">*</span>
            </Label>
            <Input
              {...register("project_name")}
              className="text-black"
              placeholder="Superfluid"
            />
            {errors.project_name && (
              <p className="text-sm text-red-500">
                {errors.project_name.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <Label className="text-[#ffffff]">
              City <span className="text-red-500">*</span>
            </Label>
            <Input
              {...register("city")}
              className="text-black"
              placeholder="Dubai"
            />
            {errors.city && (
              <p className="text-sm text-red-500">{errors.city.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <Label className="text-white font-semibold text-[19px]">
              Select relevant fields (only three){" "}
              <span className="text-red-500">*</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {fieldOptions.map((field) => {
                const isSelected = selectedFields.includes(field.id);
                const isDisabled = selectedFields.length >= 3 && !isSelected;

                return (
                  <Badge
                    key={field.id}
                    onClick={() => !isDisabled && toggleSelectedField(field.id)}
                    className={`!text-white font-medium text-[15px] px-4 py-2 rounded-full border transition-all duration-200 ${
                      isSelected
                        ? "!bg-[#E30613] !border-[#ffffff]"
                        : isDisabled
                        ? "!bg-transparent !border-[#ffffff] !text-[#888] opacity-50 cursor-not-allowed"
                        : "!bg-transparent !border-white !text-white cursor-pointer"
                    }`}
                  >
                    {field.name}
                  </Badge>
                );
              })}{" "}
            </div>
            {errors.selected_fields && (
              <p className="text-sm text-red-500">
                {errors.selected_fields.message}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4">
        <p className="font-semibold text-[32px] mb-6 uppercase">SOCIALS</p>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <Label className="text-white">
              Your telegram account <span className="text-red-500">*</span>
            </Label>
            <Input
              {...register("telegram_account")}
              className="text-black"
              placeholder="@telegram"
            />
            {errors.telegram_account && (
              <p className="text-sm text-red-500">
                {errors.telegram_account.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <Label className="text-white">
              X (Twitter) username (OPTIONAL)
            </Label>
            <Input
              {...register("twitter_account")}
              className="text-black"
              placeholder="@xyz"
            />
          </div>
          <div className="flex flex-col gap-3">
            <Label className="text-white"> Linkedln URL (OPTIONAL)</Label>
            <Input
              {...register("linkedin_url")}
              className="text-black"
              placeholder="linkedin.com/"
            />
          </div>
          <div className="flex flex-col gap-3">
            <Label className="text-white">Email address (OPTIONAL)</Label>
            <Input
              {...register("email")}
              className="text-black"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="terms"
          checked={termsAccepted}
          onCheckedChange={(checked) => setTermsAccepted(!!checked)}
        />
        <label
          htmlFor="terms"
          className="text-[15px] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I agree to receive updates from Zefe team.{" "}
        </label>
      </div>
      <Button
        type="submit"
        disabled={isSubmitting || !termsAccepted}
        className="rounded-[29px] text-white bg-[#ED2944] border-2 border-white py-4"
      >
        {isSubmitting ? "Submitting..." : "Continue"}
      </Button>
    </form>
  );
};

export default UpdateUserContainer;
