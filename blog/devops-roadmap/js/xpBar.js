// xpBar.js
export function initXPBar(state) {
  const xpBar = document.createElement("div");
  xpBar.id = "xp-bar";
  xpBar.style.cssText = `
    margin:15px 0;padding:10px;background:#222;
    border:1px solid #555;border-radius:6px;color:#fff;font-size:14px;
  `;
  document.body.insertBefore(xpBar, document.getElementById("mindmap-container"));
  updateXPBar(state);
}

export function updateXPBar(state) {
  const xpBar = document.getElementById("xp-bar");
  const nextLevelXP = state.userLevel * 100;
  const progress = Math.min(100, (state.userXP / nextLevelXP) * 100);
  const badgeIcons = state.badges.map(b =>
    b === "Bronze" ? "🥉" : b === "Silver" ? "🥈" : b === "Gold" ? "🥇" : "🏅"
  ).join(" ");

  xpBar.innerHTML = `
    <div>⭐ Level ${state.userLevel} | XP: ${state.userXP}/${nextLevelXP}</div>
    <div style="background:#444;width:100%;height:10px;border-radius:5px;margin-top:5px;">
      <div style="width:${progress}%;height:10px;border-radius:5px;background:#4CAF50;"></div>
    </div>
    <div style="margin-top:5px;">🏅 Badges: ${badgeIcons || "None yet"}</div>
    <div style="margin-top:5px;">🔥 Streak: ${state.streak} day${state.streak>1?'s':''}</div>
  `;
}
