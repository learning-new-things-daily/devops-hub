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

  // Color palette for top-level topics
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

      // Determine color
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
  document.getElementById("pace-select").addEventListener("change",updateCompletionTracker);

});
