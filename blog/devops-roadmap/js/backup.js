// backup.js
import JSZip from "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
import { jsPDF } from "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
import html2canvas from "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";

export function initBackupControls(state) {
  const pdfBtn = document.getElementById("pdfBtn");
  const backupBtn = document.getElementById("backupBtn");
  const importBtn = document.getElementById("importBtn");
  const importFile = document.getElementById("importFile");
  const autoBackupToggle = document.getElementById("autoBackupToggle");

  // ---- PDF Export ----
  pdfBtn.addEventListener("click", async () => {
    const mindmap = document.getElementById("mindmap-container");
    const canvas = await html2canvas(mindmap, { backgroundColor: "#0d1117" });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const ratio = pageWidth / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, canvas.height * ratio);
    pdf.save("DevOps_Roadmap_Progress.pdf");
  });

  // ---- Manual Backup ----
  backupBtn.addEventListener("click", () => downloadBackup());

  // ---- Import Backup ----
  importBtn.addEventListener("click", () => importFile.click());
  importFile.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const zip = await JSZip.loadAsync(file);
    for (const [key, value] of Object.entries(zip.files)) {
      const content = await value.async("string");
      localStorage.setItem(key.replace(".json", ""), content);
    }
    alert("✅ Backup Imported! Refresh to apply changes.");
  });

  // ---- Auto Backup Every 1 Hour ----
  autoBackupToggle.addEventListener("change", () => {
    if (autoBackupToggle.checked) {
      state.autoBackupInterval = setInterval(downloadBackup, 3600000);
    } else {
      clearInterval(state.autoBackupInterval);
    }
  });
}

export function downloadBackup() {
  const zip = new JSZip();
  // Backup all localStorage data
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    zip.file(key + ".json", value);
  }
  zip.generateAsync({ type: "blob" }).then((blob) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `DevOps_Roadmap_Backup_${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(a.href);
  });
}
