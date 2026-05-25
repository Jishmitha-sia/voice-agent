import { apiBaseUrl } from "./api";

export type LiveKitTokenResponse = {
  token: string;
  url: string;
  room_name: string;
  participant_name: string;
};

export async function createLiveKitToken(): Promise<LiveKitTokenResponse> {
  const response = await fetch(`${apiBaseUrl}/api/livekit/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new Error(`Token request failed with ${response.status}`);
  }

  return response.json() as Promise<LiveKitTokenResponse>;
}
