"use client";

import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

import CheckedcircleSvg from "@/components/svgs/checked-circle";
import SmallcameraSvg from "@/components/svgs/smallcamera";
import { TelegramIcon } from "@/components/svgs/social-icons";

import { QUERY_KEYS } from "@/lib/query-keys";
import useUploadFile from "@/hooks/use-upload-file";
import useMakeSelfieNote from "@/hooks/use-make-selfie-note";
import useGetSelfieNote from "@/hooks/use-get-selfie-note";
import loadImage from "blueimp-load-image";

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
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isFromScanner = searchParams.get("ref") === "scanner";
  const canUploadSelfie = isFromScanner;

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        selfieNote.meeting_images?.map((img: any) => img.image) || [];
      setPhotos(existingImgs);
    }
  }, [selfieNote]);

  useEffect(() => {
    function adjustTextareaPosition() {
      const textarea = document.getElementById("summary_note_textarea");
      const viewportHeight =
        window.visualViewport?.height || window.innerHeight;

      if (textarea) {
        const rect = textarea.getBoundingClientRect();
        const bottomSpace = viewportHeight - rect.bottom;

        if (bottomSpace < 100) {
          // Moins de 100px d'espace = textarea trop bas
          textarea.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }

    window.visualViewport?.addEventListener("resize", adjustTextareaPosition);

    return () => {
      window.visualViewport?.removeEventListener(
        "resize",
        adjustTextareaPosition
      );
    };
  }, []);

  const handleSave = async (incomingFiles?: File[]) => {
    const currentImages =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      selfieNote?.meeting_images?.map((img: any) => ({
        note: "",
        image: img.image,
      })) || [];

    try {
      let newImages: { note: string; image: string }[] = [];

      const fileList = incomingFiles ?? files; // Prefer incomingFiles if provided, otherwise fallback to state


      if (fileList.length > 0 && !uploadFileMutation.isPending) {
        const uploads = fileList.map((file) => {
          const extension = file.name.split(".").pop() || "jpg";
          const key = `${SELFIE_KEY_PREFIX}/selfie-${Date.now()}.${extension}`;
          return uploadFileMutation.mutateAsync({ file, key });
        });

        const results = await Promise.all(uploads);
        newImages = results.map((res) => {
          return {
            note: "",
            image: res?.data?.file_url,
          };
        });

        console.log({ newImages });
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
          setFiles([]); // Clear uploaded files after mutation
        },
      });
    } catch (err) {
      console.error("Upload or save failed:", err);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canUploadSelfie) return;

    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter((f) => f.size > 0);


    if (validFiles.length) {
      const correctedImages = await Promise.all(
        validFiles.map((file) => {
          return new Promise<string>((resolve, reject) => {
            loadImage(
              file,
              (img: { toDataURL: () => string | PromiseLike<string> }) => {
                if (img instanceof HTMLCanvasElement) {
                  resolve(img.toDataURL());
                } else {
                  reject("Could not load image");
                }
              },
              { orientation: true, canvas: true }
            );
          });
        })
      );

      setPhotos((prev) => [...prev, ...correctedImages]);
      setFiles((prev) => [...prev, ...validFiles]);

      setTimeout(() => {
        handleSave(validFiles);
      }, 100);
    }
  };

  // const handleRemoveImage = (index: number) => {
  //   setPhotos((prev) => prev.filter((_, i) => i !== index));
  //   setFiles((prev) => prev.filter((_, i) => i !== index));
  // };

  return (
    <div>
      <div className="mt-10 space-y-4">
        {isFromScanner && (
          <div className="flex flex-col items-center justify-center gap-4 mb-12">
            <Badge className="bg-[#ED2944] text-white text-[0.8rem] text-center mx-auto border-white px-3 py-2 rounded-[29px]">
              Met at <span className="ml-1 font-semibold">{eventTitle}</span>
            </Badge>

            <Badge className="w-full flex items-center justify-center gap-2 text-[0.8rem] font-medium bg-green-500 text-black py-3 rounded-full mb-20">
              <CheckedcircleSvg /> Contact saved
            </Badge>
          </div>
        )}

        {/* {photos.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            {photos.map((src, i) => (
              <div
                key={i}
                className="relative w-full aspect-[3/4] overflow-hidden rounded-lg border border-gray-300"
              >
                <img
                  src={src}
                  alt={`selfie-${i}`}
                  width={100}
                  height={130}
                  className="object-cover w-full h-full"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(i)}
                  className="absolute p-1 text-xs font-bold text-black transition-all bg-white rounded-full shadow-md top-1 right-1 hover:bg-red-500 hover:text-white"
                  aria-label="Remove photo"
                >
                  ×
                </button>
              </div>
            ))}

            {canUploadSelfie && (
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
            )}
          </div>

          <textarea
            placeholder="Write a short note..."
            className="w-full h-[160px] p-3 text-sm text-black rounded-lg resize-none focus:outline-none"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={handleSave}
          />

          <Button
            onClick={handleSave}
            className="w-full text-white py-2 bg-[#ED2944] rounded-[29px] font-medium "
          >
            Save
          </Button>
        </div>
      )} */}

        <div className="flex items-stretch gap-3">
          {photos.length === 0 && canUploadSelfie ? (
            <label className="flex items-center justify-center gap-2 px-5 py-3 text-[0.8rem] bg-[#ED2944] text-white border border-white rounded-[29px] cursor-pointer">
              <SmallcameraSvg /> Take an selfie
              <input
                type="file"
                accept="image/*"
                capture="user"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          ) : (
            <div>
              {photos.map((i) => {
                if (!i) {
                  return null;
                } else {
                  return <img src={i} className="rounded-md" />;
                }
              })}
            </div>
          )}

          <textarea
            id="summary_note_textarea"
            placeholder="Write a short note..."
            className="w-full min-w-[50%] min-h-[160px] p-3 text-sm text-black rounded-lg resize-none focus:outline-none"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => handleSave()}
          />
        </div>

        {/* {makeSelfieNote.isSuccess && (
          <p className="text-sm font-medium text-center text-green-500">
            <GreenCheckedCircle />
            Users information saved successfully!
          </p>
        )} */}

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
    </div>
  );
};

export default SelfieNoteSection;
