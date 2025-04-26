import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@/styles/globals.css";
import { Toaster } from "react-hot-toast";
import { QueryProvider } from "@/components/Provider/QueryClientProvider";

import { BrowserRouter } from "react-router-dom";
import {
  ensureTelegramSDKDevParams,
  setupTelegramMockEnv,
} from "./lib/setupTelegramMockEnv";
import { initTelegramSDK } from "./lib/init-telegram-sdk";

setupTelegramMockEnv(); // <== run before init()

ensureTelegramSDKDevParams();
// ✅ Step 2: Initialize SDK after mock is ready
if (import.meta.env.VITE_RUNNING_ENV === "production") {
  initTelegramSDK();
} else {
  // Optional: still run mock init (if needed for features)
  initTelegramSDK(); // or skip entirely if your mock handles everything
}
if (typeof window !== "undefined" && window.Telegram?.WebApp) {
  const tg = window.Telegram.WebApp;
  tg.ready?.();
  tg.expand?.();
  tg.setBackgroundColor?.(tg.themeParams?.bg_color ?? "#ffffff");
  tg.setHeaderColor?.("secondary_bg_color");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryProvider>
        <App />
      </QueryProvider>
      <Toaster />
    </BrowserRouter>
  </React.StrictMode>
);
