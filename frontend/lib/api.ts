export const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export const wsBaseUrl = apiBaseUrl.replace(/^http/, "ws");
