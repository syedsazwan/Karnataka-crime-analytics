import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

/**
 * Derives a consistent category for a crime record
 */
export const getCrimeCategory = (crimeType = '') => {
  const typeUpper = String(crimeType).toUpperCase();
  if (['MURDER', 'HURT', 'ROBBERY', 'DACOITY', 'ASSAULT', 'KIDNAPPING'].some(k => typeUpper.includes(k))) return 'Violent Crime';
  if (['THEFT', 'BURGLARY', 'LARCENY', 'STOLEN', 'TRESPASS'].some(k => typeUpper.includes(k))) return 'Property Crime';
  if (['CYBER', 'DIGITAL', 'ONLINE', 'FRAUD', 'IT ACT', 'CHEATING'].some(k => typeUpper.includes(k))) return 'Cyber Crime';
  if (['WOMEN', 'MOLESTATION', 'POCSO', 'DOWRY', 'RAPE', 'CRUELTY'].some(k => typeUpper.includes(k))) return 'Crimes Against Women';
  if (['ACCIDENT', 'MOTOR', 'VEHICLE', 'TRAFFIC', 'RASH'].some(k => typeUpper.includes(k))) return 'Traffic / Vehicle';
  return 'Local / Special Acts';
};

/**
 * Formats a raw FIR record array into a 17-column record for official export
 */
export const formatRecordsForExport = (data) => {
  if (!data || !Array.isArray(data)) return [];

  return data.map((item, i) => {
    const firNum = item.FIR_Number || item.firNumber || `KSP/FIR/2026/${(i + 1).toString().padStart(5, '0')}`;
    const crimeId = item.Crime_ID || item.crimeId || `CR-${(1000 + i + 1)}`;
    const dist = item.District || item.district || 'Bengaluru City';
    const station = item.Police_Station || item.policeStation || 'Central PS';
    const crimeType = item.Crime_Type || item.crimeType || 'General IPC Offense';
    const category = item.Crime_Category || getCrimeCategory(crimeType);
    const ipcSections = item.IPC_Sections || item.ipcSections || 'IPC 1860 U/s: 379, 420';
    const date = item.Date || item.date || '2025-06-15 12:00:00';
    const status = item.Status || item.status || 'Investigating';
    const priority = item.Risk_Level || item.riskLevel || item.Priority || (status === 'Solved' ? 'Low' : 'Medium');
    const lat = item.Latitude || item.lat || 12.9716;
    const lng = item.Longitude || item.lng || 77.5946;
    const officer = item.Officer || item.officer || `Insp. ${['R. K. Patil', 'S. V. Sharma', 'M. N. Rao', 'K. H. Gowda'][i % 4]} (${station})`;

    const victim = item.Victim || item.victim || `Complainant #${firNum.split('/').pop()}`;
    const accused = item.Accused || item.accused || (status === 'Solved' ? `A1: Named Suspect #${i + 1}` : 'Under Investigation / Unknown');
    const resolution = item.Resolution || item.resolution || (
      status === 'Solved' ? 'Charge Sheet Filed (Sec 173 CrPC)' :
      status === 'Closed' ? 'Final Report Submitted' :
      status === 'Pending' ? 'Court Trial Pending' : 'Ongoing Investigation'
    );

    return {
      'FIR Number': firNum,
      'Crime ID': crimeId,
      'District': dist,
      'Police Station': station,
      'Crime Type': crimeType,
      'Category': category,
      'IPC Sections': ipcSections,
      'Date': date,
      'Victim Name': victim,
      'Accused Name': accused,
      'Officer': officer,
      'Status': status,
      'Priority': priority,
      'Latitude': lat,
      'Longitude': lng,
      'Resolution': resolution
    };
  });
};

/**
 * Export filtered data array to CSV file download
 */
