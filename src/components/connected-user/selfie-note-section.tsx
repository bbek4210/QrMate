"use client";

import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

import { QUERY_KEYS } from "@/lib/query-keys";
import useUploadFile from "@/hooks/use-upload-file";
import useMakeSelfieNote from "@/hooks/use-make-selfie-note";
import useGetSelfieNote from "@/hooks/use-get-selfie-note";

import CheckedcircleSvg from "@/components/svgs/checked-circle";
import GreenCheckedCircle from "@/components/svgs/green-checkedcircle";
import SmallcameraSvg from "@/components/svgs/smallcamera";
import { TelegramIcon } from "@/components/svgs/social-icons";
import { Button } from "../ui/button";

interface SelfieNoteSectionProps {
  networkId: number;
  eventTitle: string;
  telegramAccount?: string;
  baseEventId: number;
}

const SELFIE_KEY_PREFIX = "zefe_selfies";

const SelfieNoteSection: React.FC<SelfieNoteSectionProps> = ({
  networkId,
  eventTitle,
  telegramAccount,
  baseEventId,
}) => {
  const queryClient = useQueryClient();

  const [photos, setPhotos] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [note, setNote] = useState("");

  const { data: selfieNote } = useGetSelfieNote(networkId);
  const uploadFileMutation = useUploadFile();
  const makeSelfieNote = useMakeSelfieNote();

  useEffect(() => {
    if (selfieNote) {
      setNote(selfieNote.summary_note || "");
      const existingImgs =
        selfieNote.meeting_images?.map((img: any) => img.image) || [];
      setPhotos(existingImgs);
    }
  }, [selfieNote]);

  useEffect(() => {
    const timer = setTimeout(() => setShowBadge(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter((f) => f.size > 0);

    if (validFiles.length) {
      const previews = validFiles.map((f) => URL.createObjectURL(f));
      setPhotos((prev) => [...prev, ...previews]);
      setFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleTelegramMessage = () => {
    if (telegramAccount) {
      const formattedUsername = telegramAccount.startsWith("@")
        ? telegramAccount.slice(1)
        : telegramAccount;
      const telegramUrl = `tg://resolve?domain=${formattedUsername}`;
      window.open(telegramUrl, "_blank");
    } else {
      console.error("No Telegram account provided");
    }
  };

  const handleSave = async () => {
    const currentImages =
      selfieNote?.meeting_images?.map((img: any) => ({
        note: "",
        image: img.image,
      })) || [];

    try {
      let newImages: { note: string; image: string }[] = [];

      if (files.length > 0 && !uploadFileMutation.isPending) {
        const uploads = files.map((file) => {
          const key = `${SELFIE_KEY_PREFIX}/selfie-${Date.now()}-${file.name}`;
          return uploadFileMutation.mutateAsync({ file, key });
        });

        const results = await Promise.all(uploads);
        newImages = results.map((res) => ({
          note: "",
          image: res.file_url,
        }));
      }

      const payload = {
        network_id: networkId,
        base_event_id: baseEventId,
        summary_note: note,
        meeting_images: [...currentImages, ...newImages],
      };

      makeSelfieNote.mutate(payload, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.GET_SELFIE_NOTE, networkId],
          });
          setFiles([]);
        },
      });
    } catch (err) {
      console.error("Upload or save failed:", err);
    }
  };

  return (
    <div className="mt-10 space-y-4">
      <div className="flex flex-col items-center justify-center gap-4 mb-12">
        <Badge className="bg-[#ED2944] text-white text-[0.8rem] text-center mx-auto border-white px-3 py-2 rounded-[29px]">
          Met at <span className="ml-1 font-semibold">{eventTitle}</span>
        </Badge>

        <Badge className="w-full flex items-center justify-center gap-2 text-[0.8rem] font-medium bg-green-500 text-black py-3 rounded-full mb-20">
          <CheckedcircleSvg /> Contact saved
        </Badge>
      </div>

      {photos.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            {photos.map((src, i) => (
              <div
                key={i}
                className="w-full aspect-[3/4] overflow-hidden rounded-lg border border-gray-300"
              >
                <img
                  src={src}
                  alt={`selfie-${i}`}
                  width={100}
                  height={130}
                  className="object-cover w-full h-full"
                />
              </div>
            ))}{" "}
            {/* + Button */}
            <label className="flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-400 rounded-lg aspect-[3/4] cursor-pointer text-xl font-bold text-gray-600">
              +
              <input
                type="file"
                accept="image/*"
                multiple
                capture="user"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>

          <textarea
            placeholder="Write a short note..."
            className="w-full h-[160px] p-3 text-sm text-black rounded-lg resize-none focus:outline-none"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <Button
            onClick={handleSave}
            className="w-full text-white py-2 bg-[#ED2944] rounded-[29px] font-medium "
          >
            Save
          </Button>
        </div>
      )}

      {photos.length === 0 && (
        <div className="flex flex-col gap-3">
          <label className="flex items-center justify-center gap-2 px-5 py-3 text-[0.8rem] bg-[#ED2944] text-white border border-white rounded-[29px] cursor-pointer">
            <SmallcameraSvg /> Take a selfie
            <input
              type="file"
              accept="image/*"
              capture="user"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </label>

          <textarea
            placeholder="Write a short note..."
            className="w-full h-[160px] p-3 text-sm text-black rounded-lg resize-none focus:outline-none"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <Button
            onClick={handleSave}
            className="w-full text-black py-2 bg-white rounded-[29px] border border-white font-medium hover:bg-[#5A41FF] text-[0.8rem]"
          >
            Save
          </Button>
          {/* 
          <Button
            onClick={handleTelegramMessage}
            className="w-full text-white py-2 bg-[#ED2944] rounded-[29px] border border-white font-medium"
          >
            <svg
              width="51"
              height="50"
              viewBox="0 0 35 34"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17.5012 31.1667C9.6771 31.1667 3.33447 24.824 3.33447 17C3.33447 9.176 9.6771 2.83337 17.5012 2.83337C25.3251 2.83337 31.6678 9.176 31.6678 17C31.6678 24.824 25.3251 31.1667 17.5012 31.1667ZM13.0903 18.657C13.0936 18.6581 13.0972 18.6576 13.1002 18.6557C13.1069 18.6515 13.1158 18.655 13.1181 18.6626C13.8729 21.1546 14.2795 22.4971 14.338 22.6901C14.3431 22.707 14.3484 22.723 14.3546 22.7394C14.5128 23.1573 14.7282 23.2321 14.9884 23.197C15.2536 23.161 15.3944 23.0175 15.5675 22.8505C15.5675 22.8505 15.5675 22.8505 15.5676 22.8504C15.5687 22.8493 15.927 22.5035 16.6425 21.813C16.994 21.4738 17.5395 21.4378 17.9321 21.7283L20.8656 23.8989C21.5241 24.2627 21.9995 24.075 22.163 23.2868L24.5115 12.2066C24.7708 11.1753 24.316 10.7617 23.5163 11.0891L9.72788 16.4151C8.78719 16.7932 8.79174 17.3195 9.55662 17.5541L13.0903 18.657Z"
                fill="white"
              />
            </svg>
            Message in Telegram
          </Button> */}
        </div>
      )}

      {makeSelfieNote.isSuccess && (
        <p className="text-sm font-medium text-center text-green-500">
          <GreenCheckedCircle />
          Users information saved successfully!
        </p>
      )}

      {makeSelfieNote.isError && (
        <p className="text-sm font-medium text-center text-red-500">
          Failed to save users information. Please try again.
        </p>
      )}

      {telegramAccount && (
        <a
          href={telegramAccount}
          target="_blank"
          className="flex items-center justify-center gap-2 mt-6 w-full h-[64px] text-white bg-[#ED2944] border border-white text-[0.8rem] font-medium rounded-[29px]"
        >
          <TelegramIcon /> Message in Telegram
        </a>
      )}
    </div>
  );
};

export default SelfieNoteSection;
