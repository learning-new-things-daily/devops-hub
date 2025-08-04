document.addEventListener("DOMContentLoaded", () => {

// ======== ROADMAP DATA =========

let roadmap = {};
let nodeStatus = JSON.parse(localStorage.getItem("nodeStatus") || "{}");
const container = document.getElementById("mindmap-container");
fetch("roadmap.json")
  .then(response => response.json())
  .then(data => {
    roadmap = data;
    container.appendChild(buildTree(roadmap));
    initDonutChart();
    updateDonutChart();
    updateCompletionTracker();
    document.getElementById("pace-select").addEventListener("change", updateCompletionTracker);
  })
  .catch(err => {
    console.error("Failed to load roadmap.json:", err);
  });

function buildTree(obj) {
  const div = document.createElement("div");
  for (const [key, val] of Object.entries(obj)) {
    const node = document.createElement("div");
    node.className = "node";
    node.dataset.key = key;
    node.textContent = key;

    const childrenDiv = document.createElement("div");
    childrenDiv.className = "children";

    const detailsDiv = document.createElement("div");
    detailsDiv.style.display = "none";
    detailsDiv.style.margin = "5px 0 10px 15px";
    detailsDiv.style.padding = "10px";
    detailsDiv.style.border = "1px solid #444";
    detailsDiv.style.borderRadius = "6px";
    detailsDiv.style.background = "#1c1c1c";

    const learningChk = document.createElement("input");
    learningChk.type = "checkbox";
    const learningLbl = document.createElement("label");
    learningLbl.textContent = " Learning";
    learningLbl.style.marginRight = "15px";

    const completedChk = document.createElement("input");
    completedChk.type = "checkbox";
    const completedLbl = document.createElement("label");
    completedLbl.textContent = " Completed";

    const notes = document.createElement("textarea");
    notes.placeholder = "Add your notes or links here...";
    notes.style.display = "block";
    notes.style.width = "95%";
    notes.style.marginTop = "8px";
    notes.style.background = "#111";
    notes.style.color = "#fff";
    notes.style.border = "1px solid #333";
    notes.style.borderRadius = "4px";

    const status = nodeStatus[key]?.state || "not-started";
    if(status==="completed") { completedChk.checked = true; node.classList.add("completed"); }
    if(status==="learning") { learningChk.checked = true; node.classList.add("learning"); }
    if(nodeStatus[key]?.notes) notes.value = nodeStatus[key].notes;

    learningChk.addEventListener("change", () => {
      if (learningChk.checked) {
        completedChk.checked = false;
        setStatus(key,"learning",notes.value);
      } else if (!completedChk.checked) {
        setStatus(key,"not-started",notes.value);
      }
    });
    completedChk.addEventListener("change", () => {
      if (completedChk.checked) {
        learningChk.checked = false;
        setStatus(key,"completed",notes.value);
      } else if (!learningChk.checked) {
        setStatus(key,"not-started",notes.value);
      }
    });
    notes.addEventListener("input", () => {
      setStatus(key,nodeStatus[key]?.state || "not-started",notes.value);
    });

    detailsDiv.appendChild(learningChk);
    detailsDiv.appendChild(learningLbl);
    detailsDiv.appendChild(completedChk);
    detailsDiv.appendChild(completedLbl);
    detailsDiv.appendChild(notes);

    if (val.links && val.links.length > 0) {
      const linksDiv = document.createElement("div");
      linksDiv.style.marginTop = "8px";
      linksDiv.innerHTML = "<b style='color:#4CAF50'>Learning Links:</b>";
      val.links.forEach(link => {
        const a = document.createElement("a");
        a.href = link.url;
        a.target = "_blank";
        a.style.color = "#1e90ff";
        a.style.display = "block";
        a.style.marginTop = "3px";
        a.textContent = "🔗 " + link.title;
        linksDiv.appendChild(a);
      });
      detailsDiv.appendChild(linksDiv);
    }

    node.onclick = () => {
      childrenDiv.classList.toggle("visible");
      detailsDiv.style.display = detailsDiv.style.display==="none" ? "block" : "none";
    };

    if(val.children) childrenDiv.appendChild(buildTree(val.children));

    div.appendChild(node);
    div.appendChild(detailsDiv);
    div.appendChild(childrenDiv);
  }
  return div;
}
container.appendChild(buildTree(roadmap));

function setStatus(key,status,notes="") {
  nodeStatus[key] = { state: status, notes: notes || nodeStatus[key]?.notes || "" };
  if(status==="completed") nodeStatus[key].completedAt = new Date().toLocaleDateString();
  localStorage.setItem("nodeStatus",JSON.stringify(nodeStatus));

  const node = container.querySelector(`[data-key="${key}"]`);
  node.classList.remove("completed","learning");
  if(status==="completed") node.classList.add("completed");
  if(status==="learning") node.classList.add("learning");

  updateCompletionTracker();
  updateDonutChart();
}

// ====== Completion Tracker & Donut ======
function parseDays(timeStr) {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d+)/);
  return match ? parseInt(match[1],10) : 0;
}
function calculateTime(node,keyPrefix="") {
  let results=[];
  const nodeKey=keyPrefix||Object.keys(roadmap)[0];
  const statusObj=nodeStatus[nodeKey]||{state:"not-started"};
  const time=parseDays(node.time);
  results.push({ key: nodeKey, state: statusObj.state, days: time });
  if(node.children){
    for(const [childKey,childNode] of Object.entries(node.children)){
      results=results.concat(calculateTime(childNode,childKey));
    }
  }
  return results;
}

