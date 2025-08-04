// mindmap.js
import { saveNodeStatus } from './dataLoader.js';

export function parseDays(timeStr) {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

export function buildMindmap(roadmap, nodeStatus, onStatusChange) {
  const container = document.getElementById("mindmap-container");
  const nodeColors = ["#1abc9c","#3498db","#9b59b6","#e67e22","#e74c3c","#f1c40f","#2ecc71","#ff69b4"];
  let colorIndex = 0;

  function buildTree(obj, parentColor = null) {
    const div = document.createElement("div");
    for (const [key, val] of Object.entries(obj)) {
      const node = document.createElement("div");
      node.className = "node";
      node.dataset.key = key;
      node.textContent = key;
      node.title = `Estimated time: ${val.time || "0 days"}`;

      let nodeColor = val.color || parentColor || nodeColors[colorIndex++ % nodeColors.length];
      node.style.background = nodeColor;

      const childrenDiv = document.createElement("div");
      childrenDiv.className = "children";

      const detailsDiv = document.createElement("div");
      detailsDiv.className = "node-details";

      // Status checkboxes
      const learningChk = document.createElement("input");
      learningChk.type = "checkbox";
      const learningLbl = document.createElement("label");
      learningLbl.textContent = " Learning";
      learningLbl.style.marginRight = "15px";

      const completedChk = document.createElement("input");
      completedChk.type = "checkbox";
      const completedLbl = document.createElement("label");
      completedLbl.textContent = " Completed";

      // Notes
      const notes = document.createElement("textarea");
      notes.placeholder = "Add your notes or links here...";
      notes.className = "node-notes";

      // Restore state
      const status = nodeStatus[key]?.state || "not-started";
      if(status==="completed") { completedChk.checked = true; node.classList.add("completed"); }
      if(status==="learning") { learningChk.checked = true; node.classList.add("learning"); }
      if(nodeStatus[key]?.notes) notes.value = nodeStatus[key].notes;

      learningChk.addEventListener("change", () => {
        if (learningChk.checked) {
          completedChk.checked = false;
          onStatusChange(key,"learning",notes.value);
        } else if (!completedChk.checked) {
          onStatusChange(key,"not-started",notes.value);
        }
      });
      completedChk.addEventListener("change", () => {
        if (completedChk.checked) {
          learningChk.checked = false;
          onStatusChange(key,"completed",notes.value);
          node.classList.add("pulse");
          setTimeout(()=>node.classList.remove("pulse"),1000);
        } else if (!learningChk.checked) {
          onStatusChange(key,"not-started",notes.value);
        }
      });
      notes.addEventListener("input", () => {
        onStatusChange(key,nodeStatus[key]?.state || "not-started",notes.value);
      });

      detailsDiv.append(learningChk, learningLbl, completedChk, completedLbl, notes);

      // Links
      if (val.links?.length) {
        const linksDiv = document.createElement("div");
        linksDiv.className = "links-section";
        linksDiv.innerHTML = "<b style='color:#4CAF50'>Learning Links:</b>";
        val.links.forEach(link => {
          const a = document.createElement("a");
          a.href = link.url;
          a.target = "_blank";
          a.className = "link-item";
          a.textContent = "🔗 " + link.title;
          linksDiv.appendChild(a);
        });
        detailsDiv.appendChild(linksDiv);
      }

      node.onclick = () => {
        childrenDiv.classList.toggle("visible");
        detailsDiv.style.display = detailsDiv.style.display==="none" ? "block" : "none";
      };

      if(val.children) childrenDiv.appendChild(buildTree(val.children, nodeColor));

      div.append(node, detailsDiv, childrenDiv);
    }
    return div;
  }

  container.appendChild(buildTree(roadmap));
}

export function setNodeStatus(nodeStatus, key, status, notes="") {
  nodeStatus[key] = { 
    ...nodeStatus[key],
    state: status, 
    notes: notes || nodeStatus[key]?.notes || "" 
  };
  if(status==="completed") nodeStatus[key].completedAt = new Date().toLocaleDateString();
  saveNodeStatus(nodeStatus);

  const node = document.querySelector(`[data-key="${key}"]`);
  node.classList.remove("completed","learning");
  if(status==="completed") node.classList.add("completed");
  if(status==="learning") node.classList.add("learning");
}
