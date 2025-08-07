import EditProfileIconSvg from "../svgs/edit-profile-icon";
import SendFeedbackIconSvg from "../svgs/send-feedback-icon";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
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

  // Listen for custom event from container
  useEffect(() => {
    const handleOpenFeedbackDrawer = () => {
      setIsFeedbackDrawerOpen(true);
    };

    window.addEventListener('openFeedbackDrawer', handleOpenFeedbackDrawer);
    
    return () => {
      window.removeEventListener('openFeedbackDrawer', handleOpenFeedbackDrawer);
    };
  }, []);

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
    <>
      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h3 className="text-white text-2xl font-bold mb-2">Stay Connected</h3>
            <p className="text-gray-400">Follow us for updates and connect with our community</p>
          </div>
          
          <div className="space-y-6">
            {/* Follow QrMate Button */}
            <a
              href="https://x.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-gradient-to-r from-[#ED2944] to-[#ff6b7a] text-white text-center py-4 px-6 rounded-2xl font-semibold hover:from-[#cb1f38] hover:to-[#e55a68] transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Follow QrMate on X
            </a>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                leftIcon={<SendFeedbackIconSvg />}
                className="w-full py-4 rounded-2xl text-base font-semibold text-white border border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200 transform hover:scale-105 shadow-lg"
                onClick={() => setIsFeedbackDrawerOpen(true)}
              >
                Send Feedback
              </Button>
              
              <Link className="w-full" href="/update-user-profile">
                <Button
                  className="w-full py-4 rounded-2xl text-base font-semibold text-white border border-white/20 bg-gradient-to-r from-[#ED2944] to-[#ff6b7a] hover:from-[#cb1f38] hover:to-[#e55a68] transition-all duration-200 transform hover:scale-105 shadow-lg"
                  leftIcon={<EditProfileIconSvg />}
                >
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="space-y-4">
          <a
            href="https://x.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-6 py-4 text-center rounded-2xl bg-gradient-to-r from-[#ED2944] to-[#ff6b7a] text-white text-base font-semibold shadow-lg hover:from-[#cb1f38] hover:to-[#e55a68] transition-all duration-200 transform hover:scale-105"
          >
            Follow QrMate on X
          </a>
          
          <div className="flex justify-between w-full gap-4">
            <Button
              leftIcon={<SendFeedbackIconSvg />}
              className="flex-1 py-4 rounded-2xl text-sm font-semibold text-white border border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200"
              onClick={() => setIsFeedbackDrawerOpen(true)}
            >
              Send feedback
            </Button>
            
            <Link className="flex-1" href="/update-user-profile">
              <Button
                className="w-full py-4 rounded-2xl text-sm font-semibold text-white border border-white/20 bg-gradient-to-r from-[#ED2944] to-[#ff6b7a] hover:from-[#cb1f38] hover:to-[#e55a68] transition-all duration-200"
                leftIcon={<EditProfileIconSvg />}
              >
                Edit profile
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Feedback Drawer */}
      {isFeedbackDrawerOpen && (
        <Drawer
          open={isFeedbackDrawerOpen}
          onClose={() => setIsFeedbackDrawerOpen(false)}
        >
          <DrawerContent className="p-6 drawerContent bg-[#2a2a2a] border-white/10">
            <DrawerHeader className="text-center">
              <DrawerTitle className="text-white text-xl font-bold mb-2">
                Send Feedback
              </DrawerTitle>
              <p className="text-gray-400 text-sm">
                Help us improve QrMate by sharing your thoughts
              </p>
            </DrawerHeader>
            
            <div className="space-y-6 mt-6">
              <div>
                <label className="block text-white font-medium mb-3">
                  Your Feedback
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us what you think about QrMate..."
                  className="w-full h-32 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#ED2944] focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setIsFeedbackDrawerOpen(false)}
                  className="flex-1 py-3 rounded-2xl text-white border border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200"
                >
                  Cancel
                </Button>
                
                <Button
                  onClick={handleSendFeedback}
                  disabled={!feedback.trim()}
                  className="flex-1 py-3 rounded-2xl text-white bg-gradient-to-r from-[#ED2944] to-[#ff6b7a] hover:from-[#cb1f38] hover:to-[#e55a68] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Feedback
                </Button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
};

export default UserProfileFooter;
