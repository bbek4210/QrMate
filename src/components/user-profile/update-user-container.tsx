"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
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
import useUploadFile from "@/hooks/use-upload-file";
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

const UpdateUserContainer = () => {
  const navigate = useNavigate();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);

  const { data, refetch } = useGetUserProfile();
  const user = data?.data;
  // const telegramInitData = useTelegramInitData();
  const { fieldOptions } = useFieldOptions();
  const { mutateAsync } = useUpdateUserProfile();
  const uploadFileMutation = useUploadFile();

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
    const profile = user.user_profile || {};
    setValue("name", user.name ?? "");
    setValue("username", user.username ?? "");
    setValue("position", profile.position ?? "");
    setValue("project_name", profile.project_name ?? "");
    setValue("city", profile.city ?? "");
    setValue("twitter_account", profile.twitter_account ?? "");
    setValue("linkedin_url", profile.linkedin_url ?? "");
    setValue("email", user.email ?? "");

    const selectedFieldIds =
      profile.user_fields?.map((f: { id: number }) => f.id) || [];
    setValue("selected_fields", selectedFieldIds);
  }, [user, setValue]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const extension = file.name.split(".").pop() || "jpg";
    const key = `zefe_profile_images/avatar-${Date.now()}.${extension}`;

    try {
      const result = await uploadFileMutation.mutateAsync({ file, key });
      const uploadedUrl = result?.data?.file_url;
      if (!uploadedUrl) throw new Error("No URL returned");

      setAvatar(uploadedUrl);

      toast.success("Profile picture uploaded");

      // 🚀 Immediately save photo_url
      await mutateAsync({ photo_url: uploadedUrl });
      toast.success("Profile picture saved");

      // 🔥 NOW: Refetch user profile to sync form again
      await refetch();
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload/save profile picture");
    }
  };

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
        photo_url: avatar || undefined,
      });
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
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-8 pb-8 mt-12 grow"
      noValidate
    >
      <div className="flex flex-col items-center gap-3">
        <Avatar className="rounded-[36px] w-[144px] h-[144px] border border-white shadow-md">
          <AvatarImage
            src={avatar || user?.photo_url || "https://github.com/shadcn.png"}
          />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <label
          htmlFor="avatarUpload"
          className="text-sm text-white underline cursor-pointer"
        >
          Upload new profile picture
        </label>
        <input
          id="avatarUpload"
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          className="hidden"
        />
      </div>

      {/* --- Personal Info --- */}
      <Section title="Personal">
        <FormField label="Your name" required error={errors.name?.message}>
          <Input {...register("name")} className="text-black" />
        </FormField>
        <FormField label="Username" required error={errors.username?.message}>
          <Input {...register("username")} className="text-black" />
        </FormField>
      </Section>

      {/* --- Project Info --- */}
      <Section title="Project">
        <Controller
          name="position"
          control={control}
          render={({ field }) => (
            <Select value={field.value || ""} onValueChange={field.onChange}>
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
          )}
        />
        <FormField
          label="Project name"
          required
          error={errors.project_name?.message}
        >
          <Input {...register("project_name")} className="text-black" />
        </FormField>
        <FormField label="City" required error={errors.city?.message}>
          <Input {...register("city")} className="text-black" />
        </FormField>
      </Section>

      {/* --- Fields --- */}
      <Section title="Fields">
        <Label className="text-white">
          Select up to 3 fields <span className="text-red-500">*</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {fieldOptions.map((field) => {
            const isSelected = selectedFields.includes(field.id);
            const isDisabled = selectedFields.length >= 3 && !isSelected;
            return (
              <Badge
                key={field.id}
                onClick={() => toggleSelectedField(field.id)}
                className={`cursor-pointer border border-white rounded-[29px] px-4 py-2 font-semibold text-[0.9rem]
                  ${
                    isSelected
                      ? "bg-[#ED2944] text-white"
                      : "bg-transparent text-white hover:bg-white/10"
                  }
                  ${isDisabled ? "opacity-50 pointer-events-none" : ""}
                `}
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
      </Section>

      {/* --- Socials --- */}
      <Section title="Socials">
        <FormField label="Twitter account">
          <Input
            {...register("twitter_account")}
            className="text-black"
            placeholder="@twitter"
          />
        </FormField>
        <FormField label="Linkedin account">
          <Input
            {...register("linkedin_url")}
            className="text-black"
            placeholder="linkedin.com/"
          />
        </FormField>
        <FormField label="Email">
          <Input
            {...register("email")}
            className="text-black"
            placeholder="you@example.com"
          />
        </FormField>
      </Section>

      {/* --- Terms Acceptance and Submit --- */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="terms"
          checked={termsAccepted}
          onCheckedChange={(checked) => setTermsAccepted(!!checked)}
          className="data-[state=checked]:bg-[#5A41FF] data-[state=checked]:border-[#5A41FF]"
        />
        <label htmlFor="terms" className="text-sm font-medium">
          I agree to receive updates from Zefe.
        </label>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className={`rounded-[29px] text-white py-4 transition-colors duration-200 ${
          isSubmitting
            ? "!bg-[#5A41FF] !text-white !cursor-not-allowed"
            : "bg-[#ED2944] hover:bg-[#cb1f38]"
        }`}
      >
        {isSubmitting ? "Submitting..." : "Continue"}
      </Button>
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
  <div className="my-4">
    <p className="font-semibold text-[32px] mb-6 uppercase">{title}</p>
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
