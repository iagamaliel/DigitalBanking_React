const API_URL = import.meta.env.VITE_API_URL;

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...options.headers,
    },
  });

  const responseText = await response.text();

  let result = null;

  if (responseText.trim()) {
    try {
      result = JSON.parse(responseText);
    } catch {
      throw new Error("El servidor devolvió una respuesta JSON inválida.");
    }
  }

  if (!response.ok) {
    throw new Error(
      result?.message || `Error HTTP: ${response.status}`
    );
  }

  return result;
}