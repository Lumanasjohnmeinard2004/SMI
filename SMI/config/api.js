// config/api.js

import { Platform } from "react-native";

const LOCAL_IP = "192.168.10.189";

export const API_BASE_URL =
  Platform.OS === "web"
    ? "http://localhost:5000/api"
    : `http://${LOCAL_IP}:5000/api`;

export async function apiRequest(endpoint, method = "GET", body = null, token = null) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : null,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}