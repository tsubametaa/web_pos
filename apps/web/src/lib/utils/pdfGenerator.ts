import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from './currency';
import { formatDate } from './date';
import type { UITransaction } from '../../types';

interface GeneratePDFOptions {
  transactions: UITransaction[];
  brandName?: string;
  brandLogo?: string;
  brandAddress?: string;
  brandPhone?: string;
  userRole?: string;
  printedBy?: string;
}

function loadImageDataUrl(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 200;
        canvas.height = img.naturalHeight || img.height || 200;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          resolve(dataUrl);
        } else {
          resolve(null);
        }
      } catch (err) {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export async function generateSalesPDF({
  transactions = [],
  brandName = 'Brand Utama',
  brandLogo = '',
  brandAddress = '',
  brandPhone = '',
  userRole = 'admin',
  printedBy = 'Staff Kasir'
}: GeneratePDFOptions) {
  const isSuperAdmin = userRole === 'super_admin';
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const printDate = new Date().toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  // Filter completed transactions
  const completedTx = transactions.filter((t) => t.status === 'completed');
  const totalRevenue = completedTx.reduce((acc, t) => acc + t.totalAmount, 0);
  const totalProfit = completedTx.reduce((acc, t) => acc + (t.profit || 0), 0);

  // Header Banner
  doc.setFillColor(4, 120, 87); // Emerald 700
  doc.rect(0, 0, 210, 16, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN REKAPITULASI PENJUALAN', 14, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`TGL CETAK: ${printDate}`, 196, 11, { align: 'right' });

  // Store Brand Info & Logo Setup
  let currentY = 23;
  let textStartX = 14;

  let logoDataUrl = null;
  if (brandLogo) {
    logoDataUrl = await loadImageDataUrl(brandLogo);
  }

  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', 14, currentY, 15, 15);
      textStartX = 33;
    } catch (e) {
      console.warn('Failed to render logo image on PDF:', e);
      logoDataUrl = null;
    }
  }

  if (!logoDataUrl) {
    // Elegant Emerald Brand Logo Badge
    doc.setFillColor(4, 120, 87);
    doc.roundedRect(14, currentY, 15, 15, 3.5, 3.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const initial = brandName.trim().charAt(0).toUpperCase() || 'B';
    doc.text(initial, 21.5, currentY + 10, { align: 'center' });
    textStartX = 33;
  }

  // Store Brand Info Text Next to Logo
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(brandName.toUpperCase(), textStartX, currentY + 7);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  currentY += 20;
  if (brandAddress) {
    doc.text(brandAddress, 14, currentY);
    currentY += 4;
  }
  if (brandPhone) {
    doc.text(`Telp/WA: ${brandPhone}`, 14, currentY);
    currentY += 4;
  }
  doc.text(`Dicetak Oleh: ${printedBy}`, 14, currentY);
  currentY += 6;

  // Table Columns Setup
  const tableHeaders = isSuperAdmin
    ? [['Kode Transaksi', 'Waktu & Tanggal', 'Metode', 'Total Belanja', 'Profit', 'Status']]
    : [['Kode Transaksi', 'Waktu & Tanggal', 'Metode', 'Total Belanja', 'Status']];

  const tableBody = transactions.map((t) => {
    const row = [
      t.id,
      formatDate(t.createdAt),
      (t.paymentMethod || 'CASH').toUpperCase(),
      formatCurrency(t.totalAmount),
    ];

    if (isSuperAdmin) {
      row.push(formatCurrency(t.profit || 0));
    }

    row.push(t.status === 'completed' ? 'Selesai' : 'Batal');
    return row;
  });

  // Table Footer Row
  const footerRow = isSuperAdmin
    ? [
        { content: `TOTAL PENJUALAN (${completedTx.length} NOTA):`, colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } },
        { content: formatCurrency(totalRevenue), styles: { fontStyle: 'bold', textColor: [4, 120, 87] } },
        { content: formatCurrency(totalProfit), styles: { fontStyle: 'bold' } },
        { content: '' }
      ]
    : [
        { content: `TOTAL PENJUALAN (${completedTx.length} NOTA):`, colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } },
        { content: formatCurrency(totalRevenue), styles: { fontStyle: 'bold', textColor: [4, 120, 87] } },
        { content: '' }
      ];

  // Render Table with autoTable
  autoTable(doc, {
    startY: currentY,
    head: tableHeaders,
    body: tableBody,
    foot: [footerRow as any],
    theme: 'grid',
    headStyles: {
      fillColor: [4, 120, 87],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: 3
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
      cellPadding: 2.5
    },
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: isSuperAdmin
      ? {
          0: { fontStyle: 'bold', cellWidth: 45 },
          1: { cellWidth: 45 },
          2: { halign: 'center', cellWidth: 25 },
          3: { halign: 'right', fontStyle: 'bold', cellWidth: 30 },
          4: { halign: 'right', fontStyle: 'bold', cellWidth: 25 },
          5: { halign: 'center', cellWidth: 18 }
        }
      : {
          0: { fontStyle: 'bold', cellWidth: 50 },
          1: { cellWidth: 50 },
          2: { halign: 'center', cellWidth: 30 },
          3: { halign: 'right', fontStyle: 'bold', cellWidth: 35 },
          4: { halign: 'center', cellWidth: 20 }
        },
    margin: { left: 14, right: 14 }
  });

  // Direct File Download as real .pdf
  const cleanBrand = brandName.replace(/[^a-zA-Z0-9]/g, '_');
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `Rekap_Penjualan_${cleanBrand}_${dateStr}.pdf`;

  doc.save(fileName);
}
