// charts.js
let donutChart;

export function initDonutChart() {
  const ctx=document.getElementById('progress-donut').getContext('2d');
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
  donutChart=new Chart(ctx,{
    type:'doughnut',
    data:{labels:['Completed','Remaining'],
      datasets:[{data:[0,100],backgroundColor:['#4CAF50','#333'],borderWidth:0}]},
    options:{
      responsive:true,
      maintainAspectRatio:true,
      cutout:'70%',
      animation:{ animateRotate:true, animateScale:true },
      plugins:{ legend:{display:false}, tooltip:{enabled:true}}
    },
    plugins:[centerTextPlugin]
  });
}

export function updateDonutChart(nodeStatus) {
  const nodes=document.querySelectorAll(".node");
  const total=nodes.length;
  const completed=Object.values(nodeStatus).filter(s=>s.state==="completed").length;
  const remaining=total-completed;
  donutChart.data.datasets[0].data=[completed,remaining];
  donutChart.update();
}
