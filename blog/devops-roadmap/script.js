// script.js
document.addEventListener("DOMContentLoaded", async () => {
  // ======== LOAD ROADMAP DATA =========
  let roadmap = {};
  try {
    const res = await fetch("roadmap.json");
    roadmap = await res.json();
  } catch (err) {
    console.error("Failed to load roadmap.json:", err);
    alert("❌ Failed to load roadmap.json. Check file path!");
    return;
  }

  let nodeStatus = JSON.parse(localStorage.getItem("nodeStatus") || "{}");
  const container = document.getElementById("mindmap-container");

  // ======== GAMIFICATION STATE ========
  let userXP = parseInt(localStorage.getItem("userXP") || "0");
  let userLevel = parseInt(localStorage.getItem("userLevel") || "1");
  let badges = JSON.parse(localStorage.getItem("badges") || "[]");
  let streak = parseInt(localStorage.getItem("streak") || "0");
  let lastLogin = localStorage.getItem("lastLogin") || "";

  // ======== DAILY STREAK LOGIC ========
  const today = new Date().toLocaleDateString();
  if (lastLogin !== today) {
    const yesterday = new Date();
    yesterday.setDate(new Date().getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString();
    if (lastLogin === yesterdayStr) {
      streak += 1; // continue streak
    } else {
      streak = 1; // reset streak
    }
    lastLogin = today;
    localStorage.setItem("streak", streak);
    localStorage.setItem("lastLogin", today);
  }

  // ======== CREATE XP BAR ========
  const xpBar = document.createElement("div");
  xpBar.id = "xp-bar";
  xpBar.style.margin = "15px 0";
  xpBar.style.padding = "10px";
  xpBar.style.background = "#222";
  xpBar.style.border = "1px solid #555";
  xpBar.style.borderRadius = "6px";
  xpBar.style.color = "#fff";
  xpBar.style.fontSize = "14px";
  document.body.insertBefore(xpBar, container);

  function updateXPBar() {
    const nextLevelXP = userLevel * 100;
    const progress = Math.min(100, (userXP / nextLevelXP) * 100);

    const badgeIcons = badges.map(b => {
      if (b === "Bronze") return "🥉";
      if (b === "Silver") return "🥈";
      if (b === "Gold") return "🥇";
      return "🏅";
    }).join(" ");

    xpBar.innerHTML = `
      <div>⭐ Level ${userLevel} | XP: ${userXP}/${nextLevelXP}</div>
      <div style="background:#444;width:100%;height:10px;border-radius:5px;margin-top:5px;">
        <div style="width:${progress}%;height:10px;border-radius:5px;background:#4CAF50;"></div>
      </div>
      <div style="margin-top:5px;">🏅 Badges: ${badgeIcons || "None yet"}</div>
      <div style="margin-top:5px;">🔥 Streak: ${streak} day${streak>1?'s':''}</div>
    `;
  }

  function fireConfetti() {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
  }

  function gainXP(amount) {
    userXP += amount;
    const newLevel = Math.floor(userXP / 100) + 1;
    if (newLevel > userLevel) {
      userLevel = newLevel;
      alert(`🎉 Level Up! You are now Level ${userLevel}!`);
      fireConfetti();
    }
    localStorage.setItem("userXP", userXP);
    localStorage.setItem("userLevel", userLevel);
    updateXPBar();
  }

  function checkBadges() {
    const completedCount = Object.values(nodeStatus).filter(s => s.state === "completed").length;
    let earned = [];
    if (completedCount >= 5 && !badges.includes("Bronze")) earned.push("Bronze");
    if (completedCount >= 15 && !badges.includes("Silver")) earned.push("Silver");
    if (completedCount >= 30 && !badges.includes("Gold")) earned.push("Gold");

    if (earned.length > 0) {
      badges = [...badges, ...earned];
      localStorage.setItem("badges", JSON.stringify(badges));
      alert(`🏅 New Badge(s) Earned: ${earned.join(", ")}`);
      fireConfetti();
    }
    updateXPBar();
  }

  // ======== NODE TREE COLORS ========
  const nodeColors = [
    "#1abc9c", "#3498db", "#9b59b6",
    "#e67e22", "#e74c3c", "#f1c40f",
    "#2ecc71", "#ff69b4"
  ];
  let colorIndex = 0;

  // ======== BUILD TREE ========
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

          const days = parseDays(val.time);
          if (!nodeStatus[key]?.xpGranted) {
            gainXP(days * 10);
            nodeStatus[key].xpGranted = true;
            localStorage.setItem("nodeStatus", JSON.stringify(nodeStatus));
          }
          checkBadges();
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

      if(val.children) childrenDiv.appendChild(buildTree(val.children, nodeColor));

      div.appendChild(node);
      div.appendChild(detailsDiv);
      div.appendChild(childrenDiv);
    }
    return div;
  }
  container.appendChild(buildTree(roadmap));

  // ======== STATUS MANAGEMENT ========
  function setStatus(key,status,notes="") {
    nodeStatus[key] = { 
      ...nodeStatus[key],
      state: status, 
      notes: notes || nodeStatus[key]?.notes || "" 
    };
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

  // ======== DONUT CHART ========
  let donutChart;
  const centerTextPlugin = {
    id: 'centerText',
    afterDraw(chart) {
      const { ctx, chartArea: { width, height } } = chart;
      ctx.save();
      const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
      const completed = chart.data.datasets[0].data[0];
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      const fontSize = Math.min(width, height) / 3;
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
        plugins:{ legend:{display:false}, tooltip:{enabled:true}}
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

  // ======== INIT ========
  initDonutChart();
  updateDonutChart();
  updateCompletionTracker();
  updateXPBar();
  checkBadges();
  document.getElementById("pace-select").addEventListener("change",updateCompletionTracker);

  // ========= BUTTONS: PDF / BACKUP / IMPORT =========
  const pdfBtn = document.getElementById("pdfBtn");
  const backupBtn = document.getElementById("backupBtn");
  const autoBackupToggle = document.getElementById("autoBackupToggle");
  const importBtn = document.getElementById("importBtn");
  const importFile = document.getElementById("importFile");

  // PDF Export
  pdfBtn.addEventListener("click", async () => {
    const { jsPDF } = window.jspdf;
    const controls = document.getElementById("controls");
    controls.style.display = "none";
    window.scrollTo(0, 0);

    await html2canvas(document.body, { backgroundColor: "#0d1117" })
      .then(canvas => {
        const pdf = new jsPDF("p", "mm", "a4");
        const imgData = canvas.toDataURL("image/png");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
        pdf.addImage(imgData, "PNG", 0, 0, canvas.width * ratio, canvas.height * ratio);
        pdf.save("DevOps_Roadmap_Progress.pdf");
      })
      .finally(() => controls.style.display = "flex");
  });

  // Backup to ZIP
  backupBtn.addEventListener("click", async () => {
    const zip = new JSZip();
    const backupData = {
      nodeStatus: localStorage.getItem("nodeStatus") || "{}",
      userXP: localStorage.getItem("userXP") || "0",
      userLevel: localStorage.getItem("userLevel") || "1",
      badges: localStorage.getItem("badges") || "[]",
      streak: localStorage.getItem("streak") || "0",
      lastLogin: localStorage.getItem("lastLogin") || ""
    };
    zip.file("backup.json", JSON.stringify(backupData, null, 2));
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `DevOps_Roadmap_Backup_${new Date().toISOString().split("T")[0]}.zip`;
    a.click();
    URL.revokeObjectURL(url);
    fireConfetti();
  });

  // Auto Backup
  let autoBackupInterval = null;
  let checkpointTimerInterval = null;
  const checkpointTimer = document.getElementById("checkpoint-timer");

  autoBackupToggle.addEventListener("change", () => {
    if (autoBackupToggle.checked) {
      let secondsLeft = 60;
      checkpointTimer.textContent = `Next checkpoint in ${secondsLeft}s`;

      checkpointTimerInterval = setInterval(() => {
        secondsLeft--;
        checkpointTimer.textContent = `Next checkpoint in ${secondsLeft}s`;
        if (secondsLeft <= 0) secondsLeft = 60;
      }, 1000);

      alert(
        "Checkpoint Save Enabled!\n\n" +
        "Your progress will be automatically saved as a checkpoint every minute in your browser's local storage.\n" +
        "This does NOT create a downloadable backup file, but lets you restore your progress if you close or refresh the page.\n\n" +
        "Tip: For full safety, use the Download Backup button before major resets!"
      );
      autoBackupInterval = setInterval(() => {
        const checkpointData = {
          nodeStatus: localStorage.getItem("nodeStatus") || "{}",
          userXP: localStorage.getItem("userXP") || "0",
          userLevel: localStorage.getItem("userLevel") || "1",
          badges: localStorage.getItem("badges") || "[]",
          streak: localStorage.getItem("streak") || "0",
          lastLogin: localStorage.getItem("lastLogin") || ""
        };
        localStorage.setItem("checkpointSave", JSON.stringify(checkpointData));
        console.log("Checkpoint saved to localStorage as 'checkpointSave'");
        secondsLeft = 60; // reset timer after backup
      }, 60000); // every 1 minute
    } else {
      clearInterval(autoBackupInterval);
      clearInterval(checkpointTimerInterval);
      checkpointTimer.textContent = "";
      alert("Checkpoint Save Disabled.\n\nYour progress will no longer be auto-saved as checkpoints.");
    }
  });

  // Import Backup
  document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });

  document.getElementById('importFile').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const zip = new JSZip();
    try {
      const content = await zip.loadAsync(file);
      // Assume backup.json is inside the zip
      const backupData = await content.file('backup.json').async('string');
      const parsedData = JSON.parse(backupData);

      // Update your app state here, e.g.:
      // updateProgress(parsedData.progress);
      // updateMindmap(parsedData.mindmap);

      // Re-render UI components
      renderProgress();
      renderMindmap();

      alert('Backup imported successfully!');
    } catch (err) {
      alert('Failed to import backup: ' + err.message);
    }
  });

  importFile.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const zip = new JSZip();
    const data = await zip.loadAsync(file);
    const backupFile = data.file("backup.json");
    if (!backupFile) {
      alert("❌ Invalid backup file");
      return;
    }

    const jsonText = await backupFile.async("text");
    const backup = JSON.parse(jsonText);

    // Restore
    for (const key in backup) {
      localStorage.setItem(key, backup[key]);
    }

    alert("✅ Backup imported! Reloading...");
    fireConfetti();
    location.reload();
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    alert('Warning: Resetting will erase ALL your progress. Please take a backup before proceeding!');
    if (confirm('Have you downloaded a backup? Click OK to continue, Cancel to abort.')) {
      const confirmation = prompt('Type "RESET MY PROGRESS" to confirm:');
      if (confirmation === 'RESET MY PROGRESS') {
        // Clear relevant localStorage keys
        localStorage.removeItem("nodeStatus");
        localStorage.removeItem("userXP");
        localStorage.removeItem("userLevel");
        localStorage.removeItem("badges");
        localStorage.removeItem("streak");
        localStorage.removeItem("lastLogin");

        // Reset in-memory variables if needed
        nodeStatus = {};
        userXP = 0;
        userLevel = 1;
        badges = [];
        streak = 0;
        lastLogin = "";

        // Re-render UI components
        updateXPBar();
        checkBadges();
        updateCompletionTracker();
        updateDonutChart();

        // Optionally reload the page for a clean state
        alert('All progress has been reset.');
        location.reload();
      } else {
        alert('Reset cancelled. Confirmation phrase not matched.');
      }
    }
  });
});
