import { apiRequest } from "./api";

export async function logout() {
  try {
    await apiRequest("/auth/logout", {
      method: "POST",
    });
  } catch (error) {
    console.error("Logout request failed:", error);
  } finally {
    localStorage.removeItem("credifit_access_token");
    localStorage.removeItem("credifit_user");

    window.location.replace("/login");
  }
}
