import { Link } from "@telegram-apps/telegram-ui";
import EditProfileIconSvg from "../svgs/edit-profile-icon";
import SendFeedbackIconSvg from "../svgs/send-feedback-icon";
import { Button } from "../ui/button";
import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import useSendFeedback from "@/hooks/useSendFeedback";
import toast from "react-hot-toast";

const UserProfileFooter = () => {
  const [isFeedbackDrawerOpen, setIsFeedbackDrawerOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const sendFeedback = useSendFeedback();

  const handleSendFeedback = async () => {
    if (feedback) {
      if (!feedback) {
        toast.error("Feedback cannot be empty");
        return;
      }
      const formData = new FormData();
      formData.append("description", feedback);
      if (image) {
        formData.append("image", image);
      }
      try {
        await sendFeedback.mutateAsync(formData);

        toast.success("Feedback sent successfully");
        setFeedback("");
        setImage(null);
        setIsFeedbackDrawerOpen(false);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toast.error("Error sending feedback");
      }
    } else {
      toast.error("feedback cannot be empty");
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 mt-auto grow">
      <a
        href="https://x.com/ZEFExyz"
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-3 text-center rounded-[29px] h-[42.9px] bg-white text-[#232323] text-sm font-medium shadow-md hover:bg-[#f5f5f5] transition-all cursor-pointer"
      >
        Follow ZEFE on X
      </a>
      <div className="flex justify-between w-full gap-3 mt-3">
        <Button
          leftIcon={<SendFeedbackIconSvg />}
          className="w-full py-4 rounded-[29px] h-[52px] text-[0.9rem] font-medium text-white border hover:bg-[#5A41FF] border-white bg-transparent"
          onClick={() => setIsFeedbackDrawerOpen(true)}
        >
          Send feedback
        </Button>
        <Link className="w-full" href="/user/update-profile">
          <Button
            className="rounded-[29px] py-4 text-sm w-full h-[52pz] text-white border hover:bg-[#5A41FF] border-white bg-[#ED2944]"
            leftIcon={<EditProfileIconSvg />}
          >
            Edit profile
          </Button>
        </Link>
      </div>
      {isFeedbackDrawerOpen && (
        <Drawer
          open={isFeedbackDrawerOpen}
          onClose={() => setIsFeedbackDrawerOpen(false)}
        >
          <DrawerContent className="p-4 drawerContent">
            <DrawerHeader>
              <DrawerTitle className="mt-10 text-black hover:bg-[#5A41FF]">
                Send feedback
              </DrawerTitle>
            </DrawerHeader>
            <label className=" mt-6 text-[0.9rem] font-semibold text-black">
              Write feedback for zefe
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="feedback..."
              className="w-full h-40 p-2 my-4 text-gray-600 border border-black rounded"
            />
            <div className="flex items-center justify-between">
              <input
                type="file"
                accept="image/*"
                id="feedback-image"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setImage(e.target.files[0]);
                  }
                }}
              />
              <label
                htmlFor="feedback-image"
                className="flex items-center justify-center px-4 py-2 text-[16px] font-medium text-black border border-black rounded-full cursor-pointer"
              >
                <span className="mt-1 mr-2">📎</span> Attach an image
              </label>
            </div>
            {image && (
              <div className="mt-2 text-sm text-black">
                📎 Attached: {image.name}
              </div>
            )}
            <Button
              className="w-full p-6 mt-8 border border-black text-white rounded-[29px] bg-[#ED2944] hover:bg-[#5A41FF]"
              onClick={handleSendFeedback}
            >
              Send Feedback
            </Button>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
};
export default UserProfileFooter;
