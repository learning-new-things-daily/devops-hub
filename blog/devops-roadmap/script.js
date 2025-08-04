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

  // Only show on mobile
  if (/Mobi|Android/i.test(navigator.userAgent)) {
    // Check if dismissed before
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

// ======== GOOGLE DRIVE SYNC ========

// Replace with your Google API credentials
const CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";
const API_KEY = "YOUR_GOOGLE_API_KEY";
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/drive.appdata";

const syncBtn = document.getElementById("syncBtn");
let isSignedIn = false;
let syncFileId = null;

// Load gapi on window load
window.addEventListener("load", () => {
  gapi.load("client:auth2", initClient);
});

function initClient() {
  gapi.client
    .init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES,
    })
    .then(() => {
      // Listen for sign-in state
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    });
}

function updateSigninStatus(signedIn) {
  isSignedIn = signedIn;
  if (signedIn) {
    syncBtn.textContent = "☁️ Sync Now";
    findOrCreateFile();
  } else {
    syncBtn.textContent = "☁️ Sign in & Sync";
  }
}

syncBtn.addEventListener("click", () => {
  if (!isSignedIn) {
    gapi.auth2.getAuthInstance().signIn();
  } else {
    uploadProgress();
  }
});

// ---- Google Drive Helpers ----
function findOrCreateFile() {
  gapi.client.drive.files.list({
    spaces: 'appDataFolder',
    fields: 'files(id, name)',
    q: "name='devops_roadmap_progress.json'",
  }).then(response => {
    const files = response.result.files;
    if (files && files.length > 0) {
      syncFileId = files[0].id;
      console.log("Found existing sync file:", syncFileId);
      downloadProgress();
    } else {
      createSyncFile();
    }
  });
}

function createSyncFile() {
  const fileMetadata = {
    name: 'devops_roadmap_progress.json',
    parents: ['appDataFolder']
  };
  const fileContent = JSON.stringify(nodeStatus, null, 2);
  const file = new Blob([fileContent], { type: 'application/json' });
  const metadata = new FormData();
  metadata.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
  metadata.append('file', file);

  fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: new Headers({ 'Authorization': 'Bearer ' + gapi.auth.getToken().access_token }),
    body: metadata
  }).then(r => r.json()).then(file => {
    syncFileId = file.id;
    console.log('Created new sync file:', file);
  });
}

function uploadProgress() {
  if (!syncFileId) return createSyncFile();
  
  const fileContent = JSON.stringify(nodeStatus, null, 2);
  fetch(`https://www.googleapis.com/upload/drive/v3/files/${syncFileId}?uploadType=media`, {
    method: 'PATCH',
    headers: {
      'Authorization': 'Bearer ' + gapi.auth.getToken().access_token,
      'Content-Type': 'application/json'
    },
    body: fileContent
  }).then(r => r.json()).then(resp => {
    console.log("Progress synced to Drive:", resp);
  });
}

function downloadProgress() {
  if (!syncFileId) return;
  gapi.client.drive.files.get({
    fileId: syncFileId,
    alt: 'media'
  }).then(response => {
    const driveData = response.body ? JSON.parse(response.body) : {};
    console.log("Downloaded progress from Drive:", driveData);

    // Merge local and remote progress
    nodeStatus = { ...driveData, ...nodeStatus };
    localStorage.setItem("nodeStatus", JSON.stringify(nodeStatus));
    
    updateCompletionTracker();
    updateDonutChart();
  });
}
