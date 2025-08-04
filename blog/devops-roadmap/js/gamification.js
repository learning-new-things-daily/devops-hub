// gamification.js
import { saveUserProgress } from './dataLoader.js';

export function initStreak(state) {
  const today = new Date().toLocaleDateString();
  if (state.lastLogin !== today) {
    const yesterday = new Date();
    yesterday.setDate(new Date().getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString();
    state.streak = (state.lastLogin === yesterdayStr) ? state.streak + 1 : 1;
    state.lastLogin = today;
    localStorage.setItem("streak", state.streak);
    localStorage.setItem("lastLogin", today);
  }
}

export function fireConfetti() {
  confetti({
    particleCount: 150,
    spread: 80,
    origin: { y: 0.6 }
  });
}

export function gainXP(state, amount, updateXPBar) {
  const prevXP = state.userXP;
  state.userXP += amount;
  const newLevel = Math.floor(state.userXP / 100) + 1;
  if (newLevel > state.userLevel) {
    state.userLevel = newLevel;
    alert(`🎉 Level Up! You are now Level ${state.userLevel}!`);
    fireConfetti();
  }
  saveUserProgress(state);
  updateXPBar(state.userXP);
}

export function checkBadges(state, nodeStatus, updateXPBar) {
  const completedCount = Object.values(nodeStatus).filter(s => s.state === "completed").length;
  const earned = [];
  if (completedCount >= 5 && !state.badges.includes("Bronze")) earned.push("Bronze");
  if (completedCount >= 15 && !state.badges.includes("Silver")) earned.push("Silver");
  if (completedCount >= 30 && !state.badges.includes("Gold")) earned.push("Gold");

  if (earned.length > 0) {
    state.badges = [...state.badges, ...earned];
    saveUserProgress(state);
    alert(`🏅 New Badge(s) Earned: ${earned.join(", ")}`);
    fireConfetti();
  }
  updateXPBar(state.userXP);
}
