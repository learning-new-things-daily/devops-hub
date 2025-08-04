document.addEventListener("DOMContentLoaded", () => {

// ======== ROADMAP DATA =========
const roadmap = {
  "DevOps": {
    time: "0 days",
    children: {
      "Linux Basics": { 
        time: "5 days",
        links: [
          { title: "Linux Journey", url: "https://linuxjourney.com/" },
          { title: "The Linux Command Line", url: "https://linuxcommand.org/" }
        ]
      },
      "Git & Version Control": { 
        time: "4 days",
        links: [
          { title: "Pro Git Book", url: "https://git-scm.com/book/en/v2" },
          { title: "Git Branching Tutorial", url: "https://learngitbranching.js.org/" }
        ]
      },
      "CI/CD Pipelines": { 
        time: "7 days",
        links: [
          { title: "CI/CD Overview", url: "https://www.redhat.com/en/topics/devops/what-is-ci-cd" },
          { title: "GitHub Actions Docs", url: "https://docs.github.com/en/actions" }
        ]
      },
      "Docker & Containers": { 
        time: "7 days",
        links: [
          { title: "Docker Official Docs", url: "https://docs.docker.com/get-started/" },
          { title: "Play With Docker", url: "https://labs.play-with-docker.com/" }
        ]
      },
      "Kubernetes": { 
        time: "10 days",
        links: [
          { title: "Kubernetes Official Docs", url: "https://kubernetes.io/docs/home/" },
          { title: "Play With Kubernetes", url: "https://labs.play-with-k8s.com/" }
        ]
      },
      "Cloud Platforms (AWS/Azure/GCP)": { 
        time: "8 days",
        links: [
          { title: "AWS Training", url: "https://aws.amazon.com/training/" },
          { title: "Azure Fundamentals", url: "https://learn.microsoft.com/en-us/certifications/azure-fundamentals/" },
          { title: "Google Cloud Training", url: "https://cloud.google.com/training" }
        ]
      },
      "Monitoring & Logging": { 
        time: "5 days",
        links: [
          { title: "Prometheus Docs", url: "https://prometheus.io/docs/introduction/overview/" },
          { title: "Grafana Docs", url: "https://grafana.com/docs/" }
        ]
      },
      "IaC (Terraform/Ansible)": { 
        time: "6 days",
        links: [
          { title: "Terraform Basics", url: "https://developer.hashicorp.com/terraform/tutorials" },
          { title: "Ansible Docs", url: "https://docs.ansible.com/" }
        ]
      }
    }
  }
};

let nodeStatus = JSON.parse(localStorage.getItem("nodeStatus") || "{}");
const container = document.getElementById("mindmap-container");

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
  id:'centerText',
  afterDraw(chart){
    const {ctx, chartArea:{width,height}}=chart;
    ctx.save();
    const total=chart.data.datasets[0].data.reduce((a,b)=>a+b,0);
    const completed=chart.data.datasets[0].data[0];
    const percent=total>0?Math.round((completed/total)*100):0;
    const allTimes=calculateTime(roadmap["DevOps"]);
    const totalDays=allTimes.reduce((s,n)=>s+n.days,0);
    const completedDays=allTimes.filter(n=>n.state==="completed").reduce((s,n)=>s+n.days,0);
    const remainingDays=totalDays-completedDays;
    const text=showRemainingDays?`${remainingDays}d`:`${percent}%`;
    ctx.font='bold 14px Arial';
    ctx.fillStyle='#fff';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(text,width/2,height/2);
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

// ======== PDF EXPORT ========
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

// ======== EXPORT / IMPORT FEATURE ========
document.getElementById("exportBtn").addEventListener("click", () => {
  const dataStr = JSON.stringify(nodeStatus, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "DevOps_Roadmap_Progress.json";
  a.click();

  URL.revokeObjectURL(url);
});

document.getElementById("importBtn").addEventListener("click", () => {
  document.getElementById("importFile").click();
});

document.getElementById("importFile").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importedData = JSON.parse(e.target.result);

      nodeStatus = { ...nodeStatus, ...importedData };
      localStorage.setItem("nodeStatus", JSON.stringify(nodeStatus));

      alert("✅ Progress imported successfully! Page will refresh.");
      location.reload();
    } catch (err) {
      alert("❌ Invalid JSON file.");
    }
  };
  reader.readAsText(file);
});

initDonutChart();
updateDonutChart();
updateCompletionTracker();
document.getElementById("pace-select").addEventListener("change",updateCompletionTracker);

});

// ======== PWA Install Prompt ========
let deferredPrompt;
const installBanner = document.getElementById("install-banner");
const installBtn = document.getElementById("install-btn");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  if (/Mobi|Android/i.test(navigator.userAgent)) {
    const lastDismiss = localStorage.getItem("installDismissed");
    const now = Date.now();
    if (!lastDismiss || now - parseInt(lastDismiss) > 7 * 24 * 60 * 60 * 1000) {
      installBanner.style.display = "flex";
    }
  }
});

installBtn.addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`User response: ${outcome}`);

  installBanner.style.display = "none";
  if (outcome !== "accepted") {
    localStorage.setItem("installDismissed", Date.now().toString());
  }
  deferredPrompt = null;
});
