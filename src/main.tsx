import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { init } from "@telegram-apps/sdk-react";
import "@/styles/globals.css";
import { Toaster } from "react-hot-toast";
import { QueryProvider } from "@/components/Provider/QueryClientProvider";
import { meta } from "@eslint/js";
import { BrowserRouter } from "react-router-dom";


console.log("Meta env", import.meta.env.NODE_ENV)
if (import.meta.env.NODE_ENV == "production") {
  init();
}

if (typeof window !== "undefined" && window.Telegram?.WebApp) {
  const tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();
  tg.setBackgroundColor(tg.themeParams.bg_color ?? "#ffffff");
  tg.setHeaderColor("secondary_bg_color");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
    <BrowserRouter>
      <QueryProvider>
        <App />
      </QueryProvider>
      <Toaster />
    </BrowserRouter>
  // </React.StrictMode>
);
