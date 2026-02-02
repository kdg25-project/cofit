export async function fetchMissions(){
    const res = await fetch(`/api/missions`, {
        credentials: "include",
    });

    if (!res.ok) throw new Error(`fetchMissions failed: ${res.status}`);
    return res.json();
}