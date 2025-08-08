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
      
      // Clean up object URL
      URL.revokeObjectURL(objectURL);
      
      resolve(dataURL);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectURL);
      reject(new Error('Failed to load image'));
    };
    
    // Create object URL for the file
    const objectURL = URL.createObjectURL(file);
    img.src = objectURL;
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
    console.log("Network ID:", networkId);
    console.log("Is loading:", isLoading);
    
    if (selfieNote) {
      const newNote = selfieNote.summary_note || "";
      const existingImgs = selfieNote.meeting_images?.map((img: any) => img.image) || [];
      
      console.log("Setting note:", newNote);
      console.log("Setting images:", existingImgs);
      console.log("Meeting images raw:", selfieNote.meeting_images);
      
      setNote(newNote);
      setOriginalNote(newNote);
      setPhotos(existingImgs);
      setOriginalPhotos(existingImgs);
      setHasChanges(false);
      
      // Check if there's existing data
      const hasData = newNote.trim() !== "" || existingImgs.length > 0;
      setHasExistingData(hasData);
      setIsReadOnly(hasData); // Make read-only if there's existing data
      
      console.log("Has existing data:", hasData);
      console.log("Is read-only:", hasData);
    } else if (!isLoading) {
      console.log("No selfie note data found, allowing new input");
      setHasExistingData(false);
      setIsReadOnly(false);
    }
  }, [selfieNote, isLoading, networkId]);

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

  const handleSave = async () => {
    const currentImages =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      selfieNote?.meeting_images?.map((img: any) => ({
        note: "",
        image: img.image,
      })) || [];

    try {
      let newImages: { note: string; image: string }[] = [];

      // Upload new files if any
      if (files.length > 0 && !uploadFileMutation.isPending) {
        const uploads = files.map((file) => {
          const extension = file.name.split(".").pop() || "jpg";
          const key = `${SELFIE_KEY_PREFIX}/selfie-${Date.now()}-${Math.random()}.${extension}`;
          return uploadFileMutation.mutateAsync({ file, key });
        });

        const results = await Promise.all(uploads);
        newImages = results.map((res) => {
          return {
            note: "",
            image: res?.data?.file_url || res?.file_url,
          };
        });

        console.log("New images uploaded:", newImages);
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
          setOriginalPhotos([...originalPhotos, ...newImages.map(img => img.image)]); // Update original photos
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
      // Create preview images immediately (no API call)
      const correctedImages = await Promise.all(
        validFiles.map((file) => {
          return correctImageOrientation(file);
        })
      );

      // Store files and show previews
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
            <p className="text-blue-800 text-sm font-medium text-center">
              📝 Meeting information has been saved and is now permanent. You can view but cannot edit this data.
            </p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Photo Section */}
          <div className="lg:w-2/5">
            {photos.length === 0 && canUploadSelfie && !isReadOnly ? (
              <div className="flex flex-col items-center justify-center gap-4 p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#ED2944] transition-all">
                <div className="w-16 h-16 bg-[#ED2944] rounded-full flex items-center justify-center">
                  <SmallcameraSvg />
                </div>
                <label className="flex items-center justify-center gap-3 px-6 py-4 text-sm bg-gradient-to-r from-[#ED2944] to-[#cb1f38] text-white border border-white rounded-xl cursor-pointer hover:from-[#cb1f38] hover:to-[#a01830] transition-all shadow-lg">
                  Take a selfie
                  <input
                    type="file"
                    accept="image/*"
                    capture="user"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group bg-white rounded-2xl p-3 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="aspect-[4/3] relative overflow-hidden rounded-xl">
                                                 <img 
                           src={photo} 
                           alt={`selfie-${index}`}
                           className="w-full h-full object-contain bg-gray-50 hover:scale-105 transition-transform duration-300" 
                           onError={(e) => {
                             console.error('Failed to load image:', photo);
                             e.currentTarget.style.display = 'none';
                           }}
                           onLoad={() => {
                             console.log('Image loaded successfully:', photo);
                           }}
                         />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-xl flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-white bg-opacity-90 rounded-full p-2">
                              <svg className="w-6 h-6 text-[#ED2944]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                      {!isReadOnly && (
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-red-600 transition-colors shadow-lg hover:scale-110"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {canUploadSelfie && !isReadOnly && (
                  <label className="flex items-center justify-center gap-3 px-6 py-4 text-sm bg-gradient-to-r from-[#ED2944] to-[#cb1f38] text-white border border-white rounded-xl cursor-pointer hover:from-[#cb1f38] hover:to-[#a01830] transition-all shadow-lg hover:shadow-xl">
                    <SmallcameraSvg /> Add More Photos
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
          </div>

          {/* Note Section */}
          <div className="lg:w-3/5">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Meeting Notes</h3>
              <textarea
                id="summary_note_textarea"
                placeholder={isReadOnly ? "No note available" : "Write a detailed note about your meeting, what you discussed, follow-up actions, or any important points..."}
                className={`w-full min-h-[250px] p-4 text-sm rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#ED2944] transition-all ${
                  isReadOnly 
                    ? 'bg-gray-100 text-gray-600 cursor-not-allowed' 
                    : 'text-gray-800 border-2 border-gray-200 hover:border-[#ED2944] bg-gray-50'
                }`}
                value={note}
                onChange={(e) => !isReadOnly && setNote(e.target.value)}
                readOnly={isReadOnly}
              />
            </div>
          </div>
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
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p className="text-green-800 text-sm font-medium text-center">
              ✓ Meeting information saved successfully! This data is now permanent and cannot be edited.
            </p>
          </div>
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
