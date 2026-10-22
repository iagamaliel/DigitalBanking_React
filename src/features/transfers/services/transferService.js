import { apiRequest } from "../../../services/apiClient.js";

export function transferFunds(data) {
  return apiRequest("/transfers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}