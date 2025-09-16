import { axiosInstance } from "./axios";

export function resolveSocketURL() {
  const base = axiosInstance.defaults.baseURL;
  if (base) {
    try {
      const u = new URL(base, window.location.origin);
      return `${u.protocol}//${u.host}`;
    } catch (e) {
      console.log(e);
    }
  }
  return "http://localhost:5001";
}
