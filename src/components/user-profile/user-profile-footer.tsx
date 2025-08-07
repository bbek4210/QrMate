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
import toast from "react-hot-toast";
import Link from "next/link";
import useGetUserProfile from "@/hooks/use-get-user-profile";

const UserProfileFooter = () => {
  const [isFeedbackDrawerOpen, setIsFeedbackDrawerOpen] = useState(false);
  const [feedback, setFeedback] = useState("");

  const { data: userProfile } = useGetUserProfile();

  console.log("userProfile", userProfile);

  const handleSendFeedback = async () => {
    if (feedback) {
      if (!feedback) {
        toast.error("Feedback cannot be empty");
        return;
      }

      const webhookUrl =
        "https://discord.com/api/webhooks/1366147355493138553/m3-WiudDB_gZ55lBk2Ru7UsEPXxmL4a0oVmQQHqbBcjBi4XzLcZl1h7zjOtuEZiHHy8b";

      const userName = userProfile?.data?.name;
      const username = userProfile?.data?.username;
      const userId = userProfile?.data?.id;

      const payload = {
        content:
          `📝 **New Feedback Received**\n\n` +
          `**Name:** ${userName}\n` +
          `**Username:** ${username}\n` +
          `**User ID:** ${userId}\n` +
          `**Feedback:** ${feedback}`,
      };

      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        toast.success("Feedback sent successfully");
        setFeedback("");

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
        href="https://x.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-3 text-center rounded-[29px] h-[42.9px] bg-white text-[#232323] text-sm font-medium shadow-md hover:bg-[#f5f5f5] transition-all cursor-pointer"
      >
        Follow QrMate on X
      </a>
      <div className="flex justify-between w-full gap-3 mt-3">
        <Button
          leftIcon={<SendFeedbackIconSvg />}
          className="w-full py-4 rounded-[29px] h-[52px] text-[0.9rem] font-medium text-white border hover:bg-[#5A41FF] border-white bg-transparent"
          onClick={() => setIsFeedbackDrawerOpen(true)}
        >
          Send feedback
        </Button>
        <Link className="w-full" href="/update-user-profile">
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
            {/* <div className="flex items-center justify-between">
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
            )} */}
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
