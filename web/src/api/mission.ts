export type MissionRow = {
  id: number;
  title: string;
  goalCount: number;
  type: "daily" | "weekly" | "monthly";
  mode: "squat" | "pushup" | "situp";
  expiredAt: string;
  partyId: number;
  currentCount: number;
};

export async function fetchMissions(): Promise<MissionRow[]> {
  const res = await fetch("/api/missions", { credentials: "include" });

  if (res.status === 401) return []; 

  if (!res.ok) throw new Error(`fetchMissions failed: ${res.status}`);
  return res.json();
}
