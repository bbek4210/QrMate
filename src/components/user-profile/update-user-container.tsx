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
import useGetUserProfile from "@/hooks/use-get-user-profile";
import { useNavigate } from "react-router-dom";
import useUploadFile from "@/hooks/use-upload-file";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(1, "Username is required"),
  position: z.string().min(1, "Position is required"),
  project_name: z.string().min(1, "Project name is required"),
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

const UpdateUserContainer = () => {
  const navigate = useNavigate();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);

  const telegramInitData = useTelegramInitData();
  const { data } = useGetUserProfile();
  const userProfile = data?.data;
  console.log({ userProfile });
  const { mutateAsync } = useUpdateUserProfile();
  const uploadFileMutation = useUploadFile();

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

  const selectedFields = watch("selected_fields");

  useEffect(() => {
    if (telegramInitData?.user) {
      const user = telegramInitData.user;
      setValue("name", `${user.first_name} ${user.last_name || ""}`.trim());
      setValue("username", user.username || "");
    }
  }, [telegramInitData, setValue]);

  useEffect(() => {
    if (userProfile) {
      const profile = userProfile?.user_profile;
      setValue("name", userProfile?.name || "");
      setValue("username", userProfile?.username || "");
      setValue("position", profile?.position || "");
      setValue("project_name", profile?.project_name || "");
      setValue("city", profile?.city || "");
      setValue("twitter_account", profile?.twitter_account || "");
      setValue("linkedin_url", profile?.linkedin_url || "");
      setValue("email", profile?.email || "");

      const selectedFieldIds =
        profile?.user_fields?.map((field: { id: number }) => field.id) || [];
      setValue("selected_fields", selectedFieldIds);
      if (profile?.photo_url) {
        setAvatar(profile?.photo_url);
      }
    }
  }, [userProfile, setValue]);

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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const KEY_PREFIX = "zefe_profile_images";

    const extension = file.name.split(".").pop() || "jpg";
    const key = `${KEY_PREFIX}/avatar-${Date.now()}.${extension}`;

    try {
      const result = await uploadFileMutation.mutateAsync({ file, key });
      setAvatar(result.file_url);
      toast.success("Profile picture uploaded");
    } catch (err) {
      toast.error("Failed to upload profile picture");
    }
  };

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    setIsSubmitting(true);
    const { selected_fields, ...rest } = data;
    const formattedData = {
      ...rest,
      user_fields: selected_fields,
      avatar_url: avatar || undefined,
    };

    try {
      await mutateAsync(formattedData);
      toast.success("Profile updated successfully");
      navigate("/user");
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
        <Avatar className="rounded-[36px] w-[144px] h-[144px] border border-white shadow-md">
          <AvatarImage src={avatar || "https://github.com/shadcn.png"} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <label
          htmlFor="avatarUpload"
          className="text-sm text-[#5A41FF] underline cursor-pointer"
        >
          Upload new profile picture
        </label>
        <input
          type="file"
          id="avatarUpload"
          accept="image/*"
          onChange={handleAvatarUpload}
          className="hidden"
        />
      </div>

      {/* PERSONAL */}
      <div className="my-4">
        <p className="font-semibold text-[32px] mb-6 uppercase">Personal</p>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <Label className="text-white">
              Your name <span className="text-red-500">*</span>
            </Label>
            <Input {...register("name")} className="text-black" />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <Label className="text-white">Username *</Label>
            <Input {...register("username")} className="text-black" />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* PROJECT */}
      <div className="my-4">
        <p className="font-semibold text-[32px] mb-6 uppercase">Project</p>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <Label className="text-white">Position *</Label>
            <Select
              value={watch("position")}
              onValueChange={(val) => setValue("position", val)}
            >
              <SelectTrigger className="text-black">
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
            {errors.position && (
              <p className="text-sm text-red-500">{errors.position.message}</p>
            )}
          </div>
          <Label className="text-white">Project name *</Label>
          <Input
            {...register("project_name")}
            className="text-black"
            placeholder="Project name"
          />
          <Label className="text-white">City *</Label>
          <Input
            {...register("city")}
            className="text-black"
            placeholder="City"
          />
        </div>
      </div>

      {/* FIELDS */}
      <div className="flex flex-col gap-3">
        <Label className="text-white">Select up to 3 fields *</Label>
        <div className="flex flex-wrap gap-2">
          {fieldOptions.map((field) => {
            const isSelected = selectedFields.includes(field.id);
            const isDisabled = selectedFields.length >= 3 && !isSelected;
            return (
              <Badge
                key={field.id}
                onClick={() => !isDisabled && toggleSelectedField(field.id)}
                className={`cursor-pointer ${
                  isSelected
                    ? "bg-red-500 text-white"
                    : isDisabled
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-transparent border border-white text-white"
                }`}
              >
                {field.name}
              </Badge>
            );
          })}
        </div>
        {errors.selected_fields && (
          <p className="text-sm text-red-500">
            {errors.selected_fields.message}
          </p>
        )}
      </div>

      {/* SOCIALS */}
      <div className="my-4">
        <p className="font-semibold text-[32px] mb-6 uppercase">Socials</p>
        <div className="flex flex-col gap-6">
          <Label className="text-white">Twitter account </Label>
          <Input
            {...register("twitter_account")}
            className="text-black"
            placeholder="@twitter"
          />
          <Label className="text-white">Linkedin account </Label>
          <Input
            {...register("linkedin_url")}
            className="text-black"
            placeholder="linkedin.com/"
          />
          <Label className="text-white">Email </Label>
          <Input
            {...register("email")}
            className="text-black"
            placeholder="you@example.com"
          />
        </div>
      </div>

      {/* TERMS + SUBMIT */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="terms"
          checked={termsAccepted}
          onCheckedChange={(checked) => setTermsAccepted(!!checked)}
        />
        <label htmlFor="terms" className="text-sm font-medium">
          I agree to receive updates from Zefe.
        </label>
      </div>
      <Button
        type="submit"
        disabled={isSubmitting || !termsAccepted}
        className="rounded-[29px] text-white bg-[#ED2944] border-white py-4"
      >
        {isSubmitting ? "Submitting..." : "Continue"}
      </Button>
    </form>
  );
};

export default UpdateUserContainer;
