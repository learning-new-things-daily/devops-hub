// main.js
import { loadRoadmap, loadLocalState } from './dataLoader.js';
import { initStreak, gainXP, checkBadges } from './gamification.js';
import { buildMindmap, setNodeStatus } from './mindmap.js';
import { initDonutChart, updateDonutChart } from './charts.js';
import { updateCompletionTracker } from './tracker.js';

document.addEventListener("DOMContentLoaded", async () => {
  const roadmap = await loadRoadmap();
  const state = loadLocalState();
  initStreak(state);

  buildMindmap(roadmap, state.nodeStatus, (key,status,notes)=>{
    setNodeStatus(state.nodeStatus,key,status,notes);
    updateCompletionTracker(state.nodeStatus, roadmap);
    updateDonutChart(state.nodeStatus);
    if(status==="completed") {
      gainXP(state, 10, ()=>{}); // can scale with parseDays
      checkBadges(state,state.nodeStatus,()=>{});
    }
  });

  initDonutChart();
  updateDonutChart(state.nodeStatus);
  updateCompletionTracker(state.nodeStatus, roadmap);
  document.getElementById("pace-select").addEventListener("change",()=>{
    updateCompletionTracker(state.nodeStatus, roadmap);
  });
});
