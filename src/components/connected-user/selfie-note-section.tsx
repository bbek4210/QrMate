"use client";

import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";


import CheckedcircleSvg from "@/components/svgs/checked-circle";
import SmallcameraSvg from "@/components/svgs/smallcamera";
import { TelegramIcon } from "@/components/svgs/social-icons";

import { QUERY_KEYS } from "@/lib/query-keys";
import useUploadFile from "@/hooks/use-upload-file";
import useMakeSelfieNote from "@/hooks/use-make-selfie-note";
import useGetSelfieNote from "@/hooks/use-get-selfie-note";

// Native image orientation correction function
const correctImageOrientation = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Set canvas size to image size
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image on canvas (this automatically corrects orientation)
      ctx?.drawImage(img, 0, 0);
      
      // Convert to data URL
      const dataURL = canvas.toDataURL('image/jpeg', 0.8);
      resolve(dataURL);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    // Create object URL for the file
    const objectURL = URL.createObjectURL(file);
    img.src = objectURL;
    
    // Clean up object URL after image loads
    img.onload = () => {
      URL.revokeObjectURL(objectURL);
    };
  });
};

interface SelfieNoteSectionProps {
  networkId: number;
  eventTitle: string;
  telegramAccount?: string;
  baseEventId: number;
  onSaved?: () => void;
}

const SELFIE_KEY_PREFIX = "zefe_selfies";

const SelfieNoteSection: React.FC<SelfieNoteSectionProps> = ({
  networkId,
  eventTitle,
  telegramAccount,
  baseEventId,
  onSaved,
}) => {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const isFromScanner = searchParams?.get("ref") === "scanner";
  const canUploadSelfie = isFromScanner;

  const [photos, setPhotos] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [note, setNote] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [originalNote, setOriginalNote] = useState("");
  const [originalPhotos, setOriginalPhotos] = useState<string[]>([]);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);

  const { data: selfieNote, isLoading } = useGetSelfieNote(networkId);
  const uploadFileMutation = useUploadFile();
  const makeSelfieNote = useMakeSelfieNote();

  useEffect(() => {
    console.log("SelfieNote data received:", selfieNote);
    if (selfieNote) {
      const newNote = selfieNote.summary_note || "";
      const existingImgs = selfieNote.meeting_images?.map((img: any) => img.image) || [];
      
      console.log("Setting note:", newNote);
      console.log("Setting images:", existingImgs);
      
      setNote(newNote);
      setOriginalNote(newNote);
      setPhotos(existingImgs);
      setOriginalPhotos(existingImgs);
      setHasChanges(false);
      
      // Check if there's existing data
      const hasData = newNote.trim() !== "" || existingImgs.length > 0;
      setHasExistingData(hasData);
      setIsReadOnly(hasData); // Make read-only if there's existing data
    }
  }, [selfieNote]);

  // Check for changes whenever note or photos change
  useEffect(() => {
    if (isReadOnly) return; // Don't check changes if read-only
    
    const noteChanged = note !== originalNote;
    const photosChanged = photos.length !== originalPhotos.length || 
      photos.some((photo, index) => photo !== originalPhotos[index]);
    
    setHasChanges(noteChanged || photosChanged);
  }, [note, photos, originalNote, originalPhotos, isReadOnly]);

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
            queryKey: [QUERY_KEYS.NETWORKING.GET_SELFIE_NOTE, networkId],
          });
          setFiles([]); // Clear uploaded files after mutation
          setHasChanges(false); // Reset changes flag
          setOriginalNote(note); // Update original note
          setOriginalPhotos([...photos, ...newImages.map(img => img.image)]); // Update original photos
          setIsReadOnly(true); // Make read-only after save
          setHasExistingData(true); // Mark as having existing data
          // Call the onSaved callback to refresh parent component data
          onSaved?.();
        },
      });
    } catch (err) {
      console.error("Upload or save failed:", err);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canUploadSelfie || isReadOnly) return;

    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter((f) => f.size > 0);

    if (validFiles.length) {
      const correctedImages = await Promise.all(
        validFiles.map((file) => {
          return correctImageOrientation(file);
        })
      );

      setPhotos((prev) => [...prev, ...correctedImages]);
      setFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleRemoveImage = (index: number) => {
    if (isReadOnly) return;
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ED2944]"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mt-1 space-y-4">
        {isFromScanner && (
          <div className="flex flex-col items-center justify-center gap-4 mb-4">
            <Badge className="bg-[#ED2944] text-white text-[0.8rem] text-center mx-auto border-white px-3 py-2 rounded-[29px]">
              Met at <span className="ml-1 font-semibold">{eventTitle}</span>
            </Badge>

            <Badge className="w-full flex items-center justify-center gap-2 text-[0.8rem] font-medium bg-green-500 text-black py-3 rounded-full mb-4">
              <CheckedcircleSvg /> Contact saved
            </Badge>
          </div>
        )}

        {/* Show existing data message if read-only */}
        {isReadOnly && hasExistingData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-blue-800 text-sm font-medium">
              📝 Meeting information has been saved and is now read-only
            </p>
          </div>
        )}

        <div className="flex items-stretch gap-3">
          {photos.length === 0 && canUploadSelfie && !isReadOnly ? (
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
            <div className="flex flex-col gap-2">
              {photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img 
                    src={photo} 
                    alt={`selfie-${index}`}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-300" 
                  />
                  {!isReadOnly && (
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {canUploadSelfie && !isReadOnly && (
                <label className="flex items-center justify-center gap-2 px-3 py-2 text-[0.7rem] bg-[#ED2944] text-white border border-white rounded-lg cursor-pointer w-20 h-20">
                  <SmallcameraSvg /> Add
                  <input
                    type="file"
                    accept="image/*"
                    capture="user"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          )}

          <textarea
            id="summary_note_textarea"
            placeholder={isReadOnly ? "No note available" : "Write a short note..."}
            className={`w-full min-w-[50%] min-h-[160px] p-3 text-sm rounded-lg resize-none focus:outline-none ${
              isReadOnly 
                ? 'bg-gray-100 text-gray-600 cursor-not-allowed' 
                : 'text-black'
            }`}
            value={note}
            onChange={(e) => !isReadOnly && setNote(e.target.value)}
            readOnly={isReadOnly}
          />
        </div>

        {/* Save Button - Only show when there are changes and not read-only */}
        {hasChanges && !isReadOnly && (
          <div className="flex justify-center">
            <Button
              onClick={() => handleSave()}
              disabled={makeSelfieNote.isPending}
              className="bg-[#ED2944] text-white px-8 py-3 rounded-full font-medium hover:bg-[#cb1f38] transition-colors"
            >
              {makeSelfieNote.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        )}

        {makeSelfieNote.isSuccess && (
          <p className="text-sm font-medium text-center text-green-500">
            ✓ Information saved successfully!
          </p>
        )}

        {makeSelfieNote.isPending && (
          <p className="text-sm font-medium text-center text-blue-500">
            Saving information...
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
            <TelegramIcon /> Message
          </a>
        )}
      </div>
    </div>
  );
};

export default SelfieNoteSection;
