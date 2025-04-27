import { Routes, Route } from "react-router-dom";
import ConnectedUser from "@/pages/ConnectedUser";
import NetworksAndConnections from "@/pages/NetworksAndConnections";
import UpdateProfile from "@/pages/UpdateUserProfile";
import UserProfile from "@/pages/UserProfile";
import HomePage from "@/pages/HomePage";
import { useEffect } from "react";

const App = () => {
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  return (
    <div className="pt-24 ">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/connected-user/:id" element={<ConnectedUser />} />
        <Route
          path="/networks-and-connections"
          element={<NetworksAndConnections />}
        />
        <Route path="/update-user-profile" element={<UpdateProfile />} />
        <Route path="/user" element={<UserProfile />} />
      </Routes>
    </div>
  );
};

export default App;
