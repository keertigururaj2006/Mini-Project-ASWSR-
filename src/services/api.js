const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

let refreshPromise = null;

function saveSession(data) {
  const accessToken = data?.data?.accessToken;
  const user = data?.data?.user;

  if (!accessToken) {
    throw new Error("The server did not return an access token.");
  }

  localStorage.setItem("credifit_access_token", accessToken);

  if (user) {
    localStorage.setItem("credifit_user", JSON.stringify(user));
  }

  return accessToken;
}

function clearSession() {
  localStorage.removeItem("credifit_access_token");
  localStorage.removeItem("credifit_user");
}

async function readResponse(response) {
  return response.json().catch(() => ({}));
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        const result = await readResponse(response);

        if (!response.ok) {
          throw new Error(
            result.message || "Your session has expired. Please sign in again.",
          );
        }

        return saveSession(result);
      } catch (error) {
        clearSession();
        throw error;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

async function sendRequest(endpoint, options, token) {
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(!isFormData && options.body
      ? { "Content-Type": "application/json" }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });
}

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("credifit_access_token");

  let response = await sendRequest(endpoint, options, token);
  let data = await readResponse(response);

  const excludedEndpoints = [
    "/auth/login",
    "/auth/register",
    "/auth/refresh",
    "/auth/logout",
    "/auth/google",
    "/auth/forgot-password",
    "/auth/reset-password",
  ];

  const canRefresh =
    response.status === 401 &&
    !excludedEndpoints.includes(endpoint) &&
    !options._retry;

  if (canRefresh) {
    try {
      const newToken = await refreshAccessToken();

      response = await sendRequest(endpoint, options, newToken);
      data = await readResponse(response);
    } catch {
      throw new Error("Your session has expired. Please sign in again.");
    }
  }

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

export { API_BASE_URL };

// Download a protected file using the same bearer-token and refresh flow as apiRequest.
export async function apiDownload(endpoint) {
  let token = localStorage.getItem("credifit_access_token");
  let response = await sendRequest(endpoint, {}, token);

  if (response.status === 401) {
    try {
      token = await refreshAccessToken();
      response = await sendRequest(endpoint, {}, token);
    } catch {
      throw new Error("Your session has expired. Please sign in again.");
    }
  }

  if (!response.ok) {
    const data = await readResponse(response);
    throw new Error(data.message || "Unable to download this file.");
  }

  return response.blob();
}