export const exportToCSV = (data, filename = 'Karnataka_Police_Crime_Report.csv') => {
  if (!data || data.length === 0) return;

  const formatted = formatRecordsForExport(data);
  const csv = Papa.unparse(formatted);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export filtered data array to Excel (.xlsx) with freeze panes & auto column width
 */
export const exportToExcel = (data, filename = 'Karnataka_Police_Crime_Report.xlsx', sheetName = 'Filtered Crime Data') => {
  if (!data || data.length === 0) return;

  const formatted = formatRecordsForExport(data);
  const worksheet = XLSX.utils.json_to_sheet(formatted);

  // Set column widths for all 17 columns
  worksheet['!cols'] = [
    { wch: 24 }, // FIR Number
    { wch: 14 }, // Crime ID
    { wch: 18 }, // District
    { wch: 22 }, // Police Station
    { wch: 28 }, // Crime Type
    { wch: 20 }, // Category
    { wch: 26 }, // IPC Sections
    { wch: 20 }, // Date
    { wch: 24 }, // Victim Name
    { wch: 26 }, // Accused Name
    { wch: 26 }, // Officer
    { wch: 15 }, // Status
    { wch: 12 }, // Priority
    { wch: 12 }, // Latitude
    { wch: 12 }, // Longitude
    { wch: 32 }  // Resolution
  ];

  // Freeze top header row
  worksheet['!views'] = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
};

/**
 * 100% PROGRAMMATIC GOVERNMENT PDF GENERATOR (NO HTML2CANVAS SCREENSHOTS)
 */
export const exportToPDF = async (filename = 'Karnataka_Police_Crime_Report.pdf', meta = {}) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm

  const formattedRecords = formatRecordsForExport(meta.data || []);
  if (formattedRecords.length === 0) return;

  const stats = meta.stats || {
    total: formattedRecords.length,
    solved: formattedRecords.filter(r => r.Status === 'Solved' || r.Status === 'Closed').length,
    pending: formattedRecords.filter(r => r.Status === 'Pending' || r.Status === 'Investigating').length,
    critical: formattedRecords.filter(r => ['High', 'Critical'].includes(r.Priority)).length,
    district: meta.appliedDistrict || 'All 31 Districts',
    station: meta.appliedStation || 'All Stations',
    crimeType: meta.appliedType || 'All Crime Types',
    year: meta.appliedYear || 'All Years'
  };

  // Helper to draw standard header & footer decoration on every page
  const drawPageDecoration = (pageNum, totalPages) => {
    // Header Navy Bar
    doc.setFillColor(15, 23, 42); // #0F172A
    doc.rect(0, 0, pageWidth, 28, 'F');

    // Gold Accent Line
    doc.setFillColor(245, 158, 11);
    doc.rect(0, 27.2, pageWidth, 0.8, 'F');

    // Header Text
    doc.setTextColor(245, 158, 11);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('GOVERNMENT OF KARNATAKA • KA-AI CRIME PORTAL', 14, 10);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text((meta.title || 'OFFICIAL CRIME INTELLIGENCE REPORT').toUpperCase(), 14, 18);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    const now = new Date();
    doc.text(`Generated: ${now.toLocaleDateString()} ${now.toLocaleTimeString()} | Officer: ${meta.officer || 'Superintendent of Police, HQ'}`, 14, 24);

    // Footer
    const footerY = 286;
    doc.setDrawColor(51, 65, 85);
    doc.setLineWidth(0.3);
    doc.line(14, footerY - 4, pageWidth - 14, footerY - 4);

    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'bold');
    doc.text('GOVERNMENT OF KARNATAKA • KA-AI CRIME PORTAL • CONFIDENTIAL AUTO GENERATED REPORT', 14, footerY);

    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 32, footerY);
  };

  // ------------------------------------
  // CALCULATE TOTAL PAGES FOR PAGINATION
  // ------------------------------------
  const rowsPerPage = 28;
  const tablePages = Math.ceil(formattedRecords.length / rowsPerPage) || 1;
  const totalPages = 1 + tablePages; // Page 1 = Cover/Summary; Page 2..N = Data Table

  // ------------------------------------
  // PAGE 1: COVER, SCOPE & SUMMARY STATS
  // ------------------------------------
  drawPageDecoration(1, totalPages);

  let currentY = 34;

  // Filter Scope Box
  doc.setFillColor(30, 41, 59); // #1E293B
  doc.rect(14, currentY, pageWidth - 28, 24, 'F');
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.4);
  doc.rect(14, currentY, pageWidth - 28, 24, 'D');

  doc.setTextColor(59, 130, 246);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('APPLIED REPORT EXPORT FILTERS & SCOPE:', 18, currentY + 7);

  doc.setTextColor(226, 232, 240);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const filterSummaryText = meta.filtersText || 'District: All | Police Station: All | Crime Type: All | Category: All | Year: All | Status: All | Priority: All';
  doc.text(filterSummaryText, 18, currentY + 16, { maxWidth: pageWidth - 36 });

  // Summary Metrics Section
  currentY += 30;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('EXECUTIVE CRIME INTELLIGENCE SUMMARY', 14, currentY);

  currentY += 4;
  const kpiCards = [
    { title: 'TOTAL FIRS / CRIMES', val: stats.total.toLocaleString(), color: [59, 130, 246] },
    { title: 'SOLVED CASES', val: stats.solved.toLocaleString(), color: [16, 185, 129] },
    { title: 'PENDING / INVESTIGATION', val: stats.pending.toLocaleString(), color: [245, 158, 11] },
    { title: 'CRITICAL / HIGH RISK', val: stats.critical.toLocaleString(), color: [239, 68, 68] },
    { title: 'TARGET DISTRICT', val: String(stats.district).substring(0, 16), color: [139, 92, 246] },
    { title: 'TARGET YEAR', val: String(stats.year), color: [6, 182, 212] }
  ];

  const cardW = (pageWidth - 28 - 12) / 3;
  const cardH = 16;
  kpiCards.forEach((kpi, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const x = 14 + col * (cardW + 6);
    const y = currentY + row * (cardH + 4);

    doc.setFillColor(15, 23, 42);
    doc.rect(x, y, cardW, cardH, 'F');
    doc.setDrawColor(51, 65, 85);
    doc.rect(x, y, cardW, cardH, 'D');

    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'bold');
    doc.text(kpi.title, x + 4, y + 5);

    doc.setFontSize(10);
    doc.setTextColor(...kpi.color);
    doc.text(kpi.val, x + 4, y + 12);
  });

  currentY += 2 * (cardH + 4) + 10;

  // Programmatic Category Distribution Visual Graphics (Draw natively with jsPDF shapes)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('CRIME CATEGORY & RISK DISTRIBUTION (FILTERED DATASET)', 14, currentY);

  currentY += 6;

  // Compute category breakdown
  const catCounts = {};
  formattedRecords.forEach(r => {
    catCounts[r.Category] = (catCounts[r.Category] || 0) + 1;
  });
  const topCategories = Object.keys(catCounts)
    .map(k => ({ cat: k, count: catCounts[k] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const barMaxW = pageWidth - 28 - 60;
  topCategories.forEach((c, idx) => {
    const y = currentY + idx * 10;
    const pct = ((c.count / (stats.total || 1)) * 100).toFixed(1);
    const barW = Math.max(4, (c.count / (stats.total || 1)) * barMaxW);

    doc.setFontSize(8);
    doc.setTextColor(226, 232, 240);
    doc.setFont('helvetica', 'normal');
    doc.text(c.cat, 14, y + 5);

    // Track Bar Background
    doc.setFillColor(30, 41, 59);
    doc.rect(60, y + 1, barMaxW, 5, 'F');

    // Colored Fill Bar
    doc.setFillColor(59, 130, 246);
    doc.rect(60, y + 1, barW, 5, 'F');

    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`${c.count} (${pct}%)`, 60 + barMaxW + 4, y + 5);
  });

  currentY += topCategories.length * 10 + 12;

  // Programmatic Case Status Summary Graphic
  doc.setFillColor(30, 41, 59);
  doc.rect(14, currentY, pageWidth - 28, 20, 'F');
  doc.setFontSize(8.5);
  doc.setTextColor(245, 158, 11);
  doc.setFont('helvetica', 'bold');
  doc.text('CASE RESOLUTION STATUS BREAKDOWN:', 18, currentY + 6);

  const solvedPct = ((stats.solved / (stats.total || 1)) * 100).toFixed(1);
  const pendingPct = ((stats.pending / (stats.total || 1)) * 100).toFixed(1);

  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  doc.setFont('helvetica', 'normal');
  doc.text(`• Solved / Charge Sheeted: ${stats.solved} (${solvedPct}%)`, 18, currentY + 13);
  doc.text(`• Under Investigation / Pending: ${stats.pending} (${pendingPct}%)`, 105, currentY + 13);

  // ------------------------------------
  // PAGES 2..N: MULTI-PAGE FILTERED DATA TABLE
  // ------------------------------------
  const columns = [
    { header: 'FIR NUMBER', x: 14, w: 34 },
    { header: 'DISTRICT', x: 48, w: 24 },
    { header: 'POLICE STATION', x: 72, w: 28 },
    { header: 'CRIME TYPE', x: 100, w: 34 },
    { header: 'IPC SECTIONS', x: 134, w: 24 },
    { header: 'DATE', x: 158, w: 20 },
    { header: 'STATUS', x: 178, w: 18 }
  ];

  for (let pageIdx = 0; pageIdx < tablePages; pageIdx++) {
    doc.addPage();
    drawPageDecoration(pageIdx + 2, totalPages);

    let tableY = 34;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`FILTERED CRIME DOSSIER DATA TABLE (PAGE ${pageIdx + 1} OF ${tablePages})`, 14, tableY);

    tableY += 5;

    // Table Header Bar
    doc.setFillColor(30, 41, 59);
    doc.rect(14, tableY, pageWidth - 28, 7, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(245, 158, 11);
    columns.forEach(col => doc.text(col.header, col.x, tableY + 4.8));

    tableY += 7;
    const startRecordIdx = pageIdx * rowsPerPage;
    const pageRecords = formattedRecords.slice(startRecordIdx, startRecordIdx + rowsPerPage);

    pageRecords.forEach((row, i) => {
      const y = tableY + i * 7.5;

      // Alternate Row Shading
      if (i % 2 === 1) {
        doc.setFillColor(15, 23, 42);
        doc.rect(14, y - 5, pageWidth - 28, 7.5, 'F');
      }

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(226, 232, 240);

      const fir = String(row['FIR Number']).substring(0, 18);
      const dist = String(row['District']).substring(0, 13);
      const station = String(row['Police Station']).substring(0, 15);
      const type = String(row['Crime Type']).substring(0, 18);
      const ipc = String(row['IPC Sections']).substring(0, 14);
      const date = String(row['Date']).substring(0, 10);
      const status = String(row['Status']).substring(0, 11);

      doc.text(fir, columns[0].x, y);
      doc.text(dist, columns[1].x, y);
      doc.text(station, columns[2].x, y);
      doc.text(type, columns[3].x, y);
      doc.text(ipc, columns[4].x, y);
      doc.text(date, columns[5].x, y);

      // Status Color Coding
      if (status === 'Solved') doc.setTextColor(16, 185, 129);
      else if (status === 'Pending') doc.setTextColor(245, 158, 11);
      else doc.setTextColor(239, 68, 68);
      doc.text(status, columns[6].x, y);
    });
  }

  doc.save(filename);
};
