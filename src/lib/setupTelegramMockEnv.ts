// @ts-nocheck
export function setupTelegramMockEnv() {
    if (typeof window === "undefined") return;
  
    const isLocal =
      import.meta.env.MODE === "development" ||
      import.meta.env.VITE_RUNNING_ENV === "development";
  
    if (!isLocal) return;
  
    // Must be set before SDK runs
    localStorage.setItem("tgWebAppPlatform", "web");
  
    const mockUser = {
      id: 366361,
      first_name: "Mock",
      last_name: "User",
      username: "tanka1026",
      photo_url: "https://via.placeholder.com/50",
      is_bot: false,
      is_premium: false,
      language_code: "en",
      allows_write_to_pm: true,
      added_to_attachment_menu: false,
    };
  
    const now = Math.floor(Date.now() / 1000);
  
    const mockParams = {
      user: JSON.stringify(mockUser),
      auth_date: now.toString(),
      hash: "mock_hash_123456",
      query_id: "mock_query_789",
      chat_type: "private",
      chat_instance: "mock_chat_instance",
      can_send_after: "",
      start_param: "mock_param",
      tgWebAppPlatform: "web",
    };
  
    const initData = new URLSearchParams(mockParams).toString();
  
    window.Telegram = {
      WebApp: {
        platform: "web",
        version: "7.0",
        initData,
        initDataUnsafe: {
          user: mockUser,
          auth_date: now,
          hash: mockParams.hash,
          query_id: mockParams.query_id,
          chat_type: mockParams.chat_type,
          chat_instance: mockParams.chat_instance,
          can_send_after: null,
          start_param: mockParams.start_param,
        },
        colorScheme: "light",
        themeParams: {
          bg_color: "#ffffff",
          text_color: "#000000",
          hint_color: "#999999",
          link_color: "#1a73e8",
          button_color: "#0088cc",
          button_text_color: "#ffffff",
          secondary_bg_color: "#f5f5f5",
        },
        isExpanded: true,
        isClosingConfirmationEnabled: false,
        headerColor: "#ffffff",
        backgroundColor: "#ffffff",
        viewportHeight: 1000,
        viewportStableHeight: 1000,
        onEvent: () => {},
        offEvent: () => {},
        sendData: () => {},
        ready: () => console.log("Mock ready() called"),
        expand: () => console.log("Mock expand() called"),
        close: () => console.log("Mock close() called"),
        setBackgroundColor: (color: string) =>
          console.log(`Mock setBackgroundColor(${color})`),
        setHeaderColor: (color: string) =>
          console.log(`Mock setHeaderColor(${color})`),
        enableClosingConfirmation: () =>
          console.log("Mock enableClosingConfirmation() called"),
        disableClosingConfirmation: () =>
          console.log("Mock disableClosingConfirmation() called"),
      },
    };
  
    console.log("✅ Mock Telegram environment injected for development.");
  }

  
// @ts-nocheck
export function ensureTelegramSDKDevParams() {
    if (
      typeof window === "undefined" ||
      import.meta.env.MODE !== "development"
    ) {
      return;
    }
  
    const url = new URL(window.location.href);
    const params = url.searchParams;
  
    let needsReload = false;
  
    if (!params.has("tgWebAppPlatform")) {
      params.set("tgWebAppPlatform", "web");
      needsReload = true;
    }
  
    if (!params.has("tgWebAppThemeParams")) {
      params.set(
        "tgWebAppThemeParams",
        JSON.stringify({
          bg_color: "#ffffff",
          text_color: "#000000",
          hint_color: "#999999",
          link_color: "#1a73e8",
          button_color: "#0088cc",
          button_text_color: "#ffffff",
          secondary_bg_color: "#f5f5f5",
        })
      );
      needsReload = true;
    }
  
    if (!params.has("tgWebAppVersion")) {
      params.set("tgWebAppVersion", "7.0");
      needsReload = true;
    }
  
    if (needsReload) {
      window.location.replace(url.toString());
    }
  }
  