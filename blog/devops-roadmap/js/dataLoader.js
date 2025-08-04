// dataLoader.js
export async function loadRoadmap() {
  try {
    const res = await fetch("roadmap.json");
    return await res.json();
  } catch (err) {
    console.error("Failed to load roadmap.json:", err);
    alert("❌ Failed to load roadmap.json. Check file path!");
    return {};
  }
}

export function loadLocalState() {
  return {
    nodeStatus: JSON.parse(localStorage.getItem("nodeStatus") || "{}"),
    userXP: parseInt(localStorage.getItem("userXP") || "0"),
    userLevel: parseInt(localStorage.getItem("userLevel") || "1"),
    badges: JSON.parse(localStorage.getItem("badges") || "[]"),
    streak: parseInt(localStorage.getItem("streak") || "0"),
    lastLogin: localStorage.getItem("lastLogin") || ""
  };
}

export function saveNodeStatus(nodeStatus) {
  localStorage.setItem("nodeStatus", JSON.stringify(nodeStatus));
}
export function saveUserProgress({ userXP, userLevel, badges }) {
  localStorage.setItem("userXP", userXP);
  localStorage.setItem("userLevel", userLevel);
  localStorage.setItem("badges", JSON.stringify(badges));
}
