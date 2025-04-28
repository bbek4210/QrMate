import { getCookie } from "@/lib/cookies";
import { ACCESS_TOKEN_KEY } from "./constants";
import axios from "axios";

const DISCORD_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1365007210907828338/02w2lA9oEm8hPZGjpClx4ZJtF55fF7Xu3NvMFvxuDlA5LxVtx7pBKJh8IgHx3ZrP8xna";

export async function logToDiscord(message: string) {
  try {
    await axios.post(DISCORD_WEBHOOK_URL, {
      content: message,
    });
  } catch (error) {
    console.error("Failed to send log to Discord:", error);
  }
}

const BASE_URL = `${import.meta.env.VITE_SERVER_URL}/api/v1`;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
// Request Interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = getCookie(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const logMessage = [
      `🔄 **API REQUEST**`,
      `**Method**: ${config.method?.toUpperCase()}`,
      `**URL**: ${config.baseURL}${config.url}`,
      `**Headers**:\n\`\`\`json\n${JSON.stringify(config.headers.Authorization, null, 2)}\n\`\`\``,
      config.data
        ? `**Body**:\n\`\`\`json\n${JSON.stringify(config.data, null, 2)}\n\`\`\``
        : `**Body**: _empty_`,
    ].join("\n");

    logToDiscord(logMessage);

    return config;
  },
  (error) => {
    logToDiscord(`⚠️ Request Setup Error:\n\`\`\`\n${error.message}\n\`\`\``);
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response; // optional: log successful responses here
  },
  (error) => {
    const { config, response } = error;
    console.log({ response })

    const logMessage = [
      `❌ **API ERROR**`,
      `**Method**: ${config?.method?.toUpperCase()}`,
      `**URL**: ${config?.baseURL}${config?.url}`,
      `**Status**: ${response?.status || "N/A"}`,
      `**Status Text**: ${response?.statusText || "N/A"}`,
      `**Response Data**:\n\`\`\`json\n${JSON.stringify(response?.data || error.message, null, 2)}\n\`\`\``,
    ].join("\n");

    logToDiscord(logMessage);

    return Promise.reject(error);
  }
);

export default axiosInstance;
