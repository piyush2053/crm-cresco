const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
let lastOfflineAlert=0;
function backendOffline(){const now=Date.now();if(now-lastOfflineAlert>5000){lastOfflineAlert=now;window.dispatchEvent(new CustomEvent("crm:api-offline",{detail:{message:"CRM backend server is unavailable. Please start the API server on port 4000."}}))}}
async function request(url,options){try{return await fetch(url,options)}catch(error){if(error?.name==="AbortError")throw error;backendOffline();throw new ApiError("Backend server unavailable. Please try again after the API starts.",0)}}

export class ApiError extends Error {
  constructor(message, status, details = {}) {
    super(message);
    this.status = status;
    Object.assign(this, details);
  }
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;
  const response = await fetch(`${API_URL}/auth/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!response.ok) return null;
  const data = await response.json();
  localStorage.setItem("token", data.token);
  return data.token;
}

export async function api(path, options = {}, retry = true) {
  const headers = new Headers(options.headers);
  const token = localStorage.getItem("token");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json");

  const response = await request(`${API_URL}${path}`, { ...options, headers });
  if (response.status === 401 && retry && (await refreshAccessToken())) return api(path, options, false);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(data.message || "Something went wrong. Please try again.", response.status, data);
  }
  if (response.status === 204) return null;
  return response.json();
}

export async function download(path, filename, options = {}) {
  const token = localStorage.getItem("token");
  const headers=new Headers(options.headers);headers.set("Authorization",`Bearer ${token}`);if(options.body)headers.set("Content-Type","application/json");
  const response = await request(`${API_URL}${path}`, { ...options, headers });
  if (!response.ok) throw new ApiError("Unable to generate the report.", response.status);
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url);
}
