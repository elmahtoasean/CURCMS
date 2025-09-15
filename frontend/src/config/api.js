const DEFAULT_BACKEND_ORIGIN = "http://localhost:8000";

const envBackendOrigin = [
  import.meta.env.VITE_API_BASE_URL,
  import.meta.env.VITE_API_BASE,
  import.meta.env.VITE_BACKEND_URL,
  import.meta.env.VITE_API_ORIGIN,
]
  .find((value) => typeof value === "string" && value.trim().length > 0);

const sanitizeOrigin = (origin) => {
  if (!origin) return origin;
  return origin.replace(/\/$/, "");
};

export const BACKEND_ORIGIN = sanitizeOrigin(envBackendOrigin) || DEFAULT_BACKEND_ORIGIN;
export const API_BASE_URL = `${BACKEND_ORIGIN}/api`;
export const PUBLIC_API_BASE_URL = `${API_BASE_URL}/public`;

const isAbsoluteUrl = (value = "") => /^https?:\/\//i.test(value);

const replaceLocalhostOrigin = (url) => {
  if (url?.startsWith(DEFAULT_BACKEND_ORIGIN)) {
    return `${BACKEND_ORIGIN}${url.slice(DEFAULT_BACKEND_ORIGIN.length)}`;
  }
  return url;
};

export const resolveBackendUrl = (path = "") => {
  if (!path) {
    return BACKEND_ORIGIN;
  }

  if (isAbsoluteUrl(path)) {
    return replaceLocalhostOrigin(path);
  }

  if (path.startsWith("/")) {
    return `${BACKEND_ORIGIN}${path}`;
  }

  return `${BACKEND_ORIGIN}/${path}`;
};

export const resolveApiUrl = (path = "") => {
  if (!path) {
    return API_BASE_URL;
  }

  if (isAbsoluteUrl(path)) {
    return replaceLocalhostOrigin(path);
  }

  if (path.startsWith("/")) {
    return `${API_BASE_URL}${path}`;
  }

  return `${API_BASE_URL}/${path}`;
};

if (typeof window !== "undefined") {
  window.__CURCMS_BACKEND_ORIGIN__ = BACKEND_ORIGIN;
  window.__CURCMS_API_BASE_URL__ = API_BASE_URL;
}
