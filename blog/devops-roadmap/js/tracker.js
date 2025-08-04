// tracker.js
import { parseDays } from './mindmap.js';

export function calculateTime(node,keyPrefix="") {
  let results=[];
  const nodeKey=keyPrefix||Object.keys(node)[0];
  const statusObj={state:"not-started"};
  const time=parseDays(node.time);
  results.push({ key: nodeKey, state: statusObj.state, days: time });
  if(node.children){
    for(const [childKey,childNode] of Object.entries(node.children)){
      results=results.concat(calculateTime(childNode,childKey));
    }
  }
  return results;
}

export function updateCompletionTracker(nodeStatus, roadmap) {
  const pace=parseFloat(document.getElementById("pace-select").value)||1;
  const allTimes=calculateTime(roadmap["DevOps"]);
  const totalDays=allTimes.reduce((s,n)=>s+n.days,0);
  const completedDays=allTimes.filter(n=>nodeStatus[n.key]?.state==="completed").reduce((s,n)=>s+n.days,0);
  const remainingDays=totalDays-completedDays;
  const today=new Date();
  const completionDate=new Date(today);
  completionDate.setDate(today.getDate()+Math.ceil(remainingDays/pace));
  const completionDateStr=completionDate.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
  document.getElementById("completion-tracker").textContent=
    `Estimated Completion: ${completionDateStr} (Remaining ${remainingDays} days)`;
}