function updateCompletionTracker() {
  const pace=parseFloat(document.getElementById("pace-select").value)||1;
  const allTimes=calculateTime(roadmap["DevOps"]);
  const totalDays=allTimes.reduce((s,n)=>s+n.days,0);
  const completedDays=allTimes.filter(n=>n.state==="completed").reduce((s,n)=>s+n.days,0);
  const remainingDays=totalDays-completedDays;
  const today=new Date();
  const completionDate=new Date(today);
  completionDate.setDate(today.getDate()+Math.ceil(remainingDays*pace));
  const completionDateStr=completionDate.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
  document.getElementById("completion-tracker").textContent=
    `Estimated Completion: ${completionDateStr} (Remaining ${remainingDays} days)`;
}

let donutChart;
let showRemainingDays=false;
const centerTextPlugin = {
  id: 'centerText',
  afterDraw(chart) {
    const { ctx, chartArea: { width, height } } = chart;
    ctx.save();
    
    const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
    const completed = chart.data.datasets[0].data[0];
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Calculate font size dynamically based on donut size
    const fontSize = Math.min(width, height) / 4; 
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${percent}%`, width / 2, height / 2);
  }
};
function initDonutChart(){
  const ctx=document.getElementById('progress-donut').getContext('2d');
  donutChart=new Chart(ctx,{
    type:'doughnut',
    data:{labels:['Completed','Remaining'],
      datasets:[{data:[0,100],backgroundColor:['#4CAF50','#333'],borderWidth:0}]},
    options:{
      responsive:true,
      maintainAspectRatio:true,
      cutout:'70%',
      plugins:{ legend:{display:false}, tooltip:{enabled:true}},
      onClick(){
        showRemainingDays=!showRemainingDays;
        donutChart.update();
      }
    },
    plugins:[centerTextPlugin]
  });
}
function updateDonutChart(){
  const nodes=container.querySelectorAll(".node");
  const total=nodes.length;
  const completed=Object.values(nodeStatus).filter(s=>s.state==="completed").length;
  const remaining=total-completed;
  donutChart.data.datasets[0].data=[completed,remaining];
  donutChart.update();
}

document.getElementById("pdfBtn").addEventListener("click", async () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p','pt','a4');

  pdf.text("DevOps Roadmap Progress Report",20,20);
  pdf.text(document.getElementById("completion-tracker").textContent,20,40);

  let y=60;
  for(const key in nodeStatus){
    const st=nodeStatus[key];
    pdf.text(`${key}: ${st.state.toUpperCase()}${st.notes ? " | Notes: "+st.notes : ""}`,20,y);
    y+=20;
    if(y>750){pdf.addPage(); y=20;}
  }

  const canvas = await html2canvas(document.body,{backgroundColor:'#0d1117',scale:1});
  const imgData = canvas.toDataURL("image/png");
  pdf.addPage();
  pdf.addImage(imgData,'PNG',10,20,580,400);

  pdf.save("DevOps_Roadmap_Report.pdf");
});

// ====== BACKUP AND RESTORE ======
const backupBtn = document.getElementById("backupBtn");
const importBtn = document.getElementById("importBtn");
const importFile = document.getElementById("importFile");
const autoBackupToggle = document.getElementById("autoBackupToggle");

function downloadBackup() {
  const zip = new JSZip();
  zip.file("DevOps_Roadmap_Progress.json", JSON.stringify(nodeStatus, null, 2));
  zip.generateAsync({ type: "blob" }).then(content => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = `DevOps_Roadmap_Backup_${new Date().toISOString().slice(0,10)}.zip`;
    a.click();
  });
}

backupBtn.addEventListener("click", downloadBackup);

// Auto Backup
let autoBackupInterval;
autoBackupToggle.checked = localStorage.getItem("autoBackupEnabled") === "true";

autoBackupToggle.addEventListener("change", () => {
  localStorage.setItem("autoBackupEnabled", autoBackupToggle.checked);
  if (autoBackupToggle.checked) {
    startAutoBackup();
  } else {
    clearInterval(autoBackupInterval);
  }
});

function startAutoBackup() {
  clearInterval(autoBackupInterval);
  autoBackupInterval = setInterval(() => {
    if (autoBackupToggle.checked) downloadBackup();
  }, 5 * 60 * 1000); // Every 5 min
}

if (autoBackupToggle.checked) startAutoBackup();

// ===== Import Backup =====
importBtn.addEventListener("click", () => importFile.click());

importFile.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const zip = await JSZip.loadAsync(file);
    const jsonFile = zip.file("DevOps_Roadmap_Progress.json");
    if (!jsonFile) {
      alert("❌ Invalid backup file. JSON not found inside ZIP.");
      return;
    }

    const jsonContent = await jsonFile.async("string");
    const importedData = JSON.parse(jsonContent);

    for (const key in importedData) {
      if (!nodeStatus[key] || nodeStatus[key].state !== "completed") {
        nodeStatus[key] = importedData[key];
      }
    }

    localStorage.setItem("nodeStatus", JSON.stringify(nodeStatus));
    alert("✅ Backup imported successfully!");

    updateCompletionTracker();
    updateDonutChart();

    document.querySelectorAll(".node").forEach((node) => {
      const key = node.dataset.key;
      const status = nodeStatus[key]?.state || "not-started";
      node.classList.remove("completed", "learning");
      if (status === "completed") node.classList.add("completed");
      if (status === "learning") node.classList.add("learning");
    });

  } catch (err) {
    console.error("Error importing backup:", err);
    alert("❌ Failed to import backup.");
  }

  event.target.value = "";
});

// ===== INIT =====
initDonutChart();
updateDonutChart();
updateCompletionTracker();
document.getElementById("pace-select").addEventListener("change",updateCompletionTracker);

});
