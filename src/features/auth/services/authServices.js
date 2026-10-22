import { apiRequest } from "../../../services/apiClient.js";

export async function login(username, password) {
  const result = await apiRequest("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  if (result?.succeeded === false) {
    throw new Error(result.message || "Credenciales incorrectas.");
  }

  return result;
}

export function logout() {
  sessionStorage.removeItem("userData");
}
