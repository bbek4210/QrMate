import { Routes, Route } from "react-router-dom";
import ConnectedUser from "@/pages/ConnectedUser";
import NetworksAndConnections from "@/pages/NetworksAndConnections";
import UpdateProfile from "@/pages/UpdateUserProfile";
import UserProfile from "@/pages/UserProfile";
import HomePage from "@/pages/HomePage"

const App = () => (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/connected-user/:id" element={<ConnectedUser />} />
      <Route path="/networks-and-connections" element={<NetworksAndConnections />} />
      <Route path="/update-profile" element={<UpdateProfile />} />
      <Route path="/user" element={<UserProfile />} />
    </Routes>
);

export default App;
